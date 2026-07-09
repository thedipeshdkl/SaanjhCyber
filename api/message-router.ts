import { z } from "zod";
import { createRouter, authedQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages, reports, users } from "@db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const messageRouter = createRouter({
  // User sends message about their report to admins
  send: authedQuery
    .input(z.object({
      reportId: z.number(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Verify report exists and user owns it (or is admin/moderator)
      const [report] = await db.select().from(reports).where(eq(reports.id, input.reportId));
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });

      const isOwner = report.reporterId === ctx.user.id;
      const isStaff = ["admin", "superadmin", "moderator"].includes(ctx.user.role);
      if (!isOwner && !isStaff) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only message about your own reports" });
      }

      await db.insert(messages).values({
        reportId: input.reportId,
        senderId: ctx.user.id,
        content: input.content,
        isFromAdmin: isStaff,
      });

      return { success: true };
    }),

  // Get messages for a specific report
  getByReport: authedQuery
    .input(z.object({ reportId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      // Verify access
      const [report] = await db.select().from(reports).where(eq(reports.id, input.reportId));
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });

      const isOwner = report.reporterId === ctx.user.id;
      const isStaff = ["admin", "superadmin", "moderator"].includes(ctx.user.role);
      if (!isOwner && !isStaff) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No access to these messages" });
      }

      const items = await db.select({
        id: messages.id,
        content: messages.content,
        isFromAdmin: messages.isFromAdmin,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderRole: users.role,
      })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.reportId, input.reportId))
        .orderBy(messages.createdAt);

      // Mark messages as read for the current user
      if (isOwner) {
        await db.update(messages)
          .set({ isRead: true })
          .where(and(eq(messages.reportId, input.reportId), eq(messages.isFromAdmin, true)));
      } else if (isStaff) {
        await db.update(messages)
          .set({ isRead: true })
          .where(and(eq(messages.reportId, input.reportId), eq(messages.isFromAdmin, false)));
      }

      return items;
    }),

  // Get all conversations for admin/moderator (grouped by report)
  listConversations: moderatorQuery
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();

      // Get reports that have messages, with unread count
      const conversations = await db.select({
        reportId: messages.reportId,
        caseNumber: reports.caseNumber,
        reportTitle: reports.title,
        lastMessage: sql<string>`(SELECT content FROM messages m2 WHERE m2.reportId = messages.reportId ORDER BY m2.createdAt DESC LIMIT 1)`,
        lastMessageAt: sql<string>`MAX(messages.createdAt)`,
        totalMessages: sql<number>`COUNT(*)`,
        unreadCount: sql<number>`SUM(CASE WHEN messages.isFromAdmin = false AND messages.isRead = false THEN 1 ELSE 0 END)`,
      })
        .from(messages)
        .leftJoin(reports, eq(messages.reportId, reports.id))
        .groupBy(messages.reportId, reports.caseNumber, reports.title)
        .orderBy(desc(sql`MAX(messages.createdAt)`))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));

      return conversations;
    }),

  // Get unread count for current user
  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const isStaff = ["admin", "superadmin", "moderator"].includes(ctx.user.role);

    if (isStaff) {
      // Staff sees unread messages from users
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(eq(messages.isFromAdmin, false), eq(messages.isRead, false)));
      return result?.count || 0;
    } else {
      // Users see unread messages from admins on their reports
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .leftJoin(reports, eq(messages.reportId, reports.id))
        .where(and(
          eq(messages.isFromAdmin, true),
          eq(messages.isRead, false),
          eq(reports.reporterId, ctx.user.id)
        ));
      return result?.count || 0;
    }
  }),

  // Get user's conversations (their reports that have messages)
  myConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const conversations = await db.select({
      reportId: messages.reportId,
      caseNumber: reports.caseNumber,
      reportTitle: reports.title,
      lastMessage: sql<string>`(SELECT content FROM messages m2 WHERE m2.reportId = messages.reportId ORDER BY m2.createdAt DESC LIMIT 1)`,
      lastMessageAt: sql<string>`MAX(messages.createdAt)`,
      totalMessages: sql<number>`COUNT(*)`,
      unreadCount: sql<number>`SUM(CASE WHEN messages.isFromAdmin = true AND messages.isRead = false THEN 1 ELSE 0 END)`,
    })
      .from(messages)
      .leftJoin(reports, eq(messages.reportId, reports.id))
      .where(eq(reports.reporterId, ctx.user.id))
      .groupBy(messages.reportId, reports.caseNumber, reports.title)
      .orderBy(desc(sql`MAX(messages.createdAt)`));

    return conversations;
  }),
});

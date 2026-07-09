import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: authedQuery
    .input(z.object({
      isRead: z.boolean().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(notifications.userId, ctx.user.id)];
      if (input?.isRead !== undefined) {
        conditions.push(eq(notifications.isRead, input.isRead));
      }
      const items = await db.select().from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));
      return items;
    }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.id, input.id),
          eq(notifications.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  markAllRead: authedQuery
    .mutation(async ({ ctx }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, ctx.user.id));
      return { success: true };
    }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));
    return result.length;
  }),
});

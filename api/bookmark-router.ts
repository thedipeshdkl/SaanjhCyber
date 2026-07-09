import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookmarks, reports } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const bookmarkRouter = createRouter({
  create: authedQuery
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [bookmark] = await db.insert(bookmarks).values({
        userId: ctx.user.id,
        reportId: input.reportId,
      });
      return { id: Number(bookmark.insertId) };
    }),

  delete: authedQuery
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(bookmarks)
        .where(and(
          eq(bookmarks.reportId, input.reportId),
          eq(bookmarks.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userBookmarks = await db.select().from(bookmarks)
      .where(eq(bookmarks.userId, ctx.user.id))
      .orderBy(desc(bookmarks.createdAt));
    
    const reportIds = userBookmarks.map(b => b.reportId);
    const reportList = reportIds.length > 0
      ? await db.select().from(reports).where(eq(reports.id, reportIds[0]))
      : [];
    
    return userBookmarks.map(b => ({
      ...b,
      report: reportList.find(r => r.id === b.reportId),
    }));
  }),
});

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { watchedEntities, entities, notifications } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const watchlistRouter = createRouter({
  // Toggle watch on an entity
  toggle: authedQuery
    .input(z.object({ entityId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [existing] = await db.select().from(watchedEntities)
        .where(and(
          eq(watchedEntities.userId, ctx.user.id),
          eq(watchedEntities.entityId, input.entityId)
        ));

      if (existing) {
        await db.delete(watchedEntities).where(eq(watchedEntities.id, existing.id));
        return { watched: false };
      } else {
        await db.insert(watchedEntities).values({
          userId: ctx.user.id,
          entityId: input.entityId,
        });
        return { watched: true };
      }
    }),

  // Check if user is watching an entity
  isWatching: authedQuery
    .input(z.object({ entityId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const [existing] = await db.select().from(watchedEntities)
        .where(and(
          eq(watchedEntities.userId, ctx.user.id),
          eq(watchedEntities.entityId, input.entityId)
        ));
      return !!existing;
    }),

  // Get user's watchlist with entity details
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db.select({
      id: watchedEntities.id,
      entityId: watchedEntities.entityId,
      createdAt: watchedEntities.createdAt,
      value: entities.value,
      type: entities.type,
      riskLevel: entities.riskLevel,
      reportCount: entities.reportCount,
      verificationStatus: entities.verificationStatus,
      lastReportedAt: entities.lastReportedAt,
    })
      .from(watchedEntities)
      .leftJoin(entities, eq(watchedEntities.entityId, entities.id))
      .where(eq(watchedEntities.userId, ctx.user.id))
      .orderBy(desc(watchedEntities.createdAt));

    return items;
  }),

  // Remove from watchlist
  remove: authedQuery
    .input(z.object({ entityId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(watchedEntities).where(and(
        eq(watchedEntities.userId, ctx.user.id),
        eq(watchedEntities.entityId, input.entityId)
      ));
      return { success: true };
    }),
});

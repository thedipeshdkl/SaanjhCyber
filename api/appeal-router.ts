import { z } from "zod";
import { createRouter, authedQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { appeals } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const appealRouter = createRouter({
  create: authedQuery
    .input(z.object({
      reportId: z.number(),
      entityId: z.number().optional(),
      reason: z.string().min(10),
      evidence: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [appeal] = await db.insert(appeals).values({
        reportId: input.reportId,
        entityId: input.entityId,
        appellantId: ctx.user.id,
        reason: input.reason,
        evidence: input.evidence,
      });
      return { id: Number(appeal.insertId) };
    }),

  list: moderatorQuery
    .input(z.object({
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(appeals.status, input.status as any));
      }
      const where = conditions.length > 0 ? conditions[0] : undefined;
      return db.select().from(appeals)
        .where(where)
        .orderBy(desc(appeals.createdAt));
    }),

  review: moderatorQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(appeals).set({
        status: input.status as any,
        reviewedBy: ctx.user.id,
        reviewNotes: input.notes,
        resolvedAt: new Date(),
      }).where(eq(appeals.id, input.id));
      return { success: true };
    }),
});

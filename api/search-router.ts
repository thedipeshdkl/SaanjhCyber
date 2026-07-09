import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { entities, reports } from "@db/schema";
import { savedSearches } from "@db/schema";
import { desc, and, sql, like, or, eq } from "drizzle-orm";

export const searchRouter = createRouter({
  query: publicQuery
    .input(z.object({
      q: z.string(),
      type: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [like(entities.value, `%${input.q}%`)];
      if (input.type) {
        conditions.push(sql`type = ${input.type}`);
      }
      
      const items = await db.select().from(entities)
        .where(and(...conditions))
        .orderBy(desc(entities.reportCount))
        .limit(input.limit)
        .offset((input.page - 1) * input.limit);
      
      const reportResults = await db.select().from(reports)
        .where(and(
          eq(reports.privacyLevel, "public"),
          or(
            like(reports.title, `%${input.q}%`),
            like(reports.description, `%${input.q}%`),
            like(reports.caseNumber, `%${input.q}%`)
          )
        ))
        .limit(10);
      
      return { entities: items, reports: reportResults };
    }),

  save: authedQuery
    .input(z.object({
      query: z.string(),
      filters: z.any().optional(),
      resultCount: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [saved] = await db.insert(savedSearches).values({
        userId: ctx.user.id,
        query: input.query,
        filters: input.filters,
        resultCount: input.resultCount,
      });
      return { id: Number(saved.insertId) };
    }),

  listSaved: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(savedSearches)
      .where(sql`userId = ${ctx.user.id}`)
      .orderBy(desc(savedSearches.createdAt));
  }),
});

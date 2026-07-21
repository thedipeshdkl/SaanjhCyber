import { z } from "zod";
import { createRouter, publicQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { articles } from "@db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export const articleRouter = createRouter({
  list: publicQuery
    .input(z.object({
      category: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(articles.isPublished, true)];
      if (input?.category) {
        conditions.push(eq(articles.category, input.category as any));
      }
      const where = and(...conditions);

      const items = await db.select().from(articles)
        .where(where)
        .orderBy(desc(articles.publishedAt))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));

      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(articles).where(where);

      return { items, total: countResult?.count || 0 };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [article] = await db.select().from(articles)
        .where(eq(articles.slug, input.slug));
      if (article) {
        // Increment view count
        await db.update(articles)
          .set({ viewCount: sql`${articles.viewCount} + 1` })
          .where(eq(articles.id, article.id));
      }
      return article || null;
    }),

  create: moderatorQuery
    .input(z.object({
      title: z.string().min(5),
      slug: z.string(),
      excerpt: z.string().min(10),
      content: z.string().min(50),
      category: z.enum(["scam_alert", "safety_tip", "guide", "news", "resource"]),
      coverImage: z.string().optional(),
      author: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [article] = await db.insert(articles).values({
        ...input,
        isPublished: true,
        publishedAt: new Date(),
      });
      return { id: Number(article.insertId) };
    }),
});

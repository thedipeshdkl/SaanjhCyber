import { z } from "zod";
import { createRouter, publicQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { feedback } from "@db/schema";
import { desc } from "drizzle-orm";

export const feedbackRouter = createRouter({
  create: publicQuery
    .input(z.object({
      type: z.enum(["bug", "feature", "usability", "general"]),
      rating: z.number().min(1).max(5).optional(),
      message: z.string().min(5),
      page: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [item] = await db.insert(feedback).values({
        userId: ctx.user?.id || null,
        type: input.type as any,
        rating: input.rating,
        message: input.message,
        page: input.page,
      });
      return { id: Number(item.insertId) };
    }),

  list: moderatorQuery
    .input(z.object({
      type: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(feedback)
        .orderBy(desc(feedback.createdAt))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));
    }),
});

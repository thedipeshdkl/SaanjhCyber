import { z } from "zod";
import { createRouter, publicQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { entities, reports } from "@db/schema";
import { eq, desc, and, or, sql, like } from "drizzle-orm";

export const entityRouter = createRouter({
  search: publicQuery
    .input(z.object({
      query: z.string().optional(),
      type: z.string().optional(),
      riskLevel: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      
      if (input?.query) {
        conditions.push(like(entities.value, `%${input.query}%`));
      }
      if (input?.type) {
        conditions.push(eq(entities.type, input.type as any));
      }
      if (input?.riskLevel) {
        conditions.push(eq(entities.riskLevel, input.riskLevel as any));
      }
      
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      const items = await db.select().from(entities)
        .where(where)
        .orderBy(desc(entities.reportCount))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));
      
      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(entities).where(where);
      
      return { items, total: countResult[0]?.count || 0 };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [entity] = await db.select().from(entities).where(eq(entities.id, input.id));
      return entity || null;
    }),

  create: publicQuery
    .input(z.object({
      value: z.string().min(1),
      type: z.enum([
        "phone", "email", "domain", "website", "facebook", "telegram", "instagram",
        "tiktok", "whatsapp", "esewa", "khalti", "bank_account", "business_name",
        "company", "vehicle_number", "wallet_address", "keyword"
      ]),
      riskLevel: z.enum(["low", "medium", "high", "critical"]).default("low"),
      reportCount: z.number().default(1),
      verificationStatus: z.enum(["unverified", "pending", "verified_false", "verified_true"]).default("unverified"),
      relatedReports: z.any().optional(),
      evidenceCount: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [entity] = await db.insert(entities).values({
        ...input,
        riskLevel: "low",
        verificationStatus: "unverified",
      });
      return { id: Number(entity.insertId) };
    }),

  updateRisk: moderatorQuery
    .input(z.object({
      id: z.number(),
      riskLevel: z.enum(["low", "medium", "high", "critical"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(entities).set({
        riskLevel: input.riskLevel as any,
      }).where(eq(entities.id, input.id));
      return { success: true };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const total = await db.select({ count: sql<number>`count(*)` }).from(entities);
    const byRiskLevel = await db.select({
      riskLevel: entities.riskLevel,
      count: sql<number>`count(*)`,
    }).from(entities).groupBy(entities.riskLevel);
    
    const byType = await db.select({
      type: entities.type,
      count: sql<number>`count(*)`,
    }).from(entities).groupBy(entities.type).limit(10);
    
    return {
      total: total[0]?.count || 0,
      byRiskLevel,
      byType,
    };
  }),

  getDetailWithReports: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [entity] = await db.select().from(entities).where(eq(entities.id, input.id));
      if (!entity) return null;

      // Find related public reports that mention this entity value
      const relatedReports = await db.select({
        id: reports.id,
        caseNumber: reports.caseNumber,
        title: reports.title,
        category: reports.category,
        status: reports.status,
        riskScore: reports.riskScore,
        district: reports.district,
        createdAt: reports.createdAt,
      }).from(reports)
        .where(and(
          eq(reports.privacyLevel, "public"),
          or(
            like(reports.title, `%${entity.value}%`),
            like(reports.description, `%${entity.value}%`),
            sql`JSON_CONTAINS(suspectInfo, ${JSON.stringify(entity.value)})`,
          )
        ))
        .orderBy(desc(reports.createdAt))
        .limit(10);

      return { entity, reports: relatedReports };
    }),
});

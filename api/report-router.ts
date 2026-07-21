import { z } from "zod";
import { createRouter, publicQuery, authedQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reports, caseTimeline, evidence, comments, entities } from "@db/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `SCR-${year}-${random}`;
}

/**
 * Validates coordinate pair integrity: both must be present and within Nepal bounds,
 * or both are set to null. Partial coordinate storage is not permitted.
 */
export function validateCoordinatePair(
  lat: number | null | undefined,
  lng: number | null | undefined
): { latitude: string | null; longitude: string | null } {
  if (lat == null || lng == null) {
    return { latitude: null, longitude: null };
  }

  const inNepalBounds =
    lat >= 26.3 && lat <= 30.5 &&
    lng >= 80.0 && lng <= 88.2;

  if (inNepalBounds) {
    return { latitude: lat.toString(), longitude: lng.toString() };
  }

  return { latitude: null, longitude: null };
}

export const reportRouter = createRouter({
  create: publicQuery
    .input(z.object({
      title: z.string().min(5).max(500),
      description: z.string().min(20),
      category: z.enum([
        "online_scam", "phishing", "social_media_fraud", "fake_job", "identity_theft",
        "investment_scam", "bank_fraud", "digital_wallet_fraud", "romance_scam",
        "cyberbullying", "online_blackmail", "fake_website", "fake_app",
        "unauthorized_access", "hacking", "other"
      ]),
      incidentDate: z.string(),
      province: z.string(),
      district: z.string(),
      municipality: z.string(),
      location: z.string().optional(),
      latitude: z.number().min(26.3).max(30.5).nullable().optional(),
      longitude: z.number().min(80.0).max(88.2).nullable().optional(),
      amountLost: z.preprocess(
        (val) => (val === null || val === undefined || Number.isNaN(val) || val === "") ? undefined : Number(val),
        z.number().optional()
      ),
      currency: z.enum(["NPR", "USD", "INR"]).default("NPR"),
      language: z.enum(["en", "ne"]).default("en"),
      victimType: z.enum(["individual", "business", "organization", "other"]),
      suspectInfo: z.any().optional(),
      privacyLevel: z.enum(["public", "anonymous", "private"]).default("anonymous"),
      isDefamationAcknowledged: z.boolean(),
      identifiers: z.array(z.object({
        type: z.string(),
        value: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const caseNumber = generateCaseNumber();
      const { identifiers: inputIdentifiers, latitude, longitude, ...reportInput } = input;

      // Coordinate pair validation: both must be present and in-bounds, or both null
      const { latitude: validatedLatitude, longitude: validatedLongitude } = validateCoordinatePair(latitude, longitude);

      const reportData = {
        ...reportInput,
        caseNumber,
        reporterId: ctx.user?.id || null,
        amountLost: input.amountLost ? input.amountLost.toString() : null,
        latitude: validatedLatitude,
        longitude: validatedLongitude,
      };
      const [report] = await db.insert(reports).values(reportData);
      const reportId = Number(report.insertId);

      await db.insert(caseTimeline).values({
        reportId,
        status: "submitted",
        title: "Report Submitted",
        description: "Your cybercrime report has been submitted successfully.",
        actorRole: "system",
      });

      // Save identifiers to entities table
      if (inputIdentifiers && inputIdentifiers.length > 0) {
        for (const identifier of inputIdentifiers) {
          // Check if entity already exists
          const [existing] = await db.select().from(entities)
            .where(like(entities.value, identifier.value))
            .limit(1);

          if (existing) {
            // Increment report count
            await db.update(entities).set({
              reportCount: sql`${entities.reportCount} + 1`,
              lastReportedAt: new Date(),
              relatedReports: sql`JSON_ARRAY_APPEND(COALESCE(${entities.relatedReports}, JSON_ARRAY()), '$', ${reportId})`,
            }).where(eq(entities.id, existing.id));
          } else {
            // Create new entity
            await db.insert(entities).values({
              value: identifier.value,
              type: identifier.type as any,
              riskLevel: "low",
              reportCount: 1,
              verificationStatus: "unverified",
              relatedReports: JSON.stringify([reportId]),
              evidenceCount: 0,
            });
          }
        }
      }

      return { caseNumber, id: reportId };
    }),

  uploadEvidence: authedQuery
    .input(z.object({
      reportId: z.number(),
      files: z.array(z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        data: z.string(), // base64
      })).max(10),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [report] = await db.select().from(reports).where(eq(reports.id, input.reportId));
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      if (report.reporterId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your report" });

      for (const file of input.files) {
        const fileType = file.type.startsWith("image/") ? "image" as const
          : file.type === "application/pdf" ? "pdf" as const
          : file.type.startsWith("video/") ? "video" as const
          : file.type.startsWith("audio/") ? "audio" as const
          : "document" as const;

        await db.insert(evidence).values({
          reportId: input.reportId,
          fileUrl: file.data, // store base64 data URL
          fileType,
          fileName: file.name,
          fileSize: file.size,
          uploadedBy: ctx.user.id,
        });
      }

      // Update evidence count
      await db.update(reports)
        .set({ evidenceCount: sql`${reports.evidenceCount} + ${input.files.length}` })
        .where(eq(reports.id, input.reportId));

      return { success: true, count: input.files.length };
    }),

  list: authedQuery
    .input(z.object({
      status: z.string().optional(),
      category: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [];
      
      // Authorization check: non-moderators/admins can only see their own reports
      if (ctx.user.role === "user") {
        conditions.push(eq(reports.reporterId, ctx.user.id));
      }
      
      if (input?.status) conditions.push(eq(reports.status, input.status as any));
      if (input?.category) conditions.push(eq(reports.category, input.category as any));
      
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      const items = await db.select().from(reports)
        .where(where)
        .orderBy(desc(reports.createdAt))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));
      
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(reports).where(where);
      
      return { items, total: countResult[0]?.count || 0 };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const [report] = await db.select().from(reports).where(eq(reports.id, input.id));
      if (!report) return null;
      
      // Enforce ownership
      if (ctx.user.role === "user" && report.reporterId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to view this report." });
      }
      
      const timeline = await db.select().from(caseTimeline)
        .where(eq(caseTimeline.reportId, input.id))
        .orderBy(desc(caseTimeline.createdAt));
      
      const evidenceList = await db.select().from(evidence)
        .where(eq(evidence.reportId, input.id))
        .orderBy(desc(evidence.createdAt));
      
      const commentList = await db.select().from(comments)
        .where(eq(comments.reportId, input.id))
        .orderBy(desc(comments.createdAt));
      
      return { ...report, timeline, evidence: evidenceList, comments: commentList };
    }),

  updateStatus: moderatorQuery
    .input(z.object({
      id: z.number(),
      status: z.enum([
        "submitted", "under_review", "need_info", "verified", "rejected", "closed", "resolved"
      ]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(reports).set({
        status: input.status as any,
        moderationNotes: input.notes,
        verifiedBy: ctx.user.id,
        verifiedAt: new Date(),
      }).where(eq(reports.id, input.id));
      
      await db.insert(caseTimeline).values({
        reportId: input.id,
        status: input.status as any,
        title: `Status Updated to ${input.status.replace("_", " ").toUpperCase()}`,
        description: input.notes || `Case status changed to ${input.status}`,
        actorId: ctx.user.id,
        actorRole: "moderator",
      });
      
      return { success: true };
    }),

  addComment: authedQuery
    .input(z.object({
      reportId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [report] = await db.select().from(reports).where(eq(reports.id, input.reportId));
      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }
      
      // Authorization check
      const isStaff = ctx.user.role === "admin" || ctx.user.role === "moderator";
      if (!isStaff && report.reporterId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to comment on this report." });
      }
      
      const [comment] = await db.insert(comments).values({
        reportId: input.reportId,
        userId: ctx.user.id,
        content: input.content,
        isModeratorNote: isStaff,
      });
      return { id: Number(comment.insertId) };
    }),

  getTimeline: authedQuery
    .input(z.object({ reportId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const [report] = await db.select().from(reports).where(eq(reports.id, input.reportId));
      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }
      
      if (ctx.user.role === "user" && report.reporterId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to view this timeline." });
      }
      
      return db.select().from(caseTimeline)
        .where(eq(caseTimeline.reportId, input.reportId))
        .orderBy(desc(caseTimeline.createdAt));
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const totalReports = await db.select({ count: sql<number>`count(*)` }).from(reports);
    const byStatus = await db.select({
      status: reports.status,
      count: sql<number>`count(*)`,
    }).from(reports).groupBy(reports.status);
    
    const byCategory = await db.select({
      category: reports.category,
      count: sql<number>`count(*)`,
    }).from(reports).groupBy(reports.category);
    
    const resolvedThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(and(
        eq(reports.status, "resolved"),
        sql`createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      ));
    
    return {
      total: totalReports[0]?.count || 0,
      byStatus,
      byCategory,
      resolvedThisMonth: resolvedThisMonth[0]?.count || 0,
    };
  }),

  myReports: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db.select().from(reports)
      .where(eq(reports.reporterId, ctx.user.id))
      .orderBy(desc(reports.createdAt));
    return items;
  }),

  updateReport: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().min(5).max(500).optional(),
      description: z.string().min(20).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [report] = await db.select().from(reports).where(eq(reports.id, input.id));
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      if (report.reporterId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your report" });
      if (!["submitted", "need_info"].includes(report.status)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot edit report once it is under review or resolved" });
      }
      const updateData: Record<string, string> = {};
      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (Object.keys(updateData).length > 0) {
        await db.update(reports).set(updateData).where(eq(reports.id, input.id));
      }
      return { success: true };
    }),

  deleteReport: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [report] = await db.select().from(reports).where(eq(reports.id, input.id));
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      if (report.reporterId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your report" });
      if (!["submitted", "need_info"].includes(report.status)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete report once it is under review or resolved" });
      }
      await db.delete(reports).where(eq(reports.id, input.id));
      return { success: true };
    }),
});

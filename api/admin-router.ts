import { z } from "zod";
import { createRouter, adminQuery, superadminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, reports, entities, auditLogs, feedback, appeals, surveys, participants } from "@db/schema";
import { desc, sql, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ─── Audit helper ───
async function logAudit(userId: number, action: string, resource: string, resourceId?: number, details?: unknown) {
  const db = getDb();
  await db.insert(auditLogs).values({
    userId: userId,
    action,
    resource,
    resourceId: resourceId ? resourceId : undefined,
    details: details ? JSON.stringify(details) : undefined,
  });
}

export const adminRouter = createRouter({
  // ─── Dashboard Stats ───
  getStats: adminQuery.query(async () => {
    const db = getDb();
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [totalReports] = await db.select({ count: sql<number>`count(*)` }).from(reports);
    const [totalEntities] = await db.select({ count: sql<number>`count(*)` }).from(entities);
    const [pendingReports] = await db.select({ count: sql<number>`count(*)` })
      .from(reports).where(sql`status = 'submitted' OR status = 'under_review'`);
    const [pendingAppeals] = await db.select({ count: sql<number>`count(*)` })
      .from(appeals).where(sql`status = 'pending'`);
    const [totalSurveys] = await db.select({ count: sql<number>`count(*)` }).from(surveys);
    const [totalParticipants] = await db.select({ count: sql<number>`count(*)` }).from(participants);
    const [feedbackCount] = await db.select({ count: sql<number>`count(*)` }).from(feedback);

    // Users by role
    const usersByRole = await db.select({
      role: users.role,
      count: sql<number>`count(*)`,
    }).from(users).groupBy(users.role);

    // Reports by status
    const statusBreakdown = await db.select({
      status: reports.status,
      count: sql<number>`count(*)`,
    }).from(reports).groupBy(reports.status);

    // Reports by category (top 10)
    const categoryBreakdown = await db.select({
      category: reports.category,
      count: sql<number>`count(*)`,
    }).from(reports).groupBy(reports.category).orderBy(desc(sql`count(*)`)).limit(10);

    // Monthly report trend (last 12 months)
    const monthlyReports = await db.select({
      month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
      count: sql<number>`count(*)`,
    }).from(reports)
      .where(sql`createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`)
      .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);

    // Recent sign-ins (last 24h)
    const [recentLogins] = await db.select({ count: sql<number>`count(*)` })
      .from(users).where(sql`lastSignInAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`);

    return {
      overview: {
        totalUsers: totalUsers?.count || 0,
        totalReports: totalReports?.count || 0,
        totalEntities: totalEntities?.count || 0,
        pendingReports: pendingReports?.count || 0,
        pendingAppeals: pendingAppeals?.count || 0,
        totalSurveys: totalSurveys?.count || 0,
        totalParticipants: totalParticipants?.count || 0,
        feedbackCount: feedbackCount?.count || 0,
        recentLogins: recentLogins?.count || 0,
      },
      usersByRole,
      statusBreakdown,
      categoryBreakdown,
      monthlyReports,
    };
  }),

  // ─── User Management ───
  listUsers: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      role: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.role) {
        conditions.push(eq(users.role, input.role as any));
      }
      if (input?.search) {
        conditions.push(sql`(name LIKE ${'%' + input.search + '%'} OR email LIKE ${'%' + input.search + '%'})`);
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.select({
        id: users.id,
        unionId: users.unionId,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        province: users.province,
        district: users.district,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      }).from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));

      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(where);
      return { items, total: countResult?.count || 0 };
    }),

  // ─── Role Management (admin can promote to moderator/researcher, superadmin can promote to admin) ───
  updateUserRole: adminQuery
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "moderator", "admin", "researcher"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Fetch target user
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId));
      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // PROTECTION: Cannot modify superadmin
      if (targetUser.role === "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot modify superadmin account" });
      }

      // PROTECTION: Only superadmin can promote to admin
      if (input.role === "admin" && ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only superadmin can promote users to admin" });
      }

      // PROTECTION: Cannot change own role (prevents accidental self-demotion)
      if (targetUser.id === ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot change your own role" });
      }

      // PROTECTION: Regular admin cannot demote other admins
      if (targetUser.role === "admin" && ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only superadmin can modify admin roles" });
      }

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      await logAudit(ctx.user.id, "role_change", "user", input.userId, {
        from: targetUser.role,
        to: input.role,
        targetEmail: targetUser.email,
      });

      return { success: true };
    }),

  // ─── Delete User (superadmin only, cannot delete self) ───
  deleteUser: superadminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId));
      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (targetUser.role === "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete superadmin account" });
      }

      if (targetUser.id === ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete your own account" });
      }

      await db.delete(users).where(eq(users.id, input.userId));

      await logAudit(ctx.user.id, "user_deleted", "user", input.userId, {
        deletedEmail: targetUser.email,
        deletedName: targetUser.name,
      });

      return { success: true };
    }),

  // ─── Reports Management ───
  listReports: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) conditions.push(eq(reports.status, input.status as any));
      if (input?.category) conditions.push(eq(reports.category, input.category as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.select().from(reports)
        .where(where)
        .orderBy(desc(reports.createdAt))
        .limit(input?.limit || 20)
        .offset(((input?.page || 1) - 1) * (input?.limit || 20));

      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(where);
      return { items, total: countResult?.count || 0 };
    }),

  // ─── Update Report Status ───
  updateReportStatus: adminQuery
    .input(z.object({
      reportId: z.number(),
      status: z.enum(["submitted", "under_review", "need_info", "verified", "rejected", "closed", "resolved"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [report] = await db.select().from(reports).where(eq(reports.id, input.reportId));
      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      await db.update(reports).set({
        status: input.status,
        moderationNotes: input.notes || report.moderationNotes,
        verifiedBy: input.status === "verified" ? ctx.user.id : report.verifiedBy,
        verifiedAt: input.status === "verified" ? new Date() : report.verifiedAt,
      }).where(eq(reports.id, input.reportId));

      await logAudit(ctx.user.id, "report_status_change", "report", input.reportId, {
        from: report.status,
        to: input.status,
        caseNumber: report.caseNumber,
      });

      return { success: true };
    }),

  // ─── Audit Logs ───
  getAuditLogs: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db.select().from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(input?.limit || 50)
        .offset(((input?.page || 1) - 1) * (input?.limit || 50));

      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(auditLogs);
      return { items, total: countResult?.count || 0 };
    }),

  // ─── Security Overview ───
  getSecurityOverview: adminQuery.query(async () => {
    const db = getDb();

    // Recent audit events
    const recentAudit = await db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    // Users who haven't logged in for 30+ days
    const [inactiveUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`lastSignInAt < DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    // Admin count
    const [adminCount] = await db.select({ count: sql<number>`count(*)` })
      .from(users).where(sql`role = 'admin' OR role = 'superadmin'`);

    // New registrations today
    const [newToday] = await db.select({ count: sql<number>`count(*)` })
      .from(users).where(sql`createdAt >= CURDATE()`);

    return {
      recentAudit,
      inactiveUsers: inactiveUsers?.count || 0,
      adminCount: adminCount?.count || 0,
      newRegistrationsToday: newToday?.count || 0,
    };
  }),

  // ─── Analytics ───
  getAnalytics: adminQuery.query(async () => {
    const db = getDb();

    const recentReports = await db.select().from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(10);

    const recentFeedback = await db.select().from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(10);

    const recentAppeals = await db.select().from(appeals)
      .orderBy(desc(appeals.createdAt))
      .limit(10);

    // Entity risk distribution
    const riskDistribution = await db.select({
      riskLevel: entities.riskLevel,
      count: sql<number>`count(*)`,
    }).from(entities).groupBy(entities.riskLevel);

    return { recentReports, recentFeedback, recentAppeals, riskDistribution };
  }),
});

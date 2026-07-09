import { z } from "zod";
import { createRouter, publicQuery, researcherQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { surveys, participants, reports, entities } from "@db/schema";
import { sql, desc } from "drizzle-orm";

export const researchRouter = createRouter({
  submitSurvey: publicQuery
    .input(z.object({
      participantId: z.string(),
      susScore: z.number().min(0).max(100),
      responses: z.any(),
      taskCompletionTime: z.number().optional(),
      errorsMade: z.number().default(0),
      easeOfUse: z.number().min(1).max(10).optional(),
      usefulness: z.number().min(1).max(10).optional(),
      trustScore: z.number().min(1).max(10).optional(),
      accessibilityRating: z.number().min(1).max(10).optional(),
      comments: z.string().optional(),
      demographics: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [survey] = await db.insert(surveys).values({
        participantId: input.participantId,
        susScore: input.susScore.toString(),
        responses: input.responses,
        taskCompletionTime: input.taskCompletionTime,
        errorsMade: input.errorsMade,
        easeOfUse: input.easeOfUse,
        usefulness: input.usefulness,
        trustScore: input.trustScore,
        accessibilityRating: input.accessibilityRating,
        comments: input.comments,
        demographics: input.demographics,
      });
      return { id: Number(survey.insertId) };
    }),

  getResults: publicQuery.query(async () => {
    const db = getDb();
    const allSurveys = await db.select().from(surveys);
    const avgSus = allSurveys.length > 0
      ? allSurveys.reduce((acc, s) => acc + Number(s.susScore), 0) / allSurveys.length
      : 0;
    
    const avgEase = allSurveys.filter(s => s.easeOfUse).length > 0
      ? allSurveys.filter(s => s.easeOfUse).reduce((acc, s) => acc + (s.easeOfUse || 0), 0) / allSurveys.filter(s => s.easeOfUse).length
      : 0;
    
    const avgTrust = allSurveys.filter(s => s.trustScore).length > 0
      ? allSurveys.filter(s => s.trustScore).reduce((acc, s) => acc + (s.trustScore || 0), 0) / allSurveys.filter(s => s.trustScore).length
      : 0;
    
    return {
      totalSurveys: allSurveys.length,
      avgSusScore: Number(avgSus.toFixed(2)),
      avgEaseOfUse: Number(avgEase.toFixed(2)),
      avgTrustScore: Number(avgTrust.toFixed(2)),
      surveys: allSurveys,
    };
  }),

  getStats: researcherQuery.query(async () => {
    const db = getDb();
    const totalSurveys = await db.select({ count: sql<number>`count(*)` }).from(surveys);
    const totalParticipants = await db.select({ count: sql<number>`count(*)` }).from(participants);
    const totalReports = await db.select({ count: sql<number>`count(*)` }).from(reports);
    const totalEntities = await db.select({ count: sql<number>`count(*)` }).from(entities);
    
    return {
      totalSurveys: totalSurveys[0]?.count || 0,
      totalParticipants: totalParticipants[0]?.count || 0,
      totalReports: totalReports[0]?.count || 0,
      totalEntities: totalEntities[0]?.count || 0,
    };
  }),

  getParticipantStats: researcherQuery.query(async () => {
    const db = getDb();
    const byAgeGroup = await db.select({
      ageGroup: participants.ageGroup,
      count: sql<number>`count(*)`,
    }).from(participants).groupBy(participants.ageGroup);
    
    const byGender = await db.select({
      gender: participants.gender,
      count: sql<number>`count(*)`,
    }).from(participants).groupBy(participants.gender);
    
    const byEducation = await db.select({
      education: participants.education,
      count: sql<number>`count(*)`,
    }).from(participants).groupBy(participants.education);
    
    const byTechProficiency = await db.select({
      techProficiency: participants.techProficiency,
      count: sql<number>`count(*)`,
    }).from(participants).groupBy(participants.techProficiency);
    
    const byDistrict = await db.select({
      district: participants.district,
      count: sql<number>`count(*)`,
    }).from(participants).groupBy(participants.district);
    
    return { byAgeGroup, byGender, byEducation, byTechProficiency, byDistrict };
  }),

  getUsabilityMetrics: researcherQuery.query(async () => {
    const db = getDb();
    const allSurveys = await db.select().from(surveys).orderBy(desc(surveys.createdAt));
    
    const susScores = allSurveys.map(s => Number(s.susScore));
    const avgSus = susScores.length > 0 ? susScores.reduce((a, b) => a + b, 0) / susScores.length : 0;
    
    const easeScores = allSurveys.filter(s => s.easeOfUse).map(s => s.easeOfUse || 0);
    const avgEase = easeScores.length > 0 ? easeScores.reduce((a, b) => a + b, 0) / easeScores.length : 0;
    
    const trustScores = allSurveys.filter(s => s.trustScore).map(s => s.trustScore || 0);
    const avgTrust = trustScores.length > 0 ? trustScores.reduce((a, b) => a + b, 0) / trustScores.length : 0;
    
    const usefulScores = allSurveys.filter(s => s.usefulness).map(s => s.usefulness || 0);
    const avgUseful = usefulScores.length > 0 ? usefulScores.reduce((a, b) => a + b, 0) / usefulScores.length : 0;
    
    const accessibilityScores = allSurveys.filter(s => s.accessibilityRating).map(s => s.accessibilityRating || 0);
    const avgAccessibility = accessibilityScores.length > 0 ? accessibilityScores.reduce((a, b) => a + b, 0) / accessibilityScores.length : 0;
    
    const taskTimes = allSurveys.filter(s => s.taskCompletionTime).map(s => s.taskCompletionTime || 0);
    const avgTaskTime = taskTimes.length > 0 ? taskTimes.reduce((a, b) => a + b, 0) / taskTimes.length : 0;
    
    return {
      avgSusScore: Number(avgSus.toFixed(2)),
      avgEaseOfUse: Number(avgEase.toFixed(2)),
      avgTrustScore: Number(avgTrust.toFixed(2)),
      avgUsefulness: Number(avgUseful.toFixed(2)),
      avgAccessibility: Number(avgAccessibility.toFixed(2)),
      avgTaskCompletionTime: Math.round(avgTaskTime),
      totalErrors: allSurveys.reduce((acc, s) => acc + (s.errorsMade || 0), 0),
      grade: avgSus >= 80 ? "A" : avgSus >= 68 ? "B" : avgSus >= 51 ? "C" : "D",
      adjective: avgSus >= 80 ? "Excellent" : avgSus >= 68 ? "Good" : avgSus >= 51 ? "OK" : "Poor",
      surveys: allSurveys,
    };
  }),
});

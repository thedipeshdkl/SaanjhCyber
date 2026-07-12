import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  int,
  boolean,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── Users ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "moderator", "admin", "superadmin", "researcher"]).default("user").notNull(),
  isAnonymous: boolean("isAnonymous").default(false),
  province: varchar("province", { length: 100 }),
  district: varchar("district", { length: 100 }),
  municipality: varchar("municipality", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Reports ───
export const reports = mysqlTable("reports", {
  id: serial("id").primaryKey(),
  caseNumber: varchar("caseNumber", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "online_scam", "phishing", "social_media_fraud", "fake_job", "identity_theft",
    "investment_scam", "bank_fraud", "digital_wallet_fraud", "romance_scam",
    "cyberbullying", "online_blackmail", "fake_website", "fake_app",
    "unauthorized_access", "hacking", "other"
  ]).notNull(),
  incidentDate: varchar("incidentDate", { length: 50 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  location: varchar("location", { length: 200 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  amountLost: decimal("amountLost", { precision: 15, scale: 2 }),
  currency: mysqlEnum("currency", ["NPR", "USD", "INR"]).default("NPR"),
  language: mysqlEnum("language", ["en", "ne"]).default("en"),
  victimType: mysqlEnum("victimType", ["individual", "business", "organization", "other"]).notNull(),
  reporterId: bigint("reporterId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  suspectInfo: json("suspectInfo"),
  privacyLevel: mysqlEnum("privacyLevel", ["public", "anonymous", "private"]).default("anonymous"),
  status: mysqlEnum("status", [
    "submitted", "under_review", "need_info", "verified", "rejected", "closed", "resolved"
  ]).default("submitted"),
  riskScore: int("riskScore").default(0),
  evidenceCount: int("evidenceCount").default(0),
  isDefamationAcknowledged: boolean("isDefamationAcknowledged").notNull(),
  moderationNotes: text("moderationNotes"),
  verifiedBy: bigint("verifiedBy", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_reporter").on(table.reporterId),
  index("idx_status").on(table.status),
  index("idx_category").on(table.category),
]);

// ─── Evidence ───
export const evidence = mysqlTable("evidence", {
  id: serial("id").primaryKey(),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).notNull().references(() => reports.id, { onDelete: "cascade" }),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileType: mysqlEnum("fileType", ["image", "pdf", "video", "audio", "document", "screenshot", "chat_export"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: bigint("fileSize", { mode: "number", unsigned: true }).notNull(),
  previewUrl: varchar("previewUrl", { length: 500 }),
  uploadedBy: bigint("uploadedBy", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_evidence_report").on(table.reportId),
]);

// ─── Entities (Searchable) ───
export const entities = mysqlTable("entities", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 500 }).notNull(),
  type: mysqlEnum("type", [
    "phone", "email", "domain", "website", "facebook", "telegram", "instagram",
    "tiktok", "whatsapp", "esewa", "khalti", "bank_account", "business_name",
    "company", "vehicle_number", "wallet_address", "keyword"
  ]).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).default("low"),
  reportCount: int("reportCount").default(1),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified_false", "verified_true"]).default("unverified"),
  firstReportedAt: timestamp("firstReportedAt").defaultNow().notNull(),
  lastReportedAt: timestamp("lastReportedAt").defaultNow().notNull(),
  relatedReports: json("relatedReports"),
  evidenceCount: int("evidenceCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_entity_value").on(table.value),
  index("idx_entity_type").on(table.type),
  index("idx_entity_risk").on(table.riskLevel),
]);

// ─── Case Timeline ───
export const caseTimeline = mysqlTable("caseTimeline", {
  id: serial("id").primaryKey(),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).notNull().references(() => reports.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", [
    "submitted", "under_review", "need_info", "verified", "rejected", "closed", "resolved"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  actorId: bigint("actorId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  actorRole: mysqlEnum("actorRole", ["system", "reporter", "moderator", "admin"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_timeline_report").on(table.reportId),
]);

// ─── Comments ───
export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).notNull().references(() => reports.id, { onDelete: "cascade" }),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isModeratorNote: boolean("isModeratorNote").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_comment_report").on(table.reportId),
]);

// ─── Notifications ───
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["status_change", "evidence_added", "comment", "verification", "appeal", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).references(() => reports.id, { onDelete: "cascade" }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_notification_user").on(table.userId),
]);

// ─── Bookmarks ───
export const bookmarks = mysqlTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).notNull().references(() => reports.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_bookmark_unique").on(table.userId, table.reportId),
]);

// ─── Saved Searches ───
export const savedSearches = mysqlTable("savedSearches", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  query: varchar("query", { length: 500 }).notNull(),
  filters: json("filters"),
  resultCount: int("resultCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Audit Logs ───
export const auditLogs = mysqlTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: bigint("resourceId", { mode: "number", unsigned: true }),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Appeals ───
export const appeals = mysqlTable("appeals", {
  id: serial("id").primaryKey(),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).notNull().references(() => reports.id, { onDelete: "cascade" }),
  entityId: bigint("entityId", { mode: "number", unsigned: true }).references(() => entities.id, { onDelete: "set null" }),
  appellantId: bigint("appellantId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  evidence: json("evidence"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  reviewedBy: bigint("reviewedBy", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

// ─── Feedback ───
export const feedback = mysqlTable("feedback", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  type: mysqlEnum("type", ["bug", "feature", "usability", "general"]).notNull(),
  rating: int("rating"),
  message: text("message").notNull(),
  page: varchar("page", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Surveys (SUS & Research) ───
export const surveys = mysqlTable("surveys", {
  id: serial("id").primaryKey(),
  participantId: varchar("participantId", { length: 100 }).notNull(),
  susScore: decimal("susScore", { precision: 4, scale: 2 }).notNull(),
  responses: json("responses").notNull(),
  taskCompletionTime: int("taskCompletionTime"),
  errorsMade: int("errorsMade").default(0),
  easeOfUse: int("easeOfUse"),
  usefulness: int("usefulness"),
  trustScore: int("trustScore"),
  accessibilityRating: int("accessibilityRating"),
  comments: text("comments"),
  demographics: json("demographics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Participants ───
export const participants = mysqlTable("participants", {
  id: serial("id").primaryKey(),
  participantId: varchar("participantId", { length: 100 }).notNull().unique(),
  ageGroup: mysqlEnum("ageGroup", ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]).notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other", "prefer_not"]).notNull(),
  education: mysqlEnum("education", ["secondary", "bachelor", "master", "phd", "other"]).notNull(),
  occupation: mysqlEnum("occupation", ["student", "professional", "retired", "unemployed", "other"]).notNull(),
  techProficiency: mysqlEnum("techProficiency", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  deviceUsed: mysqlEnum("deviceUsed", ["desktop", "mobile", "tablet"]).notNull(),
  hasReportedBefore: boolean("hasReportedBefore").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Articles (Public Awareness) ───
export const articles = mysqlTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["scam_alert", "safety_tip", "guide", "news", "resource"]).notNull(),
  coverImage: varchar("coverImage", { length: 500 }),
  author: varchar("author", { length: 255 }).notNull(),
  isPublished: boolean("isPublished").default(true),
  viewCount: int("viewCount").default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Nepal Geography ───
export const provinces = mysqlTable("provinces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameNe: varchar("nameNe", { length: 100 }),
  code: varchar("code", { length: 10 }),
});

export const districts = mysqlTable("districts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameNe: varchar("nameNe", { length: 100 }),
  provinceId: bigint("provinceId", { mode: "number", unsigned: true }).references(() => provinces.id),
  code: varchar("code", { length: 10 }),
});

export const municipalities = mysqlTable("municipalities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameNe: varchar("nameNe", { length: 100 }),
  districtId: bigint("districtId", { mode: "number", unsigned: true }).references(() => districts.id),
  type: mysqlEnum("type", ["metro", "sub_metro", "municipality", "rural"]).default("municipality"),
});

// ─── Messages (User ↔ Admin/Moderator) ───
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  reportId: bigint("reportId", { mode: "number", unsigned: true }).references(() => reports.id, { onDelete: "cascade" }),
  senderId: bigint("senderId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: bigint("receiverId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  isFromAdmin: boolean("isFromAdmin").default(false),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_message_report").on(table.reportId),
  index("idx_message_sender").on(table.senderId),
  index("idx_message_receiver").on(table.receiverId),
]);

// ─── Watched Entities (Watchlist) ───
export const watchedEntities = mysqlTable("watchedEntities", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  entityId: bigint("entityId", { mode: "number", unsigned: true }).notNull().references(() => entities.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_watched_unique").on(table.userId, table.entityId),
]);

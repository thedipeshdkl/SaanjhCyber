-- SaanjhCyber Database Schema
-- Auto-generated from db/schema.ts

CREATE TABLE IF NOT EXISTS `users` (
  `id` serial PRIMARY KEY,
  `unionId` varchar(255) NOT NULL UNIQUE,
  `name` varchar(255),
  `email` varchar(320) UNIQUE,
  `password` varchar(255),
  `avatar` text,
  `role` enum('user','moderator','admin','superadmin','researcher') NOT NULL DEFAULT 'user',
  `isAnonymous` boolean DEFAULT false,
  `province` varchar(100),
  `district` varchar(100),
  `municipality` varchar(100),
  `phone` varchar(20),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignInAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `reports` (
  `id` serial PRIMARY KEY,
  `caseNumber` varchar(50) NOT NULL UNIQUE,
  `title` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `category` enum('online_scam','phishing','social_media_fraud','fake_job','identity_theft','investment_scam','bank_fraud','digital_wallet_fraud','romance_scam','cyberbullying','online_blackmail','fake_website','fake_app','unauthorized_access','hacking','other') NOT NULL,
  `incidentDate` varchar(50) NOT NULL,
  `province` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `municipality` varchar(100) NOT NULL,
  `location` varchar(200),
  `latitude` decimal(10,7),
  `longitude` decimal(10,7),
  `amountLost` decimal(15,2),
  `currency` enum('NPR','USD','INR') DEFAULT 'NPR',
  `language` enum('en','ne') DEFAULT 'en',
  `victimType` enum('individual','business','organization','other') NOT NULL,
  `reporterId` bigint unsigned,
  `suspectInfo` json,
  `privacyLevel` enum('public','anonymous','private') DEFAULT 'anonymous',
  `status` enum('submitted','under_review','need_info','verified','rejected','closed','resolved') DEFAULT 'submitted',
  `riskScore` int DEFAULT 0,
  `evidenceCount` int DEFAULT 0,
  `isDefamationAcknowledged` boolean NOT NULL,
  `moderationNotes` text,
  `verifiedBy` bigint unsigned,
  `verifiedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_reporter` (`reporterId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `evidence` (
  `id` serial PRIMARY KEY,
  `reportId` bigint unsigned NOT NULL,
  `fileUrl` text NOT NULL,
  `fileType` enum('image','pdf','video','audio','document','screenshot','chat_export') NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileSize` bigint unsigned NOT NULL,
  `previewUrl` varchar(500),
  `uploadedBy` bigint unsigned,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_evidence_report` (`reportId`),
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `entities` (
  `id` serial PRIMARY KEY,
  `value` varchar(500) NOT NULL,
  `type` enum('phone','email','domain','website','facebook','telegram','instagram','tiktok','whatsapp','esewa','khalti','bank_account','business_name','company','vehicle_number','wallet_address','keyword') NOT NULL,
  `riskLevel` enum('low','medium','high','critical') DEFAULT 'low',
  `reportCount` int DEFAULT 1,
  `verificationStatus` enum('unverified','pending','verified_false','verified_true') DEFAULT 'unverified',
  `firstReportedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastReportedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `relatedReports` json,
  `evidenceCount` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_entity_value` (`value`),
  INDEX `idx_entity_type` (`type`),
  INDEX `idx_entity_risk` (`riskLevel`)
);

CREATE TABLE IF NOT EXISTS `caseTimeline` (
  `id` serial PRIMARY KEY,
  `reportId` bigint unsigned NOT NULL,
  `status` enum('submitted','under_review','need_info','verified','rejected','closed','resolved') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `actorId` bigint unsigned,
  `actorRole` enum('system','reporter','moderator','admin') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_timeline_report` (`reportId`),
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `comments` (
  `id` serial PRIMARY KEY,
  `reportId` bigint unsigned NOT NULL,
  `userId` bigint unsigned NOT NULL,
  `content` text NOT NULL,
  `isModeratorNote` boolean DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comment_report` (`reportId`),
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` serial PRIMARY KEY,
  `userId` bigint unsigned NOT NULL,
  `type` enum('status_change','evidence_added','comment','verification','appeal','system') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reportId` bigint unsigned,
  `isRead` boolean DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notification_user` (`userId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id` serial PRIMARY KEY,
  `userId` bigint unsigned NOT NULL,
  `reportId` bigint unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_bookmark_unique` (`userId`, `reportId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `savedSearches` (
  `id` serial PRIMARY KEY,
  `userId` bigint unsigned NOT NULL,
  `query` varchar(500) NOT NULL,
  `filters` json,
  `resultCount` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `auditLogs` (
  `id` serial PRIMARY KEY,
  `userId` bigint unsigned,
  `action` varchar(255) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `resourceId` bigint unsigned,
  `details` json,
  `ipAddress` varchar(50),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `appeals` (
  `id` serial PRIMARY KEY,
  `reportId` bigint unsigned NOT NULL,
  `entityId` bigint unsigned,
  `appellantId` bigint unsigned NOT NULL,
  `reason` text NOT NULL,
  `evidence` json,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewedBy` bigint unsigned,
  `reviewNotes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolvedAt` timestamp NULL,
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`entityId`) REFERENCES `entities`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`appellantId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` serial PRIMARY KEY,
  `userId` bigint unsigned,
  `type` enum('bug','feature','usability','general') NOT NULL,
  `rating` int,
  `message` text NOT NULL,
  `page` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `surveys` (
  `id` serial PRIMARY KEY,
  `participantId` varchar(100) NOT NULL,
  `susScore` decimal(4,2) NOT NULL,
  `responses` json NOT NULL,
  `taskCompletionTime` int,
  `errorsMade` int DEFAULT 0,
  `easeOfUse` int,
  `usefulness` int,
  `trustScore` int,
  `accessibilityRating` int,
  `comments` text,
  `demographics` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `participants` (
  `id` serial PRIMARY KEY,
  `participantId` varchar(100) NOT NULL UNIQUE,
  `ageGroup` enum('18-24','25-34','35-44','45-54','55-64','65+') NOT NULL,
  `gender` enum('male','female','other','prefer_not') NOT NULL,
  `education` enum('secondary','bachelor','master','phd','other') NOT NULL,
  `occupation` enum('student','professional','retired','unemployed','other') NOT NULL,
  `techProficiency` enum('beginner','intermediate','advanced','expert') NOT NULL,
  `district` varchar(100) NOT NULL,
  `deviceUsed` enum('desktop','mobile','tablet') NOT NULL,
  `hasReportedBefore` boolean DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `articles` (
  `id` serial PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `excerpt` text NOT NULL,
  `content` text NOT NULL,
  `category` enum('scam_alert','safety_tip','guide','news','resource') NOT NULL,
  `coverImage` varchar(500),
  `author` varchar(255) NOT NULL,
  `isPublished` boolean DEFAULT true,
  `viewCount` int DEFAULT 0,
  `publishedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `provinces` (
  `id` serial PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `nameNe` varchar(100),
  `code` varchar(10)
);

CREATE TABLE IF NOT EXISTS `districts` (
  `id` serial PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `nameNe` varchar(100),
  `provinceId` bigint unsigned,
  `code` varchar(10),
  FOREIGN KEY (`provinceId`) REFERENCES `provinces`(`id`)
);

CREATE TABLE IF NOT EXISTS `municipalities` (
  `id` serial PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `nameNe` varchar(100),
  `districtId` bigint unsigned,
  `type` enum('metro','sub_metro','municipality','rural') DEFAULT 'municipality',
  FOREIGN KEY (`districtId`) REFERENCES `districts`(`id`)
);

CREATE TABLE IF NOT EXISTS `messages` (
  `id` serial PRIMARY KEY,
  `reportId` bigint unsigned,
  `senderId` bigint unsigned NOT NULL,
  `receiverId` bigint unsigned,
  `content` text NOT NULL,
  `isFromAdmin` boolean DEFAULT false,
  `isRead` boolean DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_message_report` (`reportId`),
  INDEX `idx_message_sender` (`senderId`),
  INDEX `idx_message_receiver` (`receiverId`),
  FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `watchedEntities` (
  `id` serial PRIMARY KEY,
  `userId` bigint unsigned NOT NULL,
  `entityId` bigint unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_watched_unique` (`userId`, `entityId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`entityId`) REFERENCES `entities`(`id`) ON DELETE CASCADE
);

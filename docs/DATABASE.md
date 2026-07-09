# Database Schema

MySQL 8.4 via Drizzle ORM. Schema defined in `db/schema.ts`.

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| unionId | varchar(255) | Unique internal user ID (UUID) |
| name | varchar(255) | Nullable |
| email | varchar(320) | Unique, nullable |
| password | varchar(255) | scrypt hash (salt:key format) |
| avatar | text | URL |
| role | enum | user, moderator, admin, researcher |
| isAnonymous | boolean | default false |
| province | varchar(100) | |
| district | varchar(100) | |
| municipality | varchar(100) | |
| phone | varchar(20) | |
| createdAt | timestamp | |
| updatedAt | timestamp | auto-update |
| lastSignInAt | timestamp | |

### reports
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| caseNumber | varchar(50) | Unique (e.g., SC-2026-XXXXX) |
| title | varchar(500) | |
| description | text | |
| category | enum | 16 categories (online_scam, phishing, etc.) |
| incidentDate | varchar(50) | |
| province/district/municipality | varchar | Nepal location |
| location | varchar(200) | Optional detail |
| amountLost | decimal(15,2) | |
| currency | enum | NPR, USD, INR |
| language | enum | en, ne |
| victimType | enum | individual, business, organization, other |
| reporterId | bigint FK → users | |
| suspectInfo | json | |
| privacyLevel | enum | public, anonymous, private |
| status | enum | submitted, under_review, need_info, verified, rejected, closed, resolved |
| riskScore | int | 0-100 |
| evidenceCount | int | |
| isDefamationAcknowledged | boolean | Required true |
| moderationNotes | text | |
| verifiedBy | bigint FK → users | |
| verifiedAt | timestamp | |
| createdAt/updatedAt | timestamp | |

Indexes: idx_reporter, idx_status, idx_category

### evidence
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| reportId | bigint FK → reports | CASCADE |
| fileUrl | varchar(500) | S3 presigned URL |
| fileType | enum | image, pdf, video, audio, document, screenshot, chat_export |
| fileName | varchar(255) | |
| fileSize | bigint | |
| previewUrl | varchar(500) | |
| uploadedBy | bigint FK → users | |
| createdAt | timestamp | |

### entities
Searchable database of suspicious phone numbers, emails, websites, accounts.

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| value | varchar(500) | The actual number/email/URL |
| type | enum | phone, email, domain, website, facebook, telegram, instagram, tiktok, whatsapp, esewa, khalti, bank_account, business_name, company, vehicle_number, wallet_address, keyword |
| riskLevel | enum | low, medium, high, critical |
| reportCount | int | |
| verificationStatus | enum | unverified, pending, verified_false, verified_true |
| firstReportedAt/lastReportedAt | timestamp | |
| relatedReports | json | |
| evidenceCount | int | |
| createdAt/updatedAt | timestamp | |

Indexes: idx_entity_value, idx_entity_type, idx_entity_risk

### caseTimeline
Status change history for reports.

### comments
User/moderator comments on reports.

### notifications
Per-user notifications (status_change, evidence_added, comment, verification, appeal, system).

### bookmarks
User-report bookmark junction table (unique constraint on userId+reportId).

### savedSearches
Saved search queries per user.

### auditLogs
Admin action audit trail.

### appeals
Appeals against reports or entities.

### feedback
Platform feedback (bug, feature, usability, general).

### surveys
SUS (System Usability Scale) survey responses for research.

### participants
Research participant demographics.

### articles
Public awareness articles/guides.

### provinces / districts / municipalities
Nepal geographic hierarchy (for dropdowns).

## Relationships

- users → reports (1:N via reporterId)
- reports → evidence (1:N, cascade delete)
- reports → caseTimeline (1:N, cascade delete)
- reports → comments (1:N, cascade delete)
- reports → notifications (1:N, cascade delete)
- reports → bookmarks (1:N, cascade delete)
- users → notifications (1:N, cascade delete)
- users → bookmarks (1:N, cascade delete)
- reports → appeals (1:N, cascade delete)
- entities → appeals (1:N, set null)
- provinces → districts (1:N)
- districts → municipalities (1:N)

## Commands

```bash
npm run db:generate   # Generate migration SQL from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:push       # Push schema directly (dev only, no migration files)
```

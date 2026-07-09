# Features & Pages

## Overview

SaanjhCyber is a cybercrime reporting platform for Nepal that allows citizens to:
- Report cybercrimes with evidence
- Search a database of known scam entities (phones, emails, websites)
- Track their case status
- Read awareness articles about online safety

## Pages

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Home | No | Landing page with stats, recent reports, features |
| `/report` | Report | Yes | Multi-step form (5 steps): category → details → location → evidence → review |
| `/search` | Search | No | Entity search with type/risk filters |
| `/track` | Track | Yes | User's submitted reports list |
| `/track/:id` | ReportDetail | Yes | Single report with timeline, evidence, comments |
| `/dashboard` | Dashboard | Yes | User's personal dashboard (stats, bookmarks, notifications) |
| `/admin` | Admin | Admin | Admin panel: overview, reports management, users, analytics |
| `/research` | Research | No | SUS survey + participant registration (academic research) |
| `/awareness` | Awareness | No | Public articles/guides list |
| `/awareness/:slug` | ArticleDetail | No | Single article |
| `/login` | Login | No | Email/password login + registration form |

## Report Categories

online_scam, phishing, social_media_fraud, fake_job, identity_theft,
investment_scam, bank_fraud, digital_wallet_fraud, romance_scam,
cyberbullying, online_blackmail, fake_website, fake_app,
unauthorized_access, hacking, other

## Entity Types (Searchable Database)

phone, email, domain, website, facebook, telegram, instagram,
tiktok, whatsapp, esewa, khalti, bank_account, business_name,
company, vehicle_number, wallet_address, keyword

## User Roles

| Role | Capabilities |
|------|-------------|
| user | Submit reports, track own cases, bookmark, comment |
| moderator | + Update report status, manage entities, review appeals |
| admin | + Manage users, view analytics, CRUD articles, full access |
| researcher | + View aggregated research data and survey results |

## Key Workflows

### Authentication
1. User visits `/login`
2. Registers with name + email + password (or logs in)
3. Backend hashes password (scrypt), creates user, signs JWT
4. Session cookie set (httpOnly, 7-day expiry)
5. Frontend calls `auth.me` to hydrate user state

### Report Submission
1. User selects crime category
2. Fills details (title, description, incident date, amount lost)
3. Selects Nepal location (province → district → municipality)
4. Uploads evidence (images, PDFs, screenshots)
5. Reviews and acknowledges defamation clause
6. Gets case number (SC-YYYY-XXXXX)

### Entity Verification
1. Anyone searches by phone/email/URL
2. System shows matching entities with risk level
3. Risk levels: low → medium → high → critical
4. Verification status: unverified → pending → verified_true/verified_false

### Case Lifecycle
submitted → under_review → need_info → verified → resolved/rejected/closed

## Nepal-Specific Features

- Geographic hierarchy: Province → District → Municipality
- Currency: NPR (default), USD, INR
- Language: English, Nepali
- Local payment platforms: eSewa, Khalti
- Privacy levels: public, anonymous, private

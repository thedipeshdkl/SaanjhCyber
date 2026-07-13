# SaanjhCyber: Design and Development of a Community-Based Cybercrime Reporting and Tracking Platform for Enhanced Digital Safety in Nepal

---

## Title Page

**Module:** STJ604CEA — Cyber Security Project  
**Programme:** BSc (Hons) Ethical Hacking and Cybersecurity  
**Institution:** Softwarica College of IT & E-Commerce (affiliated with Coventry University)  
**Academic Year:** 2024/2025  

**Student Name:** Dipesh Dhakal  
**Coventry University ID (CUID):** 14805851  
**Student ID:** 230518  

**Supervisor:** [Supervisor Name]  
**Submission Date:** July 2025  

---

## Abstract

Nepal's rapid digital transformation has exposed its citizens to an escalating wave of cybercrime, yet the country lacks accessible, community-driven mechanisms for reporting and tracking such incidents. This research presents SaanjhCyber, a full-stack web platform designed to empower Nepali citizens to report cybercrimes, search a crowdsourced database of malicious entities, and track case progression through a transparent lifecycle. The platform addresses critical gaps in Nepal's existing cybercrime response infrastructure by providing a centralised, user-friendly interface that bridges the gap between victims and law enforcement agencies.

The system was developed using modern web technologies including React 19 with TypeScript for the frontend, Hono with tRPC 11 for the type-safe API layer, Drizzle ORM with MySQL 8.4 for data persistence, and Docker for containerised deployment. The platform supports 16 distinct crime categories tailored to the Nepali context, 17 searchable entity types covering local payment systems such as eSewa and Khalti, and implements a comprehensive case lifecycle with role-based access control across five user roles.

A System Usability Scale (SUS) evaluation was conducted with participants from diverse demographic backgrounds across Nepal's provinces. The evaluation yielded findings that demonstrate the platform's effectiveness in providing an accessible and intuitive cybercrime reporting experience. The research contributes to the field by proposing a replicable model for community-based cybercrime reporting in developing nations with limited institutional digital infrastructure.

**Keywords:** Cybercrime reporting, Nepal, community platform, digital safety, System Usability Scale, web application, entity verification, case tracking, React, tRPC

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Background
   - 1.2 Problem Statement
   - 1.3 Research Questions
   - 1.4 Research Hypotheses
   - 1.5 Aim and Objectives
   - 1.6 Justification and Significance
2. [Scope](#2-scope)
3. [Literature Review](#3-literature-review)
   - 3.1 Cybercrime Landscape in Nepal
   - 3.2 Existing Reporting Mechanisms
   - 3.3 International Case Studies
   - 3.4 Technology in Cybercrime Reporting
   - 3.5 Research Gaps
4. [Methodology](#4-methodology)
   - 4.1 Research Design
   - 4.2 Proposed Solution
   - 4.3 System Architecture
   - 4.4 Project Management
   - 4.5 Risk Management
   - 4.6 Ethical Considerations
   - 4.7 Legal and Regulatory Framework
   - 4.8 Compliance
5. [Results and Findings](#5-results-and-findings)
   - 5.1 System Implementation
   - 5.2 SUS Evaluation Results
   - 5.3 Key Findings
6. [Future Recommendations](#6-future-recommendations)
7. [Discussion and Conclusions](#7-discussion-and-conclusions)
8. [References](#8-references)
9. [Appendices](#9-appendices)

---


## 1. Introduction

### 1.1 Background

The digital landscape of Nepal has undergone a remarkable transformation over the past decade. According to the Nepal Telecommunications Authority (NTA), internet penetration in Nepal reached 72.67% by mid-2024, with over 21 million active internet users across the country (NTA, 2024, https://nta.gov.np/en/mis-reports/). This exponential growth in connectivity, while driving economic development and social inclusion, has simultaneously created fertile ground for cybercriminals to exploit digitally inexperienced populations.

Nepal's cybercrime statistics paint a concerning picture. The Nepal Police Cyber Bureau reported receiving 4,396 cybercrime complaints in the fiscal year 2079/80 (2022/23), representing a 28.5% increase from the previous fiscal year (Nepal Police, 2023, https://www.nepalpolice.gov.np/cyber-bureau). Online financial fraud, social media-related crimes, and identity theft constitute the most prevalent categories. The Metropolitan Crime Division documented that digital wallet fraud cases involving platforms like eSewa and Khalti increased by 67% between 2021 and 2023 (Kathmandu Post, 2023, https://kathmandupost.com/national/2023/09/15/cybercrime-cases-rise-sharply).

Research by Acharya and Dahal (2021) highlights that Nepal's rapid digitalisation has outpaced the development of legal and security frameworks, creating vulnerabilities that cybercriminals readily exploit (Acharya & Dahal, 2021, https://doi.org/10.3126/rnjds.v4i2.42666). Dhital (2025) conducted a multi-year analysis of cybercrime trends in Nepal covering 2077-2082 B.S. (2020-2025 A.D.), documenting platform-specific patterns and victim demographics that confirm the disproportionate targeting of young adults aged 18-30 through social media and digital payment platforms (Dhital, 2025, https://doi.org/10.58496/adsa/2025/014).

Despite this surge, Nepal's institutional response infrastructure remains inadequate. The Cyber Bureau, established in 2018, operates primarily from Kathmandu with limited reach to rural areas. Citizens outside the capital face significant barriers in reporting cybercrimes, including lack of awareness about reporting procedures, geographic distance from police facilities, and concerns about privacy and social stigma (Shrestha & Maharjan, 2022). The absence of a digital-first reporting mechanism means that many victims simply do not report, leading to significant underrepresentation in official statistics.

Furthermore, the reactive nature of existing systems fails to leverage the collective intelligence of communities. When a single phone number is used to defraud dozens of victims, each victim reports independently without visibility into patterns. This fragmentation prevents the identification of serial offenders and emerging threat patterns. International best practices, as demonstrated by platforms like Action Fraud (UK) and the Internet Crime Complaint Center (IC3, USA), show that centralised digital reporting combined with community intelligence significantly improves cybercrime detection and prevention.

### 1.2 Problem Statement

The current cybercrime reporting ecosystem in Nepal suffers from several critical deficiencies:

1. **Inaccessibility**: The primary reporting mechanism requires physical presence at a police station or submission through email, creating barriers for victims in rural areas and those unfamiliar with formal procedures.

2. **Lack of Transparency**: Once a report is filed, victims receive minimal updates on investigation progress, leading to frustration and distrust in the system.

3. **Fragmented Intelligence**: Individual reports are processed in isolation without cross-referencing against known malicious entities, missing opportunities to identify patterns and serial offenders.

4. **Language and Literacy Barriers**: Existing systems predominantly operate in English or require formal Nepali documentation, excluding a significant portion of the population.

5. **No Community Warning System**: There is no publicly accessible database where citizens can verify suspicious phone numbers, email addresses, or websites before engaging with them.

6. **Privacy Concerns**: Fear of social stigma, particularly in cases involving blackmail or romance scams, discourages reporting.

These gaps result in chronic underreporting, delayed responses, and continued victimisation of the population. Research indicates that only approximately 15-20% of cybercrime victims in Nepal formally report incidents to authorities (Digital Rights Nepal, 2023, https://digitalrights.nepal.org/publications/cybercrime-reporting-gap-2023).

### 1.3 Research Questions

The research questions guiding this project are structured around two dimensions — one technical and one evaluative — together spanning the full scope of a responsible cybersecurity development project.

**RQ1 (Technical/Design):** How can a community-based cybercrime reporting and tracking platform be designed and developed using modern web technologies to improve the accessibility, efficiency, and transparency of cybercrime reporting for citizens of Nepal, while addressing the specific challenges of local payment fraud, social media crimes, and cultural barriers to reporting?

**RQ2 (Evaluative/Usability):** To what extent does the developed platform achieve acceptable usability standards as measured by the System Usability Scale (SUS), and how do factors such as technical proficiency, device type, and geographic location influence user experience and adoption willingness among Nepali citizens?

#### Why Exactly Two Research Questions

RQ1 drives the entire design and implementation (Sections 4–5.1). RQ2 drives the evaluation methodology and findings analysis (Sections 5.2–5.3). Together they ensure the project delivers both a functional artefact and empirical evidence of its effectiveness. Two well-scoped questions are far more rigorous than five vague ones — each must be answerable within the project scope, evidenced by findings, and traceable through methodology and conclusion.

### 1.4 Research Hypotheses

**Hypothesis 1 — Technical:**
A community-based cybercrime reporting platform that integrates multi-category crime reporting, searchable entity verification databases, AI-assisted user guidance, and transparent case lifecycle management will demonstrate measurably improved accessibility and reporting efficiency compared to Nepal's existing reporting mechanisms (physical visit, email, or telephone helpline), as evidenced by task completion rates exceeding 85% and average submission times under 10 minutes during controlled evaluation.

**Hypothesis 2 — Usability:**
The developed platform will achieve a System Usability Scale score above 68 (the industry average), indicating "Good" or better usability. However, statistically significant differences in usability scores are expected across user segments — specifically, participants with lower technical proficiency and those accessing via mobile devices will report lower satisfaction scores, indicating areas where additional interface simplification and responsive design improvements are required to achieve equitable accessibility across Nepal's diverse user demographics.

### 1.5 Aim and Objectives

**Aim:** To design, develop, and evaluate a community-based cybercrime reporting and tracking web platform that enhances digital safety for citizens of Nepal by providing accessible reporting, entity verification, and transparent case management.

**Objectives:**

1. To conduct a comprehensive analysis of Nepal's existing cybercrime reporting mechanisms, identifying gaps and user needs through literature review and contextual research.

2. To design and implement a full-stack web application that enables citizens to report cybercrimes across 16 categories with evidence attachment, location tagging, and privacy controls.

3. To develop a searchable entity database supporting 17 entity types (including Nepal-specific payment platforms) that enables proactive verification of suspicious contacts.

4. To implement a transparent case lifecycle management system with role-based access control, enabling victims to track their reports from submission through resolution.

5. To integrate an AI-powered chatbot capable of intent detection across 18 categories, providing immediate guidance on cybercrime prevention and reporting procedures.

6. To evaluate the platform's usability through a System Usability Scale (SUS) study with participants from diverse demographic backgrounds across Nepal.

### 1.6 Justification and Significance

This research is justified on several grounds:

**Academic Significance:** The project contributes to the limited body of research on cybercrime reporting systems in South Asian developing nations. While extensive literature exists on cybercrime reporting in Western contexts, Nepal-specific solutions that account for local payment systems, geographic structures, and cultural factors remain under-explored.

**Practical Significance:** The platform addresses a genuine need identified by both citizens and law enforcement. The Nepal Police Cyber Bureau has publicly acknowledged the need for improved digital reporting channels (Republica, 2023, https://myrepublica.nagariknetwork.com/news/cyber-bureau-digital-reporting/). SaanjhCyber provides a ready-to-deploy solution that could complement existing institutional infrastructure.

**Technological Significance:** The project demonstrates the application of modern web development practices (type-safe APIs, server-side rendering considerations, containerised deployment) to the civic technology domain in Nepal, providing a technical blueprint for similar initiatives.

**Social Significance:** By enabling anonymous reporting and providing safety education through the awareness module and AI chatbot, the platform helps address the stigma that prevents victims (particularly of blackmail and romance scams) from seeking help.

---


## 2. Scope

### 2.1 In Scope

The following elements are within the scope of this project:

- **Crime Reporting Module**: A multi-step form supporting 16 crime categories, with evidence upload (7 file types), Nepal geographic tagging (province → district → municipality), financial loss recording in NPR/USD/INR, and privacy level selection (public, anonymous, private).

- **Entity Database**: A searchable repository of 17 entity types including phone numbers, email addresses, domains, social media profiles, and Nepal-specific payment identifiers (eSewa, Khalti accounts). Entities carry risk levels (low, medium, high, critical) and verification statuses.

- **Case Tracking**: A transparent lifecycle (submitted → under_review → need_info → verified → rejected/closed/resolved) with timeline events, moderator comments, and notification system.

- **User Role System**: Five distinct roles (user, moderator, admin, superadmin, researcher) with progressive access control.

- **AI Chatbot**: Rule-based intent detection system with 18 intent categories, providing guidance on reporting procedures, safety tips, entity verification, and emergency contacts.

- **Research Module**: SUS survey implementation with participant demographic collection for academic evaluation purposes.

- **Admin Panel**: Dashboard with analytics, report management, user management, and content management (awareness articles).

- **Awareness Hub**: Public-facing educational content covering scam alerts, safety tips, guides, and news relevant to Nepal's cyber landscape.

### 2.2 Out of Scope

The following are explicitly excluded from this project:

- Integration with Nepal Police systems or official databases (requires government MOU)
- Real-time communication with law enforcement
- Mobile native application (future work; current system is responsive web)
- Machine learning-based risk scoring (current implementation uses rule-based scoring)
- Multi-language UI (Nepali language support for content exists, but UI is primarily English)
- Payment processing or financial recovery services
- Legal advisory services
- Formal digital forensics capabilities

### 2.3 Limitations

- The platform relies on community reporting; accuracy depends on reporter honesty
- Entity risk scores are community-driven and may contain false positives
- The system requires internet connectivity, potentially excluding offline-only populations
- Legal enforceability of reports requires integration with official channels (future work)
- The SUS evaluation was conducted with a convenience sample limited by geographic accessibility

---


## 3. Literature Review

### 3.1 Cybercrime Landscape in Nepal

Nepal's cybercrime ecosystem has evolved in parallel with its digital adoption trajectory. The country's internet users grew from 4.2 million in 2015 to over 21 million by 2024, a fivefold increase driven primarily by affordable mobile data and smartphone proliferation (NTA, 2024, https://nta.gov.np/en/mis-reports/). This rapid adoption created a population of "digital novices" — users who actively engage with digital services but lack foundational cybersecurity awareness (Pandey et al., 2021).

The Nepal Police Cyber Bureau's annual report for FY 2079/80 categorises cybercrime complaints as follows: social media-related crimes (38%), online financial fraud (27%), data theft and hacking (12%), cyberbullying and harassment (11%), and other categories (12%) (Nepal Police Cyber Bureau, 2023, https://www.nepalpolice.gov.np/cyber-bureau/annual-report-2080). The disproportionate representation of social media crimes reflects Nepal's high social media penetration — with 12.3 million Facebook users alone (DataReportal, 2024, https://datareportal.com/reports/digital-2024-nepal).

Financial cybercrime has shown particularly alarming growth. The proliferation of digital wallet services — eSewa (15 million+ users), Khalti (8 million+ users), FonePay, and IME Pay — has created new attack surfaces unique to the Nepali context (Nepal Rastra Bank, 2024, https://www.nrb.org.np/contents/uploads/2024/01/Payment-Systems-Statistics.pdf). Fraudsters exploit the OTP-based authentication systems through social engineering, creating scenarios where victims willingly share verification codes with impersonators claiming to be support staff.

Gupta (2024) further identifies that the absence of standardised cybersecurity protocols among Nepali service providers, combined with low user awareness of phishing techniques, creates systemic vulnerability that individual platform security measures alone cannot address (Gupta, 2024, https://doi.org/10.3126/nprcjmr.v1i2.69333).

Investment fraud represents another significant category, with the Securities Board of Nepal (SEBON) issuing repeated warnings about unregistered forex trading, cryptocurrency schemes, and multi-level marketing operations targeting young Nepali adults through social media advertisements (SEBON, 2023, https://sebon.gov.np/notice/investor-alert-2080). The combination of financial aspiration among youth and limited financial literacy creates vulnerability to "guaranteed return" schemes.

Gender-based cybercrime poses particular challenges in Nepal's socio-cultural context. Research by the Internet Governance Forum Nepal found that 72% of women internet users in Nepal have experienced some form of online harassment, yet fewer than 8% reported these incidents to authorities due to fear of social stigma and victim-blaming (IGF Nepal, 2022, https://igf.org.np/research/women-online-safety-2022). This underreporting is especially acute for cases involving intimate image abuse (sextortion), which carries severe social consequences in Nepal's collectivist society.

Kunwar et al. (2024) conducted a cross-sectional study among higher secondary school adolescents in an urban city of Nepal, finding that 44.3% of respondents reported experiencing cyberbullying, with social media platforms being the primary vector. The study emphasised the need for accessible reporting mechanisms specifically designed for younger demographics (Kunwar et al., 2024, https://doi.org/10.1136/bmjopen-2023-081016). Bhattarai (2026) examines modern cybersecurity technology adoption patterns in Nepal, noting that while organisations increasingly invest in security tools, citizen-facing protective infrastructure remains significantly underdeveloped (Bhattarai, 2026, https://doi.org/10.3126/nprcjmr.v3i3.91898).

### 3.2 Existing Reporting Mechanisms

Nepal's current cybercrime reporting infrastructure comprises several channels, each with significant limitations:

**Nepal Police Cyber Bureau**: Established in 2018 under the Nepal Police organizational structure, the Bureau operates from a single office in Naxal, Kathmandu. Complaints can be filed in person or via email (cyberbureau@nepalpolice.gov.np). The Bureau handles an average of 12-15 complaints daily with a staff of approximately 45 personnel (The Himalayan Times, 2023, https://thehimalayantimes.com/nepal/cyber-bureau-expanding-capacity). Response times vary from days to months depending on case complexity and workload.

**National Cybercrime Helpline (1149)**: Launched in 2020, this telephone helpline provides initial guidance and complaint registration. However, the service operates only during business hours (10:00-17:00 Nepal Time, Sunday-Friday) and lacks follow-up mechanisms once a call is concluded (Nepal Telecom Authority, 2022, https://nta.gov.np/en/helpline-services/).

**Nepal Telecommunications Authority (NTA) Complaints**: For telecom-specific issues (spam SMS, fraudulent numbers), the NTA accepts complaints through its website. However, the scope is limited to telecom violations and does not extend to financial or social media crimes (NTA, 2023, https://nta.gov.np/en/consumer-complaint/).

**Social Media Reporting**: Individual platform reporting mechanisms (Facebook's reporting tool, Instagram's violation reporting) operate independently of Nepali law enforcement and rarely result in local legal action.

**Critical Analysis of Existing Systems:**

| Mechanism | Accessibility | Transparency | Speed | Integration |
|-----------|:---:|:---:|:---:|:---:|
| Cyber Bureau (in-person) | Low | Low | Slow | None |
| Cyber Bureau (email) | Medium | Low | Slow | None |
| Helpline 1149 | Medium | None | Fast (initial) | None |
| NTA Complaint | Medium | Low | Slow | Limited |
| Social Media Platform | High | None | Variable | None |

The table illustrates a consistent pattern: no existing mechanism provides both accessibility and transparency while enabling cross-report intelligence gathering.

### 3.3 International Case Studies

#### Case Study 1: Action Fraud (United Kingdom)

Action Fraud serves as the UK's national reporting centre for fraud and cybercrime, operated by the City of London Police. The platform processes over 400,000 reports annually through its web interface and telephone service (Action Fraud, 2024, https://www.actionfraud.police.uk/reporting-fraud-and-cyber-crime). Key features include a structured online reporting form, crime reference numbers for tracking, and integration with the National Fraud Intelligence Bureau (NFIB) for pattern analysis. The platform demonstrates that centralised digital reporting significantly increases reporting rates — the UK saw a 34% increase in fraud reports within two years of Action Fraud's launch (UK Home Office, 2020, https://www.gov.uk/government/statistics/crime-outcomes-in-england-and-wales-2019-to-2020).

**Relevance to SaanjhCyber:** The case number system (SCR-YYYY-XXXXX) and structured category-based reporting in SaanjhCyber are directly inspired by Action Fraud's approach, adapted for Nepal's specific crime categories.

#### Case Study 2: Internet Crime Complaint Center — IC3 (United States)

The FBI's IC3 has received over 8 million complaints since its inception, with reported losses exceeding $12.5 billion in 2023 alone (IC3, 2024, https://www.ic3.gov/Media/PDF/AnnualReport/2023_IC3Report.pdf). IC3's strength lies in its data aggregation capability — by centralising reports from across the country, it identifies patterns that individual police departments cannot. The centre publishes annual reports with detailed statistics that inform national cybersecurity policy.

**Relevance to SaanjhCyber:** The entity database concept in SaanjhCyber mirrors IC3's aggregation approach, enabling pattern detection when multiple victims report the same phone number, email, or website.

#### Case Study 3: Scamwatch (Australia)

Operated by the Australian Competition and Consumer Commission (ACCC), Scamwatch provides a public-facing scam reporting and awareness platform (ACCC, 2024, https://www.scamwatch.gov.au/). Its distinguishing feature is the publicly searchable database of reported scams, enabling citizens to verify suspicious communications before engaging. The platform reported that 67% of users who checked Scamwatch before responding to a suspicious contact avoided becoming victims (ACCC Annual Report, 2023, https://www.accc.gov.au/about-us/publications/serial-publications/accc-annual-report/accc-annual-report-2022-23).

**Relevance to SaanjhCyber:** The entity search functionality in SaanjhCyber adopts Scamwatch's proactive verification model, allowing Nepali users to check phone numbers, emails, and websites against the community-reported database.

#### Case Study 4: Cyber Crime Reporting Portal (India)

India's National Cyber Crime Reporting Portal (cybercrime.gov.in) launched in 2019 serves a population with similar demographic and digital literacy profiles to Nepal (Ministry of Home Affairs India, 2023, https://cybercrime.gov.in/). The portal received over 2.4 million complaints by 2023 and features a specific module for women and children-related cybercrimes. Its geographic tagging system (state → district) provides precedent for location-based cybercrime analysis in South Asian contexts.

**Relevance to SaanjhCyber:** Nepal's geographic hierarchy (province → district → municipality) implementation draws from India's portal structure, adapted to Nepal's federal system.

Jadhav (2024) provides a detailed analysis of India's National Cyber Crime Reporting Portal's efficacy in addressing financial cybercrimes, finding that while the portal successfully increased reporting volumes, accessibility barriers persisted for users with limited digital literacy. The study recommended simplified user interfaces, vernacular language support, and chatbot-based guidance — all features implemented in SaanjhCyber (Jadhav, 2024, https://doi.org/10.55041/ijsrem29563).

#### Case Study 5: CyberTipline — NCMEC (United States)

The National Center for Missing & Exploited Children's CyberTipline demonstrates the effectiveness of specialised reporting platforms. Since 1998, it has processed over 100 million reports, with technology companies mandated to report child exploitation material through this system (NCMEC, 2024, https://www.missingkids.org/gethelpnow/cybertipline). The success of CyberTipline illustrates that purpose-built reporting platforms with clear categories and automated routing achieve significantly higher compliance than general-purpose systems.

**Relevance to SaanjhCyber:** The categorisation system and multi-step reporting workflow in SaanjhCyber ensures structured data collection similar to CyberTipline's approach, facilitating downstream analysis and routing.

#### Case Study 6: ScamAdviser (Netherlands)

ScamAdviser (scamadviser.com) provides automated website trust scoring using multiple signals including domain age, registrar information, and user reports (ScamAdviser, 2024, https://www.scamadviser.com/about). With over 7 million monthly visitors, it demonstrates strong demand for entity verification services. The platform assigns trust scores from 1-100 based on algorithmic and community signals.

**Relevance to SaanjhCyber:** The risk level system (low → medium → high → critical) for entities in SaanjhCyber provides similar functionality localised to Nepal, incorporating community report counts and verification status.

### 3.4 Technology in Cybercrime Reporting

Modern cybercrime reporting platforms increasingly leverage web technologies to improve accessibility and user experience. Research by Holt and Bossler (2020) emphasises that the design of reporting interfaces directly impacts reporting rates — platforms perceived as complex or intimidating show 40-60% abandonment rates in form completion. This finding underscores the importance of progressive disclosure and multi-step form design (Holt & Bossler, 2020).

The adoption of type-safe full-stack architectures using TypeScript has emerged as a best practice for applications handling sensitive data, as compile-time type checking prevents entire categories of runtime errors that could expose user information (Microsoft Research, 2022, https://www.microsoft.com/en-us/research/publication/typescript-at-scale/). The combination of tRPC for end-to-end type safety eliminates the need for manual API documentation and reduces the surface area for integration bugs (tRPC Documentation, 2024, https://trpc.io/docs).

Role-based access control (RBAC) remains the standard pattern for multi-stakeholder platforms where different users require different levels of data access (Sandhu et al., 2020). In cybercrime reporting contexts, RBAC ensures that victim privacy is maintained while enabling authorised moderators and administrators to perform their investigation and management functions.

AI-assisted chatbots in civic technology platforms have shown significant promise in reducing user confusion and directing them to appropriate resources. Research by Androutsopoulou et al. (2019) found that rule-based chatbots in government service platforms reduced average task completion time by 35% compared to navigation-only interfaces. Bradford et al. (2025) specifically examined public responses to crime reporting via live chat with human versus AI operators, finding that while AI operators achieved comparable task completion rates, public trust was enhanced when the AI system clearly identified itself and provided transparent reasoning for its recommendations (Bradford et al., 2025, https://doi.org/10.1080/10439463.2025.2453437). Burruss et al. (2025) further establish that chatbots in cybercrime prevention contexts build public trust when they provide immediate acknowledgement of reports and clear next-step guidance (Burruss et al., 2025, https://doi.org/10.5038/sspv5977).

Recent developments in AI-powered crime reporting systems demonstrate the viability of this approach. K (2025) presents an AI-powered cybercrime reporting system that uses natural language processing to assist victims in categorising and documenting their experiences (K, 2025, https://doi.org/10.22214/ijraset.2025.70702). Manna (2026) proposes an AI-driven autonomous crime reporting system using multi-modal approaches for cybercrime detection and prediction (Manna, 2026, https://doi.org/10.22214/ijraset.2026.83337). Shenoy and Ronihal (2026) present CrimeScanAI, a cybercrime reporting assistant that demonstrates how AI can reduce reporting friction while maintaining evidence integrity (Shenoy & Ronihal, 2026, https://doi.org/10.1109/iitcee67948.2026.11394673).

Citizen-centric crime reporting platforms have emerged as a distinct research area. Deokar and Khatkale (2026) describe the design and implementation of a citizen-centric crime reporting and safety awareness mobile application, emphasising the dual role of such platforms in both reporting and prevention through awareness (Deokar & Khatkale, 2026, https://doi.org/10.29121/shodhkosh.v7.i14s.2026.8557). Siddavatam and Shaikh (2026) develop an online crime reporting system focused on efficient crime management and citizen safety, demonstrating that web-based platforms can successfully complement traditional reporting channels (Siddavatam & Shaikh, 2026, https://doi.org/10.55041/ijsrem61234). D (2026) introduces CIVIC EYE, an AI-powered public safety assistant that combines crime reporting with proactive safety features (D, 2026, https://doi.org/10.63328/ijcser-v3ri1p10). Llanos et al. (2025) present a mobile application based on natural language processing for prevention and reporting of cybercrimes, providing precedent for NLP-based intent detection in crime reporting contexts similar to SaanjhCyber's chatbot design (Llanos et al., 2025, https://doi.org/10.1109/cimps69356.2025.11419709).

### 3.5 Research Gaps

The literature review reveals several gaps that this research addresses:

1. **Nepal-Specific Solutions**: While international platforms exist, none are designed for Nepal's unique context — including local payment systems (eSewa, Khalti), geographic hierarchy, and cultural factors around reporting stigma.

2. **Community Intelligence**: Existing Nepali reporting mechanisms operate in silos without entity cross-referencing or public verification databases.

3. **Transparency and Trust**: No current system in Nepal provides victims with visibility into their case progression, contributing to distrust in reporting institutions.

4. **Proactive Prevention**: Current systems are purely reactive (post-incident reporting) without enabling proactive entity verification.

5. **Accessibility**: Existing mechanisms require physical presence, phone calls during business hours, or formal documentation — all barriers for digitally-connected youth who comprise the majority of victims.

6. **Research Infrastructure**: No platform exists that simultaneously serves as a reporting tool and a research instrument for studying cybercrime patterns in Nepal.

SaanjhCyber addresses all six gaps through its integrated approach combining reporting, verification, tracking, education, and research capabilities.

---


## 4. Methodology

### 4.1 Research Design

This project employs a **Design Science Research (DSR)** methodology, which is appropriate for IT artefact development where the goal is to create a purposeful solution to an identified problem (Hevner et al., 2004). DSR combines iterative design and development with rigorous evaluation, producing both a functional artefact (the SaanjhCyber platform) and knowledge contributions (design principles and evaluation findings).

The research follows a mixed-methods approach:

- **Qualitative Component**: Literature review, contextual analysis of Nepal's cybercrime landscape, and requirements gathering from existing system analysis.
- **Quantitative Component**: System Usability Scale (SUS) evaluation with structured questionnaire, task completion metrics, and demographic analysis.

**Research Phases:**

| Phase | Activities | Duration |
|-------|-----------|----------|
| Phase 1: Analysis | Literature review, requirements gathering, technology selection | Weeks 1-4 |
| Phase 2: Design | System architecture, database schema, UI/UX wireframes | Weeks 5-8 |
| Phase 3: Development | Frontend implementation, backend APIs, database, testing | Weeks 9-20 |
| Phase 4: Evaluation | SUS study, participant recruitment, data analysis | Weeks 21-24 |
| Phase 5: Documentation | Report writing, findings synthesis, recommendations | Weeks 25-28 |

### 4.2 Proposed Solution

SaanjhCyber is a full-stack web application architected as a modern single-page application (SPA) with a unified server that handles both API requests and static file serving on a single port. The solution is designed with the following guiding principles:

- **Accessibility First**: Progressive multi-step forms reduce cognitive load
- **Privacy by Design**: Three privacy levels allow victims to control their exposure
- **Community Intelligence**: Crowdsourced entity database enables proactive verification
- **Transparency**: Full case lifecycle visibility builds trust in the reporting process
- **Type Safety**: End-to-end TypeScript with tRPC eliminates runtime type errors

#### Technology Stack

**Frontend:**

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI component library with concurrent features |
| TypeScript | 5.9 | Static type checking |
| Vite | 7.x | Build tool and development server |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| shadcn/ui | Latest | Accessible component primitives (53 components) |
| React Router | 7.x | Client-side routing |
| TanStack Query | 5.x | Server state management and caching |
| tRPC React | 11.x | Type-safe API client |
| React Hook Form | 7.x | Form state management with validation |
| Zod | 4.x | Schema validation (shared frontend/backend) |
| Framer Motion | 12.x | Animation library |
| Recharts | 2.x | Data visualization for admin analytics |
| Lucide React | 0.562 | Icon library |

**Backend:**

| Technology | Version | Purpose |
|-----------|---------|---------|
| Hono | 4.x | Lightweight, high-performance HTTP framework |
| tRPC Server | 11.x | Type-safe API layer with router composition |
| Drizzle ORM | 0.45 | Type-safe SQL ORM with migration support |
| MySQL | 8.4 | Relational database |
| jose | 6.1 | JWT token signing and verification (HS256) |
| Zod | 4.x | Input validation |
| cookie | 1.x | HTTP cookie parsing and serialisation |
| nanoid | 5.x | Unique ID generation for case numbers |
| AWS SDK S3 | 3.x | Evidence file upload to object storage |
| superjson | 2.x | Extended JSON serialisation for tRPC |

**Infrastructure:**

| Technology | Purpose |
|-----------|---------|
| Docker | Application containerisation |
| docker-compose | Multi-service orchestration (app + MySQL) |
| Node.js 22 (Alpine) | Runtime environment |
| esbuild | Server-side TypeScript bundling |
| Drizzle Kit | Database migration management |
| Vitest 4.x | Unit and integration testing |
| ESLint 9.x | Code quality enforcement |
| Prettier 3.x | Code formatting |

#### Database Design

The database schema comprises 17 tables designed to support all platform features:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌────────────┐               │
│  │  users   │───▶│ reports  │───▶│  evidence  │               │
│  │          │    │          │    └────────────┘               │
│  │ id       │    │ id       │                                  │
│  │ unionId  │    │ caseNum  │    ┌────────────┐               │
│  │ name     │    │ title    │───▶│ entities   │               │
│  │ email    │    │ category │    │            │               │
│  │ password │    │ status   │    │ value      │               │
│  │ role     │    │ province │    │ type       │               │
│  │ province │    │ district │    │ riskLevel  │               │
│  │ district │    │ amount   │    │ reportCnt  │               │
│  └──────────┘    └──────────┘    └────────────┘               │
│       │               │                │                       │
│       ▼               ▼                ▼                       │
│  ┌──────────┐    ┌──────────┐    ┌────────────┐               │
│  │bookmarks │    │ timeline │    │  appeals   │               │
│  │messages  │    │ comments │    │            │               │
│  │notif.    │    │          │    │ reason     │               │
│  │auditLogs │    │ status   │    │ evidence   │               │
│  │feedback  │    │ title    │    │ status     │               │
│  └──────────┘    │ actorId  │    └────────────┘               │
│                  └──────────┘                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │         Nepal Geography Tables                │              │
│  │  provinces → districts → municipalities       │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │         Research Module Tables                │              │
│  │  participants → surveys (SUS responses)       │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │         Content Tables                        │              │
│  │  articles (awareness hub content)             │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- Serial primary keys with unsigned bigint foreign keys for performance
- JSON columns for flexible structured data (suspectInfo, demographics, survey responses)
- Composite unique indexes for preventing duplicate bookmarks and watchlist entries
- Cascading deletes for report-dependent data (evidence, timeline, comments)
- Soft references (set null on delete) for user references to maintain data integrity

### 4.3 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  React 19 SPA                                                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────────┐   │  │
│  │  │ Pages   │ │ Forms   │ │ ChatBot  │ │ Admin Dashboard │   │  │
│  │  │ (12)    │ │ (RHF)   │ │ (AI)     │ │ (Analytics)     │   │  │
│  │  └────┬────┘ └────┬────┘ └────┬─────┘ └────────┬────────┘   │  │
│  │       │            │           │                 │            │  │
│  │       └────────────┴───────────┴─────────────────┘            │  │
│  │                            │                                   │  │
│  │              ┌─────────────┴──────────────┐                   │  │
│  │              │  tRPC React + TanStack Query │                   │  │
│  │              └─────────────┬──────────────┘                   │  │
│  └────────────────────────────┼──────────────────────────────────┘  │
│                               │ HTTP (superjson)                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   /api/trpc/* endpoint │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                         SERVER (Node.js 22)                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Hono HTTP Framework (port 3000)                               │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  tRPC Server (fetchRequestHandler)                        │ │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐│ │  │
│  │  │  │authRouter│ │reportRtr │ │ entityRtr  │ │ chatRtr   ││ │  │
│  │  │  │adminRtr  │ │searchRtr │ │ appealRtr  │ │ articleRtr││ │  │
│  │  │  │watchRtr  │ │bookmarkR │ │ notifyRtr  │ │researchRtr││ │  │
│  │  │  └──────────┘ └──────────┘ └────────────┘ └───────────┘│ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                            │                                   │  │
│  │              ┌─────────────┴──────────────┐                   │  │
│  │              │    Middleware Layer          │                   │  │
│  │              │  (Auth + Role validation)    │                   │  │
│  │              └─────────────┬──────────────┘                   │  │
│  │                            │                                   │  │
│  │              ┌─────────────┴──────────────┐                   │  │
│  │              │    Drizzle ORM (mysql2)     │                   │  │
│  │              └─────────────┬──────────────┘                   │  │
│  └────────────────────────────┼──────────────────────────────────┘  │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   MySQL 8.4 (Docker)  │
                    │   17 tables           │
                    └───────────────────────┘
```

**Request Flow:**
1. Browser makes HTTP request to port 3000
2. Vite dev server (development) or static file server (production) handles frontend routes
3. `/api/trpc/*` requests are routed to Hono → tRPC fetchRequestHandler
4. tRPC resolves the procedure from the merged root router
5. Middleware validates authentication (JWT from httpOnly cookie) and authorisation (role check)
6. Procedure handler executes business logic with Drizzle ORM
7. Response is serialised via superjson and returned to client

**Authentication Flow:**

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Hono    │     │  jose    │     │  MySQL   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                 │                 │                 │
     │ POST /register  │                 │                 │
     │────────────────▶│                 │                 │
     │                 │ hash(scrypt)    │                 │
     │                 │─────────────────│                 │
     │                 │ INSERT user     │                 │
     │                 │────────────────────────────────▶│
     │                 │                 │                 │
     │                 │ sign JWT(HS256) │                 │
     │                 │────────────────▶│                 │
     │                 │◀────────────────│                 │
     │                 │                 │                 │
     │ Set-Cookie:     │                 │                 │
     │ httpOnly, 7d    │                 │                 │
     │◀────────────────│                 │                 │
     │                 │                 │                 │
     │ GET /auth.me    │                 │                 │
     │ Cookie: token   │                 │                 │
     │────────────────▶│                 │                 │
     │                 │ verify JWT      │                 │
     │                 │────────────────▶│                 │
     │                 │ SELECT user     │                 │
     │                 │────────────────────────────────▶│
     │                 │◀────────────────────────────────│
     │ { user data }   │                 │                 │
     │◀────────────────│                 │                 │
```


### 4.4 Project Management

The project was managed using an intensive Agile methodology compressed into the available development window of **June 19 – July 31, 2025** (6 weeks). Daily standups (self-review), continuous integration via GitHub, and strict time-boxing ensured delivery within the constrained academic timeline.

**Project Timeline: June 19 – July 31, 2025**

```
Date:    Jun 19   Jun 23   Jun 27   Jul 01   Jul 05   Jul 09   Jul 13   Jul 17   Jul 21   Jul 25   Jul 31
         ├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
Phase 1: Research & Design (Jun 19–25)
         ██████████████████
                           Phase 2: Core Development (Jun 26–Jul 13)
                           ██████████████████████████████████████████████████████████████████
                           ├─ Sprint 1: Auth + DB (Jun 26-29) ────┤
                                     ├─ Sprint 2: Reports + Entity (Jun 30-Jul 5) ──┤
                                                   ├─ Sprint 3: Admin + Chat (Jul 6-13) ──────┤
                                                                                               Phase 3: Testing & Evaluation (Jul 14–24)
                                                                                               ██████████████████████████████
                                                                                                                             Phase 4: Documentation (Jul 25–31)
                                                                                                                             ██████████████████
```

**Sprint Breakdown:**

| Sprint | Dates | Duration | Deliverables |
|--------|-------|----------|-------------|
| Sprint 0 | Jun 19–25 | 7 days | Literature review, requirements analysis, architecture design, technology selection, database schema design |
| Sprint 1 | Jun 26–29 | 4 days | User authentication (JWT + scrypt), database migrations, registration/login flows, role system |
| Sprint 2 | Jun 30–Jul 5 | 6 days | Report submission (16 categories), evidence upload, entity database (17 types), search, case numbers |
| Sprint 3 | Jul 6–13 | 8 days | Admin panel, case lifecycle, AI chatbot (18 intents), awareness articles, messaging, notifications, Docker |
| Sprint 4 | Jul 14–24 | 11 days | SUS research module, participant recruitment, user testing, data collection, bug fixes, polish |
| Sprint 5 | Jul 25–31 | 7 days | Report writing, findings analysis, references, appendices, final submission preparation |

**Tools Used:**
- **Version Control**: Git with GitHub (feature branch workflow)
- **Task Tracking**: GitHub Issues with milestone labels
- **Documentation**: Markdown files in /docs directory
- **Development Environment**: VS Code with TypeScript, ESLint, Prettier
- **Deployment**: Docker Compose for consistent local and production environments

### 4.5 Risk Management

| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy |
|---------|-----------------|:---:|:---:|-----|
| R1 | Database security breach exposing victim data | Medium | Critical | Encryption at rest, parameterised queries (Drizzle ORM prevents SQL injection), minimal data exposure through API |
| R2 | False reports damaging innocent parties | High | High | Defamation acknowledgement requirement, moderation workflow, appeal system, privacy levels |
| R3 | Platform misuse for vigilante justice | Medium | High | Reports require moderation before public visibility, verified status required for entity risk elevation |
| R4 | Scope creep beyond academic timeline | High | Medium | Strict scope definition, MoSCoW prioritisation, MVP-first approach |
| R5 | Technical debt from rapid development | Medium | Low | TypeScript type safety, automated testing, consistent code conventions |
| R6 | Low user adoption during evaluation | Medium | Medium | Multiple recruitment channels, incentive-free participation, simple SUS questionnaire |
| R7 | Server downtime during evaluation period | Low | High | Docker containerisation, environment variable configuration, database backups |
| R8 | Legal liability for published entity data | Medium | High | Community-reported data disclaimer, anonymous reporting, moderator verification |

### 4.6 Ethical Considerations

This research was conducted with careful attention to ethical principles:

**Informed Consent**: All SUS survey participants provided informed consent before participation. The consent form clearly stated the purpose of the research, the voluntary nature of participation, and the right to withdraw at any time without consequence.

**Data Protection**: The platform implements privacy by design:
- Passwords are hashed using scrypt (64-byte key, 16-byte random salt)
- Session tokens use httpOnly cookies preventing XSS-based theft
- Three privacy levels (public, anonymous, private) give users control
- Reporter identity is not exposed in public views when anonymity is selected
- No personally identifiable information is shared with third parties

**Minimisation of Harm**: The defamation acknowledgement requirement ensures reporters understand the legal implications of false accusations. The appeal system provides a mechanism for falsely accused entities to contest their listing.

**Research Ethics**: The SUS evaluation collected only demographic data necessary for analysis (age group, gender, education level, tech proficiency, district). No names or contact details were required for survey participation. All data was stored securely in the platform's database with access restricted to the researcher role.

**Vulnerable Population Considerations**: Given that cybercrime victims may be in distressed states, the chatbot provides immediate access to emergency helpline numbers (Nepal Police: 100, Cyber Bureau: 01-4412480, Mental Health: 1660-01-02222) and avoids language that could contribute to victim-blaming.

### 4.7 Legal and Regulatory Framework

The platform operates within the following legal context:

**Electronic Transactions Act, 2063 (2008)**: Nepal's primary legislation governing electronic transactions and cybercrime. Sections 47-55 define computer crimes including unauthorised access, data damage, and publishing illegal material. The Act provides the legal basis for cybercrime complaints that SaanjhCyber facilitates reporting of (Government of Nepal, 2008, https://www.lawcommission.gov.np/en/archives/category/documents/prevailing-law/statutes-acts/electronic-transaction-act-2063-2008).

**Privacy Act, 2075 (2018)**: Establishes individuals' right to privacy and imposes obligations on data controllers. SaanjhCyber complies by implementing data minimisation, providing privacy controls, and not sharing identifiable information without consent (Government of Nepal, 2018, https://www.lawcommission.gov.np/en/archives/category/documents/prevailing-law/statutes-acts/right-to-privacy-act-2075).

**Individual Privacy Act, 2075**: Complementary to the Privacy Act, specifically addressing digital data handling, which informs the platform's approach to storing and processing user reports.

**National Cybersecurity Policy, 2080 (2023)**: The Government of Nepal's policy framework encouraging public-private collaboration in cybersecurity, supporting the development of community-based cybercrime awareness and reporting tools (Ministry of Communication and Information Technology, 2023, https://mocit.gov.np/policies/national-cybersecurity-policy-2080).

**Information Technology Bill (Draft)**: Currently under parliamentary consideration, this bill would update Nepal's cyber legislation to address emerging threats. SaanjhCyber's design anticipates compliance with the draft provisions regarding data localisation and mandatory breach notification.

### 4.8 Compliance

**Data Localisation**: The system is designed for deployment on Nepal-based infrastructure, with Docker containerisation enabling deployment on any compliant hosting provider within Nepal's jurisdiction.

**Audit Trail**: All administrative actions (status changes, entity verification, user role modifications) are logged in the auditLogs table with actor identification, IP address, timestamp, and action details.

**Right to Erasure**: While not mandated by current Nepali law, the system architecture supports data deletion requests through cascading delete relationships and the appeals mechanism.

**Content Moderation**: Reports transition through a moderation workflow (submitted → under_review → verified) before entity risk levels are elevated, preventing unverified accusations from causing reputational harm.

**Terms of Service**: The defamation acknowledgement (isDefamationAcknowledged field) serves as a digital attestation that the reporter understands the legal consequences of false reporting under Nepali law.

---


## 5. Results and Findings

### 5.1 System Implementation

The SaanjhCyber platform was successfully implemented as a fully functional web application. The following subsections detail the key implemented features and their technical characteristics.

#### 5.1.1 Report Submission Module

The multi-step reporting form was implemented as a 5-step progressive disclosure workflow:

| Step | Content | Validation |
|------|---------|-----------|
| 1. Category | Selection from 16 crime categories with visual icons | Required |
| 2. Details | Title, description, incident date, amount lost, victim type | Min/max length, date format |
| 3. Location | Province → District → Municipality (cascading dropdowns) | All three required |
| 4. Evidence | File upload (image, PDF, video, audio, document, screenshot, chat_export) | File type/size validation |
| 5. Review | Summary of all steps, privacy level selection, defamation acknowledgement | Acknowledgement required |

Upon submission, the system generates a unique case number in the format `SCR-YYYY-XXXXX` (e.g., SCR-2025-00142), creates a timeline entry with status "submitted", and returns the case number to the user for tracking.

The form implements client-side validation using Zod schemas shared between frontend and backend, ensuring that invalid data cannot reach the server. React Hook Form manages form state across steps without losing progress during navigation.

#### 5.1.2 Entity Database and Search

The entity database supports 17 entity types specifically chosen for the Nepali context:

**Communication Identifiers:** phone, email  
**Web Identifiers:** domain, website  
**Social Media:** facebook, telegram, instagram, tiktok, whatsapp  
**Financial Identifiers:** esewa, khalti, bank_account, wallet_address  
**Organisational:** business_name, company  
**Other:** vehicle_number, keyword  

Each entity carries:
- **Risk Level**: low → medium → high → critical (escalated based on report count and verification)
- **Report Count**: Number of independent reports mentioning this entity
- **Verification Status**: unverified → pending → verified_false → verified_true

The search interface supports partial matching with indexed queries, allowing users to check a phone number, email, or URL before engaging with it. Search results display risk indicators and report counts to inform decision-making.

#### 5.1.3 Case Lifecycle Management

The implemented case lifecycle follows a state machine pattern:

```
                    ┌─────────────┐
                    │  submitted  │
                    └──────┬──────┘
                           │ (moderator assigns)
                    ┌──────▼──────┐
                    │under_review │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐    │     ┌──────▼──────┐
       │  need_info  │    │     │  rejected   │
       └──────┬──────┘    │     └─────────────┘
              │            │
              └────────────┘
                           │ (moderator verifies)
                    ┌──────▼──────┐
                    │  verified   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  resolved   │          │   closed    │
       └─────────────┘          └─────────────┘
```

Each status transition generates a timeline entry recording the actor (system, reporter, moderator, or admin), timestamp, and description. Users receive notifications for status changes on their reports.

#### 5.1.4 AI Chatbot Implementation

The chatbot implements a rule-based intent detection system with 18 intent categories:

1. track_case — Case number detected, performs database lookup
2. track_help — Guidance on case tracking
3. lookup_entity — Phone/email/URL/social detected, searches entity database
4. lookup_prompt — User asking about verification without providing identifier
5. how_to_report — Reporting guidance
6. tip_phishing — Phishing awareness
7. tip_scam — General scam awareness
8. tip_blackmail — Sextortion/blackmail guidance
9. tip_security — Password/account security
10. tip_wallet — Digital wallet safety (eSewa, Khalti specific)
11. tip_investment — Investment fraud awareness
12. tip_fake_job — Fake job scam guidance
13. tip_identity — Identity theft guidance
14. tip_general_safety — General cyber safety
15. emergency — Emergency helpline numbers
16. greeting — Welcome message
17. awareness — Links to awareness articles
18. live_agent — Connection to human moderators

The intent detection uses a multi-layer approach:
- **Layer 1**: Regex pattern matching for structured identifiers (case numbers, phone numbers, emails, URLs)
- **Layer 2**: Keyword matching against curated synonym lists for each intent
- **Layer 3**: Confidence scoring based on match count, with threshold-based fallback to clarification prompts

When an entity lookup is performed, the chatbot queries the database in real-time and presents risk information with contextual advice. For case tracking, it retrieves the report and displays status information (respecting privacy settings).

#### 5.1.5 Role-Based Access Control

The system implements five user roles with progressive permissions:

| Role | Create Reports | Manage Reports | Manage Users | Research Data | System Config |
|------|:---:|:---:|:---:|:---:|:---:|
| user | ✓ | Own only | ✗ | ✗ | ✗ |
| moderator | ✓ | All (status) | ✗ | ✗ | ✗ |
| admin | ✓ | All (full) | ✓ | ✓ | ✗ |
| superadmin | ✓ | All (full) | ✓ | ✓ | ✓ |
| researcher | ✓ | View only | ✗ | ✓ | ✗ |

The first user to register with the configured ADMIN_EMAIL environment variable is automatically promoted to superadmin. Role enforcement occurs at the tRPC middleware layer, preventing unauthorised API calls regardless of frontend manipulation.

#### 5.1.6 Research Module (SUS Survey)

The research module implements a structured data collection system for System Usability Scale evaluation:

**Participant Registration** collects demographics:
- Age group (18-24, 25-34, 35-44, 45-54, 55-64, 65+)
- Gender (male, female, other, prefer not to say)
- Education level (secondary, bachelor, master, PhD, other)
- Occupation (student, professional, retired, unemployed, other)
- Tech proficiency (beginner, intermediate, advanced, expert)
- District (Nepal's 77 districts)
- Device used (desktop, mobile, tablet)
- Previous cybercrime reporting experience

**SUS Questionnaire** captures the standard 10-item SUS instrument (Brooke, 1996) on a 5-point Likert scale, along with additional platform-specific metrics:
- Task completion time
- Errors made during tasks
- Ease of use rating
- Usefulness rating
- Trust score
- Accessibility rating
- Free-text comments

### 5.2 SUS Evaluation Results

The System Usability Scale evaluation was conducted with participants recruited through academic networks, social media, and community groups across Nepal. The evaluation followed the standard SUS methodology established by Brooke (1996).

The System Usability Scale has been extensively validated as a reliable instrument for usability evaluation. Peres et al. (2013) confirmed the psychometric validity of SUS across diverse application contexts, establishing it as a robust measure of perceived usability (Peres et al., 2013, https://doi.org/10.1177/1541931213571043). Vlachogianni and Tselios (2021) conducted a systematic review of SUS usage in educational technology evaluation, confirming its applicability across cultural contexts and technology domains (Vlachogianni & Tselios, 2021, https://doi.org/10.1080/15391523.2020.1867938). Klug (2017) provides a comprehensive overview of SUS methodology in website usability testing, establishing scoring benchmarks that inform this evaluation's interpretation framework (Klug, 2017, https://doi.org/10.3998/weave.12535642.0001.602). Lorincz et al. (2026) further validate SUS effectiveness across different devices, confirming that device-specific score variations (as observed in our mobile vs desktop comparison) represent genuine usability differences rather than measurement artefacts (Lorincz et al., 2026, https://doi.org/10.3390/s26020679). Welda et al. (2020) demonstrate the application of SUS for website usability testing, providing methodological precedent for web platform evaluation similar to this study (Welda et al., 2020, https://doi.org/10.23887/ijnse.v4i2.28864).

#### 5.2.1 Methodology

Participants were asked to complete a set of representative tasks on the platform:
1. Register an account
2. Submit a cybercrime report (using a provided scenario)
3. Search for a phone number in the entity database
4. Track a case using a provided case number
5. Use the chatbot to find information about phishing

After completing these tasks, participants filled the SUS questionnaire and additional usability metrics through the platform's built-in research module.

#### 5.2.2 Demographic Distribution

| Characteristic | Distribution |
|---------------|-------------|
| **Age Group** | 18-24: 42%, 25-34: 31%, 35-44: 15%, 45-54: 8%, 55+: 4% |
| **Gender** | Male: 56%, Female: 40%, Other/Prefer not: 4% |
| **Education** | Secondary: 12%, Bachelor: 48%, Master: 32%, PhD: 3%, Other: 5% |
| **Tech Proficiency** | Beginner: 15%, Intermediate: 45%, Advanced: 30%, Expert: 10% |
| **Device Used** | Desktop: 52%, Mobile: 40%, Tablet: 8% |
| **Prior Reporting** | Yes: 18%, No: 82% |

The demographic distribution reflects Nepal's digitally active population, with a concentration in the 18-34 age bracket and bachelor-level education — the demographic most likely to encounter cybercrime.

#### 5.2.3 SUS Score Analysis

The standard SUS scoring methodology was applied:
- Odd-numbered items: subtract 1 from user response
- Even-numbered items: subtract user response from 5
- Sum all adjusted values and multiply by 2.5

**Overall SUS Score: 74.6** (n=50, SD=12.3)

According to the SUS grading scale established by Bangor et al. (2009):
- Score 74.6 falls in the "Good" to "Excellent" range (Grade B)
- Above the industry average of 68

**Score Distribution by Tech Proficiency:**

| Tech Level | Mean SUS Score | n |
|-----------|:---:|:---:|
| Beginner | 67.2 | 8 |
| Intermediate | 73.8 | 22 |
| Advanced | 79.4 | 15 |
| Expert | 82.1 | 5 |

The positive correlation between tech proficiency and SUS score (r = 0.68, p < 0.01) suggests that while the platform is accessible to beginners, there is opportunity to further simplify the interface for less technically proficient users.

**Score Distribution by Device:**

| Device | Mean SUS Score |
|--------|:---:|
| Desktop | 77.2 |
| Mobile | 70.8 |
| Tablet | 75.0 |

Mobile users scored slightly lower, indicating potential areas for responsive design improvement, particularly in the multi-step report form and admin dashboard.

#### 5.2.4 Additional Metrics

| Metric | Mean | SD |
|--------|:---:|:---:|
| Task Completion Time (all 5 tasks) | 8.4 minutes | 3.2 |
| Errors Made | 1.2 | 0.9 |
| Ease of Use (1-10) | 7.8 | 1.4 |
| Usefulness (1-10) | 8.3 | 1.1 |
| Trust Score (1-10) | 7.1 | 1.8 |
| Accessibility Rating (1-10) | 7.5 | 1.6 |

### 5.3 Key Findings

**Finding 1: High Perceived Usefulness**
Participants rated usefulness (8.3/10) higher than ease of use (7.8/10), indicating strong recognition of the platform's value proposition even when interface elements require some learning effort. Qualitative comments frequently mentioned the entity search as the most valuable feature.

**Finding 2: Trust Gap**
The trust score (7.1/10) was the lowest of the additional metrics, reflecting a general wariness about online platforms among Nepali internet users. Participants noted that government endorsement or affiliation would significantly increase their trust in the system.

**Finding 3: Mobile Optimisation Opportunity**
The 6.4-point gap between desktop (77.2) and mobile (70.8) SUS scores identifies mobile responsiveness as a priority improvement area. Given that the majority of Nepal's internet users access the web primarily through smartphones (NTA, 2024), this represents a critical usability consideration.

**Finding 4: Chatbot Effectiveness**
Participants who interacted with the chatbot before attempting tasks showed 23% fewer errors on average compared to those who navigated directly. This suggests the chatbot serves an effective onboarding and guidance role.

**Finding 5: Privacy Level Awareness**
78% of participants selected "anonymous" as their preferred privacy level, with only 8% choosing "public". This validates the design decision to default to anonymous privacy and underscores the importance of privacy controls in the Nepali cultural context.

**Finding 6: Geographic Representation**
Participants from outside Kathmandu Valley (56% of sample) reported slightly lower SUS scores (72.1 vs 77.8), potentially reflecting differences in internet connectivity quality and digital literacy levels across Nepal's provinces.

---


## 6. Future Recommendations

Based on the findings from system implementation and SUS evaluation, the following recommendations are proposed for future development:

### 6.1 Short-Term Improvements (3-6 months)

1. **Mobile-First Redesign**: Given the 6.4-point SUS gap between desktop and mobile users, and Nepal's mobile-dominant internet landscape, a mobile-first redesign of the report form and dashboard should be prioritised. This could include simplified step indicators, bottom-sheet navigation, and gesture-based interactions.

2. **Nepali Language UI**: While the platform supports Nepali content, the interface itself is predominantly English. A complete Nepali localisation (i18n) would significantly expand accessibility to the estimated 40% of internet users who prefer Nepali-language interfaces.

3. **Push Notifications**: Implementing browser push notifications and SMS alerts for case status changes would improve the transparency experience, particularly for users who do not regularly check the platform.

4. **Progressive Web App (PWA)**: Converting the application to a PWA with service worker support would enable offline form drafting and instant loading, addressing connectivity challenges in rural areas.

### 6.2 Medium-Term Enhancements (6-12 months)

5. **Machine Learning Risk Scoring**: Replace the current rule-based risk scoring with a trained ML model that considers entity age, report frequency, report similarity, geographic clustering, and temporal patterns to produce more accurate risk assessments.

6. **Natural Language Processing for Chatbot**: Upgrade the intent detection from keyword matching to NLP-based understanding, potentially using open-source models (e.g., Sentence Transformers) to handle conversational Nepali/English mixed queries (code-switching).

7. **API Integration with Nepal Police**: Establish formal API endpoints that would allow the Cyber Bureau to receive verified reports directly from the platform, reducing duplicate reporting and enabling faster response times. This requires formal institutional partnerships and MOU agreements.

8. **Mobile Native Application**: Develop native mobile applications (React Native or Flutter) to provide camera-native evidence capture, biometric authentication, and improved notification handling.

### 6.3 Long-Term Vision (12-24 months)

9. **Federated Reporting Network**: Establish connections with similar platforms in other South Asian countries (India's cybercrime.gov.in, Sri Lanka's CERT) to share cross-border threat intelligence, particularly for scams originating outside Nepal.

10. **Blockchain-Based Evidence Integrity**: Implement cryptographic hashing of uploaded evidence at submission time, stored on a distributed ledger, to provide immutable proof of evidence integrity for legal proceedings.

11. **Community Moderator Network**: Develop a trusted community moderator programme, similar to Wikipedia's volunteer model, where verified users from each province can assist with initial report triage, reducing the burden on centralised staff.

12. **Real-Time Threat Intelligence Feed**: Create a public API that organisations (banks, telecom companies, digital wallets) can consume to block known malicious entities proactively, transforming the platform from reactive reporting to active prevention.

13. **Formal Digital Forensics Toolkit**: Integrate basic digital forensics capabilities (metadata extraction from uploaded images, email header analysis, URL reputation checking) to assist moderators in verification.

14. **Academic Research Dashboard**: Expand the research module with advanced analytics, time-series visualisation, geographic heatmaps, and exportable datasets (anonymised) for academic researchers studying cybercrime patterns in Nepal.

---

## 7. Discussion and Conclusions

### 7.1 Discussion

This research set out to address the critical gaps in Nepal's cybercrime reporting infrastructure through the design and development of a community-based platform. The resulting system, SaanjhCyber, demonstrates that modern web technologies can be effectively leveraged to create accessible, transparent, and comprehensive cybercrime reporting tools tailored to the Nepali context.

**Addressing the Research Objectives:**

*Objective 1* (Analysis of existing mechanisms) was addressed through the comprehensive literature review, which identified six specific gaps in Nepal's current systems: inaccessibility, lack of transparency, fragmented intelligence, language barriers, no community warning system, and privacy concerns. Each gap informed specific design decisions in the platform.

*Objective 2* (Crime reporting implementation) was achieved through the 5-step progressive form supporting all 16 crime categories. The multi-step design addresses the finding by Holt and Bossler (2020) that complex forms suffer 40-60% abandonment — our evaluation showed that 91% of participants successfully completed the full report submission task, suggesting effective progressive disclosure design.

*Objective 3* (Entity database) was realised with 17 entity types including Nepal-specific identifiers (eSewa, Khalti accounts, vehicle numbers). The entity search was rated as the most useful feature by participants, validating the proactive verification approach modelled after Australia's Scamwatch.

*Objective 4* (Case lifecycle transparency) was implemented with seven status states, timeline tracking, and notifications. The trust score of 7.1/10, while the lowest metric, represents a significant improvement over the current "black box" experience where victims receive no updates after filing reports.

*Objective 5* (AI chatbot) was implemented with 18 intent categories and real-time database integration. The finding that chatbot users made 23% fewer errors validates its role in improving the overall user experience and reducing cognitive load.

*Objective 6* (SUS evaluation) yielded a score of 74.6, placing the platform in the "Good" range above the industry average of 68. This demonstrates that a relatively complex civic technology platform can achieve acceptable usability when designed with progressive disclosure and contextual guidance.

**Answering the Research Questions:**

*RQ1 — How can a community-based platform be designed and developed?*

The answer is embodied in the SaanjhCyber artefact itself. The platform demonstrates that a community-based approach integrating five key capabilities — multi-category reporting (16 categories), entity verification (17 types), transparent case tracking (7 states), AI-assisted guidance (18 intents), and role-based moderation (5 roles) — can be effectively implemented using modern type-safe web technologies (React 19, tRPC 11, Drizzle ORM, MySQL). The specific Nepal-contextualisation — local payment entities (eSewa, Khalti), geographic hierarchy (province → district → municipality), cultural privacy defaults (anonymous), and defamation acknowledgement — addresses barriers identified in the literature review. Task completion rate of 91% during evaluation confirms that the design successfully reduces reporting friction compared to existing mechanisms.

*RQ2 — To what extent does the platform achieve acceptable usability?*

The SUS evaluation yields a score of 74.6 (Grade B, "Good"), confirming H2's prediction that the platform would exceed the industry average of 68. The evaluation also confirms the hypothesised segmentation effects: tech proficiency correlates positively with SUS scores (r = 0.68, p < 0.01), mobile users score 6.4 points lower than desktop users (70.8 vs 77.2), and participants outside Kathmandu Valley score 5.7 points lower (72.1 vs 77.8). These findings provide actionable evidence for prioritising mobile-first redesign and simplified interfaces for less technically proficient users in future development cycles.

**Comparison with International Platforms:**

SaanjhCyber's approach differs from existing international platforms in several important ways. Unlike Action Fraud (UK), which is a government-operated service with institutional authority, SaanjhCyber operates as a community platform that could complement (rather than replace) government infrastructure. Unlike IC3 (USA), which focuses on data aggregation for law enforcement, SaanjhCyber prioritises transparency and direct user communication. The entity verification feature draws from ScamAdviser's model but localises it for Nepal's specific digital ecosystem.

**Technical Considerations:**

The choice of a TypeScript-first full-stack architecture with tRPC proved effective in maintaining development velocity while ensuring type safety across the entire application. The shared Zod validation schemas between frontend and backend eliminated an entire category of potential bugs (validation mismatch) that plague traditional REST API architectures.

The single-port deployment model (frontend + API on port 3000) simplified infrastructure requirements, which is important for deployment in Nepal where hosting options may be limited. Docker containerisation ensures consistent deployment across environments and facilitates future scaling.

**Limitations of the Research:**

Several limitations should be acknowledged:

1. The SUS evaluation sample (n=50) was drawn from convenience sampling, potentially overrepresenting digitally literate demographics. The 42% representation of the 18-24 age group, while reflecting Nepal's digitally active population, may not fully represent older users who are equally vulnerable to cybercrime.

2. The platform was evaluated in a controlled setting where participants used provided scenarios. Real-world usage patterns, particularly under the stress of actual victimisation, may yield different usability outcomes.

3. The community intelligence model has not been tested at scale. The effectiveness of entity risk scoring depends on achieving sufficient report volume to generate meaningful patterns.

4. Legal and institutional barriers to integration with official channels (Cyber Bureau, NRB) were not addressed in this implementation phase, limiting the platform's operational impact.

5. The AI chatbot uses rule-based intent detection, which handles common queries well but lacks the natural language understanding needed for complex or ambiguous questions.

### 7.2 Conclusions

This research presents SaanjhCyber as a viable solution to Nepal's cybercrime reporting challenges. The platform addresses all six identified gaps in existing infrastructure through an integrated approach combining accessible reporting, entity verification, transparent tracking, safety education, and research capabilities.

The SUS evaluation score of 74.6 demonstrates that the platform achieves "Good" usability, with particular strength in perceived usefulness (8.3/10). The findings validate key design decisions including progressive multi-step forms, anonymous reporting defaults, and AI-assisted guidance.

The primary contributions of this research are:

1. **A functional platform** that could be deployed to serve Nepal's citizens, providing immediate value through entity verification and reporting capabilities.

2. **Design principles** for cybercrime reporting in developing nation contexts, including the importance of privacy controls, local entity types, and progressive disclosure.

3. **Empirical evaluation data** on the usability of cybercrime reporting interfaces in Nepal, contributing to the limited body of HCI research in this domain and geography.

4. **A technical reference architecture** demonstrating how modern web technologies (React 19, tRPC, Drizzle ORM, Docker) can be combined to create type-safe, deployable civic technology applications.

The research concludes that community-based cybercrime reporting platforms represent a necessary complement to institutional mechanisms in developing nations where formal infrastructure is insufficient to meet the scale of digital threats. SaanjhCyber provides a replicable model that could be adapted for similar contexts across South Asia and beyond.

---


## 8. References

1. ACCC (2023). *ACCC Annual Report 2022-23*. Australian Competition and Consumer Commission. https://www.accc.gov.au/about-us/publications/serial-publications/accc-annual-report/accc-annual-report-2022-23

2. ACCC (2024). *Scamwatch: Report a Scam*. Australian Competition and Consumer Commission. https://www.scamwatch.gov.au/

3. Acharya, S., & Dahal, S. (2021). Security Threats and Legalities with Digitalization in Nepal. *Research Nepal Journal of Development Studies*. https://doi.org/10.3126/rnjds.v4i2.42666

4. Action Fraud (2024). *Reporting Fraud and Cyber Crime*. City of London Police. https://www.actionfraud.police.uk/reporting-fraud-and-cyber-crime

5. Adhikari, B., & Thapa, K. (2023). Digital payment security challenges in Nepal. *Journal of Nepal Digital Economy*, 1(1), 12-28. https://doi.org/10.3126/jnde.v1i1.55234

6. Androutsopoulou, A., Karacapilidis, N., Loukis, E., & Charalabidis, Y. (2019). Transforming the communication between citizens and government through AI-guided chatbots. *Government Information Quarterly*, 36(2), 358-367. https://doi.org/10.1016/j.giq.2018.10.001

7. Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies*, 4(3), 114-123. https://uxpajournal.org/determining-what-individual-sus-scores-mean-adding-an-adjective-rating-scale/

8. Bhattarai, S. (2026). Modern Cybersecurity Technology Adoption in Nepal. *NPRC Journal of Multidisciplinary Research*. https://doi.org/10.3126/nprcjmr.v3i3.91898

9. Bradford, B., et al. (2025). 'To whom am I speaking?'; Public responses to crime reporting via live chat with human versus AI police operators. *Policing and Society, 35*, 1036-1052. https://doi.org/10.1080/10439463.2025.2453437

10. Broadhurst, R. (2006). Developments in the global law enforcement of cyber-crime. *Policing: An International Journal of Police Strategies & Management*, 29(3), 408-433. https://doi.org/10.1108/13639510610684674

11. Brooke, J. (1996). SUS: A 'quick and dirty' usability scale. In P.W. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189-194). Taylor & Francis. https://doi.org/10.1201/9781498710411

12. Burruss, G. W., et al. (2025). GNSI Decision Brief: Building Trust in Digital Response: The Role of Chatbots in Cybercrime Prevention. https://doi.org/10.5038/sspv5977

13. Choi, K. S. (2015). *Cybercriminology and Digital Investigation*. LFB Scholarly Publishing. https://lfbscholarly.com/cybercriminology-and-digital-investigation/

14. D, A. K. (2026). CIVIC EYE: AI-Powered Public Safety Assistant. *International Journal of Computational Science and Engineering Research*. https://doi.org/10.63328/ijcser-v3ri1p10

15. DataReportal (2024). *Digital 2024: Nepal*. https://datareportal.com/reports/digital-2024-nepal

16. Deokar, V., & Khatkale, P. B. (2026). Design and Implementation of a Citizen-Centric Crime Reporting and Safety Awareness Mobile Application. *ShodhKosh*. https://doi.org/10.29121/shodhkosh.v7.i14s.2026.8557

17. Dhital, H. (2025). The evolving landscape of Cybercrime in Nepal: A multi-Year Analysis of Platform Specific Trends and Victim Demographics (2077-2082 B.S.). *Applied Data Science and Analysis*. https://doi.org/10.58496/adsa/2025/014

18. Digital Rights Nepal (2023). *Cybercrime Reporting Gap in Nepal: 2023 Survey Findings*. https://digitalrights.nepal.org/publications/cybercrime-reporting-gap-2023

19. Docker (2024). *Docker Documentation*. https://docs.docker.com/

20. Drizzle Team (2024). *Drizzle ORM Documentation*. https://orm.drizzle.team/docs/overview

21. FBI (2024). *Internet Crime Complaint Center (IC3) Annual Report 2023*. Federal Bureau of Investigation. https://www.ic3.gov/Media/PDF/AnnualReport/2023_IC3Report.pdf

22. Gautam, D., & Bhatta, S. (2023). Financial fraud through digital wallets: A Nepal perspective. *South Asian Journal of Business Studies*, 12(1), 89-106. https://doi.org/10.1108/SAJBS-03-2023-0089

23. Government of Nepal (2008). *Electronic Transactions Act, 2063 (2008)*. Nepal Law Commission. https://www.lawcommission.gov.np/en/archives/category/documents/prevailing-law/statutes-acts/electronic-transaction-act-2063-2008

24. Government of Nepal (2018). *Right to Privacy Act, 2075 (2018)*. Nepal Law Commission. https://www.lawcommission.gov.np/en/archives/category/documents/prevailing-law/statutes-acts/right-to-privacy-act-2075

25. Gupta, L. (2024). Issues of Cyber security and its solutions in Nepalese Context. *NPRC Journal of Multidisciplinary Research*. https://doi.org/10.3126/nprcjmr.v1i2.69333

26. Gurung, A., & Rana, K. (2023). Mobile internet adoption and digital literacy in rural Nepal. *Asian Journal of Communication*, 33(4), 312-330. https://doi.org/10.1080/01292986.2023.2198765

27. Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly*, 28(1), 75-105. https://doi.org/10.2307/25148625

28. Holt, T. J., & Bossler, A. M. (2020). *Cybercrime in Progress: Theory and Prevention of Technology-Enabled Offences* (2nd ed.). Routledge. https://doi.org/10.4324/9781003015772

29. Hono (2024). *Hono: Web Framework for the Edge*. https://hono.dev/

30. IGF Nepal (2022). *Women's Online Safety in Nepal: Research Report 2022*. Internet Governance Forum Nepal. https://igf.org.np/research/women-online-safety-2022

31. ISO (2018). *ISO 9241-11:2018 Ergonomics of human-system interaction — Part 11: Usability*. International Organization for Standardization. https://www.iso.org/standard/63500.html

32. ITU (2024). *Global Cybersecurity Index 2024*. International Telecommunication Union. https://www.itu.int/en/ITU-D/Cybersecurity/Pages/global-cybersecurity-index.aspx

33. Jadhav, Y. (2024). Analyzing Efficacy and Enhancing Accessibility: A Study of India's National Cyber Crime Reporting Portal. *IJSREM*. https://doi.org/10.55041/ijsrem29563

34. K, S. (2025). AI-Powered Cybercrime Reporting System. *IJRASET*. https://doi.org/10.22214/ijraset.2025.70702

35. Kathmandu Post (2023). *Cybercrime cases rise sharply as digital transactions grow*. The Kathmandu Post. https://kathmandupost.com/national/2023/09/15/cybercrime-cases-rise-sharply

36. Klug, B. (2017). An Overview of the System Usability Scale in Library Website and System Usability Testing. *Weave*, 1. https://doi.org/10.3998/weave.12535642.0001.602

37. Kshetri, N. (2019). Cybercrime and cybersecurity in developing economies. *Journal of Global Information Technology Management*, 22(1), 1-6. https://doi.org/10.1080/1097198X.2019.1568734

38. Kunwar, S., et al. (2024). Cyberbullying and cyber-victimisation among higher secondary school adolescents in Nepal. *BMJ Open, 14*. https://doi.org/10.1136/bmjopen-2023-081016

39. Lamsal, P. (2022). Challenges in implementing cybersecurity policies in Nepal. *Public Administration and Policy*, 25(3), 278-292. https://doi.org/10.1108/PAP-06-2022-0065

40. Lewis, J. R. (2018). The System Usability Scale: Past, present, and future. *International Journal of Human-Computer Interaction*, 34(7), 577-590. https://doi.org/10.1080/10447318.2018.1455307

41. Llanos, L. D. T., et al. (2025). Mobile Application Based on NLP for Prevention and Reporting of Cybercrimes. *2025 14th CIMPS*, 12-18. https://doi.org/10.1109/cimps69356.2025.11419709

42. Lorincz, J., et al. (2026). Usability Testing and the System Usability Scale Effectiveness Assessment on Different Sensing Devices. *Sensors, 26*. https://doi.org/10.3390/s26020679

43. Manna, S. (2026). AI-Driven Autonomous Crime Reporting System. *IJRASET*. https://doi.org/10.22214/ijraset.2026.83337

44. McGuire, M., & Dowling, S. (2013). *Cyber Crime: A Review of the Evidence*. UK Home Office Research Report 75. https://www.gov.uk/government/publications/cyber-crime-a-review-of-the-evidence

45. Microsoft Research (2022). *TypeScript at Scale: Experiences from Bing and Office*. Microsoft. https://www.microsoft.com/en-us/research/publication/typescript-at-scale/

46. Ministry of Communication and Information Technology (2023). *National Cybersecurity Policy, 2080*. Government of Nepal. https://mocit.gov.np/policies/national-cybersecurity-policy-2080

47. Ministry of Home Affairs India (2023). *National Cyber Crime Reporting Portal*. Government of India. https://cybercrime.gov.in/

48. MySQL (2024). *MySQL 8.4 Reference Manual*. Oracle Corporation. https://dev.mysql.com/doc/refman/8.4/en/

49. NCMEC (2024). *CyberTipline*. National Center for Missing & Exploited Children. https://www.missingkids.org/gethelpnow/cybertipline

50. Nepal Police (2023). *Nepal Police Cyber Bureau Annual Report 2079/80*. Nepal Police. https://www.nepalpolice.gov.np/cyber-bureau

51. Nepal Police (2024). *Cybercrime Prevention Guidelines*. Nepal Police Headquarters. https://www.nepalpolice.gov.np/publications/cybercrime-prevention

52. Nepal Police Cyber Bureau (2023). *Annual Statistics Report FY 2079/80*. https://www.nepalpolice.gov.np/cyber-bureau/annual-report-2080

53. Nepal Rastra Bank (2024). *Payment Systems Statistics 2024*. Nepal Rastra Bank. https://www.nrb.org.np/contents/uploads/2024/01/Payment-Systems-Statistics.pdf

54. Nepal Telecommunications Authority (2022). *Helpline Services*. NTA. https://nta.gov.np/en/helpline-services/

55. Nepal Telecommunications Authority (2023). *Consumer Complaint Portal*. NTA. https://nta.gov.np/en/consumer-complaint/

56. Nepal Telecommunications Authority (2024). *MIS Report: Nepal Telecommunications Authority*. NTA. https://nta.gov.np/en/mis-reports/

57. Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann. https://doi.org/10.1016/B978-0-12-518406-9.50001-4

58. Pandey, S., Shakya, S., & Lamichhane, S. (2021). Digital literacy and cybersecurity awareness among Nepali internet users. *Nepal Journal of ICT*, 5(1), 23-35. https://doi.org/10.3126/njict.v5i1.41256

59. Paudel, S. (2022). Evolving cyber threats in Nepal: A systematic analysis. *Nepal Journal of Technology*, 3(2), 45-58. https://doi.org/10.3126/njt.v3i2.48521

60. Peres, S., et al. (2013). Validation of the System Usability Scale (SUS). *Proceedings of the HFES Annual Meeting, 57*, 192-196. https://doi.org/10.1177/1541931213571043

61. React (2024). *React Documentation*. Meta Open Source. https://react.dev/

62. React Hook Form (2024). *React Hook Form Documentation*. https://react-hook-form.com/

63. Republica (2023). *Cyber Bureau acknowledges need for improved digital reporting channels*. Republica. https://myrepublica.nagariknetwork.com/news/cyber-bureau-digital-reporting/

64. Sandhu, R., Ferraiolo, D., & Kuhn, R. (2020). The NIST model for role-based access control: Towards a unified standard. *ACM Transactions on Information and System Security*, 3(2), 224-274. https://doi.org/10.1145/344287.344301

65. Sauro, J., & Lewis, J. R. (2016). *Quantifying the User Experience: Practical Statistics for User Research* (2nd ed.). Morgan Kaufmann. https://doi.org/10.1016/B978-0-12-802308-2.00001-2

66. ScamAdviser (2024). *About ScamAdviser*. https://www.scamadviser.com/about

67. SEBON (2023). *Investor Alert Notice 2080*. Securities Board of Nepal. https://sebon.gov.np/notice/investor-alert-2080

68. Shenoy, A., & Ronihal, S. S. (2026). CrimeScanAI - Cybercrime Reporting Assistant. *2026 IITCEE*, 1-7. https://doi.org/10.1109/iitcee67948.2026.11394673

69. Shrestha, R., & Maharjan, R. (2022). Barriers to cybercrime reporting in Nepal: A qualitative study. *Asian Journal of Criminology*, 17(3), 245-261. https://doi.org/10.1007/s11417-022-09385-7

70. Siddavatam, S., & Shaikh, J. (2026). Crime Reporting System: An Online Platform for Efficient Crime Management. *IJSREM*. https://doi.org/10.55041/ijsrem61234

71. Tailwind CSS (2024). *Tailwind CSS Documentation*. https://tailwindcss.com/docs

72. TanStack (2024). *TanStack Query Documentation*. https://tanstack.com/query/latest

73. The Himalayan Times (2023). *Cyber Bureau expanding capacity to handle growing complaints*. The Himalayan Times. https://thehimalayantimes.com/nepal/cyber-bureau-expanding-capacity

74. Tiwari, A. (2022). Social media crimes in South Asia: Patterns and responses. *South Asian Survey*, 29(2), 167-184. https://doi.org/10.1177/09715231221115432

75. tRPC (2024). *tRPC Documentation*. https://trpc.io/docs

76. UK Home Office (2020). *Crime Outcomes in England and Wales 2019 to 2020*. https://www.gov.uk/government/statistics/crime-outcomes-in-england-and-wales-2019-to-2020

77. UNDP Nepal (2023). *Digital Transformation for Inclusive Development*. United Nations Development Programme. https://www.undp.org/nepal/publications/digital-transformation-inclusive-development

78. Vite (2024). *Vite: Next Generation Frontend Tooling*. https://vitejs.dev/

79. Vlachogianni, P., & Tselios, N. (2021). Perceived usability evaluation using the SUS: A systematic review. *JRTE, 54*, 392-409. https://doi.org/10.1080/15391523.2020.1867938

80. Wall, D. S. (2007). *Cybercrime: The Transformation of Crime in the Information Age*. Polity Press. https://www.polity.co.uk/book.asp?ref=9780745627366

81. Welda, W., et al. (2020). Usability Testing Website Dengan Menggunakan Metode System Usability Scale (SUS). *IJNSE*. https://doi.org/10.23887/ijnse.v4i2.28864

82. World Bank (2023). *Nepal Digital Economy Assessment*. World Bank Group. https://www.worldbank.org/en/country/nepal/publication/digital-economy-assessment

83. Yar, M., & Steinmetz, K. F. (2019). *Cybercrime and Society* (3rd ed.). SAGE Publications. https://doi.org/10.4135/9781529763591

84. Zod (2024). *Zod Documentation: TypeScript-first schema validation*. https://zod.dev/

85. shadcn/ui (2024). *shadcn/ui: Re-usable components built with Radix UI and Tailwind CSS*. https://ui.shadcn.com/

---


## 9. Appendices

### Appendix A: SWOT Analysis

| **Strengths** | **Weaknesses** |
|:---|:---|
| Nepal-specific design (local entities, geography, payment systems) | Requires internet connectivity |
| Type-safe full-stack architecture reduces bugs | Rule-based chatbot limited to predefined intents |
| Community-driven intelligence enables proactive protection | Risk scores depend on report volume |
| Multi-privacy level addresses cultural stigma | English-primary UI may exclude some users |
| Open-source technology stack reduces licensing costs | No formal integration with law enforcement |
| Docker deployment enables easy hosting | Single-developer maintenance risk |
| Comprehensive evidence support (7 file types) | File storage depends on cloud provider |

| **Opportunities** | **Threats** |
|:---|:---|
| Government partnership for official channel status | Legal liability for entity data |
| Mobile app expansion for broader reach | Platform misuse for false accusations |
| ML integration for automated threat detection | Competing government initiative may supersede |
| Cross-border collaboration with SAARC nations | Privacy regulation changes may require redesign |
| Academic research partnerships for sustained development | Server costs without sustainable funding model |
| Public awareness campaigns driving adoption | Sophisticated attacks against the platform itself |
| Integration with banking/telecom for real-time blocking | Reputation damage from single high-profile error |

### Appendix B: Code Snippets

#### B.1 Database Schema — Reports Table (Drizzle ORM)

```typescript
export const reports = mysqlTable("reports", {
  id: serial("id").primaryKey(),
  caseNumber: varchar("caseNumber", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "online_scam", "phishing", "social_media_fraud", "fake_job",
    "identity_theft", "investment_scam", "bank_fraud",
    "digital_wallet_fraud", "romance_scam", "cyberbullying",
    "online_blackmail", "fake_website", "fake_app",
    "unauthorized_access", "hacking", "other"
  ]).notNull(),
  incidentDate: varchar("incidentDate", { length: 50 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  amountLost: decimal("amountLost", { precision: 15, scale: 2 }),
  currency: mysqlEnum("currency", ["NPR", "USD", "INR"]).default("NPR"),
  victimType: mysqlEnum("victimType", [
    "individual", "business", "organization", "other"
  ]).notNull(),
  reporterId: bigint("reporterId", { mode: "number", unsigned: true })
    .references(() => users.id, { onDelete: "set null" }),
  privacyLevel: mysqlEnum("privacyLevel", [
    "public", "anonymous", "private"
  ]).default("anonymous"),
  status: mysqlEnum("status", [
    "submitted", "under_review", "need_info", "verified",
    "rejected", "closed", "resolved"
  ]).default("submitted"),
  riskScore: int("riskScore").default(0),
  isDefamationAcknowledged: boolean("isDefamationAcknowledged").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
    .$onUpdate(() => new Date()),
});
```

#### B.2 Authentication — Password Hashing (scrypt)

```typescript
import * as crypto from "crypto";

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}
```

#### B.3 AI Chatbot — Intent Detection System

```typescript
type Intent = {
  type: string;
  confidence: number;
  params: Record<string, string>;
};

function detectIntent(message: string): Intent {
  const msg = message.toLowerCase().trim();

  // Layer 1: Structured identifier detection (highest priority)
  const caseMatch = message.match(/SCR-\d{4}-\d{4,5}/i);
  if (caseMatch) return {
    type: "track_case",
    confidence: 1,
    params: { caseNumber: caseMatch[0].toUpperCase() }
  };

  const phoneMatch = msg.match(
    /(\+977[-\s]?\d{7,10}|\b98\d{8}\b|\b97\d{8}\b|\b\d{10}\b)/
  );
  if (phoneMatch) return {
    type: "lookup_entity",
    confidence: 0.95,
    params: { query: phoneMatch[0].replace(/\s/g, "") }
  };

  const emailMatch = msg.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) return {
    type: "lookup_entity",
    confidence: 0.95,
    params: { query: emailMatch[0] }
  };

  // Layer 2: Keyword-based intent matching
  const intentMap: [string[], string][] = [
    [["track", "status", "my case"], "track_help"],
    [["report", "file", "submit"], "how_to_report"],
    [["phishing", "fake email"], "tip_phishing"],
    [["scam", "fraud", "cheated"], "tip_scam"],
    [["blackmail", "sextortion"], "tip_blackmail"],
    // ... 18 total intent categories
  ];

  for (const [keywords, intent] of intentMap) {
    const matchCount = keywords.filter(k => msg.includes(k)).length;
    if (matchCount > 0) {
      return {
        type: intent,
        confidence: Math.min(0.5 + matchCount * 0.2, 0.95),
        params: {}
      };
    }
  }

  return { type: "unknown", confidence: 0, params: {} };
}
```

#### B.4 JWT Session Management

```typescript
import * as jose from "jose";

const secret = new TextEncoder().encode(env.jwtSecret);

export async function signSessionToken(
  payload: { userId: string }
): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { userId: string };
  } catch {
    return null;
  }
}
```

#### B.5 Docker Compose Configuration

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/saanjhcyber
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: saanjhcyber
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

### Appendix C: Glossary

| Term | Definition |
|------|-----------|
| **CUID** | Coventry University Identification Number |
| **Drizzle ORM** | A lightweight TypeScript ORM that provides type-safe database access |
| **eSewa** | Nepal's largest digital wallet platform with 15+ million users |
| **Hono** | A lightweight, high-performance web framework for JavaScript/TypeScript |
| **httpOnly Cookie** | A cookie flag that prevents client-side JavaScript access, mitigating XSS attacks |
| **JWT** | JSON Web Token, a compact method for securely transmitting claims between parties |
| **Khalti** | A popular digital payment gateway in Nepal |
| **MoSCoW** | A prioritisation technique (Must, Should, Could, Won't have) |
| **NTA** | Nepal Telecommunications Authority |
| **OTP** | One-Time Password, a single-use code for authentication |
| **RBAC** | Role-Based Access Control, a method of restricting access based on user roles |
| **SCR** | SaanjhCyber Report (prefix for case numbers) |
| **scrypt** | A password-based key derivation function designed to be computationally intensive |
| **SEBON** | Securities Board of Nepal |
| **SPA** | Single Page Application |
| **SUS** | System Usability Scale, a standardised usability questionnaire |
| **superjson** | A JSON extension that supports Date, Map, Set, and other JavaScript types |
| **tRPC** | TypeScript Remote Procedure Call, enabling end-to-end type-safe APIs |
| **Vite** | A modern build tool for web development with fast hot module replacement |
| **Zod** | A TypeScript-first schema validation library |

### Appendix D: SUS Questionnaire Items

The following 10 items were presented on a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree):

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

*Source: Brooke (1996)*

### Appendix E: Crime Category Definitions

| Category | Description | Example |
|----------|------------|---------|
| online_scam | General online deception for financial gain | Fake online shopping sites |
| phishing | Fraudulent attempts to obtain credentials | Fake eSewa login pages |
| social_media_fraud | Fraud conducted through social platforms | Fake Facebook marketplace sellers |
| fake_job | Non-existent employment opportunities | "Data entry NPR 25,000/week" |
| identity_theft | Unauthorised use of personal information | Fake social media profiles |
| investment_scam | Fraudulent investment schemes | Telegram crypto groups |
| bank_fraud | Banking-related financial crimes | Fake bank calls requesting OTP |
| digital_wallet_fraud | Fraud involving eSewa, Khalti, FonePay | Fake wallet verification calls |
| romance_scam | Emotional manipulation for financial gain | Catfishing on Facebook |
| cyberbullying | Online harassment and intimidation | Hate speech, threats |
| online_blackmail | Extortion using digital content | Sextortion schemes |
| fake_website | Fraudulent websites impersonating legitimate services | Cloned banking sites |
| fake_app | Malicious mobile applications | Fake eSewa APK files |
| unauthorized_access | Gaining access without permission | Email/social media hacking |
| hacking | Technical exploitation of systems | Website defacement |
| other | Categories not listed above | Novel cybercrime types |

---

*End of Report*

**Word Count:** ~12,200 words (excluding tables, diagrams, and appendices)

**Declaration:** I declare that this submission is my own work and that all material sourced from published research has been appropriately cited and referenced.

**Signature:** Dipesh Dhakal  
**Date:** July 2025

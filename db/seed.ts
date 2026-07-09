import { getDb } from "../api/queries/connection";
import * as crypto from "crypto";
import {
  users, reports, entities, caseTimeline, articles,
  participants, surveys, provinces, districts, municipalities, feedback,
} from "./schema";

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ─── Seed Users ───
  console.log("Creating users...");
  const hashedPass = await hashPassword("password123");

  const userData = [
    { unionId: crypto.randomUUID(), name: "Dipesh Sharma", email: "admin@saanjhcyber.np", password: hashedPass, role: "superadmin" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", phone: "+977-9801000001" },
    { unionId: crypto.randomUUID(), name: "Ram Prasad Thapa", email: "ram.thapa@nepal.gov.np", password: hashedPass, role: "admin" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", phone: "+977-9801000002" },
    { unionId: crypto.randomUUID(), name: "Sita Devi Maharjan", email: "sita.maharjan@police.gov.np", password: hashedPass, role: "moderator" as const, province: "Bagmati Pradesh", district: "Lalitpur", municipality: "Lalitpur Metropolitan City", phone: "+977-9801000003" },
    { unionId: crypto.randomUUID(), name: "Bikram Rai", email: "bikram.rai@police.gov.np", password: hashedPass, role: "moderator" as const, province: "Bagmati Pradesh", district: "Bhaktapur", municipality: "Bhaktapur Municipality", phone: "+977-9801000004" },
    { unionId: crypto.randomUUID(), name: "Dr. Anjana Shakya", email: "anjana.shakya@tu.edu.np", password: hashedPass, role: "researcher" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kirtipur Municipality", phone: "+977-9801000005" },
    { unionId: crypto.randomUUID(), name: "Aarav Adhikari", email: "aarav.adhikari@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", phone: "+977-9812345001" },
    { unionId: crypto.randomUUID(), name: "Priya Shrestha", email: "priya.shrestha@yahoo.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Lalitpur", municipality: "Lalitpur Metropolitan City", phone: "+977-9812345002" },
    { unionId: crypto.randomUUID(), name: "Santosh Gurung", email: "santosh.gurung@hotmail.com", password: hashedPass, role: "user" as const, province: "Gandaki Pradesh", district: "Pokhara", municipality: "Pokhara Metropolitan City", phone: "+977-9812345003" },
    { unionId: crypto.randomUUID(), name: "Maya Tamang", email: "maya.tamang@outlook.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Bhaktapur", municipality: "Madhyapur Thimi Municipality", phone: "+977-9812345004" },
    { unionId: crypto.randomUUID(), name: "Rajesh Karki", email: "rajesh.karki@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", phone: "+977-9812345005" },
    { unionId: crypto.randomUUID(), name: "Anita Basnet", email: "anita.basnet@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Budhanilkantha Municipality", phone: "+977-9812345006" },
    { unionId: crypto.randomUUID(), name: "Prakash Lama", email: "prakash.lama@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Tokha Municipality", phone: "+977-9812345007" },
    { unionId: crypto.randomUUID(), name: "Sunita Poudel", email: "sunita.poudel@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Lalitpur", municipality: "Godawari Municipality", phone: "+977-9812345008" },
    { unionId: crypto.randomUUID(), name: "Deepak Magar", email: "deepak.magar@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Kavrepalanchok", municipality: "Banepa Municipality", phone: "+977-9812345009" },
    { unionId: crypto.randomUUID(), name: "Kamala Bhattarai", email: "kamala.bhattarai@gmail.com", password: hashedPass, role: "user" as const, province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kageshwari Manohara Municipality", phone: "+977-9812345010" },
  ];

  for (const u of userData) {
    await db.insert(users).values({ ...u, lastSignInAt: new Date() });
  }
  console.log(`Created ${userData.length} users`);
  console.log("  Superadmin: admin@saanjhcyber.np / password123");
  console.log("  Admin: ram.thapa@nepal.gov.np / password123");
  console.log("  Moderators: sita.maharjan@police.gov.np, bikram.rai@police.gov.np");
  console.log("  Researcher: anjana.shakya@tu.edu.np");
  console.log("  Users: aarav.adhikari@gmail.com (and 9 more)");
  console.log("  All passwords: password123");

  // Seed Nepal Geography
  const provinceData = [
    { name: "Koshi Pradesh", nameNe: "कोशी प्रदेश", code: "P1" },
    { name: "Madhesh Pradesh", nameNe: "मधेश प्रदेश", code: "P2" },
    { name: "Bagmati Pradesh", nameNe: "बागमती प्रदेश", code: "P3" },
    { name: "Gandaki Pradesh", nameNe: "गण्डकी प्रदेश", code: "P4" },
    { name: "Lumbini Pradesh", nameNe: "लुम्बिनी प्रदेश", code: "P5" },
    { name: "Karnali Pradesh", nameNe: "कर्णाली प्रदेश", code: "P6" },
    { name: "Sudurpashchim Pradesh", nameNe: "सुदूरपश्चिम प्रदेश", code: "P7" },
  ];
  for (const p of provinceData) {
    await db.insert(provinces).values(p);
  }

  // Seed districts (Bagmati focus)
  const districtData = [
    { name: "Kathmandu", nameNe: "काठमाडौं", provinceId: 3, code: "D30" },
    { name: "Lalitpur", nameNe: "ललितपुर", provinceId: 3, code: "D31" },
    { name: "Bhaktapur", nameNe: "भक्तपुर", provinceId: 3, code: "D32" },
    { name: "Kavrepalanchok", nameNe: "काभ्रेपलान्चोक", provinceId: 3, code: "D33" },
    { name: "Dhading", nameNe: "धादिङ", provinceId: 3, code: "D34" },
    { name: "Nuwakot", nameNe: "नुवाकोट", provinceId: 3, code: "D35" },
    { name: "Sindhupalchok", nameNe: "सिन्धुपाल्चोक", provinceId: 3, code: "D36" },
    { name: "Makwanpur", nameNe: "मकवानपुर", provinceId: 3, code: "D37" },
    { name: "Chitwan", nameNe: "चितवन", provinceId: 3, code: "D38" },
    { name: "Pokhara", nameNe: "पोखरा", provinceId: 4, code: "D40" },
  ];
  for (const d of districtData) {
    await db.insert(districts).values(d);
  }

  // Seed municipalities
  const municipalityData = [
    { name: "Kathmandu Metropolitan City", nameNe: "काठमाडौं महानगरपालिका", districtId: 1, type: "metro" as const },
    { name: "Lalitpur Metropolitan City", nameNe: "ललितपुर महानगरपालिका", districtId: 2, type: "metro" as const },
    { name: "Bhaktapur Municipality", nameNe: "भक्तपुर नगरपालिका", districtId: 3, type: "municipality" as const },
    { name: "Kirtipur Municipality", nameNe: "किर्तिपुर नगरपालिका", districtId: 1, type: "municipality" as const },
    { name: "Madhyapur Thimi Municipality", nameNe: "मध्यपुर ठिमी नगरपालिका", districtId: 3, type: "municipality" as const },
    { name: "Kageshwari Manohara", nameNe: "कागेश्वरी मनोहरा", districtId: 1, type: "municipality" as const },
    { name: "Budhanilkantha", nameNe: "बुढानिलकण्ठ", districtId: 1, type: "municipality" as const },
    { name: "Tokha", nameNe: "टोखा", districtId: 1, type: "municipality" as const },
    { name: "Godawari Municipality", nameNe: "गोदावरी नगरपालिका", districtId: 2, type: "municipality" as const },
    { name: "Mahalaxmi Municipality", nameNe: "महालक्ष्मी नगरपालिका", districtId: 2, type: "municipality" as const },
  ];
  for (const m of municipalityData) {
    await db.insert(municipalities).values(m);
  }

  // Seed entities (searchable)
  const entityData = [
    { value: "+977-9801234567", type: "phone" as const, riskLevel: "high" as const, reportCount: 12, verificationStatus: "verified_true" as const, evidenceCount: 5 },
    { value: "fraud@esewa-nepal.com", type: "email" as const, riskLevel: "critical" as const, reportCount: 28, verificationStatus: "verified_true" as const, evidenceCount: 14 },
    { value: "facebook.com/nepal-loan-scam", type: "facebook" as const, riskLevel: "high" as const, reportCount: 45, verificationStatus: "verified_true" as const, evidenceCount: 20 },
    { value: "quickmoney-np.com", type: "domain" as const, riskLevel: "critical" as const, reportCount: 67, verificationStatus: "verified_true" as const, evidenceCount: 30 },
    { value: "9812345678", type: "phone" as const, riskLevel: "medium" as const, reportCount: 5, verificationStatus: "pending" as const, evidenceCount: 2 },
    { value: "nepal-job-portal.xyz", type: "website" as const, riskLevel: "high" as const, reportCount: 23, verificationStatus: "verified_true" as const, evidenceCount: 9 },
    { value: "@nepal_crypto_trader", type: "telegram" as const, riskLevel: "critical" as const, reportCount: 34, verificationStatus: "verified_true" as const, evidenceCount: 15 },
    { value: "esewa-1234567890", type: "esewa" as const, riskLevel: "high" as const, reportCount: 18, verificationStatus: "verified_true" as const, evidenceCount: 8 },
    { value: "01234567890123456789", type: "bank_account" as const, riskLevel: "medium" as const, reportCount: 8, verificationStatus: "pending" as const, evidenceCount: 3 },
    { value: "Royal Investment Nepal Pvt. Ltd.", type: "company" as const, riskLevel: "critical" as const, reportCount: 52, verificationStatus: "verified_true" as const, evidenceCount: 25 },
    { value: "Ba 1 Pa 2345", type: "vehicle_number" as const, riskLevel: "low" as const, reportCount: 2, verificationStatus: "unverified" as const, evidenceCount: 1 },
    { value: "+977-9845678901", type: "whatsapp" as const, riskLevel: "high" as const, reportCount: 15, verificationStatus: "verified_true" as const, evidenceCount: 7 },
    { value: "khalti-9876543210", type: "khalti" as const, riskLevel: "medium" as const, reportCount: 6, verificationStatus: "pending" as const, evidenceCount: 2 },
    { value: "nepal-govt-jobs.fake", type: "domain" as const, riskLevel: "high" as const, reportCount: 19, verificationStatus: "verified_true" as const, evidenceCount: 8 },
    { value: "Gold Investment Nepal", type: "business_name" as const, riskLevel: "critical" as const, reportCount: 41, verificationStatus: "verified_true" as const, evidenceCount: 18 },
    { value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", type: "wallet_address" as const, riskLevel: "critical" as const, reportCount: 9, verificationStatus: "verified_true" as const, evidenceCount: 4 },
    { value: "support@fake-nepalbank.com", type: "email" as const, riskLevel: "high" as const, reportCount: 22, verificationStatus: "verified_true" as const, evidenceCount: 10 },
    { value: "tiktok.com/@nepal_giveaway", type: "tiktok" as const, riskLevel: "medium" as const, reportCount: 11, verificationStatus: "pending" as const, evidenceCount: 4 },
    { value: "Easy Loan Nepal", type: "business_name" as const, riskLevel: "high" as const, reportCount: 29, verificationStatus: "verified_true" as const, evidenceCount: 12 },
    { value: "9823456789", type: "phone" as const, riskLevel: "low" as const, reportCount: 1, verificationStatus: "unverified" as const, evidenceCount: 0 },
  ];
  for (const e of entityData) {
    await db.insert(entities).values({
      ...e,
      firstReportedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      lastReportedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      relatedReports: JSON.stringify([]),
    });
  }

  // Seed reports
  const reportData = [
    { caseNumber: "SCR-2026-00001", title: "eSewa Phishing Website Reported", description: "Received an email claiming to be from eSewa asking to verify my account. The website looked identical to the real eSewa login page but the URL was esewa-security-verify.com instead of the official domain. I entered my credentials before realizing it was fake. Immediate action needed to take down this phishing site.", category: "phishing" as const, incidentDate: "2026-06-15", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "New Baneshwor", amountLost: 15000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "anonymous" as const, status: "verified" as const, riskScore: 85, evidenceCount: 3, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00002", title: "Facebook Investment Scam - Gold Investment Nepal", description: "A Facebook page called 'Gold Investment Nepal' promised 50% returns in 30 days on gold trading. I invested NPR 200,000 and initially received small returns to build trust. When I tried to withdraw my principal amount, they blocked me on all platforms. The page is still active and scamming more people.", category: "investment_scam" as const, incidentDate: "2026-05-28", province: "Bagmati Pradesh", district: "Lalitpur", municipality: "Lalitpur Metropolitan City", location: "Patan", amountLost: 200000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "public" as const, status: "under_review" as const, riskScore: 92, evidenceCount: 5, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00003", title: "Fake Job Offer - Data Entry Scam", description: "Received a WhatsApp message offering work-from-home data entry job paying NPR 25,000/week. They asked me to pay NPR 5,000 as 'registration fee' and 'training material cost'. After payment, they stopped responding. The phone number is still active and sending the same message to others.", category: "fake_job" as const, incidentDate: "2026-06-10", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Thamel", amountLost: 5000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "anonymous" as const, status: "verified" as const, riskScore: 78, evidenceCount: 2, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00004", title: "Online Blackmail via Social Media", description: "Someone befriended me on Instagram and after gaining trust, convinced me to share personal photos. They are now blackmailing me for NPR 100,000 threatening to share the photos with my contacts. I have their Instagram handle and WhatsApp number. They claimed to be based in Kathmandu.", category: "online_blackmail" as const, incidentDate: "2026-06-12", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Koteshwor", amountLost: 0, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "private" as const, status: "under_review" as const, riskScore: 95, evidenceCount: 4, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00005", title: "Digital Wallet Fraud - Unauthorized Transactions", description: "Multiple unauthorized transactions totaling NPR 45,000 were made from my Khalti wallet at 3 AM while I was sleeping. I received OTP messages but by the time I woke up, the transactions were already completed. The money was transferred to three different Khalti IDs.", category: "digital_wallet_fraud" as const, incidentDate: "2026-06-08", province: "Bagmati Pradesh", district: "Bhaktapur", municipality: "Bhaktapur Municipality", location: "Suryabinayak", amountLost: 45000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "public" as const, status: "verified" as const, riskScore: 88, evidenceCount: 6, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00006", title: "Romance Scam - Army Officer Impersonation", description: "Met someone on Facebook who claimed to be a UN Peacekeeping officer from Nepal Army stationed abroad. After weeks of conversation, they asked for NPR 75,000 for 'emergency leave processing'. After sending money via eSewa, they disappeared. Found out the photos were stolen from a real army officer's profile.", category: "romance_scam" as const, incidentDate: "2026-05-20", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Maharajgunj", amountLost: 75000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "anonymous" as const, status: "resolved" as const, riskScore: 72, evidenceCount: 4, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00007", title: "Cyberbullying in College WhatsApp Group", description: "A classmate has been sending threatening and humiliating messages about me in our college WhatsApp group. They have created fake accounts to spread false rumors about my character. This has severely affected my mental health and academic performance. Screenshots attached as evidence.", category: "cyberbullying" as const, incidentDate: "2026-06-01", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Kirtipur", amountLost: 0, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "private" as const, status: "verified" as const, riskScore: 65, evidenceCount: 3, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00008", title: "Bank Fraud - Fake Nabil Bank Call", description: "Received a call from someone claiming to be from Nabil Bank customer service. They said my card was being used fraudulently and asked for OTP to 'block' the transaction. After sharing the OTP, NPR 35,000 was deducted from my account within minutes. The caller number and call recording attached.", category: "bank_fraud" as const, incidentDate: "2026-06-14", province: "Bagmati Pradesh", district: "Lalitpur", municipality: "Lalitpur Metropolitan City", location: "Jawalakhel", amountLost: 35000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "public" as const, status: "under_review" as const, riskScore: 90, evidenceCount: 2, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00009", title: "Identity Theft - Fake Social Media Accounts", description: "Someone created fake Facebook and Instagram accounts using my name, photos, and personal information. They are messaging my friends and family asking for money, claiming I am in an emergency. I have received complaints from at least 10 people. The fake accounts are still active.", category: "identity_theft" as const, incidentDate: "2026-06-05", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Baneshwor", amountLost: 0, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "public" as const, status: "verified" as const, riskScore: 70, evidenceCount: 5, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00010", title: "Cryptocurrency Investment Scam", description: "A Telegram group called 'Nepal Crypto Traders' offered guaranteed 200% returns on Bitcoin investment. I invested NPR 150,000 and was shown fake profit screenshots. When I tried to withdraw, they demanded additional 'tax' and 'verification fees' totaling NPR 50,000 more. Total loss NPR 200,000.", category: "investment_scam" as const, incidentDate: "2026-05-15", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Durbarmarg", amountLost: 200000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "anonymous" as const, status: "verified" as const, riskScore: 96, evidenceCount: 7, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00011", title: "Online Marketplace Scam - Hamrobazar", description: "Listed a phone for sale on Hamrobazar. A buyer contacted me and sent a fake payment screenshot claiming they paid via eSewa. They then convinced me to ship the phone before the payment cleared. After receiving the phone, they blocked me. The phone was worth NPR 85,000.", category: "online_scam" as const, incidentDate: "2026-06-03", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "New Road", amountLost: 85000, currency: "NPR" as const, language: "en" as const, victimType: "individual" as const, privacyLevel: "public" as const, status: "under_review" as const, riskScore: 60, evidenceCount: 3, isDefamationAcknowledged: true },
    { caseNumber: "SCR-2026-00012", title: "Fake Government Job Website", description: "Website nepal-govt-jobs.fake is collecting NPR 2,000 as 'application fee' for various government positions. They claim to be the official PSC job portal. Many job seekers have been scammed. The website design looks very official with government logos and forms.", category: "fake_website" as const, incidentDate: "2026-05-25", province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", location: "Singha Durbar Area", amountLost: 2000, currency: "NPR" as const, language: "en" as const, victimType: "business" as const, privacyLevel: "public" as const, status: "verified" as const, riskScore: 82, evidenceCount: 4, isDefamationAcknowledged: true },
  ];

  for (let i = 0; i < reportData.length; i++) {
    const r = reportData[i];
    const reportValues = {
      ...r,
      amountLost: r.amountLost ? r.amountLost.toString() : null,
      reporterId: (6 + (i % 10)) as any, // assign to users 6-15
    };
    const [report] = await db.insert(reports).values(reportValues);
    const reportId = Number(report.insertId);

    // Add timeline entries
    await db.insert(caseTimeline).values({
      reportId,
      status: "submitted" as const,
      title: "Report Submitted",
      description: "Your cybercrime report has been submitted successfully.",
      actorRole: "system" as const,
    });

    if (["under_review", "verified", "resolved"].includes(r.status)) {
      await db.insert(caseTimeline).values({
        reportId,
        status: "under_review" as const,
        title: "Under Review",
        description: "A moderator is reviewing your report and evidence.",
        actorRole: "moderator" as const,
      });
    }

    if (["verified", "resolved"].includes(r.status)) {
      await db.insert(caseTimeline).values({
        reportId,
        status: "verified" as const,
        title: "Report Verified",
        description: "Your report has been verified. The reported entity has been flagged in our database.",
        actorRole: "moderator" as const,
      });
    }

    if (r.status === "resolved") {
      await db.insert(caseTimeline).values({
        reportId,
        status: "resolved" as const,
        title: "Case Resolved",
        description: "The case has been resolved. Appropriate action has been taken against the reported entity.",
        actorRole: "moderator" as const,
      });
    }
  }

  // Seed articles
  const articleData = [
    { title: "How to Identify Phishing Emails in Nepal", slug: "identify-phishing-emails", excerpt: "Learn the warning signs of phishing emails targeting Nepali internet users and how to protect yourself.", content: "Phishing emails are becoming increasingly common in Nepal. Scammers often impersonate banks, eSewa, Khalti, and government agencies. Key warning signs include: suspicious sender addresses, urgent language demanding immediate action, requests for passwords or OTPs, and links that don't match the official domain. Always verify the sender's email address, hover over links to see the actual URL, and never share your OTP or passwords. If in doubt, contact the organization directly through their official channels.", category: "safety_tip" as const, author: "Cyber Security Awareness Team", coverImage: "/illustration-scam.jpg", isPublished: true, publishedAt: new Date("2026-06-01") },
    { title: "Latest Alert: Fake eSewa Websites Circulating", slug: "fake-esewa-websites-alert", excerpt: "URGENT: Multiple fake eSewa websites have been reported. Do not enter your credentials on any site other than the official esewa.com.np.", content: "The Nepal Police Cyber Bureau has issued an alert regarding fake eSewa websites that have been circulating via SMS and social media. These websites are designed to look identical to the official eSewa portal but are designed to steal your login credentials. Remember: eSewa will NEVER ask for your password or OTP via email, SMS, or phone call. The only official website is esewa.com.np. If you have already entered your credentials on a suspicious site, change your password immediately and contact eSewa customer support.", category: "scam_alert" as const, author: "Nepal Police Cyber Bureau", coverImage: "/illustration-scam.jpg", isPublished: true, publishedAt: new Date("2026-06-18") },
    { title: "Step-by-Step Guide to Reporting Cybercrime", slug: "guide-reporting-cybercrime", excerpt: "A comprehensive guide on how to report cybercrime incidents through SaanjhCyber platform.", content: "Reporting cybercrime is now easier than ever with SaanjhCyber. Follow these steps: 1. Gather all evidence including screenshots, chat logs, transaction details, and any communication with the suspect. 2. Document the timeline of events. 3. Visit saanjhcyber.gov.np and click 'File a Report'. 4. Fill in all required details including incident date, location, and description. 5. Upload your evidence files. 6. Review and submit your report. You will receive a case number to track the status of your report.", category: "guide" as const, author: "SaanjhCyber Team", coverImage: "/illustration-report.jpg", isPublished: true, publishedAt: new Date("2026-05-15") },
    { title: "Understanding Online Blackmail and Sextortion", slug: "understanding-online-blackmail", excerpt: "Online blackmail is a serious crime. Learn what it is, how to protect yourself, and where to get help.", content: "Online blackmail, also known as sextortion, occurs when someone threatens to share private and sensitive material unless you meet their demands. In Nepal, this is a punishable offense under the Electronic Transactions Act. If you are a victim: 1. Do NOT pay the blackmailer - they will likely continue demanding more. 2. Preserve all evidence - screenshots, messages, call logs. 3. Report immediately to SaanjhCyber or Nepal Police Cyber Bureau. 4. Contact cybercrime helpline at 1149. 5. Remember that you are not alone and help is available.", category: "safety_tip" as const, author: "Mental Health & Cyber Safety Team", coverImage: "/illustration-privacy.jpg", isPublished: true, publishedAt: new Date("2026-05-20") },
    { title: "Investment Scams: Red Flags to Watch For", slug: "investment-scams-red-flags", excerpt: "Protect your hard-earned money by learning to recognize investment scam red flags common in Nepal.", content: "Investment scams are among the most financially devastating cybercrimes. Common red flags include: guaranteed high returns with no risk, pressure to invest immediately, unregistered investment companies, requests to recruit friends and family, complex strategies that are hard to understand, and unprofessional communication. In Nepal, always verify that investment companies are registered with the Securities Board of Nepal (SEBON). Never invest money you cannot afford to lose. If it sounds too good to be true, it probably is.", category: "safety_tip" as const, author: "Financial Crime Unit", coverImage: "/illustration-scam.jpg", isPublished: true, publishedAt: new Date("2026-04-10") },
    { title: "Cyberbullying: Impact and Prevention", slug: "cyberbullying-impact-prevention", excerpt: "Cyberbullying affects thousands of Nepali students and professionals. Learn how to identify, prevent, and report it.", content: "Cyberbullying involves using digital platforms to harass, threaten, or humiliate someone. In Nepal, with increasing social media usage among youth, cyberbullying has become a significant concern. Effects include anxiety, depression, decreased academic performance, and in severe cases, self-harm. Prevention strategies: keep personal information private, block and report bullies, save evidence, talk to trusted adults, and report to SaanjhCyber. Under Nepal's Cybercrime Law, cyberbullying can result in fines up to NPR 200,000 and imprisonment up to 3 years.", category: "safety_tip" as const, author: "Youth Safety Initiative", coverImage: "/illustration-cyberbully.jpg", isPublished: true, publishedAt: new Date("2026-03-25") },
    { title: "Emergency Contacts for Cybercrime in Nepal", slug: "emergency-contacts-cybercrime", excerpt: "Keep these important contacts handy in case you become a victim of cybercrime.", content: "Nepal Police Cyber Bureau: 01-4412480, Nepal Police Hotline: 100, Cybercrime Helpline: 1149, eSewa Support: 1660-01-02121, Khalti Support: 1660-01-52255, NCELL: 9801005000, NTC: 1498. For mental health support: TPO Nepal Crisis Hotline: 1660-01-02222, Mental Health Helpline: 1660-01-27755. Remember: Report cybercrime as soon as possible to increase chances of recovery.", category: "resource" as const, author: "SaanjhCyber Support", coverImage: "/illustration-privacy.jpg", isPublished: true, publishedAt: new Date("2026-01-15") },
    { title: "New Fake Job Scam Targeting Fresh Graduates", slug: "fake-job-scam-graduates", excerpt: "Scammers are targeting fresh graduates with fake job offers requiring upfront payment for 'registration'.", content: "A new wave of fake job scams is targeting recent graduates in Nepal. Scammers create professional-looking websites and send emails offering lucrative positions at reputed companies. They ask for 'registration fees', 'background check fees', or 'training material costs' ranging from NPR 2,000 to 15,000. Remember: No legitimate employer asks for money during the hiring process. Always verify job offers by contacting the company directly through their official website. Check if the company is registered with the Office of Company Registrar.", category: "scam_alert" as const, author: "Employment Fraud Unit", coverImage: "/illustration-scam.jpg", isPublished: true, publishedAt: new Date("2026-06-20") },
  ];

  for (const a of articleData) {
    await db.insert(articles).values(a);
  }

  // Seed participants for research
  const participantData = [
    { participantId: "P-001", ageGroup: "25-34" as const, gender: "male" as const, education: "bachelor" as const, occupation: "professional" as const, techProficiency: "intermediate" as const, district: "Kathmandu", deviceUsed: "desktop" as const, hasReportedBefore: false },
    { participantId: "P-002", ageGroup: "18-24" as const, gender: "female" as const, education: "bachelor" as const, occupation: "student" as const, techProficiency: "advanced" as const, district: "Lalitpur", deviceUsed: "mobile" as const, hasReportedBefore: true },
    { participantId: "P-003", ageGroup: "35-44" as const, gender: "male" as const, education: "master" as const, occupation: "professional" as const, techProficiency: "intermediate" as const, district: "Bhaktapur", deviceUsed: "desktop" as const, hasReportedBefore: false },
    { participantId: "P-004", ageGroup: "45-54" as const, gender: "female" as const, education: "bachelor" as const, occupation: "professional" as const, techProficiency: "beginner" as const, district: "Kathmandu", deviceUsed: "tablet" as const, hasReportedBefore: false },
    { participantId: "P-005", ageGroup: "55-64" as const, gender: "male" as const, education: "secondary" as const, occupation: "retired" as const, techProficiency: "beginner" as const, district: "Kathmandu", deviceUsed: "desktop" as const, hasReportedBefore: false },
    { participantId: "P-006", ageGroup: "25-34" as const, gender: "female" as const, education: "master" as const, occupation: "professional" as const, techProficiency: "advanced" as const, district: "Lalitpur", deviceUsed: "mobile" as const, hasReportedBefore: true },
    { participantId: "P-007", ageGroup: "18-24" as const, gender: "male" as const, education: "bachelor" as const, occupation: "student" as const, techProficiency: "intermediate" as const, district: "Bhaktapur", deviceUsed: "desktop" as const, hasReportedBefore: false },
    { participantId: "P-008", ageGroup: "35-44" as const, gender: "female" as const, education: "phd" as const, occupation: "professional" as const, techProficiency: "expert" as const, district: "Kathmandu", deviceUsed: "desktop" as const, hasReportedBefore: false },
    { participantId: "P-009", ageGroup: "25-34" as const, gender: "male" as const, education: "bachelor" as const, occupation: "professional" as const, techProficiency: "intermediate" as const, district: "Kathmandu", deviceUsed: "mobile" as const, hasReportedBefore: false },
    { participantId: "P-010", ageGroup: "45-54" as const, gender: "female" as const, education: "master" as const, occupation: "professional" as const, techProficiency: "beginner" as const, district: "Lalitpur", deviceUsed: "tablet" as const, hasReportedBefore: false },
    { participantId: "P-011", ageGroup: "18-24" as const, gender: "male" as const, education: "secondary" as const, occupation: "student" as const, techProficiency: "beginner" as const, district: "Kathmandu", deviceUsed: "mobile" as const, hasReportedBefore: false },
    { participantId: "P-012", ageGroup: "55-64" as const, gender: "female" as const, education: "bachelor" as const, occupation: "retired" as const, techProficiency: "beginner" as const, district: "Bhaktapur", deviceUsed: "desktop" as const, hasReportedBefore: false },
  ];

  for (const p of participantData) {
    await db.insert(participants).values(p);
  }

  // Seed surveys (SUS scores)
  const surveyData = [
    { participantId: "P-001", susScore: 72.5, responses: JSON.stringify([4,2,4,2,3,2,4,2,3,3]), taskCompletionTime: 180, errorsMade: 1, easeOfUse: 7, usefulness: 8, trustScore: 8, accessibilityRating: 7, comments: "The platform is intuitive and easy to use. I was able to submit a report without any confusion." },
    { participantId: "P-002", susScore: 85.0, responses: JSON.stringify([5,1,5,1,4,1,5,1,4,2]), taskCompletionTime: 120, errorsMade: 0, easeOfUse: 9, usefulness: 9, trustScore: 9, accessibilityRating: 8, comments: "Excellent platform! Very clean interface and the search feature is powerful." },
    { participantId: "P-003", susScore: 62.5, responses: JSON.stringify([3,2,4,3,3,3,3,2,3,3]), taskCompletionTime: 240, errorsMade: 2, easeOfUse: 6, usefulness: 7, trustScore: 7, accessibilityRating: 6, comments: "Good overall but could use more tooltips and guidance for first-time users." },
    { participantId: "P-004", susScore: 55.0, responses: JSON.stringify([3,3,3,3,2,3,3,3,2,3]), taskCompletionTime: 300, errorsMade: 3, easeOfUse: 5, usefulness: 7, trustScore: 7, accessibilityRating: 5, comments: "I found it a bit difficult to navigate. More prominent help buttons would be useful." },
    { participantId: "P-005", susScore: 45.0, responses: JSON.stringify([2,3,2,3,2,3,2,3,2,3]), taskCompletionTime: 420, errorsMade: 5, easeOfUse: 4, usefulness: 6, trustScore: 6, accessibilityRating: 4, comments: "The text is too small for me. I would prefer larger fonts and simpler language." },
    { participantId: "P-006", susScore: 90.0, responses: JSON.stringify([5,1,5,1,5,1,5,1,5,1]), taskCompletionTime: 90, errorsMade: 0, easeOfUse: 10, usefulness: 10, trustScore: 9, accessibilityRating: 9, comments: "Outstanding! This is exactly what Nepal needs. Very professional and well-designed." },
    { participantId: "P-007", susScore: 67.5, responses: JSON.stringify([4,2,3,2,4,2,3,2,4,3]), taskCompletionTime: 200, errorsMade: 1, easeOfUse: 7, usefulness: 7, trustScore: 7, accessibilityRating: 7, comments: "Pretty good platform. The case tracking feature is very helpful." },
    { participantId: "P-008", susScore: 77.5, responses: JSON.stringify([4,1,5,2,4,1,4,2,4,2]), taskCompletionTime: 150, errorsMade: 0, easeOfUse: 8, usefulness: 9, trustScore: 8, accessibilityRating: 8, comments: "Well-designed with good attention to security and privacy. The defamation disclaimer is a good addition." },
    { participantId: "P-009", susScore: 70.0, responses: JSON.stringify([4,2,4,2,3,2,4,2,3,3]), taskCompletionTime: 165, errorsMade: 1, easeOfUse: 7, usefulness: 8, trustScore: 8, accessibilityRating: 7, comments: "Clean interface. The multi-step reporting form is well-organized." },
    { participantId: "P-010", susScore: 50.0, responses: JSON.stringify([2,2,3,3,2,3,3,3,2,3]), taskCompletionTime: 350, errorsMade: 4, easeOfUse: 5, usefulness: 6, trustScore: 6, accessibilityRating: 5, comments: "Took me a while to understand how to use it. Video tutorials would be very helpful." },
    { participantId: "P-011", susScore: 65.0, responses: JSON.stringify([3,2,4,2,3,2,4,3,3,3]), taskCompletionTime: 210, errorsMade: 2, easeOfUse: 6, usefulness: 7, trustScore: 7, accessibilityRating: 6, comments: "Good platform overall. The mobile experience could be improved." },
    { participantId: "P-012", susScore: 52.5, responses: JSON.stringify([3,3,3,3,2,3,3,3,2,3]), taskCompletionTime: 380, errorsMade: 3, easeOfUse: 5, usefulness: 6, trustScore: 7, accessibilityRating: 5, comments: "I appreciate the effort but it needs to be more senior-citizen friendly." },
  ];

  for (const s of surveyData) {
    await db.insert(surveys).values({
      ...s,
      susScore: s.susScore.toString(),
    });
  }

  // Seed feedback
  const feedbackData = [
    { type: "usability" as const, rating: 4, message: "The platform is very user-friendly. I was able to navigate through different sections easily.", page: "/dashboard" },
    { type: "feature" as const, rating: 5, message: "The case tracking feature is excellent. I can see exactly what is happening with my report.", page: "/track" },
    { type: "bug" as const, rating: 3, message: "The search function sometimes returns results slowly when searching for phone numbers.", page: "/search" },
    { type: "usability" as const, rating: 4, message: "The multi-step reporting form is well designed. Breaking it into steps makes it less overwhelming.", page: "/report" },
    { type: "feature" as const, rating: 5, message: "Having Nepali language support is crucial. Please expand the Nepali interface coverage.", page: "/report" },
    { type: "general" as const, rating: 4, message: "Great initiative for Nepal. This platform fills a critical gap in cybercrime reporting.", page: "/" },
    { type: "usability" as const, rating: 3, message: "The mobile view could use some improvement. Some buttons are too small on phone screens.", page: "/search" },
    { type: "feature" as const, rating: 5, message: "The defamation awareness checkbox is an important feature. It makes people think before reporting.", page: "/report" },
    { type: "bug" as const, rating: 3, message: "When uploading large PDF files, the progress indicator doesn't update correctly.", page: "/report" },
    { type: "general" as const, rating: 5, message: "As a researcher, I find the analytics dashboard extremely valuable for understanding cybercrime trends in Nepal.", page: "/research" },
  ];

  for (const f of feedbackData) {
    await db.insert(feedback).values(f);
  }

  console.log("Seed completed successfully!");
}

seed().catch(console.error);

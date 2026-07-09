import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reports, entities, articles } from "@db/schema";
import { eq, like, sql, desc, or } from "drizzle-orm";

// ─── Security: sanitize data before exposing ───
function sanitizeReport(report: any) {
  return {
    caseNumber: report.caseNumber,
    title: report.title,
    category: report.category?.replace(/_/g, " "),
    status: report.status?.replace(/_/g, " "),
    incidentDate: report.incidentDate,
    province: report.province,
    district: report.district,
    riskScore: report.riskScore,
    createdAt: report.createdAt,
  };
}

function sanitizeEntity(entity: any) {
  return {
    value: entity.value,
    type: entity.type,
    riskLevel: entity.riskLevel,
    reportCount: entity.reportCount,
    verificationStatus: entity.verificationStatus?.replace(/_/g, " "),
  };
}

// ─── Smart Intent Detection ───
type Intent = {
  type: string;
  confidence: number;
  params: Record<string, string>;
};

function detectIntent(message: string): Intent {
  const msg = message.toLowerCase().trim();
  const words = msg.split(/\s+/);

  // 1. Case number detection (highest priority)
  const caseMatch = message.match(/SCR-\d{4}-\d{4,5}/i);
  if (caseMatch) return { type: "track_case", confidence: 1, params: { caseNumber: caseMatch[0].toUpperCase() } };

  // Partial case number
  if (msg.match(/scr-?\d/i) || (msg.includes("case") && msg.match(/\d{4,}/)))
    return { type: "track_help", confidence: 0.8, params: {} };

  // 2. Entity detection — phone, email, domain, URL
  const phoneMatch = msg.match(/(\+977[-\s]?\d{7,10}|\b98\d{8}\b|\b97\d{8}\b|\b0\d{1,2}[-\s]?\d{6,7}\b|\b\d{10}\b)/);
  if (phoneMatch) return { type: "lookup_entity", confidence: 0.95, params: { query: phoneMatch[0].replace(/\s/g, "") } };

  const emailMatch = msg.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) return { type: "lookup_entity", confidence: 0.95, params: { query: emailMatch[0] } };

  const urlMatch = msg.match(/(https?:\/\/)?[\w.-]+\.(com|np|org|net|xyz|fake|info|io|gov|edu|co)(\/\S*)?/i);
  if (urlMatch) return { type: "lookup_entity", confidence: 0.9, params: { query: urlMatch[0].replace(/^https?:\/\//, "") } };

  const socialMatch = msg.match(/@[\w.]{3,}/) || msg.match(/facebook\.com\/\S+|instagram\.com\/\S+|t\.me\/\S+|tiktok\.com\/@\S+/i);
  if (socialMatch) return { type: "lookup_entity", confidence: 0.9, params: { query: socialMatch[0] } };

  // 3. Keyword-based intent with synonyms
  const intentMap: [string[], string][] = [
    [["track", "status", "progress", "update", "where is", "my case", "my report", "case number", "check status"], "track_help"],
    [["report", "file", "submit", "how to report", "lodge", "complain", "register complaint"], "how_to_report"],
    [["phishing", "phish", "fake email", "suspicious email", "fake sms", "fake link"], "tip_phishing"],
    [["scam", "fraud", "cheated", "lost money", "taken money", "duped", "tricked"], "tip_scam"],
    [["blackmail", "sextortion", "threatening", "leaked photo", "private photo", "intimate", "extort"], "tip_blackmail"],
    [["password", "otp", "pin", "credential", "login detail", "account hack", "hacked"], "tip_security"],
    [["esewa", "khalti", "mobile banking", "digital wallet", "fonepay", "imepay"], "tip_wallet"],
    [["investment", "crypto", "bitcoin", "forex", "mlm", "ponzi", "pyramid", "high return"], "tip_investment"],
    [["job", "employment", "hiring", "work from home", "online job", "data entry job", "typing job"], "tip_fake_job"],
    [["identity", "stolen identity", "fake account", "impersonat", "someone using my"], "tip_identity"],
    [["help", "emergency", "police", "contact", "call", "number", "helpline", "hotline"], "emergency"],
    [["hello", "hi", "hey", "good morning", "good evening", "namaste", "k cha"], "greeting"],
    [["thank", "thanks", "dhanyabad", "appreciated"], "thanks"],
    [["what can you do", "features", "what is this", "about", "who are you", "capabilities"], "about"],
    [["safe", "protect", "prevention", "avoid", "stay safe", "tips", "advice", "how to be safe"], "tip_general_safety"],
    [["verify", "check", "lookup", "is this safe", "is this real", "is this legit", "real or fake"], "lookup_prompt"],
    [["awareness", "article", "read", "learn", "guide", "resource", "blog"], "awareness"],
    [["agent", "live agent", "human", "talk to someone", "real person", "operator", "connect me", "speak to", "live chat", "live support"], "live_agent"],
  ];

  for (const [keywords, intent] of intentMap) {
    const matchCount = keywords.filter(k => msg.includes(k)).length;
    if (matchCount > 0) {
      return { type: intent, confidence: Math.min(0.5 + matchCount * 0.2, 0.95), params: {} };
    }
  }

  // 4. If message looks like it contains something to look up
  if (words.length <= 4 && !msg.includes("?") && msg.length > 5) {
    // Could be an entity they want to check
    return { type: "lookup_entity", confidence: 0.4, params: { query: msg } };
  }

  return { type: "unknown", confidence: 0, params: {} };
}

// ─── Knowledge Base ───
const KB: Record<string, string> = {
  greeting: `👋 Namaste! I'm **SaanjhCyber AI Assistant** — your cybercrime safety companion.

I can help you with:
🔍 **Verify** — Paste a phone number, email, URL, or social media handle
📋 **Track** — Give me your case number (SCR-XXXX-XXXXX)
🛡️ **Safety** — Ask about scams, phishing, blackmail, passwords
📝 **Report** — I'll guide you to file a cybercrime report
🚨 **Emergency** — Get instant contact numbers

Just type naturally — I understand Nepali context!`,

  thanks: `You're welcome! 🙏 Stay safe online. Remember:
• Never share OTP or passwords with anyone
• Report suspicious activity immediately
• If something feels too good to be true, it probably is

Need anything else? Just ask!`,

  about: `I'm the **SaanjhCyber AI Assistant** — built to help Nepal's citizens stay safe from cybercrime.

**What I can do:**
• Look up phone numbers, emails, and websites in our scam database
• Track your case status by case number
• Provide safety tips tailored to Nepal's digital landscape
• Guide you through filing a report
• Connect you with emergency contacts

**What I won't do:**
• I never share other people's private information
• I don't store your conversations
• I don't access your account without your permission

Ask me anything about cybersecurity! 🇳🇵`,

  track_help: `📋 **Track Your Case**

To check your case status, just paste your **case number** here. It looks like:
\`SCR-2026-00001\`

You received this number when you submitted your report.

**Can't find it?**
• Check your email (if you registered with one)
• Visit [/dashboard](/dashboard) to see all your reports
• Visit [/track](/track) for the case tracker

**What status means:**
• 🔵 Submitted — We received your report
• 🟡 Under Review — A moderator is investigating
• 🟠 Need Info — We need more details from you
• 🟣 Verified — Confirmed as valid cybercrime
• 🟢 Resolved — Action has been taken
• ⚫ Closed/Rejected — Case closed`,

  how_to_report: `📝 **How to Report a Cybercrime**

1️⃣ Go to [/report](/report) or click "Report Crime" in the menu
2️⃣ Select the crime type (scam, phishing, blackmail, etc.)
3️⃣ Describe what happened in detail
4️⃣ Select your location (province → district → municipality)
5️⃣ Upload evidence (screenshots, chat logs, receipts)
6️⃣ Acknowledge the defamation disclaimer
7️⃣ Submit — you'll get a case number to track progress

**💡 Tips for a strong report:**
• Be specific about dates and amounts
• Include the suspect's contact info if you have it
• Upload as many screenshots as possible
• Mention if you've already reported to police

Ready? → [File a Report Now](/report)`,

  emergency: `🚨 **Emergency Contacts — Nepal**

**Law Enforcement:**
• Nepal Police: **100**
• Cyber Bureau: **01-4412480**
• Cybercrime Helpline: **1149**
• Women's Cell: **1145**

**Financial:**
• eSewa: **1660-01-02121**
• Khalti: **1660-01-52255**
• NRB Complaint: **01-4410158**

**Mental Health:**
• TPO Nepal Crisis: **1660-01-02222**
• Mental Health Helpline: **1660-01-27755**

**⚡ If you're in immediate danger, call 100 first.**

You can also message our moderators directly through [/messages](/messages).`,

  tip_phishing: `🎣 **Phishing — How to Spot & Avoid It**

**What is phishing?**
Scammers create fake websites/emails/SMS that look like real services (banks, eSewa, government) to steal your credentials.

**Red flags:**
• Email from "eswea-support@gmail.com" (misspelled, not official domain)
• SMS: "Your eSewa account is blocked, click here to verify"
• WhatsApp: "Nepal Rastra Bank requires KYC update"
• URL that's slightly wrong: esewa-verify.com instead of esewa.com.np

**What to do:**
✅ Always type the official URL yourself
✅ Check for HTTPS and the exact domain spelling
✅ Never enter OTP on a link you received
✅ Report suspicious links to us at [/report](/report)

**Already fell for it?**
1. Change your password IMMEDIATELY
2. Call your bank/wallet provider
3. Report to us — we'll track the scam domain`,

  tip_scam: `⚠️ **Scam Protection — Nepal Edition**

**Most common scams in Nepal:**
1. 💰 Investment scams (crypto, forex, gold trading)
2. 💼 Fake job offers (data entry, typing, "work from home")
3. 🏦 Bank/eSewa impersonation calls
4. 💕 Romance scams
5. 🎁 Lottery/prize "winner" messages

**Universal red flags:**
• "Guaranteed returns" with zero risk
• Pressure to act immediately
• Payment required before receiving something
• Unregistered or unverifiable companies
• They contacted YOU first (not the other way around)

**Golden rule:** If it sounds too good to be true → it's a scam.

**Already scammed?**
• File a report: [/report](/report)
• Call Cyber Bureau: 01-4412480
• Don't feel ashamed — scammers are professionals`,

  tip_blackmail: `🔒 **Online Blackmail / Sextortion — What To Do**

**If someone is threatening to share your private content:**

❌ **DO NOT** pay them — paying NEVER stops blackmail
❌ **DO NOT** engage in further conversation
❌ **DO NOT** delete evidence

✅ **DO** screenshot EVERYTHING (threats, profile, messages)
✅ **DO** block them on all platforms
✅ **DO** report their profile to the social media platform
✅ **DO** file a report: [/report](/report)
✅ **DO** call: Cyber Bureau 01-4412480 or helpline 1149

**Important:**
• This is a CRIME. You are the victim, not the criminal.
• Under Nepal's Electronic Transactions Act, this carries up to 5 years imprisonment for the blackmailer.
• You are NOT alone. Thousands face this.

**Need to talk?** Mental Health Helpline: 1660-01-02222`,

  tip_security: `🔐 **Password & Account Security**

**Your OTP is like your house key — never share it!**

**Rules to live by:**
1. **Never share OTP** — Not with "bank staff", not with "eSewa support", not with anyone
2. **Use strong passwords** — Mix letters, numbers, symbols (min 12 characters)
3. **Different passwords** for different accounts
4. **Enable 2FA** on important accounts (email, banking)
5. **Don't reuse** passwords across sites

**If your account is hacked:**
1. Try "Forgot Password" immediately
2. Contact the platform's support
3. Check if your email was compromised (change that too)
4. Report to us if money was stolen: [/report](/report)

**💡 Pro tip:** Use a password manager (Bitwarden is free)`,

  tip_wallet: `📱 **Digital Wallet Safety (eSewa, Khalti, FonePay)**

**Common attacks:**
• Fake "verification" calls asking for PIN/OTP
• Phishing websites mimicking login pages
• QR code scams at shops
• "Send me Rs 1 to verify" tricks

**Stay safe:**
✅ Only use official apps from Play Store / App Store
✅ Never share PIN or OTP over phone/message
✅ Set a strong MPIN (not 1234 or your birthday)
✅ Enable biometric login if available
✅ Check transaction SMS immediately

**If unauthorized transactions happened:**
1. Lock your wallet immediately (call support)
2. eSewa: 1660-01-02121
3. Khalti: 1660-01-52255
4. File police report + report on [/report](/report)`,

  tip_investment: `💰 **Investment Scam Red Flags**

**In Nepal, these are almost ALWAYS scams:**
• "Invest 10,000, earn 50,000 in 30 days"
• Telegram groups promising daily crypto profits
• "Gold/forex trading" with guaranteed returns
• MLM schemes requiring recruitment
• Unregistered companies with no office address

**How to verify:**
• Check SEBON registration: sebon.gov.np
• Check Company Registrar: ocr.gov.np
• No registration = illegal operation

**Already invested?**
• Stop investing more immediately
• Collect all evidence (receipts, screenshots, group chats)
• File a report: [/report](/report)
• Report to Nepal Police Economic Crime Unit

**Remember:** Legitimate investments ALWAYS carry risk. Anyone guaranteeing returns is lying.`,

  tip_fake_job: `💼 **Fake Job Scams**

**Warning signs:**
• "Work from home — NPR 25,000/week guaranteed"
• Job requires paying "registration fee" or "training cost"
• No interview, immediate "selection"
• WhatsApp/Telegram only (no official email)
• Company has no verifiable address or website

**Legitimate employers NEVER:**
❌ Ask you to pay money to get a job
❌ Hire without any interview
❌ Operate only through messaging apps
❌ Promise unrealistic salaries for simple tasks

**Verify jobs through:**
• Company's official website (not links sent to you)
• MeroJob, JobsNepal (registered portals)
• Visit the office in person if possible

**Scammed?** Report it: [/report](/report) — Help us warn others!`,

  tip_identity: `👤 **Identity Theft — What To Do**

**Someone is using your photos/name/info online:**

**Immediate steps:**
1. Report fake accounts to the platform (Facebook, Instagram, etc.)
2. Screenshot the fake profiles before they're deleted
3. Inform your contacts that fake accounts exist
4. File a report: [/report](/report)
5. Consider posting a warning on your real profile

**Prevention:**
• Set social media profiles to private
• Don't accept requests from unknown people
• Watermark personal photos if sharing publicly
• Enable login alerts on all accounts
• Regularly search your name to find imposters

**Under Nepal law:** Identity theft is punishable under the Electronic Transactions Act.`,

  tip_general_safety: `🛡️ **General Cyber Safety Tips for Nepal**

**Daily habits:**
• Think before you click ANY link
• Verify before you trust ANY caller
• Never share OTP, PIN, or password with ANYONE
• Keep apps and phone software updated
• Use different passwords for different accounts

**Social media:**
• Set profiles to private/friends-only
• Don't share location in real-time
• Be careful with friend requests from strangers
• Don't post personal documents (citizenship, license)

**Financial:**
• Enable transaction alerts (SMS/email)
• Check bank statements regularly
• Use official apps only (not browser on phone)
• Set low daily transaction limits

**If something happens:**
📞 Helpline: 1149
🌐 Report: [/report](/report)
💬 Chat with our team: [/messages](/messages)`,

  awareness: `📚 **Cyber Awareness Resources**

Visit our [Awareness Hub](/awareness) for:
• 🚨 **Scam Alerts** — Latest threats targeting Nepal
• 💡 **Safety Tips** — How to protect yourself online
• 📖 **Guides** — Step-by-step reporting instructions
• 📰 **News** — Updates from Nepal Cyber Bureau

**Latest articles available at** → [/awareness](/awareness)

**Quick tips I can help with:**
• Type "phishing" — learn about fake emails/websites
• Type "scam" — common scam types in Nepal
• Type "password" — account security tips
• Type "blackmail" — what to do if threatened
• Type "investment" — spot investment fraud

What topic interests you?`,

  live_agent: `👨‍💼 **Connect with Our Team**

To speak with a real person about your case:

1️⃣ **If you have a case filed:**
   → Go to [/messages](/messages) to message our moderators directly
   → They typically respond within 24 hours

2️⃣ **For immediate help:**
   → Call Cyber Bureau: **01-4412480**
   → Cybercrime Helpline: **1149**
   → Nepal Police: **100**

3️⃣ **To start a new conversation:**
   → File a report at [/report](/report) first
   → Then use [/messages](/messages) to chat with the assigned team

💡 **Tip:** Include your case number (SCR-XXXX-XXXXX) when messaging so the team can quickly find your case.

Our moderators and cyber police team are available Mon-Fri 9AM-5PM NPT.`,

  lookup_prompt: `🔍 **Entity Verification**

I can check if a phone number, email, website, or social media profile has been reported as suspicious.

**Just paste the identifier:**
• Phone: +977-9801234567 or 9801234567
• Email: example@domain.com
• Website: suspicious-site.com
• Social: @username or facebook.com/pagename

I'll search our database and tell you:
• Risk level (low → critical)
• Number of reports filed
• Verification status

**Try it now** — paste something to check!`,

  unknown: `I'm not sure I understood that. Let me help you better! Try:

🔍 **Paste** a phone number, email, or URL to verify it
📋 **Type** your case number (SCR-XXXX-XXXXX) to track it
❓ **Ask** about: scams, phishing, blackmail, passwords, investment fraud
📝 **Say** "how to report" for reporting guidance
🚨 **Say** "emergency" for helpline numbers

**Or ask me in plain language like:**
• "Is 9801234567 a scam number?"
• "Someone is blackmailing me, what do I do?"
• "How do I protect my eSewa account?"
• "What is the status of my case?"

I understand context — just talk to me naturally! 🇳🇵`,
};

// ─── Router ───
export const chatRouter = createRouter({
  send: publicQuery
    .input(z.object({ message: z.string().min(1).max(1000) }))
    .mutation(async ({ input, ctx }) => {
      const { type, confidence, params } = detectIntent(input.message);
      const db = getDb();

      // ─── Case Tracking ───
      if (type === "track_case") {
        const [report] = await db.select().from(reports)
          .where(eq(reports.caseNumber, params.caseNumber));

        if (!report) {
          return {
            response: `❌ No case found with number **${params.caseNumber}**.\n\nDouble-check the format: \`SCR-YYYY-XXXXX\`\n\nCan't find your number?\n• Check [/dashboard](/dashboard) for your reports\n• Contact us at [/messages](/messages)`,
            intent: type,
          };
        }

        const isOwner = ctx.user && report.reporterId === ctx.user.id;
        const isPublic = report.privacyLevel === "public";

        if (!isOwner && !isPublic) {
          return {
            response: `🔒 Case **${params.caseNumber}** is marked as **private**.\n\nTo view details, please [sign in](/login) with the account that filed this report.\n\nIf this is your case and you can't access it, contact our team via [/messages](/messages).`,
            intent: type,
          };
        }

        const safe = sanitizeReport(report);
        const statusEmoji: Record<string, string> = {
          submitted: "🔵", under_review: "🟡", need_info: "🟠",
          verified: "🟣", resolved: "🟢", rejected: "⚫", closed: "⚫",
        };
        const emoji = statusEmoji[report.status || ""] || "⚪";

        return {
          response: `📋 **Case ${safe.caseNumber}**\n\n${emoji} **Status:** ${safe.status}\n📁 **Category:** ${safe.category}\n📌 **Title:** ${safe.title}\n📅 **Incident:** ${safe.incidentDate}\n📍 **Location:** ${safe.district}, ${safe.province}\n⚡ **Risk Score:** ${safe.riskScore}/100\n🕐 **Filed:** ${new Date(safe.createdAt).toLocaleDateString()}\n\n→ [View Full Details](/track/${report.id})\n→ [Message the Team](/messages)`,
          intent: type,
        };
      }

      // ─── Entity Lookup ───
      if (type === "lookup_entity") {
        const query = params.query?.trim();
        if (!query || query.length < 3) {
          return { response: KB.lookup_prompt, intent: type };
        }

        const found = await db.select().from(entities)
          .where(or(
            like(entities.value, `%${query}%`),
            like(entities.value, `%${query.replace(/[-\s]/g, "")}%`)
          ))
          .orderBy(desc(entities.reportCount))
          .limit(5);

        if (found.length === 0) {
          // Try broader search
          const words = query.split(/[-.\s@]+/).filter(w => w.length > 2);
          let broadFound: any[] = [];
          for (const word of words.slice(0, 2)) {
            const results = await db.select().from(entities)
              .where(like(entities.value, `%${word}%`))
              .orderBy(desc(entities.reportCount))
              .limit(3);
            broadFound.push(...results);
          }

          if (broadFound.length === 0) {
            return {
              response: `✅ **"${query}"** is **not in our database**.\n\nThis means it hasn't been reported yet — but that doesn't guarantee it's safe.\n\n**Stay cautious if:**\n• They contacted you first\n• They're asking for money or personal info\n• The offer seems too good to be true\n\n🚩 Think it's suspicious? → [Report it](/report) to help protect others.`,
              intent: type,
            };
          }
          // Use broad results
          found.push(...broadFound);
        }

        const unique = [...new Map(found.map((e: any) => [e.id, e])).values()].slice(0, 4);
        const results = unique.map(sanitizeEntity);

        const riskEmoji = (r: string) => r === "critical" ? "🔴" : r === "high" ? "🟠" : r === "medium" ? "🟡" : "🟢";

        let response = `🔍 **Found ${results.length} result${results.length > 1 ? "s" : ""} for "${query}":**\n\n`;
        results.forEach((r, i) => {
          response += `${riskEmoji(r.riskLevel)} **${r.value}**\n`;
          response += `   ├ Type: ${r.type} | Risk: **${r.riskLevel}**\n`;
          response += `   ├ Reports: ${r.reportCount} | Status: ${r.verificationStatus}\n`;
          response += `   └─────────────────\n\n`;
        });

        const highRisk = results.some(r => r.riskLevel === "critical" || r.riskLevel === "high");
        if (highRisk) {
          response += `\n⚠️ **WARNING:** This entity has been flagged as high/critical risk. **Do not engage** with them.\n\nIf you've already interacted: → [File a Report](/report)`;
        } else {
          response += `\n💡 Exercise caution. Visit [/search](/search) for more details.`;
        }

        return { response, intent: type };
      }

      // ─── Awareness articles ───
      if (type === "awareness") {
        const recentArticles = await db.select({
          title: articles.title,
          slug: articles.slug,
          category: articles.category,
        }).from(articles)
          .where(eq(articles.isPublished, true))
          .orderBy(desc(articles.publishedAt))
          .limit(5);

        if (recentArticles.length > 0) {
          let response = `📚 **Latest from our Awareness Hub:**\n\n`;
          recentArticles.forEach((a, i) => {
            const catEmoji: Record<string, string> = { scam_alert: "🚨", safety_tip: "💡", guide: "📖", news: "📰", resource: "📋" };
            response += `${catEmoji[a.category] || "📄"} [${a.title}](/awareness/${a.slug})\n`;
          });
          response += `\n→ [View All Articles](/awareness)`;
          return { response, intent: type };
        }
        return { response: KB.awareness, intent: type };
      }

      // ─── Static KB responses ───
      if (KB[type]) {
        return { response: KB[type], intent: type };
      }

      // ─── Low confidence fallback with smart suggestion ───
      if (confidence < 0.3) {
        // Check if it looks like a question about Nepal cybercrime
        const msg = input.message.toLowerCase();
        if (msg.includes("nepal") || msg.includes("nepali")) {
          return {
            response: `I understand you're asking about cybercrime in Nepal. Here's what I can help with:\n\n🔍 **Verify** a phone/email/URL — just paste it\n📋 **Track** a case — share your case number\n🛡️ **Tips** — ask about scams, phishing, passwords\n📝 **Report** — say "how to report"\n🚨 **Emergency** — say "help"\n\nCould you be more specific about what you need?`,
            intent: "clarify",
          };
        }
      }

      return { response: KB[type] || KB.unknown, intent: type };
    }),
});

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  Shield, FileText, Search, AlertTriangle,
  Users, Clock, CheckCircle, ArrowRight, BookOpen,
  AlertOctagon, ChevronDown, BarChart3, Eye, Activity
} from "lucide-react";
import { trpc } from "@/providers/trpc";

// ─── Hero Section ───
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="Cybersecurity"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/80 via-[#1a1a2e]/70 to-[var(--pashmina-white)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--prayer-crimson)]/20 border border-[var(--prayer-crimson)]/30 rounded-full mb-6">
            <Shield className="w-4 h-4 text-[var(--prayer-gold)]" />
            <span className="text-sm font-medium text-[var(--prayer-gold)]">
              Official Cybercrime Reporting Portal of Nepal
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Report. Track. <span className="text-[var(--prayer-gold)]">Stay Safe.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            SaanjhCyber is Nepal&apos;s trusted platform for reporting cybercrime,
            verifying suspicious entities, and tracking your cases — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/report" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              <FileText className="w-5 h-5 mr-2" />
              File a Report
            </Link>
            <Link to="/search" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
              <Search className="w-5 h-5 mr-2" />
              Search Database
            </Link>
          </div>

          <QuickSearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: Shield, label: "Reports Filed", value: 2847 },
            { icon: CheckCircle, label: "Cases Resolved", value: 1923 },
            { icon: AlertTriangle, label: "Scams Detected", value: 456 },
            { icon: Users, label: "Citizens Protected", value: 15200 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-2">
                <stat.icon className="w-6 h-6 text-[var(--prayer-gold)]" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                <CountUp end={stat.value} duration={2} separator="," />
              </div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-white/50" />
      </motion.div>
    </section>
  );
}

function QuickSearchBar() {
  const [query, setQuery] = useState("");
  const navigate = (path: string) => { window.location.href = path; };

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search phone, email, domain, account..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query && navigate(`/search?q=${encodeURIComponent(query)}`)}
          className="w-full pl-12 pr-28 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--prayer-gold)] focus:border-transparent"
        />
        <button
          onClick={() => query && navigate(`/search?q=${encodeURIComponent(query)}`)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[var(--prayer-crimson)] text-[var(--prayer-gold)] rounded-lg font-semibold hover:brightness-110 transition-all"
        >
          Verify
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-white/50">
        <span>Try:</span>
        {["+977-9801234567", "fraud@esewa-nepal.com", "quickmoney-np.com"].map((example) => (
          <button
            key={example}
            onClick={() => navigate(`/search?q=${encodeURIComponent(example)}`)}
            className="px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 transition-colors"
          >
            {example.length > 15 ? example.slice(0, 15) + "..." : example}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Statistics Section ───
function StatisticsSection() {
  const { data: stats } = trpc.report.getStats.useQuery();

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    need_info: "bg-orange-100 text-orange-800",
    verified: "bg-purple-100 text-purple-800",
    rejected: "bg-gray-100 text-gray-800",
    closed: "bg-gray-100 text-gray-800",
    resolved: "bg-green-100 text-green-800",
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-header">Platform at a Glance</h2>
          <p className="text-[var(--thamel-gray)]/70 max-w-2xl mx-auto">
            Real-time statistics from our cybercrime reporting database, providing
            transparency and insights into Nepal&apos;s digital security landscape.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: FileText, label: "Total Reports", value: stats?.total || 2847, color: "text-[var(--prayer-crimson)]" },
            { icon: CheckCircle, label: "Resolved", value: stats?.resolvedThisMonth || 1923, color: "text-green-600" },
            { icon: Clock, label: "Under Review", value: stats?.byStatus?.find(s => s.status === "under_review")?.count || 342, color: "text-yellow-600" },
            { icon: AlertTriangle, label: "Avg. Risk Score", value: "76%", color: "text-orange-600", isText: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-3xl font-bold text-[var(--lattice-wood)] mb-1">
                {stat.isText ? stat.value : <CountUp end={stat.value as number} duration={2} separator="," />}
              </div>
              <div className="text-sm text-[var(--thamel-gray)]/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {stats?.byStatus && (
          <div className="flex flex-wrap justify-center gap-3">
            {stats.byStatus.map((s) => (
              <span key={s.status || "unknown"} className={`status-badge ${statusColors[s.status || ""] || "bg-gray-100 text-gray-800"}`}>
                {(s.status || "").replace("_", " ")}: {s.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Recent Reports Section ───
function RecentReportsSection() {
  const { data: reportsData } = trpc.report.list.useQuery({ page: 1, limit: 6 });
  const reports = reportsData?.items || [];

  const categoryLabels: Record<string, string> = {
    online_scam: "Online Scam",
    phishing: "Phishing",
    social_media_fraud: "Social Media Fraud",
    fake_job: "Fake Job",
    identity_theft: "Identity Theft",
    investment_scam: "Investment Scam",
    bank_fraud: "Bank Fraud",
    digital_wallet_fraud: "Digital Wallet Fraud",
    romance_scam: "Romance Scam",
    cyberbullying: "Cyberbullying",
    online_blackmail: "Online Blackmail",
    fake_website: "Fake Website",
    fake_app: "Fake App",
    unauthorized_access: "Unauthorized Access",
    hacking: "Hacking",
    other: "Other",
  };

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    need_info: "bg-orange-100 text-orange-800",
    verified: "bg-purple-100 text-purple-800",
    rejected: "bg-gray-100 text-gray-800",
    closed: "bg-gray-100 text-gray-800",
    resolved: "bg-green-100 text-green-800",
  };

  return (
    <section className="py-16 md:py-24 bg-[var(--pashmina-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10"
        >
          <div>
            <h2 className="section-header mb-2">Recent Reports</h2>
            <p className="text-[var(--thamel-gray)]/70">
              Latest cybercrime reports submitted by citizens across Nepal
            </p>
          </div>
          <Link to="/track" className="btn-secondary mt-4 sm:mt-0">
            View All Reports
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/track/${report.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono-code text-xs text-[var(--prayer-crimson)] font-semibold">
                  {report.caseNumber}
                </span>
                <span className={`status-badge ${statusColors[report.status || ""] || "bg-gray-100"}`}>
                  {(report.status || "").replace("_", " ")}
                </span>
              </div>
              <h3 className="font-semibold text-[var(--lattice-wood)] mb-2 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-sm text-[var(--thamel-gray)]/60 mb-3 line-clamp-2">
                {report.description}
              </p>
              <div className="flex items-center justify-between text-xs text-[var(--thamel-gray)]/50">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {categoryLabels[report.category] || report.category}
                </span>
                <span>{report.district}, {report.province?.replace(" Pradesh", "")}</span>
              </div>
              {report.riskScore && report.riskScore > 70 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>High Risk ({report.riskScore}%)</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ───
function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Easy Reporting",
      description: "Multi-step guided form to report cybercrime with evidence upload support. Anonymous reporting available.",
      color: "bg-[var(--prayer-crimson)]/10 text-[var(--prayer-crimson)]",
    },
    {
      icon: Search,
      title: "Entity Verification",
      description: "Search and verify suspicious phone numbers, emails, websites, social media accounts, and digital wallets.",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: BarChart3,
      title: "Case Tracking",
      description: "Track your submitted reports in real-time with detailed timeline and status updates.",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Choose your privacy level — public, anonymous, or private. Your data is encrypted and secure.",
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: Eye,
      title: "Defamation Awareness",
      description: "Mandatory acknowledgment and moderation workflow to reduce false accusations and protect the innocent.",
      color: "bg-orange-100 text-orange-700",
    },
    {
      icon: Activity,
      title: "Research Analytics",
      description: "Comprehensive dashboard for researchers with SUS scores, usability metrics, and pilot study results.",
      color: "bg-teal-100 text-teal-700",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-header">Platform Features</h2>
          <p className="text-[var(--thamel-gray)]/70 max-w-2xl mx-auto">
            Built with accessibility, privacy, and transparency at its core
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 group hover:-translate-y-1 transition-transform"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--thamel-gray)]/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Latest Alerts Section ───
function AlertsSection() {
  const { data: articlesData } = trpc.article.list.useQuery({ category: "scam_alert", limit: 4 });
  const articles = articlesData?.items || [];

  return (
    <section className="py-16 md:py-24 bg-[var(--pashmina-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-3">
              <AlertTriangle className="w-4 h-4" />
              Latest Alerts
            </div>
            <h2 className="section-header mb-0">Scam Alerts &amp; Warnings</h2>
          </div>
          <Link to="/awareness" className="btn-secondary mt-4 sm:mt-0">
            <BookOpen className="w-4 h-4 mr-2" />
            All Resources
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 flex gap-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/awareness/${article.slug}`}
            >
              <div className="w-16 h-16 rounded-lg bg-[var(--prayer-crimson)]/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-[var(--prayer-crimson)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--lattice-wood)] mb-1 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-[var(--thamel-gray)]/60 line-clamp-2 mb-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--thamel-gray)]/40">
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ───
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What types of cybercrime can I report?",
      a: "You can report online scams, phishing attempts, social media fraud, fake job offers, identity theft, investment scams, bank fraud, digital wallet fraud, romance scams, cyberbullying, online blackmail, fake websites/apps, unauthorized access, and hacking incidents.",
    },
    {
      q: "Can I report anonymously?",
      a: "Yes, absolutely. When filing a report, you can select 'Anonymous' as your privacy level. Your identity will be protected, and only authorized moderators will have access to your information for verification purposes.",
    },
    {
      q: "How do I track my submitted report?",
      a: "After submitting a report, you will receive a unique case number (e.g., SCR-2026-00001). You can use this number on the 'Track Case' page to view the current status, timeline updates, and any moderator comments.",
    },
    {
      q: "What is the defamation acknowledgment?",
      a: "Before submitting a report, you must acknowledge that false reporting is a punishable offense under Nepali law. This is a crucial step to reduce false accusations and protect innocent individuals and businesses from defamation.",
    },
    {
      q: "How does the entity search work?",
      a: "Our searchable database contains reported phone numbers, emails, websites, social media accounts, digital wallet IDs, and other entities. You can search by any identifier to check its risk level, verification status, and number of associated reports.",
    },
    {
      q: "Who can access my report?",
      a: "Report visibility depends on your privacy setting. Public reports are visible to all users. Anonymous reports hide your identity but show the report details. Private reports are only visible to you and authorized moderators.",
    },
    {
      q: "What happens after I submit a report?",
      a: "Your report enters a moderation queue. Moderators review the report and evidence within 24-48 hours. The status changes from 'Submitted' to 'Under Review', then to 'Verified', 'Rejected', or 'Resolved' based on the investigation.",
    },
    {
      q: "Is this platform officially affiliated with Nepal Police?",
      a: "SaanjhCyber is an academic research project developed for a dissertation study. It is designed as a prototype to demonstrate how a cybercrime reporting platform could operate in Nepal. All data is for research and demonstration purposes.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="section-header">Frequently Asked Questions</h2>
          <p className="text-[var(--thamel-gray)]/70">
            Find answers to common questions about using SaanjhCyber
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-gray-100 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[var(--lattice-wood)] pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--thamel-gray)]/40 flex-shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-4"
                >
                  <p className="text-sm text-[var(--thamel-gray)]/70 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ───
function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--lattice-wood)]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Shield className="w-16 h-16 text-[var(--prayer-gold)] mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Help Build a Safer Digital Nepal
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Your reports help protect thousands of internet users across Nepal.
            Together, we can create a more secure digital environment for everyone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/report" className="bg-[var(--prayer-gold)] text-[var(--lattice-wood)] px-8 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all w-full sm:w-auto">
              Report an Incident
            </Link>
            <Link to="/search" className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all w-full sm:w-auto">
              Verify an Entity
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Home Page ───
export default function Home() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      <RecentReportsSection />
      <FeaturesSection />
      <AlertsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}

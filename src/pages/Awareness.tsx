import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Shield, AlertTriangle, Lightbulb, FileText,
  Newspaper, Phone, Search
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const categoryConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  scam_alert: { label: "Scam Alert", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  safety_tip: { label: "Safety Tip", icon: Lightbulb, color: "bg-blue-100 text-blue-700" },
  guide: { label: "Guide", icon: FileText, color: "bg-green-100 text-green-700" },
  news: { label: "News", icon: Newspaper, color: "bg-purple-100 text-purple-700" },
  resource: { label: "Resource", icon: BookOpen, color: "bg-orange-100 text-orange-700" },
};

export default function Awareness() {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articlesData } = trpc.article.list.useQuery(
    activeCategory ? { category: activeCategory, limit: 20 } : { limit: 20 }
  );

  const articles = articlesData?.items || [];
  const filteredArticles = searchQuery
    ? articles.filter((a: any) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const categories = [
    { value: "", label: "All" },
    { value: "scam_alert", label: "Scam Alerts" },
    { value: "safety_tip", label: "Safety Tips" },
    { value: "guide", label: "Guides" },
    { value: "resource", label: "Resources" },
  ];

  const emergencyContacts = [
    { name: "Nepal Police", number: "100", icon: Phone },
    { name: "Cyber Bureau", number: "01-4412480", icon: Shield },
    { name: "Cyber Helpline", number: "1149", icon: Phone },
    { name: "eSewa Support", number: "1660-01-02121", icon: Phone },
    { name: "Khalti Support", number: "1660-01-52255", icon: Phone },
    { name: "Mental Health", number: "1660-01-02222", icon: Phone },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
              <BookOpen className="w-4 h-4" />
              Public Awareness
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--lattice-wood)] mb-2">
              Cyber Safety Resources
            </h1>
            <p className="text-[var(--thamel-gray)]/70 max-w-2xl mx-auto">
              Stay informed about the latest cyber threats, learn how to protect yourself,
              and find resources for victims of cybercrime in Nepal.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, alerts..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[var(--lattice-wood)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--prayer-crimson)] focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-[var(--prayer-crimson)] text-[var(--prayer-gold)]"
                    : "bg-white text-[var(--thamel-gray)] hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredArticles.map((article: any, i: number) => {
              const cat = categoryConfig[article.category] || categoryConfig.resource;
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/awareness/${article.slug}`} className="card overflow-hidden block hover:shadow-lg transition-shadow h-full">
                    {article.coverImage && (
                      <div className="h-40 bg-gray-100 overflow-hidden">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                          <cat.icon className="w-3 h-3" />
                          {cat.label}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[var(--thamel-gray)]/60 line-clamp-3 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{article.author}</span>
                        <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 bg-gradient-to-br from-[var(--lattice-wood)] to-[var(--prayer-crimson)] text-white"
          >
            <div className="text-center mb-8">
              <Phone className="w-10 h-10 text-[var(--prayer-gold)] mx-auto mb-3" />
              <h2 className="font-display text-2xl font-bold mb-2">Emergency Contacts</h2>
              <p className="text-white/70">Keep these numbers handy. In case of cybercrime, report immediately.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.name}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
                >
                  <contact.icon className="w-6 h-6 text-[var(--prayer-gold)] mx-auto mb-2" />
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-lg font-bold text-[var(--prayer-gold)]">{contact.number}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Reporting Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 card p-8"
          >
            <h2 className="font-display text-2xl font-bold text-[var(--lattice-wood)] mb-6 text-center">
              How to Report a Cybercrime
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Gather Evidence", desc: "Collect screenshots, URLs, transaction details, and any communication with the suspect." },
                { step: "2", title: "Document Details", desc: "Note the date, time, location, and a detailed description of what happened." },
                { step: "3", title: "File a Report", desc: "Use our secure reporting form to submit your incident with all details and evidence." },
                { step: "4", title: "Track Progress", desc: "Use your case number to track the status and receive updates on your report." },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--prayer-crimson)] text-[var(--prayer-gold)] flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-[var(--lattice-wood)] mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--thamel-gray)]/60">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/report" className="btn-primary">
                <FileText className="w-4 h-4 mr-2" />
                Start Reporting
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Phone, Mail, Globe, Facebook, MessageCircle, Instagram,
  Video, Wallet, CreditCard, Building, Car, Hash, AlertTriangle,
  Shield, CheckCircle, XCircle, Clock, FileText, ExternalLink,
  Filter, TrendingUp, AlertOctagon, X, Calendar, MapPin, Bell
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

const entityTypes = [
  { value: "", label: "All Types", icon: Hash },
  { value: "phone", label: "Phone Number", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "domain", label: "Domain", icon: Globe },
  { value: "website", label: "Website", icon: Globe },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "telegram", label: "Telegram", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Video },
  { value: "whatsapp", label: "WhatsApp", icon: Phone },
  { value: "esewa", label: "eSewa ID", icon: Wallet },
  { value: "khalti", label: "Khalti ID", icon: Wallet },
  { value: "bank_account", label: "Bank Account", icon: CreditCard },
  { value: "business_name", label: "Business", icon: Building },
  { value: "company", label: "Company", icon: Building },
  { value: "vehicle_number", label: "Vehicle", icon: Car },
  { value: "wallet_address", label: "Crypto Wallet", icon: Wallet },
];

const riskConfig: Record<string, { label: string; class: string; icon: typeof AlertTriangle }> = {
  critical: { label: "Critical Risk", class: "bg-red-100 text-red-800 border-red-200", icon: AlertOctagon },
  high: { label: "High Risk", class: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle },
  medium: { label: "Medium Risk", class: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
  low: { label: "Low Risk", class: "bg-green-100 text-green-800 border-green-200", icon: Shield },
};

const verificationConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  verified_true: { label: "Confirmed Scam", class: "text-red-600", icon: XCircle },
  verified_false: { label: "False Report", class: "text-green-600", icon: CheckCircle },
  pending: { label: "Under Review", class: "text-yellow-600", icon: Clock },
  unverified: { label: "Unverified", class: "text-gray-500", icon: Clock },
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get("risk") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const toggleWatch = trpc.watchlist.toggle.useMutation({
    onSuccess: () => utils.watchlist.invalidate(),
  });

  const { data, isLoading } = trpc.entity.search.useQuery({
    query: query || undefined,
    type: selectedType || undefined,
    riskLevel: selectedRisk || undefined,
    page: 1,
    limit: 20,
  });

  const { data: stats } = trpc.entity.getStats.useQuery();

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (selectedType) params.type = selectedType;
    if (selectedRisk) params.risk = selectedRisk;
    setSearchParams(params);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const entities = data?.items || [];

  const quickSearches = [
    { label: "Phone Scams", query: "+977-98", type: "phone" },
    { label: "Phishing Emails", query: "@", type: "email" },
    { label: "Fake Websites", query: "", type: "domain" },
    { label: "Social Media", query: "", type: "facebook" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--lattice-wood)] mb-2">
            Search Suspicious Entities
          </h1>
          <p className="text-[var(--thamel-gray)]/70 max-w-2xl mx-auto">
            Verify phone numbers, emails, websites, social media accounts, and more
            against our database of reported cybercrime entities.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter phone, email, URL, username, or keyword..."
              className="w-full pl-12 pr-32 py-4 bg-white border border-gray-200 rounded-xl text-[var(--lattice-wood)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--prayer-crimson)] focus:border-transparent shadow-sm"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[var(--prayer-crimson)] text-[var(--prayer-gold)] rounded-lg font-semibold hover:brightness-110 transition-all"
            >
              Search
            </button>
          </div>
        </motion.div>

        {/* Quick Searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {quickSearches.map((qs) => (
            <button
              key={qs.label}
              onClick={() => { setQuery(qs.query); setSelectedType(qs.type); }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-[var(--thamel-gray)] hover:border-[var(--prayer-crimson)] hover:text-[var(--prayer-crimson)] transition-all"
            >
              {qs.label}
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--lattice-wood)] hover:text-[var(--prayer-crimson)] transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 bg-white rounded-lg border border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-2">Entity Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field"
                  >
                    {entityTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-2">Risk Level</label>
                  <select
                    value={selectedRisk}
                    onChange={(e) => setSelectedRisk(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Tracked", value: stats.total, icon: Hash },
              { label: "Critical", value: stats.byRiskLevel?.find(r => r.riskLevel === "critical")?.count || 0, icon: AlertOctagon, color: "text-red-600" },
              { label: "High Risk", value: stats.byRiskLevel?.find(r => r.riskLevel === "high")?.count || 0, icon: AlertTriangle, color: "text-orange-600" },
              { label: "Verified Scams", value: stats.byRiskLevel?.reduce((a, b) => a + b.count, 0) || 0, icon: Shield, color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color || "text-[var(--prayer-crimson)]"}`} />
                <div className="text-2xl font-bold text-[var(--lattice-wood)]">{s.value}</div>
                <div className="text-xs text-[var(--thamel-gray)]/60">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Searching database...</p>
          </div>
        ) : entities.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--thamel-gray)]/60">
                Found <span className="font-semibold text-[var(--lattice-wood)]">{data?.total || entities.length}</span> entities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entities.map((entity, i) => {
                const risk = riskConfig[entity.riskLevel || "low"];
                const verification = verificationConfig[entity.verificationStatus || "unverified"];
                const typeInfo = entityTypes.find(t => t.value === entity.type);

                return (
                  <motion.div
                    key={entity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {typeInfo && <typeInfo.icon className="w-4 h-4 text-[var(--thamel-gray)]/50" />}
                        <span className="text-xs text-[var(--thamel-gray)]/50 uppercase">{entity.type}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${risk.class}`}>
                        <risk.icon className="w-3 h-3" />
                        {risk.label}
                      </span>
                    </div>

                    <h3 className="font-mono-code text-lg font-semibold text-[var(--lattice-wood)] mb-2 break-all">
                      {entity.value}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-[var(--thamel-gray)]/60 mb-3">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {entity.reportCount} reports
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {entity.evidenceCount} evidence
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className={`flex items-center gap-1 text-sm font-medium ${verification.class}`}>
                        <verification.icon className="w-4 h-4" />
                        {verification.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {user && (
                          <button
                            onClick={() => toggleWatch.mutate({ entityId: entity.id })}
                            className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            title="Watch for new reports"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedEntity(entity)}
                          className="text-sm text-[var(--prayer-crimson)] hover:underline flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-16">
            <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-2">
              No Results Found
            </h3>
            <p className="text-[var(--thamel-gray)]/60 max-w-md mx-auto">
              This entity has not been reported yet. If you believe it is suspicious,
              please consider filing a report to help protect others.
            </p>
            <a href="/report" className="btn-primary mt-6 inline-flex">
              File a Report
            </a>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-2">
              Start Searching
            </h3>
            <p className="text-[var(--thamel-gray)]/60 max-w-md mx-auto">
              Enter a phone number, email, domain, or any identifier to check if it has been reported.
            </p>
          </div>
        )}
      </div>

      {/* Entity Detail Modal */}
      <AnimatePresence>
        {selectedEntity && (
          <EntityDetailModal
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            user={user}
            onWatch={(id) => toggleWatch.mutate({ entityId: id })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Entity Detail Modal Component ───
function EntityDetailModal({ entity, onClose, user, onWatch }: {
  entity: any;
  onClose: () => void;
  user: any;
  onWatch: (id: number) => void;
}) {
  // Fetch full entity detail with related reports
  const { data: detailData } = trpc.entity.getDetailWithReports.useQuery(
    { id: entity.id },
    { enabled: !!entity.id }
  );

  const relatedReports = detailData?.reports || [];

  const riskScore = entity.riskLevel === "critical" ? 95
    : entity.riskLevel === "high" ? 75
    : entity.riskLevel === "medium" ? 50 : 20;

  const riskColor = entity.riskLevel === "critical" ? "#dc2626"
    : entity.riskLevel === "high" ? "#ea580c"
    : entity.riskLevel === "medium" ? "#ca8a04" : "#16a34a";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with risk indicator */}
        <div className={`p-5 border-b ${
          entity.riskLevel === "critical" ? "bg-red-50 border-red-100" :
          entity.riskLevel === "high" ? "bg-orange-50 border-orange-100" :
          entity.riskLevel === "medium" ? "bg-yellow-50 border-yellow-100" : "bg-green-50 border-green-100"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide bg-white/80 px-2 py-0.5 rounded">
                  {entity.type}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  entity.riskLevel === "critical" ? "bg-red-100 text-red-700" :
                  entity.riskLevel === "high" ? "bg-orange-100 text-orange-700" :
                  entity.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}>
                  {entity.riskLevel?.toUpperCase()} RISK
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 font-mono break-all">{entity.value}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-lg transition-colors ml-2">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Risk Score Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={riskColor}
                  strokeWidth="10"
                  strokeDasharray={`${riskScore * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: riskColor }}>{riskScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Risk Assessment</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-500">Reports Filed</span>
                  <p className="font-bold text-gray-900 text-base">{entity.reportCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-500">Evidence</span>
                  <p className="font-bold text-gray-900 text-base">{entity.evidenceCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-500">Status</span>
                  <p className="font-bold text-gray-900 capitalize">{(entity.verificationStatus || "unverified").replace(/_/g, " ")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-500">Last Report</span>
                  <p className="font-bold text-gray-900">{entity.lastReportedAt ? new Date(entity.lastReportedAt).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>First: {entity.firstReportedAt ? new Date(entity.firstReportedAt).toLocaleDateString() : "Unknown"}</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Latest: {entity.lastReportedAt ? new Date(entity.lastReportedAt).toLocaleDateString() : "Unknown"}</span>
            </div>
          </div>

          {/* Related Reports */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-400" />
              Related Reports ({relatedReports.length})
            </h3>
            {relatedReports.length > 0 ? (
              <div className="space-y-2">
                {relatedReports.map((r: any) => (
                  <a
                    key={r.id}
                    href={`/track/${r.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{r.caseNumber}</span>
                        <span>·</span>
                        <span className="capitalize">{r.category?.replace(/_/g, " ")}</span>
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.status === "verified" ? "bg-purple-100 text-purple-700" :
                      r.status === "resolved" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {r.status?.replace(/_/g, " ")}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center bg-gray-50 rounded-lg">
                No public reports linked to this entity yet
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <a
              href={`/report?entity=${encodeURIComponent(entity.value)}`}
              className="flex-1 text-center px-4 py-2.5 bg-[var(--prayer-crimson)] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              Report This Entity
            </a>
            {user && (
              <button
                onClick={() => onWatch(entity.id)}
                className="px-4 py-2.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all flex items-center gap-1.5"
              >
                <Bell className="w-4 h-4" />
                Watch
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

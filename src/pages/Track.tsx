import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, FileText, Clock, CheckCircle, AlertTriangle, XCircle,
  RefreshCw, ChevronRight, Filter, MessageSquare, Edit3, Trash2
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  submitted: { label: "Submitted", class: "bg-blue-100 text-blue-800", icon: FileText },
  under_review: { label: "Under Review", class: "bg-yellow-100 text-yellow-800", icon: Clock },
  need_info: { label: "Need More Info", class: "bg-orange-100 text-orange-800", icon: RefreshCw },
  verified: { label: "Verified", class: "bg-purple-100 text-purple-800", icon: CheckCircle },
  rejected: { label: "Rejected", class: "bg-gray-100 text-gray-800", icon: XCircle },
  closed: { label: "Closed", class: "bg-gray-100 text-gray-800", icon: XCircle },
  resolved: { label: "Resolved", class: "bg-green-100 text-green-800", icon: CheckCircle },
};

const categoryLabels: Record<string, string> = {
  online_scam: "Online Scam", phishing: "Phishing", social_media_fraud: "Social Media Fraud",
  fake_job: "Fake Job", identity_theft: "Identity Theft", investment_scam: "Investment Scam",
  bank_fraud: "Bank Fraud", digital_wallet_fraud: "Digital Wallet Fraud", romance_scam: "Romance Scam",
  cyberbullying: "Cyberbullying", online_blackmail: "Online Blackmail", fake_website: "Fake Website",
  fake_app: "Fake App", unauthorized_access: "Unauthorized Access", hacking: "Hacking", other: "Other",
};

export default function Track() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [caseNumber, setCaseNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const utils = trpc.useUtils();

  const { data: myReports, isLoading } = trpc.report.myReports.useQuery();

  const updateReport = trpc.report.updateReport.useMutation({
    onSuccess: () => {
      utils.report.myReports.invalidate();
      setEditingId(null);
    },
  });

  const deleteReport = trpc.report.deleteReport.useMutation({
    onSuccess: () => utils.report.myReports.invalidate(),
  });

  const reports = myReports || [];
  const filtered = statusFilter
    ? reports.filter((r: any) => r.status === statusFilter)
    : reports;

  // Quick search by case number
  const searchFiltered = caseNumber
    ? filtered.filter((r: any) => r.caseNumber.toLowerCase().includes(caseNumber.toLowerCase()))
    : filtered;

  const canEdit = (status: string) => ["submitted", "need_info"].includes(status);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-[var(--lattice-wood)] mb-2">
              My Cases
            </h1>
            <p className="text-[var(--thamel-gray)]/70">
              Track, edit, and manage your cybercrime reports
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="Filter by case number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {[
                { value: "", label: "All" },
                { value: "submitted", label: "New" },
                { value: "under_review", label: "Reviewing" },
                { value: "verified", label: "Verified" },
                { value: "resolved", label: "Resolved" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === f.value
                      ? "bg-[var(--prayer-crimson)] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reports */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : searchFiltered.length === 0 ? (
            <div className="text-center py-16 card">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--lattice-wood)] mb-2">
                {reports.length === 0 ? "No Reports Yet" : "No matching reports"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {reports.length === 0
                  ? "You haven't filed any cybercrime reports yet."
                  : "Try adjusting your filters."
                }
              </p>
              {reports.length === 0 && (
                <Link to="/report" className="btn-primary">File Your First Report</Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {searchFiltered.map((report: any, i: number) => {
                const s = statusConfig[report.status || ""] || statusConfig.submitted;
                const editable = canEdit(report.status);
                const isEditing = editingId === report.id;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-5 hover:shadow-md transition-shadow"
                  >
                    {isEditing ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="Report title"
                        />
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="Description..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReport.mutate({ id: report.id, title: editTitle, description: editDesc })}
                            disabled={updateReport.isPending}
                            className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50"
                          >
                            {updateReport.isPending ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[var(--prayer-crimson)] font-semibold bg-[var(--prayer-crimson)]/5 px-2 py-0.5 rounded">
                              {report.caseNumber}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                              <s.icon className="w-3 h-3" />
                              {s.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link to={`/track/${report.id}`} className="block mb-3 group">
                          <h3 className="font-semibold text-[var(--lattice-wood)] group-hover:text-[var(--prayer-crimson)] transition-colors mb-1">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>
                        </Link>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="px-2 py-0.5 bg-gray-50 rounded">{categoryLabels[report.category] || report.category}</span>
                            {report.amountLost && Number(report.amountLost) > 0 && (
                              <span className="text-red-500 font-medium">NPR {Number(report.amountLost).toLocaleString()}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Link
                              to={`/messages?report=${report.id}`}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Message team"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                            {editable && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(report.id);
                                    setEditTitle(report.title);
                                    setEditDesc(report.description);
                                  }}
                                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Edit report"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this report? This cannot be undone.")) {
                                      deleteReport.mutate({ id: report.id });
                                    }
                                  }}
                                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete report"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <Link
                              to={`/track/${report.id}`}
                              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

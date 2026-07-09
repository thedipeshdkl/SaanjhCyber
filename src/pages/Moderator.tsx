import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Shield, AlertTriangle, Clock, CheckCircle,
  XCircle, Eye, Activity, MessageSquare, Search, BookOpen
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { label: string; class: string }> = {
  submitted: { label: "Submitted", class: "bg-blue-100 text-blue-800" },
  under_review: { label: "Under Review", class: "bg-yellow-100 text-yellow-800" },
  need_info: { label: "Need Info", class: "bg-orange-100 text-orange-800" },
  verified: { label: "Verified", class: "bg-purple-100 text-purple-800" },
  rejected: { label: "Rejected", class: "bg-gray-100 text-gray-800" },
  closed: { label: "Closed", class: "bg-gray-100 text-gray-800" },
  resolved: { label: "Resolved", class: "bg-green-100 text-green-800" },
};

const riskConfig: Record<string, { label: string; class: string }> = {
  low: { label: "Low", class: "bg-green-100 text-green-700" },
  medium: { label: "Medium", class: "bg-yellow-100 text-yellow-700" },
  high: { label: "High", class: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", class: "bg-red-100 text-red-700" },
};

export default function Moderator() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true, requireRole: ["moderator", "admin", "superadmin"] });
  const [activeTab, setActiveTab] = useState("reports");
  const [statusFilter, setStatusFilter] = useState("submitted");

  const utils = trpc.useUtils();

  const { data: reportsData } = trpc.report.list.useQuery({ page: 1, limit: 50 });
  const { data: appealsData } = trpc.appeal.list.useQuery({ status: "pending" });
  const { data: feedbackData } = trpc.feedback.list.useQuery({ page: 1, limit: 20 });
  const { data: entityData } = trpc.entity.search.useQuery({ page: 1, limit: 50 });

  const updateStatus = trpc.report.updateStatus.useMutation({
    onSuccess: () => utils.report.list.invalidate(),
  });
  const reviewAppeal = trpc.appeal.review.useMutation({
    onSuccess: () => utils.appeal.list.invalidate(),
  });
  const updateEntityRisk = trpc.entity.updateRisk.useMutation({
    onSuccess: () => utils.entity.search.invalidate(),
  });

  const tabs = [
    { id: "reports", label: "Reports", icon: FileText, count: reportsData?.items?.filter((r: any) => r.status === "submitted" || r.status === "under_review").length },
    { id: "appeals", label: "Appeals", icon: AlertTriangle, count: appealsData?.length || 0 },
    { id: "entities", label: "Entities", icon: Search, count: entityData?.items?.length },
    { id: "feedback", label: "Feedback", icon: MessageSquare, count: feedbackData?.items?.length },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderator Panel</h1>
              <p className="text-sm text-gray-500">
                Review reports, manage appeals, and verify entities · {user.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-700 border border-gray-200 border-b-white -mb-px shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {activeTab === "reports" && (
            <ReportsTab
              reports={reportsData?.items || []}
              filter={statusFilter}
              setFilter={setStatusFilter}
              onUpdateStatus={(id, status) => updateStatus.mutate({ id, status: status as any })}
            />
          )}
          {activeTab === "appeals" && (
            <AppealsTab
              appeals={appealsData || []}
              onReview={(id, status, notes) => reviewAppeal.mutate({ id, status: status as any, reviewNotes: notes })}
            />
          )}
          {activeTab === "entities" && (
            <EntitiesTab
              entities={entityData?.items || []}
              onUpdateRisk={(id, riskLevel) => updateEntityRisk.mutate({ id, riskLevel: riskLevel as any })}
            />
          )}
          {activeTab === "feedback" && (
            <FeedbackTab feedback={feedbackData?.items || []} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reports Tab ───
function ReportsTab({ reports, filter, setFilter, onUpdateStatus }: {
  reports: any[];
  filter: string;
  setFilter: (f: string) => void;
  onUpdateStatus: (id: number, status: string) => void;
}) {
  const filtered = filter ? reports.filter((r: any) => r.status === filter) : reports;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Reports to Review ({filtered.length})
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
        >
          <option value="">All</option>
          <option value="submitted">Submitted (New)</option>
          <option value="under_review">Under Review</option>
          <option value="need_info">Need Info</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((report: any) => (
          <div key={report.id} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{report.caseNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[report.status]?.class || ""}`}>
                    {statusConfig[report.status]?.label || report.status}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 truncate">{report.title}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="capitalize">{report.category?.replace(/_/g, " ")}</span>
                  <span>·</span>
                  <span>{report.district}, {report.province}</span>
                  <span>·</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  {report.amountLost && Number(report.amountLost) > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-red-500 font-medium">NPR {Number(report.amountLost).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={report.status}
                  onChange={(e) => onUpdateStatus(report.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-200 outline-none"
                >
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-200" />
            <p>No reports to review in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Appeals Tab ───
function AppealsTab({ appeals, onReview }: {
  appeals: any[];
  onReview: (id: number, status: string, notes: string) => void;
}) {
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Appeals ({appeals.length})
      </h3>

      <div className="space-y-4">
        {appeals.map((appeal: any) => (
          <div key={appeal.id} className="p-4 rounded-lg border border-orange-100 bg-orange-50/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Appeal for Report #{appeal.reportId}
                </p>
                <p className="text-sm text-gray-600 mb-2">{appeal.reason}</p>
                <p className="text-xs text-gray-400">
                  Submitted: {new Date(appeal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-100">
              <textarea
                placeholder="Review notes (optional)..."
                value={reviewNotes[appeal.id] || ""}
                onChange={(e) => setReviewNotes({ ...reviewNotes, [appeal.id]: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onReview(appeal.id, "approved", reviewNotes[appeal.id] || "")}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => onReview(appeal.id, "rejected", reviewNotes[appeal.id] || "")}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"
                >
                  <XCircle className="w-3 h-3 inline mr-1" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {appeals.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-200" />
            <p>No pending appeals</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Entities Tab ───
function EntitiesTab({ entities, onUpdateRisk }: {
  entities: any[];
  onUpdateRisk: (id: number, riskLevel: string) => void;
}) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Manage Entities ({entities.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Value</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Type</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Reports</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Risk Level</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity: any) => (
              <tr key={entity.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-3 font-mono text-xs text-gray-900 max-w-[200px] truncate">{entity.value}</td>
                <td className="py-3 px-3 text-gray-600 capitalize text-xs">{entity.type}</td>
                <td className="py-3 px-3 text-gray-600">{entity.reportCount}</td>
                <td className="py-3 px-3">
                  <select
                    value={entity.riskLevel || "low"}
                    onChange={(e) => onUpdateRisk(entity.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-200 outline-none"
                  >
                    {Object.entries(riskConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    entity.verificationStatus === "verified_true" ? "bg-red-100 text-red-700" :
                    entity.verificationStatus === "verified_false" ? "bg-green-100 text-green-700" :
                    entity.verificationStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {(entity.verificationStatus || "unverified").replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entities.length === 0 && (
          <div className="py-12 text-center text-gray-400">No entities found</div>
        )}
      </div>
    </div>
  );
}

// ─── Feedback Tab ───
function FeedbackTab({ feedback }: { feedback: any[] }) {
  const typeColors: Record<string, string> = {
    bug: "bg-red-100 text-red-700",
    feature: "bg-blue-100 text-blue-700",
    usability: "bg-purple-100 text-purple-700",
    general: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        User Feedback ({feedback.length})
      </h3>

      <div className="space-y-3">
        {feedback.map((item: any) => (
          <div key={item.id} className="p-4 rounded-lg border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[item.type] || typeColors.general}`}>
                    {item.type}
                  </span>
                  {item.rating && (
                    <span className="text-xs text-gray-400">Rating: {item.rating}/5</span>
                  )}
                  {item.page && (
                    <span className="text-xs text-gray-400">Page: {item.page}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{item.message}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <div className="py-12 text-center text-gray-400">No feedback yet</div>
        )}
      </div>
    </div>
  );
}

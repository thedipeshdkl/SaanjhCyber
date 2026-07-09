import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Bell, Search, Clock, CheckCircle,
  Shield, BarChart3
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

export default function Dashboard() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState("overview");

  const { data: reportsData } = trpc.report.list.useQuery({ page: 1, limit: 10 });
  const { data: notificationsData } = trpc.notification.list.useQuery({ page: 1, limit: 5 });
  const { data: searchStats } = trpc.entity.getStats.useQuery();

  const reports = reportsData?.items || [];
  const notifications = notificationsData || [];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "reports", label: "My Reports", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "saved", label: "Saved Searches", icon: Search },
  ];

  const stats = [
    { label: "My Reports", value: reports.length, icon: FileText, color: "bg-blue-100 text-blue-700" },
    { label: "Under Review", value: reports.filter(r => r.status === "under_review").length, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
    { label: "Resolved", value: reports.filter(r => r.status === "resolved").length, icon: CheckCircle, color: "bg-green-100 text-green-700" },
    { label: "Tracked Entities", value: searchStats?.total || 0, icon: Shield, color: "bg-purple-100 text-purple-700" },
  ];

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--pashmina-white)]">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--lattice-wood)]">
                My Dashboard
              </h1>
              <p className="text-[var(--thamel-gray)]/60 mt-1">
                Welcome back, {user?.name?.split(" ")[0] || "User"}
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Link to="/report" className="btn-primary text-sm">
                <FileText className="w-4 h-4 mr-2" />
                New Report
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[var(--lattice-wood)]">{stat.value}</p>
                <p className="text-sm text-[var(--thamel-gray)]/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[var(--prayer-crimson)] text-[var(--prayer-gold)]"
                    : "text-[var(--thamel-gray)] hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)]">Recent Reports</h2>
                  <button onClick={() => setActiveTab("reports")} className="text-sm text-[var(--prayer-crimson)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => {
                    const s = statusConfig[report.status || ""] || statusConfig.submitted;
                    return (
                      <Link
                        key={report.id}
                        to={`/track/${report.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-medium text-[var(--lattice-wood)] truncate">{report.title}</p>
                          <p className="text-xs text-gray-400 font-mono-code">{report.caseNumber}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.class} flex-shrink-0`}>
                          {s.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)]">Notifications</h2>
                  <button onClick={() => setActiveTab("notifications")} className="text-sm text-[var(--prayer-crimson)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${notif.isRead ? "bg-gray-50" : "bg-blue-50"}`}>
                      <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notif.isRead ? "text-gray-400" : "text-blue-500"}`} />
                      <div>
                        <p className={`text-sm ${notif.isRead ? "text-[var(--thamel-gray)]/70" : "text-[var(--lattice-wood)] font-medium"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No notifications yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">My Reports</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 pr-4">Case #</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 pr-4">Title</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 pr-4">Category</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 pr-4">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const s = statusConfig[report.status || ""] || statusConfig.submitted;
                      return (
                        <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <Link to={`/track/${report.id}`} className="font-mono-code text-sm text-[var(--prayer-crimson)] hover:underline">
                              {report.caseNumber}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-sm text-[var(--lattice-wood)] max-w-xs truncate">{report.title}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-[var(--thamel-gray)]">
                              {report.category.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                              {s.label}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">All Notifications</h2>
              <div className="space-y-2">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className={`flex items-start gap-3 p-4 rounded-lg ${notif.isRead ? "bg-gray-50" : "bg-blue-50 border border-blue-100"}`}>
                    <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${notif.isRead ? "text-gray-400" : "text-blue-500"}`} />
                    <div className="flex-1">
                      <p className={`text-sm ${notif.isRead ? "text-[var(--thamel-gray)]/70" : "text-[var(--lattice-wood)] font-medium"}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="card p-6 text-center py-12">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-2">Saved Searches</h3>
              <p className="text-sm text-gray-400 mb-4">Your saved searches will appear here</p>
              <Link to="/search" className="btn-secondary text-sm">Start Searching</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

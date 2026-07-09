import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, FileText, Shield, AlertTriangle, BarChart3,
  Clock, CheckCircle, TrendingUp, Eye, Activity,
  Search, Lock, UserX, UserCheck, ShieldAlert
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

// ─── Status Config ───
const statusConfig: Record<string, { label: string; class: string }> = {
  submitted: { label: "Submitted", class: "bg-blue-100 text-blue-800" },
  under_review: { label: "Under Review", class: "bg-yellow-100 text-yellow-800" },
  need_info: { label: "Need Info", class: "bg-orange-100 text-orange-800" },
  verified: { label: "Verified", class: "bg-purple-100 text-purple-800" },
  rejected: { label: "Rejected", class: "bg-gray-100 text-gray-800" },
  closed: { label: "Closed", class: "bg-gray-100 text-gray-800" },
  resolved: { label: "Resolved", class: "bg-green-100 text-green-800" },
};

const roleConfig: Record<string, { label: string; class: string }> = {
  user: { label: "User", class: "bg-gray-100 text-gray-700" },
  moderator: { label: "Moderator", class: "bg-blue-100 text-blue-700" },
  admin: { label: "Admin", class: "bg-orange-100 text-orange-700" },
  superadmin: { label: "Super Admin", class: "bg-red-100 text-red-700" },
  researcher: { label: "Researcher", class: "bg-purple-100 text-purple-700" },
};

export default function Admin() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true, requireRole: ["admin", "superadmin"] });
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: reportsData } = trpc.admin.listReports.useQuery(
    { page: 1, limit: 20, status: statusFilter || undefined }
  );
  const { data: usersData } = trpc.admin.listUsers.useQuery(
    { page: 1, limit: 20, role: roleFilter || undefined, search: userSearch || undefined }
  );
  const { data: security } = trpc.admin.getSecurityOverview.useQuery();
  const { data: auditData } = trpc.admin.getAuditLogs.useQuery({ page: 1, limit: 20 });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => utils.admin.listUsers.invalidate(),
  });
  const updateStatus = trpc.admin.updateReportStatus.useMutation({
    onSuccess: () => utils.admin.listReports.invalidate(),
  });
  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => utils.admin.listUsers.invalidate(),
  });

  const utils = trpc.useUtils();

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "users", label: "Users", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "audit", label: "Audit Log", icon: Activity },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">
                Logged in as <span className="font-medium text-red-600">{user.role === "superadmin" ? "Super Admin" : "Admin"}</span>
                {" · "}{user.email}
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
                  ? "bg-white text-red-700 border border-gray-200 border-b-white -mb-px shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {activeTab === "overview" && <OverviewTab stats={stats} />}
          {activeTab === "reports" && (
            <ReportsTab
              data={reportsData}
              filter={statusFilter}
              setFilter={setStatusFilter}
              onUpdateStatus={(reportId, status) => updateStatus.mutate({ reportId, status: status as any })}
            />
          )}
          {activeTab === "users" && (
            <UsersTab
              data={usersData}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              search={userSearch}
              setSearch={setUserSearch}
              currentUser={user}
              onUpdateRole={(userId, role) => updateRole.mutate({ userId, role: role as any })}
              onDeleteUser={(userId) => {
                if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
                  deleteUser.mutate({ userId });
                }
              }}
            />
          )}
          {activeTab === "security" && <SecurityTab data={security} />}
          {activeTab === "audit" && <AuditTab data={auditData} />}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ stats }: { stats: any }) {
  if (!stats) return <div className="p-8 text-center text-gray-400">Loading stats...</div>;

  const cards = [
    { label: "Total Users", value: stats.overview.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Reports", value: stats.overview.totalReports, icon: FileText, color: "bg-green-50 text-green-600" },
    { label: "Pending Reports", value: stats.overview.pendingReports, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Pending Appeals", value: stats.overview.pendingAppeals, icon: AlertTriangle, color: "bg-orange-50 text-orange-600" },
    { label: "Entities Tracked", value: stats.overview.totalEntities, icon: Eye, color: "bg-purple-50 text-purple-600" },
    { label: "Feedback", value: stats.overview.feedbackCount, icon: TrendingUp, color: "bg-pink-50 text-pink-600" },
    { label: "Logins (24h)", value: stats.overview.recentLogins, icon: Activity, color: "bg-indigo-50 text-indigo-600" },
    { label: "Surveys", value: stats.overview.totalSurveys, icon: BarChart3, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      {stats.statusBreakdown?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Reports by Status</h3>
          <div className="flex flex-wrap gap-2">
            {stats.statusBreakdown.map((s: any) => (
              <span key={s.status} className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[s.status]?.class || "bg-gray-100 text-gray-700"}`}>
                {statusConfig[s.status]?.label || s.status}: {s.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Users by Role */}
      {stats.usersByRole?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Users by Role</h3>
          <div className="flex flex-wrap gap-2">
            {stats.usersByRole.map((r: any) => (
              <span key={r.role} className={`px-3 py-1.5 rounded-full text-xs font-medium ${roleConfig[r.role]?.class || "bg-gray-100 text-gray-700"}`}>
                {roleConfig[r.role]?.label || r.role}: {r.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports Tab ───
function ReportsTab({ data, filter, setFilter, onUpdateStatus }: {
  data: any;
  filter: string;
  setFilter: (f: string) => void;
  onUpdateStatus: (reportId: number, status: string) => void;
}) {
  const reports = data?.items || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reports ({data?.total || 0})</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200 outline-none"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Case #</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Title</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Category</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Date</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report: any) => (
              <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-3 font-mono text-xs text-gray-600">{report.caseNumber}</td>
                <td className="py-3 px-3 text-gray-900 max-w-[200px] truncate">{report.title}</td>
                <td className="py-3 px-3 text-gray-600 capitalize">{report.category?.replace(/_/g, " ")}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[report.status]?.class || ""}`}>
                    {statusConfig[report.status]?.label || report.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-500 text-xs">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-3">
                  <select
                    value={report.status}
                    onChange={(e) => onUpdateStatus(report.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-red-200 outline-none"
                  >
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="py-12 text-center text-gray-400">No reports found</div>
        )}
      </div>
    </div>
  );
}

// ─── Users Tab ───
function UsersTab({ data, roleFilter, setRoleFilter, search, setSearch, currentUser, onUpdateRole, onDeleteUser }: {
  data: any;
  roleFilter: string;
  setRoleFilter: (f: string) => void;
  search: string;
  setSearch: (s: string) => void;
  currentUser: any;
  onUpdateRole: (userId: number, role: string) => void;
  onDeleteUser: (userId: number) => void;
}) {
  const usersList = data?.items || [];
  const isSuperadmin = currentUser.role === "superadmin";

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Users ({data?.total || 0})</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 outline-none w-48"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200 outline-none"
          >
            <option value="">All Roles</option>
            {Object.entries(roleConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-gray-500 font-medium">User</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Email</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Role</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Joined</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Last Login</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u: any) => {
              const isProtected = u.role === "superadmin";
              const isSelf = u.id === currentUser.id;
              const canModify = !isProtected && !isSelf && (isSuperadmin || u.role !== "admin");

              return (
                <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${isProtected ? "bg-red-50/30" : ""}`}>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-gray-900 font-medium">{u.name || "—"}</span>
                      {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{u.email || "—"}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig[u.role]?.class || ""}`}>
                      {isProtected && <Lock className="w-3 h-3 inline mr-1" />}
                      {roleConfig[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{new Date(u.lastSignInAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3">
                    {canModify ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateRole(u.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-red-200 outline-none"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="researcher">Researcher</option>
                          {isSuperadmin && <option value="admin">Admin</option>}
                        </select>
                        {isSuperadmin && (
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Delete user"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        {isProtected ? "Protected" : isSelf ? "Self" : "No access"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {usersList.length === 0 && (
          <div className="py-12 text-center text-gray-400">No users found</div>
        )}
      </div>
    </div>
  );
}

// ─── Security Tab ───
function SecurityTab({ data }: { data: any }) {
  if (!data) return <div className="p-8 text-center text-gray-400">Loading security data...</div>;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-100 bg-green-50/50">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Admin Accounts</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{data.adminCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-yellow-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Inactive (30d+)</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{data.inactiveUsers}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">New Today</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">{data.newRegistrationsToday}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Security Rules</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Superadmin cannot be deleted or demoted</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Only one superadmin can exist in the system</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Only superadmin can promote users to admin</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Admins cannot modify other admin accounts</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Users cannot change their own role</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> All role changes are logged in audit trail</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sessions expire after 7 days</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Passwords hashed with scrypt (64-byte key)</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Cookies are httpOnly with secure flag in production</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Audit Tab ───
function AuditTab({ data }: { data: any }) {
  const logs = data?.items || [];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Log ({data?.total || 0})</h3>

      <div className="space-y-2">
        {logs.map((log: any) => (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{log.action.replace(/_/g, " ")}</span>
                {" on "}
                <span className="text-gray-600">{log.resource}</span>
                {log.resourceId && <span className="text-gray-400"> #{log.resourceId}</span>}
              </p>
              {log.details && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="py-12 text-center text-gray-400">No audit logs yet</div>
        )}
      </div>
    </div>
  );
}

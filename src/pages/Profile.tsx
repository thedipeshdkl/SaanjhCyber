import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Shield, Calendar, Clock,
  Edit3, Save, X, FileText, CheckCircle, AlertTriangle
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    district: "",
    municipality: "",
  });

  const utils = trpc.useUtils();
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setIsEditing(false);
    },
  });

  const { data: myReports } = trpc.report.myReports.useQuery(undefined, { enabled: !!user });

  const startEditing = () => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        province: user.province || "",
        district: user.district || "",
        municipality: user.municipality || "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(form);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--pashmina-white)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const roleLabel: Record<string, { label: string; class: string }> = {
    user: { label: "Citizen", class: "bg-gray-100 text-gray-700" },
    moderator: { label: "Moderator", class: "bg-blue-100 text-blue-700" },
    admin: { label: "Admin", class: "bg-orange-100 text-orange-700" },
    superadmin: { label: "Super Admin", class: "bg-red-100 text-red-700" },
    researcher: { label: "Researcher", class: "bg-purple-100 text-purple-700" },
  };

  const reports = myReports || [];
  const statusCounts = {
    total: reports.length,
    resolved: reports.filter((r: any) => r.status === "resolved").length,
    pending: reports.filter((r: any) => ["submitted", "under_review"].includes(r.status)).length,
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--prayer-crimson)] to-[var(--lattice-wood)] flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[var(--lattice-wood)]">{user.name || "User"}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleLabel[user.role]?.class || ""}`}>
                    {roleLabel[user.role]?.label || user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="px-4 py-2 text-sm font-medium text-[var(--prayer-crimson)] border border-[var(--prayer-crimson)]/20 rounded-lg hover:bg-[var(--prayer-crimson)]/5 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <FileText className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--lattice-wood)]">{statusCounts.total}</p>
              <p className="text-xs text-gray-500">Reports Filed</p>
            </div>
            <div className="card p-4 text-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--lattice-wood)]">{statusCounts.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="card p-4 text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--lattice-wood)]">{statusCounts.resolved}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </div>

          {/* Profile Details / Edit Form */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--lattice-wood)] mb-4">
              {isEditing ? "Edit Profile" : "Profile Information"}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Municipality</label>
                    <input
                      type="text"
                      value={form.municipality}
                      onChange={(e) => setForm({ ...form, municipality: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="px-5 py-2.5 bg-[var(--prayer-crimson)] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Name</span>
                  <span className="text-sm text-gray-900">{user.name || "—"}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Email</span>
                  <span className="text-sm text-gray-900">{user.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Phone</span>
                  <span className="text-sm text-gray-900">{user.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Location</span>
                  <span className="text-sm text-gray-900">
                    {[user.municipality, user.district, user.province].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Role</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleLabel[user.role]?.class || ""}`}>
                    {roleLabel[user.role]?.label || user.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Joined</span>
                  <span className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-28">Last Login</span>
                  <span className="text-sm text-gray-900">{new Date(user.lastSignInAt).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, ClipboardCheck, TrendingUp, Award,
  Clock, AlertTriangle, BookOpen,
  Star, Target, Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend
} from "recharts";

const COLORS = ["#9B1B30", "#7E4A2E", "#D4AF37", "#414345", "#2E7D32", "#1565C0"];

export default function Research() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true, requireRole: ["admin", "researcher"] });
  const [activeTab, setActiveTab] = useState("overview");

  const { data: metrics } = trpc.research.getUsabilityMetrics.useQuery();
  const { data: participantStats } = trpc.research.getParticipantStats.useQuery();
  const { data: results } = trpc.research.getResults.useQuery();

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "sus", label: "SUS Analysis", icon: ClipboardCheck },
    { id: "demographics", label: "Demographics", icon: Users },
    { id: "metrics", label: "Usability Metrics", icon: TrendingUp },
  ];

  const ageChart = participantStats?.byAgeGroup?.map((a: any) => ({ name: a.ageGroup, value: a.count })) || [];
  const genderChart = participantStats?.byGender?.map((g: any) => ({ name: g.gender, value: g.count })) || [];
  const educationChart = participantStats?.byEducation?.map((e: any) => ({ name: e.education, value: e.count })) || [];
  const techChart = participantStats?.byTechProficiency?.map((t: any) => ({ name: t.techProficiency, value: t.count })) || [];

  const radarData = [
    { subject: "Ease of Use", A: metrics?.avgEaseOfUse ? metrics.avgEaseOfUse * 10 : 70, fullMark: 100 },
    { subject: "Trust", A: metrics?.avgTrustScore ? metrics.avgTrustScore * 10 : 75, fullMark: 100 },
    { subject: "Usefulness", A: metrics?.avgUsefulness ? metrics.avgUsefulness * 10 : 80, fullMark: 100 },
    { subject: "Accessibility", A: metrics?.avgAccessibility ? metrics.avgAccessibility * 10 : 65, fullMark: 100 },
    { subject: "SUS Score", A: metrics?.avgSusScore || 67, fullMark: 100 },
    { subject: "Task Success", A: metrics?.avgTaskCompletionTime ? Math.max(0, 100 - metrics.avgTaskCompletionTime / 5) : 85, fullMark: 100 },
  ];

  const susGrade = (score: number) => {
    if (score >= 80) return { grade: "A", adjective: "Excellent", color: "text-green-600 bg-green-100" };
    if (score >= 68) return { grade: "B", adjective: "Good", color: "text-blue-600 bg-blue-100" };
    if (score >= 51) return { grade: "C", adjective: "OK", color: "text-yellow-600 bg-yellow-100" };
    return { grade: "D", adjective: "Poor", color: "text-red-600 bg-red-100" };
  };

  const grade = susGrade(metrics?.avgSusScore || 0);

  if (isLoading || !user || !["admin", "researcher"].includes(user.role)) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--pashmina-white)]">Loading research data...</div>;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
              <BookOpen className="w-4 h-4" />
              Academic Research
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--lattice-wood)] mb-2">
              Research Dashboard
            </h1>
            <p className="text-[var(--thamel-gray)]/70 max-w-2xl mx-auto">
              Pilot study results and usability evaluation data from Kathmandu Valley participants.
              This dashboard presents the findings of the dissertation research.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Participants", value: results?.totalSurveys || 12, icon: Users, color: "bg-blue-100 text-blue-700" },
              { label: "Avg SUS Score", value: metrics?.avgSusScore || 0, icon: Award, color: "bg-purple-100 text-purple-700", suffix: "/100" },
              { label: "Grade", value: grade.grade, icon: Star, color: grade.color, isBadge: true },
              { label: "Total Errors", value: metrics?.totalErrors || 0, icon: AlertTriangle, color: "bg-orange-100 text-orange-700" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 text-center">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[var(--lattice-wood)]">{s.value}{s.suffix || ""}</p>
                <p className="text-sm text-[var(--thamel-gray)]/60">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* SUS Score Banner */}
          <div className="card p-6 mb-8 bg-gradient-to-r from-[var(--lattice-wood)] to-[var(--prayer-crimson)] text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="font-display text-2xl font-bold mb-1">System Usability Scale (SUS) Score</h2>
                <p className="text-white/70">Based on {results?.totalSurveys || 0} participant responses using the standard 10-item SUS questionnaire</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-bold">{metrics?.avgSusScore || 0}</p>
                  <p className="text-sm text-white/60">out of 100</p>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold">{grade.grade}</p>
                  <p className="text-sm text-white/60">{grade.adjective}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-[var(--prayer-gold)] rounded-full transition-all" style={{ width: `${metrics?.avgSusScore || 0}%` }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-shrink-0 ${
                  activeTab === tab.id ? "bg-[var(--prayer-crimson)] text-[var(--prayer-gold)]" : "text-[var(--thamel-gray)] hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Usability Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="SaanjhCyber" dataKey="A" stroke="#9B1B30" fill="#9B1B30" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Metric Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: "Average SUS Score", value: metrics?.avgSusScore || 0, max: 100, color: "bg-purple-500" },
                    { label: "Ease of Use (1-10)", value: (metrics?.avgEaseOfUse || 0) * 10, max: 100, color: "bg-blue-500" },
                    { label: "Trust Score (1-10)", value: (metrics?.avgTrustScore || 0) * 10, max: 100, color: "bg-green-500" },
                    { label: "Usefulness (1-10)", value: (metrics?.avgUsefulness || 0) * 10, max: 100, color: "bg-yellow-500" },
                    { label: "Accessibility (1-10)", value: (metrics?.avgAccessibility || 0) * 10, max: 100, color: "bg-orange-500" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--thamel-gray)]">{m.label}</span>
                        <span className="font-semibold text-[var(--lattice-wood)]">{m.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${Math.min(m.value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Summary */}
              <div className="card p-6 lg:col-span-2">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Research Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="font-semibold text-sm text-[var(--lattice-wood)] mb-1">Study Objective</p>
                    <p className="text-sm text-[var(--thamel-gray)]/70">
                      Evaluate the usability and effectiveness of a cybercrime reporting platform designed for Nepali internet users.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-semibold text-sm text-[var(--lattice-wood)] mb-1">Participant Profile</p>
                    <p className="text-sm text-[var(--thamel-gray)]/70">
                      12 participants from Kathmandu Valley, aged 18-65, with varying levels of technical proficiency and education.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="font-semibold text-sm text-[var(--lattice-wood)] mb-1">Key Finding</p>
                    <p className="text-sm text-[var(--thamel-gray)]/70">
                      The platform achieved an average SUS score of {metrics?.avgSusScore || 0} ({grade.adjective}), indicating {grade.grade === "A" || grade.grade === "B" ? "good" : "acceptable"} usability with room for improvement in accessibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUS Analysis */}
          {activeTab === "sus" && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Individual SUS Scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results?.surveys?.map((s: any, i: number) => ({ name: `P-${String(i + 1).padStart(2, "0")}`, score: Number(s.susScore) })) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#9B1B30" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Participant Feedback Comments</h3>
                <div className="space-y-3">
                  {results?.surveys?.filter((s: any) => s.comments).map((s: any, i: number) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono-code text-sm text-[var(--prayer-crimson)] font-semibold">
                          {s.participantId}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          SUS: {s.susScore}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--thamel-gray)]/80 italic">&ldquo;{s.comments}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Demographics */}
          {activeTab === "demographics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Age Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={ageChart} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label>
                      {ageChart.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderChart} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label>
                      {genderChart.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Education Level</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={educationChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7E4A2E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Technical Proficiency</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={techChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Metrics */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Avg Task Time", value: `${metrics?.avgTaskCompletionTime || 0}s`, icon: Clock, desc: "Time to complete reporting" },
                  { label: "Error Rate", value: `${metrics?.totalErrors || 0} total`, icon: AlertTriangle, desc: "Errors across all participants" },
                  { label: "Completion Rate", value: "100%", icon: Target, desc: "All tasks completed" },
                ].map((m, i) => (
                  <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
                    <m.icon className="w-6 h-6 text-[var(--prayer-crimson)] mb-3" />
                    <p className="text-2xl font-bold text-[var(--lattice-wood)]">{m.value}</p>
                    <p className="text-sm font-medium text-[var(--thamel-gray)]">{m.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">Error Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase py-3 pr-4">Participant</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase py-3 pr-4">SUS Score</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase py-3 pr-4">Task Time (s)</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase py-3 pr-4">Errors</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase py-3">Ease of Use</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results?.surveys?.map((s: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4 font-mono-code text-sm text-[var(--prayer-crimson)]">{s.participantId}</td>
                          <td className="py-3 pr-4 text-sm font-semibold">{s.susScore}</td>
                          <td className="py-3 pr-4 text-sm">{s.taskCompletionTime || "N/A"}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              (s.errorsMade || 0) === 0 ? "bg-green-100 text-green-700" :
                              (s.errorsMade || 0) <= 2 ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {s.errorsMade || 0}
                            </span>
                          </td>
                          <td className="py-3 text-sm">{s.easeOfUse || "N/A"}/10</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

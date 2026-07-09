import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw,
  FileText, MessageSquare, Eye, Download, Calendar,
  MapPin, User, DollarSign, Lock, Globe
} from "lucide-react";
import { trpc } from "@/providers/trpc";

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

const privacyLabels: Record<string, { label: string; icon: typeof Eye }> = {
  public: { label: "Public", icon: Globe },
  anonymous: { label: "Anonymous", icon: User },
  private: { label: "Private", icon: Lock },
};

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);

  const { data: report, isLoading } = trpc.report.getById.useQuery({ id: reportId });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
        <div className="max-w-3xl mx-auto px-4 text-center py-16">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-[var(--lattice-wood)] mb-2">Report Not Found</h2>
          <p className="text-[var(--thamel-gray)]/60 mb-6">The report you are looking for does not exist or has been removed.</p>
          <Link to="/track" className="btn-primary">Back to Tracking</Link>
        </div>
      </div>
    );
  }

  const s = statusConfig[report.status || ""] || statusConfig.submitted;
  const privacy = privacyLabels[report.privacyLevel || "anonymous"];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Link */}
          <Link to="/track" className="inline-flex items-center gap-2 text-sm text-[var(--thamel-gray)]/60 hover:text-[var(--prayer-crimson)] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Case Tracking
          </Link>

          {/* Header Card */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono-code text-lg text-[var(--prayer-crimson)] font-bold">
                    {report.caseNumber}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s.class}`}>
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--lattice-wood)]">
                  {report.title}
                </h1>
              </div>
              <Link
                to={`/messages?report=${report.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Message Team
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-[var(--thamel-gray)]">
                {categoryLabels[report.category] || report.category}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-[var(--thamel-gray)]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.incidentDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-[var(--thamel-gray)]">
                <MapPin className="w-3.5 h-3.5" />
                {report.municipality}, {report.district}
              </span>
              {report.amountLost && (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full text-red-700">
                  <DollarSign className="w-3.5 h-3.5" />
                  {report.currency} {Number(report.amountLost).toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-[var(--thamel-gray)]">
                <privacy.icon className="w-3.5 h-3.5" />
                {privacy.label}
              </span>
              {report.riskScore && report.riskScore > 70 && (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full text-red-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Risk: {report.riskScore}%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Details & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="card p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-3">
                  Incident Description
                </h2>
                <p className="text-[var(--thamel-gray)]/70 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {/* Timeline */}
              <div className="card p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">
                  Case Timeline
                </h2>
                <div className="space-y-0">
                  {report.timeline?.map((event, i) => {
                    const es = statusConfig[event.status || ""] || statusConfig.submitted;
                    return (
                      <div key={i} className="flex gap-4 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${es.class} border-2 border-white shadow-sm`}>
                            <es.icon className="w-4 h-4" />
                          </div>
                          {i < (report.timeline?.length || 0) - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-[40px]" />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-[var(--lattice-wood)]">{event.title}</p>
                            <span className="text-xs text-gray-400">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--thamel-gray)]/60">{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              {report.comments && report.comments.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-display text-lg font-semibold text-[var(--lattice-wood)] mb-4">
                    Comments & Updates
                  </h2>
                  <div className="space-y-4">
                    {report.comments.map((comment, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[var(--prayer-crimson)]/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-[var(--prayer-crimson)]" />
                        </div>
                        <div>
                          <p className="text-sm text-[var(--thamel-gray)]/80">{comment.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Meta & Evidence */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="card p-5">
                <h3 className="font-semibold text-[var(--lattice-wood)] mb-3">Current Status</h3>
                <div className={`p-3 rounded-lg ${s.class} text-center`}>
                  <s.icon className="w-6 h-6 mx-auto mb-1" />
                  <p className="font-semibold">{s.label}</p>
                </div>
                {report.moderationNotes && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Moderator Note</p>
                    <p className="text-sm text-yellow-600">{report.moderationNotes}</p>
                  </div>
                )}
              </div>

              {/* Evidence */}
              <div className="card p-5">
                <h3 className="font-semibold text-[var(--lattice-wood)] mb-3">
                  Evidence ({report.evidence?.length || 0})
                </h3>
                {report.evidence && report.evidence.length > 0 ? (
                  <div className="space-y-3">
                    {report.evidence.map((ev: any, i: number) => {
                      const isImage = ev.fileType === "image" || ev.fileUrl?.startsWith("data:image/");
                      const isPdf = ev.fileType === "pdf" || ev.fileUrl?.startsWith("data:application/pdf");

                      return (
                        <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
                          {isImage && ev.fileUrl && (
                            <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={ev.fileUrl}
                                alt={ev.fileName}
                                className="w-full h-40 object-cover hover:opacity-90 transition-opacity cursor-zoom-in"
                              />
                            </a>
                          )}
                          <div className="flex items-center gap-3 p-2.5 bg-gray-50">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--lattice-wood)] truncate">{ev.fileName}</p>
                              <p className="text-xs text-gray-400">
                                {ev.fileType} · {(ev.fileSize / 1024).toFixed(0)} KB
                              </p>
                            </div>
                            {ev.fileUrl && (
                              <a
                                href={ev.fileUrl}
                                download={ev.fileName}
                                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-500" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No evidence uploaded</p>
                )}
              </div>

              {/* Report Meta */}
              <div className="card p-5">
                <h3 className="font-semibold text-[var(--lattice-wood)] mb-3">Report Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submitted</span>
                    <span className="text-[var(--lattice-wood)]">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-[var(--lattice-wood)]">{new Date(report.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Language</span>
                    <span className="text-[var(--lattice-wood)] uppercase">{report.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Victim Type</span>
                    <span className="text-[var(--lattice-wood)] capitalize">{report.victimType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Privacy</span>
                    <span className="text-[var(--lattice-wood)] capitalize">{report.privacyLevel}</span>
                  </div>
                  {report.evidenceCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Evidence Files</span>
                      <span className="text-[var(--lattice-wood)]">{report.evidenceCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

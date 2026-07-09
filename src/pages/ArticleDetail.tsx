import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Calendar, User, Clock, Share2,
  Bookmark, AlertTriangle, Lightbulb, FileText, Newspaper
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const categoryConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  scam_alert: { label: "Scam Alert", icon: AlertTriangle, color: "text-red-700", bgColor: "bg-red-50" },
  safety_tip: { label: "Safety Tip", icon: Lightbulb, color: "text-blue-700", bgColor: "bg-blue-50" },
  guide: { label: "Guide", icon: FileText, color: "text-green-700", bgColor: "bg-green-50" },
  news: { label: "News", icon: Newspaper, color: "text-purple-700", bgColor: "bg-purple-50" },
  resource: { label: "Resource", icon: BookOpen, color: "text-orange-700", bgColor: "bg-orange-50" },
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = trpc.article.getBySlug.useQuery({ slug: slug || "" });
  const { data: relatedArticles } = trpc.article.list.useQuery({ limit: 4 });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
        <div className="max-w-3xl mx-auto px-4 text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-[var(--lattice-wood)] mb-2">Article Not Found</h2>
          <p className="text-[var(--thamel-gray)]/60 mb-6">The article you are looking for does not exist or has been removed.</p>
          <Link to="/awareness" className="btn-primary">Back to Awareness</Link>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[article.category] || categoryConfig.resource;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back Link */}
          <Link to="/awareness" className="inline-flex items-center gap-2 text-sm text-[var(--thamel-gray)]/60 hover:text-[var(--prayer-crimson)] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>

          {/* Article Header */}
          <div className="mb-8">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cat.bgColor} ${cat.color} mb-4`}>
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </span>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--lattice-wood)] mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--thamel-gray)]/60">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </span>
              {article.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.viewCount} views
                </span>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="card p-8 mb-8">
            <p className="text-lg text-[var(--thamel-gray)]/80 leading-relaxed mb-6 font-medium">
              {article.excerpt}
            </p>
            <div className="prose prose-lg max-w-none text-[var(--thamel-gray)]/80 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-12">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[var(--thamel-gray)] hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[var(--thamel-gray)] hover:bg-gray-50 transition-colors">
              <Bookmark className="w-4 h-4" />
              Bookmark
            </button>
          </div>

          {/* Related Articles */}
          {relatedArticles && relatedArticles.items && relatedArticles.items.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-4">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.items
                  .filter((a: any) => a.id !== article.id)
                  .slice(0, 3)
                  .map((related: any) => {
                    const rc = categoryConfig[related.category] || categoryConfig.resource;
                    return (
                      <Link
                        key={related.id}
                        to={`/awareness/${related.slug}`}
                        className="card p-4 block hover:shadow-lg transition-shadow"
                      >
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rc.bgColor} ${rc.color} mb-2`}>
                          <rc.icon className="w-3 h-3" />
                          {rc.label}
                        </span>
                        <h3 className="font-semibold text-sm text-[var(--lattice-wood)] line-clamp-2">
                          {related.title}
                        </h3>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

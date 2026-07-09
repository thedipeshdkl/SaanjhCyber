import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Home, ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)] flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-[var(--prayer-crimson)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-[var(--prayer-crimson)]" />
          </div>

          <h1 className="font-display text-6xl font-bold text-[var(--lattice-wood)] mb-2">
            404
          </h1>
          <h2 className="font-display text-2xl font-semibold text-[var(--lattice-wood)] mb-4">
            Page Not Found
          </h2>
          <p className="text-[var(--thamel-gray)]/60 mb-8">
            The page you are looking for does not exist or has been moved.
            Please check the URL or navigate back to the homepage.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Cyber Safety Tip</p>
              <p className="text-sm text-amber-600 mt-1">
                Be cautious of fake URLs and phishing websites. Always verify
                the website address before entering sensitive information.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <button onClick={() => window.history.back()} className="btn-secondary w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

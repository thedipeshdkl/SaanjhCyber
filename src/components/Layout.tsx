import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Menu, X, User, LogOut,
  FileText, Search, BookOpen, Home, LayoutDashboard, BarChart3, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/report", label: "Report Crime", icon: FileText },
    { path: "/search", label: "Search", icon: Search },
    { path: "/track", label: "Track Case", icon: BarChart3 },
    { path: "/awareness", label: "Awareness", icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  const isHome = location.pathname === "/";
  // Navbar is only transparent on home page (dark hero behind it)
  // On all other pages, always show solid background
  const showSolid = scrolled || !isHome;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSolid
          ? "bg-[var(--pashmina-white)]/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className={`w-8 h-8 transition-colors ${showSolid ? "text-[var(--prayer-crimson)]" : "text-white"}`} />
            <span className={`font-display text-xl font-bold transition-colors ${showSolid ? "text-[var(--lattice-wood)]" : "text-white"}`}>
              SaanjhCyber
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? showSolid
                      ? "bg-[var(--prayer-crimson)]/10 text-[var(--prayer-crimson)]"
                      : "bg-white/20 text-white"
                    : showSolid
                      ? "text-[var(--thamel-gray)] hover:bg-gray-100"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {(user?.role === "admin" || user?.role === "superadmin") && (
                  <Link
                    to="/admin"
                    className={`p-2 rounded-lg transition-colors ${
                      showSolid ? "text-red-600 hover:bg-red-50" : "text-red-300 hover:bg-white/10"
                    }`}
                    title="Admin Panel"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                {(user?.role === "moderator") && (
                  <Link
                    to="/moderator"
                    className={`p-2 rounded-lg transition-colors ${
                      showSolid ? "text-blue-600 hover:bg-blue-50" : "text-blue-300 hover:bg-white/10"
                    }`}
                    title="Moderator Panel"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={`p-2 rounded-lg transition-colors ${
                    showSolid ? "text-[var(--thamel-gray)] hover:bg-gray-100" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link
                  to="/messages"
                  className={`p-2 rounded-lg transition-colors ${
                    showSolid ? "text-[var(--thamel-gray)] hover:bg-gray-100" : "text-white/80 hover:bg-white/10"
                  }`}
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  showSolid ? "bg-gray-100" : "bg-white/10"
                }`}>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${showSolid ? "text-[var(--thamel-gray)]" : "text-white"}`} />
                    <span className={`text-sm font-medium ${showSolid ? "text-[var(--thamel-gray)]" : "text-white"}`}>
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                  </Link>
                  {(user?.role === "admin" || user?.role === "superadmin") && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      showSolid ? "bg-red-100 text-red-700" : "bg-red-500/30 text-red-200"
                    }`}>
                      {user.role === "superadmin" ? "SA" : "Admin"}
                    </span>
                  )}
                  <button onClick={logout} className="ml-1 hover:opacity-70">
                    <LogOut className={`w-4 h-4 ${showSolid ? "text-[var(--thamel-gray)]" : "text-white"}`} />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  showSolid
                    ? "bg-[var(--prayer-crimson)] text-[var(--prayer-gold)] hover:brightness-110"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg ${showSolid ? "text-[var(--thamel-gray)]" : "text-white"}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--pashmina-white)] border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.path)
                      ? "bg-[var(--prayer-crimson)]/10 text-[var(--prayer-crimson)]"
                      : "text-[var(--thamel-gray)] hover:bg-gray-50"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  {(user?.role === "admin" || user?.role === "superadmin") && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  {user?.role === "moderator" && (
                    <Link
                      to="/moderator"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <Shield className="w-4 h-4" />
                      Moderator Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--thamel-gray)] hover:bg-gray-50"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-[var(--prayer-crimson)] text-[var(--prayer-gold)]"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--lattice-wood)] text-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-[var(--prayer-gold)]" />
              <span className="font-display text-lg font-bold text-white">SaanjhCyber</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Nepal&apos;s official cybercrime reporting platform. Empowering citizens to report,
              track, and stay informed about digital threats.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--prayer-gold)] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/report" className="hover:text-[var(--prayer-gold)] transition-colors">Report Cybercrime</Link></li>
              <li><Link to="/search" className="hover:text-[var(--prayer-gold)] transition-colors">Search Database</Link></li>
              <li><Link to="/track" className="hover:text-[var(--prayer-gold)] transition-colors">Track Your Case</Link></li>
              <li><Link to="/awareness" className="hover:text-[var(--prayer-gold)] transition-colors">Cyber Awareness</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--prayer-gold)] mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/awareness" className="hover:text-[var(--prayer-gold)] transition-colors">Safety Guides</Link></li>
              <li><Link to="/awareness" className="hover:text-[var(--prayer-gold)] transition-colors">Scam Alerts</Link></li>
              <li><Link to="/research" className="hover:text-[var(--prayer-gold)] transition-colors">Research Data</Link></li>
              <li><Link to="/" className="hover:text-[var(--prayer-gold)] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--prayer-gold)] mb-4">Emergency Contacts</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Nepal Police: <span className="text-white">100</span></li>
              <li>Cyber Bureau: <span className="text-white">01-4412480</span></li>
              <li>Cyber Helpline: <span className="text-white">1149</span></li>
              <li>eSewa: <span className="text-white">1660-01-02121</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            &copy; 2026 SaanjhCyber. An academic research initiative for cybercrime reporting in Nepal.
          </p>
          <p className="text-xs text-white/40">
            Dissertation Project | Kathmandu Valley Pilot Study
          </p>
        </div>
      </div>
    </footer>
  );
}

import ChatBot from "./ChatBot";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--pashmina-white)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

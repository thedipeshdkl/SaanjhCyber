import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isRegister) {
      registerMutation.mutate({ name: form.name, email: form.email, password: form.password });
    } else {
      loginMutation.mutate({ email: form.email, password: form.password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,rgba(250,245,239,1),rgba(239,229,220,1))]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full" />
          <p className="text-sm text-[var(--thamel-gray)]/70">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[linear-gradient(180deg,#fbf7f2_0%,#f4ebe3_52%,#efe3d7_100%)] pt-20 pb-12">
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top_left,rgba(138,34,34,0.15),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(87,68,52,0.14),transparent_30%)]" />
      <div className="w-full max-w-md px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 shadow-2xl border border-white/60 bg-white/85 backdrop-blur rounded-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--prayer-crimson)]/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Shield className="w-8 h-8 text-[var(--prayer-crimson)]" />
            </div>
            <h1 className="font-display text-3xl font-bold text-[var(--lattice-wood)] mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-[var(--thamel-gray)]/70">
              {isRegister
                ? "Join SaanjhCyber to report cybercrimes and track cases"
                : "Sign in to access your dashboard and reports"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    minLength={2}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--prayer-crimson)] focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--prayer-crimson)] focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={isRegister ? 8 : 1}
                  placeholder={isRegister ? "Min 8 characters" : "Your password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--prayer-crimson)] focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[var(--lattice-wood)] text-white hover:brightness-110 shadow-lg shadow-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-sm text-[var(--prayer-crimson)] hover:underline font-medium"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </button>
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[var(--prayer-crimson)] hover:underline font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

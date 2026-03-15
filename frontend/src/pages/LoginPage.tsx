import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveToken } from "../services/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      saveToken(res.data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-primary-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-primary-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card p-10 relative z-10 m-4 border border-border dark:border-white/5">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 mb-6 shadow-xl shadow-primary-500/5 text-4xl">
            ✨
          </div>
          <h1 className="text-4xl font-black text-textHeadings dark:text-slate-100 uppercase tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-[10px] text-textSecondary dark:text-slate-400 font-black uppercase tracking-[0.2em]">
            Precision Financial Management
          </p>
        </div>

        {error && (
          <div className="mb-6 text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl px-4 py-4 flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-textHeadings dark:text-slate-300 mb-2 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field font-bold"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-textHeadings dark:text-slate-300 mb-2 uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field font-bold"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-600/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
        
        <p className="mt-10 text-[10px] text-textSecondary dark:text-slate-400 text-center font-black uppercase tracking-widest">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-black border-b border-primary-600/30 hover:border-primary-600 transition-all ml-1">
            SIGN UP
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;


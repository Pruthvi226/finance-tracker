import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveToken } from "../services/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Cpu
} from "lucide-react";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear form fields on page load
    setEmail("");
    setPassword("");
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      saveToken(res.data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong while signing in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090F] relative overflow-hidden font-sans">
      {/* Sophisticated Animated Mesh Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-primary-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[140px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-md relative z-10 m-4"
      >
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600" />
          
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-500/10 border border-primary-500/20 mb-8 shadow-2xl shadow-primary-500/10 text-primary-400"
            >
              <Cpu size={40} strokeWidth={1.5} />
            </motion.div>
            
            <PremiumBadge color="primary" className="mb-4 !bg-primary-500/10 !border-primary-500/20 !text-primary-400 !text-[9px]">
               Personal Finance Portal
            </PremiumBadge>
            
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
              Sign In
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80">
              Manage your money with ease
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <AlertTriangle size={16} /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Your Email</label>
              <div className="relative group/field">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-primary-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Password</label>
                <Link to="#" className="text-[9px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group/field">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-primary-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  autoComplete="off"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <PremiumButton
                type="submit"
                disabled={loading}
                className="w-full !py-4 shadow-2xl shadow-primary-500/20 !rounded-[24px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Signing you in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight size={18} />
                  </span>
                )}
              </PremiumButton>
            </div>
          </form>
          
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              New here?{" "}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 border-b border-primary-500/30 hover:border-primary-500 transition-all ml-1">
                Create an Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 opacity-60">
           <ShieldCheck size={14} />
           <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure & Encrypted Connection</span>
        </div>
      </motion.div>
    </div>
  );
};

const AlertTriangle = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default LoginPage;

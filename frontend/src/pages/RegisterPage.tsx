import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Cpu,
  Trophy,
  AlertTriangle
} from "lucide-react";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

const RegisterPage = () => {
  const [name, setName] = useState("");
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
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Something went wrong when creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090F] relative overflow-hidden font-sans">
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[80vw] h-[80vw] bg-indigo-600/15 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -left-[10%] w-[70vw] h-[70vw] bg-emerald-600/15 rounded-full blur-[140px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-lg relative z-10 m-4"
      >
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-primary-600" />
          
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-8 shadow-2xl shadow-emerald-500/10 text-emerald-400"
            >
              <UserPlus size={40} strokeWidth={1.5} />
            </motion.div>
            
            <div className="flex justify-center mb-4">
               <PremiumBadge color="emerald">
                  Join Us
               </PremiumBadge>
            </div>
            
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
              Create Account
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80">
              Start your financial journey today
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Your Name</label>
                <div className="relative group/field">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Your Email</label>
                <div className="relative group/field">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Choose Password</label>
              <div className="relative group/field">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-emerald-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <PremiumButton
                type="submit"
                disabled={loading}
                className="w-full !py-4 shadow-2xl shadow-emerald-500/20 !rounded-[24px] !bg-gradient-to-r !from-emerald-500 !to-indigo-600"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create My Account <Trophy size={18} />
                  </span>
                )}
              </PremiumButton>
            </div>
          </form>
          
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 border-b border-emerald-500/30 hover:border-emerald-500 transition-all ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Status Verification */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Secure Data Storage</span>
           </div>
           <div className="flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Smart Verification</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  Send,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  isTyping?: boolean;
};

const QUICK_QUESTIONS = [
  { icon: <TrendingUp size={16} />, text: "How can I save more?" },
  { icon: <Activity size={16} />, text: "Analyze spending velocity" },
  { icon: <Target size={16} />, text: "Goal completion estimate" },
  { icon: <ShieldCheck size={16} />, text: "Verify financial health" },
  { icon: <Cpu size={16} />, text: "Market projections" },
];

const AiInsightsPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "👋 INITIALIZING NEURAL CONNECT...\n\nGreetings. I am your **Personalized Intelligence Engine**, synchronized with your real-time financial data.\n\nI can perform deep categorical audits, detect spending anomalies, and project wealth trajectories based on your current velocity.\n\nClick **\"Synchronize Analysis\"** for a comprehensive report, or initialize a specific query below.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userText = text.trim();
    setInputText("");
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMsgId, sender: "user", text: userText }]);

    const typingId = `typing-${Date.now()}`;
    setLoading(true);
    setMessages(prev => [...prev, { id: typingId, sender: "ai", text: "", isTyping: true }]);
    
    try {
      const res = await api.post("/ai/chat", { message: userText });
      
      let responseText = "";
      if (res.data.dataAvailable === false) {
        responseText = "⚠️ **PARAMETER LIMITATION:** " + (res.data.message || "Insufficient data points detected. I require at least 3 transactions to initialize an accurate model.");
      } else {
        responseText = res.data.reply || "Analysis complete, but no specific output was generated. Please refine your query parameters.";
      }

      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: responseText,
        })
      );
    } catch {
      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "❌ **CORE CONNECT FAILURE:** Unable to reach the intelligence engine. Please verify system status.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const analyzeFinances = async () => {
    setIsScanning(true);
    const msg = "SYSTEM AUDIT REQUEST: Perform full financial synchronization.";
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, sender: "user", text: msg }]);
    
    const typingId = `typing-${Date.now()}`;
    setLoading(true);
    
    try {
      const res = await api.get("/ai/insights");
      
      let responseText = "";
      if (res.data.dataAvailable === false || res.data.noData) {
        responseText = "📊 **SYSTEM STATUS: INSUFFICIENT DATA**\n\n" + (res.data.message || "Audit failed due to low transaction density (Minimum: 3 entries required).\n\n**RECOVERY STEPS:**\n1. Append recent entries in the **Global Ledger**\n2. Re-initialize synchronization.");
      } else {
        responseText = (Array.isArray(res.data.insights) ? res.data.insights.join('\n\n') : res.data.insights) || "✅ **AUDIT COMPLETE:** Financial health synchronized and verified.";
      }

      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: responseText,
        })
      );
    } catch {
      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "❌ **AUDIT FAILED:** Intelligence core offline. Check parameters.",
        })
      );
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-[1400px] mx-auto">
      {/* Precision Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[28px] blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative w-20 h-20 rounded-[24px] bg-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-2xl">
              <Cpu size={40} className="text-indigo-500 group-hover:rotate-90 transition-transform duration-700" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="h-1 w-6 bg-indigo-500 rounded-full" />
               <PremiumBadge color="indigo" variant="neon" pulse>NEURAL CORE ONLINE</PremiumBadge>
            </div>
            <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85]">
              Intelligence Center
            </h1>
            <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
              Gemini 1.5 Pro Engine <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> High-Fidelity Analysis
            </p>
          </div>
        </div>

        <PremiumButton 
          onClick={analyzeFinances}
          disabled={loading}
          variant="primary"
          size="lg"
          className="shadow-xl shadow-indigo-500/30 h-16 !px-10 !rounded-[24px]"
        >
          {loading ? <RefreshCw size={24} className="animate-spin" /> : <Zap size={24} fill="currentColor" />}
          SYNCHRONIZE ANALYSIS
        </PremiumButton>
      </div>

      <div className="grid grid-cols-12 gap-8 min-h-[700px]">
        {/* Left Matrix: Quick Operations */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
           <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2 flex items-center gap-2">
                 INITIALIZE COMMAND <ChevronRight size={10} />
              </p>
              <div className="flex flex-col gap-3">
                {QUICK_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={q.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => sendMessage(q.text)}
                    className="flex items-center gap-4 text-left px-5 py-5 rounded-[22px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-[13px] font-black text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group shadow-sm"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                       {q.icon}
                    </div>
                    <span className="uppercase tracking-widest leading-snug">{q.text}</span>
                  </motion.button>
                ))}
              </div>
           </div>

           <PremiumCard variant="glass" className="mt-auto !p-6 border-dashed">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck className="text-emerald-500" size={18} />
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Privacy Verified</h4>
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                Data is anonymized locally before neural transmission.
              </p>
           </PremiumCard>
        </div>

        {/* Right Matrix: Intelligence Terminal */}
        <div className="col-span-12 lg:col-span-9 flex flex-col rounded-[40px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative bg-white dark:bg-slate-950">
          {/* Scanning Overlay Animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[50] pointer-events-none flex flex-col items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px]" />
                <motion.div 
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_30px_rgba(99,102,241,0.8)] z-10"
                />
                <div className="relative z-10 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.5em] shadow-2xl animate-pulse">
                  SCANNING FINANCIAL MATRIX
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal Header */}
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] backdrop-blur-xl z-10">
            <div className="flex items-center gap-5">
              <div className="flex gap-2">
                 <div className="h-3 w-3 rounded-full bg-rose-500/50" />
                 <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                 <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" />
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-indigo-500" />
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Neural Terminal v1.53</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Core Synchronized</span>
            </div>
          </div>

          {/* Terminal Output */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide z-10 relative bg-[#fcfcfc] dark:bg-slate-950 font-mono"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-6 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 hover:rotate-6 ${
                      msg.sender === "ai"
                        ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-500"
                        : "bg-slate-900 border-slate-700 text-white"
                    }`}
                  >
                    {msg.sender === "ai" ? <Bot size={24} strokeWidth={2.5} /> : <User size={20} />}
                  </div>

                  <div
                    className={`max-w-[85%] px-8 py-6 rounded-[32px] text-[14px] leading-relaxed relative ${
                      msg.sender === "ai"
                        ? "bg-white dark:bg-indigo-600/10 border border-slate-200 dark:border-indigo-500/20 text-slate-800 dark:text-indigo-100 rounded-tl-sm shadow-sm"
                        : "bg-indigo-600 text-white rounded-tr-sm shadow-xl shadow-indigo-600/10"
                    }`}
                  >
                    {msg.isTyping ? (
                      <div className="flex gap-2 items-center py-2 px-1">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay }}
                            className="w-2.5 h-2.5 bg-indigo-500 rounded-full block"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap tracking-tight font-black uppercase tracking-tight">
                        {msg.text}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Terminal Input Buffer */}
          <div className="p-10 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] backdrop-blur-xl z-10">
            <div className="flex items-center gap-5 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform">
                 <Terminal size={22} strokeWidth={3} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                placeholder="INITIALIZE INPUT COMMAND..."
                className="flex-1 bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-[30px] pl-16 pr-24 py-6 text-[14px] font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-16 bg-indigo-600 text-white rounded-[20px] shadow-lg shadow-indigo-500/30 disabled:opacity-20 flex items-center justify-center border border-white/10"
              >
                <Send size={20} strokeWidth={3} />
              </motion.button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="h-[1px] w-12 bg-slate-200 dark:bg-white/10"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black">
                Personal Intelligence Requisition
              </p>
              <div className="h-[1px] w-12 bg-slate-200 dark:bg-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsPage;

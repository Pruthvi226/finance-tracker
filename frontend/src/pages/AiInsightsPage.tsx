import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";

type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  isTyping?: boolean;
};

const AiAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "Hi there! I'm your Finova AI Assistant. I can analyze your spending patterns, track your goals, and give you personalized financial advice. Click 'Analyze My Finances' to get started!",
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      // Add user message
      const userMsgId = Date.now().toString();
      setMessages(prev => [...prev, { id: userMsgId, sender: "user", text: "Please analyze my recent finances." }]);
      
      // Add AI typing indicator
      const typingId = (Date.now() + 1).toString();
      setTimeout(() => {
        setMessages(prev => [...prev, { id: typingId, sender: "ai", text: "", isTyping: true }]);
      }, 400);

      const res = await api.get("/insights/generate");
      
      // Render AI response
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: (Date.now() + 2).toString(),
        sender: "ai",
        text: res.data.insights || "No insight available right now."
      }));

    } catch (error) {
      setMessages(prev => prev.filter(m => !m.isTyping).concat({
        id: Date.now().toString(),
        sender: "ai",
        text: "Error fetching insights. Ensure the Gemini API key is configured on the backend."
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 text-textHeadings dark:text-slate-100 uppercase tracking-tighter">
            <SmartToyIcon fontSize="large" className="text-primary-600" />
            AI Assistant
          </h1>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">
            Gemini-Powered Financial Wisdom
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card p-0 flex flex-col overflow-hidden relative border border-border dark:border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Chat window */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide relative z-10"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-4 max-w-[90%] sm:max-w-[80%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div 
                className={`flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-[1rem] flex items-center justify-center shadow-sm ${
                  msg.sender === "ai" 
                    ? "bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-500/20 dark:to-primary-500/5 border border-primary-200/50 dark:border-primary-500/20 text-primary-600 dark:text-primary-400" 
                    : "bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 border border-gray-700 dark:border-gray-600 text-white shadow-lg"
                }`}
              >
                {msg.sender === "ai" ? <SmartToyIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
              </div>
              
              <div 
                className={`p-5 rounded-3xl text-[13px] sm:text-sm leading-relaxed shadow-[0_2px_10px_rgb(0,0,0,0.02)] ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 text-white rounded-tr-md font-medium border border-gray-700 dark:border-gray-600 shadow-xl" 
                    : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/50 dark:border-white/10 text-textPrimary dark:text-slate-200 rounded-tl-md whitespace-pre-wrap font-medium"
                }`}
              >
                {msg.isTyping ? (
                  <div className="flex gap-1.5 items-center px-4 py-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500/80 animate-bounce shadow-sm" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500/80 animate-bounce shadow-sm" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500/80 animate-bounce shadow-sm" style={{ animationDelay: "300ms" }}></span>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input area mockup */}
        <div className="p-4 sm:p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-white/50 dark:border-white/10 z-10 mt-auto">
          <div className="relative flex items-center">
            <div className="absolute left-3 flex gap-2">
              <button 
                onClick={fetchInsights}
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-500/20 px-4 py-2.5 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-500/30 transition-all shadow-sm disabled:opacity-50 hover:-translate-y-0.5"
              >
                Analyze Finances
              </button>
            </div>
            <input 
              type="text" 
              disabled
              placeholder="Ask a question about your spending..."
              className="w-full bg-white/80 dark:bg-slate-950/50 border border-border/50 dark:border-white/10 rounded-2xl pl-[170px] pr-16 py-4 sm:py-5 text-sm font-semibold text-textPrimary dark:text-slate-200 placeholder:text-textMuted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-inner"
            />
            <button className="absolute right-2 h-10 w-10 flex items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors">
              <SendIcon sx={{ fontSize: 18 }} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { 
  Search, 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  Settings, 
  Plus, 
  X,
  Sparkles,
  Target, 
  ShieldCheck, 
  ChevronRight, 
  Loader2,
  Mic
} from "lucide-react";

interface ActionIntent {
  isTransaction: boolean;
  merchant?: string;
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
}

export const CommandCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [parsing, setParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [intent, setIntent] = useState<ActionIntent | null>(null);
  const navigate = useNavigate();
  const debounceTimer = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Voice input failed. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  // Intent Parsing Logic
  useEffect(() => {
    if (!search || search.length < 5) {
      setIntent(null);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      const keywords = ['spend', 'spent', 'add', 'earned', 'bought', 'paid', 'salary'];
      const hasKeyword = keywords.some(k => search.toLowerCase().includes(k));
      const hasNumber = /\d+/.test(search);

      if (hasKeyword && hasNumber) {
        setParsing(true);
        try {
          const res = await api.post('/ai/parse-intent', { query: search });
          if (res.data.isTransaction) {
            setIntent(res.data);
          } else {
            setIntent(null);
          }
        } catch (err) {
          console.error("Intent parsing failed");
        } finally {
          setParsing(false);
        }
      }
    }, 800);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, [search]);

  const handleExecuteIntent = async () => {
    if (!intent) return;
    try {
      setParsing(true);
      await api.post('/transactions', {
        description: intent.merchant || "Quick Add",
        amount: intent.amount,
        type: intent.type || 'EXPENSE',
        categoryName: intent.category || 'OTHER',
        date: new Date().toISOString().split('T')[0]
      });
      toast.success(`Saved: ₹${intent.amount} added for ${intent.merchant || intent.category}`);
      setIsOpen(false);
      setSearch("");
      setIntent(null);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  const actions = [
    { id: 'dash', label: 'Go to Home', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'tx', label: 'View Recent Spending', icon: ReceiptText, action: () => navigate('/transactions') },
    { id: 'add', label: 'Add New Spending', icon: Plus, action: () => navigate('/transactions?add=true'), highlight: true },
    { id: 'acc', label: 'Manage My Accounts', icon: Wallet, action: () => navigate('/accounts') },
    { id: 'set', label: 'App Settings', icon: Settings, action: () => navigate('/settings') },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10">
              
              {/* Search Bar */}
              <div className="flex items-center px-8 py-7 border-b border-slate-200 dark:border-white/5 relative">
                <div className="absolute left-8 h-6 w-6 pointer-events-none">
                  {parsing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-indigo-500"
                    >
                      <Loader2 size={24} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <Search className="text-indigo-500" size={24} strokeWidth={3} />
                  )}
                </div>
                
                <input
                  autoFocus
                  placeholder="Ask for something... (e.g. 'Spent 500 for lunch')"
                  className="bg-transparent border-none outline-none w-full text-xl font-black text-slate-800 dark:text-white placeholder:text-slate-400 pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                
                <div className="flex items-center gap-3">
                   {/* Voice Assistant Trigger */}
                   <button 
                     onClick={startVoiceCapture}
                     disabled={isListening}
                     className={`p-2.5 rounded-2xl transition-all ${isListening ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500'}`}
                   >
                     {isListening ? <Mic size={20} strokeWidth={3} /> : <Mic size={20} strokeWidth={3} />}
                   </button>

                   <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 opacity-50">
                      <kbd className="text-[10px] font-black">ESC</kbd>
                   </div>
                   <button 
                     onClick={() => setIsOpen(false)}
                     className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-rose-500"
                   >
                     <X size={20} strokeWidth={3} />
                   </button>
                </div>
              </div>

              {/* Semantic Confirmation Slot */}
              <AnimatePresence>
                {intent && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-indigo-600/5 border-b border-indigo-500/20"
                  >
                    <div className="p-8">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                             <Sparkles size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1">REQUEST DETECTED</h4>
                             <p className="text-[14px] font-bold text-slate-600 dark:text-slate-300">I've understood your fast command.</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                          <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                             <p className="text-[9px] font-black uppercase text-slate-400 mb-2">WHERE</p>
                             <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{intent.merchant || intent.category}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                             <p className="text-[9px] font-black uppercase text-slate-400 mb-2">AMOUNT</p>
                             <p className="text-[14px] font-bold text-indigo-500">₹{intent.amount?.toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                             <p className="text-[9px] font-black uppercase text-slate-400 mb-2">TYPE</p>
                             <p className="text-[14px] font-bold text-slate-900 dark:text-white">{intent.type}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                             <p className="text-[9px] font-black uppercase text-slate-400 mb-2">CATEGORY</p>
                             <p className="text-[14px] font-bold text-slate-900 dark:text-white">{intent.category}</p>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button 
                            onClick={() => setIntent(null)}
                            className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 dark:border-white/10"
                          >
                            Cancel
                          </button>
                          <button 
                             onClick={handleExecuteIntent}
                             disabled={parsing}
                             className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-[11px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                          >
                             {parsing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} strokeWidth={2.5} />}
                             Save to App
                          </button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action List */}
              <div className="p-6 max-h-[460px] overflow-y-auto scrollbar-hide">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 flex items-center justify-between">
                   <span>Quick Options</span>
                   {search && <span className="text-indigo-500 lowercase opacity-50">Searching for: {search}</span>}
                </div>
                
                {filteredActions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {filteredActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-5 rounded-[24px] hover:bg-indigo-600 hover:text-white group transition-all duration-300 mb-1 border border-transparent hover:border-indigo-400/30"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`p-3.5 rounded-2xl transition-all duration-300 ${
                            action.highlight ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 group-hover:bg-white group-hover:text-indigo-600' : 'bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:bg-white/20 group-hover:text-white'
                          }`}>
                            <action.icon size={22} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                             <p className="font-black text-[15px] tracking-tight">{action.label}</p>
                             <p className="text-[10px] font-bold text-slate-400 group-hover:text-white/60 uppercase tracking-widest mt-1">Direct Link</p>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all p-2 bg-white/20 rounded-xl">
                          <ChevronRight size={20} strokeWidth={3} />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !intent && (
                  <div className="p-20 text-center flex flex-col items-center">
                    <div className="mb-8 p-8 bg-slate-100 dark:bg-white/5 rounded-[40px] text-slate-200 dark:text-white/10 ring-1 ring-slate-200 dark:ring-white/5 shadow-inner">
                      <Target size={64} strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">No results</h3>
                    <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest max-w-xs">Try typing what you want to do.</p>
                  </div>
                )}
              </div>

              {/* Advanced Footer */}
              <div className="px-10 py-5 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                 <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                       <kbd className="h-6 w-6 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/10"><ChevronRight size={14} strokeWidth={4} color="#6366f1" rotate={90}/></kbd>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigation</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <kbd className="h-6 w-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm border border-slate-200 dark:border-white/10">ENTER</kbd>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Save Data</span>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
  ChevronDown, 
  IndianRupee, 
  Calendar, 
  Tag, 
  Wallet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Camera,
  Sparkles,
  Loader2,
  Scan,
  ShieldCheck,
  Zap
} from "lucide-react";
import { PremiumButton } from "../ui/PremiumButton";
import { PremiumBadge } from "../ui/PremiumBadge";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
}

interface Account {
  id: number;
  accountName: string;
  balance: number;
}

interface TransactionFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const TransactionForm = ({ initialData, onSuccess, onCancel }: TransactionFormProps) => {
  const [type, setType] = useState<"INCOME" | "EXPENSE">(initialData?.type || "EXPENSE");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId?.toString() || "");
  const [accountId, setAccountId] = useState<string>(initialData?.accountId?.toString() || "");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/ai/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      // If success is false, it means we got an ApiResponse.error(msg)
      if (data.success === false) {
        toast.error(data.message || "Could not read receipt");
      } else {
        // If we reached here and data is the payload (unwrapped by interceptor)
        const payload = data;
        if (payload.amount) setAmount(payload.amount.toString());
        if (payload.merchant) setDescription(payload.merchant);
        if (payload.date) setDate(payload.date);
        
        // Find category ID by name
        const match = categories.find(c => c.name.toUpperCase() === data.category?.toUpperCase() && c.type === "EXPENSE");
        if (match) setCategoryId(match.id.toString());
        
        setType("EXPENSE");
        toast.success("Receipt analyzed successfully!");
      }
    } catch (err) {
      toast.error("AI analysis failed. Please try again or enter manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, accRes] = await Promise.all([
          api.get("/categories"),
          api.get("/accounts")
        ]);
        setCategories(catRes.data);
        setAccounts(accRes.data);
        
        if (!initialData && accRes.data.length > 0) {
          setAccountId(accRes.data[0].id.toString());
        }
      } catch (error) {
        toast.error("Failed to load form data");
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [initialData]);

  useEffect(() => {
    const filtered = categories.filter(c => c.type === type);
    if (filtered.length > 0 && !categoryId) {
      setCategoryId(filtered[0].id.toString());
    } else if (filtered.length > 0) {
        const currentCat = categories.find(c => c.id.toString() === categoryId);
        if (currentCat && currentCat.type !== type) {
            setCategoryId(filtered[0].id.toString());
        }
    }
  }, [type, categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !accountId || !date) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        type,
        description,
        date,
        categoryId: parseInt(categoryId),
        accountId: parseInt(accountId)
      };

      if (initialData?.id) {
        await api.put(`/transactions/${initialData.id}`, payload);
        toast.success("Transaction updated!");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transaction added!");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving Parameters...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Precision Type Toggle */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            type === "EXPENSE"
              ? "bg-white dark:bg-rose-600 shadow-lg shadow-rose-500/10 text-rose-600 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ArrowDownRight size={16} strokeWidth={3} />
          OUTFLOW
        </button>
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            type === "INCOME"
              ? "bg-white dark:bg-emerald-600 shadow-lg shadow-emerald-500/10 text-emerald-600 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ArrowUpRight size={16} strokeWidth={3} />
          INFLOW
        </button>
      </div>

      {/* Cinematic OCR Scanner */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[22px] blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        <div className={`relative p-8 rounded-[20px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 transition-all overflow-hidden cursor-pointer ${
          isAnalyzing ? "ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-950" : ""
        }`}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleReceiptUpload} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            disabled={isAnalyzing}
          />
          
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-4 gap-4"
              >
                <div className="relative">
                   <Scan className="text-indigo-500 animate-pulse" size={48} strokeWidth={1} />
                   <motion.div 
                     animate={{ y: [0, 48, 0] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                   />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                     <Zap size={14} fill="currentColor" /> AI ANALYZING ENTITY
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Extracting magnitude & metadata...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-6"
              >
                <div className="h-16 w-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <Camera size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Vision Scan</h4>
                      <PremiumBadge color="indigo" variant="neon">PRECISION</PremiumBadge>
                   </div>
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] leading-relaxed">
                      Instant multi-field extraction via Gemini Vision.
                   </p>
                </div>
                <Sparkles size={20} className="text-amber-500 group-hover:rotate-12 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-8">
        {/* Magnitude Control */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 ml-1 flex items-center gap-2">
             QUANTUM MAGNITUDE <ShieldCheck size={10} className="text-emerald-500" />
          </label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-indigo-500 border border-slate-200 dark:border-white/5 transition-all group-focus-within:border-indigo-500/50">
              <IndianRupee size={18} strokeWidth={3} />
            </div>
            <input
              type="number"
              required
              step="0.01"
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl pl-20 pr-6 py-6 text-[36px] font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 ml-1">PORTFOLIO ORIGIN</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500">
                <Wallet size={18} strokeWidth={2.5} />
              </div>
              <select
                required
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-10 py-5 text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="" disabled>Select Source</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.accountName.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 ml-1">ENTRY CLASSIFICATION</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500">
                <Tag size={18} strokeWidth={2.5} />
              </div>
              <select
                required
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-10 py-5 text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="" disabled>Select Label</option>
                {categories.filter(c => c.type === type).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 ml-1">TEMPORAL TIMESTAMP</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500">
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <input
                type="date"
                required
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-6 py-5 text-[13px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 ml-1">EVENT METADATA</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500">
                <FileText size={18} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-6 py-5 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                placeholder="e.g. CORE INFRASTRUCTURE"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5 pt-10">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-5 rounded-[24px] bg-slate-100 dark:bg-white/5 text-slate-500 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5"
        >
          DISCARD
        </button>
        <PremiumButton type="submit" variant="primary" className="flex-[1.5] py-5 shadow-indigo-500/20" disabled={loading}>
           {loading ? "INITIALIZING..." : initialData?.id ? "UPDATE DATA POINT" : "RECORD EVENT"}
        </PremiumButton>
      </div>
    </form>
  );
};

export default TransactionForm;

import type { FormEvent } from "react";
import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Wallet,
  Calendar,
  IndianRupee,
  PieChart as PieIcon
} from "lucide-react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { motion, AnimatePresence } from "framer-motion";

type Budget = {
  monthlyLimit: number;
};

const BudgetPage = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [exceeded, setExceeded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [b, status] = await Promise.all([
        api.get<Budget | null>("/budget"),
        api.get<{ remaining: number; exceeded: boolean }>("/budget/status"),
      ]);
      if (b.data) {
        setBudget(b.data);
        setInput(b.data.monthlyLimit.toString());
      }
      setRemaining(status.data.remaining);
      setExceeded(status.data.exceeded);
    } catch (err) {
      console.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<Budget>("/budget", { monthlyLimit: Number(input) });
      setBudget(res.data);
      load();
    } catch (err) {
      console.error("Error saving budget");
    }
  };

  const spent = useMemo(() => {
    if (!budget || remaining === null) return 0;
    return Math.max(0, budget.monthlyLimit - remaining);
  }, [budget, remaining]);

  const progress = useMemo(() => {
    if (!budget || budget.monthlyLimit === 0) return 0;
    return Math.min(100, (spent / budget.monthlyLimit) * 100);
  }, [spent, budget]);

  return (
    <div className="flex flex-col gap-8 pb-12 items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 mb-4">
             <Target size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-[36px] font-black tracking-tight text-textHeadings dark:text-white uppercase leading-none">
            Budget Control Center
          </h1>
          <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2">
            Stay disciplined by defining your monthly expenditure ceiling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Section */}
          <div className="lg:col-span-5 space-y-6">
            <PremiumCard variant="white" className="!p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-textMuted border border-gray-100">
                  <PieIcon size={20} />
                </div>
                <h3 className="text-lg font-black text-textHeadings uppercase tracking-tight">Configuration</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1 block mb-2">Monthly Expenditure Limit</label>
                  <div className="relative">
                    <IndianRupee size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] pl-12 pr-6 py-4 text-[22px] font-black tracking-tighter outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <PremiumButton type="submit" className="w-full !py-4 shadow-xl shadow-primary-500/20">
                  <Save size={18} />
                  Update Parameters
                </PremiumButton>
              </form>
            </PremiumCard>

            <PremiumCard variant="glass" className="!p-6 border-dashed">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-textHeadings uppercase">Cycle Info</h4>
                  <p className="text-xs text-textSecondary dark:text-slate-400 mt-1">Your budget resets on the 1st of every month at 00:00 UTC.</p>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Visual Progress Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="h-full min-h-[400px] w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-[32px]" />
              ) : budget ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <PremiumCard variant={exceeded ? 'rose' : 'emerald'} className="border-none shadow-2xl overflow-hidden relative min-h-[380px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 -translate-y-10">
                       <Target size={200} strokeWidth={1} />
                    </div>

                    <div className="p-10 relative z-10 text-white">
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Financial Trajectory</p>
                          <h3 className="text-2xl font-black uppercase tracking-tight">Active Monthly Quota</h3>
                        </div>
                        <CheckCircle2 size={32} strokeWidth={2.5} className={exceeded ? 'hidden' : 'block'} />
                        <AlertCircle size={32} strokeWidth={2.5} className={exceeded ? 'block' : 'hidden'} />
                      </div>

                      <div className="space-y-8">
                        <div>
                          <p className="text-[52px] font-black tracking-tighter leading-none mb-2">
                             {progress.toFixed(0)}%
                          </p>
                          <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-md shadow-inner relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className={`absolute top-0 left-0 bottom-0 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">Total Spent</p>
                            <p className="text-2xl font-black">₹{spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">Remaining</p>
                             <p className={`text-2xl font-black ${exceeded ? 'text-white' : 'text-white/80'}`}>₹{Math.max(0, remaining ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-black/10 backdrop-blur-md flex items-center gap-4 border-t border-white/10 mt-auto">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${exceeded ? 'bg-rose-500' : 'bg-emerald-500'} shadow-lg`}>
                        {exceeded ? <TrendingUp size={20} className="text-white" /> : <TrendingDown size={20} className="text-white" />}
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wide leading-relaxed">
                        {exceeded 
                          ? "Budget exceeded. You are now in liquidating reserves territory." 
                          : "Sustainable pace detected. You are within your projected limits."}
                      </p>
                    </div>
                  </PremiumCard>
                </motion.div>
              ) : (
                <PremiumCard variant="white" className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                   <div className="h-20 w-20 rounded-[28px] bg-gray-50 flex items-center justify-center mb-6">
                      <Wallet size={36} className="text-gray-200" />
                   </div>
                   <h3 className="text-xl font-black text-textHeadings tracking-tight uppercase">No Budget Provisioned</h3>
                   <p className="text-sm text-textSecondary mt-2 max-w-xs">Initialize your monthly ceiling to start tracking spending velocity.</p>
                </PremiumCard>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;

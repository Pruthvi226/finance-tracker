import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  BarChart3, 
  Plus, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

import toast from "react-hot-toast";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/budgets");
        setBudgets(res.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full" />
             <PremiumBadge color="indigo" variant="neon">MY MONTHLY BUDGETS</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            Spend Controls
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Active Planning <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> {budgets.length} Budgets Set
          </p>
        </div>

        <div className="flex gap-4">
           <PremiumButton 
            size="lg"
            className="shadow-xl shadow-indigo-500/20 h-14 !px-10 !rounded-[20px]"
          >
            <Plus size={18} strokeWidth={4} className="mr-2" />
            NEW BUDGET
          </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* KPI Row */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           <PremiumCard variant="white" className="!p-8 group overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Target size={20} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="indigo">PLANNING</PremiumBadge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Set Budget</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹54,000</h3>
           </PremiumCard>
           
           <PremiumCard variant="white" className="!p-8 group overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <CheckCircle2 size={20} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="emerald">ON TRACK</PremiumBadge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent So Far</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹21,450</h3>
           </PremiumCard>

           <PremiumCard variant="white" className="!p-8 group overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-inner group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <Zap size={20} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="rose">ALERTS</PremiumBadge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Over Budget Items</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">02</h3>
           </PremiumCard>
        </div>

        {/* Budget List */}
        <div className="col-span-12">
           <PremiumCard variant="white" className="!p-10">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Budget Details</h3>
                 <div className="flex items-center gap-4">
                    <button className="text-[11px] font-black text-slate-400 hover:text-indigo-500 uppercase flex items-center gap-2">
                       Sort By <ChevronRight size={14} strokeWidth={4} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-48 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))
                 ) : budgets.map((b, i) => {
                    const progress = (b.spentAmount / b.targetAmount) * 100;
                    const isHigh = progress > 85;
                    
                    return (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 group relative overflow-hidden"
                      >
                         <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-2xl ${isHigh ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'} transition-all`}>
                               <BarChart3 size={24} strokeWidth={2.5} />
                            </div>
                            <PremiumBadge color={isHigh ? 'rose' : 'emerald'}>
                               {isHigh ? 'WARNING' : 'HEALTHY'}
                            </PremiumBadge>
                         </div>

                         <div className="mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FOR {b.categoryName}</p>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{b.categoryName} BUDGET</h4>
                         </div>

                         <div className="space-y-4">
                            <div className="flex justify-between items-end">
                               <p className="text-[11px] font-bold text-slate-500">₹{b.spentAmount.toLocaleString()} / ₹{b.targetAmount.toLocaleString()}</p>
                               <p className="text-lg font-black text-slate-900 dark:text-white">{Math.round(progress)}%</p>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${Math.min(100, progress)}%` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className={`h-full ${isHigh ? 'bg-rose-500' : 'bg-indigo-500'}`}
                               />
                            </div>
                         </div>
                      </motion.div>
                    );
                 })}
              </div>
           </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;

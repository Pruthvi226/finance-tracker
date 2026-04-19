import { useEffect, useState } from "react";
import { format } from "date-fns";
import api from "../services/api";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  ChevronRight,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import toast from "react-hot-toast";

const GoalsPage = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/goals");
        setGoals(res.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load goals");
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
             <div className="h-0.5 w-10 bg-emerald-500 rounded-full" />
             <PremiumBadge color="emerald" variant="neon">MY SAVINGS GOALS</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            Financial Aims
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Target Focus <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> {goals.length} Goals Tracking
          </p>
        </div>

        <div className="flex gap-4">
           <PremiumButton 
            size="lg"
            className="shadow-xl shadow-emerald-500/20 h-14 !px-10 !rounded-[20px] bg-emerald-600 hover:bg-emerald-700 border-none"
          >
            <Plus size={18} strokeWidth={4} className="mr-2" />
            CREATE NEW GOAL
          </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Summary Row */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           <PremiumCard variant="white" className="!p-8 group overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Target size={20} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="emerald">TOTAL AIM</PremiumBadge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Savings Needed</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹8,50,000</h3>
           </PremiumCard>
           
           <PremiumCard variant="white" className="!p-8 group overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <TrendingUp size={20} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="indigo">SAVED</PremiumBadge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Progress</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹3,12,000</h3>
           </PremiumCard>

           <PremiumCard variant="white" className="!p-8 group overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Star size={20} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="amber">STATUS</PremiumBadge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Goals</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">04</h3>
           </PremiumCard>
        </div>

        {/* Goal Grid */}
        <div className="col-span-12">
           <PremiumCard variant="white" className="!p-10">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Savings Plan</h3>
                 <div className="flex items-center gap-4">
                    <button className="text-[11px] font-black text-slate-400 hover:text-emerald-500 uppercase flex items-center gap-2">
                       Filter By Date <ChevronRight size={14} strokeWidth={4} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))
                 ) : goals.map((goal, i) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="p-8 bg-slate-50 dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5 group relative overflow-hidden"
                      >
                         <div className="flex items-center justify-between mb-8">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                               <Target size={26} strokeWidth={2.5} />
                            </div>
                            <PremiumBadge color={progress >= 100 ? 'emerald' : 'indigo'}>
                               {progress >= 100 ? 'FINISHED' : 'IN PROGRESS'}
                            </PremiumBadge>
                         </div>

                         <div className="mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AIMING FOR</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{goal.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                               <Calendar size={12} className="text-slate-400" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finish by: {format(new Date(goal.targetDate), "MMM dd, yyyy")}</span>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="flex justify-between items-end">
                               <p className="text-[11px] font-bold text-slate-500">₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
                               <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round(progress)}%</p>
                            </div>
                            <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${Math.min(100, progress)}%` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                               />
                            </div>
                         </div>
                         
                         <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between group/btn cursor-pointer">
                            <span className="text-[10px] font-black text-slate-400 group-hover/btn:text-emerald-500 transition-colors uppercase tracking-widest">Add Funds</span>
                            <ChevronRight size={14} strokeWidth={4} className="text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
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

export default GoalsPage;

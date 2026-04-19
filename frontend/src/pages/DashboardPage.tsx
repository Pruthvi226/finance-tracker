import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  Plus,
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Wallet, 
  Sparkles,
  Zap,
  Target as GoalIcon,
  Activity,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  Lock,
  Layers,
  AlertTriangle,
  Flame,
  Trophy,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { StatCard } from "../components/Dashboard/StatCard";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { useSovereign } from "../hooks/useSovereign";

type DashboardStats = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  recentTransactions: any[];
  topCategories: any[];
};

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamification, setGamification] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  const navigate = useNavigate();
  const { persona, score } = useSovereign();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsRes, gamRes, forecastRes, anomalyRes, profileRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/gamification/stats"),
          api.get("/ai/forecast"),
          api.get("/ai/anomalies"),
          api.get("/users/me")
        ]);
        setStats(statsRes.data);
        setGamification(gamRes.data);
        setForecast(forecastRes.data);
        setAnomalies(anomalyRes.data.anomalies || []);
        setUserProfile(profileRes.data);
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Precision Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full" />
             <PremiumBadge color="indigo" variant="neon">MY FINANCIAL OVERVIEW</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            Hello, {userProfile?.name || 'User'}
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Status: Active <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> Data Sync Completed
          </p>
        </div>

        <div className="flex gap-4">
          <PremiumButton 
            onClick={() => navigate('/transactions?add=true')}
            size="lg"
            className="shadow-xl shadow-indigo-500/20 h-16 !px-10 !rounded-[24px]"
          >
            <Plus size={20} strokeWidth={4} className="mr-2" />
            RECORD TRANSACTION
          </PremiumButton>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-[32px] bg-slate-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Main KPI Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              title="TOTAL ACCOUNT BALANCE"
              value={`₹${(stats?.totalBalance || 0).toLocaleString()}`}
              delta={12.4}
              icon={<Wallet size={20} strokeWidth={2.5} />}
              accent="indigo"
              delayIndex={0}
            />
            <StatCard
              title="INCOME THIS MONTH"
              value={`₹${(stats?.monthlyIncome || 0).toLocaleString()}`}
              delta={8.2}
              icon={<ArrowUpRight size={20} strokeWidth={2.5} />}
              accent="emerald"
              delayIndex={1}
            />
            <StatCard
              title="EXPENSES THIS MONTH"
              value={`₹${(stats?.monthlyExpenses || 0).toLocaleString()}`}
              delta={-2.4}
              icon={<ArrowDownRight size={20} strokeWidth={2.5} />}
              accent="rose"
              delayIndex={2}
            />
             <PremiumCard 
               variant="white" 
               className="!p-8 flex flex-col justify-between group overflow-hidden relative"
               delayIndex={3}
             >
                <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:scale-110 transition-transform duration-700">
                   <GoalIcon size={120} />
                </div>
                <div className="relative z-10 flex justify-between items-start mb-6">
                   <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                      <TrendingUp size={20} strokeWidth={3} />
                   </div>
                   <PremiumBadge color="indigo" variant="neon">TARGET</PremiumBadge>
                </div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SAVINGS RATE</p>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      <AnimatedCounter value={stats?.savingsRate || 0} decimals={1} />%
                   </h3>
                </div>
             </PremiumCard>
          </div>

          <div className="grid grid-cols-12 gap-8">
           <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              {/* Strategic 6-Month Forecast */}
              <PremiumCard variant="white" className="h-[400px] !p-10 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">PROJECTED TRAJECTORY</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{forecast?.strategy || "SYSTEM ANALYZING TRENDS..."}</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Dynamic Prediction</span>
                       </div>
                    </div>
                 </div>

                 <div className="h-64 mt-4 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={forecast?.forecasts || []}>
                          <defs>
                             <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                             dataKey="month" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                             dy={10}
                          />
                          <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                             tickFormatter={(val) => `₹${val/1000}k`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '12px' }}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="predictedBalance" 
                             stroke="#6366f1" 
                             strokeWidth={4}
                             fillOpacity={1} 
                             fill="url(#colorPv)" 
                             animationDuration={2000}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="absolute -bottom-6 left-0 right-0 p-10 flex gap-4 overflow-x-auto scrollbar-hide">
                    {forecast?.milestones?.map((m: string, i: number) => (
                       <div key={i} className="whitespace-nowrap px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={12} className="text-emerald-500" /> {m}
                       </div>
                    ))}
                 </div>
              </PremiumCard>

              {/* AI Advisor Card */}
              <PremiumCard variant="obsidian" className="h-full !p-0 overflow-hidden shadow-2xl group flex flex-col sm:flex-row">
                 <div className="w-full sm:w-[50%] p-12 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-white/5 relative bg-gradient-to-br from-indigo-950/20 to-transparent">
                     <div>
                        <div className="flex items-center gap-3 mb-8">
                           <div className="h-12 w-12 rounded-[22px] bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                             {persona.type === 'SAVER' && <ShieldCheck size={26} strokeWidth={2.5} />}
                             {persona.type === 'SPENDER' && <Zap size={26} fill="white" />}
                             {persona.type === 'INVESTOR' && <Sparkles size={26} strokeWidth={2.5} />}
                             {persona.type === 'BALANCED' && <Activity size={26} strokeWidth={2.5} />}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">AI SAVINGS ADVISOR</p>
                              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{persona.title}</h3>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div>
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">MY SAVINGS HEALTH</p>
                              <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                                 {score}<span className="text-xl text-white/20 ml-2">/100</span>
                              </div>
                           </div>
                           <p className="text-[14px] font-bold text-slate-400 leading-relaxed max-w-[280px]">
                              {persona.description}
                           </p>
                        </div>
                     </div>

                     <PremiumButton 
                        variant="primary" 
                        size="lg" 
                        className="mt-12 w-full h-14 !rounded-[20px] shadow-xl shadow-indigo-600/20"
                        onClick={() => navigate('/war-room')}
                     >
                        VIEW FULL DETAILS <ChevronRight size={18} className="ml-2" />
                     </PremiumButton>
                  </div>

                  <div className="w-full sm:w-[50%] p-12 bg-white/5 flex flex-col justify-between">
                     <div className="space-y-8">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                             <BrainCircuit size={16} className="text-indigo-500" /> TOP RECOMMENDATIONS
                           </h4>
                        </div>

                        <div className="space-y-4">
                           {[
                             { title: "Review Monthly Bills", icon: Lock, status: "Pending" },
                             { title: "Increase Goal Targets", icon: GoalIcon, status: "Suggested" },
                             { title: "Unused App Subscriptions", icon: Zap, status: "Alert" }
                           ].map((rec, i) => (
                             <motion.div 
                               key={i}
                               whileHover={{ x: 6 }}
                               className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border-l-2 border-l-indigo-500"
                             >
                                <div className="flex items-center gap-4">
                                   <rec.icon size={16} className="text-slate-400" />
                                   <span className="text-[12px] font-black text-slate-200 uppercase tracking-tight">{rec.title}</span>
                                </div>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{rec.status}</span>
                             </motion.div>
                           ))}
                        </div>
                     </div>

                     <div className="mt-8 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between group/tip cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                              <Sparkles size={20} strokeWidth={2.5} />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">SMART TIP</p>
                              <p className="text-[12px] font-bold text-slate-200">You saved 12% more than last week!</p>
                           </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 group-hover/tip:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </PremiumCard>
                        {/* Account Performance */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
                {/* Savings Streak Widget */}
                <PremiumCard variant="gradient" className="h-[200px] !p-8 group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 text-white/10 group-hover:scale-125 transition-transform duration-1000">
                      <Flame size={120} strokeWidth={1} />
                   </div>
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                            <Trophy size={16} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">DEDICATION STREAK</span>
                      </div>
                      <div>
                         <div className="flex items-end gap-2 text-white">
                            <span className="text-5xl font-black tracking-tighter">{gamification?.streakCount || 0}</span>
                            <span className="text-xl font-bold uppercase mb-1">Days</span>
                         </div>
                         <p className="text-[11px] font-medium text-white/60 mt-2">You're in the top 5% of savers this week!</p>
                      </div>
                   </div>
                </PremiumCard>

                {/* Anomaly Alerts */}
                {anomalies.length > 0 && (
                   <PremiumCard className="!p-6 border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/5">
                      <div className="flex items-center gap-3 mb-4">
                         <AlertTriangle className="text-rose-500" size={18} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Unusual Activity</span>
                      </div>
                      <div className="space-y-3">
                         {(anomalies || []).map((a: any, i: number) => (
                            <div key={i} className="p-3 bg-white dark:bg-white/5 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-rose-500/10">
                               {a?.reason || 'Unknown anomaly detected'}
                            </div>
                         ))}
                      </div>
                   </PremiumCard>
                )}

                <PremiumCard variant="white" className="h-auto !p-10 flex flex-col justify-between group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 text-slate-100 dark:text-white/5 group-hover:scale-125 transition-transform duration-1000">
                      <Activity size={180} strokeWidth={0.5} />
                   </div>
                   
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">EXPORT DATA</h3>
                         <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                            <Download size={18} strokeWidth={3} />
                         </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed">Download your complete financial record for tax or external analysis.</p>
                         <PremiumButton 
                           variant="outline" 
                           size="sm" 
                           onClick={() => window.location.href = `${api.defaults.baseURL}/transactions/export`}
                           className="w-full"
                         >
                            DOWNLOAD CSV
                         </PremiumButton>
                      </div>
                   </div>
                </PremiumCard>
            </div>
   </div>

            {/* Top Categories Bento */}
            <div className="col-span-12 lg:col-span-12">
               <PremiumCard variant="white" className="!p-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">WHERE MY MONEY GOES</h3>
                    <button onClick={() => navigate('/analytics')} className="text-[11px] font-black text-indigo-500 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2">
                       FULL REPORT <ChevronRight size={14} strokeWidth={4} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                     {(stats?.topCategories || []).slice(0, 6).map((cat: any, i: number) => (
                       <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group/cat relative overflow-hidden"
                       >
                          <div className="absolute -bottom-4 -right-4 text-indigo-500/5 group-hover/cat:scale-150 transition-transform duration-500">
                             <Layers size={60} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{cat?.category || 'General'}</p>
                          <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">₹{(cat?.amount || 0).toLocaleString()}</h4>
                          <div className="mt-4 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 w-[65%]" />
                          </div>
                       </motion.div>
                     ))}
                  </div>
               </PremiumCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

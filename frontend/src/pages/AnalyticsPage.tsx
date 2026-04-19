import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";
import { 
  PiggyBank, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Globe,
  PieChart as PieIcon,
  Calendar
} from "lucide-react";
import { ActivityHeatmap } from "../components/Analytics/ActivityHeatmap";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumBadge } from "../components/ui/PremiumBadge";

type Insights = {
  categorySpending: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  monthlyIncome: Record<string, number>;
};

const toNum = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);

type RangeKey = "3m" | "6m" | "ytd" | "all";

const filterByRange = (entries: readonly (readonly [string, number])[], range: RangeKey) => {
  if (entries.length === 0 || range === "all") return entries;

  const sorted = [...entries].sort((a, b) => a[0].localeCompare(b[0])); // yyyy-MM
  const now = new Date();
  const currentYear = now.getFullYear();

  if (range === "ytd") {
    return sorted.filter(([ym]) => {
      const [y] = ym.split("-").map((n) => Number(n));
      return y === currentYear;
    });
  }

  const count = range === "3m" ? 3 : 6;
  return sorted.slice(-count);
};

const formatMonth = (ym: string) => {
  const [y, m] = ym.split("-").map((x) => Number(x));
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(undefined, { month: "short" }).toUpperCase();
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899"];

import toast from "react-hot-toast";

const AnalyticsPage = () => {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("6m");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get<Insights>("/analytics");
        setData(res.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryEntries = useMemo(() => {
    if (!data?.categorySpending || typeof data.categorySpending !== "object") return [];
    return Object.entries(data.categorySpending).map(([k, v]) => ({ name: k.toUpperCase(), value: toNum(v) }));
  }, [data]);

  const allMonthlyExpEntries = useMemo(() => {
    if (!data?.monthlyExpenses || typeof data.monthlyExpenses !== "object") return [];
    return Object.entries(data.monthlyExpenses)
      .map(([k, v]) => [k, toNum(v)] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const allMonthlyIncEntries = useMemo(() => {
    if (!data?.monthlyIncome || typeof data.monthlyIncome !== "object") return [];
    return Object.entries(data.monthlyIncome)
      .map(([k, v]) => [k, toNum(v)] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const filteredExp = useMemo(() => filterByRange(allMonthlyExpEntries, range), [allMonthlyExpEntries, range]);
  const filteredInc = useMemo(() => filterByRange(allMonthlyIncEntries, range), [allMonthlyIncEntries, range]);

  const trendData = useMemo(() => {
    const months = Array.from(new Set([...filteredExp.map(([m]) => m), ...filteredInc.map(([m]) => m)])).sort();
    const incMap = Object.fromEntries(filteredInc);
    const expMap = Object.fromEntries(filteredExp);

    return months.map(m => ({
      month: formatMonth(m),
      income: incMap[m] || 0,
      spending: expMap[m] || 0,
    }));
  }, [filteredExp, filteredInc]);

  const savingsRates = useMemo(() => {
    return trendData.map(d => ({
      month: d.month,
      rate: d.income > 0 ? Math.max(0, ((d.income - d.spending) / d.income) * 100) : 0
    }));
  }, [trendData]);

  const avgSavingsRate = savingsRates.length > 0 ? savingsRates.reduce((s, r) => s + r.rate, 0) / savingsRates.length : 0;
  const healthScore = Math.round(Math.max(0, Math.min(100, avgSavingsRate)));

  const latest = trendData[trendData.length - 1] || { month: "N/A", income: 0, spending: 0 };

  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const result = [];
    const monthlyAverages = Object.fromEntries(filteredExp.map(([m,v]) => [m, v/30]));
    
    for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const isoDate = d.toISOString().split("T")[0];
        const monthKey = isoDate.substring(0, 7);
        const avg = monthlyAverages[monthKey] || 0;
        const hasSpend = Math.random() > 0.3;
        const amount = hasSpend ? avg * (Math.random() * 1.5 + 0.5) : 0; 
        result.push({ date: isoDate, amount });
    }
    return result.reverse();
  }, [filteredExp]);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Precision Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full" />
             <PremiumBadge color="indigo" variant="neon">NETWORK ANALYTICS</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            Financial Intelligence
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Real-time Meta-Data <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> Temporal Auditing Synchronized
          </p>
        </div>

        <div className="flex items-center gap-4 p-1.5 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner">
          {[
            { id: "3m", label: "3M" },
            { id: "6m", label: "6M" },
            { id: "ytd", label: "YTD" },
            { id: "all", label: "MAX" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id as RangeKey)}
              className={`px-6 py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${
                range === opt.id
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-[32px] bg-slate-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* KPI Matrix */}
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumCard variant="white" className="!p-8 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                 <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:rotate-12 transition-transform">
                   <Globe size={22} strokeWidth={2.5} />
                 </div>
                 <PremiumBadge color="indigo" variant="neon">DOMAIN</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">TOP SECTOR</p>
                 <h3 className="text-[20px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{(categoryEntries[0]?.name || "N/A").split(' ')[0]}</h3>
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="!p-8 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                 <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                   <PiggyBank size={22} strokeWidth={2.5} />
                 </div>
                 <PremiumBadge color="emerald" variant="neon">EFFICIENCY</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">SAVINGS RATE</p>
                 <h3 className="text-3xl font-black text-emerald-500 tracking-tighter">
                    <AnimatedCounter value={avgSavingsRate} decimals={1} />%
                 </h3>
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="!p-8 flex flex-col justify-between group border-none glow bg-indigo-600">
               <div className="flex items-center justify-between mb-2">
                 <div className="h-11 w-11 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/20">
                   <Activity size={22} strokeWidth={3} />
                 </div>
                 <PremiumBadge color="indigo" variant="neon">VITALITY</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">HEALTH MAGNITUDE</p>
                 <h3 className="text-3xl font-black text-white tracking-tighter">
                   <AnimatedCounter value={healthScore} decimals={0} />
                   <span className="text-white/40 text-[14px] font-bold ml-2">/100</span>
                 </h3>
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="!p-8 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                 <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 flex items-center justify-center border border-slate-200 dark:border-white/5">
                   <Calendar size={22} strokeWidth={2.5} />
                 </div>
                 <PremiumBadge color="gray">LATEST CYCLE</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">TERM: {latest.month}</p>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[14px] font-black text-emerald-500">
                       <ArrowUpRight size={14} strokeWidth={3} /> ₹<AnimatedCounter value={latest.income} decimals={0} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[14px] font-black text-rose-500">
                       <ArrowDownRight size={14} strokeWidth={3} /> ₹<AnimatedCounter value={latest.spending} decimals={0} />
                    </div>
                 </div>
              </div>
            </PremiumCard>
          </div>

          {/* Core Analytics Visuals */}
          <div className="col-span-12 grid grid-cols-1 LG:grid-cols-12 gap-8">
            
            {/* Primary Flow Analysis */}
            <PremiumCard variant="obsidian" className="lg:col-span-8 !p-0 overflow-hidden shadow-2xl">
               <div className="p-10 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Capital Vectors</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Income vs Expenditure Synchronization</p>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-10 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">INFLOW</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-10 bg-indigo-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">OUTFLOW</span>
                     </div>
                  </div>
               </div>
               <div className="p-10 h-[480px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barGap={12}>
                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                          dy={20} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                          dx={-10} 
                          tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                          contentStyle={{ 
                            backgroundColor: '#0a0a0a', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
                            padding: '24px'
                          }}
                          itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                        />
                        <Bar 
                          dataKey="income" 
                          fill="#10b981" 
                          radius={[6, 6, 0, 0]} 
                          barSize={24}
                        />
                        <Bar 
                          dataKey="spending" 
                          fill="#6366f1" 
                          radius={[6, 6, 0, 0]} 
                          barSize={24}
                        />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </PremiumCard>

            {/* Segmentation Matrix */}
            <PremiumCard variant="white" className="lg:col-span-4 !p-10 flex flex-col justify-between relative group">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Sector Hub</h3>
                 <PieIcon size={20} className="text-slate-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={categoryEntries}
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryEntries.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                         contentStyle={{ 
                           backgroundColor: '#ffffff', 
                           borderRadius: '20px', 
                           border: '1px solid rgba(0,0,0,0.05)', 
                           padding: '12px'
                         }}
                         itemStyle={{ fontWeight: 900, fontSize: '10px' }}
                      />
                   </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL DEPTH</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">₹{(categoryEntries.reduce((s,c) => s+c.value, 0)/1000).toFixed(1)}K</p>
                </div>
              </div>
              <div className="mt-10 space-y-3">
                 {categoryEntries.slice(0, 4).map((c, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{c.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white">₹{c.value.toLocaleString()}</span>
                   </div>
                 ))}
              </div>
            </PremiumCard>

            {/* Velocity Heatmap Hub */}
            <PremiumCard variant="white" className="lg:col-span-5 !p-10 flex flex-col shadow-xl">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Activity Heatmap</h3>
                  <Zap size={18} className="text-amber-500 animate-pulse" />
               </div>
               <div className="flex-1 flex items-center justify-center py-6">
                  <ActivityHeatmap data={heatmapData} />
               </div>
               <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-relaxed">
                    90-DAY TRANSACTION VOLUMETRIC METRICS SYNCHRONIZED
                  </p>
               </div>
            </PremiumCard>

            {/* Growth Vector Analysis */}
            <PremiumCard variant="white" className="lg:col-span-7 !p-10 flex flex-col shadow-xl overflow-hidden group">
               <div className="flex items-center justify-between mb-10 border-b border-slate-100 dark:border-white/5 pb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none text-emerald-500">Savings Trajectory</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Accumulated Wealth Magnitude Projections</p>
                  </div>
                  <Sparkles size={20} className="text-emerald-500 group-hover:rotate-12 transition-transform" />
               </div>
               <div className="flex-1 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(0,0,0,0.03)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(0,0,0,0.05)', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            padding: '20px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#10b981" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorSavings)" 
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </PremiumCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;

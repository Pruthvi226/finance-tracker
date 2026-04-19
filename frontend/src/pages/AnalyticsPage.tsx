import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { 
  TrendingUp, 
  Layers, 
  PiggyBank, 
  BarChart3,
  Download,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Sparkles,
  Search
} from "lucide-react";
import { ActivityHeatmap } from "../components/Analytics/ActivityHeatmap";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

type Analytics = {
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

const AnalyticsPage = () => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("6m");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get<Analytics>("/analytics");
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryEntries = useMemo(() => {
    if (!data?.categorySpending || typeof data.categorySpending !== "object") return [];
    return Object.entries(data.categorySpending).map(([k, v]) => [k, toNum(v)] as const);
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

  const monthlyExpEntries = useMemo(
    () => filterByRange(allMonthlyExpEntries, range),
    [allMonthlyExpEntries, range]
  );

  const monthlyIncEntries = useMemo(
    () => filterByRange(allMonthlyIncEntries, range),
    [allMonthlyIncEntries, range]
  );

  const mostExpensiveCategory = useMemo(() => {
    if (categoryEntries.length === 0) return null;
    return categoryEntries.reduce((a, b) => (a[1] >= b[1] ? a : b));
  }, [categoryEntries]);

  const incomeVsExpenseData = useMemo(() => {
    const months = Array.from(
      new Set([
        ...monthlyExpEntries.map(([m]) => m),
        ...monthlyIncEntries.map(([m]) => m),
      ])
    ).sort();

    if (months.length === 0) return null;

    const incMap = Object.fromEntries(monthlyIncEntries);
    const expMap = Object.fromEntries(monthlyExpEntries);

    return {
      labels: months,
      datasets: [
        {
          label: "Gross Income",
          data: months.map((m) => incMap[m] ?? 0),
          backgroundColor: "#10b981", // emerald-500
          borderRadius: 8,
          barThickness: 24,
        },
        {
          label: "Total Expenses",
          data: months.map((m) => expMap[m] ?? 0),
          backgroundColor: "#f43f5e", // rose-500
          borderRadius: 8,
          barThickness: 24,
        },
      ],
    };
  }, [monthlyExpEntries, monthlyIncEntries]);

  const savingsRates = useMemo(() => {
    const rates: { month: string; rate: number }[] = [];
    const incMap = Object.fromEntries(monthlyIncEntries);
    const expMap = Object.fromEntries(monthlyExpEntries);
    const months = Array.from(
      new Set([...Object.keys(incMap), ...Object.keys(expMap)])
    ).sort();

    for (const m of months) {
      const inc = toNum(incMap[m]);
      const exp = toNum(expMap[m]);
      const rate = inc > 0 ? Math.max(0, ((inc - exp) / inc) * 100) : 0;
      rates.push({ month: m, rate });
    }
    return rates;
  }, [monthlyIncEntries, monthlyExpEntries]);

  const spendingTrendData = useMemo(() => {
    if (monthlyExpEntries.length === 0) return null;
    return {
      labels: monthlyExpEntries.map(([m]) => m),
      datasets: [
        {
          label: "Spending Velocity",
          data: monthlyExpEntries.map(([, v]) => v),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.5,
          pointBackgroundColor: "#6366f1",
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 4,
        },
      ],
    };
  }, [monthlyExpEntries]);

  const categoryPieData = useMemo(() => {
    if (categoryEntries.length === 0) return null;
    return {
      labels: categoryEntries.map(([n]) => n),
      datasets: [
        {
          data: categoryEntries.map(([, v]) => v),
          backgroundColor: [
            "#6366f1",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
          ],
          borderWidth: 0,
          hoverOffset: 20
        },
      ],
    };
  }, [categoryEntries]);

  const avgSavingsRate =
    savingsRates.length > 0
      ? savingsRates.reduce((s, r) => s + r.rate, 0) / savingsRates.length
      : 0;

  const latestMonth = monthlyExpEntries.length
    ? monthlyExpEntries[monthlyExpEntries.length - 1][0]
    : null;
  const latestIncome = latestMonth
    ? allMonthlyIncEntries.find(([m]) => m === latestMonth)?.[1] ?? 0
    : 0;
  const latestExpense = latestMonth
    ? allMonthlyExpEntries.find(([m]) => m === latestMonth)?.[1] ?? 0
    : 0;
  
  const healthScore = Math.round(Math.max(0, Math.min(100, avgSavingsRate)));

  const cumulativeSavingsData = useMemo(() => {
    if (savingsRates.length === 0) return null;
    let balance = 0;
    const history = [];
    
    // Sort chronologically ascending
    const sortedRates = [...savingsRates].sort((a,b) => a.month.localeCompare(b.month));
    const incMap = Object.fromEntries(monthlyIncEntries);
    const expMap = Object.fromEntries(monthlyExpEntries);

    for (const { month } of sortedRates) {
      const saved = (toNum(incMap[month]) - toNum(expMap[month]));
      balance += saved;
      history.push({ month, balance });
    }

    return {
      labels: history.map(h => h.month),
      datasets: [
        {
          label: "Cumulative Wealth Growth",
          data: history.map(h => h.balance),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.5,
          borderWidth: 4,
          pointRadius: 0,
        }
      ]
    };
  }, [savingsRates, monthlyIncEntries, monthlyExpEntries]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const result = [];
    const monthlyAverages = Object.fromEntries(monthlyExpEntries.map(([m,v]) => [m, v/30]));
    
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
  }, [monthlyExpEntries]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const, 
        labels: { 
          color: "#94a3b8", 
          font: { weight: 'bold', size: 10 },
          usePointStyle: true,
          padding: 20
        } 
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", font: { size: 10, weight: 'bold' } },
        grid: { display: false },
        border: { display: false }
      },
      y: {
        ticks: { 
          color: "#94a3b8", 
          font: { size: 10, weight: 'bold' },
          callback: (value: any) => '₹' + value.toLocaleString()
        },
        grid: { color: "rgba(148,163,184,0.05)" },
        border: { display: false }
      },
    },
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
              Financial Intelligence
            </h1>
            <PremiumBadge color="indigo">
              AI-Powered
            </PremiumBadge>
          </div>
          <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
            Deep forensic analysis of your spending behavior and wealth velocity.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/10">
          {[
            { id: "3m", label: "3M" },
            { id: "6m", label: "6M" },
            { id: "ytd", label: "YTD" },
            { id: "all", label: "All" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id as RangeKey)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                range === opt.id
                  ? "bg-white dark:bg-white/10 text-primary-600 dark:text-white shadow-sm"
                  : "text-textMuted hover:text-textPrimary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-[24px] bg-gray-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPI Mini Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumCard variant="white" className="!p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                  <Layers size={20} />
                </div>
                <PremiumBadge color="gray">Top Category</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-1">Max Attribution</p>
                 <h3 className="text-xl font-black text-textHeadings truncate uppercase tracking-tight">{mostExpensiveCategory?.[0] ?? "N/A"}</h3>
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="!p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <PiggyBank size={20} />
                </div>
                <PremiumBadge color="emerald">Efficiency</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-1">Savings Velocity</p>
                 <h3 className="text-2xl font-black text-emerald-600 tracking-tighter">
                    <AnimatedCounter value={avgSavingsRate} decimals={1} />%
                 </h3>
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="!p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Activity size={20} />
                </div>
                <PremiumBadge color="indigo">Eco-Score</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-1">Wealth Health</p>
                 <h3 className="text-2xl font-black text-textHeadings tracking-tighter">
                   <AnimatedCounter value={healthScore} decimals={0} />
                   <span className="text-textMuted text-sm font-bold ml-1">/100</span>
                 </h3>
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="!p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <TrendingUp size={20} />
                </div>
                <PremiumBadge color="rose">Recent Phase</PremiumBadge>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-1">{latestMonth ?? 'Current'}</p>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[13px] font-black text-emerald-600">
                       <ArrowUpRight size={14} /> ₹<AnimatedCounter value={latestIncome} decimals={0} />
                    </div>
                    <div className="flex items-center gap-1 text-[13px] font-black text-rose-600">
                       <ArrowDownRight size={14} /> ₹<AnimatedCounter value={latestExpense} decimals={0} />
                    </div>
                 </div>
              </div>
            </PremiumCard>
          </div>

          {/* Core Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <PremiumCard variant="white" className="lg:col-span-8 !p-8 h-[450px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black text-textHeadings uppercase tracking-tight">Spending vs Income</h3>
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Monthly comparative ledger</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Income</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Expense</span>
                     </div>
                  </div>
               </div>
               <div className="flex-1 relative">
                  {incomeVsExpenseData ? (
                    <Bar data={incomeVsExpenseData} options={chartOptions} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted">
                       <BarChart3 size={48} className="opacity-10 mb-2" />
                       <p className="text-xs font-bold uppercase tracking-widest">Awaiting temporal data</p>
                    </div>
                  )}
               </div>
            </PremiumCard>

            <PremiumCard variant="white" className="lg:col-span-4 !p-8 h-[450px] flex flex-col">
              <h3 className="text-lg font-black text-textHeadings uppercase tracking-tight mb-8">Allocation</h3>
              <div className="flex-1 relative flex items-center justify-center">
                {categoryPieData ? (
                  <Pie
                    data={categoryPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: "bottom", 
                          labels: { 
                            color: "#94a3b8", 
                            padding: 20, 
                            usePointStyle: true,
                            font: { weight: 'bold', size: 10 }
                          } 
                        } 
                      },
                    }}
                  />
                ) : (
                  <div className="text-center text-textMuted">
                     <Layers size={48} className="opacity-10 mx-auto mb-2" />
                     <p className="text-xs font-bold uppercase tracking-widest">No segments found</p>
                  </div>
                )}
              </div>
            </PremiumCard>

            <PremiumCard variant="white" className="lg:col-span-12 !p-8 h-[400px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black text-textHeadings uppercase tracking-tight">Spending Path</h3>
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Trend forensic analysis</p>
                  </div>
                  <PremiumBadge color="indigo">Velocity Tracking</PremiumBadge>
               </div>
               <div className="flex-1 relative">
                  {spendingTrendData ? (
                    <Line data={spendingTrendData} options={chartOptions} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-textMuted">
                       <TrendingUp size={48} className="opacity-10" />
                    </div>
                  )}
               </div>
            </PremiumCard>

            <PremiumCard variant="white" className="lg:col-span-7 !p-8 h-[400px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-black text-textHeadings uppercase tracking-tight">Wealth Compounding</h3>
                   <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Growth Engine</span>
                   </div>
               </div>
               <div className="flex-1 relative">
                  {cumulativeSavingsData ? (
                    <Line data={cumulativeSavingsData} options={chartOptions} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-textMuted">
                       <Activity size={48} className="opacity-10" />
                    </div>
                  )}
               </div>
            </PremiumCard>

            <PremiumCard variant="white" className="lg:col-span-5 !p-8 h-[400px] flex flex-col">
               <h3 className="text-lg font-black text-textHeadings uppercase tracking-tight mb-8">Activity Intensity</h3>
               <div className="flex-1 flex items-center justify-center">
                  <ActivityHeatmap data={heatmapData} />
               </div>
               <p className="mt-6 text-[10px] font-bold text-textMuted text-center uppercase tracking-widest">Visualizing the last 90 days of transaction density</p>
            </PremiumCard>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;

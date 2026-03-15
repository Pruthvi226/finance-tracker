import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import SavingsIcon from "@mui/icons-material/Savings";
import AnalyticsIcon from "@mui/icons-material/AnalyticsOutlined";

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
          label: "Income",
          data: months.map((m) => incMap[m] ?? 0),
          backgroundColor: "rgba(16,185,129,0.8)", // emerald-500
          borderRadius: 4,
        },
        {
          label: "Expenses",
          data: months.map((m) => expMap[m] ?? 0),
          backgroundColor: "rgba(244,63,94,0.8)", // rose-500
          borderRadius: 4,
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
          label: "Monthly spending",
          data: monthlyExpEntries.map(([, v]) => v),
          borderColor: "rgba(59,130,246,1)",
          backgroundColor: "rgba(59,130,246,0.15)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgba(59,130,246,1)",
          pointBorderWidth: 2,
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
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#f43f5e",
            "#8b5cf6",
            "#06b6d4",
          ],
          borderWidth: 0,
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
  const latestSavingsRate = latestIncome > 0 ? Math.max(0, ((latestIncome - latestExpense) / latestIncome) * 100) : 0;

  const healthScore = useMemo(() => {
    const base = Math.max(0, Math.min(100, avgSavingsRate));
    return Math.round(base);
  }, [avgSavingsRate]);

  const isEmpty = !loading && categoryEntries.length === 0 && monthlyExpEntries.length === 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { color: "#cbd5e1" } },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 45 },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Analytics Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Deep dive into your spending and income trends.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
          {[
            { id: "3m", label: "3M" },
            { id: "6m", label: "6M" },
            { id: "ytd", label: "YTD" },
            { id: "all", label: "All" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id as RangeKey)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === opt.id
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card h-[350px]" />
            <div className="glass-card h-[350px]" />
          </div>
        </div>
      ) : isEmpty ? (
        <div className="glass-card p-16 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
            <AnalyticsIcon fontSize="large" />
          </div>
          <h3 className="text-xl font-bold text-slate-200">No Analytics Data Yet</h3>
          <p className="text-slate-400 mt-2 max-w-sm">
            Keep logging your income and expenses. Analytics needs a bit of history to generate insights.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400">
                  <CategoryIcon fontSize="small" />
                </div>
                <span className="text-sm font-semibold text-slate-400">Top Expense</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{mostExpensiveCategory?.[0] ?? "—"}</div>
              <div className="text-sm text-slate-500 mt-1">₹{mostExpensiveCategory?.[1]?.toLocaleString() ?? "0"} total</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <SavingsIcon fontSize="small" />
                </div>
                <span className="text-sm font-semibold text-slate-400">Avg Savings Rate</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{avgSavingsRate.toFixed(1)}%</div>
              <div className="text-sm text-slate-500 mt-1">Overall average</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <AnalyticsIcon fontSize="small" />
                </div>
                <span className="text-sm font-semibold text-slate-400">Health Score</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{healthScore}<span className="text-slate-500 text-lg">/100</span></div>
              <div className="text-sm text-slate-500 mt-1">Based on savings habits</div>
              <div className="absolute -right-4 -bottom-4 opacity-10 blur-xl pointer-events-none text-indigo-500 z-0">
                <AnalyticsIcon sx={{ fontSize: 100 }} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <TrendingUpIcon fontSize="small" />
                </div>
                <span className="text-sm font-semibold text-slate-400">Latest Month ({latestMonth || "—"})</span>
              </div>
              <div className="text-sm text-slate-300">
                Inc: <span className="font-semibold text-emerald-400">₹{latestIncome.toLocaleString()}</span>
              </div>
              <div className="text-sm text-slate-300">
                Exp: <span className="font-semibold text-rose-400">₹{latestExpense.toLocaleString()}</span>
              </div>
              <div className={`text-xs mt-1.5 font-bold ${latestSavingsRate >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                Saving Rate: {latestSavingsRate.toFixed(1)}%
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Income vs Expenses</h3>
              <div className="flex-1 relative">
                {incomeVsExpenseData ? (
                  <Bar data={incomeVsExpenseData} options={chartOptions} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No monthly data</div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 min-h-[400px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Category Breakdown</h3>
              <div className="flex-1 relative flex items-center justify-center pb-4">
                {categoryPieData ? (
                  <Pie
                    data={categoryPieData}
                    options={{
                      plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", padding: 20 } } },
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No category data</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 glass-card p-6 min-h-[350px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <TrendingUpIcon fontSize="small" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Spending Trend Over Time</h3>
              </div>
              <div className="flex-1 relative">
                {spendingTrendData ? (
                  <Line data={spendingTrendData} options={chartOptions} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No spending data</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SavingsIcon from "@mui/icons-material/Savings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AddIcon from "@mui/icons-material/Add";
import FlagIcon from "@mui/icons-material/Flag";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

type Dashboard = {
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
};

type Analytics = {
  categorySpending: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  monthlyIncome: Record<string, number>;
};

type ExpenseApi = { id: number; amount: number; category: string; date: string; description?: string };
type IncomeApi = { id: number; amount: number; source: string; date: string; description?: string };

type RecentTx = {
  id: string;
  type: "INCOME" | "EXPENSE";
  title: string;
  categoryOrSource: string;
  date: string;
  amount: number;
};

type Goal = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon?: string;
};

type BudgetStatus = { remaining: number; exceeded: boolean };

const CURRENCY_SYMBOL = "₹";

const formatAmount = (value: number) =>
  `${CURRENCY_SYMBOL}${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const pctChange = (current: number, prev: number) => {
  if (!prev) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
};

const clampPct = (v: number) => Math.max(-999, Math.min(999, v));

const formatMonth = (ym: string) => {
  // ym: yyyy-MM
  const [y, m] = ym.split("-").map((x) => Number(x));
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(undefined, { month: "short" });
};

const DashboardPage = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<Dashboard | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recent, setRecent] = useState<RecentTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dashRes, analyticsRes, budgetRes, goalsRes, expensesRes, incomeRes] = await Promise.all([
          api.get<Dashboard>("/dashboard"),
          api.get<Analytics>("/analytics"),
          api.get<BudgetStatus>("/budget/status").catch(() => ({ data: { remaining: 0, exceeded: false } })),
          api.get<Goal[]>("/goals").catch(() => ({ data: [] as Goal[] })),
          api.get<ExpenseApi[]>("/expenses").catch(() => ({ data: [] as ExpenseApi[] })),
          api.get<IncomeApi[]>("/income").catch(() => ({ data: [] as IncomeApi[] })),
        ]);

        setSummary(dashRes.data);
        setAnalytics(analyticsRes.data);
        setBudgetStatus(budgetRes.data);
        setGoals(goalsRes.data || []);

        const merged: RecentTx[] = [
          ...(expensesRes.data || []).map((e) => ({
            id: `e_${e.id}`,
            type: "EXPENSE" as const,
            title: e.description?.trim() ? e.description : "Expense",
            categoryOrSource: e.category,
            date: e.date,
            amount: Number(e.amount),
          })),
          ...(incomeRes.data || []).map((i) => ({
            id: `i_${i.id}`,
            type: "INCOME" as const,
            title: i.description?.trim() ? i.description : "Income",
            categoryOrSource: i.source,
            date: i.date,
            amount: Number(i.amount),
          })),
        ].sort((a, b) => (a.date < b.date ? 1 : -1));

        setRecent(merged.slice(0, 5));
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const monthKeys = useMemo(() => {
    if (!analytics) return [] as string[];
    const keys = Array.from(
      new Set([...Object.keys(analytics.monthlyIncome || {}), ...Object.keys(analytics.monthlyExpenses || {})]),
    ).sort();
    return keys;
  }, [analytics]);

  const currentMonthKey = monthKeys[monthKeys.length - 1] || "";
  const prevMonthKey = monthKeys[monthKeys.length - 2] || "";

  const currentIncome = analytics?.monthlyIncome?.[currentMonthKey] ?? 0;
  const prevIncome = analytics?.monthlyIncome?.[prevMonthKey] ?? 0;
  const currentExpense = analytics?.monthlyExpenses?.[currentMonthKey] ?? 0;
  const prevExpense = analytics?.monthlyExpenses?.[prevMonthKey] ?? 0;

  const currentSavingsRate = useMemo(() => {
    if (!summary?.totalIncome) return 0;
    return Math.max(0, Math.min(100, (Number(summary.remainingBalance) / Number(summary.totalIncome)) * 100));
  }, [summary]);

  const prevSavingsRate = useMemo(() => {
    const inc = Number(prevIncome || 0);
    const exp = Number(prevExpense || 0);
    if (!inc) return 0;
    return Math.max(0, Math.min(100, ((inc - exp) / inc) * 100));
  }, [prevIncome, prevExpense]);

  const spendingTrendData = useMemo(() => {
    if (!analytics) return null;
    const months = Object.keys(analytics.monthlyExpenses || {}).sort();
    const labels = months.slice(-6);
    const values = labels.map((m) => Number(analytics.monthlyExpenses[m] || 0));

    return {
      labels: labels.map(formatMonth),
      datasets: [
        {
          label: "Spending",
          data: values,
          borderColor: "rgba(59,130,246,0.95)",
          backgroundColor: "rgba(59,130,246,0.18)",
          tension: 0.35,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [analytics]);

  const categoryPieData = useMemo(() => {
    if (!analytics) return null;
    const entries = Object.entries(analytics.categorySpending || {})
      .map(([k, v]) => [k, Number(v)] as const)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          data: entries.map(([, value]) => value),
          backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#f97316", "#ec4899", "#8b5cf6"],
          borderColor: "rgba(15,23,42,0.6)",
          borderWidth: 1,
        },
      ],
    };
  }, [analytics]);

  const cards = useMemo(() => {
    const totalBalance = Number(summary?.remainingBalance ?? 0);
    const totalIncome = Number(summary?.totalIncome ?? 0);
    const totalExpense = Number(summary?.totalExpense ?? 0);
    const remainingBudget = Number(budgetStatus?.remaining ?? 0);

    const incomeDelta = pctChange(Number(currentIncome), Number(prevIncome));
    const expenseDelta = pctChange(Number(currentExpense), Number(prevExpense));
    const savingsDelta = pctChange(currentSavingsRate, prevSavingsRate);

    return [
      {
        key: "balance",
        label: "Total Balance",
        icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
        value: formatAmount(totalBalance),
        delta: null as number | null,
        tone: "neutral" as const,
        accent: "from-sky-500/20 to-transparent",
      },
      {
        key: "income",
        label: "Total Income",
        icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
        value: formatAmount(totalIncome),
        delta: incomeDelta,
        tone: "positive" as const,
        accent: "from-emerald-500/20 to-transparent",
      },
      {
        key: "expense",
        label: "Total Expenses",
        icon: <TrendingDownIcon sx={{ fontSize: 18 }} />,
        value: formatAmount(totalExpense),
        delta: expenseDelta,
        tone: "negative" as const,
        accent: "from-rose-500/20 to-transparent",
      },
      {
        key: "savings",
        label: "Savings Rate",
        icon: <SavingsIcon sx={{ fontSize: 18 }} />,
        value: `${currentSavingsRate.toFixed(1)}%`,
        delta: savingsDelta,
        tone: currentSavingsRate >= 20 ? ("positive" as const) : ("neutral" as const),
        accent: "from-indigo-500/20 to-transparent",
      },
      {
        key: "budget",
        label: "Remaining Budget",
        icon: <MonetizationOnIcon sx={{ fontSize: 18 }} />,
        value: formatAmount(remainingBudget),
        delta: null as number | null,
        tone: budgetStatus?.exceeded ? ("negative" as const) : ("neutral" as const),
        accent: budgetStatus?.exceeded ? "from-rose-500/20 to-transparent" : "from-amber-500/20 to-transparent",
      },
    ];
  }, [summary, analytics, budgetStatus, currentIncome, prevIncome, currentExpense, prevExpense, currentSavingsRate, prevSavingsRate]);

  const insights = useMemo(() => {
    const list: string[] = [];
    const expDelta = pctChange(Number(currentExpense), Number(prevExpense));
    if (expDelta !== null) {
      const dir = expDelta > 0 ? "more" : "less";
      list.push(`You spent ${Math.abs(clampPct(expDelta)).toFixed(0)}% ${dir} than last month.`);
    }
    const savDelta = pctChange(currentSavingsRate, prevSavingsRate);
    if (savDelta !== null) {
      const dir = savDelta > 0 ? "improved" : "declined";
      list.push(`Your savings rate ${dir} compared to last month.`);
    }
    if (!list.length) {
      list.push("Add a few transactions to unlock insights.");
    }
    return list.slice(0, 2);
  }, [currentExpense, prevExpense, currentSavingsRate, prevSavingsRate]);

  const hasAnyData = Boolean(
    (summary && (Number(summary.totalIncome) > 0 || Number(summary.totalExpense) > 0)) ||
      (analytics && (Object.keys(analytics.monthlyExpenses || {}).length > 0 || Object.keys(analytics.categorySpending || {}).length > 0)) ||
      recent.length > 0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
            {budgetStatus?.exceeded && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20">
                Budget exceeded
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Single-screen overview of your finances.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate("/expenses")}
          >
            Add expense
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate("/income")}
          >
            Add income
          </Button>
        </div>
      </div>

      {!loading && !hasAnyData ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-sm shadow-black/30">
          <h2 className="text-base font-semibold text-slate-100">No financial data yet</h2>
          <p className="text-sm text-slate-400 mt-1">
            Add your first transaction to see summaries, charts, and insights.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/expenses")}>
              Add expense
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/income")}>
              Add income
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/budget")}>
              Create budget
            </Button>
            <Button variant="outlined" startIcon={<FlagIcon />} onClick={() => navigate("/goals")}>
              Add goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* KPI cards */}
          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-3">
              {cards.map((c, idx) => {
                const delta = c.delta;
                const showDelta = typeof delta === "number" && Number.isFinite(delta);
                const deltaDir = showDelta ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : "flat";
                const deltaText = showDelta ? `${Math.abs(clampPct(delta)).toFixed(0)}% vs last month` : "—";
                const deltaTone =
                  deltaDir === "up"
                    ? c.key === "expense"
                      ? "text-rose-300"
                      : "text-emerald-300"
                    : deltaDir === "down"
                      ? c.key === "expense"
                        ? "text-emerald-300"
                        : "text-rose-300"
                      : "text-slate-400";

                return (
                  <motion.div
                    key={c.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="col-span-12 sm:col-span-6 lg:col-span-3 xl:col-span-2 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 overflow-hidden"
                  >
                    <div className={`p-3 bg-gradient-to-br ${c.accent}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-slate-800/70 border border-white/10 flex items-center justify-center text-slate-100">
                            {c.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">
                              {c.label}
                            </div>
                            {loading ? (
                              <Skeleton variant="text" sx={{ fontSize: "1.3rem", width: 140 }} />
                            ) : (
                              <div className="text-lg font-semibold text-slate-50 truncate">
                                {c.value}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[11px] ${deltaTone}`}>
                            {showDelta ? (deltaDir === "up" ? "▲" : deltaDir === "down" ? "▼" : "•") : "•"}{" "}
                            {deltaText}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Charts row */}
          <section className="col-span-12 lg:col-span-8 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 overflow-hidden">
            <div className="p-4 pb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-100">Monthly spending trend</div>
                <div className="text-xs text-slate-400">Last 6 months</div>
              </div>
            </div>
            <div className="px-3 pb-3 h-[240px]">
              {spendingTrendData ? (
                <Line
                  data={spendingTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
                      y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(55,65,81,0.35)" } },
                    },
                  }}
                />
              ) : (
                <Skeleton variant="rounded" height={240} />
              )}
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 overflow-hidden">
            <div className="p-4 pb-2">
              <div className="text-sm font-semibold text-slate-100">Category breakdown</div>
              <div className="text-xs text-slate-400">Top categories</div>
            </div>
            <div className="px-3 pb-3 h-[240px]">
              {categoryPieData ? (
                <Pie
                  data={categoryPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { color: "#cbd5f5", boxWidth: 10, padding: 10 },
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton variant="rounded" height={240} />
              )}
            </div>
          </aside>

          {/* Bottom row */}
          <section className="col-span-12 lg:col-span-8 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-100">Recent transactions</div>
                <div className="text-xs text-slate-400">Latest 5</div>
              </div>
              <button
                onClick={() => navigate("/expenses")}
                className="text-xs text-sky-300 hover:text-sky-200"
              >
                View all
              </button>
            </div>
            <div className="px-4 pb-4">
              {loading ? (
                <Skeleton variant="rounded" height={180} />
              ) : recent.length === 0 ? (
                <div className="text-sm text-slate-400">
                  No transactions yet. Add your first expense or income.
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {recent.map((t) => (
                    <li key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center border border-white/10 ${
                            t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          <ReceiptIcon sx={{ fontSize: 18 }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-100 truncate">{t.title}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {t.categoryOrSource} • {new Date(t.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold whitespace-nowrap ${
                          t.type === "INCOME" ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "-"}{formatAmount(t.amount)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-3">
            {/* Quick actions */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 p-3">
              <div className="text-sm font-semibold text-slate-100 mb-2">Quick actions</div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/expenses")}>
                  Expense
                </Button>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/income")}>
                  Income
                </Button>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/budget")}>
                  Budget
                </Button>
                <Button size="small" variant="outlined" startIcon={<FlagIcon />} onClick={() => navigate("/goals")}>
                  Goal
                </Button>
              </div>
            </div>

            {/* Goals preview */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-slate-100">Goals</div>
                <button onClick={() => navigate("/goals")} className="text-xs text-sky-300 hover:text-sky-200">
                  View
                </button>
              </div>
              {loading ? (
                <Skeleton variant="rounded" height={120} />
              ) : goals.length === 0 ? (
                <div className="text-xs text-slate-400">
                  No goals yet. Add a goal to track your savings progress.
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 3).map((g) => {
                    const target = Number(g.targetAmount || 0);
                    const current = Number(g.currentAmount || 0);
                    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                    return (
                      <div key={g.id}>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{g.icon || "🎯"}</span>
                            <span className="text-slate-200 truncate">{g.name}</span>
                          </div>
                          <span className="text-slate-400">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {formatAmount(current)} / {formatAmount(target)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Smart insights */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-black/30 p-3">
              <div className="text-sm font-semibold text-slate-100 mb-2">Smart insights</div>
              <ul className="space-y-2">
                {insights.map((ins, idx) => (
                  <li key={idx} className="text-xs text-slate-300 leading-snug">
                    • {ins}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;


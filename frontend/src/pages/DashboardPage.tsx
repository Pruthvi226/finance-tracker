import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SavingsIcon from "@mui/icons-material/Savings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FinancialHealthCard from "../components/Dashboard/FinancialHealthCard";
import { StatCard } from "../components/Dashboard/StatCard";
import { ChartCard } from "../components/Dashboard/ChartCard";

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

type TransactionApi = {
  id: number;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string;
  category: { name: string } | null;
  receiptUrl: string | null;
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
  const [recent, setRecent] = useState<TransactionApi[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (e) {
        console.error("Failed to load accounts");
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const accountParam = selectedAccountId !== "ALL" ? `?accountId=${selectedAccountId}` : "";
        const [dashRes, analyticsRes, budgetRes, goalsRes, txRes] = await Promise.all([
          api.get<Dashboard>(`/dashboard${accountParam}`),
          api.get<Analytics>(`/analytics${accountParam}`),
          api.get<BudgetStatus>("/budget/status").catch(() => ({ data: { remaining: 0, exceeded: false } })),
          api.get<Goal[]>("/goals").catch(() => ({ data: [] as Goal[] })),
          api.get<{ content: TransactionApi[] }>(`/transactions${accountParam ? `${accountParam}&` : "?"}pageNo=0&pageSize=5`).catch(() => ({ data: { content: [] } })),
        ]);

        setSummary(dashRes.data);
        setAnalytics(analyticsRes.data);
        setBudgetStatus(budgetRes.data);
        setGoals(goalsRes.data || []);
        setRecent(txRes.data.content || []);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedAccountId]);

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
          borderColor: "rgba(37, 99, 235, 1)", // primary-600
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0.15)');
            return gradient;
          },
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderColor: "rgba(37, 99, 235, 1)",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "rgba(37, 99, 235, 1)",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
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
          backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 12,
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
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-textHeadings dark:text-slate-50 uppercase">Dashboard</h1>
            {budgetStatus?.exceeded && (
              <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black shadow-lg shadow-rose-600/20">
                Budget Exceeded
              </span>
            )}
          </div>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">
            Your financial overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Account Selector */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 z-10 transition-transform group-hover:scale-110">
              <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
            </div>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="bg-white dark:bg-slate-900/60 border border-border dark:border-white/10 rounded-2xl pl-12 pr-10 py-3.5 text-xs font-black text-textHeadings dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/10 appearance-none min-w-[220px] cursor-pointer shadow-sm transition-all uppercase tracking-widest"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.accountName.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate("/transactions")}
          >
            Add New
          </button>
        </div>
      </div>

      {!loading && !hasAnyData ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <h2 className="text-xl font-bold text-textPrimary dark:text-slate-100">Welcome to Finance Tracker!</h2>
          <p className="text-textSecondary dark:text-slate-400 mt-2 max-w-md font-medium">
            Add your first transaction to unlock your dashboard, charts, and AI-driven insights.
          </p>
          <div className="mt-8 flex gap-4">
            <button className="btn-primary" onClick={() => navigate("/transactions")}>
              Add Transaction
            </button>
            <button className="btn-secondary" onClick={() => navigate("/budget")}>
              Setup Budget
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* KPI cards */}
          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-4">
              {cards.map((c, idx) => (
                <StatCard 
                  key={c.key}
                  title={c.label}
                  value={c.value}
                  icon={c.icon}
                  accent={c.key === 'expense' ? 'rose' : c.key === 'income' ? 'emerald' : c.key === 'savings' ? 'indigo' : c.key === 'budget' && c.tone === 'negative' ? 'rose' : c.key === 'budget' ? 'amber' : 'sky'}
                  delta={c.delta}
                  loading={loading}
                  delayIndex={idx}
                />
              ))}
            </div>
          </div>

          {/* Charts row */}
          <ChartCard 
            title="Monthly Spending Trend" 
            subtitle="Last 6 months trailing analysis"
            delayIndex={4}
          >
            <div className="w-full h-[300px]">
              {spendingTrendData ? (
                <Line
                  data={spendingTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true, mode: 'index', intersect: false },
                    },
                    scales: {
                      x: { ticks: { color: "#64748b", font: { weight: 'bold' } }, grid: { display: false } },
                      y: { ticks: { color: "#64748b", font: { weight: 'bold' } }, grid: { color: "rgba(0,0,0,0.05)" } },
                    },
                    interaction: { mode: 'nearest', axis: 'x', intersect: false }
                  }}
                />
              ) : (
                <Skeleton variant="rounded" height="100%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              )}
            </div>
          </ChartCard>

          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <ChartCard 
              title="Distribution" 
              subtitle="Top categories"
              delayIndex={5}
            >
              <div className="w-full h-[300px] flex items-center justify-center">
                {categoryPieData ? (
                  <Pie
                    data={categoryPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: "#475569", boxWidth: 10, padding: 20, font: { family: 'inherit', weight: 'bold', size: 11 } },
                        },
                      },
                      cutout: '65%'
                    }}
                  />
                ) : (
                  <Skeleton variant="circular" width={240} height={240} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                )}
              </div>
            </ChartCard>
          </aside>

          {/* Bottom row */}
          <section className="col-span-12 lg:col-span-8 glass-card overflow-hidden">
            <div className="p-8 border-b border-border dark:border-white/5 bg-gray-50/50 dark:bg-transparent flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-textHeadings dark:text-slate-50 tracking-tight uppercase">Recent Activity</h3>
                <p className="text-[10px] font-black tracking-widest text-textMuted dark:text-slate-500 uppercase mt-1">Transaction History</p>
              </div>
              <button
                onClick={() => navigate("/transactions")}
                className="btn-secondary !px-4 !py-2 !text-xs"
              >
                View All
              </button>
            </div>
            <div className="px-5 py-2">
              {loading ? (
                <Skeleton variant="rounded" height={180} />
              ) : recent.length === 0 ? (
                <div className="text-sm text-slate-400 py-4">
                  No transactions yet. Add your first transaction.
                </div>
              ) : (
                <ul className="divide-y divide-border dark:divide-white/5">
                  {recent.map((t) => (
                    <li key={t.id} className="py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors -mx-5 px-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`h-11 w-11 rounded-full flex items-center justify-center border ${
                            t.type === "INCOME" 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                              : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          }`}
                        >
                          <ReceiptIcon fontSize="small" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-black text-textHeadings dark:text-slate-100 truncate uppercase tracking-tight">{t.description || t.category?.name || "Transaction"}</div>
                          <div className="text-[10px] font-black text-textSecondary dark:text-slate-400 truncate mt-0.5 uppercase tracking-widest">
                            {t.category?.name || "Uncategorized"} • {new Date(t.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-black whitespace-nowrap ${
                          t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-textPrimary dark:text-slate-100"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "-"}{t.currency} {t.amount.toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Financial Health AI */}
            <div className="flex-none">
              <FinancialHealthCard />
            </div>

            {/* Quick actions */}
            <div className="glass-card p-6">
              <div className="text-sm font-black text-textHeadings dark:text-slate-100 mb-6 uppercase tracking-widest">Quick Actions</div>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-secondary" onClick={() => navigate("/transactions")}>
                  Transaction
                </button>
                <button className="btn-secondary" onClick={() => navigate("/budget")}>
                  Budget
                </button>
                <button className="btn-secondary" onClick={() => navigate("/goals")}>
                  Goal
                </button>
                <button className="btn-secondary" onClick={() => navigate("/insights")}>
                  AI Insights
                </button>
              </div>
            </div>

            {/* Goals preview */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-black text-textHeadings dark:text-slate-100 uppercase tracking-widest">Savings Goals</div>
                <button onClick={() => navigate("/budget")} className="text-sm font-bold text-primary-600 hover:text-primary-700">
                  View
                </button>
              </div>
              {loading ? (
                <Skeleton variant="rounded" height={120} />
              ) : goals.length === 0 ? (
                <div className="text-sm text-slate-400 py-2">
                  No active goals. Set one up to motivate your savings.
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 3).map((g) => {
                    const target = Number(g.targetAmount || 0);
                    const current = Number(g.currentAmount || 0);
                    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                    return (
                      <div key={g.id}>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg">{g.icon || "🎯"}</span>
                            <span className="text-textHeadings dark:text-slate-200 font-black truncate uppercase tracking-tight">{g.name}</span>
                          </div>
                          <span className="text-primary-600 dark:text-primary-400 font-black">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-2.5 w-full rounded-full bg-gray-100 dark:bg-slate-950 border border-border dark:border-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-600 relative"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-2 text-[10px] text-textMuted dark:text-slate-400 font-black uppercase tracking-widest">
                          {formatAmount(current)} / {formatAmount(target)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Smart insights */}
            <div className="glass-card p-6 border-l-4 border-l-primary-600 bg-primary-50/30 dark:bg-primary-500/5">
              <div className="text-sm font-black text-textHeadings dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="text-primary-600 dark:text-primary-400">✨</span> Quick Tip
              </div>
              <ul className="space-y-3">
                {insights.map((ins, idx) => (
                  <li key={idx} className="text-xs text-textSecondary dark:text-slate-300 font-black leading-relaxed uppercase tracking-tight">
                    {ins}
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


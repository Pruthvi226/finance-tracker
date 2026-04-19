import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  ChevronDown,
  Sparkles,
  TrendingUp,
  Receipt,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "../components/Dashboard/StatCard";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";


const CURRENCY_SYMBOL = "₹";

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

const formatAmount = (value: number) =>
  `${CURRENCY_SYMBOL}${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const pctChange = (current: number, prev: number) => {
  if (!prev) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
};

const formatMonth = (ym: string) => {
  const [y, m] = ym.split("-").map((x) => Number(x));
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(undefined, { month: "short" });
};

const DashboardPage = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<Dashboard | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
    if (!analytics) return [];
    const months = Object.keys(analytics.monthlyExpenses || {}).sort();
    const labels = months.slice(-6);
    return labels.map((m) => ({
      month: formatMonth(m),
      spending: Number(analytics.monthlyExpenses[m] || 0),
      income: Number(analytics.monthlyIncome?.[m] || 0)
    }));
  }, [analytics]);

  const cards = useMemo(() => {
    const totalBalance = Number(summary?.remainingBalance ?? 0);
    const totalIncome = Number(summary?.totalIncome ?? 0);
    const totalExpense = Number(summary?.totalExpense ?? 0);

    const incomeDelta = pctChange(Number(currentIncome), Number(prevIncome));
    const expenseDelta = pctChange(Number(currentExpense), Number(prevExpense));
    const savingsDelta = pctChange(currentSavingsRate, prevSavingsRate);

    const incomeTrend = monthKeys.slice(-6).map(m => ({ value: Number(analytics?.monthlyIncome?.[m] || 0) }));
    const expenseTrend = monthKeys.slice(-6).map(m => ({ value: Number(analytics?.monthlyExpenses?.[m] || 0) }));
    const balanceTrend = monthKeys.slice(-6).map(m => ({ value: Number(analytics?.monthlyIncome?.[m] || 0) - Number(analytics?.monthlyExpenses?.[m] || 0) }));
    const savingsTrend = monthKeys.slice(-6).map(m => {
      const inc = Number(analytics?.monthlyIncome?.[m] || 0);
      const exp = Number(analytics?.monthlyExpenses?.[m] || 0);
      return { value: inc ? ((inc - exp) / inc) * 100 : 0 };
    });

    return [
      {
        key: "balance",
        label: "Net Worth",
        icon: <Wallet size={20} strokeWidth={2.5} />,
        value: formatAmount(totalBalance),
        accent: "sky" as const,
        sparklineData: balanceTrend,
      },
      {
        key: "income",
        label: "Income",
        icon: <ArrowUpRight size={20} strokeWidth={2.5} />,
        value: formatAmount(totalIncome),
        delta: incomeDelta,
        accent: "emerald" as const,
        sparklineData: incomeTrend,
      },
      {
        key: "expense",
        label: "Expenses",
        icon: <ArrowDownRight size={20} strokeWidth={2.5} />,
        value: formatAmount(totalExpense),
        delta: expenseDelta,
        accent: "rose" as const,
        sparklineData: expenseTrend,
      },
      {
        key: "savings",
        label: "Savings",
        icon: <PiggyBank size={20} strokeWidth={2.5} />,
        value: `${currentSavingsRate.toFixed(1)}%`,
        delta: savingsDelta,
        accent: "amber" as const,
        sparklineData: savingsTrend,
      },
    ];
  }, [summary, analytics, currentIncome, prevIncome, currentExpense, prevExpense, currentSavingsRate, prevSavingsRate, monthKeys]);

  const insights = useMemo(() => {
    const list: { text: string; sub: string; icon: string; color: "emerald" | "rose" | "amber" }[] = [];
    const expDelta = pctChange(Number(currentExpense), Number(prevExpense));
    
    if (expDelta !== null) {
      const isUp = expDelta > 0;
      list.push({
        text: `Monthly spending is ${isUp ? 'higher' : 'lower'}`,
        sub: `You spent ${Math.abs(expDelta).toFixed(0)}% ${isUp ? 'more' : 'less'} than last month.`,
        icon: isUp ? '📈' : '📉',
        color: isUp ? 'rose' : 'emerald'
      });
    }

    const savDelta = pctChange(currentSavingsRate, prevSavingsRate);
    if (savDelta !== null) {
      const isUp = savDelta > 0;
      list.push({
        text: `Savings rate ${isUp ? 'improved' : 'dropped'}`,
        sub: `Your savings efficiency changed by ${Math.abs(savDelta).toFixed(1)}% this month.`,
        icon: '💰',
        color: isUp ? 'emerald' : 'amber'
      });
    }

    return list;
  }, [currentExpense, prevExpense, currentSavingsRate, prevSavingsRate]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
              Financial Overview
            </h1>
            <PremiumBadge color="indigo" pulse>
              <Sparkles size={12} className="fill-indigo-500" />
              Live Analytics
            </PremiumBadge>
          </div>
          <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
            Welcome back, Pruthviraj. Here's what's happening with your wealth today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-100 dark:border-white/10 rounded-[18px] pl-5 pr-12 py-3.5 text-[13px] font-bold text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/10 appearance-none min-w-[200px] cursor-pointer shadow-sm transition-all"
            >
              <option value="ALL">All Portfolios</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.accountName}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
              <ChevronDown size={14} />
            </div>
          </div>
          
          <PremiumButton 
            onClick={() => navigate("/transactions")}
            className="shadow-xl shadow-primary-500/30"
          >
            <Plus size={18} strokeWidth={3} />
            Add Activity
          </PremiumButton>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-12 gap-6">
        {cards.map((c, idx) => (
          <StatCard 
            key={c.key}
            title={c.label}
            value={c.value}
            icon={c.icon}
            accent={c.accent}
            delta={c.delta || 0}
            loading={loading}
            delayIndex={idx}
            sparklineData={c.sparklineData}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Analytics Chart */}
        <PremiumCard variant="white" className="col-span-12 lg:col-span-8 !p-0">
          <div className="p-8 border-b border-gray-50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-textHeadings dark:text-white tracking-tight">Spending Flow</h3>
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest mt-1">Monthly Income vs Expenses</p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-[14px]">
              <button className="px-4 py-1.5 rounded-xl text-[11px] font-black bg-white dark:bg-white/10 shadow-sm">6 MONTHS</button>
              <button className="px-4 py-1.5 rounded-xl text-[11px] font-black text-textMuted hover:text-textPrimary transition-colors">1 YEAR</button>
            </div>
          </div>

          <div className="p-8 h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                  dx={-10} 
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  animationDuration={2000} 
                />
                <Area 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  animationDuration={2000} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Right Sidebar: Smart Insights & Goal Preview */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          
          {/* AI Insights */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-textMuted px-1">Smart Insights</h4>
            {insights.map((ins, i) => (
              <PremiumCard key={i} variant={ins.color} className="!p-5 border-none shadow-none">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {ins.icon}
                  </div>
                  <div>
                    <h5 className="font-black text-[15px] tracking-tight">{ins.text}</h5>
                    <p className="text-[12px] font-medium text-textSecondary dark:text-slate-400 mt-1 leading-relaxed">
                      {ins.sub}
                    </p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>

          {/* Savings Goals Preview */}
          <PremiumCard variant="white" className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg tracking-tight">Active Goals</h3>
              <button onClick={() => navigate("/goals")} className="text-[13px] font-black text-primary-600 hover:opacity-70 transition-opacity">
                VIEW ALL
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {goals.length === 0 ? (
                <div className="py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Target size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-textMuted uppercase">No Active Goals</p>
                </div>
              ) : goals.slice(0, 3).map(g => {
                const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.icon || "🎯"}</span>
                        <span className="text-[14px] font-black tracking-tight">{g.name}</span>
                      </div>
                      <span className="text-[13px] font-black text-primary-600">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary-500 to-[#8B5CF6] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>
        </div>

        {/* Recent Activity Table */}
        <PremiumCard variant="white" className="col-span-12 lg:col-span-12 !p-0">
          <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-textHeadings dark:text-white tracking-tight">Recent Activity</h3>
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest mt-1">Transaction History</p>
            </div>
            <PremiumButton variant="secondary" onClick={() => navigate("/transactions")} className="!px-4 !py-2 !text-xs !rounded-xl">
              View History
            </PremiumButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5">
                  <th className="px-8 py-4 text-[11px] font-black text-textMuted uppercase tracking-widest">Description</th>
                  <th className="px-8 py-4 text-[11px] font-black text-textMuted uppercase tracking-widest">Category</th>
                  <th className="px-8 py-4 text-[11px] font-black text-textMuted uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[11px] font-black text-textMuted uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          t.type === "INCOME" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10" 
                            : "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10"
                        }`}>
                          {t.type === "INCOME" ? <TrendingUp size={18} strokeWidth={2.5} /> : <Receipt size={18} strokeWidth={2.5} />}
                        </div>
                        <span className="font-black text-[15px] text-textHeadings dark:text-white tracking-tight">{t.description || "Activity"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <PremiumBadge color={t.type === 'INCOME' ? 'emerald' : 'indigo'}>
                        {t.category?.name || "Other"}
                      </PremiumBadge>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] font-bold text-textSecondary dark:text-slate-400">
                        {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-[16px] font-black tracking-tight ${
                        t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-textHeadings dark:text-white"
                      }`}>
                        {t.type === "INCOME" ? "+" : "-"}{formatAmount(t.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

export default DashboardPage;



import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import api from "../services/api";

type Budget = {
  monthlyLimit: number;
};

const BudgetPage = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [exceeded, setExceeded] = useState(false);
  const [input, setInput] = useState("");

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await api.post<Budget>("/budget", { monthlyLimit: Number(input) });
    setBudget(res.data);
    load();
  };

  const progress =
    budget && remaining !== null ? Math.max(0, Math.min(100, ((budget.monthlyLimit - remaining) / budget.monthlyLimit) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-4xl font-black flex items-center gap-4 text-textHeadings dark:text-slate-100 uppercase tracking-tight">
          <span className="text-primary-600">💰</span> Budget Planner
        </h1>
        <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">Set your monthly boundaries</p>
      </div>
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div>
          <label className="block text-sm font-black text-textHeadings dark:text-slate-300 mb-2 uppercase tracking-widest">Monthly limit (₹)</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary font-black tracking-wide pointer-events-none group-focus-within:text-primary-600 transition-colors">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field pl-9 font-medium"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
        >
          Save Budget Settings
        </button>
      </form>

      {budget && remaining !== null && (
        <div className="glass-card p-8 space-y-6">
          <div className="flex justify-between items-end text-[10px] text-textSecondary dark:text-slate-300 font-black uppercase tracking-widest mb-2">
            <span>Monthly Usage</span>
            <div className="text-right flex items-baseline gap-2">
              <span className="text-3xl font-black text-textHeadings dark:text-slate-100 tracking-tighter">₹{(budget.monthlyLimit - remaining).toLocaleString()}</span>
              <span className="text-textMuted">/</span>
              <span className="font-black">₹{budget.monthlyLimit.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-4 rounded-full bg-gray-100 dark:bg-slate-950 border border-border dark:border-white/5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 relative ${exceeded ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${exceeded ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
            <p className={`text-sm font-bold ${exceeded ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"}`}>
              {exceeded
                ? "You have exceeded your monthly budget limit! Please review your recent expenses."
                : `You are on track. Remaining budget: ₹${remaining.toLocaleString()}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;


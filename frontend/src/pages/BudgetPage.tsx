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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Budget</h1>
      <form onSubmit={handleSubmit} className="card space-y-3 max-w-md">
        <div>
          <label className="text-xs text-slate-400">Monthly budget limit (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-sm font-medium"
        >
          Save Budget
        </button>
      </form>

      {budget && remaining !== null && (
        <div className="card max-w-md space-y-3">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Budget usage</span>
            <span>
              ₹{(budget.monthlyLimit - remaining).toFixed(2)} / ₹{budget.monthlyLimit.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${exceeded ? "bg-danger" : "bg-accent"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-xs ${exceeded ? "text-danger" : "text-slate-400"}`}>
            {exceeded
              ? "You have exceeded your monthly budget."
              : `Remaining budget: ₹${remaining.toFixed(2)}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;


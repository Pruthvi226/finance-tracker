import { useEffect, useState } from "react";
import api from "../services/api";

type Dashboard = {
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
};

const DashboardPage = () => {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-xs text-slate-400">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              ₹{data.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400">Total Expense</p>
            <p className="mt-2 text-2xl font-semibold text-danger">
              ₹{data.totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              ₹{data.remainingBalance.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;


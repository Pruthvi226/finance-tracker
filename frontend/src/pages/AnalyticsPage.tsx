import { useEffect, useState } from "react";
import api from "../services/api";
import ChartCard from "../components/charts/ChartCard";

type Analytics = {
  categorySpending: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  monthlyIncome: Record<string, number>;
};

const AnalyticsPage = () => {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Analytics>("/analytics");
      setData(res.data);
    };
    load();
  }, []);

  if (!data) {
    return <p className="text-sm text-slate-400">Loading analytics...</p>;
  }

  const catData = Object.entries(data.categorySpending).map(([name, value]) => ({
    name,
    value,
  }));
  const expData = Object.entries(data.monthlyExpenses).map(([name, value]) => ({
    name,
    value,
  }));
  const ivsData = Object.entries(data.monthlyIncome).map(([name, income]) => ({
    name,
    value: income - (data.monthlyExpenses[name] || 0),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <ChartCard title="Category spending" type="pie" data={catData} />
        <ChartCard title="Monthly expenses" type="bar" data={expData} />
        <ChartCard title="Income vs Expense (net)" type="bar" data={ivsData} />
      </div>
    </div>
  );
};

export default AnalyticsPage;


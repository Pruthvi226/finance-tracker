import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import IncomeForm from "../components/forms/IncomeForm";
import TransactionTable, { type Transaction } from "../components/tables/TransactionTable";

type IncomeApi = {
  id: number;
  amount: number;
  source: string;
  date: string;
  description?: string;
};

const IncomePage = () => {
  const [items, setItems] = useState<IncomeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<IncomeApi | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get<IncomeApi[]>("/income");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values: { amount: number; source: string; date: string; description?: string }) => {
    if (editing) {
      await api.put(`/income/${editing.id}`, values);
    } else {
      await api.post("/income", values);
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/income/${id}`);
    load();
  };

  const filtered: Transaction[] = useMemo(
    () =>
      items
        .filter((i) =>
          search
            ? i.source.toLowerCase().includes(search.toLowerCase()) ||
              (i.description || "").toLowerCase().includes(search.toLowerCase())
            : true
        )
        .map((i) => ({
          id: i.id,
          amount: i.amount,
          source: i.source,
          date: i.date,
          description: i.description,
        })),
    [items, search]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Income</h1>
        <input
          placeholder="Search income..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs"
        />
      </div>
      <IncomeForm
        initial={
          editing
            ? {
                amount: editing.amount,
                source: editing.source,
                date: editing.date,
                description: editing.description,
              }
            : null
        }
        onSubmit={handleSubmit}
      />
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <TransactionTable
          data={filtered}
          type="income"
          onEdit={(t) => {
            const found = items.find((i) => i.id === t.id) || null;
            setEditing(found);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default IncomePage;


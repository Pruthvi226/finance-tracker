import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import ExpenseForm from "../components/forms/ExpenseForm";
import TransactionTable, { type Transaction } from "../components/tables/TransactionTable";

type ExpenseApi = {
  id: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
};

const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];

const ExpensesPage = () => {
  const [items, setItems] = useState<ExpenseApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExpenseApi | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const params: any = {};
    if (categoryFilter !== "all") params.category = categoryFilter;
    const res = await api.get<ExpenseApi[]>("/expenses", { params });
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [categoryFilter]);

  const handleSubmit = async (values: { amount: number; category: string; date: string; description?: string }) => {
    if (editing) {
      await api.put(`/expenses/${editing.id}`, values);
    } else {
      await api.post("/expenses", values);
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/expenses/${id}`);
    load();
  };

  const filtered: Transaction[] = useMemo(
    () =>
      items
        .filter((i) =>
          search
            ? i.category.toLowerCase().includes(search.toLowerCase()) ||
              (i.description || "").toLowerCase().includes(search.toLowerCase())
            : true
        )
        .map((i) => ({
          id: i.id,
          amount: i.amount,
          category: i.category,
          date: i.date,
          description: i.description,
        })),
    [items, search]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs"
          />
        </div>
      </div>
      <ExpenseForm
        categories={CATEGORIES}
        initial={
          editing
            ? {
                amount: editing.amount,
                category: editing.category,
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
          type="expense"
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

export default ExpensesPage;


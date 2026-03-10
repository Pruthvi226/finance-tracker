import React, { useState, useEffect } from "react";

type Props = {
  initial?: {
    amount: number;
    category: string;
    date: string;
    description?: string;
  } | null;
  onSubmit: (values: { amount: number; category: string; date: string; description?: string }) => void;
  categories: string[];
};

const ExpenseForm: React.FC<Props> = ({ initial, onSubmit, categories }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount.toString());
      setCategory(initial.category);
      setDate(initial.date);
      setDescription(initial.description || "");
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(amount),
      category,
      date,
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card grid gap-3 md:grid-cols-5 items-end">
      <div>
        <label className="text-xs text-slate-400">Amount</label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400">Category</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-400">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-slate-400">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        className="md:col-span-5 mt-1 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-sm font-medium"
      >
        {initial ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
};

export default ExpenseForm;


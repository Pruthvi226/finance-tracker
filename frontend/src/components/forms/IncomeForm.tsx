import React, { useEffect, useState } from "react";

type Props = {
  initial?: {
    amount: number;
    source: string;
    date: string;
    description?: string;
  } | null;
  onSubmit: (values: { amount: number; source: string; date: string; description?: string }) => void;
};

const IncomeForm: React.FC<Props> = ({ initial, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount.toString());
      setSource(initial.source);
      setDate(initial.date);
      setDescription(initial.description || "");
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(amount),
      source,
      date,
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card grid gap-3 md:grid-cols-4 items-end">
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
        <label className="text-xs text-slate-400">Source</label>
        <input
          type="text"
          required
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        />
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
      <div className="md:col-span-4">
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
        className="md:col-span-4 mt-1 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-sm font-medium"
      >
        {initial ? "Update Income" : "Add Income"}
      </button>
    </form>
  );
};

export default IncomeForm;


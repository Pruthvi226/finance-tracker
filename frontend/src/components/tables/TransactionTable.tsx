import React from "react";

export type Transaction = {
  id: number;
  amount: number;
  category?: string;
  source?: string;
  date: string;
  description?: string;
};

type Props = {
  data: Transaction[];
  type: "income" | "expense";
  onEdit: (item: Transaction) => void;
  onDelete: (id: number) => void;
};

const TransactionTable: React.FC<Props> = ({ data, type, onEdit, onDelete }) => {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-2 text-left">Date</th>
            <th className="py-2 text-left">Amount</th>
            <th className="py-2 text-left">{type === "income" ? "Source" : "Category"}</th>
            <th className="py-2 text-left">Description</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((t) => (
            <tr key={t.id}>
              <td className="py-2">{t.date}</td>
              <td className="py-2">
                {type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
              </td>
              <td className="py-2">{t.category || t.source}</td>
              <td className="py-2">{t.description}</td>
              <td className="py-2 text-right space-x-2">
                <button
                  onClick={() => onEdit(t)}
                  className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="px-2 py-1 text-xs rounded bg-danger/80 hover:bg-danger text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-slate-500">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;


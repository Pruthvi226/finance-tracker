import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CategoryIcon from '@mui/icons-material/Category';

type Category = {
  id: number;
  name: string;
  type: string;
};

type RecurringTransaction = {
  id: number;
  title: string;
  categoryId: number;
  category?: Category;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  nextExecutionDate: string;
  description: string;
  active: boolean;
};

const RecurringTransactionsPage = () => {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [startDate, setStartDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txnRes, catRes] = await Promise.all([
        api.get<RecurringTransaction[]>("/recurring-transactions"),
        api.get<Category[]>("/categories")
      ]);
      setTransactions(txnRes.data);
      setCategories(catRes.data);
    } catch {
      toast.error("Failed to load recurring transactions");
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !startDate || !categoryId) return;
    
    setSubmitting(true);
    try {
      await api.post("/recurring-transactions", {
        title,
        amount: parseFloat(amount),
        type,
        frequency,
        startDate,
        categoryId: parseInt(categoryId),
        description
      });
      toast.success("Recurring transaction created successfully!");
      setShowForm(false);
      
      // Reset form
      setTitle("");
      setAmount("");
      setCategoryId("");
      setDescription("");
      
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (txn: RecurringTransaction) => {
    try {
      await api.put(`/recurring-transactions/${txn.id}`, {
        ...txn,
        categoryId: txn.category?.id || txn.categoryId,
        active: !txn.active
      });
      toast.success(`Subscription ${!txn.active ? 'enabled' : 'disabled'}`);
      loadData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await api.delete(`/recurring-transactions/${id}`);
      toast.success("Subscription removed");
      loadData();
    } catch {
      toast.error("Failed to delete subscription");
    }
  };

  // Calculations for summary card
  const activeIncome = transactions
    .filter(t => t.active && t.type === "INCOME")
    .reduce((sum, t) => sum + (t.frequency === 'YEARLY' ? t.amount/12 : t.frequency === 'MONTHLY' ? t.amount : t.frequency === 'WEEKLY' ? t.amount * 4.33 : t.amount * 30), 0);
    
  const activeExpense = transactions
    .filter(t => t.active && t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.frequency === 'YEARLY' ? t.amount/12 : t.frequency === 'MONTHLY' ? t.amount : t.frequency === 'WEEKLY' ? t.amount * 4.33 : t.amount * 30), 0);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-40 w-full glass-card"></div>
        <div className="h-80 w-full glass-card"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 text-textHeadings dark:text-slate-100 uppercase tracking-tighter">
            <span className="text-primary-600"><RepeatOneIcon fontSize="large"/></span> Subscriptions
          </h1>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">Architect your recurring cashflow</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary py-2 px-4 shadow-lg shadow-primary-500/20"
        >
          <AddCircleOutlineIcon className="mr-2" fontSize="small" />
          New Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="text-[10px] font-black text-textSecondary dark:text-slate-400 mb-2 uppercase tracking-widest">Projected Monthly Income</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">₹{activeIncome.toLocaleString()}</div>
          <div className="text-[10px] font-black text-textSecondary dark:text-slate-500 mt-2 uppercase tracking-widest">from active recurring deposits</div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-rose-500 shadow-sm">
          <div className="text-[10px] font-black text-textSecondary dark:text-slate-400 mb-2 uppercase tracking-widest">Projected Monthly Burn</div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">₹{activeExpense.toLocaleString()}</div>
          <div className="text-[10px] font-black text-textSecondary dark:text-slate-500 mt-2 uppercase tracking-widest">from active recurring subscriptions</div>
        </div>
      </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-textPrimary dark:text-slate-100 mb-6 uppercase tracking-tight">Setup Recurring Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Title (e.g., Netflix)</label>
                <input
                  className="input-field font-bold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Monthly Rent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Type</label>
                <select className="input-field font-bold appearance-none" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Category</label>
                <select className="input-field font-bold appearance-none" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  <option value="">Select Category</option>
                  {currentCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Frequency</label>
                <select className="input-field font-bold appearance-none" value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Start Date</label>
                <input
                  type="date"
                  className="input-field font-bold"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Description (Optional)</label>
              <input
                className="input-field font-bold"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? "Saving..." : "Create Subscription"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm font-bold text-textMuted hover:text-textPrimary hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-border dark:border-white/5 shadow-sm">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
              <RepeatOneIcon fontSize="large" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">No subscriptions yet</h3>
            <p className="text-slate-400 mt-2">Set up your recurring bills and income to automate your ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-textSecondary dark:text-slate-300">
              <thead className="text-[10px] uppercase bg-gray-50 dark:bg-slate-900 text-textSecondary dark:text-slate-500 border-b border-border dark:border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black tracking-widest">Title</th>
                  <th className="px-6 py-5 font-black tracking-widest">Amount</th>
                  <th className="px-6 py-5 font-black tracking-widest">Frequency</th>
                  <th className="px-6 py-5 font-black tracking-widest">Next Charge</th>
                  <th className="px-6 py-5 font-black tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 font-black tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!txn.active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="font-black text-textPrimary dark:text-slate-200 uppercase tracking-tight">{txn.title}</div>
                      <div className="text-[10px] flex items-center gap-1 mt-1 text-textMuted dark:text-slate-500 font-bold uppercase tracking-widest">
                        <CategoryIcon sx={{ fontSize: 13 }} className="opacity-70" /> {txn.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black">
                      <span className={txn.type === "INCOME" ? "text-emerald-600" : "text-textHeadings"}>
                        {txn.type === "INCOME" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-xs uppercase tracking-widest">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 text-textSecondary dark:text-slate-300 border border-border dark:border-white/10 shadow-sm">
                        {txn.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-textPrimary dark:text-slate-300 font-bold">{txn.nextExecutionDate ? new Date(txn.nextExecutionDate).toLocaleDateString() : '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleStatus(txn)} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${txn.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-white/10'}`}>
                        {txn.active ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-black uppercase tracking-widest hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecurringTransactionsPage;

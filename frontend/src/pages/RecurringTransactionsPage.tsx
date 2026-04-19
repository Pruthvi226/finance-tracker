import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Repeat, 
  Plus, 
  Layers, 
  Trash2, 
  Activity, 
  Zap, 
  Pause, 
  Play,
  Calendar,
  IndianRupee,
  CreditCard,
  ChevronDown,
  X
} from "lucide-react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { AnimatedCounter } from "../components/AnimatedCounter";

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
      setLoading(true);
      const [txnRes, catRes] = await Promise.all([
        api.get<RecurringTransaction[]>("/recurring-transactions"),
        api.get<Category[]>("/categories")
      ]);
      setTransactions(txnRes.data);
      setCategories(catRes.data);
    } catch {
      toast.error("Failed to load recurring flows");
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
      toast.success("Subscription initialized successfully!");
      setShowForm(false);
      
      // Reset form
      setTitle("");
      setAmount("");
      setCategoryId("");
      setDescription("");
      
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initialize cycle");
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
      toast.success(`Workflow ${!txn.active ? 'resumed' : 'suspended'}`);
      loadData();
    } catch {
      toast.error("Failed to modulate flow");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to terminate this subscription?")) return;
    try {
      await api.delete(`/recurring-transactions/${id}`);
      toast.success("Cycle terminated");
      loadData();
    } catch {
      toast.error("Failed to delete subscription");
    }
  };

  const monthlyTotals = transactions.reduce((acc, t) => {
    if (!t.active) return acc;
    const mult = t.frequency === 'YEARLY' ? 1/12 : t.frequency === 'MONTHLY' ? 1 : t.frequency === 'WEEKLY' ? 4.33 : 30;
    const amt = t.amount * mult;
    if (t.type === 'INCOME') acc.income += amt;
    else acc.expense += amt;
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
              Recurring Cycles
            </h1>
            <PremiumBadge color="primary">
              <Zap size={12} className="mr-1" />
              Automated Flows
            </PremiumBadge>
          </div>
          <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
            Monitor and manage your repeating incomes and automated subscription burns.
          </p>
        </div>

        <PremiumButton 
          onClick={() => setShowForm(true)}
          className="shadow-xl shadow-primary-500/30"
        >
          <Plus size={18} strokeWidth={3} />
          Append Cycle
        </PremiumButton>
      </div>

      {/* Summary Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumCard variant="emerald" className="border-none shadow-xl overflow-hidden relative p-8">
           <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none transform translate-x-4 -translate-y-4">
              <Activity size={100} strokeWidth={1} />
           </div>
           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Projected Monthly Inflow</p>
           <h3 className="text-4xl font-black text-white tracking-tighter">
             ₹<AnimatedCounter value={monthlyTotals.income} decimals={0} />
           </h3>
           <div className="mt-4 flex items-center gap-2">
              <PremiumBadge color="gray" className="!bg-white/10 !text-white !border-white/20 !px-2 !py-0.5 !text-[9px]">
                Active Streams
              </PremiumBadge>
           </div>
        </PremiumCard>

        <PremiumCard variant="rose" className="border-none shadow-xl overflow-hidden relative p-8">
           <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none transform translate-x-4 -translate-y-4 text-white">
              <ChevronDown size={100} strokeWidth={1} />
           </div>
           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Projected Monthly Burn</p>
           <h3 className="text-4xl font-black text-white tracking-tighter">
             ₹<AnimatedCounter value={monthlyTotals.expense} decimals={0} />
           </h3>
           <div className="mt-4 flex items-center gap-2">
              <PremiumBadge color="gray" className="!bg-white/10 !text-white !border-white/20 !px-2 !py-0.5 !text-[9px]">
                Subscription Load
              </PremiumBadge>
           </div>
        </PremiumCard>
      </div>

      {/* Form Overlay */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[32px] p-10 shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-600" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-textHeadings dark:text-white uppercase">
                    Configure Recurrence
                  </h2>
                  <p className="text-xs font-bold text-textSecondary dark:text-slate-400 mt-1 uppercase tracking-widest">Architect your repeating cash flows</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-textMuted hover:text-textPrimary transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Designation Title</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold placeholder:text-textMuted outline-none"
                      placeholder="e.g. Netflix, Rent, Monthly Salary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Periodic Amount</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] pl-12 pr-6 py-4 text-sm font-bold outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Flow Type</label>
                    <select
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                    >
                      <option value="EXPENSE">Expense Flow</option>
                      <option value="INCOME">Income Flow</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Temporal Category</label>
                    <select
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">Select Domain</option>
                      {currentCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Cyclicality (Frequency)</label>
                    <select
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Activation Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 rounded-[20px] bg-gray-50 dark:bg-white/5 text-textSecondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 dark:border-white/10"
                  >
                    Discard
                  </button>
                  <PremiumButton type="submit" className="flex-[1.5] !rounded-[20px] !bg-gradient-to-r from-primary-500 to-indigo-600">
                    {submitting ? "Processing..." : "Establish Cycle"}
                  </PremiumButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-48 rounded-[24px] bg-gray-100 dark:bg-white/5 animate-pulse" />)
          ) : transactions.length === 0 ? (
            <div className="col-span-full py-24 text-center flex flex-col items-center">
                <div className="h-24 w-24 rounded-[32px] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                  <Repeat size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-textHeadings dark:text-white uppercase tracking-tight">No Automated Cycles</h3>
                <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2 max-w-sm">
                    Configure your first recurring flow to architect your predictable cashflows.
                </p>
            </div>
          ) : (
            transactions.map((txn, idx) => (
              <PremiumCard
                key={txn.id}
                delayIndex={idx}
                variant="white"
                className={`relative group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all ${
                  !txn.active ? 'opacity-60 saturate-50' : ''
                }`}
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  txn.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />

                <div className="flex flex-col h-full p-6">
                  <div className="flex items-start justify-between mb-6 ml-1">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      txn.type === 'INCOME' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      <Repeat size={24} strokeWidth={2.5} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(txn)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                          txn.active 
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' 
                            : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                        }`}
                        title={txn.active ? "Pause Cycle" : "Resume Cycle"}
                      >
                        {txn.active ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(txn.id)}
                        className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-white/10 text-textMuted hover:text-rose-600 hover:bg-rose-50 transition-all border border-gray-100 dark:border-white/10 flex items-center justify-center"
                        title="Terminate Cycle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="ml-1 mb-6 flex-1">
                    <h3 className="text-lg font-black text-textHeadings dark:text-white uppercase tracking-tight truncate mb-1">{txn.title}</h3>
                    <div className="flex items-center gap-2">
                       <PremiumBadge color="gray" className="!bg-gray-100/50 !text-textMuted !px-2 !py-0.5 !text-[9px]">
                         {txn.category?.name || "No Category"}
                       </PremiumBadge>
                       <span className="text-[10px] font-black uppercase tracking-[0.1em] text-textMuted opacity-60">• {txn.frequency}</span>
                    </div>
                  </div>

                  <div className="ml-1 pt-4 border-t border-gray-100 dark:border-white/10">
                    <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-0.5">Quantum</p>
                         <h4 className={`text-xl font-black ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-textHeadings dark:text-white'}`}>
                           {txn.type === 'INCOME' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                         </h4>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-1 flex items-center justify-end gap-1">
                           Next: <Calendar size={10} />
                         </p>
                         <p className="text-xs font-bold text-textPrimary dark:text-white">{txn.nextExecutionDate ? new Date(txn.nextExecutionDate).toLocaleDateString() : '--/--/--'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecurringTransactionsPage;

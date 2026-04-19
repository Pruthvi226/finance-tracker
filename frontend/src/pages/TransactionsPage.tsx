import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Download, 
  FileText, 
  Filter,
  BarChart3,
  Calendar,
  X,
  ChevronDown
} from "lucide-react";
import { TransactionCard } from "../components/Transactions/TransactionCard";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string;
  category: { id: number; name: string } | null;
  receiptUrl: string | null;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "ALL">("ALL");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (e) {
        console.error("Failed to load accounts");
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, selectedAccountId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = `/transactions?pageNo=0&pageSize=50`;
      if (typeFilter !== "ALL") url += `&type=${typeFilter}`;
      if (selectedAccountId !== "ALL") url += `&accountId=${selectedAccountId}`;
      
      const res = await api.get(url);
      setTransactions(res.data.content || []);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      toast.success("Transaction deleted successfully");
    } catch (e) {
      toast.error("Failed to delete transaction");
    }
  };

  const handleReceiptUpload = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(`/transactions/${id}/receipt`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setTransactions(transactions.map(t => t.id === id ? { ...t, receiptUrl: res.data.receiptUrl } : t));
      toast.success("Receipt uploaded!");
    } catch (err) {
      toast.error("Failed to upload receipt");
    }
  };

  const filtered = transactions.filter(t => 
    (t.description || "").toLowerCase().includes(search.toLowerCase()) || 
    (t.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
              Portolio Ledger
            </h1>
            <PremiumBadge color="indigo">
              {filtered.length} Records found
            </PremiumBadge>
          </div>
          <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
            A comprehensive history of your financial activities and receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButton variant="secondary" className="!px-4 !py-3 !text-xs !rounded-xl border-gray-100 shadow-none">
            <Download size={16} /> Export CSV
          </PremiumButton>
          <PremiumButton variant="secondary" className="!px-4 !py-3 !text-xs !rounded-xl border-gray-100 shadow-none">
            <FileText size={16} /> PDF Report
          </PremiumButton>
          <PremiumButton className="shadow-xl shadow-primary-500/30">
            <Plus size={18} strokeWidth={3} />
            New Activity
          </PremiumButton>
        </div>
      </div>

      {/* Filter Bar */}
      <PremiumCard variant="white" className="!p-4 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 lg:col-span-5 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={18} />
          <input
            type="text"
            placeholder="Search by description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[16px] pl-12 pr-4 py-3.5 text-sm font-bold text-textPrimary dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/50 transition-all outline-none"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="col-span-6 lg:col-span-3 relative">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[16px] pl-5 pr-10 py-3.5 text-sm font-bold text-textPrimary dark:text-white focus:outline-none appearance-none cursor-pointer outline-none"
          >
            <option value="ALL">All Portfolios</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.accountName}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="col-span-6 lg:col-span-4 flex items-center gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-[18px]">
          {["ALL", "INCOME", "EXPENSE"].map(filter => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter as any)}
              className={`flex-1 py-3.5 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all ${
                typeFilter === filter 
                  ? "bg-white dark:bg-white/10 text-primary-600 dark:text-white shadow-sm border border-gray-100 dark:border-white/10" 
                  : "text-textMuted hover:text-textPrimary transition-colors"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* Results */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-[24px]" />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-[28px] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-textHeadings dark:text-white tracking-tight">No match found</h3>
              <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2 max-w-sm">
                We couldn't find any financial records matching your current filters.
              </p>
              <PremiumButton 
                variant="ghost" 
                className="mt-6 text-primary-600 font-black"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("ALL");
                  setSelectedAccountId("ALL");
                }}
              >
                Reset Filters
              </PremiumButton>
            </motion.div>
          ) : (
            filtered.map((tx, idx) => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                index={idx} 
                onDelete={handleDelete} 
                onUploadReceipt={handleReceiptUpload} 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TransactionsPage;

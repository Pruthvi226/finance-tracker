import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { TransactionCard } from "../components/Transactions/TransactionCard";

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
    if (!window.confirm("Delete transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      toast.success("Transaction deleted");
    } catch (e) {
      toast.error("Failed to delete");
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

  const filtered = transactions.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-textHeadings dark:text-slate-50 uppercase">Transactions</h1>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">Manage your global ledger</p>
        </div>
        <button className="btn-primary">
          <AddIcon sx={{ fontSize: 20 }} /> New Transaction
        </button>
      </div>

      <div className="glass-card flex flex-col sm:flex-row gap-4 justify-between items-center p-6">
        <div className="relative w-full sm:w-96 group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 transition-transform group-focus-within:scale-110" fontSize="small" />
          <input
            type="text"
            placeholder="SEARCH TRANSACTIONS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 font-black uppercase tracking-widest text-[10px]"
          />
        </div>
        <div className="flex bg-gray-50 dark:bg-slate-950/40 p-1.5 rounded-xl border border-border dark:border-white/5 items-center gap-2 shadow-inner">
          {/* Account Filter Dropdown */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="bg-transparent text-textHeadings dark:text-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 focus:outline-none cursor-pointer hover:text-primary-600 transition-colors"
          >
            <option value="ALL">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.accountName.toUpperCase()}</option>
            ))}
          </select>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          {["ALL", "INCOME", "EXPENSE"].map(filter => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                typeFilter === filter ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-textSecondary dark:text-slate-400 hover:text-textHeadings dark:hover:text-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center text-slate-400">
            <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
             <div className="h-16 w-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                <SearchIcon sx={{ fontSize: 32 }} className="text-slate-500" />
             </div>
             <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100">No transactions found</h3>
             <p className="text-sm text-textMuted dark:text-slate-400 mt-2 max-w-sm font-bold">
                We couldn't find any data matching your current filters. Try relaxing the search terms or adding a new transaction.
             </p>
          </div>
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
      </div>
    </div>
  );
};

export default TransactionsPage;

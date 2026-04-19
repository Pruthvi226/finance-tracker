import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  ArrowUpDown,
  Receipt,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import TransactionForm from "../components/Transactions/TransactionForm";
import { TransactionCard } from "../components/Transactions/TransactionCard";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transactions");
      setTransactions(res.data.content || []);
    } catch (err) {
      console.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check for add-true in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, []);

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
    const matchesCategory = categoryFilter === "ALL" || tx.category?.name?.toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full" />
             <PremiumBadge color="indigo" variant="neon">MY SPENDING LOG</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            Recent Spending
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            History <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> {transactions.length} Records found
          </p>
        </div>

        <div className="flex gap-4">
          <PremiumButton 
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={`shadow-xl h-14 !px-8 !rounded-[20px] ${showFilters ? 'bg-indigo-500 text-white' : ''}`}
          >
            <Filter size={18} className="mr-2" />
            FILTER
          </PremiumButton>
          <PremiumButton 
            onClick={() => setShowAddModal(true)}
            size="lg"
            className="shadow-xl shadow-indigo-500/20 h-14 !px-10 !rounded-[20px]"
          >
            <Plus size={18} strokeWidth={4} className="mr-2" />
            ADD RECORD
          </PremiumButton>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <PremiumCard variant="white" className="!p-8 mb-4 border-indigo-500/20">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SEARCH BY NAME</p>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. Starbucks..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-white/5 border-none rounded-2xl text-[14px] font-bold focus:ring-2 ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">INCOME OR EXPENSE</p>
                    <div className="flex gap-2">
                       {['ALL', 'INCOME', 'EXPENSE'].map(t => (
                         <button 
                          key={t}
                          onClick={() => setTypeFilter(t)}
                          className={`flex-1 py-3 text-[11px] font-black rounded-xl border transition-all ${typeFilter === t ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SELECT CATEGORY</p>
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-white/5 border-none rounded-2xl text-[14px] font-bold focus:ring-2 ring-indigo-500 transition-all outline-none appearance-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="FOOD">Food & Drink</option>
                      <option value="TRANSPORT">Travel</option>
                      <option value="UTILITIES">Bills</option>
                      <option value="ENTERTAINMENT">Fun</option>
                      <option value="HEALTH">Health</option>
                      <option value="SALARY">Salary</option>
                      <option value="SHOPPING">Shopping</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
               </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-8">
        {/* Main List */}
        <div className="col-span-12 lg:col-span-12">
           <PremiumCard variant="white" className="!p-0 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                       <Receipt size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">LIST OF SPENDING</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredTransactions.length} Items Listed</p>
                    </div>
                 </div>
                 <div className="hidden sm:flex items-center gap-4">
                    <button className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-500 hover:text-indigo-500 transition-colors">
                       <Download size={18} />
                    </button>
                    <button className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-500 hover:text-indigo-500 transition-colors">
                       <ArrowUpDown size={18} />
                    </button>
                 </div>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-8 animate-pulse flex items-center gap-6">
                       <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl" />
                       <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-1/4" />
                          <div className="h-2 bg-slate-100 dark:bg-white/5 rounded w-1/6" />
                       </div>
                       <div className="w-24 h-8 bg-slate-100 dark:bg-white/5 rounded-2xl" />
                    </div>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, i) => (
                    <TransactionCard 
                      key={tx.id} 
                      transaction={tx} 
                      index={i}
                      onDelete={async (id) => {
                        if (window.confirm("Delete this record?")) {
                          await api.delete(`/transactions/${id}`);
                          loadData();
                        }
                      }}
                      onEdit={(tx) => {
                        setEditingTransaction(tx);
                        setShowAddModal(true);
                      }}
                      onUploadReceipt={async (id, e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          await api.post(`/transactions/${id}/receipt`, formData);
                          loadData();
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="p-20 flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 mb-6">
                       <Search size={40} />
                    </div>
                    <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase mb-2">Nothing found</h4>
                    <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Try changing your search filters.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">PAGE 1 OF 1</p>
                 <div className="flex gap-2">
                    <button className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-300 cursor-not-allowed">
                       <ChevronLeft size={18} />
                    </button>
                    <button className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-300 cursor-not-allowed">
                       <ChevronRight size={18} />
                    </button>
                 </div>
              </div>
           </PremiumCard>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide z-10"
             >
                <TransactionForm 
                  initialData={editingTransaction}
                  onSuccess={() => { handleModalClose(); loadData(); }} 
                  onCancel={handleModalClose} 
                />
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionsPage;

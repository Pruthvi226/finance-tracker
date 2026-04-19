import { format } from "date-fns";
import { 
  Trash2, 
  Wallet, 
  UploadCloud,
  Loader2,
  Calendar,
  Edit2,
  FileText,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { PremiumBadge } from "../ui/PremiumBadge";
import { motion } from "framer-motion";

type Transaction = {
  id: number;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string;
  category: { id: number; name: string } | null;
  receiptUrl: string | null;
  categoryId?: number;
  accountId?: number;
};

type Props = {
  transaction: Transaction;
  index: number;
  onDelete: (id: number) => void;
  onEdit: (tx: Transaction) => void;
  onUploadReceipt: (id: number, e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export const TransactionCard = ({ transaction: tx, index, onDelete, onEdit, onUploadReceipt }: Props) => {
  const [uploading, setUploading] = useState(false);
  
  const isIncome = tx.type === "INCOME";

  const handleUploadWrapper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    await onUploadReceipt(tx.id, e);
    setUploading(false);
  };

  return (
    <PremiumCard
      delayIndex={index}
      className={`relative group !p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 overflow-hidden border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:dark:bg-white/[0.05]`}
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        {/* Dynamic Icon with Pulse Effect */}
        <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm border ${
          isIncome 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10' 
            : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/10'
        }`}>
           {isIncome ? <TrendingUp size={24} strokeWidth={3} /> : <TrendingDown size={24} strokeWidth={3} />}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-[17px] font-black text-slate-900 dark:text-slate-100 truncate tracking-tight uppercase">
              {tx.description || "System Automated Entry"}
            </h3>
            <PremiumBadge color={isIncome ? 'emerald' : 'indigo'} variant="neon" className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
              {tx.category?.name || "UNCLASSIFIED"}
            </PremiumBadge>
          </div>
          
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <Calendar size={12} strokeWidth={3} />
              {format(new Date(tx.date), "MMM dd, yyyy").toUpperCase()}
            </span>
            <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-2">
              <Wallet size={12} strokeWidth={3} />
              LOCAL ACCOUNT
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-10 shrink-0">
        <div className="text-right">
          <div className={`text-[22px] font-black tracking-tighter ${
            isIncome ? "text-emerald-500" : "text-slate-900 dark:text-white"
          }`}>
            {isIncome ? "+" : "-"}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}{tx.currency || "₹"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(tx)}
            className="h-11 w-11 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors border border-transparent hover:border-indigo-500/30"
            title="Edit Entry"
          >
            <Edit2 size={16} strokeWidth={3} />
          </motion.button>

          {tx.receiptUrl ? (
            <motion.a 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={`http://localhost:8081${tx.receiptUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="h-11 w-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 transition-colors border border-emerald-500/20"
              title="Verified Archive"
            >
              <FileText size={16} strokeWidth={3} />
            </motion.a>
          ) : (
            <motion.label 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="h-11 w-11 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors border border-transparent hover:border-indigo-500/30"
              title="Upload Proof"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} strokeWidth={3} />}
              <input type="file" className="hidden" onChange={handleUploadWrapper} accept="image/*,.pdf" />
            </motion.label>
          )}

          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(tx.id)}
            className="h-11 w-11 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/30"
            title="Purge Entry"
          >
            <Trash2 size={16} strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </PremiumCard>
  );
};

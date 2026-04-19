import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  Receipt, 
  Trash2, 
  Wallet, 
  Tag,
  ExternalLink,
  UploadCloud,
  Loader2,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { PremiumBadge } from "../ui/PremiumBadge";

type Transaction = {
  id: number;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string;
  category: { id: number; name: string } | null;
  receiptUrl: string | null;
};

type Props = {
  transaction: Transaction;
  index: number;
  onDelete: (id: number) => void;
  onUploadReceipt: (id: number, e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export const TransactionCard = ({ transaction: tx, index, onDelete, onUploadReceipt }: Props) => {
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
      className={`relative group !p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden ${
        isIncome ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-primary-500'
      }`}
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <div className={`h-14 w-14 shrink-0 rounded-[20px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm ${
          isIncome 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
        }`}>
           <Wallet size={24} strokeWidth={2.5} />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h3 className="text-[17px] font-black text-textHeadings dark:text-white truncate tracking-tight uppercase">
              {tx.description || "Activity"}
            </h3>
            <PremiumBadge color={isIncome ? 'emerald' : 'indigo'}>
              {tx.category?.name || "Uncategorized"}
            </PremiumBadge>
          </div>
          
          <div className="flex items-center gap-4 text-[11px] text-textSecondary dark:text-slate-400 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="opacity-50" />
              {format(new Date(tx.date), "MMM dd, yyyy")}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></span>
            <span className="flex items-center gap-1.5 capitalize text-textMuted lowercase tracking-normal font-medium">
              Transaction ID: #{tx.id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-8 shrink-0">
        <div className="text-right">
          <div className={`text-[22px] font-black tracking-tighter ${
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-textHeadings dark:text-white"
          }`}>
            {isIncome ? "+" : "-"}{tx.currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tx.receiptUrl ? (
            <a 
              href={`http://localhost:8081${tx.receiptUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="h-10 w-10 border border-border dark:border-white/10 rounded-xl flex items-center justify-center text-textSecondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all shadow-sm group/btn"
              title="View Receipt"
            >
              <ExternalLink size={18} className="group-hover/btn:scale-110 transition-transform" />
            </a>
          ) : (
            <label 
              className="h-10 w-10 border border-border dark:border-white/10 rounded-xl flex items-center justify-center text-textSecondary cursor-pointer hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all shadow-sm group/btn"
              title="Upload Receipt"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} className="group-hover/btn:scale-110 transition-transform" />}
              <input type="file" className="hidden" onChange={handleUploadWrapper} accept="image/*,.pdf" />
            </label>
          )}

          <button 
            onClick={() => onDelete(tx.id)}
            className="h-10 w-10 border border-border dark:border-white/10 rounded-xl flex items-center justify-center text-textSecondary hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm group/btn"
            title="Delete Transaction"
          >
            <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </PremiumCard>
  );
};

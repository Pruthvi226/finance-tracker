import { format } from "date-fns";
import { motion } from "framer-motion";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";

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
  const iconColor = isIncome 
    ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
    : "text-textHeadings bg-gray-50 border-border dark:text-slate-100 dark:bg-slate-800 dark:border-white/5";
  const amountColor = isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-textHeadings dark:text-slate-100";
  const prefix = isIncome ? "+" : "-";

  const handleUploadWrapper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    await onUploadReceipt(tx.id, e);
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface dark:bg-slate-900/40 border border-border dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 shadow-sm transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isIncome ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'}`}></div>

      <div className="flex items-start md:items-center gap-4 min-w-0 flex-1 ml-2">
        <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border shadow-inner ${iconColor}`}>
           <AccountBalanceWalletIcon />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-textHeadings dark:text-slate-100 truncate tracking-tight uppercase">{tx.description}</h3>
            {isIncome ? (
               <span className="shrink-0 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">Income</span>
            ) : (
               <span className="shrink-0 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-gray-50 text-textSecondary dark:bg-white/5 dark:text-slate-400 border border-border dark:border-white/5">Expense</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-textSecondary dark:text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1 font-black">
              <LocalOfferIcon sx={{ fontSize: 13 }} className="opacity-70" />
              {tx.category?.name || "Uncategorized"}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></span>
            <span className="font-black">{format(new Date(tx.date), "MMM dd, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 ml-14 md:ml-0">
        <div className="text-right">
          <div className={`text-lg font-black tracking-tight ${amountColor}`}>
            {prefix}{tx.currency}{tx.amount.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {tx.receiptUrl ? (
            <a 
              href={`http://localhost:8081${tx.receiptUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors border border-primary-100 dark:border-primary-500/20 shadow-sm"
              title="View Receipt"
            >
              <ReceiptIcon sx={{ fontSize: 18 }} />
            </a>
          ) : (
            <label 
              className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              title="Upload Receipt"
            >
              {uploading ? <CircularProgress size={14} color="inherit" /> : <ReceiptIcon sx={{ fontSize: 18 }} />}
              <input type="file" className="hidden" onChange={handleUploadWrapper} accept="image/*,.pdf" />
            </label>
          )}

          <button 
            onClick={() => onDelete(tx.id)}
            className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800 text-textMuted dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-border dark:border-white/5 shadow-sm"
            title="Delete Transaction"
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import TransactionForm from "./Transactions/TransactionForm";

export const GlobalFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide on login/register pages
  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, translateY: -4 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(99,102,241,0.3)] z-[50] hover:shadow-[0_15px_35px_rgba(99,102,241,0.5)] transition-all duration-300 group"
        title="Add Transaction"
      >
        <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="bg-white dark:bg-[#0F172A] w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden relative z-10 border border-gray-100 dark:border-white/5 p-10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-[#8B5CF6]" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-textHeadings dark:text-white uppercase tracking-tight">New Transaction</h2>
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mt-1">Log your activity from anywhere</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-textMuted hover:text-textPrimary transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <TransactionForm 
                onSuccess={() => {
                  setIsOpen(false);
                  // Refresh data if possible or let the page handle it
                  window.location.reload(); // Simple refresh for now to ensure data consistency
                }}
                onCancel={() => setIsOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

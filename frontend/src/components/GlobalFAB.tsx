import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import { useLocation } from "react-router-dom";

export const GlobalFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide on login/register pages
  if (['/login', '/register'].includes(location.pathname)) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-gradient-to-r from-primary-600 to-[#8B5CF6] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(99,102,241,0.4)] z-50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.6)] transition-shadow duration-300"
      >
        <AddIcon fontSize="medium" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/20 dark:border-white/10"
            >
              <div className="p-6 border-b border-border/50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <h2 className="text-xl font-bold text-textHeadings dark:text-white uppercase tracking-tight">Add Transaction</h2>
                <p className="text-xs text-textSecondary dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">Quick log from anywhere</p>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-center text-textSecondary dark:text-slate-400 py-10 font-medium">
                  {/* To keep it simple for now, we leave a placeholder. Ideally, we would extract the Transaction Form from TransactionsPage out to a reusable component and drop it here. */}
                  Transaction Form Component Goes Here.<br/>
                  (For full functionality, abstract `TransactionForm` into components/ and plug it in.)
                </p>
              </div>
              
              <div className="p-4 bg-gray-50/50 dark:bg-white/5 border-t border-border/50 dark:border-white/5 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-textSecondary dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-primary py-2.5 shadow-md shadow-primary-500/20 text-sm"
                >
                  Save Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

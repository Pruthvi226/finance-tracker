import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeMode } from "../../context/ThemeContext";

export const ThemeToggle = () => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleMode}
      className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-textSecondary hover:text-primary-600 dark:hover:text-primary-400 transition-all overflow-hidden group"
      title={mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mode === "light" ? (
          <motion.div
            key="sun"
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Sun size={20} strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Moon size={20} strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors" />
    </motion.button>
  );
};

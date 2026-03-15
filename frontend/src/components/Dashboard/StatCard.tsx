import { motion } from "framer-motion";
import Skeleton from "@mui/material/Skeleton";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  accent: "emerald" | "rose" | "indigo" | "sky" | "amber";
  delta?: number | null;
  loading?: boolean;
  delayIndex?: number;
};

const accents = {
  emerald: "emerald-500",
  rose: "rose-500",
  indigo: "primary-600",
  sky: "sky-500",
  amber: "amber-500",
};

const iconAccents = {
  emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  rose: "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  indigo: "text-primary-600 bg-primary-50 border-primary-100 dark:text-primary-400 dark:bg-primary-500/10 dark:border-primary-500/20",
  sky: "text-sky-600 bg-sky-50 border-sky-100 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20",
  amber: "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
};

export const StatCard = ({ title, value, icon, accent, delta, loading = false, delayIndex = 0 }: StatCardProps) => {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const deltaDir = showDelta ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : "flat";
  const deltaText = showDelta ? `${Math.abs(Math.max(-999, Math.min(999, delta))).toFixed(0)}% vs last month` : "—";
  
  const deltaTone =
    deltaDir === "up"
      ? accent === "rose"
        ? "text-rose-600 dark:text-rose-400"
        : "text-emerald-600 dark:text-emerald-400"
      : deltaDir === "down"
        ? accent === "rose"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
        : "text-textSecondary dark:text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIndex * 0.1, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-border dark:border-white/5 bg-surface dark:bg-slate-900/40 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
    >
      <div className={`relative p-6 h-full flex flex-col justify-between`}>
        {/* Decorative circle */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-${accents[accent]}/10 to-transparent opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`} />
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 duration-500 ${iconAccents[accent]}`}>
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-black tracking-widest text-textSecondary dark:text-slate-500 uppercase">
              {title}
            </div>
            {loading ? (
              <Skeleton variant="text" sx={{ fontSize: "1.5rem", width: 100, bgcolor: "rgba(148,163,184,0.1)" }} />
            ) : (
              <div className="text-2xl font-black text-textHeadings dark:text-slate-50 truncate tracking-tight uppercase">
                {value}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50 dark:border-white/5">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/5 border border-border dark:border-white/5 ${deltaTone}`}>
            {showDelta ? (deltaDir === "up" ? "▲" : deltaDir === "down" ? "▼" : "•") : "•"} {deltaText}
           </span>
        </div>
      </div>
    </motion.div>
  );
};

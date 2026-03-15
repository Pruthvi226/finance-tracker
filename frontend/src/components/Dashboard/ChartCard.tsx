import type { ReactNode } from "react";
import { motion } from "framer-motion";

type ChartCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  delayIndex?: number;
};

export const ChartCard = ({ title, subtitle, children, delayIndex = 0 }: ChartCardProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIndex * 0.1, duration: 0.5, ease: "easeOut" }}
      className="col-span-12 lg:col-span-8 rounded-2xl border border-border dark:border-white/5 bg-surface dark:bg-slate-900/40 shadow-sm p-0 flex flex-col group relative overflow-hidden"
    >
      <div className="p-8 pb-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-textHeadings dark:text-slate-50 tracking-tight uppercase">{title}</h2>
          <p className="text-[10px] font-black tracking-widest text-textSecondary dark:text-slate-500 uppercase mt-1">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex-1 p-6 relative">
        {children}
      </div>
    </motion.section>
  );
};

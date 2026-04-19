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
      className="col-span-12 lg:col-span-8 glass-card p-0 flex flex-col relative overflow-hidden group"
    >
      <div className="p-8 pb-4 border-b border-border dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent dark:from-white/[0.02] dark:to-transparent">
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

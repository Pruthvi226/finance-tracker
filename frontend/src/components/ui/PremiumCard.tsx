import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface PremiumCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: 'white' | 'glass' | 'indigo' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'gradient' | 'obsidian';
  hoverEffect?: boolean;
  delayIndex?: number;
  glow?: boolean;
}

export const PremiumCard = ({ 
  children, 
  variant = 'white', 
  hoverEffect = true,
  delayIndex = 0,
  className = "",
  glow = false,
  ...props 
}: PremiumCardProps) => {
  const variantMap: Record<string, string> = {
    white: "bg-white dark:bg-slate-900/60",
    glass: "backdrop-blur-2xl bg-white/70 dark:bg-slate-950/40 border-white/20 dark:border-white/5",
    obsidian: "bg-slate-950/80 border-slate-800 shadow-2xl",
    indigo: "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-500/20",
    emerald: "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-500/20",
    rose: "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-500/20",
    amber: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-500/20",
    gradient: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border-none shadow-xl shadow-indigo-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: delayIndex * 0.08,
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={hoverEffect ? { 
        y: -6, 
        scale: 1.01,
        transition: { duration: 0.4, ease: "easeOut" }
      } : {}}
      className={`
        card-premium p-6
        ${variantMap[variant] || variantMap.white} 
        ${glow ? 'animate-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-50" />
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

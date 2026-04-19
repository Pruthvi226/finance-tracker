import React from "react";

interface PremiumBadgeProps {
  children: React.ReactNode;
  color?: 'emerald' | 'rose' | 'amber' | 'indigo' | 'cyan' | 'gray' | 'primary';
  pulse?: boolean;
  className?: string;
}

export const PremiumBadge = ({ 
  children, 
  color = 'gray', 
  pulse = false,
  className = ""
}: PremiumBadgeProps) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    primary: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20",
    gray: "bg-gray-50 text-gray-600 border-gray-100 dark:bg-white/5 dark:text-gray-400 dark:border-white/10",
  };

  return (
    <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${colors[color]} ${className}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            color === 'emerald' ? 'bg-emerald-400' : 
            color === 'rose' ? 'bg-rose-400' : 'bg-gray-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            color === 'emerald' ? 'bg-emerald-500' : 
            color === 'rose' ? 'bg-rose-500' : 'bg-gray-500'
          }`}></span>
        </span>
      )}
      {children}
    </div>
  );
};

import React from "react";

interface PremiumBadgeProps {
  children: React.ReactNode;
  color?: 'emerald' | 'rose' | 'amber' | 'indigo' | 'cyan' | 'gray' | 'primary' | 'violet';
  pulse?: boolean;
  className?: string;
  variant?: 'solid' | 'outline' | 'neon';
}

export const PremiumBadge = ({ 
  children, 
  color = 'gray', 
  pulse = false,
  className = "",
  variant = 'solid'
}: PremiumBadgeProps) => {
  const baseColors: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    violet: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    gray: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    primary: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  };

  const pulseColors: Record<string, string> = {
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    gray: "bg-slate-500",
    primary: "bg-indigo-400",
  };

  return (
    <div 
      className={`
        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
        flex items-center gap-2 transition-all duration-500 
        ${baseColors[color]}
        ${variant === 'neon' ? 'shadow-[0_0_10px_rgba(0,0,0,0.1)] !border-opacity-50' : ''}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[color]}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseColors[color]}`}></span>
        </span>
      )}
      {children}
    </div>
  );
};

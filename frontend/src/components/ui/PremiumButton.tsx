import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass' | 'neon';
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = "",
  ...props 
}: PremiumButtonProps) => {
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40",
    secondary: "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5",
    outline: "bg-transparent border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10",
    glass: "backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20",
    neon: "bg-black text-white border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-[12px] font-bold rounded-xl",
    md: "px-6 py-3 text-[14px] font-bold rounded-2xl",
    lg: "px-8 py-4 text-[16px] font-black rounded-2xl",
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        inline-flex items-center justify-center gap-2 
        transition-all duration-300 uppercase tracking-wider
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

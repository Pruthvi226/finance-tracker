import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
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
    primary: "bg-gradient-to-r from-primary-500 to-[#8B5CF6] text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.35)]",
    secondary: "bg-white dark:bg-[#111827] text-textPrimary dark:text-white border-gray-100 dark:border-white/10 shadow-sm hover:bg-gray-50",
    ghost: "bg-transparent text-textSecondary hover:bg-gray-100 dark:hover:bg-white/5 border-transparent",
    outline: "bg-transparent border-primary-500 text-primary-600 hover:bg-primary-50",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-7 py-3.5 text-sm",
    lg: "px-10 py-5 text-base",
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-[16px] font-bold border transition-all duration-300 flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

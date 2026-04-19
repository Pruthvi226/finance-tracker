import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface PremiumCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: 'white' | 'glass' | 'indigo' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'gradient';
  hoverEffect?: boolean;
  delayIndex?: number;
}

export const PremiumCard = ({ 
  children, 
  variant = 'white', 
  hoverEffect = true,
  delayIndex = 0,
  className = "",
  ...props 
}: PremiumCardProps) => {
  const variantClasses = {
    white: "bg-white dark:bg-[#111827] border-gray-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    glass: "bg-white/70 dark:bg-white/5 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]",
    indigo: "bg-[#EEF2FF] border-[#E0E7FF] dark:bg-indigo-500/10 dark:border-indigo-500/20 shadow-none",
    blue: "bg-[#EFF6FF] border-[#DBEAFE] dark:bg-blue-500/10 dark:border-blue-500/20 shadow-none",
    cyan: "bg-[#ECFEFF] border-[#CFFAFE] dark:bg-cyan-500/10 dark:border-cyan-500/20 shadow-none",
    emerald: "bg-[#ECFDF5] border-[#D1FAE5] dark:bg-emerald-500/10 dark:border-emerald-500/20 shadow-none",
    amber: "bg-[#FFFBEB] border-[#FEF3C7] dark:bg-amber-500/10 dark:border-amber-500/20 shadow-none",
    rose: "bg-[#FFF1F2] border-[#FFE4E6] dark:bg-rose-500/10 dark:border-rose-500/20 shadow-none",
    gradient: "gradient-card-primary border-white/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: delayIndex * 0.1,
        duration: 0.8, 
        ease: [0.23, 1, 0.32, 1] 
      }}
      whileHover={hoverEffect ? { y: -8, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" } : {}}
      className={`rounded-[24px] border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

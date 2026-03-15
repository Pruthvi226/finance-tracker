import { motion } from "framer-motion";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="relative flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 shadow-lg shadow-emerald-500/30 border border-white/20 overflow-hidden"
      >
        {/* Animated sheen effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent w-[200%] h-full pointer-events-none"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
        />
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-6 h-6 z-10 text-white drop-shadow-md"
        >
          {/* F shape combined with upward arrow */}
          <path 
            d="M12 30V10C12 8.9 12.9 8 14 8h12a2 2 0 012 2v2a2 2 0 01-2 2H16v4h8a2 2 0 012 2v2a2 2 0 01-2 2h-8v6a2 2 0 01-2 2h-2z" 
            fill="currentColor"
          />
          <path 
            d="M32 16L24 8v5c-4 0-8 3-8 8" 
            stroke="url(#growthGradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white opacity-90 drop-shadow-sm"
          />
          <defs>
            <linearGradient id="growthGradient" x1="16" y1="21" x2="32" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.4" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight">
            Finova
          </span>
        </div>
      )}
    </div>
  );
};

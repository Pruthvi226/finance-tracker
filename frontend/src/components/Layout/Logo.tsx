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
        className="relative flex items-center justify-center h-10 w-10 shrink-0 rounded-[14px] bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 border border-white/20 overflow-hidden group"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent w-[200%] h-full pointer-events-none"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
        />
        
        {/* Modern Symbol */}
        <div className="relative z-10 flex flex-col gap-0.5">
          <div className="w-4 h-1 bg-white rounded-full opacity-100 group-hover:w-5 transition-all" />
          <div className="w-5 h-1 bg-indigo-200 rounded-full" />
          <div className="w-3 h-1 bg-white/60 rounded-full group-hover:w-4 transition-all" />
        </div>
      </motion.div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-black text-[22px] leading-tight text-slate-900 dark:text-white tracking-widest uppercase">
            Fin<span className="text-indigo-600 dark:text-indigo-400">ova</span>
          </span>
        </div>
      )}
    </div>
  );
};

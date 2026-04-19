import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { GlobalFAB } from "../GlobalFAB";
import AiMoneyAssistant from "../AiMoneyAssistant";
import { CommandCenter } from "../ui/CommandCenter";
import { useSovereign } from "../../hooks/useSovereign";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { persona } = useSovereign();

  return (
    <div 
      className="min-h-screen flex flex-col relative w-full overflow-hidden transition-colors duration-1000 bg-slate-50 dark:bg-[#020617]"
      style={{ '--persona-color': persona.color, '--persona-glow': persona.glow } as any}
    >
      {/* Hyper-Modern Dynamic Background - Persona Driven */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            backgroundColor: persona.color,
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ 
            backgroundColor: persona.color,
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[140px]" 
        />
        
        {/* Animated Mesh Noise */}
        <div className="absolute inset-0 dark:bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>

      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      
      <div className="flex flex-1 z-10 relative">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <main className="flex-1 px-4 md:px-8 py-6 h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CommandCenter />
      <AiMoneyAssistant />
      <GlobalFAB />
    </div>
  );
};

export default Layout;

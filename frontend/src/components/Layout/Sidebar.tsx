import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  BarChart3, 
  Target, 
  Settings, 
  PieChart,
  History,
  Bot,
  Zap,
  Sparkles,
  ShieldCheck,
  Radio
} from "lucide-react";
import { useSovereign } from "../../hooks/useSovereign";

const navItems = [
  { to: "/", label: "Home Dashboard", icon: LayoutDashboard },
  { to: "/war-room", label: "Financial Health", icon: Radio, neon: true },
  { to: "/transactions", label: "Recent Spending", icon: ReceiptText },
  { to: "/analytics", label: "Visual Reports", icon: PieChart },
  { to: "/accounts", label: "My Accounts", icon: Wallet },
  { to: "/budget", label: "Monthly Budgets", icon: BarChart3 },
  { to: "/bills", label: "Monthly Bills", icon: History },
  { to: "/recurring", label: "Recurrence Lab", icon: Zap },
  { to: "/goals", label: "Savings Goals", icon: Target },
  { to: "/insights", label: "AI Advisor", icon: Bot },
  { to: "/settings", label: "App Settings", icon: Settings },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { persona } = useSovereign();

  const NavContent = () => (
    <nav className="flex-1 px-4 py-8 space-y-2">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 px-4 flex items-center justify-between">
         <span>Main Navigation</span>
         <div className="h-1 w-1 rounded-full bg-slate-400" />
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-[11px] transition-all duration-500 relative group truncate ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-indigo-500"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute inset-0 rounded-2xl z-0 shadow-lg"
                    style={{ 
                      background: item.neon ? `linear-gradient(to r, ${persona.color}, ${persona.color}dd)` : 'linear-gradient(to r, #4f46e5, #7c3aed)',
                      boxShadow: `0 8px 20px ${item.neon ? persona.glow : 'rgba(79, 70, 229, 0.2)'}`
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  />
                )}
                <div className={`relative z-10 flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-white/10" : "bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-500/10"
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 3 : 2.5} className={isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-500"} />
                </div>
                <span className="relative z-10 tracking-[0.1em] uppercase">
                  {item.label}
                </span>

                {item.neon && !isActive && (
                   <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </motion.div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:relative md:translate-x-0 outline-none
          px-4 py-6
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div 
          className="h-full flex flex-col bg-white/50 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[40px] border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-2xl transition-colors duration-1000"
          style={{ borderColor: persona.color + '22' }}
        >
          <NavContent />
          
          <div className="p-8 mt-auto">
            <div 
              className="rounded-[32px] p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 relative overflow-hidden group"
              style={{ borderColor: persona.color + '33' }}
            >
              <div 
                className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl transition-all group-hover:scale-150 opacity-20"
                style={{ backgroundColor: persona.color }}
              />
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: persona.color }}>
                      {persona.type === 'SAVER' && <ShieldCheck size={16} strokeWidth={3} />}
                      {persona.type === 'SPENDER' && <Zap size={16} fill="white" />}
                      {persona.type === 'INVESTOR' && <Sparkles size={16} strokeWidth={3} />}
                      {persona.type === 'BALANCED' && <ShieldCheck size={16} strokeWidth={3} />}
                    </div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-slate-800 dark:text-white uppercase">AI Status: Active</p>
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-widest">Your smart advisor is ready to help you save.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

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
  Bell,
  User,
  History
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/budget", label: "Budgets", icon: BarChart3 },
  { to: "/recurring", label: "Reports", icon: History },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const NavContent = () => (
    <nav className="flex-1 px-4 py-8 space-y-3">
      <div className="text-[11px] font-bold text-textMuted uppercase tracking-[0.2em] mb-6 px-4">Main Menu</div>
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
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-[18px] font-semibold text-[14px] transition-all duration-500 relative group ${
                  isActive
                    ? "text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)]"
                    : "text-textSecondary hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-[18px] bg-gradient-to-r from-primary-500 to-[#8B5CF6] z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center justify-center p-2 rounded-[12px] transition-colors duration-300 ${
                  isActive ? "bg-white/20" : "bg-gray-100/80 dark:bg-white/5 group-hover:bg-primary-100/50"
                }`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className="relative z-10 tracking-tight">{item.label}</span>
                {!isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
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
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] md:relative md:translate-x-0 outline-none
          border-r border-gray-100 dark:border-white/5 md:bg-transparent md:border-none md:shadow-none bg-white 
          min-h-screen pt-[80px] md:pt-6 px-4
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full flex flex-col md:glass-card md:h-[calc(100vh-48px)] overflow-hidden">
          <NavContent />
          
          <div className="p-6 mt-auto">
            <div className="glass-card p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-white/5 dark:to-white/5 border-none">
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">PRO PLAN</p>
              <p className="text-[10px] text-textSecondary mb-3">Get advanced analytics and insights.</p>
              <button className="w-full py-2 bg-white dark:bg-white/10 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;



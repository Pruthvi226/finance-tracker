import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import RepeatOneIcon from "@mui/icons-material/RepeatOne";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";

const navItems = [
  { to: "/", label: "Dashboard", icon: DashboardIcon },
  { to: "/transactions", label: "Transactions", icon: ReceiptLongIcon },
  { to: "/accounts", label: "Accounts", icon: AccountBalanceWalletIcon },
  { to: "/recurring", label: "Recurring", icon: RepeatOneIcon },
  { to: "/budget", label: "Budget", icon: AccountBalanceWalletIcon },
  { to: "/goals", label: "Goals", icon: EmojiEventsIcon },
  { to: "/analytics", label: "Analytics", icon: AutoGraphIcon },
  { to: "/insights", label: "AI Assistant", icon: SmartToyIcon },
  { to: "/notifications", label: "Alerts", icon: NotificationsIcon },
  { to: "/profile", label: "Profile", icon: PersonIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const NavContent = () => (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 ${
                isActive
                  ? "bg-primary-50 text-primary-600 shadow-sm border border-primary-100/50"
                  : "text-textSecondary dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-textHeadings dark:hover:text-slate-50"
              }`
            }
          >
            <Icon sx={{ fontSize: 22 }} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative md:translate-x-0 bg-white dark:bg-slate-950/40 border-r border-border dark:border-white/5 shadow-xl md:shadow-none min-h-[calc(100vh-64px)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <NavContent />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import { useThemeMode } from "../../context/ThemeContext";
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { 
  Search, 
  Bell, 
  Settings, 
  Moon, 
  Sun, 
  Menu,
  LogOut
} from "lucide-react";

type NavbarProps = {
  onMenuClick?: () => void;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-[60] px-4 md:px-8 py-4 pointer-events-none">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-4 px-6 py-2.5 glass-card pointer-events-auto border-white/40 dark:border-white/5 bg-white/70 dark:bg-[#0B0F19]/80 shadow-[0_15px_35px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-textSecondary hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <Menu size={20} />
          </button>
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="group-hover:scale-110 transition-transform duration-500">
              <Logo />
            </div>
            <span className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-[#8B5CF6] hidden sm:block tracking-tight">
              Finova
            </span>
          </Link>
        </div>

        {/* Center: Premium Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md items-center bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-400 transition-all group">
          <Search size={18} className="text-textMuted group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="bg-transparent border-none outline-none w-full text-[13px] px-3 text-textPrimary dark:text-slate-200 placeholder:text-textMuted dark:placeholder:text-slate-500 font-medium"
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-sm">
            <span className="text-[10px] font-bold text-textMuted">⌘</span>
            <span className="text-[10px] font-bold text-textMuted">K</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 mr-2 px-1 py-1 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <button 
              onClick={toggleMode}
              className={`p-2 rounded-xl transition-all ${mode === 'light' ? 'bg-white shadow-sm text-primary-500' : 'text-textMuted hover:text-textPrimary'}`}
            >
              <Sun size={16} />
            </button>
            <button 
              onClick={toggleMode}
              className={`p-2 rounded-xl transition-all ${mode === 'dark' ? 'bg-white/10 shadow-sm text-primary-400' : 'text-textMuted hover:text-textPrimary'}`}
            >
              <Moon size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 mr-1">
            <button className="relative p-2.5 text-textSecondary hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-white/5 rounded-xl transition-all group">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-125 transition-transform"></span>
            </button>
            
            <button 
              onClick={() => navigate('/settings')}
              className="p-2.5 text-textSecondary hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <Settings size={20} strokeWidth={2} />
            </button>
          </div>
          
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          
          <div className="flex items-center gap-1">
            <motion.div 
              whileHover={{ y: -1 }}
              className="flex items-center gap-3 pl-1 pr-2 py-1 cursor-pointer group rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              onClick={() => navigate('/settings')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-[#8B5CF6] flex items-center justify-center text-sm font-bold text-white shadow-[0_8px_20px_rgba(99,102,241,0.2)] group-hover:shadow-[0_12px_25px_rgba(99,102,241,0.3)] transition-all duration-500">
                PR
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-[13px] font-bold text-textPrimary dark:text-white">Pruthviraj</span>
                <span className="text-[10px] font-medium text-textMuted mt-1">Personal Account</span>
              </div>
            </motion.div>

            <button 
              onClick={handleLogout}
              className="p-2.5 text-textMuted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

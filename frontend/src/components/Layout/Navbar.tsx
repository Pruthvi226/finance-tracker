import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "../../context/ThemeContext";
import MenuIcon from "@mui/icons-material/Menu";
import { Logo } from "./Logo";

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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: mode === 'dark' ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(229,231,235,1)'}`,
        boxShadow: mode === 'dark' ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "96rem",
          width: "100%",
          mx: "auto",
          px: { xs: 2, md: 4 },
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            className="md:hidden text-textPrimary dark:text-slate-300"
          >
            <MenuIcon />
          </IconButton>
          
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Search Placeholder */}
          <div className="hidden md:flex items-center bg-gray-50 dark:bg-slate-900/50 border border-border dark:border-white/5 rounded-full px-4 py-1.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
            <svg className="w-4 h-4 text-textMuted dark:text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="bg-transparent border-none outline-none text-xs text-textPrimary dark:text-slate-200 placeholder:text-textMuted/60 dark:placeholder:text-slate-500 w-48 font-black uppercase tracking-widest"
            />
          </div>

          <div className="flex items-center gap-1 border-l border-gray-200 dark:border-white/10 pl-4 ml-2">
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="small" className="relative text-textSecondary dark:text-slate-300 hover:text-primary-600 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
              </IconButton>
            </Tooltip>
            
            <Tooltip title={mode === "dark" ? "Light theme" : "Dark theme"}>
              <IconButton color="inherit" onClick={toggleMode} size="small" className="text-textSecondary dark:text-slate-300 hover:text-primary-600 dark:hover:text-white transition-colors">
                {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account menu">
              <div className="cursor-pointer ml-2 flex items-center gap-3 border border-border dark:border-white/10 rounded-xl pl-1 pr-4 py-1.5 bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all" onClick={handleLogout}>
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-primary-600/20 uppercase">
                  P
                </div>
                <span className="text-[10px] font-black text-textHeadings dark:text-slate-300 uppercase tracking-widest">Profile</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Menu,
  LogOut,
  Zap,
  ShieldCheck,
  Activity,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useSovereign } from "../../hooks/useSovereign";

type NavbarProps = {
  onMenuClick?: () => void;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { persona, score } = useSovereign();

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(3);
  const [notifications] = useState([
    { id: 1, text: "Received ₹75,000 Salary", time: "2h ago", type: 'income' },
    { id: 2, text: "Rent payment successful", time: "5h ago", type: 'expense' },
    { id: 3, text: "Shopping budget alert (92%)", time: "1d ago", type: 'alert' },
  ]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-[60] px-4 md:px-8 py-5 pointer-events-none">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between pointer-events-auto">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <Menu size={20} />
          </button>
          
          <Link to="/" className="group">
            <Logo showText />
          </Link>
        </div>

        {/* Center: AI Assistant Bar */}
        <div className="hidden lg:flex flex-1 max-w-lg items-center justify-center mx-12">
           <motion.div 
             onClick={() => navigate('/war-room')}
             className="relative group cursor-pointer"
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
              <div 
                className="absolute inset-0 blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
                style={{ backgroundColor: persona.color }}
              />
              
              <div className="relative flex items-center gap-4 px-6 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-[28px] shadow-2xl backdrop-blur-xl">
                 <div className="relative h-10 w-10 shrink-0">
                    <motion.div 
                      animate={{ 
                        rotate: [0, 90, 180, 270, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-xl border-2 border-dashed border-indigo-500/30"
                      style={{ borderColor: persona.color + '44' }}
                    />
                    <div 
                      className="absolute inset-2 rounded-lg flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: persona.color + '22', color: persona.color }}
                    >
                       {persona.type === 'SAVER' && <ShieldCheck size={20} strokeWidth={2.5} />}
                       {persona.type === 'SPENDER' && <Zap size={20} fill="currentColor" />}
                       {persona.type === 'INVESTOR' && <Sparkles size={20} strokeWidth={2.5} />}
                       {persona.type === 'BALANCED' && <Activity size={20} strokeWidth={2.5} />}
                    </div>
                 </div>

                 <div className="hidden xl:block">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">SMART ADVISOR</p>
                    <div className="flex items-center gap-3">
                       <h4 className="text-[13px] font-black tracking-tight text-slate-900 dark:text-white uppercase">
                         {persona.title}
                       </h4>
                       <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                       <span className="text-[11px] font-black text-indigo-500" style={{ color: persona.color }}>
                         Score: {score}
                       </span>
                    </div>
                 </div>
                 
                 <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 ml-2" />
                 <ChevronDown size={14} className="text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
           </motion.div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <ThemeToggle />
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-all ${showNotifications ? 'bg-white dark:bg-white/10 text-indigo-600 shadow-sm' : ''}`}
                title="Notifications"
              >
                <Bell size={18} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse-fast"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                    className="absolute right-0 mt-4 w-72 card-premium !p-0 z-50 shadow-2xl overflow-hidden border-indigo-500/20"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alerts</h4>
                      <span className="text-[9px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-md uppercase">Recent</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/item border-b border-slate-100 dark:border-white/5 last:border-0">
                          <div className="flex items-start gap-4">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${n.type === 'income' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : n.type === 'expense' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-500'}`} />
                            <div className="flex-1">
                              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-none">{n.text}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
              title="Logout"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>

          <motion.div 
            whileHover={{ y: -1, scale: 1.02 }}
            className="flex items-center gap-3 pl-1 pr-1.5 py-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 cursor-pointer group transition-all"
            onClick={() => navigate('/settings')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-[12px] font-black text-white shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-all">
              PR
            </div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

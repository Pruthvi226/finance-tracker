import { useState, useEffect } from "react";
import api from "../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  CheckCheck, 
  Info, 
  AlertTriangle, 
  Clock, 
  MoreHorizontal, 
  Trash2, 
  BellOff 
} from "lucide-react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: 'INFO' | 'ALERT' | 'SUCCESS';
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications?pageNo=0&pageSize=20");
      setNotifications(res.data.content || []);
    } catch (error) {
      toast.error("Failed to sync signals");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error("Handshake failed");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("Signal matrix cleared");
    } catch (error) {
      toast.error("Action terminated by system");
    }
  };

  const getIcon = (title: string, isRead: boolean) => {
    const t = title.toLowerCase();
    if (t.includes('budget') || t.includes('limit') || t.includes('exceed')) 
      return <AlertTriangle size={18} className={isRead ? 'text-textMuted' : 'text-rose-500'} />;
    if (t.includes('success') || t.includes('complete') || t.includes('won')) 
      return <CheckCircle2 size={18} className={isRead ? 'text-textMuted' : 'text-emerald-500'} />;
    return <Info size={18} className={isRead ? 'text-textMuted' : 'text-primary-500'} />;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col gap-8 pb-12 items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
                Signal Feed
              </h1>
              {unreadCount > 0 && (
                <PremiumBadge color="rose" pulse>
                  {unreadCount} Active
                </PremiumBadge>
              )}
            </div>
            <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
              Synchronized intelligence stream of your financial ecosystem events.
            </p>
          </div>

          {unreadCount > 0 && (
            <PremiumButton 
              variant="outline"
              onClick={markAllAsRead}
              className="!border-gray-100 dark:!border-white/10 !bg-white/50 dark:!bg-white/5"
            >
              <CheckCheck size={18} />
              Acknowledge All
            </PremiumButton>
          )}
        </div>

        {/* Filters/Actions Bar */}
        <div className="flex items-center justify-between mb-6 px-4">
           <div className="flex items-center gap-6">
              <button className="text-xs font-black uppercase tracking-widest text-primary-600 border-b-2 border-primary-500 pb-1">All Signals</button>
              <button className="text-xs font-black uppercase tracking-widest text-textMuted hover:text-textPrimary transition-colors pb-1">Budgets</button>
              <button className="text-xs font-black uppercase tracking-widest text-textMuted hover:text-textPrimary transition-colors pb-1">System</button>
           </div>
           <button className="text-textMuted hover:text-textPrimary transition-colors">
              <MoreHorizontal size={20} />
           </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-[28px] bg-gray-100 dark:bg-white/5 animate-pulse" />
              ))
            ) : notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center flex flex-col items-center"
              >
                <div className="h-20 w-20 rounded-[32px] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                  <BellOff size={36} className="text-gray-200" />
                </div>
                <h3 className="text-lg font-black text-textHeadings dark:text-white uppercase tracking-tight">Signal Silence</h3>
                <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2 max-w-xs">
                    Your transmission buffer is currently empty. We'll notify you when system events occur.
                </p>
              </motion.div>
            ) : (
              notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: "circOut" }}
                >
                  <PremiumCard
                    variant="white"
                    className={`group !p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all border-none ${
                        !notif.isRead ? 'shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/10' : 'opacity-70'
                    }`}
                  >
                    <div className="flex gap-5 items-start">
                      <div className={`h-12 w-12 shrink-0 rounded-[18px] flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 duration-500 ${
                        !notif.isRead 
                          ? 'bg-primary-50 border-primary-100 text-primary-600 dark:bg-primary-500/10 dark:border-primary-500/20' 
                          : 'bg-gray-50 border-gray-100 text-textMuted dark:bg-white/5 dark:border-white/10'
                      }`}>
                         {getIcon(notif.title, notif.isRead)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h4 className={`text-base font-black tracking-tight uppercase ${notif.isRead ? 'text-textHeadings/60 dark:text-slate-400' : 'text-textHeadings dark:text-white'}`}>
                            {notif.title}
                           </h4>
                           {!notif.isRead && <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                        </div>
                        <p className={`text-[13px] font-medium leading-relaxed max-w-xl ${notif.isRead ? 'text-textMuted' : 'text-textSecondary dark:text-slate-300'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                           <Clock size={12} className="text-textMuted" />
                           <span className="text-[10px] font-black text-textMuted uppercase tracking-widest">
                             {format(new Date(notif.createdAt), "MMM dd • hh:mm a")}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!notif.isRead ? (
                        <PremiumButton 
                          onClick={() => markAsRead(notif.id)}
                          size="sm"
                          className="!rounded-xl !px-4 !py-2 !text-[10px] !bg-primary-500/10 !text-primary-600 hover:!bg-primary-500 hover:!text-white shadow-none"
                        >
                          Clear Signal
                        </PremiumButton>
                      ) : (
                         <button className="p-2 text-textMuted hover:text-rose-500 transition-colors">
                           <Trash2 size={16} />
                         </button>
                      )}
                    </div>
                  </PremiumCard>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

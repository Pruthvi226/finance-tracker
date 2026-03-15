import { useState, useEffect } from "react";
import api from "../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import DoneAllIcon from "@mui/icons-material/DoneAll";

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
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
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications read");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gradient">
            <NotificationsActiveIcon fontSize="large" className="text-primary-500" />
            Alerts & Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Stay updated with budget limits, recurring charges, and system messages.
          </p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <DoneAllIcon fontSize="small" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3 mt-8">
        {loading ? (
          <div className="glass-card p-8 text-center text-slate-400 animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
            <div className="p-4 bg-slate-900 rounded-full mb-4 opacity-50">
              <NotificationsActiveIcon fontSize="large" className="text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300">You're all caught up!</h3>
            <p className="text-slate-500 text-sm mt-1">No new alerts to show right now.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${
                  notif.isRead ? "border-l-slate-700 bg-slate-900/20" : "border-l-primary-500 bg-slate-800/60 shadow-primary-500/5"
                }`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {notif.isRead ? (
                      <CheckCircleIcon fontSize="small" className="text-slate-600" />
                    ) : (
                      <CircleIcon className="text-primary-500 animate-pulse" sx={{ fontSize: 14 }} />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-base font-medium ${notif.isRead ? "text-slate-300" : "text-white"}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-sm mt-1 mb-2 ${notif.isRead ? "text-slate-500" : "text-slate-300"}`}>
                      {notif.message}
                    </p>
                    <span className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                      {format(new Date(notif.createdAt), "MMM dd, hh:mm a")}
                    </span>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium self-end sm:self-center px-4 py-2 rounded-lg hover:bg-primary-500/10 transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

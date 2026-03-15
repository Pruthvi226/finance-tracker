import { useState } from "react";
import { motion } from "framer-motion";
import PersonIcon from "@mui/icons-material/Person";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SecurityIcon from "@mui/icons-material/Security";
import { useThemeMode } from "../context/ThemeContext";

const SettingsPage = () => {
  const { mode, toggleMode } = useThemeMode();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "User Profile", icon: PersonIcon },
    { id: "preferences", label: "Preferences", icon: SettingsBrightnessIcon },
    { id: "notifications", label: "Notifications", icon: NotificationsActiveIcon },
    { id: "security", label: "Security", icon: SecurityIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 text-textHeadings dark:text-slate-100 uppercase tracking-tight">
            <SettingsBrightnessIcon fontSize="large" className="text-primary-600" />
            Settings
          </h1>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">
            Manage your digital workspace
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 glass-card p-4 flex flex-col gap-2 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-left ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-100/50"
                    : "text-textSecondary dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-textHeadings dark:hover:text-slate-100"
                }`}
              >
                <Icon fontSize="small" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 glass-card p-8 min-h-[400px]"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-textHeadings dark:text-slate-100 border-b border-border dark:border-white/5 pb-4 uppercase tracking-tighter">User Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" className="input-field font-bold" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input type="email" className="input-field font-bold" defaultValue="john@example.com" />
                </div>
              </div>
              <div className="pt-4">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-textHeadings dark:text-slate-100 border-b border-border dark:border-white/5 pb-4 uppercase tracking-tighter">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Default Currency</label>
                  <select className="input-field appearance-none font-bold">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-2 uppercase tracking-wide">Theme Preference</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-textPrimary dark:text-slate-300 cursor-pointer font-bold">
                       <input type="radio" name="theme" checked={mode === 'light'} onChange={toggleMode} className="text-primary-600 focus:ring-primary-600 h-4 w-4" />
                      Light Mode
                    </label>
                    <label className="flex items-center gap-2 text-sm text-textPrimary dark:text-slate-300 cursor-pointer font-bold">
                      <input type="radio" name="theme" checked={mode === 'dark'} onChange={toggleMode} className="text-primary-600 focus:ring-primary-600 h-4 w-4" />
                      Dark Mode
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Language mapping</label>
                  <select className="input-field appearance-none font-bold">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button className="btn-primary">Save Preferences</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-textHeadings dark:text-slate-100 border-b border-border dark:border-white/5 pb-4 uppercase tracking-tighter">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/50 cursor-pointer transition-all hover:border-primary-600/30 hover:bg-white dark:hover:bg-slate-900/80 shadow-sm">
                  <div>
                    <div className="font-bold text-textPrimary dark:text-slate-200">Budget Alerts</div>
                    <div className="text-xs text-textMuted dark:text-slate-400">Receive alerts when you are close to exceeding your budget</div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-primary-600 rounded focus:ring-primary-600" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/50 cursor-pointer transition-all hover:border-primary-600/30 hover:bg-white dark:hover:bg-slate-900/80 shadow-sm">
                  <div>
                    <div className="font-bold text-textPrimary dark:text-slate-200">Monthly Summary Emails</div>
                    <div className="text-xs text-textMuted dark:text-slate-400">Get a summary of your financial activity every month</div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-primary-600 rounded focus:ring-primary-600" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/50 cursor-pointer transition-all hover:border-primary-600/30 hover:bg-white dark:hover:bg-slate-900/80 shadow-sm">
                  <div>
                    <div className="font-bold text-textPrimary dark:text-slate-200">Transaction Notifications</div>
                    <div className="text-xs text-textMuted dark:text-slate-400">Get notified for every new transaction</div>
                  </div>
                  <input type="checkbox" className="h-5 w-5 text-primary-600 rounded focus:ring-primary-600" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-textHeadings dark:text-slate-100 border-b border-border dark:border-white/5 pb-4 uppercase tracking-tighter">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Current Password</label>
                  <input type="password" className="input-field font-bold" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">New Password</label>
                    <input type="password" className="input-field font-bold" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <input type="password" className="input-field font-bold" placeholder="••••••••" />
                  </div>
                </div>
                <div className="pt-2">
                  <button className="btn-primary">Update Password</button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border dark:border-white/5">
                <h3 className="text-lg font-black text-textPrimary dark:text-slate-100 mb-2 uppercase tracking-tight">Active Sessions</h3>
                <p className="text-sm text-textMuted dark:text-slate-400 mb-4 font-bold">You are currently logged in on this device. You can log out from all other sessions if you notice suspicious activity.</p>
                <button className="px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl font-medium transition-colors">
                  Logout from all sessions
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;

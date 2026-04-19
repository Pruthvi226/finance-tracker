import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Save, 
  LogOut,
  Sparkles,
  CreditCard,
  Mail,
  Lock,
  Smartphone
} from "lucide-react";
import { useThemeMode } from "../context/ThemeContext";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import api from "../services/api";
import toast from "react-hot-toast";
import { useSettings } from "../context/SettingsContext";

type Profile = {
  id: number;
  name: string;
  email: string;
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User, description: "Your personal details" },
    { id: "preferences", label: "App Settings", icon: SettingsIcon, description: "Theme and localization" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Alerts and message settings" },
    { id: "security", label: "Security", icon: Shield, description: "Password and privacy settings" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get<Profile>("/users/me");
      const profileData = res.data;
      setProfile(profileData);
      setName(profileData.name);
      setEmail(profileData.email);
    } catch (err: any) {
      toast.error(err.message || "Couldn't load your profile, please refresh");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.put<Profile>("/users/me", { id: profile.id, name, email });
      setProfile(res.data);
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 items-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <PremiumBadge color="primary" className="mb-4">
             Finova Protocol v2.0
          </PremiumBadge>
          <h1 className="text-[36px] font-black tracking-tight text-textPrimary uppercase">
            Account Settings
          </h1>
          <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2">
            Customize your app experience and keep your profile updated.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <PremiumCard variant="white" className="!p-4 overflow-hidden">
              <div className="flex flex-col gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-500 group relative ${
                        isActive
                          ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20"
                          : "text-textSecondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-textPrimary"
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-colors ${
                        isActive ? "bg-white/20" : "bg-gray-100 dark:bg-white/10 group-hover:bg-primary-50"
                      }`}>
                        <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                         <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-textPrimary'}`}>{tab.label}</span>
                         <span className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-textMuted'}`}>{tab.description}</span>
                      </div>
                      {isActive && (
                        <motion.div layoutId="setting-tab-dot" className="absolute right-5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </PremiumCard>

            <PremiumCard variant="glass" className="!p-6 border-dashed">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Sparkles size={20} />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase text-textPrimary">Pro Status Active</h4>
                    <p className="text-[10px] font-bold text-textSecondary dark:text-slate-500 mt-0.5 uppercase tracking-widest leading-none">Renewal: Oct 2026</p>
                 </div>
              </div>
            </PremiumCard>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <PremiumCard variant="white" className="min-h-[550px] !p-10 flex flex-col">
                  {activeTab === "profile" && (
                    <div className="space-y-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 border border-primary-100 dark:border-primary-500/20 shadow-lg shadow-primary-500/5">
                           <User size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-textPrimary uppercase tracking-tight">My Profile</h2>
                          <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Update your personal information</p>
                        </div>
                      </div>

                      {loading ? (
                         <div className="space-y-6 animate-pulse mt-8">
                           <div className="h-24 bg-gray-50 dark:bg-white/5 rounded-3xl" />
                           <div className="h-24 bg-gray-50 dark:bg-white/5 rounded-3xl" />
                         </div>
                      ) : (
                        <form onSubmit={handleProfileSubmit} className="space-y-8 mt-4 flex-1 flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Display Name</label>
                                <div className="relative">
                                   <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                                   <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/5 transition-all" 
                                    placeholder="Enter your name"
                                   />
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Primary Email</label>
                                <div className="relative">
                                   <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                                   <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/5 transition-all" 
                                    placeholder="your@email.com"
                                   />
                                </div>
                             </div>
                          </div>

                          <div className="mt-auto pt-10">
                            <PremiumButton type="submit" className="w-full sm:w-auto !px-10 !py-4 shadow-xl shadow-primary-500/20" disabled={saving}>
                              <Save size={18} />
                               {saving ? "Updating..." : "Save My Details"}
                            </PremiumButton>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {activeTab === "preferences" && (
                    <div className="space-y-10">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-500/20">
                           <SettingsIcon size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-textPrimary uppercase tracking-tight">App Preferences</h2>
                          <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Customize how the app looks and feels</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                           <h3 className="text-sm font-black text-textPrimary uppercase tracking-tight flex items-center gap-2">
                             <Moon size={16} /> Appearance
                           </h3>
                            <div className="grid grid-cols-2 gap-6">
                               <button 
                                 onClick={() => {
                                   if (mode !== 'light') toggleMode();
                                   updateSettings({ theme: 'light' });
                                 }}
                                 className={`p-8 rounded-[32px] border-2 transition-all duration-500 flex flex-col items-center gap-4 group ${mode === 'light' ? 'border-primary-500 bg-primary-50/50 shadow-xl shadow-primary-500/10' : 'border-gray-100 dark:border-white/5 hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                               >
                                  <div className={`p-4 rounded-2xl transition-colors ${mode === 'light' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-textSecondary'}`}>
                                    <Sun size={28} />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className={`text-[13px] font-black uppercase tracking-tight ${mode === 'light' ? 'text-primary-600' : 'text-textSecondary'}`}>Solar White</span>
                                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">Light Theme</span>
                                  </div>
                               </button>
                               <button 
                                 onClick={() => {
                                   if (mode !== 'dark') toggleMode();
                                   updateSettings({ theme: 'dark' });
                                 }}
                                 className={`p-8 rounded-[32px] border-2 transition-all duration-500 flex flex-col items-center gap-4 group ${mode === 'dark' ? 'border-primary-500 bg-primary-500/10 shadow-xl shadow-primary-500/10' : 'border-gray-100 dark:border-white/5 hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                               >
                                  <div className={`p-4 rounded-2xl transition-colors ${mode === 'dark' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-textSecondary'}`}>
                                    <Moon size={28} />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className={`text-[13px] font-black uppercase tracking-tight ${mode === 'dark' ? 'text-primary-400' : 'text-textSecondary'}`}>Obsidian Dark</span>
                                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">Dark Theme</span>
                                  </div>
                               </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1 flex items-center gap-2">
                                <CreditCard size={12} /> Standard Currency
                              </label>
                              <select 
                                value={settings?.currency || 'USD'}
                                onChange={(e) => updateSettings({ currency: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-black outline-none appearance-none cursor-pointer"
                              >
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                               <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1 flex items-center gap-2">
                                <Globe size={12} /> Language
                               </label>
                              <select 
                                value={settings?.language || 'en'}
                                onChange={(e) => updateSettings({ language: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-black outline-none appearance-none cursor-pointer"
                              >
                                <option value="en">English (Global)</option>
                                <option value="hi">Hindi (India)</option>
                                <option value="es">Spanish (International)</option>
                              </select>
                           </div>
                        </div>
                      </div>

                      <div className="pt-6">
                        <PremiumButton className="w-full sm:w-auto !px-10 !py-4 shadow-xl">
                          <Save size={18} />
                           Save My Preferences
                        </PremiumButton>
                      </div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-100 dark:border-rose-500/20">
                           <Bell size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-textPrimary uppercase tracking-tight">Notifications</h2>
                          <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Manage your alerts</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { id: 'notificationsEnabled', title: 'Global In-App Alerts', desc: 'Real-time dashboard updates.' },
                          { id: 'emailAlertsEnabled', title: 'Email Protocol', desc: 'Detailed weekly reports and bill reminders.' },
                          { id: 'smsAlertsEnabled', title: 'SMS Direct Pin', desc: 'Critical due-date alerts via text.' },
                        ].map((notif) => (
                           <label key={notif.id} className="group flex items-center justify-between p-6 rounded-[28px] border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 cursor-pointer hover:border-primary-500/30 hover:bg-white transition-all duration-500">
                             <div className="flex-1">
                                <div className="font-black text-sm text-textPrimary uppercase tracking-tight group-hover:text-primary-600 transition-colors">{notif.title}</div>
                                <div className="text-xs font-medium text-textMuted mt-1">{notif.desc}</div>
                             </div>
                             <div 
                               onClick={() => updateSettings({ [notif.id]: !((settings as any)?.[notif.id]) })}
                               className={`w-12 h-6 rounded-full relative transition-colors duration-500 p-1 flex items-center ${(settings as any)?.[notif.id] ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/10'}`}
                             >
                                <motion.div 
                                  animate={{ x: (settings as any)?.[notif.id] ? 24 : 0 }}
                                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                                />
                             </div>
                           </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-10">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                           <Shield size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-textHeadings dark:text-white uppercase tracking-tight">Security</h2>
                          <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Manage your password and active devices</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                           <div className="space-y-3">
                               <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Current Password</label>
                              <div className="relative">
                                 <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                                 <input type="password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black outline-none" placeholder="••••••••" />
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">New Password</label>
                                <input type="password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-black outline-none" placeholder="••••••••" />
                             </div>
                             <div className="space-y-3">
                                 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Confirm Password</label>
                                <input type="password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-black outline-none" placeholder="••••••••" />
                             </div>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-white/10 mt-10">
                            <h3 className="text-sm font-black text-textPrimary uppercase tracking-tight mb-4 flex items-center gap-2">
                              <Smartphone size={16} /> Logged In Devices
                            </h3>
                           <div className="p-5 rounded-[24px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
                              <div className="flex gap-4 items-center">
                                 <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600">
                                    <Smartphone size={20} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase text-textPrimary">Current Device (You are signed in here)</p>
                                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">Windows OS • Bangalore, India</p>
                                 </div>
                              </div>
                              <PremiumBadge color="emerald">Trusted</PremiumBadge>
                           </div>
                           <button 
                            onClick={handleLogout}
                            className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 transition-colors"
                           >
                               <LogOut size={14} /> Log Out
                           </button>
                           <button className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-textMuted hover:text-rose-500 transition-colors">
                              <Shield size={14} /> Sign out on all other devices
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                </PremiumCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

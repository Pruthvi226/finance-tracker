import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PersonIcon from "@mui/icons-material/Person";

type Profile = {
  id: number;
  name: string;
  email: string;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Profile>("/users/me");
        setProfile(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.put<Profile>("/users/me", { id: profile.id, name, email });
      setProfile(res.data);
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-80 w-full glass-card"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card max-w-2xl mx-auto p-8 text-center">
        <p className="text-slate-400">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gradient">
          <span className="text-primary-500">⚙️</span> Profile Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account details and personal info.</p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10">
            <PersonIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Account info</h2>
            <p className="text-xs text-slate-400">Update your public name and login email.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto mt-2"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving Context...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

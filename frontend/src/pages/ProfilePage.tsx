import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import api from "../services/api";

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

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Profile>("/users/me");
      setProfile(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
    };
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const res = await api.put<Profile>("/users/me", { id: profile.id, name, email });
    setProfile(res.data);
    setSaving(false);
  };

  if (!profile) {
    return <p className="text-sm text-slate-400">Loading profile...</p>;
  }

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-semibold">Profile</h1>
      <form onSubmit={handleSubmit} className="card space-y-3">
        <div>
          <label className="text-xs text-slate-400">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-sm font-medium"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;


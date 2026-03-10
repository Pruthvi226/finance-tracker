import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import PersonIcon from "@mui/icons-material/Person";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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
      toast.success("Profile updated");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Profile
        </Typography>
        <Skeleton variant="rounded" height={280} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Unable to load profile. Please try again.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account details
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <PersonIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Account info
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                size="small"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ alignSelf: "flex-start", mt: 1 }}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfilePage;

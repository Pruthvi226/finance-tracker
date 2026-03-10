import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion } from "framer-motion";
import { useThemeMode } from "../../context/ThemeContext";

const Navbar = () => {
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
        backgroundColor: "rgba(15,23,42,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(148,163,184,0.25)",
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
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/40"
          >
            FT
          </motion.div>
          <div className="flex flex-col">
            <Typography variant="subtitle1" className="font-semibold leading-tight text-slate-100">
              Finance Tracker
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Personal fintech dashboard
            </Typography>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton color="inherit" onClick={toggleMode} size="small">
              {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Sign out">
            <IconButton
              color="inherit"
              onClick={handleLogout}
              size="small"
              sx={{
                ml: 1,
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


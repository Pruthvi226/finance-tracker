import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <Link to="/" className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
          FT
        </span>
        <div>
          <p className="font-semibold text-slate-100">Finance Tracker</p>
          <p className="text-xs text-slate-400">Personal fintech dashboard</p>
        </div>
      </Link>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-200 hover:bg-slate-800"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;


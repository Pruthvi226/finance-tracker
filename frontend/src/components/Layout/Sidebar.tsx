import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/income", label: "Income" },
  { to: "/expenses", label: "Expenses" },
  { to: "/budget", label: "Budget" },
  { to: "/analytics", label: "Analytics" },
  { to: "/profile", label: "Profile" },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/80">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;


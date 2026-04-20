import { Menu, Moon, Sun, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/my-courses", label: "My Courses" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/quiz", label: "Quiz" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-2 z-40 mx-auto mt-2 w-[min(1120px,95%)] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <NavLink to="/" className="text-lg font-semibold tracking-wide text-cyan-300">EduAI</NavLink>
        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1 text-sm ${isActive ? "bg-cyan-500/20 text-cyan-200" : "text-slate-200"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button onClick={toggleTheme} className="rounded-lg border border-white/20 p-2">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-sm">
              <img src={user.avatar} alt={user.fullName} className="h-6 w-6 rounded-full" />
              Logout {user.fullName}
            </button>
          ) : (
            <NavLink to="/login" className="rounded-lg border border-white/20 px-3 py-1 text-sm">
              <UserCircle2 size={16} className="inline" /> Login
            </NavLink>
          )}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="block rounded-md border border-white/10 px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <button onClick={toggleTheme} className="block w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm">
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </button>
          {user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="block w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm"
            >
              Logout {user.fullName}
            </button>
          ) : (
            <NavLink
              to="/login"
              className="block rounded-md border border-white/10 px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              Login
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}

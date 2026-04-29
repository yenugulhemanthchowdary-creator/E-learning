import { Menu, Moon, Sun, UserCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/quiz", label: "Quiz" },
];

const privateLinks = [
  { to: "/my-courses", label: "My Courses" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ai-tutor", label: "AI Tutor" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const visibleLinks = user 
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/my-courses", label: "My Courses" },
        { to: "/courses", label: "Courses" },
        { to: "/quiz", label: "Quiz" },
        { to: "/ai-tutor", label: "AI Tutor" },
      ]
    : [{ to: "/", label: "Home" }];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="ui-panel sticky top-2 z-40 mx-auto mt-2 w-[min(1120px,95%)] rounded-2xl px-4 py-3">
      <div className="relative flex items-center justify-between gap-3">
        <NavLink to="/" className="text-lg font-semibold tracking-wide text-primary-300">EduAI</NavLink>
        <nav className="hidden items-center gap-4 md:flex" aria-label="Primary navigation">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1 text-sm transition-colors ${isActive ? "bg-primary-500/20 text-primary-200" : "text-slate-300 hover:text-slate-100"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={toggleTheme} className="ui-btn-secondary rounded-lg p-2" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="ui-btn-secondary flex items-center gap-2 rounded-lg px-3 py-1 text-sm"
              aria-label={`Log out ${user.fullName}`}
            >
              <img src={user.avatar} alt={user.fullName} className="h-6 w-6 rounded-full" />
              Logout {user.fullName}
            </button>
          ) : (
            <NavLink to="/login" className="ui-btn-secondary rounded-lg px-3 py-1 text-sm" aria-label="Login">
              <UserCircle2 size={16} className="inline" /> Login
            </NavLink>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-900/70 text-slate-200 transition hover:bg-slate-800 md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div id="mobile-navigation" className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-xl md:hidden">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="ui-btn-secondary block rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="ui-btn-secondary block w-full rounded-md px-3 py-2 text-left text-sm"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
                navigate("/");
              }}
              className="ui-btn-secondary block w-full rounded-md px-3 py-2 text-left text-sm"
              aria-label={`Log out ${user.fullName}`}
            >
              Logout {user.fullName}
            </button>
          ) : (
            <NavLink
              to="/login"
              className="ui-btn-secondary block rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
              aria-label="Login"
            >
              Login
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}

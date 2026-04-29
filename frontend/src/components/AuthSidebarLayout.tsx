import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Radar,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-courses", label: "My Courses", icon: BookOpen },
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/quiz", label: "Quiz", icon: Sparkles },
  { to: "/ai-tutor", label: "AI Tutor", icon: Radar },
];

export function AuthSidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate("/login");
  };

  const renderSidebar = (mobile = false) => (
    <aside
      className={`${mobile ? "w-full max-w-[320px] rounded-3xl" : "hidden md:flex md:w-[240px] min-h-screen border-r"} flex-col justify-between border-white/8 bg-[rgba(255,255,255,0.03)]`}
    >
      <div className="flex h-full flex-col gap-6 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7c3aed]/30 bg-[#7c3aed]/15 text-[#c4b5fd] shadow-[0_0_40px_rgba(124,58,237,0.35)]">
            <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">EduAI</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Student Hub</p>
          </div>
        </div>

        <nav className="space-y-2" aria-label="Primary sidebar navigation">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#7c3aed] text-white shadow-[0_10px_35px_rgba(124,58,237,0.35)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-[#7c3aed]/35"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7c3aed]/20 text-[#d8b4fe]">
                  <span className="text-sm font-semibold">U</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{user?.fullName ?? "Guest User"}</p>
                <p className="truncate text-sm text-slate-400">{user?.email ?? "Sign in for full access"}</p>
              </div>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-[#7c3aed]/35 hover:bg-[#7c3aed]/15 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={closeMobile}
              className="block rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-[#7c3aed]/35 hover:bg-[#7c3aed]/15 hover:text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7c3aed]/25 blur-3xl" />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Close navigation drawer"
            onClick={closeMobile}
          />
          <div className="absolute left-4 top-4 bottom-4 w-[calc(100%-2rem)] max-w-[320px]">{renderSidebar(true)}</div>
        </div>
      )}

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] overflow-hidden border border-white/8 bg-[rgba(255,255,255,0.03)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        {renderSidebar()}
        <main className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation drawer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

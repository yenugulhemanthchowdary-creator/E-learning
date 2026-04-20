import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("header", { className: "sticky top-2 z-40 mx-auto mt-2 w-[min(1120px,95%)] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(NavLink, { to: "/", className: "text-lg font-semibold tracking-wide text-cyan-300", children: "EduAI" }), _jsx("nav", { className: "hidden items-center gap-4 md:flex", children: links.map((link) => (_jsx(NavLink, { to: link.to, className: ({ isActive }) => `rounded-lg px-3 py-1 text-sm ${isActive ? "bg-cyan-500/20 text-cyan-200" : "text-slate-200"}`, children: link.label }, link.to))) }), _jsxs("div", { className: "hidden items-center gap-2 md:flex", children: [_jsx("button", { onClick: toggleTheme, className: "rounded-lg border border-white/20 p-2", children: theme === "dark" ? _jsx(Sun, { size: 16 }) : _jsx(Moon, { size: 16 }) }), user ? (_jsxs("button", { onClick: logout, className: "flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-sm", children: [_jsx("img", { src: user.avatar, alt: user.fullName, className: "h-6 w-6 rounded-full" }), "Logout ", user.fullName] })) : (_jsxs(NavLink, { to: "/login", className: "rounded-lg border border-white/20 px-3 py-1 text-sm", children: [_jsx(UserCircle2, { size: 16, className: "inline" }), " Login"] }))] }), _jsx("button", { onClick: () => setOpen((v) => !v), className: "md:hidden", children: open ? _jsx(X, {}) : _jsx(Menu, {}) })] }), open && (_jsxs("div", { className: "mt-3 space-y-2 md:hidden", children: [links.map((link) => (_jsx(NavLink, { to: link.to, className: "block rounded-md border border-white/10 px-3 py-2 text-sm", onClick: () => setOpen(false), children: link.label }, link.to))), _jsxs("button", { onClick: toggleTheme, className: "block w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm", children: ["Switch to ", theme === "dark" ? "light" : "dark", " mode"] }), user ? (_jsxs("button", { onClick: () => {
                            logout();
                            setOpen(false);
                        }, className: "block w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm", children: ["Logout ", user.fullName] })) : (_jsx(NavLink, { to: "/login", className: "block rounded-md border border-white/10 px-3 py-2 text-sm", onClick: () => setOpen(false), children: "Login" }))] }))] }));
}

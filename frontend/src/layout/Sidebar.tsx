import { Home, Inbox, BookOpen, CheckSquare, Users, Settings, LogOut } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/inbox", label: "Inbox", icon: <Inbox size={20} /> },
  { to: "/lessons", label: "Lesson", icon: <BookOpen size={20} /> },
  { to: "/tasks", label: "Task", icon: <CheckSquare size={20} /> },
  { to: "/groups", label: "Group", icon: <Users size={20} /> },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col h-full py-8 px-6">
      <div className="mb-10 text-2xl font-bold tracking-tight text-indigo-600">COURSE</div>
      <div className="flex-1">
        <div className="mb-6 text-xs font-semibold text-gray-400 uppercase">Overview</div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-10">
        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase">Settings</div>
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100">
          <Settings size={20} /> Settings
        </NavLink>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 w-full mt-2">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </nav>
  );
}

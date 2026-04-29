import React from "react";

export default function AppShell({ sidebar, rightbar, children }: {
  sidebar: React.ReactNode;
  rightbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm z-20">
        {sidebar}
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-6 overflow-y-auto">
        {children}
      </main>
      {/* Rightbar */}
      {rightbar && (
        <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-gray-200 shadow-sm z-10">
          {rightbar}
        </aside>
      )}
    </div>
  );
}

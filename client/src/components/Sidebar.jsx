// File: src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ArchiveBoxIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { label: "Dashboard",       path: "/",             icon: HomeIcon }, // Changed to "/" to match App.jsx
  { label: "Stock In",        path: "/stock-in",     icon: ArrowDownTrayIcon },
  { label: "Stock Out",       path: "/stock-out",    icon: ArrowUpTrayIcon },
  { label: "Inventory",       path: "/inventory",    icon: ArchiveBoxIcon },
  { label: "Suppliers",       path: "/suppliers",    icon: TruckIcon },
  { label: "Transactions",    path: "/transactions", icon: ArrowsRightLeftIcon },
  { label: "Reports",         path: "/reports",      icon: ChartBarIcon },
  { label: "Staff & Users",   path: "/users",        icon: UsersIcon },
];

const Sidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  // Read real user info saved at login
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    // ✨ FIX: Changed 'min-h-screen' to 'h-screen sticky top-0'
    <div className="w-64 bg-white flex flex-col h-screen sticky top-0 shadow-lg print:hidden flex-shrink-0">

      {/* ── Brand ── */}
      <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <ArchiveBoxIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-gray-800">
            Invent<span className="text-orange-500">IQ</span>
          </span>
        </div>
      </div>

      {/* ── User Badge ── */}
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
          Logged in as
        </p>
        <p className="text-sm font-semibold text-gray-700 truncate">
          {user.name || "Admin"}
        </p>
        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium border border-orange-100">
          {user.role || "Admin"}
        </span>
      </div>

      {/* ── Navigation ── */}
      {/* 'overflow-y-auto' allows the links to scroll if your screen is really small, but keeps the top and bottom sections pinned! */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive(path)
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
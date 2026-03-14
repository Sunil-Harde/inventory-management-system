// File: src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ArchiveBoxIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowDownTrayIcon, // ✨ Added for Stock In
  ArrowUpTrayIcon    // ✨ Added for Stock Out
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const location = useLocation();

  const navStyles = (path) => {
    if (location.pathname === path) {
      return "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md cursor-pointer font-medium";
    } else {
      return "flex items-center gap-3 text-gray-600 font-bold hover:text-blue-600 px-4 py-2 cursor-pointer transition";
    }
  };

  return (
    // ✨ ADDED 'print:hidden' so the sidebar disappears when you print receipts!
    <div className="w-64 bg-white px-6 py-10 shadow-lg min-h-screen print:hidden">

      {/* Top Welcome */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 tracking-widest uppercase font-bold">
          Welcome, Admin
        </p>
      </div>

      {/* Menu */}
      <ul className="space-y-4">

        <li>
          <Link to="/" className={navStyles("/")}>
            <HomeIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
        </li>

        {/* ✨ ADDED STOCK IN */}
        <li>
          <Link to="/stock-in" className={navStyles("/stock-in")}>
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Stock In (Receive)</span>
          </Link>
        </li>

        {/* ✨ FIXED STOCK OUT ICON */}
        <li>
          <Link to="/stock-out" className={navStyles("/stock-out")}>
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Stock Out (Sell)</span>
          </Link>
        </li>

        <li>
          <Link to="/inventory" className={navStyles("/inventory")}>
            <ArchiveBoxIcon className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
        </li>

        <li>
          <Link to="/suppliers" className={navStyles("/suppliers")}>
            <TruckIcon className="w-5 h-5" />
            <span>Suppliers</span>
          </Link>
        </li>

        <li>
          <Link to="/transactions" className={navStyles("/transactions")}>
            <ArrowsRightLeftIcon className="w-5 h-5" />
            <span>Transactions</span>
          </Link>
        </li>


        <li>
          <Link to="/reports" className={navStyles("/reports")}>
            <ChartBarIcon className="w-5 h-5" />
            <span>Reports</span>
          </Link>
        </li>

        <li>
          <Link to="/users" className={navStyles("/users")}>
            <UsersIcon className="w-5 h-5" />
            <span>Staff & Users</span>
          </Link>
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;
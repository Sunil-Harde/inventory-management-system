import React from "react";
import { Link, useLocation } from "react-router-dom"; // <-- 1. Import Router tools
import { 
  HomeIcon, 
  ArchiveBoxIcon, 
  TruckIcon, 
  ArrowsRightLeftIcon, 
  ChartBarIcon, 
  UsersIcon 
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  // 2. Get the current URL path
  const location = useLocation();

  // 3. Helper function to apply the beautiful gradient ONLY to the active page
  const navStyles = (path) => {
    // If the URL matches the path, give it the blue gradient. Otherwise, make it gray.
    if (location.pathname === path) {
      return "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md cursor-pointer font-medium";
    } else {
      return "flex items-center gap-3 text-gray-600 font-bold hover:text-blue-600 px-4 py-2 cursor-pointer transition";
    }
  };

  return (
    <div className="w-64 bg-white px-6 py-10 shadow-lg min-h-screen">
      
      {/* Top Welcome */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 tracking-widest uppercase font-bold">
          Welcome, Admin
        </p>
      </div>

      {/* Menu */}
      <ul className="space-y-4">
        
        {/* Dashboard Link */}
        <li>
          <Link to="/" className={navStyles("/")}>
            <HomeIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Inventory Link */}
        <li>
          <Link to="/inventory" className={navStyles("/inventory")}>
            <ArchiveBoxIcon className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
        </li>

        {/* Suppliers Link */}
        <li>
          <Link to="/suppliers" className={navStyles("/suppliers")}>
            <TruckIcon className="w-5 h-5" />
            <span>Suppliers</span>
          </Link>
        </li>

        {/* Transactions Link */}
        <li>
          <Link to="/transactions" className={navStyles("/transactions")}>
            <ArrowsRightLeftIcon className="w-5 h-5" />
            <span>Transactions</span>
          </Link>
        </li>

        {/* Reports Link */}
        <li>
          <Link to="/reports" className={navStyles("/reports")}>
            <ChartBarIcon className="w-5 h-5" />
            <span>Reports</span>
          </Link>
        </li>

        {/* Staff & Users Link */}
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
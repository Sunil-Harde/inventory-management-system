import React, { useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Form from '../components/Form.jsx';

// Updated icons for Auto Parts Inventory
import {
  CogIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/solid";

const Dashboard = () => {
  // Set to false initially so the form doesn't block the screen on load
  const [show, setShow] = useState(false);

  return (
    <div className="flex-1 bg-gray-50 p-10 min-h-screen">
      
      {/* Header Section */}
      <div className="flex mb-10 justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
        <button 
          className="bg-blue-600 text-white font-bold cursor-pointer px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition" 
          onClick={() => setShow(true)}
        >
          + Add Auto Part
        </button>
      </div>

      {/* Modal Popup for Form */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          {/* We pass a function to closeForm so the 'X' button works! */}
          <Form closeForm={() => setShow(false)} />
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr">
        
        <DashboardCard
          title="Total Auto Parts"
          value="1,245"
          icon={CogIcon}
          bg="bg-blue-50"
          iconBg="bg-blue-100"
          textColor="text-blue-600"
        />

        <DashboardCard
          title="Low Stock Alerts"
          value="12"
          icon={ExclamationTriangleIcon}
          bg="bg-rose-50"
          iconBg="bg-rose-100"
          textColor="text-rose-600"
        />

        <DashboardCard
          title="Total Inventory Value"
          value="₹4.5L"
          icon={CurrencyDollarIcon}
          bg="bg-emerald-50"
          iconBg="bg-emerald-100"
          textColor="text-emerald-600"
        />

        <DashboardCard
          title="Active Suppliers"
          value="24"
          icon={TruckIcon}
          bg="bg-purple-50"
          iconBg="bg-purple-100"
          textColor="text-purple-600"
        />

        <DashboardCard
          title="Pending Restocks"
          value="8"
          icon={ClipboardDocumentCheckIcon}
          bg="bg-orange-50"
          iconBg="bg-orange-100"
          textColor="text-orange-600"
        />

        <DashboardCard
          title="Monthly Transactions"
          value="342"
          icon={ArrowTrendingUpIcon}
          bg="bg-indigo-50"
          iconBg="bg-indigo-100"
          textColor="text-indigo-600"
        />

      </div>
    </div>
  );
};

export default Dashboard;


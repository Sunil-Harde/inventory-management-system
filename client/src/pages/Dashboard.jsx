// File: src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { apiClient } from "../api/apiClient";

// Using outline icons to perfectly match your new app design!
import {
  CogIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  // Store all our real database data here
  const [data, setData] = useState({
    inventory: [],
    suppliers: [],
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch everything at once when the dashboard loads!
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [invRes, supRes, txnRes] = await Promise.all([
          apiClient('/inventory', 'GET'),
          apiClient('/suppliers', 'GET'),
          apiClient('/transactions', 'GET')
        ]);

        setData({
          inventory: invRes.data || [],
          suppliers: supRes.data || [],
          transactions: txnRes.data || []
        });
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- LIVE MATH & CALCULATIONS ---
  const { inventory, suppliers, transactions } = data;

  const totalUniqueParts = inventory.length;
  const totalUnitsInStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + ((item.costPrice || 0) * item.currentStock), 0);
  const lowStockCount = inventory.filter(item => item.currentStock <= item.minStockLevel).length;
  const totalSuppliers = suppliers.length;
  const totalTransactions = transactions.length;

  // Get the 5 most recent activities for the live feed
  const recentActivity = [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getPartName = (txn) => {
    return txn.inventoryId?.partName || txn.productId?.partName || 'Unknown Part';
  };

  if (isLoading) return <div className="p-10"><Loader /></div>;

  return (
    <div className="flex-1 bg-gray-50 p-8 md:p-10 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time overview of your auto parts business.</p>
        </div>
        
        {/* ✨ Quick Action Buttons */}
        <div className="flex gap-3">
          <Link 
            to="/stock-in" 
            className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:bg-emerald-700 transition"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> Receive Stock
          </Link>
          <Link 
            to="/stock-out" 
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Dispatch Stock
          </Link>
        </div>
      </div>

      {/* ✨ LIVE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <CogIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Unique Auto Parts</p>
            <h3 className="text-2xl font-black text-gray-800">{totalUniqueParts} Types</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <CurrencyRupeeIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inventory Value</p>
            <h3 className="text-2xl font-black text-gray-800">₹{totalValue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className={`p-4 rounded-xl ${lowStockCount > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="text-2xl font-black text-gray-800">{lowStockCount} Items</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <ArchiveBoxIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Units</p>
            <h3 className="text-2xl font-black text-gray-800">{totalUnitsInStock.toLocaleString('en-IN')} Units</h3>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <TruckIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Suppliers</p>
            <h3 className="text-2xl font-black text-gray-800">{totalSuppliers}</h3>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
            <ArrowsRightLeftIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-2xl font-black text-gray-800">{totalTransactions}</h3>
          </div>
        </div>

      </div>

      {/* --- LIVE ACTIVITY FEED --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 p-5 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ArrowsRightLeftIcon className="w-5 h-5 text-gray-500" /> Recent Activity
          </h3>
          <Link to="/transactions" className="text-sm font-bold text-blue-600 hover:underline">
            View All →
          </Link>
        </div>
        
        <div className="p-5">
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No recent activity found.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map(txn => {
                const isOut = txn.type === 'OUT';
                return (
                  <div key={txn._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition">
                    <div className={`p-3 rounded-full ${isOut ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isOut ? <ArrowUpTrayIcon className="w-5 h-5" /> : <ArrowDownTrayIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{getPartName(txn)}</h4>
                      <p className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleString()} • <span className="font-mono">{txn.referenceNumber || 'Quick Log'}</span></p>
                    </div>
                    <div className={`font-black text-xl ${isOut ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {isOut ? '-' : '+'}{txn.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
// File: src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { apiClient } from "../api/apiClient";
import {
  CogIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [data, setData] = useState({ inventory: [], suppliers: [], transactions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [invRes, supRes, txnRes] = await Promise.all([
          apiClient('/inventory', 'GET'),
          apiClient('/suppliers', 'GET'),
          apiClient('/transactions', 'GET'),
        ]);
        setData({
          inventory:    Array.isArray(invRes.data)  ? invRes.data  : [],
          suppliers:    Array.isArray(supRes.data)  ? supRes.data  : [],
          transactions: Array.isArray(txnRes.data)  ? txnRes.data  : [],
        });
      } catch {
        setError("Failed to load dashboard. Is the backend running?");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const { inventory, suppliers, transactions } = data;

  // ✅ FIX: Backend uses `price` field, not `costPrice`
  const totalUniqueParts    = inventory.length;
  const totalUnitsInStock   = inventory.reduce((sum, item) => sum + (item.currentStock || 0), 0);
  const totalValue          = inventory.reduce((sum, item) => sum + ((item.price || 0) * (item.currentStock || 0)), 0);
  const lowStockCount       = inventory.filter(item => item.currentStock <= item.minStockLevel).length;
  const totalSuppliers      = suppliers.length;
  const totalTransactions   = transactions.length;

  const recentActivity = [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // ✅ FIX: Backend populates as `product`, not `productId` or `inventoryId`
  const getPartName = (txn) =>
    txn.product?.partName || txn.productId?.partName || txn.inventoryId?.partName || 'Unknown Part';

  if (isLoading) return <div className="p-10"><Loader /></div>;

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow border border-red-100">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Retry
        </button>
      </div>
    </div>
  );

  const statCards = [
    {
      label: "Unique Auto Parts",
      value: `${totalUniqueParts} Types`,
      icon: CogIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Inventory Value",
      value: `₹${totalValue.toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Low Stock Alerts",
      value: `${lowStockCount} Items`,
      icon: ExclamationTriangleIcon,
      iconBg: lowStockCount > 0 ? "bg-red-50" : "bg-green-50",
      iconColor: lowStockCount > 0 ? "text-red-600" : "text-green-600",
      alert: lowStockCount > 0,
    },
    {
      label: "Total Units",
      value: `${totalUnitsInStock.toLocaleString('en-IN')} Units`,
      icon: ArchiveBoxIcon,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Active Suppliers",
      value: totalSuppliers,
      icon: TruckIcon,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Total Transactions",
      value: totalTransactions,
      icon: ArrowsRightLeftIcon,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 p-8 md:p-10 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time overview of your auto parts business.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/stock-in" className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-lg shadow-md hover:bg-emerald-700 transition">
            <ArrowDownTrayIcon className="w-5 h-5" /> Receive Stock
          </Link>
          <Link to="/stock-out" className="flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition">
            <ArrowUpTrayIcon className="w-5 h-5" /> Dispatch Stock
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, alert }) => (
          <div
            key={label}
            className={`bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5 transition hover:shadow-md
              ${alert ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}
          >
            <div className={`p-4 rounded-xl flex-shrink-0 ${iconBg} ${alert ? 'animate-pulse' : ''}`}>
              <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
              <h3 className={`text-2xl font-black mt-0.5 ${alert ? 'text-red-700' : 'text-gray-800'}`}>
                {value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
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
            <p className="text-center text-gray-400 py-6 font-medium">No recent activity found.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((txn) => {
                // ✅ FIX: backend returns transactionType (IN/OUT), not type
                const isOut = txn.transactionType === 'OUT' || txn.type === 'OUT';
                return (
                  <div key={txn._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition">
                    <div className={`p-3 rounded-full flex-shrink-0 ${isOut ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isOut ? <ArrowUpTrayIcon className="w-5 h-5" /> : <ArrowDownTrayIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate">{getPartName(txn)}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(txn.transactionDate || txn.createdAt).toLocaleString('en-IN')}
                        {' • '}
                        <span className="font-mono">{txn.referenceDocument || txn.referenceNumber || 'Quick Log'}</span>
                      </p>
                    </div>
                    <div className={`font-black text-xl flex-shrink-0 ${isOut ? 'text-orange-600' : 'text-emerald-600'}`}>
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
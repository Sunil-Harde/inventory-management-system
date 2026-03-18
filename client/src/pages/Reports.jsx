// File: src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { apiClient } from '../api/apiClient';
import { toast } from 'sonner';
import {
  CurrencyRupeeIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

function Reports() {
  const [inventory, setInventory]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);

  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedTxn, setSelectedTxn]   = useState(null);
  const [receiveQty, setReceiveQty]     = useState('');
  const [receiveRef, setReceiveRef]     = useState('');

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [invRes, txnRes] = await Promise.all([
        apiClient('/inventory', 'GET'),
        apiClient('/transactions', 'GET'),
      ]);
      if (invRes.success)  setInventory(Array.isArray(invRes.data)  ? invRes.data  : []);
      if (txnRes.success)  setTransactions(Array.isArray(txnRes.data) ? txnRes.data : []);
    } catch {
      toast.error("Failed to fetch report data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  // ✅ FIX: Backend uses `price` field on inventory items, not costPrice/sellingPrice
  const totalInvested     = inventory.reduce((s, i) => s + ((i.price || 0) * (i.currentStock || 0)), 0);
  const totalStock        = inventory.reduce((s, i) => s + (i.currentStock || 0), 0);
  const lowStockItems     = inventory.filter(i => i.currentStock <= i.minStockLevel);

  // Valuation breakdown by vehicle type from the dedicated reports endpoint (or calculated)
  const vehicleBreakdown  = { '2W': 0, '3W': 0, '4W': 0, EV: 0 };
  inventory.forEach(item => {
    const val = (item.price || 0) * (item.currentStock || 0);
    item.vehicleType?.forEach(type => {
      if (vehicleBreakdown[type] !== undefined) vehicleBreakdown[type] += val;
    });
  });

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt))
    .slice(0, 5);

  // ✅ FIX: Backend populates as `product`, fallback to `productId` / `inventoryId`
  const getPartName = (txn) =>
    txn.product?.partName || txn.productId?.partName || txn.inventoryId?.partName || 'Unknown Part';

  const handleQuickRestock = async (e) => {
    e.preventDefault();
    const qty = Number(receiveQty);
    if (qty < 1) return toast.error("Quantity must be at least 1.");

    const toastId = toast.loading(`Restocking ${qty}× ${selectedPart.partName}...`);
    try {
      // ✅ FIX: Correct endpoint is /transactions/in with correct field names
      const payload = {
        productId:         selectedPart._id,
        quantity:          qty,
        referenceDocument: receiveRef || 'Dashboard Quick Restock',
        remarks:           'Restocked directly from Reports Dashboard',
      };
      const response = await apiClient('/transactions/in', 'POST', payload);
      if (response.success) {
        toast.success(`Added ${qty} units successfully!`, { id: toastId });
        setSelectedPart(null);
        setReceiveQty('');
        setReceiveRef('');
        fetchReportData();
      } else {
        toast.error(response.message || "Restock failed.", { id: toastId });
      }
    } catch {
      toast.error("Network error.", { id: toastId });
    }
  };

  if (isLoading) return <div className="p-8"><Loader /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Real-time overview of your business performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: 'Capital Invested',
            value: `₹${totalInvested.toLocaleString('en-IN')}`,
            sub: `${totalStock} units in stock`,
            icon: ArchiveBoxIcon,
            iconBg: 'bg-blue-100 text-blue-600',
            valueColor: 'text-gray-800',
          },
          {
            label: 'Inventory Valuation',
            value: `₹${totalInvested.toLocaleString('en-IN')}`,
            sub: 'Current stock value at cost',
            icon: BanknotesIcon,
            iconBg: 'bg-emerald-100 text-emerald-600',
            valueColor: 'text-emerald-600',
          },
          {
            label: 'Low Stock Alerts',
            value: lowStockItems.length,
            sub: 'Items needing immediate reorder',
            icon: ExclamationTriangleIcon,
            iconBg: lowStockItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
            valueColor: lowStockItems.length > 0 ? 'text-red-700' : 'text-green-700',
            pulse: lowStockItems.length > 0,
            clickable: lowStockItems.length > 0,
            onClick: () => setIsLowStockModalOpen(true),
          },
          {
            label: 'Total Transactions',
            value: transactions.length,
            sub: 'All historical movement logs',
            icon: ArrowsRightLeftIcon,
            iconBg: 'bg-purple-100 text-purple-600',
            valueColor: 'text-gray-800',
          },
        ].map(({ label, value, sub, icon: Icon, iconBg, valueColor, pulse, clickable, onClick }) => (
          <div
            key={label}
            onClick={clickable ? onClick : undefined}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center transition
              ${clickable ? 'cursor-pointer hover:shadow-md hover:border-red-200' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg ${iconBg} ${pulse ? 'animate-pulse' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
            <h3 className={`text-3xl font-black ${valueColor}`}>{value}</h3>
            <p className="text-xs text-gray-400 mt-2">{sub}</p>
          </div>
        ))}
      </div>

      {/* Vehicle Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4">Inventory Value by Vehicle Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(vehicleBreakdown).map(([type, val]) => (
            <div key={type} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{type}</p>
              <p className="text-xl font-black text-gray-800">₹{val.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-red-50 border-b border-red-100 p-4 flex justify-between items-center">
            <h3 className="text-base font-bold text-red-800 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" /> Items Needing Reorder
            </h3>
            {lowStockItems.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                {lowStockItems.length} items
              </span>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {lowStockItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                All stock levels are healthy! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map(item => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedPart(item)}
                    className="flex justify-between items-center p-3 hover:bg-red-50 rounded-xl border border-gray-100 cursor-pointer transition"
                  >
                    <div>
                      <h4 className="font-bold text-gray-800">{item.partName}</h4>
                      <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-red-600">{item.currentStock} left</span>
                      <span className="text-xs text-gray-400">Min: {item.minStockLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-gray-50 border-b border-gray-100 p-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-5 h-5" /> Recent Stock Movements
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {recentTransactions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                No transactions found.
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map(txn => {
                  // ✅ FIX: Check both transactionType and type
                  const isOut = txn.transactionType === 'OUT' || txn.type === 'OUT';
                  return (
                    <div
                      key={txn._id}
                      onClick={() => setSelectedTxn(txn)}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition"
                    >
                      <div className={`p-2.5 rounded-full flex-shrink-0 ${isOut ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <ArrowsRightLeftIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{getPartName(txn)}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(txn.transactionDate || txn.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className={`font-bold text-lg flex-shrink-0 ${isOut ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {isOut ? '−' : '+'}{txn.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Full low stock list */}
      {isLowStockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-red-600 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" /> All Low Stock Items ({lowStockItems.length})
              </h2>
              <button onClick={() => setIsLowStockModalOpen(false)} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 bg-gray-50">
              {lowStockItems.map(item => (
                <div
                  key={item._id}
                  onClick={() => { setIsLowStockModalOpen(false); setSelectedPart(item); }}
                  className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-red-400 hover:shadow-md transition"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{item.partName}</h4>
                    <p className="text-sm text-gray-500 font-mono mt-1">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-red-600">{item.currentStock} Units</span>
                    <span className="text-sm text-gray-500">Min: {item.minStockLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick restock */}
      {selectedPart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-600 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Low Stock Alert</h2>
                <p className="text-red-100 text-sm mt-1 truncate max-w-xs">{selectedPart.partName}</p>
              </div>
              <button onClick={() => { setSelectedPart(null); setReceiveQty(''); setReceiveRef(''); }} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Stock</p>
                <p className="text-3xl font-black text-red-600">{selectedPart.currentStock}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Warning Level</p>
                <p className="text-xl font-bold text-gray-800">{selectedPart.minStockLevel}</p>
              </div>
            </div>
            <form onSubmit={handleQuickRestock} className="p-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5 text-emerald-600" /> Quick Restock
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-600 font-medium mb-1 text-xs uppercase tracking-wider">
                    Add Qty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min="1" required autoFocus placeholder="e.g. 50"
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 font-medium mb-1 text-xs uppercase tracking-wider">Reference</label>
                  <input
                    type="text" placeholder="Invoice #"
                    value={receiveRef}
                    onChange={(e) => setReceiveRef(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-md flex justify-center items-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5" /> Receive Stock Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transaction details */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className={`p-6 flex justify-between items-start ${(selectedTxn.transactionType || selectedTxn.type) === 'IN' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {(selectedTxn.transactionType || selectedTxn.type) === 'IN' ? 'Stock Received' : 'Stock Dispatched'}
                </h2>
                <p className="text-white/80 text-sm mt-1 font-mono">
                  {selectedTxn.referenceDocument || selectedTxn.referenceNumber || `TXN-${selectedTxn._id?.slice(-6).toUpperCase()}`}
                </p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="text-white hover:text-white/70 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['Auto Part',  getPartName(selectedTxn)],
                ['Quantity',   `${(selectedTxn.transactionType || selectedTxn.type) === 'IN' ? '+' : '−'}${selectedTxn.quantity} Units`],
                ['Date',       new Date(selectedTxn.transactionDate || selectedTxn.createdAt).toLocaleString('en-IN')],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-bold text-gray-800">{v}</span>
                </div>
              ))}
              {(selectedTxn.remarks) && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Remarks</p>
                  <p className="text-sm text-gray-800">{selectedTxn.remarks}</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedTxn(null)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
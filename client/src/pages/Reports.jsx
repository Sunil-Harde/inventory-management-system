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
  BanknotesIcon // ✨ Added a new icon for profit
} from '@heroicons/react/24/outline';

function Reports() {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // MODAL STATES
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // QUICK RESTOCK STATES
  const [receiveQty, setReceiveQty] = useState('');
  const [receiveRef, setReceiveRef] = useState('');

  // Fetch all necessary data
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [invRes, txnRes] = await Promise.all([
        apiClient('/inventory', 'GET'),
        apiClient('/transactions', 'GET')
      ]);

      if (invRes.success && invRes.data) setInventory(invRes.data);
      if (txnRes.success && txnRes.data) setTransactions(txnRes.data);
    } catch (error) {
      console.error("Failed to fetch report data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  // ✨ CALCULATE ADVANCED DASHBOARD METRICS ✨
  
  // 1. Total Capital Invested (What you paid for the stock currently on shelves)
  const totalInvested = inventory.reduce((sum, item) => sum + ((item.costPrice || 0) * item.currentStock), 0);
  
  // 2. Projected Revenue (What you will get when you sell all current stock)
  const projectedRevenue = inventory.reduce((sum, item) => sum + ((item.sellingPrice || 0) * item.currentStock), 0);
  
  // 3. Projected Profit (The difference)
  const projectedProfit = projectedRevenue - totalInvested;

  // Stock Numbers
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStockLevel);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getPartName = (txn) => {
    return txn.inventoryId?.partName || txn.productId?.partName || 'Unknown Part';
  };

  // THE QUICK RESTOCK MAGIC FUNCTION
  const handleQuickRestock = async (e) => {
    e.preventDefault();
    const qty = Number(receiveQty);
    
    if (qty <= 0) return toast.error("Quantity must be at least 1.");

    const toastId = toast.loading(`Restocking ${qty}x ${selectedPart.partName}...`);

    try {
      const payload = {
        productId: selectedPart._id, 
        type: 'IN',
        quantity: qty,
        referenceNumber: receiveRef || 'Dashboard Quick Restock',
        remarks: 'Restocked directly from Reports Dashboard'
      };

      const response = await apiClient('/transactions', 'POST', payload);

      if (response.success) {
        toast.success(`Successfully added ${qty} units!`, { id: toastId });
        
        setSelectedPart(null); 
        setReceiveQty('');    
        setReceiveRef('');      
        
        fetchReportData(); 
      } else {
        toast.error(response.message || "Failed to restock.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network Error. Is your backend server running?", { id: toastId });
    }
  };

  if (isLoading) return <div className="p-8"><Loader /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Real-time overview of your business performance</p>
      </div>

      {/* --- ✨ ADVANCED FINANCIAL KPI CARDS ✨ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Invested Capital */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <ArchiveBoxIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Capital Invested</p>
          </div>
          <h3 className="text-3xl font-black text-gray-800">₹{totalInvested.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Money tied up in {totalStock} items</p>
        </div>

        {/* Projected Profit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Projected Profit</p>
          </div>
          <h3 className="text-3xl font-black text-emerald-600">+ ₹{projectedProfit.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Expected revenue: ₹{projectedRevenue.toLocaleString('en-IN')}</p>
        </div>

        {/* Low Stock Warning */}
        <div 
          onClick={() => lowStockItems.length > 0 && setIsLowStockModalOpen(true)}
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center transition-all ${lowStockItems.length > 0 ? 'cursor-pointer hover:shadow-md hover:border-red-200' : ''}`}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-lg ${lowStockItems.length > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Low Stock Alerts</p>
          </div>
          <h3 className="text-3xl font-black text-gray-800">{lowStockItems.length}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Items needing immediate reorder</p>
        </div>

        {/* Transaction Volume */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <ArrowsRightLeftIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Transactions</p>
          </div>
          <h3 className="text-3xl font-black text-gray-800">{transactions.length}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Total historical movement logs</p>
        </div>
      </div>

      {/* --- DETAILED DATA SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Warning Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-red-50 border-b border-red-100 p-4">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" /> Items Needing Reorder
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {lowStockItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                All inventory levels are healthy! 🎉
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map(item => (
                  <div 
                    key={item._id} 
                    onClick={() => setSelectedPart(item)}
                    className="flex justify-between items-center p-3 hover:bg-red-50 rounded-lg border border-gray-100 cursor-pointer transition"
                  >
                    <div>
                      <h4 className="font-bold text-gray-800">{item.partName}</h4>
                      <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-red-600">{item.currentStock} Left</span>
                      <span className="text-xs text-gray-400">Min: {item.minStockLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-gray-50 border-b border-gray-100 p-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-5 h-5" /> Recent Stock Movements
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {recentTransactions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                No recent transactions found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(txn => {
                  const isOut = txn.type === 'OUT';
                  return (
                    <div 
                      key={txn._id} 
                      onClick={() => setSelectedTxn(txn)}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 cursor-pointer transition"
                    >
                      <div className={`p-3 rounded-full ${isOut ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <ArrowsRightLeftIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{getPartName(txn)}</h4>
                        <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleString()}</p>
                      </div>
                      <div className={`font-bold text-lg ${isOut ? 'text-orange-600' : 'text-emerald-600'}`}>
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

      {/* ========================================================= */}
      {/* 🛑 MODAL 1: FULL LOW STOCK LIST */}
      {/* ========================================================= */}
      {isLowStockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-red-600 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" /> All Low Stock Items
              </h2>
              <button onClick={() => setIsLowStockModalOpen(false)} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-gray-50">
              {lowStockItems.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => {
                    setIsLowStockModalOpen(false);
                    setSelectedPart(item); 
                  }}
                  className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-red-400 hover:shadow-md transition"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{item.partName}</h4>
                    <p className="text-sm text-gray-500 font-mono mt-1">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-red-600">{item.currentStock} Units</span>
                    <span className="text-sm text-gray-500">Min Required: {item.minStockLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🛑 MODAL 2: QUICK RESTOCK POPUP */}
      {/* ========================================================= */}
      {selectedPart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            
            {/* Header */}
            <div className="bg-red-600 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Low Stock Alert</h2>
                <p className="text-red-100 text-sm mt-1">{selectedPart.partName}</p>
              </div>
              <button onClick={() => {
                setSelectedPart(null);
                setReceiveQty('');
                setReceiveRef('');
              }} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Item Details */}
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

            {/* Quick Restock Form */}
            <form onSubmit={handleQuickRestock} className="p-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                <ArrowDownTrayIcon className="w-5 h-5 text-emerald-600" /> Quick Restock
              </h3>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-600 font-medium mb-1 text-xs uppercase tracking-wider">Add Qty <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    value={receiveQty} 
                    onChange={(e) => setReceiveQty(e.target.value)} 
                    required 
                    autoFocus 
                    placeholder="e.g. 50"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 font-medium mb-1 text-xs uppercase tracking-wider">Reference</label>
                  <input 
                    type="text" 
                    value={receiveRef} 
                    onChange={(e) => setReceiveRef(e.target.value)} 
                    placeholder="Invoice #"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-md flex justify-center items-center gap-2">
                  <ArrowDownTrayIcon className="w-5 h-5" /> Receive Stock Now
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🛑 MODAL 3: TRANSACTION DETAILS POPUP */}
      {/* ========================================================= */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className={`p-6 flex justify-between items-start ${selectedTxn.type === 'IN' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedTxn.type === 'IN' ? 'Stock Received' : 'Stock Dispatched'}
                </h2>
                <p className="text-white/80 text-sm mt-1 font-mono">
                  {selectedTxn.referenceNumber || `TXN-${selectedTxn._id.slice(-6).toUpperCase()}`}
                </p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="text-white hover:text-white/70 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Auto Part</span>
                <div className="text-right">
                  <span className="block text-lg font-bold text-gray-800 max-w-[150px] truncate">{getPartName(selectedTxn)}</span>
                  {selectedTxn.productId?.sku && <span className="text-sm font-mono text-gray-500">{selectedTxn.productId.sku}</span>}
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Quantity</span>
                <span className={`font-bold px-4 py-1.5 rounded-full text-md ${selectedTxn.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {selectedTxn.type === 'IN' ? '+' : '-'}{selectedTxn.quantity} Units
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800">{new Date(selectedTxn.createdAt).toLocaleString()}</span>
              </div>

              {selectedTxn.remarks && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                  <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Remarks / Notes</h4>
                  <p className="text-sm text-gray-800">{selectedTxn.remarks}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedTxn(null)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reports;
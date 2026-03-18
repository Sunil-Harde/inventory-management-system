// File: src/pages/StockOut.jsx
import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';
import { MagnifyingGlassIcon, ArrowUpTrayIcon, XMarkIcon, PrinterIcon, FunnelIcon } from '@heroicons/react/24/outline';

function StockOut() {
  const [inventory, setInventory]       = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading]       = useState(true);

  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutQty, setCheckoutQty]   = useState('');
  const [reference, setReference]       = useState('');
  const [receiptData, setReceiptData]   = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    const response = await apiClient('/inventory', 'GET');
    if (response.success && response.data) setInventory(response.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const filterOptions = ['All', 'Low Stock', 'Out of Stock', '2W', '3W', '4W', 'EV'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === 'Low Stock')         matchesFilter = item.currentStock <= item.minStockLevel && item.currentStock > 0;
    else if (activeFilter === 'Out of Stock') matchesFilter = item.currentStock === 0;
    else if (activeFilter !== 'All')          matchesFilter = item.vehicleType?.includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  const handleDispatch = async (e) => {
    e.preventDefault();
    const qty = Number(checkoutQty);
    if (qty < 1) return toast.error("Quantity must be at least 1.");
    if (qty > checkoutItem.currentStock) {
      return toast.error(`Only ${checkoutItem.currentStock} units in stock. Cannot dispatch ${qty}.`);
    }

    const toastId = toast.loading(`Dispatching ${qty}× ${checkoutItem.partName}...`);

    try {
      // ✅ FIX: Correct endpoint is /transactions/out
      // ✅ FIX: Backend uses `productId` and `referenceDocument`
      const payload = {
        productId:         checkoutItem._id,
        quantity:          qty,
        destination:       reference || 'Quick Dispatch',
        referenceDocument: reference || 'Quick Dispatch',
        remarks:           'Dispatched via Stock Out Page',
      };

      const response = await apiClient('/transactions/out', 'POST', payload);

      if (response.success) {
        toast.success("Stock dispatched successfully!", { id: toastId });

        // ✅ FIX: Backend uses `price`, not `sellingPrice`
        const unitPrice = checkoutItem.price || checkoutItem.sellingPrice || 0;
        setReceiptData({
          partName:      checkoutItem.partName,
          sku:           checkoutItem.sku,
          type:          'STOCK OUT',
          quantity:      qty,
          price:         unitPrice,
          totalAmount:   unitPrice * qty,
          referenceNumber: payload.referenceDocument,
          newStockLevel: response.data?.updatedProduct?.newStockLevel ?? (checkoutItem.currentStock - qty),
          date:          new Date().toLocaleString('en-IN'),
        });

        setCheckoutItem(null);
        setCheckoutQty('');
        setReference('');
        fetchInventory();
      } else {
        toast.error(response.message || "Dispatch failed.", { id: toastId });
      }
    } catch {
      toast.error("Network error. Is the backend running?", { id: toastId });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen print:p-0 print:bg-white">

      {/* Header */}
      <div className="print:hidden mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dispatch Stock (OUT)</h1>
            <p className="text-gray-500 mt-1">Dispatch items from your inventory</p>
          </div>
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Part Name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <FunnelIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition flex-shrink-0 ${
                activeFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory grid */}
      <div className="print:hidden">
        {isLoading ? <Loader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map((item) => (
              <div
                key={item._id}
                onClick={() => item.currentStock > 0 && setCheckoutItem(item)}
                className={`bg-white rounded-xl shadow-sm border p-6 transition ${
                  item.currentStock > 0
                    ? 'border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer group'
                    : 'border-red-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition">
                    <ArrowUpTrayIcon className={`w-6 h-6 ${item.currentStock > 0 ? 'text-gray-600 group-hover:text-blue-600' : 'text-red-400'}`} />
                  </div>
                  {item.currentStock === 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">OUT OF STOCK</span>
                  )}
                  {item.currentStock > 0 && item.currentStock <= item.minStockLevel && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">LOW STOCK</span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.partName}</h3>
                <p className="text-sm text-gray-500 font-mono mt-1 mb-4">{item.sku}</p>
                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Available</p>
                    <p className={`text-xl font-black ${item.currentStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.currentStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Price</p>
                    {/* ✅ FIX: Use price field */}
                    <p className="font-bold text-blue-600">₹{(item.price || item.sellingPrice || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredInventory.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200">
                <p className="text-lg font-bold text-gray-700">No items found</p>
                <button
                  onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {checkoutItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Dispatch Item</h2>
                <p className="text-blue-200 text-sm mt-1 truncate max-w-xs">{checkoutItem.partName}</p>
              </div>
              <button onClick={() => setCheckoutItem(null)} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDispatch} className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex justify-between items-center border border-blue-100">
                <span className="font-medium">Available:</span>
                <span className="text-xl font-black">{checkoutItem.currentStock} Units</span>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Quantity to Dispatch <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="1" max={checkoutItem.currentStock} required autoFocus
                  value={checkoutQty}
                  onChange={(e) => setCheckoutQty(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm">Destination / Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. Customer Order / Invoice No."
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md">
                  Confirm Dispatch
                </button>
                <button type="button" onClick={() => setCheckoutItem(null)} className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt */}
      {receiptData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 print:static print:bg-white print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden print:shadow-none">
            <div className="p-8 border-b-2 border-dashed border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wider">Dispatch Receipt</h2>
                <p className="text-gray-500 text-sm mt-1">{receiptData.date}</p>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                {[
                  ['Type',         <span className="text-orange-600 font-bold">{receiptData.type}</span>],
                  ['Reference',    receiptData.referenceNumber],
                  ['Part Name',    receiptData.partName],
                  ['SKU',          <span className="font-mono">{receiptData.sku}</span>],
                  ['Unit Price',   `₹${receiptData.price.toLocaleString('en-IN')}`],
                  ['Qty Dispatched', <span className="text-gray-800 font-black text-lg">×{receiptData.quantity}</span>],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-medium">{k}</span>
                    <span className="font-semibold text-right">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between bg-gray-50 p-3 rounded-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600 text-lg">₹{receiptData.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">New Stock Level</span>
                  <span className="font-black text-xl">{receiptData.newStockLevel}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 print:hidden">
              <button onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
                <PrinterIcon className="w-5 h-5" /> Print
              </button>
              <button onClick={() => setReceiptData(null)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockOut;
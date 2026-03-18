// File: src/pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import Loader from '../components/Loader';
import { 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  XMarkIcon,
  MagnifyingGlassIcon, // ✨ Added for search
  FunnelIcon           // ✨ Added for filters
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';

// 1. INSTRUCTIONS FOR THE UNIVERSAL FORM
const transactionSchema = [
  {
    sectionTitle: 'Transaction Details',
    columns: 2, 
    fields: [
      { name: 'type', label: 'Transaction Type', type: 'select', options: ['IN', 'OUT'], required: true },
      { name: 'productId', label: 'Auto Part', type: 'async-select', fetchEndpoint: '/inventory', displayKey: 'partName', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'e.g. 10', required: true },
      { name: 'referenceNumber', label: 'Reference / Invoice #', type: 'text', placeholder: 'INV-2024-001' }
    ]
  },
  {
    sectionTitle: 'Additional Information',
    columns: 1, 
    fields: [
      { name: 'remarks', label: 'Notes', type: 'text', placeholder: 'Reason for transaction...' }
    ]
  }
];

// 2. DATA FORMATTER
const formatTransactionData = (data) => ({
  type: data.type,
  productId: data.productId, 
  quantity: Number(data.quantity),
  referenceNumber: data.referenceNumber || '', 
  remarks: data.remarks || '' 
});

const flattenInitialData = (item) => {
  if (!item) return null;
  return {
    ...item,
    productId: item.productId?._id || item.productId 
  };
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✨ NEW: FILTER STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const response = await apiClient('/transactions', 'GET');
    
    if (response.success && response.data) {
      setTransactions(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const closeAllModals = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setSelectedItem(null);
    fetchTransactions(); 
  };

  const handleEdit = (item) => {
    setSelectedItem(flattenInitialData(item));
    setIsEditOpen(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction? (Note: This might not reverse the stock count automatically depending on your backend)")) {
      const toastId = toast.loading("Deleting transaction..."); 
      
      const response = await apiClient(`/transactions/${id}`, 'DELETE');
      
      if (response.success) {
        toast.success("Transaction deleted successfully!", { id: toastId });
        fetchTransactions(); 
      } else {
        toast.error(response.message || "Failed to delete the transaction.", { id: toastId });
      }
    }
  };

  const getPartName = (item) => {
    if (item.productId && item.productId.partName) return item.productId.partName;
    return 'Unknown Part (Deleted)';
  };

  // ✨ THE SUPER FILTER LOGIC
  const filteredTransactions = transactions.filter(item => {
    // 1. Search Logic (Checks Name, SKU, Ref Number, and Quantity!)
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      getPartName(item).toLowerCase().includes(searchString) ||
      (item.productId?.sku || '').toLowerCase().includes(searchString) ||
      (item.referenceNumber || '').toLowerCase().includes(searchString) ||
      item.quantity.toString().includes(searchString);

    // 2. Type Logic (IN / OUT / ALL)
    const matchesType = typeFilter === 'All' || item.type === typeFilter;

    // 3. Date Logic
    let matchesDate = true;
    if (dateFilter !== 'All Time') {
      const itemDate = new Date(item.createdAt || Date.now());
      const today = new Date();
      
      // Calculate difference in days
      const diffTime = Math.abs(today - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (dateFilter === 'Today') {
        matchesDate = itemDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'Last 7 Days') {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'Last 30 Days') {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500 mt-1">Track stock movement (IN & OUT)</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition whitespace-nowrap">
          + New Transaction
        </button>
      </div>

      {/* --- ✨ SEARCH & FILTER BAR --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name, Qty, or Ref No..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <FunnelIcon className="w-5 h-5 text-gray-400 hidden sm:block" />
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium cursor-pointer transition hover:bg-gray-100"
          >
            <option value="All">All Types</option>
            <option value="IN">Stock IN (Receive)</option>
            <option value="OUT">Stock OUT (Sell)</option>
          </select>

          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium cursor-pointer transition hover:bg-gray-100"
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {isLoading ? <Loader /> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
                <th className="p-4 border-b">Type</th>
                <th className="p-4 border-b">Auto Part</th>
                <th className="p-4 border-b">Quantity</th>
                <th className="p-4 border-b hidden md:table-cell">Date & Reference</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* ✨ NOW MAP OVER "filteredTransactions" */}
              {filteredTransactions.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 border-b transition">
                  <td className="p-4">
                    {item.type === 'IN' ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">STOCK IN ⬇</span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">STOCK OUT ⬆</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{getPartName(item)}</div>
                    {item.productId?.sku && <div className="text-xs text-gray-500 font-mono">{item.productId.sku}</div>}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-lg text-gray-700">{item.quantity} units</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="font-medium text-gray-800">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{item.referenceNumber || 'No Ref'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleView(item)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"><EyeIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleEdit(item)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-full transition"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* EMPTY STATE FOR FILTERS */}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <p className="text-lg font-bold text-gray-700">No transactions found.</p>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                    {(searchTerm || typeFilter !== 'All' || dateFilter !== 'All Time') && (
                      <button 
                        onClick={() => { setSearchTerm(''); setTypeFilter('All'); setDateFilter('All Time'); }} 
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD OR EDIT MODAL --- */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all p-4">
         <DynamicForm 
            title="Transaction"
            apiUrl="/transactions" 
            schema={transactionSchema} 
            initialData={isEditOpen ? selectedItem : null} 
            formatData={formatTransactionData}
            onSuccess={closeAllModals}
            onClose={closeAllModals}
          />
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className={`p-6 flex justify-between items-start ${selectedItem.type === 'IN' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedItem.type === 'IN' ? 'Stock Received' : 'Stock Dispatched'}
                </h2>
                <p className="text-white/80 text-sm mt-1 font-mono">ID: {selectedItem._id}</p>
              </div>
              <button onClick={closeAllModals} className="text-white hover:text-white/70 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Auto Part</span>
                <div className="text-right">
                  <span className="block text-lg font-bold text-gray-800">{getPartName(selectedItem)}</span>
                  {selectedItem.productId?.sku && <span className="text-sm font-mono text-gray-500">{selectedItem.productId.sku}</span>}
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Quantity</span>
                <span className={`font-bold px-4 py-1.5 rounded-full text-md ${selectedItem.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {selectedItem.type === 'IN' ? '+' : '-'}{selectedItem.quantity} Units
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Reference No.</span>
                <span className="font-semibold text-gray-800">{selectedItem.referenceNumber || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Date Logged</span>
                <span className="font-medium text-gray-800">{new Date(selectedItem.createdAt).toLocaleString()}</span>
              </div>

              {selectedItem.remarks && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                  <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Remarks / Notes</h4>
                  <p className="text-sm text-gray-800">{selectedItem.remarks}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={closeAllModals} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
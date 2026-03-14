// File: src/pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import Loader from '../components/Loader';
import { EyeIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';

// 1. INSTRUCTIONS FOR THE UNIVERSAL FORM
const transactionSchema = [
  {
    sectionTitle: 'Transaction Details',
    columns: 2, 
    fields: [
      { name: 'type', label: 'Transaction Type', type: 'select', options: ['IN', 'OUT'], required: true },
      // ✨ Notice how it fetches from /inventory and displays the partName!
      { name: 'inventoryId', label: 'Auto Part', type: 'async-select', fetchEndpoint: '/inventory', displayKey: 'partName', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'e.g. 10', required: true },
      { name: 'reference', label: 'Reference / Invoice #', type: 'text', placeholder: 'INV-2024-001' }
    ]
  },
  {
    sectionTitle: 'Additional Information',
    columns: 1, 
    fields: [
      { name: 'notes', label: 'Notes', type: 'text', placeholder: 'Reason for transaction...' }
    ]
  }
];

// 2. DATA FORMATTER
const formatTransactionData = (data) => ({
  type: data.type,
  inventoryId: data.inventoryId,
  quantity: Number(data.quantity),
  reference: data.reference || '',
  notes: data.notes || ''
});

// Helper to handle populated data when editing
const flattenInitialData = (item) => {
  if (!item) return null;
  return {
    ...item,
    // If the backend populates the inventory object, we just want the ID for the form dropdown
    inventoryId: item.inventoryId?._id || item.inventoryId
  };
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Helper function to safely get the part name
  const getPartName = (item) => {
    if (item.inventoryId && item.inventoryId.partName) return item.inventoryId.partName;
    return 'Unknown Part (Deleted)';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500 mt-1">Track stock movement (IN & OUT)</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
          + New Transaction
        </button>
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
              {transactions.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 border-b transition">
                  <td className="p-4">
                    {/* Beautiful Badges for IN / OUT */}
                    {item.type === 'IN' ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">STOCK IN ⬇</span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">STOCK OUT ⬆</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{getPartName(item)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-lg text-gray-700">{item.quantity} units</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="font-medium text-gray-800">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{item.reference || 'No Ref'}</div>
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
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No transactions found. Click "New Transaction" to log stock movement!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD OR EDIT MODAL --- */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className={`p-6 flex justify-between items-start ${selectedItem.type === 'IN' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedItem.type === 'IN' ? 'Stock Received' : 'Stock Dispatched'}
                </h2>
                <p className="text-white/80 text-sm mt-1 font-mono">{selectedItem.reference || `TXN-${selectedItem._id.slice(-6).toUpperCase()}`}</p>
              </div>
              <button onClick={closeAllModals} className="text-white hover:text-white/70 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Auto Part</span>
                <span className="text-lg font-bold text-gray-800">{getPartName(selectedItem)}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Quantity</span>
                <span className={`font-bold px-4 py-1.5 rounded-full text-md ${selectedItem.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {selectedItem.type === 'IN' ? '+' : '-'}{selectedItem.quantity} Units
                </span>
              </div>

              {selectedItem.notes && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                  <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Notes</h4>
                  <p className="text-sm text-gray-800">{selectedItem.notes}</p>
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
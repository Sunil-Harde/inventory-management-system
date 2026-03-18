// File: src/pages/Inventory.jsx
import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import Loader from '../components/Loader';
import { 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient'; 

// 1. INSTRUCTIONS FOR THE UNIVERSAL FORM
const inventorySchema = [
  {
    sectionTitle: 'Basic Details',
    columns: 2, 
    fields: [
      { name: 'partName', label: 'Part Name', type: 'text', placeholder: 'e.g. BS6 Wiring Harness', required: true },
      { name: 'sku', label: 'SKU (Barcode)', type: 'text', placeholder: 'WH-APE-BS6-101', required: true },
      { name: 'supplierId', label: 'Supplier', type: 'async-select', fetchEndpoint: '/suppliers', displayKey: 'companyName', required: true },
      { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['2W', '3W', '4W', 'EV'], required: true }
    ]
  },
  {
    sectionTitle: 'Technical Specifications',
    columns: 3, 
    fields: [
      { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['N/A', 'Petrol', 'Diesel', 'CNG', 'Electric'] },
      { name: 'emissionStandard', label: 'Emission Standard', type: 'select', options: ['N/A', 'BS3', 'BS4', 'BS6'] },
      { name: 'voltage', label: 'Voltage', type: 'text', placeholder: '12V' }
    ]
  },
  {
    sectionTitle: 'Financials & Stock',
    columns: 2, 
    fields: [
      { name: 'costPrice', label: 'Cost Price (₹)', type: 'number', placeholder: '800', required: true },
      { name: 'sellingPrice', label: 'Selling Price (₹)', type: 'number', placeholder: '1200', required: true },
      { name: 'currentStock', label: 'Initial Stock', type: 'number', placeholder: '50', required: true },
      { name: 'minStockLevel', label: 'Low Stock Warning', type: 'number', placeholder: '5', required: true }
    ]
  }
];

// 2. DATA FORMATTER
const formatInventoryData = (data) => ({
  partName: data.partName,
  sku: data.sku,
  supplierId: data.supplierId,
  vehicleType: Array.isArray(data.vehicleType) ? data.vehicleType : [data.vehicleType],
  costPrice: Number(data.costPrice),
  sellingPrice: Number(data.sellingPrice),
  currentStock: Number(data.currentStock),
  minStockLevel: Number(data.minStockLevel || 5),
  specifications: {
    fuelType: data.fuelType || 'N/A',
    emissionStandard: data.emissionStandard || 'N/A',
    voltage: data.voltage || '12V'
  }
});

const flattenInitialData = (item) => {
  if (!item) return null;
  return {
    ...item,
    vehicleType: item.vehicleType?.[0] || '', 
    supplierId: item.supplierId?._id || item.supplierId,
    fuelType: item.specifications?.fuelType || 'N/A',
    emissionStandard: item.specifications?.emissionStandard || 'N/A',
    voltage: item.specifications?.voltage || '12V'
  };
};

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient('/inventory', 'GET');
      if (response.success && response.data) {
        setInventory(response.data);
      }
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to load inventory data");
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const closeAllModals = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setSelectedItem(null);
    fetchInventory(); 
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
    if (window.confirm("Are you sure you want to delete this auto part?")) {
      const toastId = toast.loading("Deleting part..."); 
      try {
        const response = await apiClient(`/inventory/${id}`, 'DELETE');
        if (response.success) {
          toast.success("Part deleted successfully!", { id: toastId }); 
          fetchInventory(); 
        } else {
          toast.error(response.message || "Failed to delete the part.", { id: toastId }); 
        }
      } catch (err) { 
        toast.error("Network error while trying to delete.", { id: toastId });
      }
    }
  };

  // ✨ UPDATED FILTERING LOGIC (Only "All" and "Low Stock")
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.partName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Low Stock') {
      // Shows any item that has hit or dropped below the warning limit
      matchesFilter = item.currentStock <= item.minStockLevel;
    }

    return matchesSearch && matchesFilter;
  });

  const filterOptions = ['All', 'Low Stock'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your auto parts and stock levels</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition whitespace-nowrap">
          + Add New Part
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Search by Name / SKU */}
        <div className="relative w-full lg:w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Part Name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
          <FunnelIcon className="w-5 h-5 text-gray-400 mr-1 flex-shrink-0" />
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex-shrink-0 ${
                activeFilter === filter 
                  ? 'bg-blue-600 text-white border border-blue-600' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {isLoading ? <Loader /> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold tracking-wider">
                <th className="p-4 border-b">Part Name & SKU</th>
                <th className="p-4 border-b hidden md:table-cell">Category</th>
                <th className="p-4 border-b hidden lg:table-cell">Cost Price</th>
                <th className="p-4 border-b">Selling Price</th>
                <th className="p-4 border-b">Stock Qty</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 border-b transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{item.partName}</div>
                    <div className="text-sm text-gray-500 font-mono mt-0.5">{item.sku}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-gray-800 font-medium">{item.vehicleType?.join(', ')}</div>
                    <div className="text-xs text-gray-500">{item.specifications?.fuelType}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-500 hidden lg:table-cell">₹{item.costPrice?.toLocaleString('en-IN') || 0}</td>
                  <td className="p-4 font-black text-blue-600">₹{item.sellingPrice?.toLocaleString('en-IN') || 0}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-lg">{item.currentStock}</span> 
                      {item.currentStock === 0 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap">Out of Stock</span>
                      ) : item.currentStock <= item.minStockLevel ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap">Low Stock</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap">In Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleView(item)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition" title="View"><EyeIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleEdit(item)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-full transition" title="Edit"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <p className="text-lg font-bold text-gray-700">No items found.</p>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                    {(searchTerm || activeFilter !== 'All') && (
                      <button 
                        onClick={() => { setSearchTerm(''); setActiveFilter('All'); }} 
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

      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all p-4">
         <DynamicForm 
            title="Auto Part"
            apiUrl="/inventory" 
            schema={inventorySchema} 
            initialData={isEditOpen ? selectedItem : null} 
            formatData={formatInventoryData}
            onSuccess={closeAllModals}
            onClose={closeAllModals}
          />
        </div>
      )}

      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedItem.partName}</h2>
                <p className="text-blue-200 text-sm mt-1 font-mono">{selectedItem.sku}</p>
              </div>
              <button onClick={closeAllModals} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cost Price</p>
                  <p className="text-lg font-semibold text-gray-700">₹{selectedItem.costPrice?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Selling Price</p>
                  <p className="text-lg font-black text-blue-800">₹{selectedItem.sellingPrice?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Gross Profit per Unit</span>
                <span className="font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full">
                  + ₹{(selectedItem.sellingPrice - selectedItem.costPrice).toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Current Stock</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm ${selectedItem.currentStock === 0 ? 'bg-red-100 text-red-700' : selectedItem.currentStock <= selectedItem.minStockLevel ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {selectedItem.currentStock} Units
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Vehicle Type:</span><span className="font-semibold text-gray-800">{selectedItem.vehicleType?.join(', ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Fuel Type:</span><span className="font-semibold text-gray-800">{selectedItem.specifications?.fuelType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Emission:</span><span className="font-semibold text-gray-800">{selectedItem.specifications?.emissionStandard}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Voltage:</span><span className="font-semibold text-gray-800">{selectedItem.specifications?.voltage || 'N/A'}</span></div>
                </div>
              </div>
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

export default Inventory;
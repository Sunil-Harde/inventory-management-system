// File: src/pages/Inventory.jsx
import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import Loader from '../components/Loader';
import { EyeIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// 👇 Set your API base URL here. Change this to your live Render URL when ready!
const API_BASE = "http://localhost:5000"; 
// Example: const API_BASE = "https://your-inventory-api.onrender.com";

// 1. INSTRUCTIONS FOR THE UNIVERSAL FORM
const inventorySchema = [
  {
    sectionTitle: 'Basic Details',
    columns: 2, 
    fields: [
      { name: 'partName', label: 'Part Name', type: 'text', placeholder: 'e.g. BS6 Wiring Harness', required: true },
      { name: 'sku', label: 'SKU (Barcode)', type: 'text', placeholder: 'WH-APE-BS6-101', required: true },
      // API_BASE injected here:
      { name: 'supplierId', label: 'Supplier', type: 'async-select', fetchUrl: `${API_BASE}/api/suppliers`, displayKey: 'companyName', required: true },
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
    sectionTitle: 'Inventory & Pricing',
    columns: 3, 
    fields: [
      { name: 'price', label: 'Price (₹)', type: 'number', placeholder: '1200', required: true },
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
  price: Number(data.price),
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
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      // API_BASE injected here:
      const response = await fetch(`${API_BASE}/api/inventory`);
      const result = await response.json();
      if (result.status === "success" || result.data) setInventory(result.data);
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to load inventory data");
    } 
    finally { setIsLoading(false); }
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
        // API_BASE injected here:
        const res = await fetch(`${API_BASE}/api/inventory/${id}`, { method: 'DELETE' });
        
        if (res.ok) {
          toast.success("Part deleted successfully!", { id: toastId }); 
          fetchInventory(); 
        } else {
          toast.error("Failed to delete the part.", { id: toastId }); 
        }
      } catch (err) { 
        toast.error("Network error while trying to delete.", { id: toastId });
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your auto parts and stock levels</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
          + Add New Part
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {isLoading ? <Loader /> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
                <th className="p-4 border-b">Part Name & SKU</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b">Stock Level</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 border-b transition">
                  <td className="p-4"><div className="font-bold text-gray-800">{item.partName}</div><div className="text-sm text-gray-500">{item.sku}</div></td>
                  <td className="p-4"><div className="text-gray-800">{item.vehicleType?.join(', ')}</div><div className="text-xs text-gray-500">{item.specifications?.fuelType}</div></td>
                  <td className="p-4 font-semibold text-gray-700">₹{item.price}</td>
                  <td className="p-4"><span className="font-bold text-gray-800">{item.currentStock}</span> <span className="text-sm text-gray-400">/ {item.minStockLevel} min</span></td>
                  <td className="p-4">
                    {item.currentStock <= item.minStockLevel ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">In Stock</span>
                    )}
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
            </tbody>
          </table>
        )}
      </div>

      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all ">
         <DynamicForm 
            title="Auto Part"
            // API_BASE injected here:
            apiUrl={`${API_BASE}/api/inventory`}
            schema={inventorySchema} 
            initialData={isEditOpen ? selectedItem : null} 
            formatData={formatInventoryData}
            onSuccess={closeAllModals}
            onClose={closeAllModals}
          />
        </div>
      )}

      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
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
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Price</span>
                <span className="text-xl font-bold text-green-600">₹{selectedItem.price}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Current Stock</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm ${selectedItem.currentStock <= selectedItem.minStockLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
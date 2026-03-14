// File: src/components/EditForm.jsx
import React, { useState, useEffect } from 'react';

function EditForm({ closeForm, initialData }) {
  // Pre-fill the state with the data from the selected item
  const [product, setProduct] = useState({
    partName: initialData?.partName || '',
    sku: initialData?.sku || '',
    supplierId: initialData?.supplierId?._id || initialData?.supplierId || '',
    vehicleType: initialData?.vehicleType?.[0] || '',
    price: initialData?.price || '',
    currentStock: initialData?.currentStock || '',
    minStockLevel: initialData?.minStockLevel || '5',
    fuelType: initialData?.specifications?.fuelType || 'N/A',
    emissionStandard: initialData?.specifications?.emissionStandard || 'N/A',
    voltage: initialData?.specifications?.voltage || '12V'
  });

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/suppliers');
        const result = await response.json();
        if (result.status === "success" || result.data) {
          setSuppliers(result.data); 
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      partName: product.partName,
      sku: product.sku,
      supplierId: product.supplierId, 
      vehicleType: [product.vehicleType],
      price: Number(product.price), 
      currentStock: Number(product.currentStock),
      minStockLevel: Number(product.minStockLevel),
      specifications: {
        fuelType: product.fuelType,
        emissionStandard: product.emissionStandard,
        voltage: product.voltage
      }
    };

    try {
      // Notice this is a PUT request using the item's ID!
      const response = await fetch(`http://localhost:5000/api/inventory/${initialData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Auto Part updated successfully!');
        closeForm(); 
      } else {
        alert('Error updating part: ' + (result.message || 'Check console'));
      }
    } catch (error) {
      alert('Failed to connect to the server.');
    }
  };

  return (
    <div className='flex items-center justify-center p-4 w-full'>
      <form onSubmit={handleSubmit} className='bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8 space-y-5 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-1'>
          <h2 className='text-2xl font-bold text-gray-800'>Edit Auto Part</h2>
          <button type="button" onClick={closeForm} className="text-gray-400 hover:text-red-500 text-2xl font-bold transition">✕</button>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* --- BASIC DETAILS --- */}
        <h3 className="text-lg font-bold text-gray-700 mb-2">Basic Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className='block text-gray-700 font-semibold mb-2 text-sm'>Part Name</label>
             <input name='partName' value={product.partName} onChange={handleChange} className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500' required />
          </div>
          <div>
             <label className='block text-gray-700 font-semibold mb-2 text-sm'>SKU (Barcode)</label>
             <input name='sku' value={product.sku} onChange={handleChange} className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500' required />
          </div>
          <div>
            <label className='block text-gray-700 font-semibold mb-2 text-sm'>Supplier</label>
            <select name='supplierId' value={product.supplierId} onChange={handleChange} className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500' required>
              <option value="">--Select Supplier--</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>{supplier.companyName || supplier.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-gray-700 font-semibold mb-2 text-sm'>Vehicle Type</label>
            <select name='vehicleType' value={product.vehicleType} onChange={handleChange} className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500' required>
              <option value="">--Select Type--</option>
              <option value="2W">2-Wheeler (2W)</option>
              <option value="3W">3-Wheeler (3W)</option>
              <option value="4W">4-Wheeler (4W)</option>
              <option value="EV">Electric (EV)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* --- SPECIFICATIONS --- */}
        <h3 className="text-lg font-bold text-gray-700 mb-2">Technical Specifications</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className='block text-gray-700 font-semibold mb-2 text-sm'>Fuel Type</label>
            <select name='fuelType' value={product.fuelType} onChange={handleChange} className='w-full p-2 border rounded-md'>
              <option value="N/A">N/A</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="CNG">CNG</option><option value="Electric">Electric</option>
            </select>
          </div>
          <div>
            <label className='block text-gray-700 font-semibold mb-2 text-sm'>Emission Standard</label>
            <select name='emissionStandard' value={product.emissionStandard} onChange={handleChange} className='w-full p-2 border rounded-md'>
              <option value="N/A">N/A</option><option value="BS3">BS3</option><option value="BS4">BS4</option><option value="BS6">BS6</option>
            </select>
          </div>
          <div>
             <label className='block text-gray-700 font-semibold mb-2 text-sm'>Voltage</label>
             <input name='voltage' value={product.voltage} onChange={handleChange} className='w-full p-2 border rounded-md' />
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* --- INVENTORY & PRICING --- */}
        <h3 className="text-lg font-bold text-gray-700 mb-2">Inventory & Pricing</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
             <label className='block text-gray-700 font-semibold mb-2 text-sm'>Price (₹)</label>
             <input type="number" name='price' value={product.price} onChange={handleChange} className='w-full p-2 border rounded-md' required />
          </div>
          <div>
             <label className='block text-gray-700 font-semibold mb-2 text-sm'>Current Stock</label>
             <input type="number" name='currentStock' value={product.currentStock} onChange={handleChange} className='w-full p-2 border rounded-md' required />
          </div>
          <div>
             <label className='block text-gray-700 font-semibold mb-2 text-sm'>Low Stock Warning</label>
             <input type="number" name='minStockLevel' value={product.minStockLevel} onChange={handleChange} className='w-full p-2 border rounded-md' required />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="bg-amber-500 text-white font-bold px-6 py-3 rounded-md w-full hover:bg-amber-600 transition shadow-md">
            Update Auto Part
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditForm;
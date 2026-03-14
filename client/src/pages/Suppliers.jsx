// File: src/pages/Suppliers.jsx
import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import Loader from '../components/Loader';
import { EyeIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';

// 1. INSTRUCTIONS FOR THE UNIVERSAL FORM
const supplierSchema = [
    {
        sectionTitle: 'Company Details',
        columns: 2,
        fields: [
            { name: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g. ABC Supplies Ltd', required: true },
            { name: 'phone', label: 'Phone Number', type: 'number', placeholder: '+1-555-123-4567', required: true }
        ]
    },
    {
        sectionTitle: 'Contact Information',
        columns: 2,
        fields: [
            { name: 'contactPerson', label: 'Contact Person', type: 'text', placeholder: 'e.g. John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'contact@abcsupplies.com' }
        ]
    },
    {
        sectionTitle: 'Location',
        columns: 1,
        fields: [
            { name: 'address', label: 'Full Address', type: 'text', placeholder: '123 Main Street, New York, NY 10001' }
        ]
    }
];

// 2. DATA FORMATTER
const formatSupplierData = (data) => ({
    companyName: data.companyName,
    phone: data.phone,
    contactPerson: data.contactPerson || '',
    email: data.email || '',
    address: data.address || ''
});

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchSuppliers = async () => {
        setIsLoading(true);
        const response = await apiClient('/suppliers', 'GET');

        if (response.success && response.data) {
            setSuppliers(response.data);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchSuppliers(); }, []);

    const closeAllModals = () => {
        setIsAddOpen(false);
        setIsEditOpen(false);
        setIsViewOpen(false);
        setSelectedItem(null);
        fetchSuppliers();
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setIsEditOpen(true);
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setIsViewOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            const toastId = toast.loading("Deleting supplier...");

            const response = await apiClient(`/suppliers/${id}`, 'DELETE');

            if (response.success) {
                toast.success("Supplier deleted successfully!", { id: toastId });
                fetchSuppliers();
            } else {
                toast.error(response.message || "Failed to delete the supplier.", { id: toastId });
            }
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
                    <p className="text-gray-500 mt-1">Manage your vendors and contact information</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
                    + Add Supplier
                </button>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {isLoading ? <Loader /> : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
                                <th className="p-4 border-b">Company Name</th>
                                <th className="p-4 border-b">Contact Person</th>
                                <th className="p-4 border-b">Phone & Email</th>
                                <th className="p-4 border-b hidden md:table-cell">Address</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 border-b transition">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{item.companyName}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-800 font-medium">{item.contactPerson || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-700">{item.phone}</div>
                                        <div className="text-sm text-gray-500">{item.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">
                                        {item.address || 'N/A'}
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
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No suppliers found. Click "Add Supplier" to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- ADD OR EDIT MODAL (Using Dynamic Universal Form) --- */}
            {(isAddOpen || isEditOpen) && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all">
                    <DynamicForm
                        title="Supplier"
                        apiUrl="/suppliers"
                        schema={supplierSchema}
                        initialData={isEditOpen ? selectedItem : null}
                        formatData={formatSupplierData}
                        onSuccess={closeAllModals}
                        onClose={closeAllModals}
                    />
                </div>
            )}

            {/* --- VIEW DETAILS MODAL --- */}
            {isViewOpen && selectedItem && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-indigo-600 p-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedItem.companyName}</h2>
                                <p className="text-indigo-200 text-sm mt-1 font-mono">Supplier ID: {selectedItem._id.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-white hover:text-red-200 transition">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Contact Info</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Person:</span><span className="font-semibold text-gray-800">{selectedItem.contactPerson || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-semibold text-blue-600">{selectedItem.phone}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-semibold text-gray-800">{selectedItem.email || 'N/A'}</span></div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <span className="block text-sm text-gray-500 mb-1">Registered Address</span>
                                <span className="block text-md font-medium text-gray-800 leading-relaxed">
                                    {selectedItem.address || 'No address provided.'}
                                </span>
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

export default Suppliers;
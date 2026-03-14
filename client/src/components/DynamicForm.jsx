// File: src/components/DynamicForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';

function DynamicForm({
  title,
  schema,
  apiUrl,
  initialData,
  onSuccess,
  onClose,
  formatData
}) {
  const [formData, setFormData] = useState({});
  const [asyncOptions, setAsyncOptions] = useState({});

  const isEdit = Boolean(initialData?._id);

  const getCleanEndpoint = (url) => {
    if (!url) return '';
    return url.replace('http://localhost:5000/api', '');
  };

  useEffect(() => {
    if (initialData) setFormData(initialData);

    schema.forEach(section => {
      section.fields.forEach(async (field) => {

        // ✨ THE FIX: We tell it to look for EITHER fetchEndpoint OR fetchUrl!
        const fetchTarget = field.fetchEndpoint || field.fetchUrl;

        if (field.type === 'async-select' && fetchTarget) {
          try {
            const endpoint = getCleanEndpoint(fetchTarget);
            const response = await apiClient(endpoint, 'GET');

            if (response.success && response.data) {
              setAsyncOptions(prev => ({ ...prev, [field.name]: response.data }));
            }
          } catch (err) {
            console.error(`Failed to fetch options for ${field.name}`);
          }
        }
      });
    });
  }, [initialData, schema]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalData = formatData ? formatData(formData) : formData;

    const targetUrl = isEdit ? `${apiUrl}/${initialData._id}` : apiUrl;
    const method = isEdit ? 'PUT' : 'POST';
    const cleanEndpoint = getCleanEndpoint(targetUrl);

    const toastId = toast.loading(`Saving ${title}...`);

    try {
      const response = await apiClient(cleanEndpoint, method, finalData);

      if (response.success) {
        const successMessage = isEdit ? `${title} updated successfully!` : `${title} added successfully!`;
        toast.success(successMessage, { id: toastId });
        onSuccess();
      } else {
        if (response.message && response.message.toLowerCase().includes('duplicate')) {
          toast.error(`Wait! This ${title} already exists in the database.`, { id: toastId });
        } else {
          toast.error(response.message || 'Failed to save data.', { id: toastId });
        }
      }
    } catch (error) {
      toast.error('Network Error. Is your backend server running?', { id: toastId });
    }
  };

  return (
    <div className='flex items-center justify-center p-4 w-full'>
      <form onSubmit={handleSubmit} className='bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto'>

        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>{isEdit ? `Edit ${title}` : `Add New ${title}`}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* LOOP THROUGH SECTIONS */}
        <div className="space-y-6">
          {schema.map((section, secIndex) => (
            <div key={secIndex}>

              {secIndex > 0 && <div className="border-t border-gray-200 my-6"></div>}

              {section.sectionTitle && (
                <h3 className="text-[1.1rem] font-bold text-gray-800 mb-4">{section.sectionTitle}</h3>
              )}

              <div className={`grid gap-4 ${section.columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                {section.fields.map((field, fIndex) => {

                  // ✨ Includes your 'email' fix from earlier!
                  if (['text', 'number', 'email', 'password', 'date', 'tel'].includes(field.type)) {
                    return (
                      <div key={fIndex}>
                        <label className='block text-gray-700 font-semibold mb-1.5 text-sm'>{field.label}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          placeholder={field.placeholder || ''}
                          required={field.required}
                          className='w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-shadow'
                        />
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={fIndex}>
                        <label className='block text-gray-700 font-semibold mb-1.5 text-sm'>{field.label}</label>
                        <select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          className='w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white'
                        >
                          <option value="">--Select {field.label}--</option>
                          {field.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'async-select') {
                    const options = asyncOptions[field.name] || [];
                    return (
                      <div key={fIndex}>
                        <label className='block text-gray-700 font-semibold mb-1.5 text-sm'>{field.label}</label>
                        <select
                          name={field.name}
                          value={formData[field.name] || (initialData && initialData[field.name]?._id) || ''}
                          onChange={handleChange}
                          required={field.required}
                          className='w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white'
                        >
                          <option value="">--Select {field.label}--</option>
                          {options.map((opt) => (
                            <option key={opt._id} value={opt._id}>
                              {opt[field.displayKey] || opt.companyName || opt.phone}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM DIVIDER & BUTTONS */}
        <div className="border-t border-gray-200 my-6"></div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition shadow-sm">
            {isEdit ? 'Update Details' : `Save ${title}`}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-md hover:bg-gray-300 transition">
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

export default DynamicForm;
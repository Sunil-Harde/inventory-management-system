// File: src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';
import { TrashIcon, XMarkIcon, ShieldCheckIcon, UserIcon, StarIcon } from '@heroicons/react/24/outline';

const ROLE_STYLES = {
  Admin:   { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Manager: { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' },
  Staff:   { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200' },
};

function Users() {
  const [users, setUsers]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff' });

  const loggedInUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // ✅ Correct endpoint for admin listing all users
      const response = await apiClient('/users', 'GET');
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters.");

    const toastId = toast.loading("Creating user account...");
    try {
      // ✅ FIX: Correct endpoint is /users/register, not /users
      const response = await apiClient('/register', 'POST', formData);
      if (response.success) {
        toast.success("User created successfully!", { id: toastId });
        setIsAddOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'Staff' });
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to create user.", { id: toastId });
      }
    } catch {
      toast.error("Network Error.", { id: toastId });
    }
  };

  const handleDelete = async (id, name) => {
    // Prevent self-deletion
    if (loggedInUser._id === id) return toast.error("You cannot delete your own account.");

    if (window.confirm(`Revoke access for "${name}"? This cannot be undone.`)) {
      const toastId = toast.loading("Revoking access...");
      try {
        const response = await apiClient(`/users/${id}`, 'DELETE');
        if (response.success) {
          toast.success("User access revoked.", { id: toastId });
          fetchUsers();
        } else {
          toast.error(response.message || "Failed to delete user.", { id: toastId });
        }
      } catch {
        toast.error("Network error.", { id: toastId });
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Staff & Users</h1>
          <p className="text-gray-500 mt-1">Manage system access and team roles</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <UserIcon className="w-5 h-5" /> Add New User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {isLoading ? <Loader /> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold tracking-wider">
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Role</th>
                <th className="p-4 border-b hidden md:table-cell">Date Added</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const style = ROLE_STYLES[user.role] || ROLE_STYLES.Staff;
                const isSelf = loggedInUser._id === user._id;
                return (
                  <tr key={user._id} className={`border-b transition ${isSelf ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-800">{user.name}</span>
                          {isSelf && <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${style.bg} ${style.text} ${style.border}`}>
                        {user.role === 'Admin'   && <ShieldCheckIcon className="w-3.5 h-3.5" />}
                        {user.role === 'Manager' && <StarIcon className="w-3.5 h-3.5" />}
                        {user.role === 'Staff'   && <UserIcon className="w-3.5 h-3.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        disabled={isSelf}
                        title={isSelf ? "Cannot delete yourself" : "Revoke access"}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Add Staff Member</h2>
                <p className="text-blue-200 text-sm mt-1">Create system login credentials</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-white hover:text-red-200 transition">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Rahul Sharma' },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'rahul@inventiq.com' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">{label} <span className="text-red-500">*</span></label>
                  <input
                    type={type} required placeholder={placeholder}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required minLength={6} placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Share this with the staff member so they can log in.</p>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm">Access Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Staff">Staff — Standard access</option>
                  <option value="Manager">Manager — Can manage inventory & transactions</option>
                  <option value="Admin">Admin — Full system access</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md">
                  Create User
                </button>
                <button type="button" onClick={() => setIsAddOpen(false)} className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
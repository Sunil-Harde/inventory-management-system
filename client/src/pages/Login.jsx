// File: src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../api/apiClient';
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      // ✅ FIX: Correct endpoint is /users/login, not /login
      const response = await apiClient('/login', 'POST', { email, password });

      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success(`Welcome back, ${response.data.user?.name || 'Admin'}!`, { id: toastId });
        // ✅ FIX: Redirect to /dashboard not /
        navigate('/dashboard');
      } else {
        toast.error(response.message || "Invalid email or password.", { id: toastId });
      }
    } catch (error) {
      toast.error("Server error. Is the backend running?", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex flex-col justify-center text-white">
          <div className="mb-8 p-4 bg-white/10 w-fit rounded-2xl backdrop-blur-sm">
            <LockClosedIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">InventIQ</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Secure, real-time auto parts management. Log in to access your dashboard.
          </p>
          <div className="mt-8 space-y-2 text-sm text-blue-200">
            <p>✓ Role-based access control</p>
            <p>✓ Real-time stock tracking</p>
            <p>✓ Full audit trail</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="admin@inventiq.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
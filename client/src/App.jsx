// File: src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Transactions from './pages/Transactions';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import Users from './pages/User'; // ✨ 1. ADDED THIS IMPORT!

// Import Components
import Sidebar from './components/Sidebar';

// The Security Guard Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const isLoginPage = window.location.pathname === '/login';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Toaster position="top-right" richColors />
      
      {!isLoginPage && <Sidebar />}

      <div className="flex-1 overflow-x-hidden">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/stock-in" element={<ProtectedRoute><StockIn /></ProtectedRoute>} />
          <Route path="/stock-out" element={<ProtectedRoute><StockOut /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          
          {/* ✨ 2. ADDED THE USERS ROUTE HERE! */}
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          
          {/* ✨ Optional: Catch-all route. If a user types a weird URL, send them to the Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
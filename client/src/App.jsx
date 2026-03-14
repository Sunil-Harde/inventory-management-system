// File: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner'; // ✨ 1. Import Sonner

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers'; // <-- Import it here!
import Transactions from './pages/Transactions';
function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} /> {/* <-- Add Route here! */}
            <Route path="/transactions" element={<Transactions />} /> {/* ✨ Add this line! */}
          </Routes>
        </div>
      </div>

      {/* ✨ 2. Add Toaster (richColors makes success green and error red) */}
      <Toaster position="top-right" richColors closeButton />
      
    </Router>
  );
}

export default App;
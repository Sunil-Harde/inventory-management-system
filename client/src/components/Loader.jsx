// File: src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center w-full py-20">
      <div className="relative flex justify-center items-center">
        {/* Outer glowing ring */}
        <div className="absolute animate-ping w-12 h-12 rounded-full border-2 border-blue-400 opacity-20"></div>
        {/* Inner spinning ring */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
};

export default Loader;
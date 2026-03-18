// File: src/components/Loader.jsx
import React from "react";

// size: "sm" | "md" (default) | "lg"
// fullPage: centers it in the whole viewport
const Loader = ({ size = "md", fullPage = false }) => {
  const sizeMap = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-14 w-14 border-[3px]",
  };

  const spinner = (
    <div className="flex items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-blue-200 border-t-blue-600 ${sizeMap[size]}`}
      />
      {size !== "sm" && (
        <span className="text-sm text-gray-400 font-medium animate-pulse">
          Loading...
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full py-16">
      {spinner}
    </div>
  );
};

export default Loader;
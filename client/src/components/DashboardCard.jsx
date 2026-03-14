import React from "react";

const DashboardCard = ({ title, value, icon, bg, iconBg, textColor }) => {
  return (
    <div
      className={`h-full w-full rounded-2xl p-5 shadow-sm ${bg}
     flex flex-col items-center justify-center text-center
     transition hover:shadow-md`}
    >
      {/* Icon */}
      <div
        className={`w-16 h-16 flex items-center justify-center 
        rounded-full ${iconBg} mb-6`}
      >
        {icon && React.createElement(icon, { className: `w-8 h-8 ${textColor}` })}
      </div>

      {/* Value */}
      <h2 className={`text-4xl font-bold ${textColor}`}>
        {value}
      </h2>

      {/* Title */}
      <p className="text-sm mt-3 tracking-wide uppercase text-gray-500 font-semibold">
        {title}
      </p>
    </div>
  );
};

export default DashboardCard;
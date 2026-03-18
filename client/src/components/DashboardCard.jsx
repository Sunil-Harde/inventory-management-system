// File: src/components/DashboardCard.jsx
import React from "react";

/**
 * Props:
 *  title      – string  e.g. "Inventory Value"
 *  value      – string  e.g. "₹21,001"
 *  icon       – Heroicon component
 *  bg         – Tailwind bg class for card  e.g. "bg-white"
 *  iconBg     – Tailwind bg class for icon circle e.g. "bg-blue-50"
 *  textColor  – Tailwind text class for icon & value e.g. "text-blue-600"
 *  sublabel   – (optional) small line below value e.g. "2W · 3W · 4W · EV"
 *  trend      – (optional) { value: "+₹2,400", positive: true }
 *  alert      – (optional) boolean — highlights card in red for low-stock etc.
 */
const DashboardCard = ({
  title,
  value,
  icon,
  bg = "bg-white",
  iconBg,
  textColor,
  sublabel,
  trend,
  alert = false,
}) => {
  return (
    <div
      className={`relative rounded-2xl p-5 shadow-sm border transition hover:shadow-md
        ${alert
          ? "bg-red-50 border-red-200"
          : `${bg} border-gray-100`
        }`}
    >
      {/* Alert pulse dot */}
      {alert && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
      )}

      {/* Icon + Title row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0
          ${alert ? "bg-red-100" : iconBg}`}>
          {icon && React.createElement(icon, {
            className: `w-5 h-5 ${alert ? "text-red-500" : textColor}`,
          })}
        </div>
        <p className={`text-xs uppercase tracking-widest font-semibold
          ${alert ? "text-red-400" : "text-gray-400"}`}>
          {title}
        </p>
      </div>

      {/* Value */}
      <h2 className={`text-3xl font-bold leading-none
        ${alert ? "text-red-600" : textColor}`}>
        {value}
      </h2>

      {/* Sublabel */}
      {sublabel && (
        <p className={`text-xs mt-1.5 font-medium
          ${alert ? "text-red-400" : "text-gray-400"}`}>
          {sublabel}
        </p>
      )}

      {/* Trend badge */}
      {trend && (
        <div className="mt-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
            ${trend.positive
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
            }`}>
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: 'from-blue-500 to-indigo-600 text-blue-600 bg-blue-50',
    green: 'from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50',
    amber: 'from-amber-500 to-orange-600 text-amber-600 bg-amber-50',
    red: 'from-rose-500 to-pink-600 text-rose-600 bg-rose-50',
    purple: 'from-purple-500 to-indigo-600 text-purple-600 bg-purple-50',
  };

  const bgClasses = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
          {(trend || subtitle) && (
            <p className="text-xs text-slate-500 mt-2 flex items-center font-medium">
              {trend && <span className="text-emerald-600 font-semibold mr-1.5">{trend}</span>}
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl ${bgClasses.split(' ').slice(2).join(' ')} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

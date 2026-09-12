import React from 'react';

export const BarChartCard = ({ title, data = [], emptyText = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 mb-4">{title}</h4>
        <p className="text-xs text-slate-400 py-8 text-center">{emptyText}</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

  const colors = [
    'bg-brand-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h4>
      </div>
      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {data.map((item, index) => {
          const percentage = Math.round(((item.value || 0) / maxValue) * 100);
          const barColor = colors[index % colors.length];
          return (
            <div key={item.name || index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 ml-2">{item.value}</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChartCard;

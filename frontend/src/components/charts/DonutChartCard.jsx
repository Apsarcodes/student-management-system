import React from 'react';

export const DonutChartCard = ({ title, data = [], emptyText = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 mb-4">{title}</h4>
        <p className="text-xs text-slate-400 py-8 text-center">{emptyText}</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  const colorPalette = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
  ];

  let cumulativePercent = 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-4">{title}</h4>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="18"
              cy="18"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="4"
            />
            {total > 0 &&
              data.map((item, idx) => {
                const val = Number(item.value) || 0;
                const percent = (val / total) * 100;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = -cumulativePercent;
                cumulativePercent += percent;
                const strokeColor = colorPalette[idx % colorPalette.length];

                return (
                  <circle
                    key={item.name || idx}
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth="4"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">{total}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            const percent = total > 0 ? Math.round((val / total) * 100) : 0;
            const color = colorPalette[idx % colorPalette.length];

            return (
              <div key={item.name || idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-medium text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="flex items-center space-x-1 font-semibold text-slate-900 ml-2">
                  <span>{val}</span>
                  <span className="text-slate-400 text-[11px] font-normal">({percent}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChartCard;

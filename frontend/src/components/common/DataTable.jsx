import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  sortBy,
  sortDirection,
  onSort,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <LoadingSpinner size="lg" text="Loading table data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3 px-3 sm:py-3.5 sm:px-6 ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors select-none' : ''
                  }`}
                  onClick={() => col.sortable && onSort && onSort(col.sortKey || col.key || col.accessor)}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortBy === (col.sortKey || col.key || col.accessor) ? (
                          sortDirection === 'ASC' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-3 px-3 sm:py-4 sm:px-6 align-middle">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

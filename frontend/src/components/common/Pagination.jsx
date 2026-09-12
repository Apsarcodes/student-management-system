import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-slate-200/80 text-sm text-slate-600">
      <div>
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalElements}</span> results
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-slate-700"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
          .map((page, index, array) => {
            const showEllipsis = index > 0 && page - array[index - 1] > 1;
            return (
              <React.Fragment key={page}>
                {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page + 1}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-slate-700"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

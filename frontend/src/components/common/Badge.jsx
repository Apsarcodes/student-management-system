import React from 'react';

export const Badge = ({ variant = 'default', children, size = 'md' }) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const getVariantStyles = () => {
    switch (variant.toLowerCase()) {
      case 'active':
      case 'present':
      case 'success':
      case 'a+':
      case 'a':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      case 'inactive':
      case 'warning':
      case 'b+':
      case 'b':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      case 'absent':
      case 'f':
      case 'danger':
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      case 'c':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20';
      case 'graduated':
      case 'info':
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
      case 'faculty':
      case 'staff':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20';
      case 'student':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-1 ring-cyan-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-500/10';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyles[size]} ${getVariantStyles()}`}
    >
      {children}
    </span>
  );
};

export default Badge;

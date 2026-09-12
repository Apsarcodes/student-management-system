import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Access Restricted</h2>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        You do not have administrative privileges to access this page. Please contact your system administrator if you believe this is an error.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default Unauthorized;

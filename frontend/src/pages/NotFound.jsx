import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
      <div className="w-16 h-16 rounded-3xl bg-slate-200 text-slate-600 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        The page or resource you requested could not be located in the student management system.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;

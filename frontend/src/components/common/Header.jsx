import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const Header = ({ onToggleSidebar, pendingCount = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Academic Portal
          </span>
          <p className="text-sm font-medium text-slate-700 sm:text-xs sm:text-slate-400">{today}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real-time system status indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-700 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide text-[11px] uppercase">Live Sync</span>
        </div>

        {/* Admin Notification Bell for pending student requests */}
        {isAdmin && (
          <Link
            to="/users?tab=requests"
            className="relative p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            title={pendingCount > 0 ? `${pendingCount} student registration requests pending approval` : 'Student Requests'}
          >
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Link>
        )}

        {user?.role === 'STAFF' && user?.departmentCode && (
          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            {user.departmentCode} Department
          </span>
        )}

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 capitalize">
                {user?.role === 'STAFF' && user?.departmentCode
                  ? `Faculty • ${user.departmentCode}`
                  : user?.role?.toLowerCase()}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/profile#password"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span>Change Password</span>
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

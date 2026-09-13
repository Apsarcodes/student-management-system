import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BookOpen,
  Library,
  CalendarCheck,
  Award,
  BarChart3,
  Users,
  LogOut,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, pendingCount = 0 }) => {
  const { user, isAdmin, isStudent, logout } = useAuth();

  const staffNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: GraduationCap },
    { label: 'Departments', path: '/departments', icon: Building2 },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Subjects', path: '/subjects', icon: Library },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Marks & Grades', path: '/marks', icon: Award },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'User Management', path: '/users', icon: Users, badge: pendingCount > 0 ? pendingCount : null }] : []),
  ];

  const studentNavItems = [
    { label: 'My Portal', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: UserCheck },
    { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'My Marks & Grades', path: '/student/marks', icon: Award },
    { label: 'Curriculum & Subjects', path: '/student/subjects', icon: Library },
  ];

  const navItems = isStudent ? studentNavItems : staffNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                EduTrack Pro
              </h1>
              <p className="text-xs text-slate-400 font-medium">Student Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {isStudent ? 'Student Portal' : 'Main Menu'}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300/60 shadow-2xs animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <NavLink
            to="/profile"
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white transition-colors group mb-2"
          >
            <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                {user?.fullName || 'User'}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                ) : user?.role === 'STUDENT' ? (
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="text-xs text-slate-500 font-medium capitalize">
                  {user?.role === 'ADMIN'
                    ? 'admin'
                    : user?.role === 'STUDENT'
                      ? 'student'
                      : user?.role === 'STAFF'
                        ? (user?.departmentCode ? `faculty • ${user.departmentCode}` : 'faculty')
                        : (user?.role || 'user').toLowerCase()}
                </span>
              </div>
            </div>
          </NavLink>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

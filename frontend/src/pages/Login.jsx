import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { GraduationCap, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    usernameOrEmail: 'admin@university.edu',
    password: 'Admin@123',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const loggedUser = await login(formData.usernameOrEmail, formData.password, formData.rememberMe);
      success('Logged in successfully!');
      const target = loggedUser?.role === 'STUDENT'
        ? '/student/dashboard'
        : (from === '/login' || from === '/student/dashboard' ? '/dashboard' : from);
      navigate(target, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill standard user credentials
  const fillCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        usernameOrEmail: 'admin@university.edu',
        password: 'Admin@123',
        rememberMe: true,
      });
    } else if (role === 'faculty') {
      setFormData({
        usernameOrEmail: 'faculty@university.edu',
        password: 'Faculty@123',
        rememberMe: true,
      });
    } else if (role === 'student') {
      setFormData({
        usernameOrEmail: 'student@university.edu',
        password: 'Student@123',
        rememberMe: true,
      });
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white shadow-xl shadow-brand-500/30 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">EduTrack Pro</h2>
        <p className="mt-2 text-sm text-slate-300">
          Sign in to access your administrative dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label mb-1.5">
                Email or Username
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                  placeholder="admin@university.edu"
                  className="form-input pl-10 pr-4"
                />
              </div>
            </div>

            <div>
              <label className="form-label mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="form-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand-600 border-slate-300 rounded-sm focus:ring-brand-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600 select-none">Remember login</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-600">
              <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Quick User Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click User Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="py-2 px-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-all text-slate-700 text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('faculty')}
                className="py-2 px-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-slate-700 text-center"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('student')}
                className="py-2 px-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 transition-all text-slate-700 text-center"
              >
                Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

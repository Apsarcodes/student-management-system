import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useToast } from '../components/common/Toast';
import { User, KeyRound, Shield, Mail, CheckCircle2, Save } from 'lucide-react';
import Badge from '../components/common/Badge';

export const Profile = () => {
  const { user, updateCurrentUser } = useAuth();
  const { success, error } = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      error('Full Name and Email are required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(profileForm);
      if (res.success && res.data) {
        updateCurrentUser({ ...user, ...res.data });
        success('Profile updated successfully.');
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('New password and confirmation password do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      error('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        success('Password updated successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal details and security credentials
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
            <Badge variant={user?.role}>{user?.role}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          <span className="text-[11px] font-mono text-slate-400">Username: @{user?.username}</span>
        </div>
      </div>

      {/* Edit Profile Information */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Personal Information</h4>
            <p className="text-xs text-slate-500">Update your primary contact and name details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div id="password" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Security & Password</h4>
            <p className="text-xs text-slate-500">Ensure your account is using a strong password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="••••••••"
              className="w-full sm:w-80 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingPassword ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

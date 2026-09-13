import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../components/common/Toast';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await authService.forgotPassword(email.trim());
      success('If an account exists, a reset code has been sent to your email.');
      navigate('/verify-otp', { state: { email: email.trim(), purpose: 'PASSWORD_RESET' }, replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to process your request.';
      setMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-brand-100 rounded-2xl p-3 text-brand-600">
            <KeyRound className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center">Forgot Password</h2>
        <p className="mt-2 text-sm text-slate-600 text-center">
          Enter your email to receive a reset OTP.
        </p>

        {message && (
          <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="form-label mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-md hover:from-brand-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

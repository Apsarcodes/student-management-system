import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../components/common/Toast';
import { ArrowLeft, CheckCircle2, RefreshCcw, ShieldCheck } from 'lucide-react';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const { email: stateEmail, purpose: statePurpose } = location.state || {};
  const initialEmail = stateEmail || '';
  const initialPurpose = statePurpose || 'PASSWORD_RESET';

  const [email, setEmail] = useState(initialEmail);
  const [purpose, setPurpose] = useState(initialPurpose);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setEmail(initialEmail);
    }
    if (!purpose) {
      setPurpose(initialPurpose);
    }
  }, [email, initialEmail, initialPurpose, purpose]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const canResend = useMemo(() => countdown <= 0, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      setMessage('Please enter your email and OTP.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const res = await authService.verifyOtp(email.trim(), otp.trim(), purpose);
      if (res?.success) {
        const msg = res.message || 'OTP verified successfully';
        setIsSuccess(true);
        setMessage(msg);
        success(msg);

        if (purpose === 'REGISTRATION') {
          navigate('/login', { replace: true });
          return;
        }

        navigate('/reset-password', {
          replace: true,
          state: { email: email.trim() },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed.';
      setMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email first.');
      return;
    }

    if (!canResend) return;

    setResendLoading(true);
    setMessage('');

    try {
      await authService.resendOtp(email.trim(), purpose);
      setCountdown(60);
      success('A new OTP has been sent.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to resend OTP.';
      setMessage(msg);
      error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-indigo-100 rounded-2xl p-3 text-indigo-600">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center">Verify OTP</h2>
        <p className="mt-2 text-sm text-slate-600 text-center">
          {purpose === 'REGISTRATION' ? 'Activate your account' : 'Reset your password'}
        </p>

        {message && (
          <div className={`mt-5 p-3 rounded-xl text-sm ${isSuccess ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <div>
            <label className="form-label mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="form-label mb-1.5">One-time password</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="form-input text-center tracking-[0.6rem] font-semibold"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-md hover:from-brand-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 disabled:text-slate-400"
          >
            <RefreshCcw className="w-4 h-4" />
            {resendLoading ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

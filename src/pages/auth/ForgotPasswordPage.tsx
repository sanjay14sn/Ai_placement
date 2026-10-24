import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../services';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Multi-step state: 'email' -> 'otp' -> 'success'
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');

  // Form values
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPasswordOtp(cleanEmail);
      toast.success(res?.message || 'Verification code sent to your email!');
      setStep('otp');
      setResendCooldown(60);
      // Focus first OTP input after switching step
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
      // Handle paste
      const pastedDigits = cleaned.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation between OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      await authApi.forgotPasswordOtp(email.trim().toLowerCase());
      toast.success('A new 6-digit verification code has been sent!');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPasswordOtp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
        password,
      });

      toast.success(res?.message || 'Password reset successfully!');
      setStep('success');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10 bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group mb-4">
            <img
              src="/aicampusos.png"
              alt="AI Campus OS"
              className="h-14 sm:h-16 w-auto object-contain mx-auto transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Account Recovery
          </div>
        </div>

        {/* ──────── STEP 1: ENTER EMAIL ──────── */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#0B1528] tracking-tight mb-2">
                Reset your password
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Enter your registered college or personal email address and we'll send a 6-digit OTP code to verify your account.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu.in"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm transition-all bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0B1528] hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending OTP Code...
                </>
              ) : (
                'Send Verification OTP'
              )}
            </button>
          </form>
        )}

        {/* ──────── STEP 2: ENTER OTP & NEW PASSWORD ──────── */}
        {step === 'otp' && (
          <form onSubmit={handleResetPassword}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#0B1528] tracking-tight mb-2">
                Verify OTP & Set Password
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                We've sent a 6-digit code to <strong className="text-slate-900">{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-[#0066FF] hover:underline font-semibold mt-1 inline-block cursor-pointer"
              >
                Change email address
              </button>
            </div>

            {/* 6 Digit OTP Inputs */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 text-center mb-2.5">
                6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all bg-slate-50"
                  />
                ))}
              </div>

              {/* Resend Code Link */}
              <div className="text-center mt-3">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-slate-400">
                    Resend code in <strong className="text-slate-600">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs text-[#0066FF] hover:underline font-bold cursor-pointer"
                  >
                    Resend 6-digit code
                  </button>
                )}
              </div>
            </div>

            {/* Password Inputs */}
            <div className="space-y-4 mb-6 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm transition-all bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0B1528] hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying OTP & Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* ──────── STEP 3: SUCCESS ──────── */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Password reset successfully!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Your account password has been updated. You can now log in using your new credentials.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-[#0B1528] hover:bg-slate-800 text-white font-semibold rounded-full text-sm transition-all shadow-sm cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        )}

        {/* Back to Login Footer */}
        {step !== 'success' && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

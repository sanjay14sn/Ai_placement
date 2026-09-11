import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock, GraduationCap, Building2 } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import { getDefaultRoute } from '../../utils';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('tpo@rvce.edu.in');
  const [password, setPassword] = useState('password123');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      setUser(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(getDefaultRoute(user.role));
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { role: 'College Admin', email: 'tpo@rvce.edu.in', color: 'text-[#08546c]' },
    { role: 'Student', email: 'arjun.sharma@rvce.edu.in', color: 'text-[#08546c]' },
    { role: 'Recruiter', email: 'hr@infosys.com', color: 'text-[#08546c]' },
    { role: 'Super Admin', email: 'admin@placementos.ai', color: 'text-[#08546c]' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 lg:bg-slate-50 dark:lg:bg-slate-900 overflow-x-hidden relative">
      {/* Left Panel - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen relative overflow-hidden bg-slate-950 flex-shrink-0">
        <img 
          src="/loginimage.png" 
          alt="SVM PlacementOS Login" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-white/80">
              <img src="/svm.png" alt="SVM Logo" className="h-10 w-auto object-contain" />
            </div>
            <div className="border-l border-white/30 pl-3.5">
              <h3 className="font-black text-2xl tracking-tight text-white">SVM PlacementOS</h3>
              <p className="text-xs text-cyan-300 font-extrabold uppercase tracking-wider">AI-Powered Placement Platform</p>
            </div>
          </div>
          <p className="text-slate-200 text-sm max-w-md leading-relaxed font-medium">
            Empowering students, TPOs, and recruiters with real-time AI placement readiness scores and automated talent matching.
          </p>
        </div>
      </div>

      {/* Right Panel — Scrollable Login Form */}
      <div className="flex-1 w-full min-h-screen p-4 sm:p-8 lg:p-12 flex flex-col items-center justify-center overflow-y-auto bg-slate-950 lg:bg-slate-50 dark:lg:bg-slate-900 relative">
        {/* On Mobile: Rich radial background gradient backdrop */}
        <div className="lg:hidden absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#08546c]/40 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md my-auto py-4 sm:py-8">
          {/* Form Card Box with Pristine Styling */}
          <div className="bg-white dark:bg-slate-900 lg:bg-white/95 lg:dark:bg-slate-900/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white">
            
            {/* SVM PlacementOS Brand Header */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200/80 flex-shrink-0">
                <img 
                  src="/svm.png" 
                  alt="SVM Logo" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <div className="border-l border-slate-300 dark:border-slate-700 pl-3">
                <span className="font-black text-lg sm:text-xl text-slate-950 dark:text-white block leading-tight">
                  SVM PlacementOS
                </span>
                <span className="text-[10px] font-extrabold text-[#08546c] dark:text-cyan-400 uppercase tracking-wider block">
                  Sign In Portal
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white mb-1 tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Sign in to your SVM PlacementOS account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email address"
                labelClassName="text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu.in"
                leftIcon={<Mail className="w-4 h-4 text-[#08546c] dark:text-cyan-400" />}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 font-medium"
                required
              />
              <div>
                <Input
                  label="Password"
                  labelClassName="text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4 text-[#08546c] dark:text-cyan-400" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  required
                />
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="text-xs text-[#08546c] dark:text-cyan-400 font-bold hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#08546c] hover:bg-[#064255] text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.99]" 
                size="lg" 
                loading={loading} 
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 text-center uppercase tracking-wider">
                Quick Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickLogins.map(ql => (
                  <button
                    key={ql.role}
                    type="button"
                    onClick={() => { setEmail(ql.email); setPassword('password123'); }}
                    className="text-left px-3 py-2.5 rounded-xl border border-cyan-200/80 dark:border-cyan-900/40 bg-cyan-50/70 dark:bg-slate-800/80 hover:bg-cyan-100/80 dark:hover:bg-slate-800 hover:border-[#08546c] transition-all duration-150 shadow-sm cursor-pointer"
                  >
                    <p className="text-xs font-extrabold text-[#08546c] dark:text-cyan-400">{ql.role}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">{ql.email}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Registration Options */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Don't have an account? Select your registration type:
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full">
                <Link
                  to="/register?mode=student"
                  className="w-full sm:w-auto flex-1 px-4 py-3 bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 text-[#08546c] dark:text-cyan-300 rounded-xl text-xs font-extrabold border border-cyan-200/80 dark:border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 group text-center"
                >
                  <GraduationCap className="w-4 h-4 text-[#08546c] dark:text-cyan-400 transition-transform group-hover:scale-110 shrink-0" />
                  <span>Register Student</span>
                </Link>

                <Link
                  to="/register?mode=college"
                  className="w-full sm:w-auto flex-1 px-4 py-3 bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 text-[#08546c] dark:text-cyan-300 rounded-xl text-xs font-extrabold border border-cyan-200/80 dark:border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 group text-center"
                >
                  <Building2 className="w-4 h-4 text-[#08546c] dark:text-cyan-400 transition-transform group-hover:scale-110 shrink-0" />
                  <span>Register College</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


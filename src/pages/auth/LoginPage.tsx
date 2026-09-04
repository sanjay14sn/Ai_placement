import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
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
    { role: 'College Admin', email: 'tpo@rvce.edu.in', color: 'text-brand-600' },
    { role: 'Student', email: 'arjun.sharma@rvce.edu.in', color: 'text-emerald-600' },
    { role: 'Recruiter', email: 'hr@infosys.com', color: 'text-amber-600' },
    { role: 'Super Admin', email: 'admin@placementos.ai', color: 'text-ai-600' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-900 to-ai-900 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-ai-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI PlacementOS</h1>
          <p className="text-brand-200 text-lg leading-relaxed mb-12">
            The AI-powered platform that transforms college placement management into an intelligent, automated experience.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {['AI Job Matching', 'Smart Scheduling', 'Resume Analysis', 'Analytics', 'Multi-tenant'].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-brand-200 border border-white/10">
                {f}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: '500+', label: 'Colleges' },
              { value: '50K+', label: 'Students' },
              { value: '2K+', label: 'Companies' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-brand-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-ai-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">AI PlacementOS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400">Sign in to your PlacementOS account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@college.edu.in"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <div>
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="hover:text-slate-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 text-center">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map(ql => (
                <button
                  key={ql.role}
                  onClick={() => { setEmail(ql.email); setPassword('password123'); }}
                  className="text-left px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-300 transition-all duration-150"
                >
                  <p className={`text-xs font-semibold ${ql.color}`}>{ql.role}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{ql.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account? Select your registration type:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                to="/register?mode=student"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🎓 Register as Student</span>
              </Link>

              <Link
                to="/register?mode=college"
                className="w-full sm:w-auto px-4 py-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-xl text-xs font-semibold border border-brand-200 dark:border-brand-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🏛️ Register your College</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  GraduationCap,
  Code2,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
  Landmark,
  Headphones,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { authService, collegeService } from '../../services';
import { useAuthStore } from '../../store';
import { getDefaultRoute } from '../../utils';

type RoleTab = 'Individual' | 'College' | 'Recruiter';

const ROLE_DEMO_EMAILS: Record<RoleTab, string> = {
  Individual: 'arjun.sharma@rvce.edu.in',
  College: 'tpo@rvce.edu.in',
  Recruiter: 'hr@infosys.com',
};

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleTab>('Individual');
  const [email, setEmail] = useState<string>(ROLE_DEMO_EMAILS.Individual);
  const [password, setPassword] = useState('password123');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campuses, setCampuses] = useState<{ name: string; code: string; tpoEmail: string }[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);

  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    collegeService
      .getAll({ limit: 100 })
      .then((res) =>
        setCampuses(
          res.data.map((college) => ({
            name: college.name,
            code: college.code,
            tpoEmail: college.tpoEmail,
          }))
        )
      )
      .catch(() => undefined);
  }, []);

  const handleRoleSelect = (role: RoleTab) => {
    setSelectedRole(role);
    setEmail(ROLE_DEMO_EMAILS[role]);
    setPassword('password123');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await authService.login(email.trim(), password);
      setUser(user, token);
      const matchedCampus = campuses.find(
        (c) => c.tpoEmail.toLowerCase() === email.trim().toLowerCase()
      );
      const code = user.collegeCode || matchedCampus?.code;
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`, {
        description: code ? `College code: ${code}` : undefined,
      });
      navigate(getDefaultRoute(user.role));
    } catch {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password or use one of the role tabs above.',
      });
    } finally {
      setLoading(false);
    }
  };

  const matchedCampus = campuses.find(
    (c) => c.tpoEmail.toLowerCase() === email.trim().toLowerCase()
  );

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white text-slate-900 font-sans antialiased overflow-y-auto lg:overflow-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* ─── LEFT PANEL (Branding, Value Prop, Campus Visual, Attached Bottom Metrics) ──── */}
      <div className="w-full lg:w-[50%] xl:w-[52%] h-auto lg:h-full flex flex-col justify-between bg-white lg:border-r border-slate-200/80 overflow-hidden">
        {/* Top Content Area: Logo, Title, and 4 Feature Pillars */}
        <div className="px-6 sm:px-8 xl:px-10 pt-5 xl:pt-7 pb-2 flex-shrink-0">
          {/* Header & Brand Logo */}
          <div className="flex items-center justify-between pb-3 xl:pb-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shadow-md shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
                <GraduationCap className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                Placement<span className="text-[#0066FF]">OS</span>
              </span>
            </Link>
          </div>

          {/* Hero Titles */}
          <div className="py-1 xl:py-2">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-slate-950 leading-[1.15]">
              Your Skills.
              <br />
              Your Next <span className="text-[#0066FF]">Opportunity.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 max-w-lg leading-relaxed">
              A complete platform to learn, build skills, track jobs and grow your career — all in
              one place.
            </p>

            {/* 4 Feature Cards (Upgraded Modern Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-3 xl:mt-4">
              {/* 1. Learn */}
              <div className="relative p-2.5 sm:p-3 xl:p-3.5 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:from-white hover:to-blue-50/30 hover:border-[#0066FF]/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0066FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-blue-50 text-[#0066FF] border border-blue-100 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#0066FF] group-hover:text-white transition-all duration-200 shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-xs xl:text-sm font-extrabold text-slate-900 group-hover:text-[#0066FF] transition-colors leading-tight tracking-tight">
                  Learn
                </h4>
                <p className="text-[10px] xl:text-[11px] text-slate-500 group-hover:text-slate-600 leading-snug mt-1 font-normal">
                  Industry-relevant courses & certifications
                </p>
              </div>

              {/* 2. Build */}
              <div className="relative p-2.5 sm:p-3 xl:p-3.5 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:from-white hover:to-sky-50/30 hover:border-[#0284c7]/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0284c7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-100 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#0284c7] group-hover:text-white transition-all duration-200 shadow-xs">
                  <Code2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs xl:text-sm font-extrabold text-slate-900 group-hover:text-[#0284c7] transition-colors leading-tight tracking-tight">
                  Build
                </h4>
                <p className="text-[10px] xl:text-[11px] text-slate-500 group-hover:text-slate-600 leading-snug mt-1 font-normal">
                  Real-world projects & portfolio
                </p>
              </div>

              {/* 3. Get Placed */}
              <div className="relative p-2.5 sm:p-3 xl:p-3.5 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:from-white hover:to-emerald-50/30 hover:border-[#059669]/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#059669] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#059669] group-hover:text-white transition-all duration-200 shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h4 className="text-xs xl:text-sm font-extrabold text-slate-900 group-hover:text-[#059669] transition-colors leading-tight tracking-tight">
                  Get Placed
                </h4>
                <p className="text-[10px] xl:text-[11px] text-slate-500 group-hover:text-slate-600 leading-snug mt-1 font-normal">
                  Job opportunities & hiring drives
                </p>
              </div>

              {/* 4. Track Growth */}
              <div className="relative p-2.5 sm:p-3 xl:p-3.5 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:from-white hover:to-indigo-50/30 hover:border-[#4f46e5]/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-indigo-50 text-[#4f46e5] border border-indigo-100 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-200 shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs xl:text-sm font-extrabold text-slate-900 group-hover:text-[#4f46e5] transition-colors leading-tight tracking-tight">
                  Track Growth
                </h4>
                <p className="text-[10px] xl:text-[11px] text-slate-500 group-hover:text-slate-600 leading-snug mt-1 font-normal">
                  Skill progress & career insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ATTACHED BOTTOM SECTION: Student Photo + Navy Wedge + Stats Bar (Seamless, zero gap) ─── */}
        <div className="flex-1 min-h-0 flex flex-col justify-end w-full mt-2">
          {/* Student Campus Photo attached directly to the stats bar */}
          <div className="relative w-full flex-1 min-h-[190px] xl:min-h-[240px] overflow-hidden">
            <img
              src="/placement_hero_student.jpg"
              alt="Student walking on campus towards opportunity"
              className="w-full h-full object-cover object-[center_35%]"
            />

            {/* Subtle dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#081F3D]/50 via-transparent to-transparent pointer-events-none" />

            {/* Angled Navy Geometric Wedge directly touching bottom stats bar */}
            <div
              className="absolute bottom-0 left-0 w-[85%] sm:w-[70%] max-w-[420px] bg-[#081F3D]/95 backdrop-blur-sm pt-8 pb-5 pl-6 sm:pl-8 pr-12 text-white shadow-2xl z-10"
              style={{
                clipPath: 'polygon(0% 0%, 100% 65%, 100% 100%, 0% 100%)',
              }}
            >
              <div className="space-y-0.5 pt-3">
                <p className="text-sm sm:text-base xl:text-lg font-bold tracking-tight text-white leading-tight">
                  Better Skills.
                </p>
                <p className="text-sm sm:text-base xl:text-lg font-bold tracking-tight text-white leading-tight">
                  Stronger Careers.
                </p>
                <p className="text-sm sm:text-base xl:text-lg font-bold tracking-tight text-white leading-tight">
                  A Brighter Future.
                </p>
                <div className="w-8 h-1 bg-[#0066FF] rounded-full mt-2" />
              </div>
            </div>
          </div>

          {/* Bottom Dark Navy Stats Bar (Attached directly to photo and wedge, zero gap) */}
          <div className="bg-[#081F3D] border-t border-[#0F3563] text-white px-6 sm:px-8 xl:px-10 py-3.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0 z-20">
            {/* Active Students */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Users className="w-5 h-5 text-slate-300 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm xl:text-base font-bold text-white tracking-tight truncate leading-tight">
                  10,000+
                </div>
                <div className="text-[10px] xl:text-[11px] text-slate-300 font-normal truncate">
                  Active Students
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-[#0F3563] flex-shrink-0" />

            {/* Hiring Companies */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-center">
              <Building2 className="w-5 h-5 text-slate-300 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm xl:text-base font-bold text-white tracking-tight truncate leading-tight">
                  1,000+
                </div>
                <div className="text-[10px] xl:text-[11px] text-slate-300 font-normal truncate">
                  Hiring Companies
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-[#0F3563] flex-shrink-0" />

            {/* Training Institutes */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
              <Landmark className="w-5 h-5 text-slate-300 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm xl:text-base font-bold text-white tracking-tight truncate leading-tight">
                  500+
                </div>
                <div className="text-[10px] xl:text-[11px] text-slate-300 font-normal truncate">
                  Training Institutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Login Form, Role Switcher, Trust Badges) ────────────── */}
      <div className="w-full lg:w-[50%] xl:w-[48%] h-auto lg:h-full flex flex-col justify-between p-5 sm:p-6 xl:p-10 bg-white overflow-hidden">
        {/* Top Utility Header (Need help?) */}
        <div className="flex items-center justify-end text-xs text-slate-500 pb-2 relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setHelpOpen(!helpOpen)}
            className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer py-1"
          >
            <Headphones className="w-4 h-4 text-slate-600" />
            <span className="font-medium">Need help?</span>
          </button>

          {helpOpen && (
            <div className="absolute top-9 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 w-64 text-left">
              <p className="font-bold text-slate-900 text-xs mb-1">PlacementOS Help Desk</p>
              <p className="text-[11px] text-slate-600 mb-2">
                Need help accessing your student or institution account?
              </p>
              <div className="space-y-1 text-[11px] font-medium text-blue-600">
                <a href="mailto:support@placementos.ai" className="block hover:underline">
                  support@placementos.ai
                </a>
                <p className="text-slate-500 font-normal">Toll-free: +91 1800-120-7522</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Sign In Container */}
        <div className="w-full max-w-md mx-auto my-auto py-2 xl:py-4">
          <div className="mb-4 xl:mb-6">
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 leading-relaxed">
              Sign in to your PlacementOS account and manage your jobs, skills and career journey.
            </p>
          </div>

          {/* 3 Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4 xl:mb-6">
            {/* Individual */}
            <button
              type="button"
              onClick={() => handleRoleSelect('Individual')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'Individual'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/25 ring-2 ring-[#0066FF]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <User
                className={`w-4 h-4 mb-1.5 ${
                  selectedRole === 'Individual' ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="text-[11px] truncate">Individual</span>
            </button>

            {/* College */}
            <button
              type="button"
              onClick={() => handleRoleSelect('College')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'College'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/25 ring-2 ring-[#0066FF]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Building2
                className={`w-4 h-4 mb-1.5 ${
                  selectedRole === 'College' ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="text-[11px] truncate">College</span>
            </button>

            {/* Recruiter */}
            <button
              type="button"
              onClick={() => handleRoleSelect('Recruiter')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'Recruiter'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/25 ring-2 ring-[#0066FF]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Users
                className={`w-4 h-4 mb-1.5 ${
                  selectedRole === 'Recruiter' ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="text-[11px] truncate">Recruiter</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 xl:space-y-4">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ID or Mobile Number"
                className="w-full h-11 xl:h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 transition-all font-normal"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-11 xl:h-12 pl-11 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 transition-all font-normal"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#0066FF] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 xl:h-12 bg-[#0066FF] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Account Creation Prompt */}
          <div className="text-center text-xs sm:text-sm text-slate-500 mt-5 xl:mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#0066FF] font-semibold hover:underline cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="pt-4 xl:pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 xl:gap-4 flex-shrink-0">
          {/* Badge 1 */}
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] xl:text-xs font-bold text-slate-900 leading-tight">
                Your data is safe with us
              </p>
              <p className="text-[9px] xl:text-[10px] text-slate-500 leading-snug mt-0.5">
                We use industry-standard encryption and security practices.
              </p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] xl:text-xs font-bold text-slate-900 leading-tight">
                Verified Employers
              </p>
              <p className="text-[9px] xl:text-[10px] text-slate-500 leading-snug mt-0.5">
                Background checked companies only.
              </p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-start gap-2">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] xl:text-xs font-bold text-slate-900 leading-tight">
                24/7 Support
              </p>
              <p className="text-[9px] xl:text-[10px] text-slate-500 leading-snug mt-0.5">
                We're here to help you anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, User, Mail, Lock, Hash, 
  ShieldCheck, RefreshCw, ArrowLeft, Sparkles, Check
} from 'lucide-react';
import { Button, Input, Select, Badge } from '../../components/ui';
import { toast } from 'sonner';
import { mockColleges, DEPARTMENTS } from '../../mock/data';
import { studentService } from '../../services';
import { useAuthStore, useTenantStore } from '../../store';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const setTenant = useTenantStore(s => s.setTenant);
  
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);

  // Student Form State
  const [studentCollegeId, setStudentCollegeId] = useState(mockColleges[0]?.id || 'college-1');
  const [studentDept, setStudentDept] = useState('CSE');
  const [studentName, setStudentName] = useState('Rahul Sharma');
  const [studentIdNum, setStudentIdNum] = useState('SONA2021CS045');
  const [studentEmail, setStudentEmail] = useState('arjun.sharma@rvce.edu.in');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [studentDegree, setStudentDegree] = useState('B.E.');
  const [studentBatch, setStudentBatch] = useState('2025');
  const [studentCgpa, setStudentCgpa] = useState('8.5');

  // OTP Verification State
  const [otp, setOtp] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedCollegeObj = mockColleges.find(c => c.id === studentCollegeId) || mockColleges[0];

  // Resend Timer Countdown Effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'otp' && resendTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Handle Form Submit -> Proceed to OTP Step
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !studentPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!studentEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setStep('otp');
    setResendTimer(30);
    setCanResend(false);
    toast.success(`Verification code sent to ${studentEmail}`, {
      description: 'Use demo code 123456 to verify instantly.'
    });
  };

  // Handle OTP digit changes with auto-focus & paste
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of full OTP code
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit input
    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    toast.success(`New verification code sent to ${studentEmail}`);
  };

  // Handle Final Registration Verification
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const cgpaNum = parseFloat(studentCgpa) || 8.0;
      const deptIdx = DEPARTMENTS.indexOf(studentDept);

      const createdStudent = await studentService.create({
        name: studentName,
        email: studentEmail,
        studentId: studentIdNum || `${selectedCollegeObj.code}2021${studentDept.substring(0, 2)}045`,
        collegeId: selectedCollegeObj.id,
        department: studentDept,
        departmentId: deptIdx !== -1 ? `dept-${deptIdx + 1}` : 'dept-1',
        degree: studentDegree,
        batch: studentBatch,
        cgpa: cgpaNum,
      });

      const userObj = {
        id: createdStudent.userId,
        email: studentEmail,
        name: studentName,
        role: 'STUDENT' as const,
        tenantId: selectedCollegeObj.id,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setUser(userObj, `mock-token-student-${Date.now()}`);
      setTenant(selectedCollegeObj.id, selectedCollegeObj.name);

      toast.success(`🎉 Verification Successful! Welcome ${studentName.split(' ')[0]}!`, {
        description: `Your profile at ${selectedCollegeObj.name} is now active.`
      });
      navigate('/student/dashboard');
    } catch (err) {
      toast.error('Failed to complete verification and register account');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <div className="w-full max-w-xl my-auto">
        {/* Top Header Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-brand-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PlacementOS
          </span>
        </div>

        {/* Stepper Header indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step === 'form' 
                ? 'bg-brand-600 text-white ring-4 ring-brand-500/20' 
                : 'bg-emerald-500 text-white'
            }`}>
              {step === 'otp' ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-sm font-semibold ${step === 'form' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Student Details
            </span>
          </div>

          <div className="flex-1 max-w-[100px] h-0.5 bg-slate-200 dark:bg-slate-800 mx-4">
            <div className={`h-full bg-brand-600 transition-all duration-300 ${step === 'otp' ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step === 'otp' 
                ? 'bg-brand-600 text-white ring-4 ring-brand-500/20' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              2
            </div>
            <span className={`text-sm font-semibold ${step === 'otp' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              OTP Verification
            </span>
          </div>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-6 sm:p-10 transition-all">
          {step === 'form' ? (
            /* STEP 1: STUDENT REGISTRATION FORM */
            <form onSubmit={handleProceedToOtp} className="space-y-5">
              <div>
                <Badge variant="green" className="mb-2 px-3 py-1">Self-Service Student Onboarding</Badge>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Student Registration
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select your institution and department to complete profile setup.
                </p>
              </div>

              {/* Institution & Department Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Select College / Institution"
                  options={mockColleges.map(c => ({ value: c.id, label: `${c.name} (${c.city})` }))}
                  value={studentCollegeId}
                  onChange={e => setStudentCollegeId(e.target.value)}
                />

                <Select
                  label="Department / Branch"
                  options={DEPARTMENTS.map(d => ({
                    value: d,
                    label: d === 'CSE' ? 'Computer Science (CSE)' :
                           d === 'ISE' ? 'Information Tech (ISE)' :
                           d === 'ECE' ? 'Electronics & Comm (ECE)' :
                           d === 'EEE' ? 'Electrical Eng (EEE)' :
                           d === 'ME' ? 'Mechanical Eng (ME)' : d
                  }))}
                  value={studentDept}
                  onChange={e => setStudentDept(e.target.value)}
                />
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Rahul Sharma"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Roll No / USN"
                  placeholder="e.g. SONA2021CS045"
                  value={studentIdNum}
                  onChange={e => setStudentIdNum(e.target.value)}
                  leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Contact & Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Student Email Address"
                  type="email"
                  placeholder="arjun.sharma@rvce.edu.in"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="•••••••••••"
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              {/* Academic Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Degree"
                  options={[
                    { value: 'B.E.', label: 'B.E.' },
                    { value: 'B.Tech', label: 'B.Tech' },
                    { value: 'MCA', label: 'MCA' },
                    { value: 'MBA', label: 'MBA' },
                  ]}
                  value={studentDegree}
                  onChange={e => setStudentDegree(e.target.value)}
                />

                <Select
                  label="Batch / Year"
                  options={[
                    { value: '2025', label: '2025 Passout' },
                    { value: '2026', label: '2026 Passout' },
                    { value: '2027', label: '2027 Passout' },
                  ]}
                  value={studentBatch}
                  onChange={e => setStudentBatch(e.target.value)}
                />

                <Input
                  label="CGPA"
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  value={studentCgpa}
                  onChange={e => setStudentCgpa(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold mt-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/25" 
                size="lg" 
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Complete Student Setup & Launch Dashboard
              </Button>

              <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  Sign in to PlacementOS
                </Link>
              </p>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION PAGE */
            <form onSubmit={handleVerifyAndRegister} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand-500/10 to-indigo-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Verify Email Address
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  We've sent a 6-digit OTP verification code to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white underline decoration-brand-500/40">
                    {studentEmail}
                  </span>
                </p>
              </div>

              {/* Demo Helper Badge */}
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl p-3.5 text-xs flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <div>
                  <span className="font-semibold">Demo Hint:</span> Use code{' '}
                  <strong className="font-mono text-sm px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">123456</strong>{' '}
                  to verify immediately.
                </div>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-between gap-2 sm:gap-3 py-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Timer options */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`flex items-center gap-1.5 font-semibold transition-colors ${
                    canResend 
                      ? 'text-brand-600 dark:text-brand-400 hover:underline cursor-pointer' 
                      : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? 'animate-spin-slow' : ''}`} />
                  {canResend ? 'Resend OTP Code' : `Resend in 00:${resendTimer.toString().padStart(2, '0')}`}
                </button>
              </div>

              {/* Submit Verification Button */}
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/25"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Verify OTP & Launch Dashboard
              </Button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
                Didn't receive the email? Check your spam folder or contact institution administrator.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

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

  // Background Video Ref
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="relative h-screen w-screen overflow-hidden flex flex-col justify-center items-center lg:items-end p-4 sm:p-6 lg:p-8 bg-slate-950">
      {/* Fullscreen Background Video */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0 pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full min-w-full min-h-full object-cover opacity-100"
        >
          <source
            src="https://res.cloudinary.com/dq6gr5zjc/video/upload/v1788931257/A_realistic_cinematic_scene_in_gwr_video_mvp_y6qwv2.mp4"
            type="video/mp4"
          />
        </video>

        {/* Video is 100% fully visible without dark overlay */}
      </div>


      {/* Top Left Logo Container Box with White Background */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img 
            src="/svm.png" 
            alt="SVM Logo" 
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <div className="border-l border-slate-300 pl-2.5">
            <span className="font-black text-sm sm:text-base text-slate-900 block leading-tight">
              SVM PlacementOS
            </span>
            <span className="text-[10px] font-extrabold text-[#08546c] uppercase tracking-wider block">
              Student Portal
            </span>
          </div>
        </Link>
      </div>

      {/* RIGHT-ALIGNED FLOATING SQUARE BOX CONTAINER */}
      <div className="relative z-10 w-full max-w-xl lg:max-w-lg lg:mr-8 xl:mr-16 my-auto max-h-[92vh] overflow-y-auto pr-1">
        
        {/* Stepper Header indicator with Clean White Finish */}
        <div className="flex items-center justify-between mb-4 px-4 py-3.5 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step === 'form' 
                ? 'bg-[#08546c] text-white ring-4 ring-[#08546c]/25 shadow-md' 
                : 'bg-emerald-500 text-white'
            }`}>
              {step === 'otp' ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className={`text-xs sm:text-sm ${step === 'form' ? 'text-slate-900 font-bold' : 'text-slate-500 font-semibold'}`}>
              Student Details
            </span>
          </div>

          <div className="flex-1 max-w-[60px] sm:max-w-[80px] h-1 bg-slate-200 mx-3 rounded-full overflow-hidden">
            <div className={`h-full bg-[#08546c] transition-all duration-300 ${step === 'otp' ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step === 'otp' 
                ? 'bg-[#08546c] text-white ring-4 ring-[#08546c]/25 shadow-md' 
                : 'bg-slate-100 text-slate-500 border border-slate-300'
            }`}>
              2
            </div>
            <span className={`text-xs sm:text-sm ${step === 'otp' ? 'text-slate-900 font-bold' : 'text-slate-500 font-semibold'}`}>
              OTP Verification
            </span>
          </div>
        </div>

        {/* MAIN CLEAN WHITE SQUARE BOX FORM CARD */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-slate-900 transition-all overflow-hidden">
          {step === 'form' ? (
            /* STEP 1: STUDENT REGISTRATION FORM */
            <form onSubmit={handleProceedToOtp} className="relative z-10 space-y-4">
              <div>
                <Badge className="mb-2 px-3 py-1 bg-cyan-50 text-[#08546c] border border-cyan-200/80 text-xs font-bold shadow-sm">
                  Self-Service Student Onboarding
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Student Registration
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Select your institution and department to complete profile setup.
                </p>
              </div>

              {/* Institution & Department Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Select
                  label="Select College / Institution"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  options={mockColleges.map(c => ({ value: c.id, label: `${c.name} (${c.city})` }))}
                  value={studentCollegeId}
                  onChange={e => setStudentCollegeId(e.target.value)}
                />

                <Select
                  label="Department / Branch"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  placeholder="Rahul Sharma"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-[#08546c]" />}
                  required
                />

                <Input
                  label="Roll No / USN"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  placeholder="e.g. SONA2021CS045"
                  value={studentIdNum}
                  onChange={e => setStudentIdNum(e.target.value)}
                  leftIcon={<Hash className="w-4 h-4 text-[#08546c]" />}
                />
              </div>

              {/* Contact & Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Student Email Address"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  type="email"
                  placeholder="arjun.sharma@rvce.edu.in"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-[#08546c]" />}
                  required
                />

                <Input
                  label="Password"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  type="password"
                  placeholder="•••••••••••"
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-[#08546c]" />}
                  required
                />
              </div>

              {/* Academic Metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <Select
                  label="Degree"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
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
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
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
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  value={studentCgpa}
                  onChange={e => setStudentCgpa(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-sm sm:text-base font-extrabold mt-3 bg-[#08546c] hover:bg-[#064255] text-white shadow-xl rounded-xl transition-all duration-200 active:scale-[0.99]" 
                size="lg" 
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Complete Student Setup & Launch Dashboard
              </Button>

              <p className="text-center text-xs text-slate-600 pt-3 border-t border-slate-200">
                Already have an account?{' '}
                <Link to="/login" className="text-[#08546c] font-extrabold hover:underline">
                  Sign in to PlacementOS
                </Link>
              </p>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION PAGE */
            <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-fade-in text-slate-900">
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 bg-cyan-50 border border-cyan-200/80 text-[#08546c] rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Verify Email Address
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
                  We've sent a 6-digit OTP verification code to{' '}
                  <span className="font-bold text-slate-900 underline decoration-[#08546c]/60">
                    {studentEmail}
                  </span>
                </p>
              </div>

              {/* Demo Helper Badge */}
              <div className="bg-amber-50 border border-amber-200/80 text-amber-800 rounded-2xl p-3 text-xs flex items-center gap-2.5 shadow-sm">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <div>
                  <span className="font-semibold">Demo Hint:</span> Use code{' '}
                  <strong className="font-mono text-sm px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900">123456</strong>{' '}
                  to verify immediately.
                </div>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-between gap-1.5 sm:gap-2 py-1">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-[#08546c] outline-none transition-all shadow-sm"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Timer options */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    canResend 
                      ? 'text-[#08546c] hover:underline cursor-pointer' 
                      : 'text-slate-400 cursor-not-allowed'
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
                className="w-full h-12 text-sm sm:text-base font-extrabold bg-[#08546c] hover:bg-[#064255] shadow-xl text-white rounded-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Verify OTP & Launch Dashboard
              </Button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Didn't receive the email? Check spam or contact administrator.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


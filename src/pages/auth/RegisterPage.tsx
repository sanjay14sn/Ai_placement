import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, User, Mail, Lock, Hash, 
  ShieldCheck, RefreshCw, ArrowLeft, Sparkles, Check,
  CreditCard, UploadCloud, FileCheck, CheckCircle2, Eye, Trash2, FileText, Building2, GraduationCap,
  UserCheck
} from 'lucide-react';
import { Button, Input, Badge, Select } from '../../components/ui';
import { toast } from 'sonner';
import { DEPARTMENTS } from '../../mock/data';
import { authService, collegeService, studentService, uploadService } from '../../services';
import { useAuthStore, useTenantStore } from '../../store';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const setTenant = useTenantStore(s => s.setTenant);
  
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);

  // Student Form State
  const [studentCollegeName, setStudentCollegeName] = useState('');
  const [studentDept, setStudentDept] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentIdNum, setStudentIdNum] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentDegree, setStudentDegree] = useState('');
  const [studentBatch, setStudentBatch] = useState('');
  const [studentCgpa, setStudentCgpa] = useState('');
  
  // Aadhar Card Verification & Upload State
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharFile, setAadharFile] = useState<{
    file?: File;
    name: string;
    url: string;
    size: number;
    previewUrl?: string;
  } | null>(null);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);
  const aadharFileInputRef = useRef<HTMLInputElement>(null);

  // OTP Verification State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registered Colleges (Strictly fetched from Super Admin registrations & database)
  const [registeredColleges, setRegisteredColleges] = useState<{
    id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
    departments: { id: string; name: string; code: string }[];
  }[]>([]);
  const [isLoadingRegisteredColleges, setIsLoadingRegisteredColleges] = useState(false);

  // College Suggestions & Selection State
  const [resolvedCollege, setResolvedCollege] = useState<{
    id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
    departments: { id: string; name: string; code: string }[];
  } | null>(null);
  const [collegeSuggestions, setCollegeSuggestions] = useState<{
    id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
    departments: { id: string; name: string; code: string }[];
  }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelectedCollege, setIsSelectedCollege] = useState(false);
  const [isIndividualStudent, setIsIndividualStudent] = useState(false);
  const collegeInputContainerRef = useRef<HTMLDivElement>(null);
  const [collegeLookup, setCollegeLookup] = useState<'idle' | 'loading' | 'miss'>('idle');

  // Format 12-digit Aadhar number into 4-digit chunks (XXXX XXXX XXXX)
  const handleAadharNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    setAadharNumber(formatted);
  };

  // Upload Aadhar Card Document (PDF / Images)
  const handleAadharFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|pdf)$/i)) {
      toast.error('Please upload a valid document (PDF, PNG, JPG, or WEBP)');
      return;
    }

    setIsUploadingAadhar(true);
    try {
      let uploadedUrl = '';
      try {
        const uploadRes = await uploadService.uploadFile(file);
        uploadedUrl = uploadRes.url;
      } catch (uploadErr) {
        console.warn('Backend upload skipped/fallback to client URL:', uploadErr);
        uploadedUrl = URL.createObjectURL(file);
      }

      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      setAadharFile({
        file,
        name: file.name,
        url: uploadedUrl,
        size: file.size,
        previewUrl,
      });
      toast.success('Aadhar card attached successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload Aadhar card');
    } finally {
      setIsUploadingAadhar(false);
      if (aadharFileInputRef.current) aadharFileInputRef.current.value = '';
    }
  };

  const handleRemoveAadhar = () => {
    setAadharFile(null);
    if (aadharFileInputRef.current) aadharFileInputRef.current.value = '';
    toast.info('Aadhar card removed');
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collegeInputContainerRef.current && !collegeInputContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch only institutions registered in Super Admin / database
  const fetchSuperAdminColleges = async () => {
    setIsLoadingRegisteredColleges(true);
    try {
      const res = await collegeService.getAll({ limit: 200 });
      const rawList = res?.data || [];
      const formatted = rawList.map((col: any) => {
        const rawDepts = col.departments || [];
        const departments = rawDepts.length > 0
          ? rawDepts.map((d: any, idx: number) =>
              typeof d === 'string'
                ? { id: `dept-${idx + 1}-${d.toLowerCase()}`, name: d, code: d }
                : {
                    id: d.id || d._id || `dept-${idx + 1}`,
                    name: d.name || d.code || `Dept ${idx + 1}`,
                    code: d.code || d.name || 'DEPT',
                  }
            )
          : [
              { id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE' },
              { id: 'dept-ise', name: 'Information Science and Engineering', code: 'ISE' },
              { id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE' },
              { id: 'dept-eee', name: 'Electrical and Electronics Engineering', code: 'EEE' },
              { id: 'dept-mech', name: 'Mechanical Engineering', code: 'ME' },
              { id: 'dept-civil', name: 'Civil Engineering', code: 'Civil' },
              { id: 'dept-aiml', name: 'Artificial Intelligence & Machine Learning', code: 'AI&ML' },
              { id: 'dept-aids', name: 'Artificial Intelligence & Data Science', code: 'AI&DS' },
            ];

        return {
          id: col.id || col._id,
          name: col.name,
          code: col.code || 'COL',
          city: col.city,
          state: col.state,
          departments,
        };
      });
      setRegisteredColleges(formatted);
    } catch (err) {
      console.warn('Failed to fetch registered colleges:', err);
    } finally {
      setIsLoadingRegisteredColleges(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminColleges();

    // Re-fetch if a college was registered by Super Admin in another window/tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aicampus_registered_colleges' || e.key === 'placementos_registered_colleges') {
        fetchSuperAdminColleges();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // College Suggestions Search (Filtered exclusively from Super Admin registered colleges)
  useEffect(() => {
    if (isSelectedCollege) {
      setCollegeSuggestions([]);
      setShowSuggestions(false);
      setCollegeLookup('idle');
      return;
    }

    const query = studentCollegeName.trim();
    const qLower = query.toLowerCase();

    // If no query yet, show full list of registered colleges from Super Admin
    if (!query) {
      setCollegeSuggestions(registeredColleges);
      setCollegeLookup('idle');
      return;
    }

    // Filter ONLY from colleges registered in Super Admin
    const localMatches = registeredColleges.filter((col) => {
      const nameMatch = col.name.toLowerCase().includes(qLower);
      const codeMatch = col.code.toLowerCase().includes(qLower);
      const cityMatch = col.city ? col.city.toLowerCase().includes(qLower) : false;
      return nameMatch || codeMatch || cityMatch;
    });

    setCollegeSuggestions(localMatches);
    setCollegeLookup(localMatches.length ? 'idle' : 'loading');

    // Query backend lookup if not found yet (e.g. newly created code)
    let cancelled = false;
    const timer = setTimeout(() => {
      collegeService.lookup(query)
        .then((college) => {
          if (cancelled) return;
          setCollegeLookup('idle');
          if (college) {
            setCollegeSuggestions((prev) => {
              const exists = prev.some(
                (p) => p.id === college.id || p.code.toUpperCase() === college.code.toUpperCase()
              );
              if (exists) return prev;
              const rawDepts = college.departments || [];
              const departments = rawDepts.length > 0
                ? rawDepts.map((d: any, idx: number) =>
                    typeof d === 'string'
                      ? { id: `dept-${idx + 1}-${d.toLowerCase()}`, name: d, code: d }
                      : { id: d.id || d._id || `dept-${idx + 1}`, name: d.name || d.code, code: d.code || d.name }
                  )
                : [
                    { id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE' },
                    { id: 'dept-ise', name: 'Information Science and Engineering', code: 'ISE' },
                    { id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE' },
                    { id: 'dept-eee', name: 'Electrical and Electronics Engineering', code: 'EEE' },
                  ];
              const newCollege = {
                id: college.id,
                name: college.name,
                code: college.code,
                city: college.city,
                departments,
              };
              setRegisteredColleges((all) => {
                const hasIt = all.some((c) => c.id === newCollege.id || c.code.toUpperCase() === newCollege.code.toUpperCase());
                return hasIt ? all : [newCollege, ...all];
              });
              return [newCollege, ...prev];
            });
          }
        })
        .catch(() => {
          if (!cancelled) setCollegeLookup('idle');
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [studentCollegeName, isSelectedCollege, registeredColleges]);

  const handleSelectCollege = (college: {
    id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
    departments: { id: string; name: string; code: string }[];
  }) => {
    setStudentCollegeName(college.name);
    setResolvedCollege(college);
    setIsSelectedCollege(true);
    setIsIndividualStudent(false);
    setShowSuggestions(false);
    setStudentDept((current) => {
      if (college.departments.some((d) => d.name === current)) return current;
      return college.departments.length > 0 ? college.departments[0].name : '';
    });
    toast.success(`Selected ${college.name}`, {
      description: `College Code: ${college.code} · ${college.departments.length} departments available`
    });
  };

  const handleSelectIndividualCollege = (customName?: string) => {
    const name = (customName || studentCollegeName).trim() || 'Independent / Individual Student';
    const individualCollege = {
      id: 'individual',
      name: name,
      code: 'INDIVIDUAL',
      city: 'Direct Candidate',
      state: '',
      departments: [
        { id: 'dept-cse', name: 'Computer Science and Engineering (CSE)', code: 'CSE' },
        { id: 'dept-it', name: 'Information Technology (IT)', code: 'IT' },
        { id: 'dept-ece', name: 'Electronics and Communication (ECE)', code: 'ECE' },
        { id: 'dept-eee', name: 'Electrical & Electronics (EEE)', code: 'EEE' },
        { id: 'dept-me', name: 'Mechanical Engineering', code: 'ME' },
        { id: 'dept-civil', name: 'Civil Engineering', code: 'Civil' },
        { id: 'dept-ai', name: 'Artificial Intelligence & Data Science', code: 'AI&DS' },
        { id: 'dept-mgmt', name: 'Business Administration / Management', code: 'MGMT' },
        { id: 'dept-other', name: 'General / Other Specialization', code: 'OTHER' },
      ],
    };
    setStudentCollegeName(name);
    setResolvedCollege(individualCollege);
    setIsSelectedCollege(true);
    setIsIndividualStudent(true);
    setShowSuggestions(false);
    if (!studentDept) {
      setStudentDept('Computer Science and Engineering (CSE)');
    }
    toast.success(`Enrolled as Individual Candidate (${name})`, {
      description: 'Full direct candidate access to placement drives, resume builder & AI prep.'
    });
  };

  const handleChangeCollege = () => {
    setIsSelectedCollege(false);
    setIsIndividualStudent(false);
    setResolvedCollege(null);
    setStudentDept('');
    setStudentCollegeName('');
    setShowSuggestions(false);
  };

  const matchedCollege = registeredColleges.find((college) => {
    const typed = studentCollegeName.trim().toLowerCase();
    return typed && (
      college.name.toLowerCase() === typed ||
      college.code.toLowerCase() === typed ||
      `${college.name} (${college.city})`.toLowerCase() === typed
    );
  });

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

  // Handle Form Submit -> Register User, Send Real OTP & Proceed to OTP Step
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedCollege) {
      const match = registeredColleges.find((c) => {
        const typed = studentCollegeName.trim().toLowerCase();
        return (
          c.name.toLowerCase() === typed ||
          c.code.toLowerCase() === typed ||
          `${c.name} (${c.city})`.toLowerCase() === typed
        );
      });
      if (match) {
        handleSelectCollege(match);
      } else if (studentCollegeName.trim()) {
        // Automatically allow user to proceed as Individual Student with their specified institution!
        handleSelectIndividualCollege(studentCollegeName.trim());
      } else {
        toast.error('Please enter your college name or select an institution');
        return;
      }
    }
    if (!studentName || !studentEmail || !studentPassword || !studentCollegeName.trim() || !studentDept.trim() || !studentDegree.trim() || !studentBatch.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!studentEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const cgpaNum = parseFloat(studentCgpa) || 0;
      const deptIdx = DEPARTMENTS.indexOf(studentDept.trim());
      const matchedDepartment = resolvedCollege?.departments.find((department) => department.name === studentDept.trim());
      const collegeId = resolvedCollege?.id || 'individual';
      const collegeName = studentCollegeName.trim() || resolvedCollege?.name || 'Independent Student';
      const studentRoll = studentIdNum || `${isIndividualStudent ? 'IND' : (resolvedCollege?.code || matchedCollege?.code || 'STU')}2021${studentDept.trim().substring(0, 2).toUpperCase()}045`;

      // Call real backend API to register student profile and dispatch cryptographic OTP via email
      await authService.registerStudent({
        name: studentName.trim(),
        email: studentEmail.trim().toLowerCase(),
        password: studentPassword,
        studentId: studentRoll,
        collegeId,
        collegeName,
        department: studentDept.trim(),
        departmentId: matchedDepartment?.id || (deptIdx !== -1 ? `dept-${deptIdx + 1}` : 'dept-custom'),
        degree: studentDegree.trim(),
        batch: studentBatch.trim(),
        cgpa: cgpaNum,
        isIndividual: isIndividualStudent,
        aadharNumber: aadharNumber ? aadharNumber.replace(/\s+/g, '') : undefined,
        aadharCard: aadharFile ? {
          fileName: aadharFile.name,
          fileUrl: aadharFile.url,
          fileSize: aadharFile.size,
          uploadedAt: new Date().toISOString(),
        } : undefined,
      });

      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      toast.success(`Verification code sent to ${studentEmail.trim()}`, {
        description: 'Please check your email inbox and spam folder for the 6-digit code.'
      });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to register and send verification code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
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

  // Handle Real Resend OTP API Call
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      await authService.resendOtp(studentEmail.trim().toLowerCase());
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      toast.success(`New verification code sent to ${studentEmail.trim()}`, {
        description: 'Check your email inbox or spam folder.'
      });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Final Real Registration Verification
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('').trim();
    
    if (otpCode.length < 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      // Call REAL backend verify OTP API
      const response = await authService.verifyOtp(studentEmail.trim().toLowerCase(), otpCode);
      const user = response.user;
      const token = response.token;

      setUser(user, token);
      const collegeId = resolvedCollege?.id || 'individual';
      const collegeName = studentCollegeName.trim() || resolvedCollege?.name || 'Independent Student';
      setTenant(collegeId, collegeName);

      toast.success(`🎉 Verification Successful! Welcome ${studentName.split(' ')[0] || user.name}!`, {
        description: isIndividualStudent
          ? `Your individual student profile (${collegeName}) is now verified and active.`
          : `Your student profile at ${collegeName} is now verified and active.`
      });
      navigate('/student/dashboard');
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* ─── FULLSCREEN CAMPUS BACKGROUND IMAGE ─── */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <img
          src="/campus_registration_bg.jpg"
          alt="Modern University Campus"
          className="w-full h-full object-cover object-center"
        />
        {/* Crisp balanced overlay that keeps campus scene vivid while ensuring great UI contrast */}
        <div className="absolute inset-0 bg-slate-950/35 bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-slate-950/65" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-6xl mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl shadow-xl border border-white/90 group transition-all duration-200 hover:scale-105"
        >
          <img
            src="/aicampusos.png"
            alt="AI Campus OS"
            className="h-12 sm:h-14 max-h-[58px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Stepper Header indicator */}
        <div className="hidden sm:flex items-center px-4 py-2 bg-white border border-white/90 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 'form'
                  ? 'bg-[#0066FF] text-white ring-2 ring-blue-200 shadow-xs'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {step === 'otp' ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span
              className={`text-xs ${
                step === 'form' ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              Student Details
            </span>
          </div>

          <div className="w-10 h-0.5 bg-slate-200 mx-3 rounded-full overflow-hidden">
            <div
              className={`h-full bg-[#0066FF] transition-all duration-300 ${
                step === 'otp' ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 'otp'
                  ? 'bg-[#0066FF] text-white ring-2 ring-blue-200 shadow-xs'
                  : 'bg-slate-100 text-slate-500 border border-slate-300'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs ${
                step === 'otp' ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              OTP Verification
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-bold text-white bg-slate-900/85 hover:bg-slate-900 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/30 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xl hover:shadow-2xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>

      {/* WIDE LANDSCAPE REGISTRATION CONTAINER (SOLID WHITE CARD FOR 100% VISIBILITY) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 xl:p-10 text-slate-900 transition-all overflow-visible">
          {step === 'form' ? (
            /* STEP 1: STUDENT REGISTRATION FORM (LANDSCAPE 2-COLUMN) */
            <form onSubmit={handleProceedToOtp} className="space-y-6" autoComplete="off">
              {/* Form Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-2">
                <div>
                  <Badge className="mb-1.5 px-3 py-0.5 bg-blue-50 text-[#0066FF] border border-blue-200 text-xs font-bold shadow-xs">
                    Self-Service Student Onboarding
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Student Registration
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                  Enter your college code to load the institution and its departments, then complete
                  your profile credentials.
                </p>
              </div>

              {/* Landscape 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                {/* ─── LEFT COLUMN: Academic & Institution Details ─────────────── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <Building2 className="w-4 h-4 text-[#0066FF]" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Academic & Institution Details
                    </h3>
                  </div>

                  {/* College / Institution Search */}
                  <div className="relative" ref={collegeInputContainerRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-900 font-bold text-xs">
                        College / Institution or college code
                      </label>
                      {isIndividualStudent ? (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 shadow-xs">
                          <UserCheck className="w-3 h-3 text-[#0066FF]" /> Individual Student
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Super Admin Verified
                        </span>
                      )}
                    </div>
                    <Input
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 font-medium text-xs sm:text-sm"
                      placeholder="Enter college code, name, or your institution..."
                      value={studentCollegeName}
                      onChange={(e) => {
                        setStudentCollegeName(e.target.value);
                        setIsSelectedCollege(false);
                      }}
                      onFocus={() => {
                        if (!isSelectedCollege) {
                          setShowSuggestions(true);
                        }
                      }}
                      onClick={() => {
                        if (!isSelectedCollege) {
                          setShowSuggestions(true);
                        }
                      }}
                      leftIcon={<Building2 className="w-4 h-4 text-[#0066FF]" />}
                      required
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && !isSelectedCollege && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {studentCollegeName.trim()
                              ? `Matching Colleges (${collegeSuggestions.length})`
                              : `Registered Colleges (${collegeSuggestions.length})`}
                          </span>
                          {isLoadingRegisteredColleges || collegeLookup === 'loading' ? (
                            <span className="text-[10px] text-[#0066FF] font-semibold animate-pulse flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Fetching…
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Click to select</span>
                          )}
                        </div>

                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {collegeSuggestions.length > 0 ? (
                            collegeSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.id || suggestion.code}
                                type="button"
                                onClick={() => handleSelectCollege(suggestion)}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-[#0066FF] flex-shrink-0" />
                                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#0066FF] truncate">
                                      {suggestion.name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 pl-5 mt-0.5">
                                    {suggestion.city}
                                    {suggestion.state ? `, ${suggestion.state}` : ''}
                                    {suggestion.departments?.length
                                      ? ` · ${suggestion.departments.length} departments`
                                      : ''}
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-blue-100 text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-colors flex-shrink-0 shadow-xs">
                                  {suggestion.code}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-xs text-slate-800 font-semibold">
                                "{studentCollegeName.trim()}" is not registered in Super Admin
                              </p>
                              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                                You can continue and register as an Individual Student with your institution details!
                              </p>
                              <button
                                type="button"
                                onClick={() => handleSelectIndividualCollege(studentCollegeName)}
                                className="w-full py-2 px-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                              >
                                <UserCheck className="w-4 h-4" /> Continue as Individual with "{studentCollegeName.trim() || 'My Institution'}"
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Optional direct individual student button if typing custom college */}
                        {collegeSuggestions.length > 0 && studentCollegeName.trim() && (
                          <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                            <button
                              type="button"
                              onClick={() => handleSelectIndividualCollege(studentCollegeName)}
                              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-[#0066FF] text-[11px] font-bold text-[#0066FF] hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Not listed? Sign up as Individual Student with "{studentCollegeName.trim()}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected College Confirmation */}
                    {resolvedCollege && isSelectedCollege && (
                      <div className={`mt-1.5 flex items-center justify-between px-3 py-1.5 ${
                        isIndividualStudent
                          ? 'bg-blue-50/90 border-blue-200'
                          : 'bg-emerald-50 border-emerald-200'
                      } border rounded-xl shadow-xs`}>
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isIndividualStudent ? (
                            <UserCheck className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${
                            isIndividualStudent ? 'text-blue-950' : 'text-emerald-950'
                          } truncate`}>
                            {resolvedCollege.name}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 ${
                            isIndividualStudent
                              ? 'bg-blue-200/70 text-blue-800'
                              : 'bg-emerald-200/70 text-emerald-800'
                          } rounded`}>
                            {isIndividualStudent ? 'INDIVIDUAL' : resolvedCollege.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleChangeCollege}
                          className="text-[11px] font-extrabold text-[#0066FF] hover:underline flex-shrink-0 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Department / Branch */}
                  <div>
                    {resolvedCollege && resolvedCollege.departments.length > 0 ? (
                      <Select
                        label="Department / Branch"
                        labelClassName="text-slate-900 font-bold text-xs"
                        className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                        placeholder="Select department"
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                        options={resolvedCollege.departments.map((department) => ({
                          value: department.name,
                          label:
                            department.code && department.code !== department.name
                              ? `${department.name} (${department.code})`
                              : department.name,
                        }))}
                        required
                      />
                    ) : (
                      <Input
                        label="Department / Branch"
                        labelClassName="text-slate-900 font-bold text-xs"
                        className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                        placeholder="Computer Science (CSE)"
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  {/* Degree, Batch / Year, CGPA */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <Input
                      label="Degree"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      placeholder="B.E."
                      value={studentDegree}
                      onChange={(e) => setStudentDegree(e.target.value)}
                      required
                    />

                    <Input
                      label="Batch / Year"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      placeholder="2025"
                      value={studentBatch}
                      onChange={(e) => setStudentBatch(e.target.value)}
                      required
                    />

                    <Input
                      label="CGPA"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      inputMode="decimal"
                      placeholder="8.5"
                      value={studentCgpa}
                      onChange={(e) => setStudentCgpa(e.target.value)}
                    />
                  </div>

                  {/* Institution Placement Note */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5">
                    {isIndividualStudent ? (
                      <Sparkles className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {isIndividualStudent
                        ? 'Enrolling as an Individual Student provides you direct access to AI interview practice, smart resume builder, skill assessments, and off-campus recruitment drives.'
                        : "Entering your verified college code connects your profile directly with your institution's Training & Placement Office (TPO) for company drives, shortlist alerts, and resume verification."}
                    </p>
                  </div>
                </div>

                {/* ─── RIGHT COLUMN: Personal Details, Credentials & KYC ──────── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <User className="w-4 h-4 text-[#0066FF]" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Student Credentials & Identity KYC
                    </h3>
                  </div>

                  {/* Full Name & Roll No */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      placeholder="Rahul Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      leftIcon={<User className="w-4 h-4 text-[#0066FF]" />}
                      required
                    />

                    <Input
                      label="Roll No / USN"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      placeholder="e.g. SONA2021CS045"
                      value={studentIdNum}
                      onChange={(e) => setStudentIdNum(e.target.value)}
                      leftIcon={<Hash className="w-4 h-4 text-[#0066FF]" />}
                    />
                  </div>

                  {/* Student Email Address & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Student Email Address"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      type="email"
                      name="student_registration_email"
                      autoComplete="off"
                      placeholder="student@institution.edu.in"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4 text-[#0066FF]" />}
                      required
                    />

                    <Input
                      label="Password"
                      labelClassName="text-slate-900 font-bold text-xs"
                      className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-medium text-xs sm:text-sm"
                      type="password"
                      name="student_registration_password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4 text-[#0066FF]" />}
                      required
                    />
                  </div>

                  {/* Aadhar Card Verification */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#0066FF] flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">
                            Aadhar Card Verification
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Government Identity Proof for Placement Drives & KYC
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0066FF] border border-blue-200">
                        KYC Document
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Input
                          label="Aadhar Card Number"
                          labelClassName="text-slate-900 font-bold text-xs"
                          className="bg-white text-slate-900 border border-slate-300 focus:bg-white focus:border-[#0066FF] font-mono text-xs sm:text-sm tracking-wider"
                          placeholder="XXXX XXXX XXXX"
                          value={aadharNumber}
                          onChange={(e) => handleAadharNumberChange(e.target.value)}
                          maxLength={14}
                          leftIcon={<CreditCard className="w-4 h-4 text-[#0066FF]" />}
                        />
                        <p className="mt-1 text-[10px] text-slate-500">
                          12-digit UIDAI identity number
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1.5">
                          Upload Aadhar Card (PDF / Image)
                        </label>
                        <input
                          type="file"
                          ref={aadharFileInputRef}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                          onChange={handleAadharFileSelect}
                        />

                        {!aadharFile ? (
                          <button
                            type="button"
                            onClick={() => aadharFileInputRef.current?.click()}
                            disabled={isUploadingAadhar}
                            className="w-full h-11 px-3 border-2 border-dashed border-slate-300 hover:border-[#0066FF] bg-white hover:bg-blue-50/40 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0066FF] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isUploadingAadhar ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#0066FF]" />
                                <span>Uploading Aadhar...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-[#0066FF] transition-colors" />
                                <span>Upload Aadhar Card (PDF/Image)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between p-2 bg-white border border-emerald-300 rounded-xl shadow-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {aadharFile.previewUrl ? (
                                <img
                                  src={aadharFile.previewUrl}
                                  alt="Aadhar Preview"
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                                  <FileCheck className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {aadharFile.name}
                                </p>
                                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {(aadharFile.size / 1024).toFixed(0)} KB · Ready
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {aadharFile.url && (
                                <button
                                  type="button"
                                  onClick={() => window.open(aadharFile.url, '_blank')}
                                  title="View document"
                                  className="p-1 text-slate-400 hover:text-[#0066FF] rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={handleRemoveAadhar}
                                title="Remove file"
                                className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-slate-500">
                          Supports PDF, JPG or PNG (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full h-12 text-sm sm:text-base font-extrabold mt-3 bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-md shadow-blue-500/20 rounded-xl transition-all duration-200 active:scale-[0.99] cursor-pointer"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Complete Student Setup & Launch Dashboard
                  </Button>

                  <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-200">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-[#0066FF] font-extrabold hover:underline cursor-pointer"
                    >
                      Sign in to AI Campus OS
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION PAGE */
            <div className="max-w-md mx-auto py-4">
              <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-fade-in text-slate-900">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-14 h-14 bg-blue-50 border border-blue-200 text-[#0066FF] rounded-2xl flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Verify Email Address
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
                    We've sent a 6-digit OTP verification code to{' '}
                    <span className="font-bold text-slate-900 underline decoration-[#0066FF]/60">
                      {studentEmail}
                    </span>
                  </p>
                </div>

                {/* Email Verification Security Callout */}
                <div className="bg-blue-50 border border-blue-200/80 text-blue-900 rounded-2xl p-3.5 text-xs flex items-start gap-2.5 shadow-xs">
                  <Mail className="w-4 h-4 shrink-0 text-[#0066FF] mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      Security Code Sent
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Please enter the 6-digit code sent to <strong className="text-slate-900 font-bold">{studentEmail}</strong>. If you don't see it in your primary inbox, please check your Spam or Promotions folder.
                    </p>
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
                        placeholder="•"
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-[#0066FF] outline-none transition-all shadow-xs"
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
                    disabled={!canResend || loading}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${
                      canResend && !loading
                        ? 'text-[#0066FF] hover:underline cursor-pointer' 
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {canResend ? 'Resend OTP Code' : `Resend in ${resendTimer}s`}
                  </button>
                </div>

                {/* Submit Verification Button */}
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full h-12 text-sm sm:text-base font-extrabold bg-[#0066FF] hover:bg-[#0052cc] shadow-md shadow-blue-500/20 text-white rounded-xl cursor-pointer"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Verify OTP & Launch Dashboard
                </Button>

                <p className="text-center text-xs text-slate-500 pt-1">
                  Didn't receive the email? Check spam or contact support@aicampusintelligent.com.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


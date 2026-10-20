import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, User, Mail, Lock, Hash, 
  ShieldCheck, RefreshCw, ArrowLeft, Sparkles, Check,
  CreditCard, UploadCloud, FileCheck, CheckCircle2, Eye, Trash2, FileText, Building2
} from 'lucide-react';
import { Button, Input, Badge, Select } from '../../components/ui';
import { toast } from 'sonner';
import { mockColleges, DEPARTMENTS } from '../../mock/data';
import { collegeService, studentService, uploadService } from '../../services';
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
  const [otp, setOtp] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // College Suggestions Search (Instant Local + Backend Lookup)
  useEffect(() => {
    const query = studentCollegeName.trim();
    if (!query || isSelectedCollege) {
      setCollegeSuggestions([]);
      setShowSuggestions(false);
      setCollegeLookup('idle');
      return;
    }

    const qLower = query.toLowerCase();

    // 1. Instant local matching from mockColleges
    const localMatches = mockColleges
      .filter((col) => {
        const nameMatch = col.name.toLowerCase().includes(qLower);
        const codeMatch = col.code.toLowerCase().includes(qLower);
        const cityMatch = col.city ? col.city.toLowerCase().includes(qLower) : false;
        return nameMatch || codeMatch || cityMatch;
      })
      .map((col) => ({
        id: col.id,
        name: col.name,
        code: col.code,
        city: col.city,
        state: col.state,
        departments: (col.departments || []).map((d: any, idx: number) =>
          typeof d === 'string' ? { id: `dept-${idx + 1}`, name: d, code: d } : d
        ),
      }));

    setCollegeSuggestions(localMatches);
    setShowSuggestions(true);
    setCollegeLookup(localMatches.length ? 'idle' : 'loading');

    // 2. Query backend lookup
    let cancelled = false;
    const timer = setTimeout(() => {
      collegeService.lookup(query)
        .then((college) => {
          if (cancelled) return;
          setCollegeLookup('idle');
          if (college) {
            setCollegeSuggestions((prev) => {
              const exists = prev.some((p) => p.name.toLowerCase() === college.name.toLowerCase() || p.code.toUpperCase() === college.code.toUpperCase());
              if (exists) return prev;
              return [
                {
                  id: college.id,
                  name: college.name,
                  code: college.code,
                  city: college.city,
                  departments: college.departments || [],
                },
                ...prev,
              ];
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
  }, [studentCollegeName, isSelectedCollege]);

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
    setShowSuggestions(false);
    setStudentDept((current) => {
      if (college.departments.some((d) => d.name === current)) return current;
      return college.departments.length > 0 ? college.departments[0].name : '';
    });
    toast.success(`Selected ${college.name}`, {
      description: `College Code: ${college.code} · ${college.departments.length} departments available`
    });
  };

  const handleChangeCollege = () => {
    setIsSelectedCollege(false);
    setResolvedCollege(null);
    setStudentDept('');
    setStudentCollegeName('');
    setShowSuggestions(false);
  };

  const matchedCollege = mockColleges.find((college) => {
    const typed = studentCollegeName.trim().toLowerCase();
    return typed && (
      college.name.toLowerCase() === typed ||
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

  // Handle Form Submit -> Proceed to OTP Step
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedCollege) {
      if (collegeSuggestions.length > 0) {
        handleSelectCollege(collegeSuggestions[0]);
      } else {
        toast.error('Please select your institution from the suggestions list');
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
      const cgpaNum = parseFloat(studentCgpa) || 0;
      const deptIdx = DEPARTMENTS.indexOf(studentDept.trim());
      const matchedDepartment = resolvedCollege?.departments.find((department) => department.name === studentDept.trim());
      const collegeId = resolvedCollege?.id || matchedCollege?.id || studentCollegeName.trim();
      const collegeName = resolvedCollege?.name || matchedCollege?.name || studentCollegeName.trim();

      const registered = await studentService.register({
        name: studentName,
        email: studentEmail,
        password: studentPassword,
        studentId: studentIdNum || `${(resolvedCollege?.code || matchedCollege?.code || 'STU')}2021${studentDept.trim().substring(0, 2).toUpperCase()}045`,
        collegeId,
        department: studentDept.trim(),
        departmentId: matchedDepartment?.id || (deptIdx !== -1 ? `dept-${deptIdx + 1}` : 'dept-custom'),
        degree: studentDegree.trim(),
        batch: studentBatch.trim(),
        cgpa: cgpaNum,
        aadharNumber: aadharNumber ? aadharNumber.replace(/\s+/g, '') : undefined,
        aadharCard: aadharFile ? {
          fileName: aadharFile.name,
          fileUrl: aadharFile.url,
          fileSize: aadharFile.size,
          uploadedAt: new Date().toISOString(),
        } : undefined,
      });

      setUser(registered.user, registered.token);
      setTenant(collegeId, collegeName);

      toast.success(`🎉 Verification Successful! Welcome ${studentName.split(' ')[0]}!`, {
        description: `Your profile at ${collegeName} is now active.`
      });
      navigate('/student/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete verification and register account';
      toast.error(message);
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

      {/* RIGHT-ALIGNED FLOATING SQUARE BOX CONTAINER */}
      <div className="relative z-10 w-full max-w-2xl lg:mr-8 xl:mr-12 my-auto max-h-[92vh] overflow-y-auto pr-1">
        
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
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-slate-900 transition-all overflow-visible">
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
                  Enter your college code to load the institution and its departments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="relative" ref={collegeInputContainerRef}>
                  <Input
                    label="College / Institution or college code"
                    labelClassName="text-slate-800 font-semibold"
                    className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="Type 'sona' or college code (e.g. SON1)..."
                    value={studentCollegeName}
                    onChange={(e) => {
                      setStudentCollegeName(e.target.value);
                      setIsSelectedCollege(false);
                    }}
                    onFocus={() => {
                      if (studentCollegeName.trim() && !isSelectedCollege) {
                        setShowSuggestions(true);
                      }
                    }}
                    leftIcon={<Building2 className="w-4 h-4 text-[#08546c]" />}
                    required
                  />

                  {/* Suggestions Dropdown (sudjection) */}
                  {showSuggestions && !isSelectedCollege && studentCollegeName.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          College Suggestions ({collegeSuggestions.length})
                        </span>
                        {collegeLookup === 'loading' && (
                          <span className="text-[10px] text-[#08546c] font-semibold animate-pulse">Searching…</span>
                        )}
                      </div>

                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {collegeSuggestions.length > 0 ? (
                          collegeSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id || suggestion.code}
                              type="button"
                              onClick={() => handleSelectCollege(suggestion)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-cyan-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="w-4 h-4 text-[#08546c] flex-shrink-0" />
                                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#08546c] truncate">
                                    {suggestion.name}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 pl-5 mt-0.5">
                                  {suggestion.city}{suggestion.state ? `, ${suggestion.state}` : ''}
                                  {suggestion.departments?.length ? ` · ${suggestion.departments.length} departments` : ''}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-100/70 text-[#08546c] group-hover:bg-[#08546c] group-hover:text-white transition-colors flex-shrink-0 shadow-xs">
                                {suggestion.code}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-600 font-medium">
                              No institution matches <strong className="text-slate-900">"{studentCollegeName}"</strong>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Try entering college name or 4-character code (e.g. SON1, RVC1).
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Verified College Confirmation */}
                  {resolvedCollege && isSelectedCollege && (
                    <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl shadow-xs">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-emerald-950 truncate">
                          {resolvedCollege.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-emerald-200/70 text-emerald-800 rounded">
                          {resolvedCollege.code}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleChangeCollege}
                        className="text-[11px] font-extrabold text-[#08546c] hover:underline flex-shrink-0 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {resolvedCollege && resolvedCollege.departments.length > 0 ? (
                  <Select
                    label="Department / Branch"
                    labelClassName="text-slate-800 font-semibold"
                    className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm font-medium"
                    placeholder="Select department"
                    value={studentDept}
                    onChange={e => setStudentDept(e.target.value)}
                    options={resolvedCollege.departments.map((department) => ({
                      value: department.name,
                      label: department.code && department.code !== department.name
                        ? `${department.name} (${department.code})`
                        : department.name,
                    }))}
                    required
                  />
                ) : (
                  <Input
                    label="Department / Branch"
                    labelClassName="text-slate-800 font-semibold"
                    className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="Computer Science (CSE)"
                    value={studentDept}
                    onChange={e => setStudentDept(e.target.value)}
                    required
                  />
                )}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Input
                  label="Degree"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  placeholder="B.E."
                  value={studentDegree}
                  onChange={e => setStudentDegree(e.target.value)}
                  required
                />

                <Input
                  label="Batch / Year"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  placeholder="2025 Passout"
                  value={studentBatch}
                  onChange={e => setStudentBatch(e.target.value)}
                  required
                />

                <Input
                  label="CGPA"
                  labelClassName="text-slate-800 font-semibold"
                  className="bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-medium"
                  inputMode="decimal"
                  placeholder="8.5"
                  value={studentCgpa}
                  onChange={e => setStudentCgpa(e.target.value)}
                />
              </div>

              {/* ── Government Identity / Aadhar Verification ────────────────── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-cyan-50/25 to-slate-50 border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#08546c]/10 text-[#08546c] flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        Aadhar Card Verification
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Government Identity Proof for Placement Drives & KYC
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100/70 text-[#08546c] border border-cyan-200/70">
                    KYC Document
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Aadhar Number Input */}
                  <div>
                    <Input
                      label="Aadhar Card Number"
                      labelClassName="text-slate-800 font-semibold text-xs"
                      className="bg-white text-slate-900 border border-slate-300 focus:bg-white focus:border-[#08546c] focus:ring-2 focus:ring-cyan-500/20 shadow-sm placeholder:text-slate-400 font-mono text-sm tracking-wider"
                      placeholder="XXXX XXXX XXXX"
                      value={aadharNumber}
                      onChange={e => handleAadharNumberChange(e.target.value)}
                      maxLength={14}
                      leftIcon={<CreditCard className="w-4 h-4 text-[#08546c]" />}
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      12-digit UIDAI identity number
                    </p>
                  </div>

                  {/* Aadhar Card Document Upload Option */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
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
                        className="w-full h-11 px-3 border-2 border-dashed border-slate-300 hover:border-[#08546c] bg-white hover:bg-cyan-50/40 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-[#08546c] transition-all duration-200 group cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isUploadingAadhar ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#08546c]" />
                            <span>Uploading Aadhar...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-[#08546c] transition-colors" />
                            <span>Upload Aadhar Card (PDF/Image)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300/80 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {aadharFile.previewUrl ? (
                            <img
                              src={aadharFile.previewUrl}
                              alt="Aadhar Preview"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                              <FileCheck className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {aadharFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {(aadharFile.size / 1024).toFixed(0)} KB · Ready to verify
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {aadharFile.url && (
                            <button
                              type="button"
                              onClick={() => window.open(aadharFile.url, '_blank')}
                              title="View document"
                              className="p-1.5 text-slate-400 hover:text-[#08546c] rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveAadhar}
                            title="Remove file"
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-slate-500">
                      Supports front & back copy in PDF, JPG or PNG (Max 10MB)
                    </p>
                  </div>
                </div>
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


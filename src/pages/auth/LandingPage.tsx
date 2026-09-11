import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronDown, 
  Cpu, 
  TrendingUp, 
  Calendar, 
  Building2, 
  Briefcase, 
  Award, 
  Users, 
  MapPin, 
  CheckCircle2, 
  GraduationCap, 
  School,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Globe,
  Star,
  Target,
  ShieldCheck,
  FileText,
  Bot,
  BarChart3,
  ArrowUpRight,
  Check,
  X
} from 'lucide-react';
import { Button } from '../../components/ui';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Active state for FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0);



  const srmFeatures = [
    {
      icon: <Cpu className="w-6 h-6 text-[#08546c]" />,
      title: 'SRM AI Multi-Parameter Matcher',
      badge: '50+ Parameters',
      badgeBg: 'bg-cyan-50 text-[#08546c] border-cyan-200/80',
      description: 'Evaluates 50+ parameters including SRM NetID grades, departmental electives, GitHub projects, and recruiter cutoffs to generate precision match scores.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      title: 'Super Dream Readiness Engine',
      badge: '> 15 LPA Target',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      description: 'Calculates real-time readiness metrics for SRM students targeting >15 LPA offers with actionable skill-gap improvement advice.',
    },
    {
      icon: <School className="w-6 h-6 text-blue-600" />,
      title: 'Multi-Campus Isolation Architecture',
      badge: 'KTR • AP • RMP',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      description: 'Seamlessly connects KTR, Ramapuram, Vadapalani, and AP campuses into one unified placement ecosystem while maintaining departmental data control.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      title: 'Directorate Slotting & Scheduling',
      badge: 'Automated SLA',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      description: 'Automated venue reservation for SRM Tech Auditoriums and virtual panels, managing parallel interview tracks across 1,000+ companies.',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. V. Thirumurugan',
      role: 'Director, Directorate of Career Centre, SRM IST',
      content: 'SRM AI PlacementOS transformed our multi-campus placement drives across KTR, Ramapuram, and AP. We achieved over 10,000+ offers this season with complete transparency and automated AI matching.',
      stat: '10,000+ Offers Generated',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Anitha Rao',
      role: 'Head of Campus Relations, Amazon India',
      content: 'SRM\'s AI candidate shortlisting reduced our screening cycle by 65%. The 50-parameter match scores genuinely reflect candidate coding proficiency and core domain fundamentals.',
      stat: '65% Faster Recruitment',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Arjun Sharma',
      role: 'B.Tech Computer Science (KTR Campus, 2025)',
      content: 'The AI Placement Readiness score identified my exact skill gaps in System Design. Guided by the AI Career Advisor, I secured a 32 LPA Super Dream offer at Amazon!',
      stat: '₹32 LPA Super Dream Offer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const faqs = [
    {
      q: 'How does SRM AI PlacementOS handle Super Dream vs Dream drive eligibility?',
      a: 'The system enforces SRM Directorate guidelines automatically. Students can configure eligibility preferences, while recruiters set cutoffs based on CGPA, backlogs, department electives, and AI readiness scores.'
    },
    {
      q: 'Is student academic data synchronized with SRM University records?',
      a: 'Yes! The platform integrates directly with SRM NetID and examination databases, ensuring CGPA, course credits, and arrear status are 100% verified.'
    },
    {
      q: 'Can recruiters access students across all SRM campuses (KTR, Ramapuram, Vadapalani, AP)?',
      a: 'Yes. Recruiters can choose to conduct combined multi-campus recruitment drives or target specific SRM campuses and specialized departments.'
    },
    {
      q: 'What is the SRM AI TPO Assistant?',
      a: 'It is a specialized natural-language AI trained on SRM placement statistics and guidelines. Placement officers can query real-time analytics, issue mass alerts, and track company pipelines instantly.'
    },
    {
      q: 'How do SRM students practice for technical interviews on the portal?',
      a: 'Students get access to an AI Mock Interviewer and ATS Resume Analyzer tuned to company-specific interview formats for top SRM recruiters like Google, Amazon, TCS, and Barclays.'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-white pt-20">
      
      {/* Top Navbar - Fixed Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/svm.png" 
              alt="SVM Logo" 
              className="h-12 sm:h-16 w-auto object-contain py-1"
            />
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#student-benefits" className="hover:text-slate-900 transition-colors">Student Benefits</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">AI Features</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm px-3 sm:px-4"
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/register')}
              className="bg-slate-950 hover:bg-slate-800 text-white rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-lg transition-all"
            >
              Register
            </Button>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────────
          HERO SECTION - FULLY RESPONSIVE DESKTOP & MOBILE
         ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-6 sm:pt-8 pb-16 lg:pb-32">
        
        {/* Dynamic Curved Deep Oceanic Teal Background Wave (Desktop Only) */}
        <div className="hidden lg:block absolute right-0 top-0 w-[60%] xl:w-[65%] h-full pointer-events-none z-0 overflow-hidden">
          <svg 
            className="absolute right-0 top-0 h-full w-full object-cover" 
            viewBox="0 0 900 800" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            preserveAspectRatio="none"
          >
            <path 
              d="M320 0C250 180 380 320 220 540C120 680 0 720 0 800H900V0H320Z" 
              fill="#08546c" 
            />
          </svg>
          {/* Accent Deep Teal Blob under student */}
          <div className="absolute top-[18%] right-[8%] w-[420px] h-[420px] bg-[#064255] rounded-full blur-none z-0 shadow-2xl opacity-90 transform -rotate-12" />
        </div>

        {/* Hero Main Grid Container */}
        <div className="relative z-10 max-w-[1540px] mx-auto px-4 sm:px-6 lg:pl-16 lg:pr-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            
            {/* Left Column (Content & CTAs) */}
            <div className="lg:col-span-6 xl:col-span-5 pt-2 sm:pt-4 lg:pr-10">
              
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] sm:leading-[1.08] mb-4 sm:mb-6">
                Empowering SRMites with Next-Gen AI Campus Recruitment
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed mb-6 sm:mb-8 font-normal">
                Automating placement management across SRM Kattankulathur (KTR Main Campus), Ramapuram, Vadapalani, and Amaravati (AP). AI-powered job matching, Super Dream drive slotting, ATS resume scoring, and automated interview scheduling — all in one platform.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 text-center"
                >
                  Access SRM Student & TPO Portal
                </button>

                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold px-6 sm:px-7 py-3.5 sm:py-4 rounded-full text-sm sm:text-base shadow-sm transition-all duration-200 text-center"
                >
                  Recruiter Registration →
                </button>
              </div>

            </div>

            {/* Right Column (Big Hero Image) */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex justify-center lg:justify-end items-center pr-0 mt-6 lg:mt-0">
              {/* Mobile Teal Card Backdrop behind Image */}
              <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-[#08546c] to-[#042b37] rounded-3xl -z-10 shadow-xl my-2" />
              <img 
                src="/interview.png" 
                alt="SRM Placement Interview" 
                className="relative z-10 w-full max-w-lg lg:max-w-none h-auto max-h-[360px] sm:max-h-[500px] lg:max-h-[580px] xl:max-h-[640px] object-contain object-center lg:object-right drop-shadow-2xl p-3 lg:p-0"
              />
            </div>

          </div>
        </div>

      </section>



      {/* Bento Grid: How PlacementOS Helps SRM Students */}
      <section id="student-benefits" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#08546c] uppercase tracking-widest px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80">
              Empowering SRMites
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-4 mb-4">
              How AI PlacementOS Supercharges Your SRM Placement Journey
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Designed specifically for SRM KTR, Ramapuram, Vadapalani, and AP campuses. Explore our AI-driven student CRM features built to land Super Dream offers.
            </p>
          </div>

          {/* Bento Grid Layout - Asymmetric 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ── CARD 1: Large Featured Deep Teal Card with Background Image ── */}
            <div className="lg:col-span-7 rounded-[2.2rem] p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[320px] group border border-cyan-500/20">
              {/* Background Image Layer */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity transform scale-105 group-hover:scale-110 transition-transform duration-700"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80')` 
                }}
              />
              {/* Deep Oceanic Teal Gradient Backdrop (#08546c) & Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#08546c] via-[#064255] to-[#042b37]" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-cyan-400/20 blur-3xl rounded-full pointer-events-none" />

              {/* Top Action Arrow Button */}
              <div className="flex justify-between items-start mb-6 z-10">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30">
                  Precision Matching
                </span>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="z-10 max-w-lg">
                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
                  50+ Parameter AI Match Score
                </h3>
                <p className="text-cyan-100 text-sm sm:text-base leading-relaxed opacity-95">
                  Evaluates your SRM CGPA, departmental electives, GitHub projects, and arrear status against company cutoffs so you apply with maximum hiring probability.
                </p>
              </div>
            </div>

            {/* ── CARD 2: Top Right Card (Verified Eligibility - Spans 5 cols) ── */}
            <div className="lg:col-span-5 bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/80 border border-sky-100 rounded-[2.2rem] p-8 text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 mb-2">
                  SRM NetID & Arrear Sync
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Real-time academic data synchronization with SRM Directorate databases. Prevents accidental disqualification by automatically validating CGPA & backlogs.
                </p>
              </div>
            </div>

            {/* ── CARD 3: Bottom Left Card (ATS Resume Optimizer - Spans 5 cols) ── */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/80 via-sky-50 to-indigo-50 border border-blue-100 rounded-[2.2rem] p-8 text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 mb-2">
                  Company-Specific ATS Resume Scoring
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Audits your resume against target MNC formats (Amazon, Barclays, Google) and gives actionable feedback to clear automated recruiter resume screens.
                </p>
              </div>
            </div>

            {/* ── CARD 4: Middle Right Large Card with Deep Teal Background Image ── */}
            <div className="lg:col-span-7 rounded-[2.2rem] p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[320px] group border border-cyan-500/20">
              {/* Background Image Layer */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity transform scale-105 group-hover:scale-110 transition-transform duration-700"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80')` 
                }}
              />
              {/* Deep Oceanic Teal Gradient Backdrop (#08546c) & Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#08546c] via-[#064255] to-[#042b37]" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-cyan-400/20 blur-3xl rounded-full pointer-events-none" />

              {/* Top Action Arrow Button */}
              <div className="flex justify-between items-start mb-6 z-10">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30">
                  Super Dream Target
                </span>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="z-10 max-w-lg">
                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
                  Placement Readiness Index (PRI)
                </h3>
                <p className="text-cyan-100 text-sm sm:text-base leading-relaxed opacity-95">
                  Dynamic readiness meter that tracks your weekly progress toward &gt;15 LPA Super Dream packages and suggests custom skill-up paths.
                </p>
              </div>
            </div>

            {/* ── CARD 5: Bottom Left Card (AI Mock Technical & HR Simulator - Spans 6 cols) ── */}
            <div className="lg:col-span-6 bg-gradient-to-br from-purple-50/80 via-indigo-50/60 to-blue-50 border border-purple-100 rounded-[2.2rem] p-8 text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-purple-600">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 mb-2">
                  Interactive Technical & HR Simulator
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Practice mock technical and HR rounds with an AI interviewer tuned to SRM placement patterns, receiving real-time code and communication feedback.
                </p>
              </div>
            </div>

            {/* ── CARD 6: Bottom Right Card (Automated Slotting & Venue Alerts - Spans 6 cols) ── */}
            <div className="lg:col-span-6 bg-gradient-to-br from-cyan-50/80 via-sky-50/60 to-blue-50 border border-cyan-100 rounded-[2.2rem] p-8 text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-cyan-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 mb-2">
                  Automated Slotting & Venue Alerts
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Instant SMS & portal notifications for interview tracks at SRM Tech Auditoriums or virtual panels. Never miss a round or schedule change.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Student CTA Banner */}
          <div className="mt-12 bg-gradient-to-r from-[#08546c] via-[#064255] to-[#042b37] rounded-[2.2rem] p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-cyan-500/30">
            <div className="max-w-xl">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">SRM Student Advantage</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-2 mb-2">
                Ready to secure your Dream or Super Dream offer?
              </h3>
              <p className="text-cyan-100 text-sm leading-relaxed">
                Log in with your SRM NetID credentials to view your live AI placement readiness score and active campus drives.
              </p>
            </div>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-cyan-50 text-[#08546c] font-extrabold px-8 py-4 rounded-full text-sm shrink-0 shadow-lg transition-all duration-200 hover:scale-105"
            >
              Access Student Portal →
            </button>
          </div>

        </div>
      </section>

      {/* Side-by-Side Comparison Section - Matching exact reference design */}
      <section className="py-24 bg-slate-100/70 border-t border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#08546c] uppercase tracking-widest">
              The Choice is Clear
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-3 mb-3 leading-tight">
              Switching takes a few minutes.<br />
              The alternative costs you every season.
            </h2>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: WITH PLACEMENTOS */}
            <div className="space-y-3">
              {/* Main Header Pill */}
              <div className="bg-[#08546c] text-white font-extrabold text-lg py-3.5 px-6 rounded-2xl text-center shadow-md border border-cyan-600/40">
                With SRM AI PlacementOS
              </div>

              {/* Stack of Light Teal Benefit Rows */}
              {[
                { icon: <Target className="w-4 h-4 text-[#08546c]" />, text: 'AI 50-parameter candidate matching cuts screening by 85%.' },
                { icon: <ShieldCheck className="w-4 h-4 text-[#08546c]" />, text: '100% SRM NetID & arrear verification eliminates ineligible registrations.' },
                { icon: <Zap className="w-4 h-4 text-[#08546c]" />, text: 'Super Dream drive slotting automated across KTR, Ramapuram, & AP.' },
                { icon: <FileText className="w-4 h-4 text-[#08546c]" />, text: 'Built-in ATS resume auditor boosts student shortlists to 92.4%.' },
                { icon: <Bot className="w-4 h-4 text-[#08546c]" />, text: 'AI mock interview simulator prepares SRMites for top MNC drives.' },
                { icon: <BarChart3 className="w-4 h-4 text-[#08546c]" />, text: 'Real-time Directorate placement analytics with instant alert hub.' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-cyan-50/80 hover:bg-cyan-100/70 transition-colors border border-cyan-200/80 rounded-2xl p-4 flex items-center gap-3.5 text-slate-900 font-semibold text-sm shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-[#08546c] flex items-center justify-center shrink-0 shadow-sm border border-cyan-100">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Right Column: WITHOUT PLACEMENTOS */}
            <div className="space-y-3">
              {/* Main Header Pill */}
              <div className="bg-slate-800 text-white font-extrabold text-lg py-3.5 px-6 rounded-2xl text-center shadow-md border border-slate-700">
                Without PlacementOS (Manual Way)
              </div>

              {/* Stack of White Error Rows with Red X */}
              {[
                'Manual resume sorting takes weeks, leading to missed MNC drive deadlines.',
                'Unverified CGPA & arrears cause last-minute recruiter candidate rejections.',
                'Disconnected campus placement cells create scheduling clashes & chaos.',
                'Generic student resumes fail automated recruiter ATS screening filters.',
                'Students step into technical interviews without structured domain practice.',
                'Manual Excel tracking leads to lost student data and delayed offer letters.',
              ].map((text, idx) => (
                <div 
                  key={idx} 
                  className="bg-white hover:bg-red-50/30 transition-colors border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 text-slate-600 font-medium text-sm shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                    <X className="w-4 h-4" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* AI Features Section - Deep Oceanic Teal Theme */}
      <section id="features" className="py-28 bg-[#08546c] text-white relative overflow-hidden border-t border-cyan-700/40">
        {/* Ambient Radial Lights Overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-400/20 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 shadow-sm">
              AI-First Platform Features
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-5 mb-4 leading-tight">
              Built for SRM Placement Officers, Recruiters & Students
            </h2>
            <p className="text-cyan-100/90 text-base sm:text-lg leading-relaxed font-normal">
              Every workflow is powered by custom AI models designed to optimize placement rates and match accuracy across SRM campuses.
            </p>
          </div>

          {/* 4 Core Features Grid - White Background Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {srmFeatures.map((feat, i) => (
              <div 
                key={i} 
                className="bg-white border border-slate-200/90 rounded-[2.2rem] p-8 sm:p-9 hover:border-cyan-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl group relative overflow-hidden text-slate-900"
              >
                {/* Accent Glow Circle */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-100/40 rounded-full blur-2xl group-hover:bg-cyan-200/50 transition-colors pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                    {feat.icon}
                  </div>
                  <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border shadow-sm ${feat.badgeBg}`}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-3 tracking-tight relative z-10">
                  {feat.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal relative z-10">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>

          {/* Role-Specific Capabilities Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '🎓 For SRM Students',
                accentBorder: 'border-cyan-400/40 hover:border-cyan-400/70',
                badgeBg: 'from-[#0a607b] via-[#08546c] to-[#064255]',
                checkColor: 'text-amber-300',
                items: [
                  'SRM NetID verified profile',
                  'AI Super Dream job recommendations',
                  'ATS Resume score & improvement tips',
                  'Skill gap analysis against target MNCs',
                  'Mock AI technical interview simulator',
                  'Placement readiness score tracking',
                ],
              },
              {
                title: '📋 For Directorate of Career Centre',
                accentBorder: 'border-amber-400/40 hover:border-amber-400/70',
                badgeBg: 'from-[#095972] via-[#08546c] to-[#053a4b]',
                checkColor: 'text-amber-300',
                items: [
                  'Unified multi-campus student management',
                  'Super Dream / Dream drive slot manager',
                  'AI TPO Natural Language Assistant',
                  'Automated venue & interview scheduler',
                  'Mass SMS & Email broadcast system',
                  'Live placement analytics & reports',
                ],
              },
              {
                title: '🏢 For Campus Recruiters',
                accentBorder: 'border-cyan-400/40 hover:border-cyan-400/70',
                badgeBg: 'from-[#074f66] via-[#064255] to-[#042d3b]',
                checkColor: 'text-amber-300',
                items: [
                  'Pre-scored SRM candidate shortlists',
                  'Custom CGPA & backlog cutoff filters',
                  'Automated multi-round interview paneling',
                  'Instant offer letter management',
                  'Multi-campus access (KTR, AP, Ramapuram)',
                  'Analytics on candidate acceptance rate',
                ],
              },
            ].map((roleCard, idx) => (
              <div 
                key={idx} 
                className={`bg-gradient-to-b ${roleCard.badgeBg} border ${roleCard.accentBorder} rounded-[2.2rem] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <h3 className="text-xl font-black text-white mb-6 pb-4 border-b border-cyan-500/30">
                  {roleCard.title}
                </h3>
                <ul className="space-y-4">
                  {roleCard.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3.5 text-sm text-cyan-100 font-medium">
                      <CheckCircle2 className={`w-4 h-4 ${roleCard.checkColor} flex-shrink-0 mt-0.5`} />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials - Styled exactly like specified reference design */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-slate-50/80 via-cyan-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Top Row: Title Header */}
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.15] mb-4">
              <span className="text-[#08546c]">10,000+ offers</span> generated on SRM PlacementOS
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
              See why the Directorate of Career Centre, top MNC recruiters, and students rely on AI PlacementOS.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 text-[#08546c] hover:text-[#064255] font-bold text-sm group transition-colors"
            >
              <span>Read all success stories</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => {
              const isMiddle = i === 1;
              return (
                <div 
                  key={i} 
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                    isMiddle
                      ? 'bg-gradient-to-b from-white via-white to-blue-50/50 shadow-xl border border-blue-200/80 ring-2 ring-blue-500/20'
                      : 'bg-white border border-slate-200/80 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="mb-8">
                    <p className="text-slate-700 text-sm leading-relaxed font-normal">
                      {t.content}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3.5">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm tracking-tight truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          AGENTIC USE CASE GUIDE BANNER (EXACT REFERENCE DESIGN REPLICATION)
         ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#08546c] text-white relative overflow-hidden border-t border-cyan-700/40">
        {/* Subtle background ambient curves */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-300 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Graphic Showcase Box */}
            <div className="lg:col-span-6 relative">
              <div className="bg-gradient-to-br from-[#c9f5ed] via-[#b6eee3] to-[#faf0b0] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
                
                {/* Booklet Playbook Mockup */}
                <div className="relative w-full max-w-lg aspect-[4/3] bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-900/10 flex">
                  {/* Left Booklet Page */}
                  <div className="w-1/2 p-5 sm:p-6 bg-white border-r border-slate-200 flex flex-col justify-between relative shadow-inner">
                    <div className="space-y-4">
                      {/* Logo badges */}
                      <div className="flex items-center gap-1.5 opacity-90">
                        <div className="w-4 h-4 rounded-full bg-blue-600" />
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                        <div className="w-4 h-4 rounded-full bg-amber-500" />
                      </div>
                      
                      {/* Cover Title */}
                      <div className="pt-4">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                          USE CASE GUIDE
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                          SRM Placement<br />Agents
                        </h4>
                      </div>
                    </div>

                    {/* Bottom Image / Decorative Icon */}
                    <div className="bg-gradient-to-tr from-cyan-100 to-sky-50 rounded-xl p-3 border border-cyan-200/60 mt-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-[#08546c]" />
                        <span className="text-[11px] font-bold text-[#08546c]">Agentic Placement v3.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Booklet Page */}
                  <div className="w-1/2 p-4 sm:p-5 bg-[#ebf7f4] flex flex-col justify-between">
                    <div>
                      {/* Page Banner Header */}
                      <div className="bg-[#246255] text-white p-3 rounded-xl mb-3 shadow-sm">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-200 mb-1">
                          WHY THE FUTURE STARTS NOW
                        </h5>
                        
                        {/* Circle Metric */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="w-10 h-10 rounded-full border-4 border-amber-300 flex items-center justify-center text-[10px] font-bold text-white bg-[#1b4e43]">
                            72%
                          </div>
                          <span className="text-[9px] text-emerald-100 font-medium leading-tight max-w-[80px]">
                            AI match accuracy boost
                          </span>
                        </div>
                      </div>

                      {/* Text Snippet Simulation */}
                      <div className="space-y-1.5 text-[8px] sm:text-[9px] text-slate-600 leading-tight opacity-80">
                        <p>Executive leadership has entered a digital-first era. SRM PlacementOS equips TPO officers and students with AI agents.</p>
                        <p>Autonomous workflow engines match candidates in real-time across 50+ eligibility cutoffs.</p>
                      </div>
                    </div>

                    {/* Bottom Metric Badges */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-300/60">
                      <div className="bg-[#1b4e43] text-white p-2 rounded-lg text-center">
                        <div className="text-[11px] font-black text-amber-300">15.1%</div>
                        <div className="text-[7px] text-slate-200 leading-tight">Increase in offers</div>
                      </div>
                      <div className="bg-[#1b4e43] text-white p-2 rounded-lg text-center">
                        <div className="text-[11px] font-black text-amber-300">9.4%</div>
                        <div className="text-[7px] text-slate-200 leading-tight">Higher pkg avg</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Text Content Area */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Category Eyebrow */}
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-cyan-200">
                USE CASE GUIDE: SRM PLACEMENT AGENTS
              </p>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                Step into the future with Agentic Placement
              </h2>

              {/* Description */}
              <p className="text-cyan-50/90 text-base sm:text-lg leading-relaxed font-normal">
                Empower your entire campus placement organization with plug-and-play assistive agents that work in partnership with your team to take on time consuming tasks, allowing your team to work faster, smarter, and more effectively. Learn more about SRM's placement agents for:
              </p>

              {/* Bulleted List */}
              <ul className="space-y-2.5 text-base sm:text-lg text-white font-medium pl-2">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>Placement leaders and Directorate</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>Recruiters and account managers</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>Placement operations and administrators</span>
                </li>
              </ul>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white hover:bg-cyan-50 text-[#08546c] font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 text-base"
                >
                  Get the guide
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section - Clean Light Theme */}
      <section id="faq" className="py-20 bg-white text-slate-950 border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-900 text-sm sm:text-base gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action with Background Image & Gradient Overlay */}
      <section className="relative py-28 overflow-hidden bg-[#042b37] text-white border-t border-cyan-900/60">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity transform scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80')` 
          }}
        />
        
        {/* Dark Oceanic Gradient Backdrop & Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#031e27] via-[#042b37]/90 to-[#064255]/85" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full inline-block mb-6">
            SRM Placement Season 2025–26 Live
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
            Ready to Access the SRM AI Placement Portal?
          </h2>
          <p className="text-cyan-100/90 text-base sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Join 10,000+ SRMites and 1,100+ global recruiters achieving record-breaking campus placements this season.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')} 
              className="bg-white text-[#08546c] hover:bg-cyan-50 font-extrabold text-base px-9 py-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Student & Faculty Portal Access
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-[#064255] hover:bg-[#053646] text-white border border-cyan-500/40 text-base px-9 py-4 rounded-full font-bold shadow-xl transition-all duration-200 backdrop-blur-md hover:scale-105 active:scale-95"
            >
              Recruiter Sign In →
            </button>
          </div>
        </div>
      </section>

      {/* Official SRM Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">SRM Institute of Science and Technology</span>
              <p className="text-[11px] text-slate-400">Directorate of Career Centre • Powered by AI PlacementOS</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center md:text-left">
            © 2025 SRM Institute of Science and Technology. All Rights Reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-cyan-200/80">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">SRM Placement Guidelines</a>
            <a href="#" className="hover:text-white transition-colors">Career Centre Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

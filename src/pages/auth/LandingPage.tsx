import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronRight, 
  Star, 
  Menu, 
  X, 
  Check, 
  ExternalLink,
  ChevronLeft,
  GraduationCap,
  Code2,
  RefreshCw,
  Search,
  Sparkles,
  ArrowUp,
  Video,
  FileText,
  MessageSquare
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const testimonials = [
    {
      id: 1,
      rating: 5,
      quote: "I had a very good experience using this platform. The application process was smooth, easy to understand, and user-friendly. I appreciate how quickly everything was organized and updated. Overall, the experience was professional and convenient.",
      author: "S V S Susmitha Sriya",
      source: "Trustpilot",
      date: "20 May 2026",
      sourceType: "trustpilot" as const,
    },
    {
      id: 2,
      rating: 5,
      quote: "My overall experience with the platform is great and its the best platform for conducting online interviews. I recommend it to everyone to use for their interviews. This saves significant time for both recruiters and candidates. Students mainly have benefits as the job postings and interviews can be done at one platform.",
      author: "Harshini",
      role: "IT professional",
      source: "Capterra",
      date: "21 Feb 2026",
      sourceType: "capterra" as const,
    },
    {
      id: 3,
      rating: 5,
      quote: "The platform makes it easy to manage assessments, shortlisting, interviews, and communication in one place, without having to juggle multiple tools. This saves significant time for both recruiters and candidates across our nationwide campus drives.",
      author: "Syed I.",
      role: "Manager - Corporate Relations and Placements",
      source: "G2",
      date: "5 May 2026",
      incentivized: true,
      sourceType: "g2" as const,
    },
    {
      id: 4,
      rating: 5,
      quote: "Ease of access and exposure to high quality companies while reaching candidates with a single click. Everything was fast, reliable and kept me updated throughout the cycle.",
      author: "Divyanshu Singh",
      source: "Trustpilot",
      date: "9 Jul 2026",
      sourceType: "trustpilot" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ───────────────── HEADER NAVBAR ───────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shadow-md shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
              <GraduationCap className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Placement<span className="text-[#0066FF]">OS</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-9 text-[15px] font-medium text-slate-600">
            <a href="#institutions" className="hover:text-slate-950 transition-colors">Institutions</a>
            <a href="#recruiters" className="hover:text-slate-950 transition-colors">Recruiters</a>
            <a href="#candidates" className="hover:text-slate-950 transition-colors">Candidates</a>
            <a href="#solutions" className="hover:text-slate-950 transition-colors">Solutions</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-7">
            <button 
              onClick={() => setContactModalOpen(true)}
              className="text-[15px] font-medium text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Contact sales
            </button>
            <Link 
              to="/login"
              className="text-[15px] font-medium text-slate-600 hover:text-slate-950 transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/register"
              className="bg-[#0B1528] hover:bg-slate-800 text-white text-[15px] font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            className="md:hidden p-2 text-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pt-3 pb-6 border-b border-slate-100 bg-white flex flex-col gap-4 text-base font-medium">
            <a href="#institutions" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 py-1">Institutions</a>
            <a href="#recruiters" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 py-1">Recruiters</a>
            <a href="#candidates" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 py-1">Candidates</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 py-1">Solutions</a>
            <button onClick={() => { setMobileMenuOpen(false); setContactModalOpen(true); }} className="text-left text-slate-700 py-1">Contact sales</button>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-2.5 text-slate-800 font-semibold border border-slate-200 rounded-full">Log in</Link>
              <Link to="/register" className="w-full text-center py-2.5 bg-[#0B1528] text-white font-semibold rounded-full">Sign up</Link>
            </div>
          </div>
        )}
      </header>

      {/* ───────────────── HERO SECTION (Screenshot 1) ───────────────── */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-7 pr-0 lg:pr-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight text-slate-950 leading-[1.08] mb-6">
                India's largest campus hiring platform
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 font-normal leading-relaxed max-w-xl mb-9">
                Conduct outreach, engagement, assessments, and roll out offers on a single, integrated platform.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <Link
                  to="/register"
                  className="bg-[#0B1528] hover:bg-slate-800 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get started
                </Link>

                {/* G2 Rating Pill */}
                <a 
                  href="https://www.g2.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs group"
                >
                  {/* G2 Red/Orange Logo */}
                  <div className="w-5 h-5 rounded-full bg-[#FF492C] flex items-center justify-center text-white text-[10px] font-black">
                    G
                  </div>
                  <span className="text-sm font-bold text-slate-800">4.6</span>
                  <div className="flex text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                  <span className="text-sm text-slate-600 font-medium">on G2</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Metrics Divider */}
              <div className="w-full h-px bg-slate-200/80 mb-8" />

              {/* 3 Metric Counters */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                    30M+
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">
                    STUDENTS
                  </div>
                </div>

                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                    1,400+
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">
                    EDUCATIONAL INSTITUTIONS
                  </div>
                </div>

                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                    600+
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">
                    EMPLOYERS
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Column (Modern Campus Hiring Showcase) */}
            <div className="lg:col-span-5 xl:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[500px]">
                {/* Background Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[32px] blur-xl opacity-70 -z-10" />

                {/* Main Hero Image Container */}
                <div className="relative rounded-[28px] overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
                  <img
                    src="/campus_hiring_hero.jpg"
                    alt="Campus Hiring and Student Placements"
                    className="w-full h-[440px] sm:h-[480px] object-cover object-center transform hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── AUDIENCE SECTIONS (Screenshot 2) ───────────────── */}
      <section className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 divide-y divide-slate-100">
          
          {/* 1. RECRUITERS */}
          <div id="recruiters" className="py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">
            <span id="employers" className="sr-only" />
            <div className="lg:col-span-5">
              <span className="text-[13px] font-black uppercase tracking-widest text-[#0066FF] block mb-2">
                RECRUITERS & ENTERPRISES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight max-w-sm">
                End-to-end virtual campus hiring
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Automate your entire campus hiring drive. From outreach, engagement, assessments and virtual interviews to industry benchmarking and analytics.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-900 font-semibold text-sm transition-colors"
              >
                Start Hiring
              </Link>
            </div>
          </div>

          {/* 2. INSTITUTIONS */}
          <div id="institutions" className="py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">
            <span id="universities" className="sr-only" />
            <div className="lg:col-span-5">
              <span className="text-[13px] font-black uppercase tracking-widest text-[#0066FF] block mb-2">
                INSTITUTIONS & COLLEGES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight max-w-sm">
                Digitise and automate placements online
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Streamline your campus placement process: access the latest job openings, manage student data and secure interviews, all aimed at a 100% placement success rate.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-900 font-semibold text-sm transition-colors"
              >
                Transform Placements
              </Link>
            </div>
          </div>

          {/* 3. CANDIDATES */}
          <div id="candidates" className="py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">
            <span id="students" className="sr-only" />
            <div className="lg:col-span-5">
              <span className="text-[13px] font-black uppercase tracking-widest text-[#0066FF] block mb-2">
                STUDENTS & CANDIDATES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight max-w-sm">
                Learn, prepare and apply to jobs
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Discover new jobs, upskill through courses, take mock interviews. Open to all students.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-900 font-semibold text-sm transition-colors"
              >
                Find a job
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────── ALL-INCLUSIVE PLATFORM FOR FEARLESS HIRING (Screenshot 1) ───────────────── */}
      <section id="solutions" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-slate-100 scroll-mt-24">
        <span id="assessments" className="sr-only" />
        <span id="reviews" className="sr-only" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight mb-4">
              All-inclusive platform for Fearless Hiring
            </h2>
            <p className="text-base text-slate-500 font-normal">
              Everything you need to get into action and achieve all your hiring goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {/* 1. Coding Assessments */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0066FF]/30 bg-blue-50/60 flex items-center justify-center text-[#0066FF] mb-5 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white">
                <Code2 className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PlacementOS Coding Assessments
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Seamlessly test candidates' coding skills across all domains
              </p>
            </div>

            {/* 2. Functional Assessments */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0066FF]/30 bg-blue-50/60 flex items-center justify-center text-[#0066FF] mb-5 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white">
                <RefreshCw className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PlacementOS Functional Assessments
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Assess candidates on cognitive, behavioural, soft skills, and functional domains
              </p>
            </div>

            {/* 3. Proctoring */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0066FF]/30 bg-blue-50/60 flex items-center justify-center text-[#0066FF] mb-5 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white">
                <Search className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PlacementOS Proctoring
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Monitor candidates anywhere, anytime, to ensure fraud-free assessments and interviews
              </p>
            </div>

            {/* 4. College Hiring Workflows */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0066FF]/30 bg-blue-50/60 flex items-center justify-center text-[#0066FF] mb-5 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white">
                <Sparkles className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PlacementOS College Hiring Workflows
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Select fresh talent from top campuses easily with our end-to-end recruitment platform
              </p>
            </div>

            {/* 5. Onboarding */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0066FF]/30 bg-blue-50/60 flex items-center justify-center text-[#0066FF] mb-5 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white">
                <ArrowUp className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PlacementOS Onboarding
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Engage and welcome new employees with smooth, paperless onboarding
              </p>
            </div>

            {/* 6. Video Interviews */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0066FF]/30 bg-blue-50/60 flex items-center justify-center text-[#0066FF] mb-5 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white">
                <Video className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PlacementOS Video Interviews
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Interview candidates from the comfort of your home or office
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── THE HUMAN WAY · THE FEARLESS WAY (Screenshot 2) ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Campus Recruiters Image */}
          <div className="relative h-96 sm:h-[480px] lg:h-auto min-h-[460px] overflow-hidden">
            <img 
              src="/campus_recruiters.jpg" 
              alt="Campus recruitment professionals" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/20 lg:to-transparent pointer-events-none" />
          </div>

          {/* Right Column: In our theme color (PlacementOS Royal Blue / Cyan Gradient) */}
          <div className="bg-gradient-to-br from-[#0284C7] via-[#0066FF] to-[#1E40AF] text-white p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-center">
            {/* Heading Stanzas */}
            <div className="space-y-1 mb-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                The human way.
              </h3>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                The fearless way.
              </h3>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white/95 leading-tight">
                It’s a hiring experience with a difference.
              </h3>
            </div>

            {/* 3 Services List with Clean Outlined Icon Cards */}
            <div className="space-y-8 max-w-xl">
              {/* Service 1 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    College Hiring Services
                  </h4>
                  <p className="text-sm text-white/85 leading-relaxed font-normal">
                    College hiring strategy and execution driven by decades of experience in consulting and flawless operations management
                  </p>
                </div>
              </div>

              {/* Service 2 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <FileText className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    Assessment Services
                  </h4>
                  <p className="text-sm text-white/85 leading-relaxed font-normal">
                    Customised assessments and content to match your unique requirements
                  </p>
                </div>
              </div>

              {/* Service 3 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    Interview Services
                  </h4>
                  <p className="text-sm text-white/85 leading-relaxed font-normal">
                    Experienced interviewers to evaluate candidates and help you select the best
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── DARK NAVY FEATURE SECTION (Screenshot 3) ───────────────── */}
      <section className="bg-[#0B1528] text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-2xl leading-[1.12]">
              We don't automate hiring, we build your brand
            </h2>
          </div>

          {/* 3-Column Feature Layout */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
            
            {/* Column 1: Topic Heading */}
            <div className="md:col-span-3">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Reach and engage
              </h3>
            </div>

            {/* Column 2: Competitions, Hackathons & Drive Day */}
            <div className="md:col-span-5 space-y-10">
              <div>
                <h4 className="text-base font-bold text-white mb-2.5">
                  Competitions and hackathons
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Run team competitions, hackathons, case studies and business simulations to reach students long before they are on the market.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-3">
                  Internships, fairs and drive day
                </h4>
                <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>End-to-end management of internship programmes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Online career fairs and pool campuses run as virtual events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Drive day sequenced from a control centre</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3: Employer Branding */}
            <div className="md:col-span-4">
              <h4 className="text-base font-bold text-white mb-3">
                Employer branding
              </h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>Customised interactive microsites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>Live pre-placement talks & decks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>Physical on-campus activations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>SMS, email and push campaigns</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── REVIEWS & SOCIAL PROOF SECTION (Screenshot 4) ───────────────── */}
      <section id="reviews" className="py-20 lg:py-28 bg-[#FAFAFA] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Title & Subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-3">
              Loved by organizations and users alike
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              Scores as published on each platform. Every quote links to the review it came from.
            </p>
          </div>

          {/* 4 Score Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            
            {/* Card 1: Capterra */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
              {/* Capterra Logo Mark */}
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <path d="M16 2L4 26H28L16 2Z" fill="#002B49" />
                  <path d="M16 2L4 26H16L20 14L16 2Z" fill="#F36C3D" />
                  <path d="M16 26L20 14L28 26H16Z" fill="#0099FF" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-950 tracking-tight">4.8</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5</span>
                </div>
                <div className="flex text-amber-400 text-xs my-0.5">
                  {'★★★★★'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Capterra
                </div>
              </div>
            </div>

            {/* Card 2: Trustpilot */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
              {/* Trustpilot Green Star Logo */}
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <path d="M16 2L20.2 11.8L30.7 12.6L22.6 19.5L25.1 29.8L16 24.3L6.9 29.8L9.4 19.5L1.3 12.6L11.8 11.8L16 2Z" fill="#00B67A" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-950 tracking-tight">4.9</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5</span>
                </div>
                <div className="flex text-amber-400 text-xs my-0.5">
                  {'★★★★★'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Trustpilot
                </div>
              </div>
            </div>

            {/* Card 3: G2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
              {/* G2 Red Badge */}
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#FF492C] flex items-center justify-center text-white text-base font-black shadow-xs">
                G
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-950 tracking-tight">4.6</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5</span>
                </div>
                <div className="flex text-amber-400 text-xs my-0.5">
                  {'★★★★★'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  G2
                </div>
              </div>
            </div>

            {/* Card 4: Google Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
              {/* Google 4-Color Logo */}
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-950 tracking-tight">4.8</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5</span>
                </div>
                <div className="flex text-amber-400 text-xs my-0.5">
                  {'★★★★★'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Google Reviews
                </div>
              </div>
            </div>

          </div>

          {/* Testimonials Carousel Controls */}
          <div className="flex justify-end gap-2 mb-4">
            <button 
              type="button"
              onClick={() => setActiveTestimonialIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeTestimonialIdx === 0}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setActiveTestimonialIdx((prev) => Math.min(testimonials.length - 1, prev + 1))}
              disabled={activeTestimonialIdx === testimonials.length - 1}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Testimonial Quote Cards Grid (Matching Screenshot 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div 
                key={t.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* 5 Yellow Stars */}
                  <div className="flex text-amber-400 text-sm mb-4">
                    {'★★★★★'}
                  </div>

                  {/* Quote Body */}
                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal mb-6">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-100 flex items-start gap-3">
                  {t.sourceType === 'trustpilot' && (
                    <div className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5">
                      <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    </div>
                  )}
                  {t.sourceType === 'capterra' && (
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M12 2L4 20H20L12 2Z" fill="#F36C3D" />
                      </svg>
                    </div>
                  )}
                  {t.sourceType === 'g2' && (
                    <div className="w-5 h-5 rounded-full bg-[#FF492C] flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 mt-0.5">
                      G
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {t.author}
                    </div>
                    {t.role && (
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.role}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">
                      {t.source} · {t.date}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="bg-white border-t border-slate-200 py-16 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <GraduationCap className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight">
              Placement<span className="text-[#0066FF]">OS</span>
            </span>
            <span className="text-slate-400 text-xs ml-3">© 2026 PlacementOS Platform. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <Link to="/login" className="hover:text-slate-900">Sign in</Link>
            <Link to="/register" className="hover:text-slate-900">Register</Link>
            <button onClick={() => setContactModalOpen(true)} className="hover:text-slate-900 cursor-pointer">Contact</button>
            <a href="#institutions" className="hover:text-slate-900">Institutions</a>
            <a href="#recruiters" className="hover:text-slate-900">Recruiters</a>
            <a href="#candidates" className="hover:text-slate-900">Candidates</a>
            <a href="#solutions" className="hover:text-slate-900">Solutions</a>
          </div>
        </div>
      </footer>

      {/* ───────────────── CONTACT SALES MODAL ───────────────── */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100">
            <button
              type="button"
              onClick={() => { setContactModalOpen(false); setContactSubmitted(false); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {!contactSubmitted ? (
              <div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-2">
                  Talk to our campus experts
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Learn how PlacementOS can power your institutional placements and campus hiring drives.
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      required 
                      placeholder="e.g. Dr. Rajesh Kumar" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Work / College Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="tpo@university.edu.in" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Organization / College Name</label>
                    <input 
                      required 
                      placeholder="e.g. Indian Institute of Technology" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0B1528] hover:bg-slate-800 text-white font-semibold rounded-full text-sm mt-4 transition-colors shadow-sm"
                  >
                    Request Demo & Connect
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Thank you!</h4>
                <p className="text-sm text-slate-600 mb-6">
                  Our campus partnership team will reach out to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => { setContactModalOpen(false); setContactSubmitted(false); }}
                  className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

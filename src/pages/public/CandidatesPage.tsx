import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sliders,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
  Award
} from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ContactSalesModal } from '../../components/public/ContactSalesModal';

export const CandidatesPage: React.FC = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Preparation Accordion State
  const [activePrepTab, setActivePrepTab] = useState<number>(0);

  // Day to Day Accordion State
  const [activeJobTab, setActiveJobTab] = useState<number>(0);

  // Interactive ATS Simulator State
  const [activeSkills, setActiveSkills] = useState<string[]>([
    'Data Structures & Algorithms',
    'React.js',
    'TypeScript',
    'REST APIs'
  ]);

  const availableSkills = [
    'Data Structures & Algorithms',
    'React.js',
    'TypeScript',
    'Node.js',
    'REST APIs',
    'Docker & Containers',
    'PostgreSQL / SQL',
    'System Design Fundamentals',
    'Git & CI/CD',
    'AWS / Cloud Basics'
  ];

  const toggleSkill = (skill: string) => {
    if (activeSkills.includes(skill)) {
      if (activeSkills.length > 2) {
        setActiveSkills(activeSkills.filter(s => s !== skill));
      }
    } else {
      setActiveSkills([...activeSkills, skill]);
    }
  };

  const atsScore = Math.min(98, 48 + activeSkills.length * 5.2);

  // Preparation Items matching Reference Screenshot 2
  const prepItems = [
    {
      title: "Diagnostic test",
      description: "Find out where you actually stand before you start applying, and which career pathways fit the strengths you already have."
    },
    {
      title: "AI Mock Interviews",
      description: "Simulate realistic technical and behavioral interviews with real-time feedback on your speech clarity, problem-solving speed, and algorithmic correctness."
    },
    {
      title: "English Fluency",
      description: "Analyze spoken pacing, vocabulary range, clarity, and grammatical precision with real-time conversational pronunciation coaching."
    },
    {
      title: "Assessments",
      description: "Solve verified coding challenges and aptitude tests with instant automated test cases, time-complexity audits, and score reports."
    },
    {
      title: "Career recommendations",
      description: "Receive hyper-personalized job drive recommendations based on your verified skills, academic registry records, and interview performance."
    }
  ];

  // Day to Day Items matching Reference Screenshot 3
  const jobItems = [
    {
      title: "A resume that gets you shortlisted",
      description: "Ready-made templates to showcase your best profile. Export a PDF, or share a live link to your profile, and rebuild it in seconds when you add a project or an internship."
    },
    {
      title: "Apply from your phone",
      description: "Track campus drive deadlines, submit 1-tap verified applications, and confirm interview slots directly from your mobile browser or app."
    },
    {
      title: "Track your application",
      description: "Real-time transparent status stages: Shortlisted, OA Scheduled, Technical Round, and Verified Offer Letter updates without ghosting."
    }
  ];

  const faqs = [
    {
      q: "Is AI Campus OS free for college students?",
      a: "Yes! Creating a candidate profile, testing your resume with our ATS scorer, taking practice mock interviews, and applying to campus & pool drives is completely free for students."
    },
    {
      q: "Can I apply to drives if my college is not currently registered on the platform?",
      a: "Absolutely. While your college placement cell can invite you to exclusive on-campus drives, any student can sign up to access national pool campus drives, open hackathons, and enterprise off-campus hiring initiatives."
    },
    {
      q: "How does the AI Mock Interviewer work?",
      a: "You select a target company or job role (e.g., SDE-1 at Amazon, Data Analyst at Flipkart). Our AI asks authentic past interview questions, evaluates your spoken responses, inspects your live code submissions, and produces a breakdown of your strengths and improvement areas."
    },
    {
      q: "What makes the ATS resume checker different from generic tools?",
      a: "Generic tools check for formatting only. Our ATS engine is tuned on actual hiring filters used by top tech and consulting recruiters (Workday, Greenhouse, Taleo) to score keyword density, measurable impact verbs, and technical authenticity."
    },
    {
      q: "Are the coding assessments aligned with company interview rounds?",
      a: "Yes, our question repository features over 2,500 curated challenges categorized by company tags (Google, Microsoft, TCS, Infosys, etc.) and difficulty levels, complete with test cases and time/space complexity analysis."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar activePage="candidates" />

      {/* ───────────────── 1. HERO SECTION (Reference Screenshot 1) ───────────────── */}
      <section className="pt-20 pb-14 md:pt-28 md:pb-20 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-[68px] font-black text-[#0B1528] tracking-tight leading-[1.08] mb-4">
          Land your dream offer <br className="hidden sm:inline" />
          before you graduate
        </h1>
        <p className="text-slate-500 text-lg sm:text-xl font-normal mb-8">
          Practice with AI interviewers, build ATS-verified resumes, and unlock exclusive campus drives.
        </p>

        {/* Action Button Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="px-7 py-3 rounded-full bg-[#0B1528] hover:bg-slate-800 text-white font-medium text-sm sm:text-base transition-all shadow-sm"
          >
            Sign up free
          </Link>
          <Link
            to="/login"
            className="px-7 py-3 rounded-full bg-white text-slate-800 font-medium text-sm sm:text-base border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* ───────────────── 2. PREPARATION SECTION (Reference Screenshot 2) ───────────────── */}
      <section id="preparation" className="py-16 md:py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Eyebrow Label */}
          <span className="text-xs md:text-sm font-black uppercase tracking-widest text-[#0066FF] block mb-3">
            PREPARATION
          </span>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1528] tracking-tight leading-tight mb-12 sm:mb-16">
            Kickstart your job prep with Launchpad+®
          </h2>

          {/* 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Accordion Column */}
            <div className="lg:col-span-5 divide-y divide-slate-200/80">
              {prepItems.map((item, idx) => {
                const isOpen = activePrepTab === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      type="button"
                      onClick={() => setActivePrepTab(idx)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <span className={`text-lg sm:text-xl font-bold transition-colors ${
                        isOpen ? 'text-[#0B1528]' : 'text-slate-800 hover:text-[#0066FF]'
                      }`}>
                        {item.title}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed pr-4 animate-in fade-in duration-200">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Scenic Art Column with Floating macOS Window */}
            <div className="lg:col-span-7">
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl min-h-[460px] sm:min-h-[500px] p-6 sm:p-10 flex items-center justify-center bg-slate-100">
                {/* Scenic Landscape Oil Painting Background */}
                <img
                  src="/scenic_oil_canvas.jpg"
                  alt="Scenic Landscape Art"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Floating White macOS Window Card */}
                <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7">
                  {/* macOS Window Controls */}
                  <div className="flex items-center gap-1.5 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <span className="ml-2 text-xs font-medium text-slate-500">
                      {activePrepTab === 0 && 'Diagnostic · My report'}
                      {activePrepTab === 1 && 'Mock Interviews · Live Studio'}
                      {activePrepTab === 2 && 'English Fluency · Speech Report'}
                      {activePrepTab === 3 && 'Assessments · Code Benchmark'}
                      {activePrepTab === 4 && 'Career Recommendations · Batch Match'}
                    </span>
                  </div>

                  {/* Window Content Dependent on Active Tab */}
                  {activePrepTab === 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        DIAGNOSTIC TEST
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1528]">
                          Your readiness · 72
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Updated today
                        </span>
                      </div>

                      {/* 3 Metric Stat Boxes */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Readiness</div>
                          <div className="text-xl font-bold text-slate-900">72</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Strong areas</div>
                          <div className="text-xl font-bold text-slate-900">3</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Focus areas</div>
                          <div className="text-xl font-bold text-slate-900">2</div>
                        </div>
                      </div>

                      {/* Vertical Purple Bar Chart */}
                      <div className="flex items-end justify-between gap-2 h-36 pt-4 border-t border-slate-100">
                        {[
                          { h: '62%' },
                          { h: '42%' },
                          { h: '88%' },
                          { h: '54%' },
                          { h: '32%' },
                          { h: '78%' },
                          { h: '68%' },
                          { h: '82%' }
                        ].map((bar, bIdx) => (
                          <div key={bIdx} className="flex-1 flex flex-col items-center h-full justify-end">
                            <div
                              style={{ height: bar.h }}
                              className="w-full bg-[#6558D3] hover:bg-[#5244C4] transition-all rounded-t-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePrepTab === 1 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        AI MOCK INTERVIEWS
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1528]">
                          Amazon SDE-1 Technical
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Sim
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Score</div>
                          <div className="text-xl font-bold text-slate-900">9.4 / 10</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Speech Clarity</div>
                          <div className="text-xl font-bold text-slate-900">92%</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Complexity</div>
                          <div className="text-xl font-bold text-emerald-600">O(1)</div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-slate-700">
                        <div className="font-bold text-[#0066FF] mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> AI Interviewer Feedback
                        </div>
                        "Great explanation combining Doubly Linked List with Hash Map. Pacing was 142 WPM which fits top engineering benchmarks."
                      </div>
                    </div>
                  )}

                  {activePrepTab === 2 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        ENGLISH FLUENCY & SPEECH
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1528]">
                          Fluency Score · 88
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
                          CEFR C1 Level
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Pacing</div>
                          <div className="text-xl font-bold text-slate-900">138 WPM</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Vocabulary</div>
                          <div className="text-xl font-bold text-slate-900">94%</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Pronunciation</div>
                          <div className="text-xl font-bold text-slate-900">96%</div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-2 h-36 pt-4 border-t border-slate-100">
                        {['50%', '70%', '85%', '92%', '65%', '88%', '75%', '90%'].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                            <div style={{ height: h }} className="w-full bg-[#6558D3] rounded-t-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePrepTab === 3 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        TECHNICAL ASSESSMENTS
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1528]">
                          Proctored Test · 96%
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                          Verified Badge
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Data Structs</div>
                          <div className="text-xl font-bold text-slate-900">98%</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Algorithms</div>
                          <div className="text-xl font-bold text-slate-900">94%</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-500 mb-1">Aptitude</div>
                          <div className="text-xl font-bold text-slate-900">96%</div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-2 h-36 pt-4 border-t border-slate-100">
                        {['75%', '82%', '96%', '88%', '70%', '94%', '89%', '98%'].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                            <div style={{ height: h }} className="w-full bg-[#6558D3] rounded-t-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePrepTab === 4 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        CAREER RECOMMENDATIONS
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1528]">
                          Top 3 Matched Pathways
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                          18 Drives Open
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Software Development Engineer (SDE-1)</div>
                            <div className="text-[11px] text-slate-500">Google, Microsoft, Amazon, Atlassian</div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            98% Match
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Cloud / DevOps Engineer</div>
                            <div className="text-[11px] text-slate-500">Cisco, Oracle, Salesforce</div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            92% Match
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Data & Machine Learning Associate</div>
                            <div className="text-[11px] text-slate-500">Flipkart, Adobe, Swiggy</div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            89% Match
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── 3. DAY TO DAY SECTION (Reference Screenshot 3) ───────────────── */}
      <section id="daytoday" className="py-16 md:py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Eyebrow Label */}
          <span className="text-xs md:text-sm font-black uppercase tracking-widest text-[#0066FF] block mb-3">
            DAY TO DAY
          </span>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1528] tracking-tight leading-tight mb-3">
            Start applying for jobs
          </h2>
          <p className="text-slate-500 text-base sm:text-lg mb-12 sm:mb-16 max-w-xl">
            Reliable information, a profile that does the work for you, and the whole thing in your pocket.
          </p>

          {/* 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Accordion Column */}
            <div className="lg:col-span-5 divide-y divide-slate-200/80">
              {jobItems.map((item, idx) => {
                const isOpen = activeJobTab === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      type="button"
                      onClick={() => setActiveJobTab(idx)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <span className={`text-lg sm:text-xl font-bold transition-colors ${
                        isOpen ? 'text-[#0B1528]' : 'text-slate-800 hover:text-[#0066FF]'
                      }`}>
                        {item.title}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed pr-4 animate-in fade-in duration-200">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Scenic Art Column with Floating macOS Resume Window */}
            <div className="lg:col-span-7">
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl min-h-[460px] sm:min-h-[500px] p-6 sm:p-10 flex items-center justify-center bg-slate-100">
                {/* Scenic Landscape Oil Painting Background */}
                <img
                  src="/scenic_oil_canvas.jpg"
                  alt="Scenic Landscape Art"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Floating White macOS Window Card */}
                <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7">
                  {/* macOS Window Controls */}
                  <div className="flex items-center gap-1.5 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <span className="ml-2 text-xs font-medium text-slate-500">
                      {activeJobTab === 0 && 'Resume builder'}
                      {activeJobTab === 1 && 'Mobile App · 1-Click Apply'}
                      {activeJobTab === 2 && 'Application Tracker · Live'}
                    </span>
                  </div>

                  {/* Window Content Dependent on Active Job Tab */}
                  {activeJobTab === 0 && (
                    <div>
                      {/* Profile Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            AS
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">Ananya Sharma</div>
                            <div className="text-xs text-slate-500">B.Tech CSE · Class of 2026</div>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Records verified
                        </span>
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {['Python', 'SQL', 'React', 'ML basics'].map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Spec Rows */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TEMPLATE</span>
                          <span className="font-semibold text-slate-800">Classic · 1 page</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CGPA</span>
                          <span className="font-semibold text-slate-800">8.7 · college-verified</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">REBUILT</span>
                          <span className="font-semibold text-slate-800">Just now · new project added</span>
                        </div>
                      </div>

                      {/* Accent Preview Bar at Bottom */}
                      <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#5046E5] to-[#7B73F6]" />
                    </div>
                  )}

                  {activeJobTab === 1 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Smartphone className="w-4 h-4 text-[#0066FF]" />
                        <span className="text-xs font-bold text-slate-900">Mobile Campus Drive Feed</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-sm">Microsoft SDE-1 Drive</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            100% Eligible
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-3">
                          CTC: ₹44.0 LPA · Min CGPA: 7.5 · Backlogs: 0
                        </div>
                        <button
                          type="button"
                          className="w-full py-2.5 bg-[#0B1528] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                        >
                          1-Tap Verified Apply
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 text-center">
                        ✓ Academic credentials auto-attached from University Registry
                      </div>
                    </div>
                  )}

                  {activeJobTab === 2 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold text-slate-900">Application Pipeline Tracker</div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Active Drive
                        </span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { step: '1. Verified Registration', status: 'Completed', color: 'text-emerald-600' },
                          { step: '2. Online Coding Assessment', status: 'Passed (98%)', color: 'text-emerald-600' },
                          { step: '3. Technical Interview Round 1', status: 'Scheduled (Tomorrow 11 AM)', color: 'text-blue-600 font-bold' },
                          { step: '4. Offer Letter Release', status: 'Pending Round 3', color: 'text-slate-400' }
                        ].map((stage, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                            <span className="font-medium text-slate-800">{stage.step}</span>
                            <span className={stage.color}>{stage.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── 4. INTERACTIVE ATS RESUME EVALUATOR ───────────────── */}
      <section id="ats-simulator" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0066FF] text-xs font-bold uppercase tracking-wider mb-3">
              <Sliders className="w-3.5 h-3.5" /> Interactive Demonstration
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
              Test your profile's ATS Pass Probability
            </h2>
            <p className="text-base text-slate-600">
              Enterprise recruiters screen out 75% of resumes with automated keyword parsers. Select your core skills below to see how our ATS optimizer boosts your visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
            {/* Skill Selector */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0066FF]" /> Toggle Verified Skills on Your Resume
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {availableSkills.map((skill) => {
                  const isSelected = activeSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-[#0066FF]">AI Diagnostic Tip:</div>
                <p>
                  Resumes featuring verified projects in <span className="font-semibold text-slate-900">TypeScript & REST APIs</span> receive 2.4x more interview callbacks from Tier-1 product firms.
                </p>
              </div>
            </div>

            {/* Live ATS Scorecard Output */}
            <div className="lg:col-span-5 bg-[#0B1528] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">ATS Match Engine</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    atsScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {atsScore >= 80 ? 'High Shortlist Odds' : 'Room for Optimization'}
                  </span>
                </div>

                <div className="text-5xl font-black text-white mb-2">
                  {Math.round(atsScore)}%
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Calculated against 1,200+ enterprise tech hiring patterns.
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Keyword Density:</span>
                    <span className="text-emerald-400 font-semibold">{activeSkills.length >= 5 ? 'Optimal' : 'Needs Expansion'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Format Compatibility:</span>
                    <span className="text-emerald-400 font-semibold">100% Single-Column ATS Clean</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Recruiter Visibility:</span>
                    <span className="text-blue-400 font-semibold">Top 10% Batch Percentile</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <Link
                  to="/register"
                  className="w-full py-3 bg-[#0066FF] hover:bg-blue-600 text-white rounded-full text-xs font-bold transition-colors block text-center"
                >
                  Build Free ATS-Optimized Resume
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── 5. FAQ SECTION ───────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">
              Frequently Asked Questions for Students
            </h2>
            <p className="text-sm text-slate-500">
              Clear answers to help you get the most out of your placement preparation.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base hover:text-[#0066FF] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#0066FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── 6. BOTTOM CTA ───────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <div className="bg-[#0B1528] rounded-3xl p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6">
                Ready to land your dream job offer?
              </h2>
              <p className="text-slate-300 text-base mb-8 leading-relaxed">
                Join over 2 million ambitious college students already preparing and applying through AI Campus OS.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="bg-[#0066FF] hover:bg-blue-600 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/25"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="bg-white/10 hover:bg-white/20 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all border border-white/20"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <ContactSalesModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        defaultRole="Candidate / Student Leader"
      />
    </div>
  );
};

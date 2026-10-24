import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Code2,
  Video,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Terminal,
  Eye,
  Award,
  Sparkles,
  Building,
  Clock,
  Zap,
  Filter,
  FileCheck,
  Check,
  Search
} from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ContactSalesModal } from '../../components/public/ContactSalesModal';

export const RecruitersPage: React.FC = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('Software Engineering');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const pipelineSteps = [
    {
      step: 1,
      title: "Broadcast to 1,200+ Colleges",
      desc: "Publish your campus job opening or internship once. Automatically distribute to approved colleges with customized eligibility criteria.",
      badge: "Target Reach: 150k+ Eligible Students"
    },
    {
      step: 2,
      title: "AI-Proctored Skill Assessments",
      desc: "Filter candidates at scale with randomized coding challenges, domain MCQ banks, and multi-factor proctoring with live code playback.",
      badge: "99.8% Anti-Cheat Integrity"
    },
    {
      step: 3,
      title: "AI Video Screening & Pair Coding",
      desc: "Conduct asynchronous AI video interviews or jump into collaborative real-time pair programming rooms with integrated compilers.",
      badge: "Save 80% Interviewer Hours"
    },
    {
      step: 4,
      title: "Offer Rollout & Drop Prevention",
      desc: "Issue digital offer letters with e-signatures, automated acceptance reminders, and curated pre-onboarding technical challenges.",
      badge: "94% Offer-to-Join Ratio"
    }
  ];

  const skillBenchmarks: Record<string, { avgCtc: string; topSkills: string[]; colleges: string; timeToHire: string }> = {
    'Software Engineering': {
      avgCtc: '₹14.2 LPA',
      topSkills: ['Data Structures & Algorithms', 'React/Next.js', 'System Design Basics', 'SQL & Databases'],
      colleges: '450+ Tier 1 & 2 Tech Campuses',
      timeToHire: '11 Days Avg'
    },
    'AI & Data Science': {
      avgCtc: '₹16.8 LPA',
      topSkills: ['Python & PyTorch', 'Data Modeling', 'LLM Prompt Engineering', 'Statistical Learning'],
      colleges: '280+ Specialized AI Labs',
      timeToHire: '14 Days Avg'
    },
    'DevOps & Cloud': {
      avgCtc: '₹13.5 LPA',
      topSkills: ['Docker & Kubernetes', 'AWS / Azure Fundamentals', 'CI/CD Pipelines', 'Linux Scripting'],
      colleges: '320+ Engineering Institutes',
      timeToHire: '9 Days Avg'
    },
    'Core Engineering & IoT': {
      avgCtc: '₹10.5 LPA',
      topSkills: ['Embedded C / C++', 'Microcontroller Arch', 'MATLAB / Simulink', 'PCB Design Basics'],
      colleges: '500+ Premier Polytechnic & Tech',
      timeToHire: '12 Days Avg'
    }
  };

  const currentBenchmark = skillBenchmarks[selectedDomain] || skillBenchmarks['Software Engineering'];

  const faqs = [
    {
      q: "How does AI Campus OS protect assessment integrity against cheating and GenAI bypass?",
      a: "Our proctoring stack incorporates 360-degree webcam monitoring, secondary smartphone camera sync, strict browser lockdown (preventing tab switches, copy-paste, screen sharing), and an AI keystroke dynamics analyzer that flags ChatGPT copy-pasting instantly."
    },
    {
      q: "Can we invite our existing partner colleges or only choose from the platform directory?",
      a: "You have complete freedom. You can invite your exclusive private campus list with dedicated private drive URLs, or discover new high-performing Tier-2 and Tier-3 institutions via our verified campus network."
    },
    {
      q: "Does AI Campus OS integrate with our Applicant Tracking System (ATS)?",
      a: "Yes! We offer out-of-the-box, enterprise-grade bi-directional integrations with Workday, Greenhouse, Lever, SAP SuccessFactors, Taleo, and custom REST Webhooks."
    },
    {
      q: "How do AI video interviews work?",
      a: "Candidates answer role-specific prompts on video. Our system evaluates communication clarity, technical depth, and problem-structuring abilities against your rubric, providing your hiring managers with time-stamped key moments and scorecards."
    },
    {
      q: "What is the pricing model for recruiters?",
      a: "We offer flexible plans: Pay-per-drive for seasonal campus hiring sprints, or an Annual Enterprise Subscription for year-round campus and early-career hiring with unlimited assessments."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar activePage="recruiters" />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 lg:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Copy */}
            <div className="lg:col-span-7 xl:col-span-7 pr-0 lg:pr-6">
              <span className="text-[13px] font-black uppercase tracking-widest text-[#0066FF] block mb-2">
                RECRUITERS & ENTERPRISES
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black tracking-tight text-slate-950 leading-[1.08] mb-6">
                Hire top 1% campus talent across India — <span className="text-[#0066FF]">zero friction</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 font-normal leading-relaxed max-w-xl mb-9">
                Eliminate the logistical chaos of multi-college hiring. Screen thousands of graduates with AI-proctored coding rounds, host asynchronous interviews, and roll out digital offers in days.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="bg-[#0B1528] hover:bg-slate-800 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  Schedule Recruiter Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-900 font-semibold text-base transition-colors bg-white shadow-xs"
                >
                  Post Campus Opening
                </Link>
              </div>

              {/* Metrics Divider */}
              <div className="w-full h-px bg-slate-200/80 mb-8" />

              {/* Proof Metric Chips */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">70%</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">FASTER CYCLE</div>
                </div>
                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">99.8%</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">PROCTOR INTEGRITY</div>
                </div>
                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">2.4M+</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">CANDIDATES POOL</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup: Live Recruiter Candidate Review */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0066FF] flex items-center justify-center font-bold text-xs">
                      GS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">National Engineering Drive '26</div>
                      <div className="text-[11px] text-slate-400">4,820 Candidates Evaluated</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Drive Active
                  </span>
                </div>

                {/* Candidate Scorecard Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                        AK
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Ananya Kulkarni</div>
                        <div className="text-xs text-slate-500">IIT Roorkee • CGPA 8.92</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Match Score</div>
                      <div className="text-xl font-black text-[#0066FF]">96 / 100</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200">
                    <div className="p-2 rounded-lg bg-white">
                      <div className="text-slate-400 text-[10px]">Coding Test</div>
                      <div className="font-bold text-slate-800 mt-0.5">100% Passed</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white">
                      <div className="text-slate-400 text-[10px]">AI Video Interview</div>
                      <div className="font-bold text-emerald-600 mt-0.5">Exceeds (4.9/5)</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white">
                      <div className="text-slate-400 text-[10px]">Integrity Check</div>
                      <div className="font-bold text-blue-600 mt-0.5">0 Flags Clean</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Bar */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="flex-1 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Send Offer Letter (₹24 LPA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Watch Code Playback
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Workday & Greenhouse Synced
                  </span>
                  <span className="text-slate-400">Offer Expiry: 72 hrs</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── INTERACTIVE CAMPUS HIRING PIPELINE ───────────────── */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0066FF] text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" /> End-to-End Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
              How modern enterprises hire campus talent in 4 seamless steps
            </h2>
            <p className="text-base text-slate-600">
              Transform a grueling 3-month campus tour into an automated, high-precision virtual hiring campaign.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-8">
            {pipelineSteps.map((step) => (
              <button
                key={step.step}
                type="button"
                onClick={() => setActiveStep(step.step)}
                className={`p-4 rounded-2xl text-left border transition-all ${activeStep === step.step
                    ? 'border-[#0066FF] bg-white shadow-md text-slate-950'
                    : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === step.step ? 'bg-[#0066FF] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                    0{step.step}
                  </span>
                  <span className="text-[11px] font-semibold text-[#0066FF]">
                    {activeStep === step.step ? 'Selected' : ''}
                  </span>
                </div>
                <div className="font-bold text-sm leading-snug">{step.title}</div>
              </button>
            ))}
          </div>

          {/* Active Step Showcase Card */}
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-200">
            {(() => {
              const current = pipelineSteps.find(s => s.step === activeStep) || pipelineSteps[0];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-bold uppercase tracking-wider">
                      {current.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {current.title}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed">
                      {current.desc}
                    </p>
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setContactModalOpen(true)}
                        className="px-6 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-full transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        Request Enterprise Workflow Demo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 mb-4 pb-2 border-b border-slate-800">
                      <span>Live Drive Controller</span>
                      <span className="text-emerald-400">● 2,420 Active</span>
                    </div>
                    {activeStep === 1 && (
                      <div className="space-y-3">
                        <div className="text-slate-300">Target Colleges: <span className="text-[#0066FF]">1,280 Campuses</span></div>
                        <div className="text-slate-300">Criteria: <span className="text-emerald-400">CGPA ≥ 7.5, Backlogs = 0</span></div>
                        <div className="text-slate-300">Invites Sent: <span className="text-white">12,400 Students</span></div>
                        <div className="p-2 rounded bg-slate-800 text-emerald-400 text-[11px]">✓ 100% College TPO Acknowledgement Received</div>
                      </div>
                    )}
                    {activeStep === 2 && (
                      <div className="space-y-3">
                        <div className="text-slate-300">Assessment: <span className="text-[#0066FF]">Fullstack SWE Challenge</span></div>
                        <div className="text-slate-300">Proctoring: <span className="text-emerald-400">Dual-Cam + Keystroke AI</span></div>
                        <div className="text-slate-300">Cheating Rate: <span className="text-emerald-400">&lt; 0.2% (Flagged & Disqualified)</span></div>
                        <div className="p-2 rounded bg-slate-800 text-blue-300 text-[11px]">✓ Full Code Replay & AST Plagiarism Check Ready</div>
                      </div>
                    )}
                    {activeStep === 3 && (
                      <div className="space-y-3">
                        <div className="text-slate-300">AI Video Questions: <span className="text-[#0066FF]">5 Core Scenarios</span></div>
                        <div className="text-slate-300">Speech & Confidence: <span className="text-emerald-400">Analyzed by AI</span></div>
                        <div className="text-slate-300">Live Pair Coding: <span className="text-white">WebRTC Room Active</span></div>
                        <div className="p-2 rounded bg-slate-800 text-emerald-400 text-[11px]">✓ Scorecard Exported to Workday ATS</div>
                      </div>
                    )}
                    {activeStep === 4 && (
                      <div className="space-y-3">
                        <div className="text-slate-300">Digital Offers Issued: <span className="text-[#0066FF]">145 Candidates</span></div>
                        <div className="text-slate-300">Accepted Within 48h: <span className="text-emerald-400">138 (95.1%)</span></div>
                        <div className="text-slate-300">Pre-Boarding Portal: <span className="text-white">Active with Warmup Tasks</span></div>
                        <div className="p-2 rounded bg-slate-800 text-emerald-400 text-[11px]">✓ Zero Candidate Ghosting</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ───────────────── RECRUITER SUPERPOWERS GRID ───────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
              Built for high-volume, high-integrity campus drives
            </h2>
            <p className="text-base text-slate-500">
              Enterprise features designed to handle 100,000+ applicants without crashing, cheating, or dropped offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Bulletproof Dual-Cam Proctoring",
                desc: "Combine laptop webcam, secondary phone camera, and browser lockdown. Prevent unauthorized screen sharing, tab switching, and GenAI shortcuts."
              },
              {
                icon: Terminal,
                title: "Live Pair Programming & Whiteboard",
                desc: "Conduct final technical rounds in a collaborative IDE supporting 50+ languages, interactive debugging, and architectural canvas whiteboards."
              },
              {
                icon: Video,
                title: "Asynchronous AI Video Screening",
                desc: "Let candidates record answers on their schedule. Automatic speech transcription, sentiment clarity, and rubric grading save hundreds of hours."
              },
              {
                icon: Building,
                title: "1-Click Pan-India Campus Connect",
                desc: "Target specific tiers (IIT/NIT, BITS, VIT, Tier-2/3 state engineering colleges) with custom cutoffs and centralized drive coordination."
              },
              {
                icon: Zap,
                title: "Zero-Latency Cloud Execution",
                desc: "High-concurrency test engine reliably handles 50,000 students taking timed assessments simultaneously with zero lag or dropped test states."
              },
              {
                icon: FileCheck,
                title: "Automated E-Offers & Nudges",
                desc: "Generate customized offer letters, track e-signatures, and automate candidate follow-ups to ensure maximum join ratios."
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl border border-slate-200/90 hover:border-[#0066FF]/50 bg-white hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-6 group-hover:bg-[#0066FF] group-hover:text-white transition-colors duration-200">
                    <Icon className="w-7 h-7" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#0066FF] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── INTERACTIVE SKILL & CTC BENCHMARK VIEWER ───────────────── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#0066FF] font-black bg-blue-900/40 px-3 py-1 rounded-full">
              Campus Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4 mb-3">
              Campus Talent & Salary Benchmarks (2026 Season)
            </h2>
            <p className="text-slate-400 text-sm">
              Explore national campus hiring data across top technology and engineering specializations.
            </p>
          </div>

          {/* Domain Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {Object.keys(skillBenchmarks).map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`py-2 px-5 rounded-full text-xs font-bold transition-all ${selectedDomain === domain
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Benchmark Card */}
          <div className="max-w-4xl mx-auto bg-slate-800/90 rounded-3xl p-8 sm:p-10 border border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-center sm:text-left">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/60">
                <div className="text-xs text-slate-400 uppercase font-semibold">Average Market CTC</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">{currentBenchmark.avgCtc}</div>
                <div className="text-[11px] text-slate-500 mt-1">Based on 2026 drive offerings</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/60">
                <div className="text-xs text-slate-400 uppercase font-semibold">Target College Pool</div>
                <div className="text-xl font-bold text-white mt-1">{currentBenchmark.colleges}</div>
                <div className="text-[11px] text-slate-500 mt-1">Verified placement partner institutes</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/60">
                <div className="text-xs text-slate-400 uppercase font-semibold">Average Time to Hire</div>
                <div className="text-3xl font-black text-[#0066FF] mt-1">{currentBenchmark.timeToHire}</div>
                <div className="text-[11px] text-slate-500 mt-1">From opening to rolled offer</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Key Verified Skills Tested in Assessments:
              </div>
              <div className="flex flex-wrap gap-2">
                {currentBenchmark.topSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ SECTION ───────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">
              Frequently Asked Questions for Recruiters
            </h2>
            <p className="text-sm text-slate-500">
              Everything enterprise talent teams need to know about scaling campus recruitment.
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
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#0066FF]' : ''
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

      {/* ───────────────── BOTTOM CTA ───────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <div className="bg-[#0B1528] rounded-3xl p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6">
                Start hiring India's best campus engineers & leaders
              </h2>
              <p className="text-slate-300 text-base mb-8 leading-relaxed">
                Connect your hiring requirements with over 2 million verified students across 1,200+ partner universities today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="bg-[#0066FF] hover:bg-blue-600 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  Book Recruiter Demo
                </button>
                <Link
                  to="/register"
                  className="bg-white/10 hover:bg-white/20 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all border border-white/20"
                >
                  Sign Up as Recruiter
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
        defaultRole="Enterprise Recruiter"
      />
    </div>
  );
};

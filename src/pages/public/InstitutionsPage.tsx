import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Check,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Layers,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ContactSalesModal } from '../../components/public/ContactSalesModal';

export const InstitutionsPage: React.FC = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Interactive Placement Calculator State
  const [batchSize, setBatchSize] = useState<number>(1200);
  const [currentRate, setCurrentRate] = useState<number>(72);

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic calculation for ROI calculator
  const projectedBoost = Math.min(99, Math.round(currentRate + 18));
  const additionalOffers = Math.round(batchSize * ((projectedBoost - currentRate) / 100));
  const hoursSavedPerYear = Math.round((batchSize * 3.2));

  const faqs = [
    {
      q: "How does AI Campus OS integrate with our existing ERP or student database?",
      a: "AI Campus OS provides turnkey CSV/Excel batch imports as well as direct API connectors for popular university ERPs like ERPNext, SAP Campus, Ellucian, and Custom SQL databases. Your IT team can sync student cohorts in under 30 minutes with zero downtime."
    },
    {
      q: "Can we enforce our college's customized placement policy (e.g., One Student One Offer, Dream Offer rules)?",
      a: "Absolutely. Our Rule Engine supports tiered placement policies. You can configure rules like 'Core branch students get 1 Dream Offer opportunity above 8 LPA' or 'Students with accepted offers are automatically de-listed from equal-tier drives'."
    },
    {
      q: "How does the platform help with NAAC, NBA, and NIRF accreditation audits?",
      a: "Every offer letter, interview transcript, attendance log, and company package is archived in an immutable, audit-ready format. You can generate NIRF Parameter-3 (Graduation Outcomes) and NAAC Criterion-5 reports with one click, complete with verified offer letter PDFs."
    },
    {
      q: "Is candidate data kept confidential and secure between different recruiters?",
      a: "Yes. AI Campus OS strictly adheres to enterprise cybersecurity standards and the Digital Personal Data Protection (DPDP) Act. Recruiters only see candidates who explicitly apply to their approved drive or meet the institution's verified shortlisting criteria. Contact details can be masked until shortlisting."
    },
    {
      q: "How long does it take for a university to go live with AI Campus OS?",
      a: "Most institutes go live within 48 to 72 hours. Our dedicated campus onboarding team handles student profile imports, TPO role training, and company invite setup at zero additional deployment fee."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar activePage="institutions" />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 lg:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Copy */}
            <div className="lg:col-span-7 xl:col-span-7 pr-0 lg:pr-6">
              <span className="text-[13px] font-black uppercase tracking-widest text-[#0066FF] block mb-2">
                INSTITUTIONS & COLLEGES
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black tracking-tight text-slate-950 leading-[1.08] mb-6">
                Automate & elevate your campus placements to <span className="text-[#0066FF]">100%</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 font-normal leading-relaxed max-w-xl mb-9">
                Empower your Training & Placement Cell with unified student tracking, zero-error eligibility criteria filtering, 1-click multi-company drives, and instant NIRF/NAAC compliance reporting.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="bg-[#0B1528] hover:bg-slate-800 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  Schedule TPO Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-900 font-semibold text-base transition-colors bg-white shadow-xs"
                >
                  Create College Account
                </Link>
              </div>

              {/* Metrics Divider */}
              <div className="w-full h-px bg-slate-200/80 mb-8" />

              {/* Proof Metric Chips */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">450+</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">UNIVERSITIES LIVE</div>
                </div>
                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">88%</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">LESS ADMIN TIME</div>
                </div>
                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">₹14.8 LPA</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">AVG TECH CTC</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup: Live Placement Command Center */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-500 ml-1">TPO Placement Dashboard</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Session
                  </span>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <div className="text-xs font-semibold text-slate-500">Graduating Batch '26</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">1,450</div>
                    <div className="text-[11px] text-[#0066FF] font-semibold mt-1">94.2% Verified Profiles</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="text-xs font-semibold text-slate-500">Offers Rolled Out</div>
                    <div className="text-2xl font-black text-emerald-800 mt-0.5">1,284</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">+24% vs Last Year</div>
                  </div>
                </div>

                {/* Live Campus Drive Queue */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Campus Drives</span>
                    <span className="text-[#0066FF] text-[11px] cursor-pointer hover:underline">View All (18)</span>
                  </div>

                  {[
                    { company: 'Microsoft India', role: 'Software Engineer', ctc: '₹44.5 LPA', status: 'Online Round 2', badgeColor: 'bg-blue-100 text-blue-700' },
                    { company: 'Amazon AWS', role: 'Cloud Solutions Associate', ctc: '₹28.0 LPA', status: 'Shortlisting (142)', badgeColor: 'bg-amber-100 text-amber-800' },
                    { company: 'Goldman Sachs', role: 'Quantitative Analyst', ctc: '₹34.0 LPA', status: 'Interviews Running', badgeColor: 'bg-purple-100 text-purple-700' },
                  ].map((drive, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{drive.company}</div>
                        <div className="text-xs text-slate-500">{drive.role} • <span className="font-semibold text-slate-700">{drive.ctc}</span></div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${drive.badgeColor}`}>
                        {drive.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> NAAC Criterion-5 Synced
                  </span>
                  <span className="font-semibold text-[#0066FF]">Auto-Audit Ready</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* ───────────────── 6 CORE INSTITUTIONAL CAPABILITIES ───────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
              Everything your TPO cell needs for flawless execution
            </h2>
            <p className="text-base text-slate-500">
              A purpose-built suite of tools engineered for training & placement directors, department placement coordinators, and academic deans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Tiered Placement Policy Engine",
                desc: "Set flexible rules: Dream vs Super-Dream offers, core vs IT company limits, and branch-specific minimum packages without manual policing."
              },
              {
                icon: Calendar,
                title: "Multi-Drive Conflict Prevention",
                desc: "Schedule 30+ simultaneous online & campus drives. Our intelligent conflict manager prevents room overlaps and interview slot clashes."
              },
              {
                icon: FileCheck2,
                title: "Tamper-Proof Resume Bank",
                desc: "Ensure every candidate resume is pre-audited. Automated GPA verification, course credit validation, and standard ATS formatting."
              },
              {
                icon: BarChart3,
                title: "One-Click NIRF & NAAC Audit",
                desc: "Instantly export comprehensive placement logs, median salary trends, higher studies ratios, and verified offer letter proofs for accreditation bodies."
              },
              {
                icon: Users,
                title: "12,000+ Recruiter Network",
                desc: "Broadcast your batch to thousands of active campus recruiters across tech, finance, consulting, manufacturing, and analytics sectors."
              },
              {
                icon: Zap,
                title: "AI Skill Gap Radar & Prep",
                desc: "Track which students need help in coding, aptitude, or communication before the drive season starts, with targeted mock interview tracks."
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

      {/* ───────────────── ROI / PLACEMENT CALCULATOR ───────────────── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Interactive Controls */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#0066FF] font-black bg-blue-900/40 px-3 py-1 rounded-full">
                  Institutional Impact Calculator
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4 mb-3">
                  Calculate your college's placement growth potential
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Estimate the additional offers and administrative hours saved by modernizing your campus placement workflow with AI Campus OS.
                </p>
              </div>

              {/* Batch Size Slider */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-300">Annual Graduating Batch Size</span>
                  <span className="text-[#0066FF] font-bold text-base">{batchSize.toLocaleString()} Students</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full accent-[#0066FF] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>200</span>
                  <span>2,500</span>
                  <span>5,000+</span>
                </div>
              </div>

              {/* Current Placement Rate */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-300">Current Average Placement Rate</span>
                  <span className="text-emerald-400 font-bold text-base">{currentRate}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="85"
                  step="1"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>40%</span>
                  <span>65%</span>
                  <span>85%</span>
                </div>
              </div>
            </div>

            {/* Right: Output Highlights */}
            <div className="lg:col-span-6 bg-slate-800/80 rounded-3xl p-8 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Projected Institutional Gains
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projected Placement Rate</div>
                  <div className="text-3xl font-black text-emerald-400 mt-1">
                    {projectedBoost}%
                  </div>
                  <div className="text-xs text-emerald-500 font-medium mt-1">+{projectedBoost - currentRate}% Improvement</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Additional Placed Students</div>
                  <div className="text-3xl font-black text-white mt-1">
                    +{additionalOffers}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Per academic cohort</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/60 mb-8">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">TPO & Coordinator Admin Hours Saved</span>
                  <span className="text-xs text-[#0066FF] font-bold">~{hoursSavedPerYear.toLocaleString()} hrs / year</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  Equivalent to 3 full-time staff members freed from manual WhatsApp follow-ups, CSV scrubbing, and hall allocation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full py-4 bg-[#0066FF] hover:bg-blue-600 text-white font-bold rounded-full text-sm transition-all shadow-lg shadow-blue-500/20 text-center cursor-pointer"
              >
                Book Institutional Demo & Customized ROI Report
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── INSTITUTIONAL ACCREDITATION & TRUST ───────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-blue-50/60 border border-blue-100 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#0066FF] text-xs font-bold uppercase tracking-wider mb-3">
                <Award className="w-4 h-4" /> NAAC & NIRF Ready
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                Built specifically to satisfy Indian academic accreditation standards
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Maintain 100% auditable documentation for NAAC Criterion 5.2.1, NIRF Graduation Outcomes, and NBA Program Outcomes with zero last-minute panic before inspections.
              </p>
            </div>
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer"
            >
              Request Sample Audit Report
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ SECTION ───────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">
              Frequently Asked Questions for Institutions
            </h2>
            <p className="text-sm text-slate-500">
              Clear answers to help your leadership and TPO department evaluate AI Campus OS.
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
                Transform your university's placement track record today
              </h2>
              <p className="text-slate-300 text-base mb-8 leading-relaxed">
                Join over 450+ colleges that streamlined placement drives, saved thousands of hours, and delivered unprecedented placement records.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="bg-[#0066FF] hover:bg-blue-600 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  Schedule Institutional Consultation
                </button>
                <Link
                  to="/register"
                  className="bg-white/10 hover:bg-white/20 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all border border-white/20"
                >
                  Register College Portal
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
        defaultRole="Institutional TPO / Management"
      />
    </div>
  );
};

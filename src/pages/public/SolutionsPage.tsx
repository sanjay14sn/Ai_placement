import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Cpu,
  Server,
  Workflow,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Database,
  Lock,
  Code2,
  Video,
  Building2,
  Briefcase,
  GraduationCap,
  Globe2,
  Sparkles,
  Zap,
  Sliders,
  Check
} from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ContactSalesModal } from '../../components/public/ContactSalesModal';

export const SolutionsPage: React.FC = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<string>('universities');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const personaSolutions: Record<string, {
    title: string;
    subtitle: string;
    metrics: { label: string; value: string }[];
    features: string[];
    useCase: string;
    icon: any;
  }> = {
    universities: {
      title: "For Premier Universities & Engineering Institutes",
      subtitle: "Digitize and orchestrate your entire Training & Placement Cell operations with automated multi-branch eligibility filtering, calendar conflict elimination, and 1-click NAAC & NIRF accreditation logs.",
      icon: Building2,
      metrics: [
        { label: "Placement Rate Boost", value: "+22%" },
        { label: "TPO Hours Saved", value: "88%" },
        { label: "Audit Readiness", value: "Instant" }
      ],
      features: [
        "Tiered Dream & Super-Dream placement policy enforcement",
        "Multi-company concurrent drive scheduling without room or slot clashes",
        "Tamper-proof academic GPA and backlog verification vault",
        "Direct export for NAAC Criterion 5.2.1 and NIRF Parameter-3"
      ],
      useCase: "Ideal for central universities, state technical boards, autonomous engineering colleges, and multi-campus educational trusts."
    },
    enterprises: {
      title: "For Enterprise Talent Acquisition Teams",
      subtitle: "Consolidate multi-college campus hiring across 1,200+ universities into an automated, zero-fraud funnel with enterprise-grade proctoring, live pair coding, and direct ATS synchronization.",
      icon: Briefcase,
      metrics: [
        { label: "Cycle Time Reduction", value: "70%" },
        { label: "Anti-Cheat Accuracy", value: "99.8%" },
        { label: "Join-Ratio Retention", value: "95%" }
      ],
      features: [
        "AI-proctored coding assessments in 50+ languages with code playback",
        "Asynchronous AI video interviews with automated speech and rubric scorecards",
        "Bi-directional ATS integrations: Workday, Greenhouse, Lever, Taleo",
        "Digital offer letter rollout with automated expiration and drop-prevention"
      ],
      useCase: "Engineered for Fortune 500 tech companies, global IT consultancies, banks, automotive conglomerates, and healthcare leaders."
    },
    startups: {
      title: "For Fast-Growing Startups & Scaleups",
      subtitle: "Compete with tech giants by accessing pre-vetted top 1% campus engineers without the exorbitant cost or logistical strain of physical university visits.",
      icon: Zap,
      metrics: [
        { label: "Cost Per Hire", value: "75% Lower" },
        { label: "Time to Offer", value: "Under 7 Days" },
        { label: "Pre-Vetted Pool", value: "50,000+ SDEs" }
      ],
      features: [
        "Direct access to verified top coders based on validated skill assessments",
        "Interactive live pair coding rooms with shared compiler & terminal",
        "Zero setup overhead: launch a national hiring sprint within 4 hours",
        "Fast-track offer workflows to secure in-demand talent before competing offers"
      ],
      useCase: "Tailored for Series-A through pre-IPO startups looking for high-velocity software engineers, AI researchers, and product analysts."
    },
    governments: {
      title: "For Skill Councils & State Employability Missions",
      subtitle: "Conduct massive, state-wide or national employability assessments and placement drives with transparent public reporting, demographic analytics, and strict data sovereignty.",
      icon: Globe2,
      metrics: [
        { label: "Max Concurrent Students", value: "100,000+" },
        { label: "Data Residency", value: "100% In-Country" },
        { label: "Plagiarism Resistance", value: "State of Art" }
      ],
      features: [
        "High-concurrency infrastructure supporting 100k+ simultaneous test takers",
        "District-level, gender, and socio-economic employability analytics",
        "Local language assessment options and low-bandwidth resilience",
        "DPDP (Digital Personal Data Protection) and ISO 27001 compliant storage"
      ],
      useCase: "Designed for state technical education boards, national skill development councils, and regional vocational directorates."
    }
  };

  const currentPersona = personaSolutions[activePersona] || personaSolutions.universities;
  const PersonaIcon = currentPersona.icon;

  const faqs = [
    {
      q: "Can AI Campus OS be deployed in private on-premise cloud environments?",
      a: "Yes. While our standard deployment operates on AWS India data centers with ISO 27001 and SOC-2 Type II standards, enterprise customers can request Dedicated VPC or Private Cloud deployments with customized data residency controls."
    },
    {
      q: "How does the system ensure zero downtime during peak national assessment hours?",
      a: "Our distributed cloud architecture auto-scales horizontally across multiple availability zones. We regularly handle nationwide assessment drives with over 50,000 simultaneous live code compilation runs with under 50ms evaluation latency."
    },
    {
      q: "Can we migrate our historical placement data from spreadsheets or legacy software?",
      a: "Yes! Our customer success team assists with automated historical data migration. We provide smart ETL parsers to import legacy student profiles, past drive records, and company lists without data loss."
    },
    {
      q: "What security measures protect student personal data from unauthorized access?",
      a: "All candidate personally identifiable information (PII) is encrypted at rest (AES-256) and in transit (TLS 1.3). Access controls adhere to strict Role-Based Access Control (RBAC), and candidate contact details can be masked until explicit recruiter shortlisting."
    },
    {
      q: "Does AI Campus OS support custom branding and institutional white-labeling?",
      a: "Yes. Enterprise institutions and corporate recruitment programs can configure custom subdomains, branded email templates, custom login portals, and co-branded assessment report watermarks."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar activePage="solutions" />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 lg:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Copy */}
            <div className="lg:col-span-7 xl:col-span-7 pr-0 lg:pr-6">
              {/* <span className="text-[13px] font-black uppercase tracking-widest text-[#0066FF] block mb-2">
                PLATFORM ARCHITECTURE & SOLUTIONS
              </span> */}

              <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black tracking-tight text-slate-950 leading-[1.08] mb-6">
                All-in-one ecosystem for fearless campus hiring & <span className="text-[#0066FF]">placements</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 font-normal leading-relaxed max-w-xl mb-9">
                A single, deeply integrated platform connecting 450+ colleges, 12,000+ recruiters, and millions of ambitious students with enterprise-grade security and automated workflows.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="bg-[#0B1528] hover:bg-slate-800 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  Explore Solution Consultation
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-900 font-semibold text-base transition-colors bg-white shadow-xs"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Metrics Divider */}
              <div className="w-full h-px bg-slate-200/80 mb-8" />

              {/* Proof Metric Chips */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">99.99%</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">UPTIME SLA</div>
                </div>
                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">50,000+</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">CONCURRENT TESTS</div>
                </div>
                <div className="border-l border-slate-200/80 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">SOC-2</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">TYPE II CERTIFIED</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup: Platform Ecosystem Architecture Diagram */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-[#0066FF]" />
                    <span>AI Campus OS Architecture</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF]">
                    Cloud Native
                  </span>
                </div>

                {/* 3 Tier Ecosystem Blueprint */}
                <div className="space-y-3 mb-5">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div className="text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-1">
                      1. Presentation & Portals
                    </div>
                    <div className="text-xs text-slate-700">
                      TPO Command Center • Enterprise Recruiter Suite • Candidate Learning & Prep App
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      2. Autonomous AI Engines
                    </div>
                    <div className="text-xs text-slate-300">
                      Dual-Cam Anti-Cheat AI • Live Sandboxed Compiler (50+ Langs) • Asynchronous Video Rubric Scorer
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      3. Data & Compliance Vault
                    </div>
                    <div className="text-xs text-slate-600">
                      Workday / Greenhouse Connectors • NIRF / NAAC Report Generator • AES-256 Encrypted Database
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> End-to-End Encrypted
                  </span>
                  <span className="font-semibold text-slate-700">ISO 27001 Certified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── INTERACTIVE SOLUTIONS MATRIX ───────────────── */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0066FF] text-xs font-bold uppercase tracking-wider mb-3">
              <Sliders className="w-3.5 h-3.5" /> Tailored For Your Organization
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
              Explore solutions configured for your specific operational scale
            </h2>
            <p className="text-base text-slate-600">
              Select your organization type to see how AI Campus OS eliminates your biggest campus hiring bottlenecks.
            </p>
          </div>

          {/* Persona Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-10">
            {[
              { id: 'universities', label: 'Universities & Colleges', icon: Building2 },
              { id: 'enterprises', label: 'Enterprise Recruiters', icon: Briefcase },
              { id: 'startups', label: 'Tech Startups', icon: Zap },
              { id: 'governments', label: 'Skill Councils & Govts', icon: Globe2 },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activePersona === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePersona(tab.id)}
                  className={`py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <TabIcon className={`w-4 h-4 ${isSelected ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Persona Solution Card */}
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
                    <PersonaIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">{currentPersona.title}</h3>
                    <div className="text-xs text-slate-400 font-medium">{currentPersona.useCase}</div>
                  </div>
                </div>

                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  {currentPersona.subtitle}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Key Solution Capabilities:
                  </div>
                  {currentPersona.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="px-7 py-3 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-full transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Request Tailored Solution Walkthrough
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metrics Output Column */}
              <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">
                    Proven Operational Impact
                  </div>

                  <div className="space-y-6">
                    {currentPersona.metrics.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                        <div className="text-xs text-slate-400">{m.label}</div>
                        <div className="text-3xl font-black text-white mt-1">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Deployment SLA:</span>
                  <span className="text-emerald-400 font-semibold">Under 72 Hours</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── 6 PLATFORM CAPABILITY PILLARS ───────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
              Enterprise engineering built for zero compromises
            </h2>
            <p className="text-base text-slate-500">
              Discover how AI Campus OS blends cutting-edge artificial intelligence with rigorous enterprise reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: "Next-Gen AI Proctoring Engine",
                desc: "360-degree facial orientation, audio background analysis, secondary phone camera pairing, and AI keystroke behavioral analysis."
              },
              {
                icon: Code2,
                title: "Distributed Cloud Code Execution",
                desc: "Real-time sandbox compilers supporting C++, Java, Python, Go, Rust, React, and SQL with sub-millisecond evaluation latency."
              },
              {
                icon: Video,
                title: "Asynchronous AI Video Screening",
                desc: "Automated candidate assessment with instant speech-to-text transcripts, sentiment analysis, and rubric-based proficiency scores."
              },
              {
                icon: Server,
                title: "Enterprise ATS & HRIS Connectors",
                desc: "Direct integration pipelines with Workday, Greenhouse, Lever, SAP SuccessFactors, Canvas LMS, and Moodle."
              },
              {
                icon: ShieldCheck,
                title: "SOC-2 Type II & ISO 27001 Security",
                desc: "End-to-end data encryption at rest and in transit, multi-factor authentication, immutable audit logging, and Indian data residency."
              },
              {
                icon: Workflow,
                title: "Autonomous Offer Lifecycle",
                desc: "Digital e-signatures, automated offer letter generation, deadline timers, and pre-boarding engagement to eliminate candidate ghosting."
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

      {/* ───────────────── SECURITY & COMPLIANCE BAR ───────────────── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-800/90 border border-slate-700 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 text-[#0066FF] text-xs font-bold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5" /> Enterprise Trust & Data Governance
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                Security and student data privacy at bank-grade standards
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We safeguard millions of academic records and proprietary company assessment questions with stringent role-based encryption, automated access expiration, and complete data residency compliance.
              </p>
            </div>
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-8 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white rounded-full font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
            >
              Request Security & SOC-2 Whitepaper
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ SECTION ───────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">
              Frequently Asked Questions about our Solutions
            </h2>
            <p className="text-sm text-slate-500">
              Technical, procurement, and deployment details for enterprise leaders.
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
                Ready to deploy the future of campus recruitment?
              </h2>
              <p className="text-slate-300 text-base mb-8 leading-relaxed">
                Connect with our solutions architects to tailor an end-to-end deployment strategy for your institution or enterprise.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="bg-[#0066FF] hover:bg-blue-600 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  Request Technical Demonstration
                </button>
                <Link
                  to="/register"
                  className="bg-white/10 hover:bg-white/20 text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all border border-white/20"
                >
                  Create Portal Account
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

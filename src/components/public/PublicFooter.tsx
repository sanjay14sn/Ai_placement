import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2, Shield, Heart } from 'lucide-react';
import { ContactSalesModal } from './ContactSalesModal';

export const PublicFooter: React.FC = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-slate-200 bg-white pt-16 pb-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-slate-100">
            {/* Col 1: Brand */}
            <div className="lg:col-span-2 pr-0 lg:pr-8">
              <Link to="/" className="flex items-center mb-4 group inline-flex">
                <img
                  src="/aicampusos.png"
                  alt="AI Campus OS"
                  className="h-14 sm:h-18 max-h-[72px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm">
                India's all-in-one campus recruitment infrastructure powering 450+ colleges, 12,000+ recruiters, and over 2 million student placements.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SOC-2 Type II Certified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  <Shield className="w-3.5 h-3.5" /> ISO 27001
                </span>
              </div>
            </div>

            {/* Col 2: Solutions & Roles */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
                Platforms
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/institutions" className="hover:text-[#0066FF] transition-colors">
                    For Institutions & TPOs
                  </Link>
                </li>
                <li>
                  <Link to="/candidates" className="hover:text-[#0066FF] transition-colors">
                    For Candidates & Students
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-[#0066FF] transition-colors">
                    All-Inclusive Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Modules */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
                Key Modules
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/solutions" className="hover:text-[#0066FF] transition-colors">
                    Coding & Skill Assessments
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-[#0066FF] transition-colors">
                    AI Video Interviews
                  </Link>
                </li>
                <li>
                  <Link to="/candidates" className="hover:text-[#0066FF] transition-colors">
                    ATS Resume Evaluator
                  </Link>
                </li>
                <li>
                  <Link to="/institutions" className="hover:text-[#0066FF] transition-colors">
                    NIRF & NAAC Audit Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Get Started */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
                Quick Access
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/login" className="hover:text-[#0066FF] transition-colors">
                    Sign In to Portal
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#0066FF] transition-colors">
                    Create New Account
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="hover:text-[#0066FF] transition-colors text-left cursor-pointer"
                  >
                    Schedule Institutional Demo
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} AI Campus OS Platform. Built with engineering excellence.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/institutions" className="hover:text-slate-900">Institutions</Link>
              <Link to="/recruiters" className="hover:text-slate-900">Recruiters</Link>
              <Link to="/candidates" className="hover:text-slate-900">Candidates</Link>
              <Link to="/solutions" className="hover:text-slate-900">Solutions</Link>
              <button onClick={() => setContactOpen(true)} className="hover:text-slate-900 cursor-pointer">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </footer>

      <ContactSalesModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  );
};

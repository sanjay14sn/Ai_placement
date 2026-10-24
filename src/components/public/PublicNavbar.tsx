import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';
import { ContactSalesModal } from './ContactSalesModal';

interface PublicNavbarProps {
  activePage?: 'institutions' | 'recruiters' | 'candidates' | 'solutions' | 'home';
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ activePage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const location = useLocation();

  const current = activePage || (
    location.pathname.includes('institutions') ? 'institutions' :
    location.pathname.includes('recruiters') ? 'recruiters' :
    location.pathname.includes('candidates') ? 'candidates' :
    location.pathname.includes('solutions') ? 'solutions' : 'home'
  );

  const navLinks = [
    { label: 'Institutions', href: '/institutions', key: 'institutions', badge: 'For Colleges' },
    { label: 'Candidates', href: '/candidates', key: 'candidates', badge: 'For Students' },
    { label: 'Solutions', href: '/solutions', key: 'solutions', badge: 'Platform' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-22 sm:h-24 min-h-[84px] flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group py-1.5">
            <img
              src="/aicampusos.png"
              alt="AI Campus OS"
              className="h-14 sm:h-16 lg:h-20 max-h-[76px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-[15px] font-medium text-slate-600">
            {navLinks.map((item) => {
              const isActive = current === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`px-4 py-2 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#0066FF] bg-blue-50/80 font-semibold'
                      : 'hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
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
              className="bg-[#0B1528] hover:bg-slate-800 text-white text-[15px] font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              Sign up
              <ArrowRight className="w-4 h-4 opacity-70" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pt-3 pb-6 border-b border-slate-100 bg-white flex flex-col gap-3 text-base font-medium shadow-lg animate-fade-in">
            {navLinks.map((item) => {
              const isActive = current === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2 px-3 rounded-xl ${
                    isActive ? 'bg-blue-50 text-[#0066FF] font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-slate-400 font-normal">{item.badge}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactModalOpen(true);
                }}
                className="w-full text-left py-2 px-3 text-slate-700 font-medium"
              >
                Contact sales
              </button>
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-slate-800 font-semibold border border-slate-200 rounded-full"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 bg-[#0B1528] text-white font-semibold rounded-full"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>

      <ContactSalesModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
};

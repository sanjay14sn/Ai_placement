import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

export const ContactSalesModal: React.FC<ContactSalesModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'Institutional TPO / Management'
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: defaultRole,
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { emailApi } = await import('../../services');
      await emailApi.contactSales(formData);
    } catch (err) {
      console.warn('Backend email dispatch warning:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-semibold uppercase tracking-wider mb-3">
              Fast-track Partnership
            </div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-2">
              Talk to our Campus Hiring Experts
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Discover how AI Campus OS automates drive logistics, verified student profiles, AI proctoring, and corporate placement partnerships.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tpo@university.edu.in"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organization / College *
                  </label>
                  <input
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. National Institute of Tech"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    I am representing
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  >
                    <option value="Institutional TPO / Management">University / College TPO</option>
                    <option value="Enterprise Recruiter">Enterprise Recruiter / HR</option>
                    <option value="Startup / Tech Team">Startup / Tech Lead</option>
                    <option value="Candidate / Student Leader">Student Placement Cell</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  How can we help you?
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your campus hiring volume or placement targets..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0B1528] hover:bg-slate-800 text-white font-semibold rounded-full text-sm mt-3 transition-colors shadow-sm cursor-pointer"
              >
                Schedule 1-on-1 Personalized Demo
              </button>

              <p className="text-center text-xs text-slate-400">
                Guaranteed response within 4 business hours • Confidential consultation
              </p>
            </form>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Demo Request Received!</h4>
            <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-slate-900">{formData.name || 'Partner'}</span>. Our institutional specialist will contact you at <span className="font-semibold text-slate-900">{formData.email}</span> shortly.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

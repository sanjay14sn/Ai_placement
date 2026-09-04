import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Check, ArrowRight, Sparkles, BarChart3, Shield, Zap as ZapIcon } from 'lucide-react';
import { Button } from '../../components/ui';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'AI Job Matching',
      description: 'Our AI analyzes 50+ parameters to match students with the most relevant opportunities — increasing placement rates by 40%.',
      color: 'from-brand-500 to-ai-500',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Real-time Analytics',
      description: 'Live dashboards with placement trends, salary distributions, department comparisons, and recruiter analytics.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Multi-tenant Architecture',
      description: 'Enterprise-grade isolation. Each college operates in its own secure tenant with complete data separation.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: <ZapIcon className="w-5 h-5" />,
      title: 'Automated Workflows',
      description: 'From application screening to interview scheduling — automate your entire placement pipeline with AI.',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      role: 'TPO, RV College of Engineering',
      content: 'PlacementOS transformed our placement process. We achieved 89% placement rate this year — up from 71% — using AI job matching and automated workflows.',
      stat: '89% placement rate',
    },
    {
      name: 'Anitha Rao',
      role: 'HR Manager, Infosys',
      content: 'The AI candidate ranking is incredibly accurate. We now spend 60% less time screening candidates. The match scores genuinely reflect candidate quality.',
      stat: '60% time saved',
    },
    {
      name: 'Arjun Sharma',
      role: 'Student, CSE 2025',
      content: 'The skill gap analysis helped me identify exactly what I needed to learn. Got placed at Amazon with a 20 LPA package, up from my initial target of 8 LPA.',
      stat: '20 LPA package',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Onboard your college', desc: 'Set up departments, import students in bulk, and configure placement preferences in minutes.' },
    { step: '02', title: 'Connect with recruiters', desc: 'Invite companies to your placement portal. They post jobs, set eligibility, and track candidates.' },
    { step: '03', title: 'AI does the matching', desc: 'Our AI scores every student-job combination across 12 parameters for optimal matching.' },
    { step: '04', title: 'Manage everything in one place', desc: 'Drives, interviews, offers — track the entire placement lifecycle from one dashboard.' },
  ];

  const faqs = [
    { q: 'How does AI job matching work?', a: 'Our AI analyzes student skills, CGPA, certifications, projects, preferred locations, and career goals against job requirements to generate a multi-parameter match score.' },
    { q: 'Can we import existing student data?', a: 'Yes. You can bulk import students via CSV/Excel, with column mapping and validation. We also support API integration with existing college ERP systems.' },
    { q: 'How does multi-tenancy work?', a: 'Each college is a completely isolated tenant. Student data, analytics, and configurations are never shared between colleges. Recruiters can connect to multiple colleges.' },
    { q: 'What does the AI Placement Officer do?', a: 'It\'s a conversational AI that can answer placement questions, generate reports, identify at-risk students, send mass notifications, and provide actionable insights — all via natural language.' },
    { q: 'Is there a free trial?', a: 'Yes! You get a 30-day free trial with all Professional features, up to 200 students, and unlimited AI queries.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-ai-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">AI PlacementOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            {['Features', 'How It Works', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Start Free Trial</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-100 dark:bg-brand-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-ai-100 dark:bg-ai-900/20 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-8 border border-brand-200 dark:border-brand-800">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Campus Recruitment Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Your AI{' '}
            <span className="bg-gradient-to-r from-brand-600 to-ai-600 bg-clip-text text-transparent">
              Placement Officer
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Automate student placement management, AI-powered job matching, recruitment workflows, and interview scheduling — from one intelligent platform designed for the modern campus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => navigate('/register')} rightIcon={<ArrowRight className="w-5 h-5" />} className="text-base">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')} className="text-base">
              View Live Demo →
            </Button>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: '500+', label: 'Colleges' },
              { value: '50,000+', label: 'Students' },
              { value: '2,000+', label: 'Recruiters' },
              { value: '89%', label: 'Avg. Placement' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-700">
              {['#ef4444', '#f59e0b', '#10b981'].map(c => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <div className="flex-1 mx-4 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 flex justify-center">
              {[
                { label: 'Total Students', value: '850', change: '+12%', color: 'text-brand-600' },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 min-w-[200px] text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-emerald-600 mt-1">↑ {card.change} vs last year</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">AI-First Platform</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to run a world-class placement cell</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Built for placement officers, recruiters, and students — with AI at the core of every feature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-elevated transition-shadow duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Role features grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: '🎓 For Students',
                items: ['AI-ranked job recommendations', 'Resume score & improvement tips', 'Skill gap analysis', 'Interview prep with mock AI', 'Placement readiness score', 'Career advisor chat'],
              },
              {
                role: '📋 For Placement Officers',
                items: ['Unified student management', 'Automated drive management', 'Interview scheduling & tracking', 'AI Placement Officer chat', 'Bulk notifications', 'Detailed placement reports'],
              },
              {
                role: '🏢 For Recruiters',
                items: ['AI-ranked candidate lists', 'Custom eligibility filters', 'Interview panel management', 'Offer management & tracking', 'Campus analytics dashboard', 'Multi-college access'],
              },
            ].map(section => (
              <div key={section.role} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{section.role}</h3>
                <ul className="space-y-2.5">
                  {section.items.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">Simple setup</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Get started in under 30 minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="text-5xl font-black text-slate-100 dark:text-slate-800 mb-4">{step.step}</div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-6 right-0 translate-x-1/2 text-slate-300 dark:text-slate-700 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Trusted by placement teams across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic">"{t.content}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-lg">
                    {t.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-12">No hidden fees. Scale with your institution.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Starter', price: '₹4,999', period: '/month', desc: 'For small colleges', students: '500', popular: false },
              { name: 'Professional', price: '₹12,999', period: '/month', desc: 'Most popular choice', students: '2,000', popular: true },
              { name: 'Enterprise', price: '₹29,999', period: '/month', desc: 'For large institutions', students: 'Unlimited', popular: false },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl p-8 border-2 ${plan.popular ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 relative' : 'border-slate-200 dark:border-slate-700'}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{plan.students} students</p>
                <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full" onClick={() => navigate('/pricing')}>
                  {plan.popular ? 'Start Free Trial' : 'Get Started'}
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            All plans include a 30-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-slate-900 dark:text-white list-none">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative bg-gradient-to-br from-brand-600 to-ai-700 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your placement cell?</h2>
              <p className="text-brand-200 mb-8 max-w-xl mx-auto">
                Join 500+ colleges using AI PlacementOS to achieve higher placement rates, happier students, and more satisfied recruiters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" onClick={() => navigate('/register')} className="bg-white text-brand-700 hover:bg-slate-100">
                  Start Free Trial — No CC Required
                </Button>
                <Button size="lg" onClick={() => navigate('/login')} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-600 to-ai-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">AI PlacementOS</span>
          </div>
          <p className="text-xs text-slate-400">© 2025 AI PlacementOS. Built for Indian engineering colleges.</p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

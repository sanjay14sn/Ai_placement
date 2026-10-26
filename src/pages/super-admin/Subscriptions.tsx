import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Sparkles, Clock, ArrowRight, ShieldCheck, 
  FileText, Activity, Zap, Building2, BellRing, ChevronRight
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge } from '../../components/ui';
import { toast } from 'sonner';

export const SuperAdminSubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNotifyMe = () => {
    toast.success('Interest registered!', {
      description: 'You will receive an update as soon as the Subscriptions engine is deployed.',
    });
  };

  const upcomingFeatures = [
    {
      icon: <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: 'Automated GST Invoicing',
      description: 'Automated invoice generation, tax reporting, and verifiable institutional payment receipts.',
    },
    {
      icon: <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'Real-Time Usage Metering',
      description: 'Dynamic tracking of active student seats, recruiter postings, and AI credits consumption.',
    },
    {
      icon: <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Campus License Management',
      description: 'Centralized license allocation, campus activation keys, and seamless renewal workflows.',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: 'Multi-Gateway Billing',
      description: 'Direct support for Razorpay, Stripe, Net Banking, and university purchase order contracts.',
    },
  ];

  return (
    <PageWrapper 
      title="Subscriptions" 
      subtitle="Institutional subscription contracts, recurring billing & quota management"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Subscriptions' }]}
    >
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {/* Main Hero Card */}
        <Card className="p-8 md:p-12 text-center relative overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white via-slate-50/50 to-brand-50/20 dark:from-slate-800 dark:via-slate-800/90 dark:to-brand-950/20 shadow-sm">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
            {/* Pulsing Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Feature Under Development • Coming Soon</span>
            </div>

            {/* Icon Bubble */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 mb-6 ring-8 ring-brand-50 dark:ring-brand-950/40">
              <CreditCard className="w-10 h-10" />
            </div>

            {/* Headline & Description */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
              Institutional Subscriptions Engine
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              We are building a comprehensive subscription and recurring billing suite tailored for higher-education campuses and corporate recruitment partners. This module will launch in an upcoming release.
            </p>

            {/* Development Progress Indicator */}
            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-700/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 mb-8">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" /> Release Status
                </span>
                <span className="text-brand-600 dark:text-brand-400">In Development (75%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={handleNotifyMe}
                leftIcon={<BellRing className="w-4 h-4" />}
                className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
              >
                Notify Me When Ready
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/super-admin/overview')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Feature Previews Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              What's Coming in this Module
            </h3>
            <Badge variant="indigo" className="text-xs">Preview</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-xs hover:border-brand-300 dark:hover:border-brand-700 transition-colors flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700 flex-shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Footer */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-500">
          <span>Need to manage active campus accounts in the meantime?</span>
          <button 
            onClick={() => navigate('/super-admin/colleges')} 
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Manage Colleges <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

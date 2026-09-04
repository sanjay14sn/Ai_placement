import React, { useEffect, useState } from 'react';
import { Layers, Plus, Check, Star, Sparkles, Edit3, Settings, Shield } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal, Skeleton } from '../../components/ui';
import { billingService } from '../../services';
import { formatNumber } from '../../utils';
import { toast } from 'sonner';

interface Plan {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number;
  annualPrice: number;
  studentsLimit: number;
  aiCreditsLimit: number;
  recruitersLimit: number;
  jobsLimit: number;
  features: string[];
  isPopular?: boolean;
}

export const SuperAdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [price, setPrice] = useState('');
  const [studentsLimit, setStudentsLimit] = useState('');
  const [aiCreditsLimit, setAiCreditsLimit] = useState('');
  const [recruitersLimit, setRecruitersLimit] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await billingService.getPlans();
      setPlans(res);
    } catch {
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setPrice(plan.price.toString());
    setStudentsLimit(plan.studentsLimit.toString());
    setAiCreditsLimit(plan.aiCreditsLimit.toString());
    setRecruitersLimit(plan.recruitersLimit.toString());
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setPlans(prev => prev.map(p => p.id === selectedPlan.id ? {
      ...p,
      price: parseFloat(price),
      studentsLimit: parseInt(studentsLimit),
      aiCreditsLimit: parseInt(aiCreditsLimit),
      recruitersLimit: parseInt(recruitersLimit),
    } : p));

    setIsModalOpen(false);
    toast.success(`Plan ${selectedPlan.name} upgraded successfully!`);
  };

  return (
    <PageWrapper
      title="SaaS Plans"
      subtitle="Configure pricing tiers & resource limits"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Plans' }]}
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-96"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 hover:shadow-elevated transition-shadow duration-200 border-2 relative flex flex-col justify-between h-full ${
                plan.isPopular ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                    <Badge variant={plan.id === 'enterprise' ? 'purple' : 'slate'} className="text-[10px]">
                      {plan.id.toUpperCase()} TIER
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleEditClick(plan)}>
                    <Edit3 className="w-4 h-4 text-slate-500" />
                  </Button>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">₹{formatNumber(plan.price)}</span>
                  <span className="text-slate-400 text-xs">/ month</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Student Limit</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.studentsLimit === 999999 ? 'Unlimited' : formatNumber(plan.studentsLimit)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">AI Credits Limit</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(plan.aiCreditsLimit)} / mo</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Recruiter Seats</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.recruitersLimit === 999 ? 'Unlimited' : plan.recruitersLimit}</span>
                  </div>
                </div>

                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3">Core Features Included</h4>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Limits Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Configure Tier Limits: ${selectedPlan?.name}`}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Price (INR)</label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Students Limit</label>
              <Input
                type="number"
                value={studentsLimit}
                onChange={e => setStudentsLimit(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Recruiter Limit</label>
              <Input
                type="number"
                value={recruitersLimit}
                onChange={e => setRecruitersLimit(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly AI Credits</label>
            <Input
              type="number"
              value={aiCreditsLimit}
              onChange={e => setAiCreditsLimit(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Update Limits</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

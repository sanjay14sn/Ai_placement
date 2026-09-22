import React, { useEffect, useState } from 'react';
import { Layers, Plus, Check, Star, Sparkles, Edit3, Settings, Shield, Trash2, Wand2 } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal, Skeleton, Textarea } from '../../components/ui';
import { billingService } from '../../services';
import { formatNumber } from '../../utils';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  studentsLimit: number;
  aiCreditsLimit: number;
  recruitersLimit: number;
  jobsLimit: number;
  features: string[];
  isPopular?: boolean;
  isCustom?: boolean;
}

const DEFAULT_CUSTOM_PLAN: Plan = {
  id: 'custom-1',
  name: 'Custom Enterprise Tier',
  price: 50000,
  annualPrice: 500000,
  studentsLimit: 15000,
  aiCreditsLimit: 100000,
  recruitersLimit: 200,
  jobsLimit: 1000,
  features: [
    'Tailored student & recruiter limits',
    'Custom AI credits allocation',
    'Dedicated database isolation & SSO NetID',
    'Multi-campus Directorate analytics',
    'Custom SLA & 24/7 priority hotline',
    'Dedicated account & onboarding team',
  ],
  isCustom: true,
};

export const SuperAdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState('');
  const [studentsLimit, setStudentsLimit] = useState('');
  const [aiCreditsLimit, setAiCreditsLimit] = useState('');
  const [recruitersLimit, setRecruitersLimit] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await billingService.getPlans();
      // Append default custom plan alongside standard plans
      const fetchedWithCustom: Plan[] = [
        ...res.map(p => ({ ...p, id: String(p.id) })),
        DEFAULT_CUSTOM_PLAN,
      ];
      setPlans(fetchedWithCustom);
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
    setIsCreatingNew(false);
    setSelectedPlan(plan);
    setPlanName(plan.name);
    setPrice(plan.price.toString());
    setStudentsLimit(plan.studentsLimit.toString());
    setAiCreditsLimit(plan.aiCreditsLimit.toString());
    setRecruitersLimit(plan.recruitersLimit.toString());
    setFeaturesText(plan.features.join('\n'));
    setIsPopular(!!plan.isPopular);
    setIsModalOpen(true);
  };

  const handleCreateCustomClick = () => {
    setIsCreatingNew(true);
    const newId = `custom-${Date.now()}`;
    const newPlan: Plan = {
      id: newId,
      name: 'Custom University Tier',
      price: 45000,
      annualPrice: 450000,
      studentsLimit: 10000,
      aiCreditsLimit: 75000,
      recruitersLimit: 150,
      jobsLimit: 800,
      features: [
        'Custom student & recruiter capacity',
        '75,000 AI credits per month',
        'Custom SSO & SRM NetID integration',
        'Dedicated SLA & 24/7 priority support',
      ],
      isCustom: true,
    };
    setSelectedPlan(newPlan);
    setPlanName(newPlan.name);
    setPrice(newPlan.price.toString());
    setStudentsLimit(newPlan.studentsLimit.toString());
    setAiCreditsLimit(newPlan.aiCreditsLimit.toString());
    setRecruitersLimit(newPlan.recruitersLimit.toString());
    setFeaturesText(newPlan.features.join('\n'));
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const handleDeleteCustom = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    toast.success('Custom plan removed');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const parsedFeatures = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const updatedPlan: Plan = {
      ...selectedPlan,
      name: planName || selectedPlan.name,
      price: parseFloat(price) || 0,
      annualPrice: (parseFloat(price) || 0) * 10,
      studentsLimit: parseInt(studentsLimit) || 1000,
      aiCreditsLimit: parseInt(aiCreditsLimit) || 5000,
      recruitersLimit: parseInt(recruitersLimit) || 10,
      features: parsedFeatures.length > 0 ? parsedFeatures : selectedPlan.features,
      isPopular,
    };

    if (isCreatingNew) {
      setPlans(prev => [...prev, updatedPlan]);
      toast.success(`🎉 Custom Plan "${updatedPlan.name}" created successfully!`);
    } else {
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? updatedPlan : p));
      toast.success(`Plan "${updatedPlan.name}" updated successfully!`);
    }

    setIsModalOpen(false);
  };

  return (
    <PageWrapper
      title="SaaS Plans"
      subtitle="Configure pricing tiers, custom plans & resource limits"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Plans' }]}
      actions={
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleCreateCustomClick}
          className="bg-[#08546c] hover:bg-[#064255] font-extrabold text-xs sm:text-sm px-4 py-2"
        >
          Add Custom Tier
        </Button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-96"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 sm:p-8 hover:shadow-elevated transition-all duration-200 border-2 relative flex flex-col justify-between h-full rounded-3xl ${
                plan.isPopular 
                  ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-900/10' 
                  : plan.isCustom 
                    ? 'border-cyan-500/80 bg-cyan-50/30 dark:bg-slate-800/80 shadow-md' 
                    : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              {plan.isCustom && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#08546c] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Custom Tier</span>
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                    <Badge variant={plan.isCustom ? 'ai' : plan.id === 'enterprise' ? 'purple' : 'slate'} className="text-[10px]">
                      {plan.isCustom ? 'CUSTOM TIER' : `${plan.id.toUpperCase()} TIER`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleEditClick(plan)} title="Edit Plan">
                      <Edit3 className="w-4 h-4 text-slate-500" />
                    </Button>
                    {plan.isCustom && (
                      <Button variant="ghost" size="icon" className="hover:bg-red-50 text-red-500 hover:text-red-700" onClick={() => handleDeleteCustom(plan.id)} title="Delete Custom Plan">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">₹{formatNumber(plan.price)}</span>
                  <span className="text-slate-400 text-xs">/ month</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Student Limit</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.studentsLimit >= 999999 ? 'Unlimited' : formatNumber(plan.studentsLimit)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">AI Credits Limit</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(plan.aiCreditsLimit)} / mo</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Recruiter Seats</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.recruitersLimit >= 999 ? 'Unlimited' : plan.recruitersLimit}</span>
                  </div>
                </div>

                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3">Core Features Included</h4>
                <ul className="space-y-2">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  variant={plan.isCustom ? 'ai' : 'outline'} 
                  size="sm" 
                  className="w-full text-xs font-bold justify-center"
                  onClick={() => handleEditClick(plan)}
                >
                  {plan.isCustom ? 'Configure Custom Tier' : 'Edit Tier Limits'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Tier Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isCreatingNew ? 'Create New Custom Tier' : `Configure Plan: ${selectedPlan?.name}`}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-cyan-50 dark:bg-slate-800/80 border border-cyan-200/80 dark:border-slate-700 p-3.5 rounded-2xl text-xs text-[#08546c] dark:text-cyan-300 font-medium leading-relaxed">
            ✨ <strong>Custom Pricing & Resource Allocation:</strong> Adjust pricing, student capacity, recruiter seats, monthly AI credits, and custom feature bullet points.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Plan Name *</label>
              <Input
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                placeholder="e.g. Custom Enterprise Tier"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Price (INR) *</label>
              <Input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 50000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Students Limit</label>
              <Input
                type="number"
                value={studentsLimit}
                onChange={e => setStudentsLimit(e.target.value)}
                placeholder="e.g. 15000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Recruiter Seats</label>
              <Input
                type="number"
                value={recruitersLimit}
                onChange={e => setRecruitersLimit(e.target.value)}
                placeholder="e.g. 200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly AI Credits</label>
              <Input
                type="number"
                value={aiCreditsLimit}
                onChange={e => setAiCreditsLimit(e.target.value)}
                placeholder="e.g. 100000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Custom Features Included (One per line)</label>
            <Textarea
              rows={5}
              value={featuresText}
              onChange={e => setFeaturesText(e.target.value)}
              placeholder="e.g.&#10;Up to 15,000 students&#10;Custom SSO NetID integration&#10;Dedicated SLA & 24/7 Hotline"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="popularCheck"
              checked={isPopular}
              onChange={e => setIsPopular(e.target.checked)}
              className="w-4 h-4 rounded text-[#08546c] focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="popularCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Mark as "Most Popular" plan
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#08546c] hover:bg-[#064255] text-white font-extrabold px-6">
              {isCreatingNew ? 'Create Custom Tier' : 'Save Plan Configuration'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};


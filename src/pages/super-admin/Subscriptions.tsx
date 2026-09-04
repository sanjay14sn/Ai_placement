import React, { useEffect, useState } from 'react';
import {
  CreditCard, Search, Filter, Plus, Calendar, AlertTriangle, CheckCircle,
  Clock, ShieldAlert, ArrowUpRight, FileText, RefreshCw, MoreVertical, Check, Zap, Building2, ChevronRight
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, Input, Select, Modal, Progress, Skeleton, ConfirmDialog, Tabs } from '../../components/ui';
import { superAdminSubscriptionService, billingService } from '../../services';
import { formatNumber } from '../../utils';

interface SubscriptionItem {
  id: string;
  collegeId: string;
  collegeName: string;
  collegeCode: string;
  city: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'expiring' | 'expired' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  startDate: string;
  expiresAt: string;
  autoRenew: boolean;
  studentsUsed: number;
  studentsLimit: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  recruitersUsed: number;
  recruitersLimit: number;
  jobsUsed: number;
  jobsLimit: number;
  invoicesCount: number;
  lastPaymentDate: string;
  lastPaymentStatus: string;
}

export const SuperAdminSubscriptionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    trial: number;
    expiring: number;
    mrr: number;
    enterpriseCount: number;
    arr: number;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Item / Modals
  const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  
  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Edit Modal
  const [editPlan, setEditPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [editBillingCycle, setEditBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [editStatus, setEditStatus] = useState<'active' | 'trial' | 'expiring' | 'expired' | 'cancelled'>('active');
  const [editStudentsLimit, setEditStudentsLimit] = useState(2000);
  const [editAiCreditsLimit, setEditAiCreditsLimit] = useState(5000);
  const [editAmount, setEditAmount] = useState(129990);
  const [editAutoRenew, setEditAutoRenew] = useState(true);
  const [extendDays, setExtendDays] = useState(14);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State for Provisioning New Subscription
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [newPlan, setNewPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [newBillingCycle, setNewBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [newCity, setNewCity] = useState('Bengaluru');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let finalStatus = statusFilter;
      if (activeTab === 'enterprise') finalStatus = 'all';
      if (activeTab === 'trial') finalStatus = 'trial';
      if (activeTab === 'expiring') finalStatus = 'expiring';

      let finalPlan = planFilter;
      if (activeTab === 'enterprise') finalPlan = 'enterprise';

      const [res, statsRes] = await Promise.all([
        superAdminSubscriptionService.getAll({
          search,
          plan: finalPlan,
          status: finalStatus,
          page,
          limit: 10,
        }),
        superAdminSubscriptionService.getStats(),
      ]);

      setSubscriptions(res.data as SubscriptionItem[]);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, planFilter, statusFilter, activeTab, page]);

  const handleOpenEdit = (sub: SubscriptionItem) => {
    setSelectedSub(sub);
    setEditPlan(sub.plan);
    setEditBillingCycle(sub.billingCycle);
    setEditStatus(sub.status);
    setEditStudentsLimit(sub.studentsLimit);
    setEditAiCreditsLimit(sub.aiCreditsLimit);
    setEditAmount(sub.amount);
    setEditAutoRenew(sub.autoRenew);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      await superAdminSubscriptionService.updatePlan(selectedSub.id, {
        plan: editPlan,
        billingCycle: editBillingCycle,
        status: editStatus,
        studentsLimit: editStudentsLimit,
        aiCreditsLimit: editAiCreditsLimit,
        amount: editAmount,
        autoRenew: editAutoRenew,
      });
      showToast(`Subscription for ${selectedSub.collegeName} updated successfully!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      await superAdminSubscriptionService.extendTrial(selectedSub.id, extendDays);
      showToast(`Trial for ${selectedSub.collegeName} extended by ${extendDays} days!`);
      setIsExtendModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      await superAdminSubscriptionService.cancel(selectedSub.id);
      showToast(`Subscription for ${selectedSub.collegeName} cancelled.`);
      setIsCancelConfirmOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProvisionNewSub = async () => {
    if (!newCollegeName || !newCollegeCode) return;
    setActionLoading(true);
    try {
      const prices = { starter: 4999, professional: 12999, enterprise: 29999 };
      const limits = {
        starter: { students: 500, ai: 1000, recruiters: 10 },
        professional: { students: 2000, ai: 5000, recruiters: 50 },
        enterprise: { students: 10000, ai: 50000, recruiters: 200 },
      };
      
      const newSub: SubscriptionItem = {
        id: `sub-${Date.now()}`,
        collegeId: `college-${Date.now()}`,
        collegeName: newCollegeName,
        collegeCode: newCollegeCode.toUpperCase(),
        city: newCity,
        plan: newPlan,
        status: 'active',
        billingCycle: newBillingCycle,
        amount: newBillingCycle === 'annual' ? prices[newPlan] * 10 : prices[newPlan],
        currency: 'INR',
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        autoRenew: true,
        studentsUsed: 0,
        studentsLimit: limits[newPlan].students,
        aiCreditsUsed: 0,
        aiCreditsLimit: limits[newPlan].ai,
        recruitersUsed: 0,
        recruitersLimit: limits[newPlan].recruiters,
        jobsUsed: 0,
        jobsLimit: 100,
        invoicesCount: 1,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        lastPaymentStatus: 'paid',
      };

      setSubscriptions([newSub, ...subscriptions]);
      showToast(`New subscription provisioned for ${newCollegeName}!`);
      setIsAddModalOpen(false);
      setNewCollegeName('');
      setNewCollegeCode('');
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const getPlanBadge = (plan: SubscriptionItem['plan']) => {
    switch (plan) {
      case 'enterprise': return <Badge variant="purple" dot>Enterprise</Badge>;
      case 'professional': return <Badge variant="indigo" dot>Professional</Badge>;
      case 'starter': return <Badge variant="slate" dot>Starter</Badge>;
    }
  };

  const getStatusBadge = (status: SubscriptionItem['status']) => {
    switch (status) {
      case 'active': return <Badge variant="green" dot>Active</Badge>;
      case 'trial': return <Badge variant="blue" dot>Trial Period</Badge>;
      case 'expiring': return <Badge variant="amber" dot>Expiring Soon</Badge>;
      case 'expired': return <Badge variant="red" dot>Expired</Badge>;
      case 'cancelled': return <Badge variant="slate">Cancelled</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Subscription Management"
      subtitle="Manage tenant billing, SaaS tiers, renewals, and custom limits"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Subscriptions' }]}
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Provision Subscription
        </Button>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {loading || !stats ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard title="Active Subscriptions" value={stats.active} change={`Out of ${stats.total} total`} changeType="increase" icon={<CreditCard className="w-5 h-5" />} color="brand" />
            <StatCard title="MRR" value={`₹${formatNumber(stats.mrr)}`} change="↑ 12.4% MoM" changeType="increase" icon={<Zap className="w-5 h-5" />} color="green" />
            <StatCard title="ARR" value={`₹${formatNumber(stats.arr)}`} change="Annualized revenue" changeType="neutral" icon={<Building2 className="w-5 h-5" />} color="purple" />
            <StatCard title="Enterprise Tiers" value={stats.enterpriseCount} change="High contract value" changeType="increase" icon={<ShieldAlert className="w-5 h-5" />} color="purple" />
            <StatCard title="Active Trials" value={stats.trial} change="Converting leads" changeType="neutral" icon={<Clock className="w-5 h-5" />} color="amber" />
            <StatCard title="Expiring (7 Days)" value={stats.expiring} change="Action required" changeType={stats.expiring > 0 ? 'decrease' : 'neutral'} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
          </>
        )}
      </div>

      {/* Tabs View */}
      <Card className="mb-6" padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Subscriptions', badge: stats?.total || 0 },
              { id: 'enterprise', label: 'Enterprise Tiers', badge: stats?.enterpriseCount || 0 },
              { id: 'trial', label: 'Trials', badge: stats?.trial || 0 },
              { id: 'expiring', label: 'Expiring Soon', badge: stats?.expiring || 0 },
            ]}
            activeTab={activeTab}
            onChange={(id) => { setActiveTab(id); setPage(1); }}
          />

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search college name, code, city..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              options={[
                { value: 'all', label: 'All Plans' },
                { value: 'starter', label: 'Starter' },
                { value: 'professional', label: 'Professional' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="w-36"
            />
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'trial', label: 'Trial' },
                { value: 'expiring', label: 'Expiring Soon' },
                { value: 'expired', label: 'Expired' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-36"
            />
          </div>
        </div>

        {/* Subscriptions Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-6">College / Tenant</th>
                <th className="py-3.5 px-4">Plan & Billing</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Student Capacity</th>
                <th className="py-3.5 px-4">AI Credits Used</th>
                <th className="py-3.5 px-4">Renewal / Expiry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No subscriptions found matching your filters.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const studentPercent = Math.round((sub.studentsUsed / sub.studentsLimit) * 100);
                  const aiPercent = Math.round((sub.aiCreditsUsed / sub.aiCreditsLimit) * 100);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-brand-200 dark:border-brand-800">
                            {sub.collegeCode.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{sub.collegeName}</p>
                            <p className="text-xs text-slate-400">{sub.city} • Code: <span className="font-mono text-slate-600 dark:text-slate-300">{sub.collegeCode}</span></p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {getPlanBadge(sub.plan)}
                          <span className="text-xs text-slate-500 capitalize">{sub.billingCycle} billing</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        ₹{formatNumber(sub.amount)}
                        <span className="text-xs font-normal text-slate-400 block">{sub.billingCycle === 'annual' ? '/yr' : '/mo'}</span>
                      </td>

                      <td className="py-4 px-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>{formatNumber(sub.studentsUsed)} / {formatNumber(sub.studentsLimit)}</span>
                            <span className="font-medium">{studentPercent}%</span>
                          </div>
                          <Progress value={studentPercent} color={studentPercent > 90 ? 'red' : studentPercent > 75 ? 'amber' : 'brand'} size="sm" />
                        </div>
                      </td>

                      <td className="py-4 px-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>{formatNumber(sub.aiCreditsUsed)} / {formatNumber(sub.aiCreditsLimit)}</span>
                            <span className="font-medium">{aiPercent}%</span>
                          </div>
                          <Progress value={aiPercent} color="ai" size="sm" />
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{sub.expiresAt}</p>
                          <p className={`mt-0.5 ${sub.autoRenew ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {sub.autoRenew ? 'Auto-renews' : 'Manual renewal'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(sub)}>
                            Edit Plan
                          </Button>
                          {sub.status === 'trial' && (
                            <Button variant="secondary" size="sm" onClick={() => { setSelectedSub(sub); setIsExtendModalOpen(true); }}>
                              Extend Trial
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => { setSelectedSub(sub); setIsInvoicesModalOpen(true); }}>
                            <FileText className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{subscriptions.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> subscriptions
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL 1: Edit Subscription & Custom Limits */}
      {selectedSub && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Subscription — ${selectedSub.collegeName}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between">
              <Button variant="danger" size="sm" onClick={() => { setIsEditModalOpen(false); setIsCancelConfirmOpen(true); }}>
                Cancel Subscription
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button variant="primary" loading={actionLoading} onClick={handleSaveEdit}>
                  Save Subscription
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Subscription Plan Tier"
                options={[
                  { value: 'starter', label: 'Starter Plan (₹4,999/mo)' },
                  { value: 'professional', label: 'Professional Plan (₹12,999/mo)' },
                  { value: 'enterprise', label: 'Enterprise Plan (₹29,999/mo)' },
                ]}
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value as any)}
              />

              <Select
                label="Billing Cycle"
                options={[
                  { value: 'monthly', label: 'Monthly Billing' },
                  { value: 'annual', label: 'Annual Billing (10x Discount)' },
                ]}
                value={editBillingCycle}
                onChange={(e) => setEditBillingCycle(e.target.value as any)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Subscription Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'trial', label: 'Trial Period' },
                  { value: 'expiring', label: 'Expiring Soon' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
              />

              <Input
                label="Custom Billing Amount (INR ₹)"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Student Capacity Limit"
                type="number"
                value={editStudentsLimit}
                onChange={(e) => setEditStudentsLimit(Number(e.target.value))}
                hint={`Currently used: ${selectedSub.studentsUsed}`}
              />

              <Input
                label="AI Credits Limit / Month"
                type="number"
                value={editAiCreditsLimit}
                onChange={(e) => setEditAiCreditsLimit(Number(e.target.value))}
                hint={`Currently used: ${selectedSub.aiCreditsUsed}`}
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Auto-Renewal Enabled</p>
                <p className="text-xs text-slate-500">Automatically invoice tenant upon subscription expiration date</p>
              </div>
              <input
                type="checkbox"
                checked={editAutoRenew}
                onChange={(e) => setEditAutoRenew(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Extend Trial Period */}
      {selectedSub && (
        <Modal
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          title={`Extend Trial Period — ${selectedSub.collegeName}`}
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsExtendModalOpen(false)}>Cancel</Button>
              <Button variant="primary" loading={actionLoading} onClick={handleExtendTrial}>
                Extend Trial
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Current expiration date: <span className="font-semibold">{selectedSub.expiresAt}</span>
            </p>
            <Select
              label="Extend Duration By"
              options={[
                { value: '7', label: '7 Days Extension' },
                { value: '14', label: '14 Days Extension' },
                { value: '30', label: '30 Days Extension (Full Month)' },
                { value: '60', label: '60 Days Extension' },
              ]}
              value={String(extendDays)}
              onChange={(e) => setExtendDays(Number(e.target.value))}
            />
          </div>
        </Modal>
      )}

      {/* MODAL 3: View Past Invoices */}
      {selectedSub && (
        <Modal
          isOpen={isInvoicesModalOpen}
          onClose={() => setIsInvoicesModalOpen(false)}
          title={`Billing History & Invoices — ${selectedSub.collegeName}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium uppercase">Current Plan Contract</p>
                <p className="text-lg font-bold text-brand-900 dark:text-brand-100">{selectedSub.plan.toUpperCase()} • ₹{formatNumber(selectedSub.amount)}/{selectedSub.billingCycle}</p>
              </div>
              <Badge variant="green">Last Paid: {selectedSub.lastPaymentDate}</Badge>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Invoice ID</th>
                  <th className="py-2.5">Billing Period</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: selectedSub.invoicesCount || 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 font-mono font-medium text-slate-800 dark:text-slate-200">INV-2025-0{90 - i}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">Month of {new Date(2025, 7 - i, 1).toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">₹{formatNumber(selectedSub.amount)}</td>
                    <td className="py-3"><Badge variant={i === 0 ? 'green' : 'slate'}>{i === 0 ? 'Paid' : 'Settled'}</Badge></td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="w-3 h-3" />}>
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* MODAL 4: Provision New Subscription */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New SaaS Tenant Subscription"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleProvisionNewSub}>
              Provision & Activate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="College / Institution Name"
            placeholder="e.g. IIT Delhi Technology Campus"
            value={newCollegeName}
            onChange={(e) => setNewCollegeName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="College Short Code"
              placeholder="e.g. IITD"
              value={newCollegeCode}
              onChange={(e) => setNewCollegeCode(e.target.value)}
            />
            <Input
              label="City / Region"
              placeholder="e.g. New Delhi"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Plan Tier"
              options={[
                { value: 'starter', label: 'Starter Plan (500 Students)' },
                { value: 'professional', label: 'Professional Plan (2,000 Students)' },
                { value: 'enterprise', label: 'Enterprise Plan (Custom / Unlimited)' },
              ]}
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value as any)}
            />

            <Select
              label="Billing Cycle"
              options={[
                { value: 'annual', label: 'Annual Billing (Recommended)' },
                { value: 'monthly', label: 'Monthly Recurring' },
              ]}
              value={newBillingCycle}
              onChange={(e) => setNewBillingCycle(e.target.value as any)}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel the subscription for ${selectedSub?.collegeName}? Their access will be revoked at the end of the current billing cycle.`}
        confirmLabel="Yes, Cancel Subscription"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

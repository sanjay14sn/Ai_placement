import React, { useEffect, useState } from 'react';
import { Building2, Search, Filter, Mail, Phone, ArrowUpRight, ShieldAlert, Sparkles, Check, X } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Pagination, EmptyState, Skeleton } from '../../components/ui';
import { collegeService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { College } from '../../types';

export const SuperAdminCollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');

  const LIMIT = 8;

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await collegeService.getAll({
        search,
        page,
        limit: LIMIT,
      });

      let filtered = [...res.data];
      if (plan) filtered = filtered.filter(c => c.subscription.plan === plan);
      if (status) filtered = filtered.filter(c => c.subscription.status === status);

      setColleges(filtered);
      setTotal(filtered.length);
      setTotalPages(Math.ceil(filtered.length / LIMIT));
    } catch {
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [search, plan, status, page]);

  const handleToggleStatus = (id: string, current: boolean) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    toast.success(`College account ${!current ? 'activated' : 'suspended'} successfully`);
  };

  const getPlanBadge = (p: College['subscription']['plan']) => {
    switch (p) {
      case 'enterprise': return <Badge variant="purple">Enterprise</Badge>;
      case 'professional': return <Badge variant="indigo">Professional</Badge>;
      case 'starter': return <Badge variant="slate">Starter</Badge>;
      default: return <Badge variant="slate">{p}</Badge>;
    }
  };

  const getStatusBadge = (s: College['subscription']['status']) => {
    switch (s) {
      case 'active': return <Badge variant="green">Active</Badge>;
      case 'trial': return <Badge variant="blue">Trial</Badge>;
      case 'expired': return <Badge variant="red">Expired</Badge>;
      default: return <Badge variant="slate">{s}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Colleges"
      subtitle="Manage registered universities & tenants"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Colleges' }]}
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by university name or city..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={plan}
            onChange={e => { setPlan(e.target.value); setPage(1); }}
            placeholder="All Plans"
            options={[
              { value: 'starter', label: 'Starter' },
              { value: 'professional', label: 'Professional' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
            className="sm:w-44"
          />
          <Select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            placeholder="All Statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'trial', label: 'Trial' },
              { value: 'expired', label: 'Expired' },
            ]}
            className="sm:w-40"
          />
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title="No colleges found"
          description="Adjust your search criteria or register a new university tenant."
        />
      ) : (
        <div className="space-y-4">
          {colleges.map((college) => (
            <Card key={college.id} className="p-6 hover:shadow-elevated transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{college.name}</h3>
                    {getPlanBadge(college.subscription.plan)}
                    {getStatusBadge(college.subscription.status)}
                  </div>
                  <p className="text-xs text-slate-500">{college.city}, {college.state} · Established {college.establishedYear}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{college.tpoEmail}</span>
                    <span>TPO: {college.tpoName}</span>
                    <span>Registered: {formatDate(college.createdAt)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:self-center pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-3 gap-6 text-xs text-right sm:text-left">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Students</span>
                      <span className="font-bold text-slate-900 dark:text-white">{college.subscription.studentsUsed} / {college.subscription.studentsLimit}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">AI Credits</span>
                      <span className="font-bold text-slate-900 dark:text-white">{college.subscription.aiCreditsUsed} / {college.subscription.aiCreditsLimit}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                      <span className={`font-bold ${college.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {college.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant={college.isActive ? 'outline' : 'primary'}
                      size="sm"
                      className="text-xs justify-center flex-1 sm:flex-none"
                      onClick={() => handleToggleStatus(college.id, college.isActive)}
                    >
                      {college.isActive ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Quick Upgrade Plan"
                      className="text-brand-600 hover:bg-brand-50"
                      onClick={() => toast.info(`Managing subscription details for ${college.name}...`)}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

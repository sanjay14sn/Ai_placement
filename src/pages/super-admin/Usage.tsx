import React, { useEffect, useState } from 'react';
import {
  Activity, Cpu, HardDrive, Zap, RefreshCw, PlusCircle, AlertCircle,
  Search, ShieldAlert, CheckCircle, BarChart2, Layers, Server, Clock
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, Input, Select, Modal, Progress, Skeleton, ConfirmDialog, AIBadge } from '../../components/ui';
import { superAdminUsageService } from '../../services';
import { formatNumber } from '../../utils';

interface TenantUsageItem {
  collegeId: string;
  collegeName: string;
  collegeCode: string;
  plan: string;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  aiUsagePercent: number;
  storageUsedGB: number;
  storageLimitGB: number;
  resumesParsed: number;
  mockInterviews: number;
  studentsActive: number;
  studentsLimit: number;
  apiRequestsToday: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export const SuperAdminUsagePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [tenantUsageList, setTenantUsageList] = useState<TenantUsageItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [selectedTenant, setSelectedTenant] = useState<TenantUsageItem | null>(null);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Bonus Credits Form
  const [bonusAmount, setBonusAmount] = useState(10000);
  const [bonusReason, setBonusReason] = useState('High placement volume promo');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, list] = await Promise.all([
        superAdminUsageService.getOverview(),
        superAdminUsageService.getTenantUsage({ search, status: statusFilter }),
      ]);
      setOverview(ov);
      setTenantUsageList(list as TenantUsageItem[]);
    } catch (err) {
      console.error('Error loading usage data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleGrantBonus = async () => {
    if (!selectedTenant) return;
    setActionLoading(true);
    try {
      await superAdminUsageService.grantBonusCredits(selectedTenant.collegeId, bonusAmount, bonusReason);
      showToast(`Granted ${formatNumber(bonusAmount)} bonus AI credits to ${selectedTenant.collegeName}!`);
      setIsBonusModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetCounter = async () => {
    if (!selectedTenant) return;
    setActionLoading(true);
    try {
      await superAdminUsageService.resetUsageCounter(selectedTenant.collegeId);
      showToast(`Reset monthly usage counter for ${selectedTenant.collegeName}.`);
      setIsResetConfirmOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Platform Resource & AI Usage"
      subtitle="Monitor token consumption, storage utilization, API throughput, and tenant quota limits"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'System Usage' }]}
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
        {loading || !overview ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard title="AI Credits Consumed" value={`${(overview.totalAiCreditsUsed / 1000000).toFixed(2)}M`} change={`${overview.aiUsagePercent}% of monthly pool`} changeType="increase" icon={<Cpu className="w-5 h-5" />} color="purple" />
            <StatCard title="Storage Used" value={`${(overview.totalStorageUsedGB / 1000).toFixed(2)} TB`} change={`${overview.storageUsagePercent}% of 5 TB capacity`} changeType="neutral" icon={<HardDrive className="w-5 h-5" />} color="brand" />
            <StatCard title="API Requests Today" value={formatNumber(overview.apiRequestsToday)} change="Peak: 42k/hr" changeType="increase" icon={<Activity className="w-5 h-5" />} color="green" />
            <StatCard title="Avg Latency" value={`${overview.avgResponseTimeMs} ms`} change="99.9% SLA healthy" changeType="increase" icon={<Clock className="w-5 h-5" />} color="amber" />
            <StatCard title="Active Sessions" value={formatNumber(overview.activeSessionsNow)} change="Real-time students/admins" changeType="neutral" icon={<Server className="w-5 h-5" />} color="purple" />
            <StatCard title="Resumes Processed" value={formatNumber(overview.resumesParsedMonth)} change="This month" changeType="increase" icon={<Layers className="w-5 h-5" />} color="slate" />
          </>
        )}
      </div>

      {/* Usage Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 14-Day Usage Trend */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Daily AI & API Consumption Trajectory
                <AIBadge />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">14-day aggregated platform load</p>
            </div>
            <Badge variant="purple">Real-Time Sync</Badge>
          </div>

          {overview && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={overview.dailyTrend}>
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatNumber(v), 'Units']} />
                <Area type="monotone" dataKey="aiCredits" stroke="#8b5cf6" fill="url(#aiGrad)" strokeWidth={2} name="AI Credits" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* AI Service Breakdown Pie Chart */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">AI Feature Distribution</h3>
          {overview && (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={overview.serviceBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="percent" paddingAngle={4}>
                    {overview.serviceBreakdown.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3">
                {overview.serviceBreakdown.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[170px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Tenant Usage & Quotas Table */}
      <Card padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tenant Usage & Quota Monitor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track individual college AI credits, storage, and API quotas</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Filter by college name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'normal', label: 'Normal' },
                { value: 'warning', label: 'Warning (75%+)' },
                { value: 'exceeded', label: 'Quota Exceeded' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-6">College / Tenant</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">AI Credits Used</th>
                <th className="py-3.5 px-4">Storage Used</th>
                <th className="py-3.5 px-4">Active Students</th>
                <th className="py-3.5 px-4">API Calls / Day</th>
                <th className="py-3.5 px-4">Quota Status</th>
                <th className="py-3.5 px-6 text-right">Quota Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4"><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : tenantUsageList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No tenants matching search criteria.</td>
                </tr>
              ) : (
                tenantUsageList.map((tenant) => {
                  const studentPercent = Math.round((tenant.studentsActive / tenant.studentsLimit) * 100);

                  return (
                    <tr key={tenant.collegeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{tenant.collegeName}</p>
                        <p className="text-xs text-slate-400">Code: <span className="font-mono">{tenant.collegeCode}</span> • Resumes: {formatNumber(tenant.resumesParsed)}</p>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={tenant.plan === 'enterprise' ? 'purple' : tenant.plan === 'professional' ? 'indigo' : 'slate'}>
                          {tenant.plan.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>{formatNumber(tenant.aiCreditsUsed)} / {formatNumber(tenant.aiCreditsLimit)}</span>
                            <span className="font-semibold">{tenant.aiUsagePercent}%</span>
                          </div>
                          <Progress
                            value={tenant.aiUsagePercent}
                            color={tenant.aiUsagePercent >= 90 ? 'red' : tenant.aiUsagePercent >= 75 ? 'amber' : 'ai'}
                            size="sm"
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4 w-36">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {tenant.storageUsedGB} GB / {tenant.storageLimitGB} GB
                        </div>
                        <Progress value={Math.round((tenant.storageUsedGB / tenant.storageLimitGB) * 100)} color="brand" size="sm" className="mt-1" />
                      </td>

                      <td className="py-4 px-4 w-36">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {formatNumber(tenant.studentsActive)} / {formatNumber(tenant.studentsLimit)}
                        </div>
                        <Progress value={studentPercent} color="green" size="sm" className="mt-1" />
                      </td>

                      <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {formatNumber(tenant.apiRequestsToday)}
                      </td>

                      <td className="py-4 px-4">
                        {tenant.status === 'exceeded' && <Badge variant="red" dot>Limit Exceeded</Badge>}
                        {tenant.status === 'warning' && <Badge variant="amber" dot>Approaching Limit</Badge>}
                        {tenant.status === 'normal' && <Badge variant="green" dot>Healthy</Badge>}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedTenant(tenant); setIsBonusModalOpen(true); }} leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                            Bonus Credits
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedTenant(tenant); setIsLogsModalOpen(true); }}>
                            Log Details
                          </Button>
                          <Button variant="ghost" size="sm" title="Reset Counter" onClick={() => { setSelectedTenant(tenant); setIsResetConfirmOpen(true); }}>
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
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
      </Card>

      {/* MODAL 1: Grant Bonus AI Credits */}
      {selectedTenant && (
        <Modal
          isOpen={isBonusModalOpen}
          onClose={() => setIsBonusModalOpen(false)}
          title={`Grant Bonus AI Credits — ${selectedTenant.collegeName}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsBonusModalOpen(false)}>Cancel</Button>
              <Button variant="ai" loading={actionLoading} onClick={handleGrantBonus}>
                Grant Credits Now
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-ai-50 dark:bg-ai-900/20 rounded-xl border border-ai-200 dark:border-ai-800 text-xs text-ai-800 dark:text-ai-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-ai-600 flex-shrink-0" />
              <span>Current Limit: <strong>{formatNumber(selectedTenant.aiCreditsLimit)}</strong> | Used: <strong>{formatNumber(selectedTenant.aiCreditsUsed)} ({selectedTenant.aiUsagePercent}%)</strong></span>
            </div>

            <Input
              label="Bonus AI Credits Amount"
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(Number(e.target.value))}
            />

            <Input
              label="Reason / Promotional Note"
              value={bonusReason}
              onChange={(e) => setBonusReason(e.target.value)}
              placeholder="e.g. Extension for Placement Drive Week"
            />
          </div>
        </Modal>
      )}

      {/* MODAL 2: View Granular Usage Log Details */}
      {selectedTenant && (
        <Modal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          title={`Granular Feature Usage Breakdown — ${selectedTenant.collegeName}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-500">Resumes Parsed</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(selectedTenant.resumesParsed)}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-500">Mock Interviews</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(selectedTenant.mockInterviews)}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-500">API Gateway Calls</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(selectedTenant.apiRequestsToday)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Service API Endpoint Distribution</h4>
              {[
                { endpoint: 'POST /v1/ai/resume-parse-ats', count: Math.round(selectedTenant.resumesParsed * 1.5), latency: '145ms', status: '200 OK' },
                { endpoint: 'POST /v1/ai/candidate-match', count: Math.round(selectedTenant.apiRequestsToday * 0.4), latency: '82ms', status: '200 OK' },
                { endpoint: 'POST /v1/ai/mock-interview-feedback', count: Math.round(selectedTenant.mockInterviews * 3), latency: '210ms', status: '200 OK' },
                { endpoint: 'GET /v1/ai/placement-officer-insights', count: 420, latency: '95ms', status: '200 OK' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-mono text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{log.endpoint}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{log.count} calls today • Latency: {log.latency}</p>
                  </div>
                  <Badge variant="green">{log.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Dialog for Reset Counter */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetCounter}
        title="Reset Monthly AI Usage Counter"
        message={`Are you sure you want to reset the AI credits used counter to 0 for ${selectedTenant?.collegeName}?`}
        confirmLabel="Reset Counter"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

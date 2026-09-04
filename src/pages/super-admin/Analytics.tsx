import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Award, DollarSign, Building2, Briefcase, Download,
  Filter, Calendar, Bot, CheckCircle, Zap, Layers, ArrowUpRight, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, Select, Skeleton, Modal, AIBadge } from '../../components/ui';
import { superAdminAnalyticsExtendedService } from '../../services';
import { formatNumber } from '../../utils';

export const SuperAdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf');
  const [exportLoading, setExportLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await superAdminAnalyticsExtendedService.getAnalyticsData(timeframe);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await superAdminAnalyticsExtendedService.exportAnalyticsReport(exportFormat);
      showToast(`Platform analytics report exported in ${exportFormat.toUpperCase()} format!`);
      setIsExportModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Platform SaaS Analytics & Benchmarking"
      subtitle="Comprehensive data insights on placement velocity, salary distribution, institution tiers, and AI impact"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Analytics' }]}
      actions={
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: '30d', label: 'Last 30 Days' },
              { value: 'q1', label: 'Q1 2025' },
              { value: 'q2', label: 'Q2 2025' },
              { value: 'ytd', label: 'YTD 2025' },
              { value: 'all', label: 'All Time' },
            ]}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-40"
          />

          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={() => setIsExportModalOpen(true)}>
            Export SaaS Report
          </Button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {loading || !data ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard title="Platform Placement Rate" value={`${data.overview.avgPlatformPlacementRate}%`} change="↑ 4.2% YoY" changeType="increase" icon={<TrendingUp className="w-5 h-5" />} color="green" />
            <StatCard title="Average Package" value={`₹${data.overview.avgPackageLPA} L`} change="Across all tenants" changeType="increase" icon={<DollarSign className="w-5 h-5" />} color="brand" />
            <StatCard title="Highest Package" value={`₹${data.overview.highestPackageLPA} L`} change="Record offer" changeType="increase" icon={<Award className="w-5 h-5" />} color="amber" />
            <StatCard title="Total Offers Issued" value={formatNumber(data.overview.totalOffersIssued)} change="↑ 18.5% MoM" changeType="increase" icon={<Briefcase className="w-5 h-5" />} color="purple" />
            <StatCard title="Active Recruiters" value={data.overview.recruiterPartnerCompanies} change="Onboarded MNCs/Startups" changeType="neutral" icon={<Building2 className="w-5 h-5" />} color="purple" />
            <StatCard title="AI Matching Accuracy" value={`${data.overview.aiMatchingAccuracyPercent}%`} change="Based on selections" changeType="increase" icon={<Zap className="w-5 h-5" />} color="purple" />
          </>
        )}
      </div>

      {/* Tier & Recruitment Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier-Wise Placement Comparison */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">College Tier Placement Velocity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Average placement rate & avg package by institution tier</p>
            </div>
            <Badge variant="indigo">Tier Benchmarking</Badge>
          </div>

          {data && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.tierWisePlacement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="tier" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="placementRate" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Placement %" />
                <Bar yAxisId="right" dataKey="avgPackage" fill="#10b981" radius={[4, 4, 0, 0]} name="Avg Package (LPA)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Global Recruitment Funnel */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Aggregate Platform Hiring Funnel</h3>
              <p className="text-xs text-slate-400 mt-0.5">Conversion rate across hiring pipeline stages</p>
            </div>
            <Badge variant="green">Conversion SLA</Badge>
          </div>

          <div className="space-y-3">
            {data && data.recruiterFunnel.map((item: any, i: number) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span>{item.stage}</span>
                  <span>{formatNumber(item.count)} ({item.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-ai-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Impact vs Traditional Benchmarks & Department Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Placement Leaderboard Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Department Placement Performance</h3>
            <Badge variant="slate">Cross-Tenant</Badge>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase">
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Students</th>
                <th className="py-2.5">Placed %</th>
                <th className="py-2.5">Avg Salary</th>
                <th className="py-2.5 text-right">Top Recruiter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data && data.departmentLeaderboard.map((dept: any) => (
                <tr key={dept.department} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{dept.department}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{dept.placedStudents} / {dept.totalStudents}</td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">{dept.placementPercent}%</td>
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">₹{dept.avgSalary} LPA</td>
                  <td className="py-3 text-right text-slate-600 dark:text-slate-400">{dept.topRecruiter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* AI Impact Benchmarking */}
        <Card className="p-6 border-ai-200 dark:border-ai-800/50">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ai-500 to-brand-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI Automation ROI Impact</h3>
              <AIBadge />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data && data.aiImpactComparison.map((item: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500">{item.metric}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{item.withAI}</span>
                  <span className="text-xs text-slate-400 line-through">{item.traditional}</span>
                </div>
                <Badge variant="green" className="mt-2 text-[10px]">{item.improvement}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-brand-900 to-ai-900 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">AI Match Score Predictive Value</p>
              <p className="text-xs text-slate-300">Candidates with match score &gt; 85% have a 91.2% interview selection rate.</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Export SaaS Report Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Super Admin Analytics Report"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={exportLoading} onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
              Download Report
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Select format to export full platform performance & SaaS benchmarking data for timeframe: <span className="font-semibold uppercase">{timeframe}</span>.
          </p>

          <Select
            label="Report Format"
            options={[
              { value: 'pdf', label: 'PDF Executive Brief' },
              { value: 'csv', label: 'Raw CSV Datasets' },
              { value: 'xlsx', label: 'Excel Workbook (.xlsx)' },
            ]}
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
          />
        </div>
      </Modal>
    </PageWrapper>
  );
};

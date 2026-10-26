import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Building2, Users, Briefcase, TrendingUp, DollarSign, Activity,
  CreditCard, AlertCircle, ArrowUpRight, MoreHorizontal, Globe
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Skeleton } from '../../components/ui';
import { analyticsService } from '../../services';
import { formatNumber } from '../../utils';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export const SuperAdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof analyticsService.getPlatformStats>> | null>(null);
  const [charts, setCharts] = useState<Awaited<ReturnType<typeof analyticsService.getPlatformCharts>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsService.getPlatformStats(), analyticsService.getPlatformCharts()])
      .then(([s, c]) => { setStats(s); setCharts(c); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper
      title="Platform Overview"
      subtitle="Real-time SaaS metrics"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Overview' }]}
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard title="Total Colleges" value={stats?.totalColleges || 0} icon={<Building2 className="w-5 h-5" />} color="brand" />
            <StatCard title="Total Students" value={formatNumber(stats?.totalStudents || 0)} icon={<Users className="w-5 h-5" />} color="green" />
            <StatCard title="Companies" value={stats?.totalCompanies || 0} icon={<Building2 className="w-5 h-5" />} color="purple" />
            <StatCard title="Active Jobs" value={stats?.activeJobs || 0} icon={<Briefcase className="w-5 h-5" />} color="amber" />
            <StatCard title="Placed Students" value={formatNumber(stats?.placedStudents || 0)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
            <StatCard title="MRR" value={`₹${formatNumber(stats?.mrr || 0)}`} icon={<DollarSign className="w-5 h-5" />} color="brand" />
          </>
        )}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, badge: 'green', badgeText: 'Healthy' },
          { label: 'Trial Colleges', value: stats?.trialColleges || 0, badge: 'amber', badgeText: 'Converting' },
          { label: 'Expiring Soon', value: stats?.expiringSubscriptions || 0, badge: 'red', badgeText: 'Action needed' },
          { label: 'AI Usage', value: `${stats?.aiUsagePercent || 0}%`, badge: 'purple', badgeText: 'AI Adoption' },
        ].map(item => (
          <Card key={item.label} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</p>
            </div>
            <Badge variant={item.badge as 'green'}>{item.badgeText}</Badge>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Monthly Recurring Revenue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Annual growth trajectory</p>
            </div>
            <Badge variant="green" dot>↑ 8.2% MoM</Badge>
          </div>
          {charts && (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [`₹${formatNumber(v)}`, 'MRR']} />
                <Area type="monotone" dataKey="mrr" stroke="#4f46e5" fill="url(#mrrGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Subscription Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6">Subscription Plans</h3>
          {charts && (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={charts.subscriptionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="count" paddingAngle={3}>
                    {charts.subscriptionDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {charts.subscriptionDistribution.map(item => (
                  <div key={item.plan} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-slate-600 dark:text-slate-400">{item.plan}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* College Growth */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">College & Student Growth</h3>
          </div>
          {charts && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.collegeGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="colleges" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Colleges" />
                <Bar yAxisId="right" dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Placements Over Time */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6">Placements Over Time</h3>
          {charts && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.placementsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="placed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Placed" />
                <Line type="monotone" dataKey="jobs" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Jobs" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

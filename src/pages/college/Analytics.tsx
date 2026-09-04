import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, FunnelChart, Funnel, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, Briefcase, Award, Filter } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Select, StatCard } from '../../components/ui';
import { analyticsService } from '../../services';
import { formatNumber } from '../../utils';
import { toast } from 'sonner';

const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export const CollegeAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof analyticsService.getCollegeAnalytics>> | null>(null);
  const [period, setPeriod] = useState('this_year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getCollegeAnalytics('college-1')
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [period]);

  const funnelData = [
    { name: 'Total Students', value: analytics?.totalStudents || 850, fill: '#4f46e5' },
    { name: 'Eligible', value: analytics?.eligibleStudents || 720, fill: '#8b5cf6' },
    { name: 'Applied', value: 580, fill: '#06b6d4' },
    { name: 'Shortlisted', value: 280, fill: '#f59e0b' },
    { name: 'Interviewed', value: 165, fill: '#10b981' },
  ];

  return (
    <PageWrapper
      title="Placement Analytics"
      subtitle="Comprehensive placement insights"
      breadcrumbs={[{ label: 'College' }, { label: 'Analytics' }]}
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: 'this_year', label: 'This Year' },
            ]}
            className="w-36"
          />
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.success('Report exported!')}>
            Export PDF
          </Button>
        </div>
      }
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" value={`${analytics?.totalStudents || 850}`} icon={<Users className="w-5 h-5" />} color="brand" />
        <StatCard title="Eligible Students" value={`${analytics?.eligibleStudents || 720}`} icon={<Users className="w-5 h-5" />} color="green" />
        <StatCard title="Selection Rate" value={`${analytics?.selectionRate || 29.8}%`} change="Industry avg: 18%" changeType="increase" icon={<Users className="w-5 h-5" />} color="purple" />
        <StatCard title="Highest Package" value={`₹${analytics?.highestPackage || 42}L`} icon={<Briefcase className="w-5 h-5" />} color="amber" />
      </div>

      {/* Monthly Trend */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Placement Trend</h3>
          <Badge variant="green" dot>Live</Badge>
        </div>
        {analytics && (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} name="Applications" />
              <Line type="monotone" dataKey="interviews" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Interviews" />
              <Line type="monotone" dataKey="placed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Placed" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dept Comparison */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6">Department Comparison</h3>
          {analytics && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.departmentWise}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="placed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Placed" />
                <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Salary Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6">Salary Distribution</h3>
          {analytics && (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={analytics.salaryDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="range" paddingAngle={2}>
                    {analytics.salaryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {analytics.salaryDistribution.map((item, i) => (
                  <div key={item.range} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.range}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Recruitment Funnel */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6">Recruitment Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-32 text-sm text-slate-600 dark:text-slate-400 text-right">{item.name}</div>
              <div className="flex-1">
                <div className="h-8 rounded-lg relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                    style={{ width: `${(item.value / funnelData[0].value) * 100}%`, background: item.fill }}
                  >
                    <span className="text-white text-xs font-semibold">{item.value}</span>
                  </div>
                </div>
              </div>
              <div className="w-16 text-xs text-slate-400 text-right">
                {Math.round((item.value / funnelData[0].value) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Recruiters Table */}
      <Card padding={false}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Top Recruiters</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Students Hired</th>
                <th>Avg Package</th>
                <th>Offer Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topRecruiters.slice(0, 8).map((rec, i) => (
                <tr key={rec.company}>
                  <td>
                    <span className={`font-bold text-sm ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-500' : i === 2 ? 'text-orange-600' : 'text-slate-400'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="font-medium text-slate-900 dark:text-slate-100">{rec.company}</td>
                  <td>{rec.hired}</td>
                  <td>₹{rec.avgPackage} LPA</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${85 + i * 2}%` }} />
                      </div>
                      <span className="text-xs">{85 + i * 2}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrapper>
  );
};

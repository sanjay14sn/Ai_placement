import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  GraduationCap, Briefcase, UserCheck, TrendingUp, Bot, Zap,
  Users, Target, Award, Bell, ChevronRight, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, AIBadge, Alert, Progress } from '../../components/ui';
import { analyticsService } from '../../services';
import { formatNumber } from '../../utils';
import { useAuthStore } from '../../store';

const DEPT_COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export const CollegeDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof analyticsService.getCollegeAnalytics>> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name.split(' ')[0] || 'Officer';

  useEffect(() => {
    analyticsService.getCollegeAnalytics('college-1')
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Students', value: analytics?.totalStudents || 0, icon: <GraduationCap className="w-4 h-4" />, color: 'brand' as const },
    { label: 'Eligible', value: analytics?.eligibleStudents || 0, icon: <Users className="w-4 h-4" />, color: 'blue' as const, color2: 'brand' as const },
    { label: 'Active Jobs', value: 42, icon: <Briefcase className="w-4 h-4" />, color: 'amber' as const },
    { label: 'Applications', value: analytics?.totalApplications || 0, icon: <Target className="w-4 h-4" />, color: 'purple' as const, color2: 'purple' as const },
    { label: 'Interviews', value: analytics?.totalInterviews || 0, icon: <UserCheck className="w-4 h-4" />, color: 'green' as const },
  ];

  const aiSummary = [
    { icon: '🏢', text: '3 new companies added to the platform today' },
    { icon: '✅', text: '126 students are eligible for 5 new jobs posted this week' },
    { icon: '⏳', text: '74 applications are pending review from your side' },
    { icon: '📅', text: '12 interviews are scheduled for tomorrow' },
    { icon: '⚠️', text: '5 students have incomplete profiles and may miss deadlines' },
    { icon: '🏆', text: 'CSE has the highest placement rate at 87% this year' },
  ];

  const pendingActions = [
    { label: 'Review 74 pending applications', priority: 'high', action: '/college/applications' },
    { label: 'Schedule interviews for Infosys shortlist', priority: 'high', action: '/college/interviews' },
    { label: '5 students with incomplete profiles need reminders', priority: 'medium', action: '/college/students' },
    { label: 'Razorpay drive registration closes in 2 days', priority: 'medium', action: '/college/drives' },
    { label: 'Export monthly placement report', priority: 'low', action: '/college/reports' },
  ];

  return (
    <PageWrapper
      title={`${greeting}, ${firstName} 👋`}
      subtitle="Here's your placement command center"
      breadcrumbs={[{ label: 'College' }, { label: 'Dashboard' }]}
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
              kpi.color === 'brand' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' :
              kpi.color === 'green' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
              kpi.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
              kpi.color === 'purple' ? 'bg-ai-50 text-ai-600 dark:bg-ai-900/30 dark:text-ai-400' :
              'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {kpi.icon}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{kpi.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Placement Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Placement Trend 2025</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly placements, applications, and interviews</p>
            </div>
            <Badge variant="green" dot>On Track</Badge>
          </div>
          {analytics && (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.monthlyTrend}>
                <defs>
                  <linearGradient id="placedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="applications" stroke="#4f46e5" fill="url(#appGrad)" strokeWidth={2} name="Applications" />
                <Area type="monotone" dataKey="placed" stroke="#10b981" fill="url(#placedGrad)" strokeWidth={2} name="Placed" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Department Placement */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Department Placement %</h3>
          {analytics && (
            <div className="space-y-3">
              {analytics.departmentWise.slice(0, 6).map((dept, i) => (
                <div key={dept.department}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{dept.department}</span>
                    <span className="text-xs text-slate-500">{Math.round((dept.placed / dept.total) * 100)}%</span>
                  </div>
                  <Progress
                    value={Math.round((dept.placed / dept.total) * 100)}
                    color={i === 0 ? 'green' : i < 3 ? 'brand' : 'amber'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Recruiters */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Top Recruiters</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/college/companies')}>View all</Button>
          </div>
          {analytics && (
            <div className="space-y-3">
              {analytics.topRecruiters.slice(0, 6).map((rec, i) => (
                <div key={rec.company} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-ai-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                      {rec.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{rec.company}</p>
                      <p className="text-xs text-slate-400">{rec.hired} hired · ₹{rec.avgPackage}L avg</p>
                    </div>
                  </div>
                  <Badge variant={i === 0 ? 'green' : 'slate'}>{i === 0 ? '🏆 Top' : `#${i + 1}`}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Salary Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Salary Distribution</h3>
          {analytics && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.salaryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="range" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Placement Officer Summary */}
        <Card className="p-6 border-ai-200 dark:border-ai-900/50">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ai-500 to-brand-500 rounded-2xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Today's AI Summary</h3>
                <AIBadge />
              </div>
            </div>
            <span className="text-xs text-slate-400">Updated 5 min ago</span>
          </div>

          <div className="space-y-2.5 mb-5">
            {aiSummary.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-base">{item.icon}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ai" className="flex-1" leftIcon={<Bot className="w-4 h-4" />} onClick={() => navigate('/college/ai-assistant')}>
              Ask AI
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/college/applications')}>
              View Actions
            </Button>
          </div>
        </Card>

        {/* Pending Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pending Actions</h3>
            <Badge variant="red">{pendingActions.length} items</Badge>
          </div>
          <div className="space-y-2.5">
            {pendingActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.action)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    action.priority === 'high' ? 'bg-red-500' :
                    action.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{action.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

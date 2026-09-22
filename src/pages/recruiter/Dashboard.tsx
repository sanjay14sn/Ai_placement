import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, UserCheck, TrendingUp, Star, Building2, Bot, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Button, Badge, AIBadge, Avatar, Progress, ProgressRing } from '../../components/ui';
import { analyticsService, jobService, recruiterService } from '../../services';
import { getMatchScoreRingColor } from '../../utils';

const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b'];

export const RecruiterDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    recruiterService.getDashboardData()
      .then(res => {
        setDashboardData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const topCandidates = dashboardData?.topCandidates || [];
  const activeJobPostings = dashboardData?.activeJobPostings || [];
  const funnel = dashboardData?.funnel || [];
  const kpiData = dashboardData?.kpis || {
    activeJobs: 0, totalApplicants: 0, eligibleCandidates: 0, shortlisted: 0, interviews: 0, offers: 0
  };

  const kpis = [
    { title: 'Active Jobs', value: kpiData.activeJobs, change: 'Live postings', changeType: 'neutral' as const, color: 'brand' as const },
    { title: 'Total Applicants', value: kpiData.totalApplicants, change: 'Total received', changeType: 'neutral' as const, color: 'purple' as const },
    { title: 'Eligible Candidates', value: kpiData.eligibleCandidates, change: 'AI filtered', changeType: 'neutral' as const, color: 'amber' as const },
    { title: 'Shortlisted', value: kpiData.shortlisted, change: 'Moved forward', changeType: 'increase' as const, color: 'green' as const },
    { title: 'Interviews', value: kpiData.interviews, change: 'Scheduled', changeType: 'increase' as const, color: 'brand' as const },
    { title: 'Offers', value: kpiData.offers, change: 'Selected', changeType: 'increase' as const, color: 'green' as const },
  ];

  const qualityData = [
    { month: 'Mar', avgScore: 72 }, { month: 'Apr', avgScore: 75 }, { month: 'May', avgScore: 78 },
    { month: 'Jun', avgScore: 76 }, { month: 'Jul', avgScore: 82 }, { month: 'Aug', avgScore: 85 },
  ];

  if (loading) {
    return (
      <PageWrapper title="Recruiter Dashboard" subtitle="Talent acquisition overview">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Recruiter Dashboard" subtitle="Talent acquisition overview"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Dashboard' }]}
      actions={<Button size="sm" leftIcon={<Briefcase className="w-4 h-4" />} onClick={() => navigate('/recruiter/jobs/create')}>Post New Job</Button>}
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpis.map(kpi => (
          <StatCard key={kpi.title} {...kpi} icon={<Users className="w-4 h-4" />} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Candidate Funnel */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Candidate Funnel</h3>
          {funnel.length > 0 ? (
            <div className="space-y-2.5">
              {funnel.map((stage: any, i: number) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-28 text-right">{stage.stage}</span>
                  <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${Math.max(stage.percent, 5)}%`, background: COLORS[i % COLORS.length] }}>
                      <span className="text-white text-xs font-bold">{stage.count}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-8">{stage.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No application data available yet.</div>
          )}
        </Card>

        {/* Candidate Quality Trend */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">AI Match Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avgScore" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} name="Avg AI Score" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Ranked Candidates */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI-Ranked Top Candidates</h3>
            <AIBadge />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/recruiter/candidates')}>View all candidates</Button>
        </div>
        <div className="space-y-3">
          {topCandidates.length > 0 ? topCandidates.map((candidate: any, i: number) => (
            <div key={candidate.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}>
              <span className="text-lg font-black text-slate-200 dark:text-slate-700 w-6 text-center">#{i + 1}</span>
              <Avatar name={candidate.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{candidate.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.department} · CGPA: {candidate.cgpa}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(candidate.skills || []).slice(0, 3).map((s: string) => <Badge key={s} variant="slate" className="text-[10px]">{s}</Badge>)}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ProgressRing value={candidate.matchScore} size={48} strokeWidth={4}
                  color={getMatchScoreRingColor(candidate.matchScore)}
                  label={`${candidate.matchScore}%`} />
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="primary" onClick={e => { e.stopPropagation(); }}>Shortlist</Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-slate-500 text-center py-4">No candidates have applied to your active jobs yet.</div>
          )}
        </div>
      </Card>

      {/* Active Jobs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Active Job Postings</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/recruiter/jobs')}>View all</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeJobPostings.length > 0 ? activeJobPostings.map((job: any) => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-300 transition-colors cursor-pointer"
              onClick={() => navigate(`/recruiter/jobs/${job.id}`)}>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{job.title}</p>
                <p className="text-xs text-slate-400">{job.applicants} applicants · {job.openings} openings</p>
              </div>
              <Badge variant="green">Active</Badge>
            </div>
          )) : (
            <div className="col-span-2 text-sm text-slate-500 text-center py-4">No active job postings found. Post a new job to start receiving applications.</div>
          )}
        </div>
      </Card>
    </PageWrapper>
  );
};

import React from 'react';
import { 
  TrendingUp, Users, Briefcase, Award, BarChart3, 
  PieChart, CheckCircle2, ArrowUpRight, Sparkles 
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Badge, ProgressRing } from '../../components/ui';

export const RecruiterAnalyticsPage: React.FC = () => {
  const pipelineFunnel = [
    { stage: 'Total Applications', count: 1450, percent: 100, color: 'bg-brand-600' },
    { stage: 'AI Match Qualified', count: 480, percent: 33, color: 'bg-indigo-600' },
    { stage: 'Assessment Passed', count: 210, percent: 14.5, color: 'bg-purple-600' },
    { stage: 'Technical Interviewed', count: 95, percent: 6.5, color: 'bg-blue-600' },
    { stage: 'Offers Accepted', count: 32, percent: 2.2, color: 'bg-emerald-600' },
  ];

  const deptMetrics = [
    { dept: 'Computer Science (CSE)', applicants: 620, shortlisted: 180, hired: 15, avgPkg: '14.2 LPA' },
    { dept: 'Information Tech (ISE)', applicants: 380, shortlisted: 110, hired: 9, avgPkg: '12.8 LPA' },
    { dept: 'Electronics & Comm (ECE)', applicants: 290, shortlisted: 75, hired: 5, avgPkg: '11.5 LPA' },
    { dept: 'Mechanical Engineering (ME)', applicants: 160, shortlisted: 30, hired: 3, avgPkg: '9.0 LPA' },
  ];

  return (
    <PageWrapper
      title="Recruitment Analytics & Insights"
      subtitle="Analyze hiring funnel conversion, applicant match distribution, and placement velocity"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Analytics' }]}
    >
      <div className="space-y-6">
        {/* KPI OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">1,450</div>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24% vs Last Drive
            </span>
          </Card>

          <Card className="p-5 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlist Yield Rate</div>
            <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">33.1%</div>
            <span className="text-xs text-slate-500 font-medium mt-1">Top Tier Matching</span>
          </Card>

          <Card className="p-5 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offers Extended</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">32 Hired</div>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 94% Acceptance Rate
            </span>
          </Card>

          <Card className="p-5 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time-To-Hire</div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">12 Days</div>
            <span className="text-xs text-slate-500 font-medium mt-1">Fast Campus Velocity</span>
          </Card>
        </div>

        {/* PIPELINE FUNNEL AND DEPT BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Conversion */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              Candidate Hiring Funnel
            </h3>

            <div className="space-y-4">
              {pipelineFunnel.map((item) => (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{item.stage}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Department Breakdown */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-600" />
              Department Wise Performance
            </h3>

            <div className="space-y-3">
              {deptMetrics.map((dept) => (
                <div 
                  key={dept.dept} 
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{dept.dept}</h4>
                    <p className="text-slate-500 mt-0.5">{dept.applicants} Applicants · {dept.shortlisted} Shortlisted</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">{dept.hired} Hired</span>
                    <span className="text-slate-400 text-[10px]">Avg {dept.avgPkg}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

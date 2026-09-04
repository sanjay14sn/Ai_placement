import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Award, TrendingUp, Target, Zap, Bot, ChevronRight, CheckCircle2, Globe } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, AIBadge, ProgressRing, Progress, Badge, Tabs } from '../../components/ui';
import { aiService } from '../../services';
import { getMatchScoreRingColor } from '../../utils';

export const StudentDashboard: React.FC = () => {
  const [readiness, setReadiness] = useState<Awaited<ReturnType<typeof aiService.getPlacementReadiness>> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    aiService.getPlacementReadiness('student-1').then(setReadiness);
  }, []);

  const radarData = readiness ? Object.entries(readiness.breakdown).map(([key, value]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value,
    fullMark: 100,
  })) : [];

  const recentActivity = [
    { text: 'Applied to Java Developer at Google India', time: '1 hr ago', type: 'application' },
    { text: 'Your application at Amazon India was shortlisted', time: '3 hr ago', type: 'success' },
    { text: 'Technical interview scheduled for tomorrow at 10:30 AM', time: '5 hr ago', type: 'interview' },
    { text: 'Resume score improved to 82/100 after update', time: '1 day ago', type: 'info' },
    { text: 'New job match: 94% fit with Flipkart SDE role', time: '1 day ago', type: 'ai' },
  ];

  return (
    <PageWrapper
      title="My Dashboard"
      subtitle="Your placement command center"
      breadcrumbs={[{ label: 'Student' }, { label: 'Dashboard' }]}
    >
      {/* Placement Readiness Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-ai-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing
            value={readiness?.overallScore || 83}
            size={100}
            strokeWidth={7}
            color="#fff"
            label={`${readiness?.overallScore || 83}%`}
            sublabel="Ready"
            labelColor="text-white"
          />
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <AIBadge label="AI Placement Score" className="bg-white/90 text-slate-950 font-extrabold shadow-sm px-3 py-1" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Placement Readiness: {readiness?.overallScore || 83}%</h2>
            <p className="text-brand-200 text-sm mb-4">You're in the top 25% of your batch! A few improvements can push you to 95%+.</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button variant="secondary" size="sm" className="bg-white text-brand-700 hover:bg-slate-100" onClick={() => navigate('/student/readiness')}>
                View Full Analysis
              </Button>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30" onClick={() => navigate('/student/ai-assistant')}>
                <Zap className="w-3.5 h-3.5 mr-1.5" />Ask AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL JOB PORTAL ACCOUNTS CARD */}
      <Card className="p-6 mb-6 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold border border-brand-200 dark:border-brand-900/60">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Job Portal Account Credentials</h3>
                <Badge variant="indigo" className="text-[10px]">4 of 6 Connected</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Linked accounts (LinkedIn, Indeed, Glassdoor) for automated campus recruitment application sync.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => navigate('/student/settings')}
          >
            Manage Credentials
          </Button>
        </div>

        {/* Professional Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { name: 'LinkedIn', connected: true },
            { name: 'Indeed', connected: true },
            { name: 'Glassdoor', connected: true },
            { name: 'Naukri.com', connected: true },
            { name: 'Unstop', connected: false },
            { name: 'Wellfound', connected: false },
          ].map(portal => (
            <div
              key={portal.name}
              onClick={() => navigate('/student/settings')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                portal.connected
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                  : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{portal.name}</span>
                <span className={`w-2 h-2 rounded-full ${portal.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>
              <span className={`text-[10px] block font-medium ${portal.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400 font-semibold'}`}>
                {portal.connected ? 'Connected' : 'Add Credentials'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Applied Jobs', value: 8, change: '+3 this week', color: 'text-brand-600' },
          { label: 'Shortlisted', value: 3, change: '37.5% rate', color: 'text-emerald-600' },
          { label: 'Interviews', value: 2, change: 'Next: Tomorrow', color: 'text-amber-600' },
          { label: 'Job Matches', value: 34, change: '6 new today', color: 'text-ai-600' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4 text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{kpi.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{kpi.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Application Pipeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Application Pipeline</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/applications')}>View all</Button>
          </div>
          <div className="space-y-3">
            {[
              { stage: 'Applied', count: 8, color: 'bg-brand-500', percent: 100 },
              { stage: 'Under Review', count: 6, color: 'bg-amber-500', percent: 75 },
              { stage: 'Shortlisted', count: 3, color: 'bg-ai-500', percent: 37.5 },
              { stage: 'Interview', count: 2, color: 'bg-blue-500', percent: 25 },
              { stage: 'Selected', count: 1, color: 'bg-emerald-500', percent: 12.5 },
            ].map(stage => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-24">{stage.stage}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                  <div className={`h-full ${stage.color} rounded-full transition-all duration-700`} style={{ width: `${stage.percent}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-4">{stage.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills Radar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Readiness Breakdown</h3>
            <AIBadge />
          </div>
          {radarData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === 'success' ? 'bg-emerald-500' :
                  item.type === 'interview' ? 'bg-brand-500' :
                  item.type === 'ai' ? 'bg-ai-500' :
                  'bg-slate-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Browse AI-Matched Jobs', to: '/student/jobs', emoji: '🎯' },
              { label: 'Update My Resume', to: '/student/resume', emoji: '📄' },
              { label: 'Practice Interviews', to: '/student/interview-prep', emoji: '🎤' },
              { label: 'Talk to AI Assistant', to: '/student/ai-assistant', emoji: '🤖' },
              { label: 'Connect Job Portals (LinkedIn, Indeed)', to: '/student/settings', emoji: '🔗' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Connected Job Portals Banner */}
      <Card className="p-6 mt-6 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-base text-white">Job Portal Profiles & Credentials Sync</h3>
              <Badge variant="indigo" className="text-[10px] ml-2">4/6 Connected</Badge>
            </div>
            <p className="text-xs text-slate-300">
              Connect your <strong>LinkedIn</strong>, <strong>Indeed</strong>, <strong>Glassdoor</strong>, and <strong>Naukri</strong> IDs to enable 1-click campus job applications and resume auto-sync.
            </p>
          </div>

          <Button
            size="sm"
            className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs whitespace-nowrap"
            onClick={() => navigate('/student/settings')}
          >
            Manage Portals & Passwords
          </Button>
        </div>

        {/* Portal Pills Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          {[
            { name: 'LinkedIn', connected: true, id: 'arjun.sharma@rvce.edu.in' },
            { name: 'Indeed', connected: true, id: 'arjun.sharma@gmail.com' },
            { name: 'Glassdoor', connected: true, id: 'arjun_sharma_rv' },
            { name: 'Naukri.com', connected: true, id: 'arjun.sharma@rvce.edu.in' },
            { name: 'Unstop', connected: false, id: 'Not Connected' },
            { name: 'Wellfound', connected: false, id: 'Not Connected' },
          ].map(p => (
            <div
              key={p.name}
              onClick={() => navigate('/student/settings')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                p.connected
                  ? 'bg-slate-800/80 border-slate-700 hover:border-brand-500'
                  : 'bg-amber-950/30 border-amber-800/60 hover:border-amber-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-white">{p.name}</span>
                <span className={`w-2 h-2 rounded-full ${p.connected ? 'bg-emerald-400' : 'bg-amber-500'}`} />
              </div>
              <p className={`text-[10px] truncate mt-0.5 ${p.connected ? 'text-slate-400' : 'text-amber-400 font-semibold'}`}>
                {p.connected ? 'Connected ✅' : 'Connect Now ⚠️'}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </PageWrapper>
  );
};

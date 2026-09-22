import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Award, TrendingUp, Target, Zap, Bot, ChevronRight, CheckCircle2, Globe, FileText, Mic, Link2, Sparkles, Megaphone, Bell } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, AIBadge, ProgressRing, Progress, Badge, Tabs } from '../../components/ui';
import { aiService, studentService } from '../../services';
import { getMatchScoreRingColor } from '../../utils';
import { announcementService } from '../../services';
import type { NewsArticle } from '../../types';

export const StudentDashboard: React.FC = () => {
  const [readiness, setReadiness] = useState<Awaited<ReturnType<typeof aiService.getPlacementReadiness>> | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<NewsArticle[]>([]);
  const pinnedAnnouncement = announcements.find(a => a.isPinned);

  useEffect(() => {
    aiService.getPlacementReadiness().then(setReadiness);
    studentService.getDashboardData()
      .then(setDashboardData)
      .finally(() => setIsLoading(false));
      
    announcementService.getAll()
      .then(data => {
        setAnnouncements(data.slice(0, 5)); // Just take top 5 recent for dashboard feed
      })
      .catch(() => {});
  }, []);

  const radarData = readiness ? Object.entries(readiness.breakdown).map(([key, value]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value,
    fullMark: 100,
  })) : [];

  if (isLoading) {
    return (
      <PageWrapper title="My Dashboard" subtitle="Loading dashboard...">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  const kpis = dashboardData?.kpis || { appliedJobs: 0, shortlisted: 0, interviews: 0, jobMatches: 0 };
  const pipeline = dashboardData?.pipeline || [];
  
  // Combine activity from backend with newsroom announcements
  const backendActivity = dashboardData?.recentActivity || [];
  const newsActivity = announcements.filter(a => !a.isPinned).slice(0, 3).map(a => ({
    text: a.title,
    time: a.publishedAt,
    type: 'announcement',
    category: a.category
  }));
  
  const recentActivity = [...newsActivity, ...backendActivity];
  const portals = dashboardData?.portals || [];
  const connectedPortalsCount = portals.filter((p: any) => p.connected).length;
  const totalPortalsCount = portals.length || 6;

  return (
    <PageWrapper
      title="My Dashboard"
      breadcrumbs={[{ label: 'Student' }, { label: 'Dashboard' }]}
    >
      {/* Placement Readiness Hero */}
      {/* ── Placement Readiness Hero — Cut-Corner Gradient Card ─────────── */}
      <div className="relative mb-6 text-white overflow-hidden shadow-2xl" style={{ borderRadius: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #1d4ed8 75%, #0c4a6e 100%)' }}>
        {/* Decorative glow blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.3), transparent 70%)', transform: 'translate(-30%, -40%)' }} />
        <div className="absolute bottom-0 right-[30%] w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%)', transform: 'translateY(40%)' }} />
        {/* Dot pattern texture */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* Cut-corner accent panel on the right */}
        <div className="absolute top-0 right-0 h-full w-64 pointer-events-none" style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.06) 100%)', clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
        {/* Extra diagonal slice */}
        <div className="absolute top-0 right-0 h-full w-40 pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)', clipPath: 'polygon(60% 0%, 100% 0%, 100% 100%, 20% 100%)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-0">
          {/* Left: Text info */}
          <div className="flex-1 p-6 sm:p-8 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
              <AIBadge label="AI Placement Score" className="bg-white/95 text-slate-950 font-extrabold shadow-sm px-3 py-1" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight leading-tight">
              Placement Readiness
              <span className="block text-violet-300 text-4xl font-black">{readiness?.overallScore || 91}%</span>
            </h2>
            <p className="text-indigo-200 text-sm mb-5 max-w-sm">You're in the top 25% of your batch! A few improvements can push you to 95%+.</p>
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              <Button variant="secondary" size="sm" className="bg-white text-indigo-700 hover:bg-slate-100 font-bold shadow-md" onClick={() => navigate('/student/readiness')}>
                View Full Analysis
              </Button>
              <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md" onClick={() => navigate('/student/ai-assistant')}>
                <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-300" />Ask AI
              </Button>
            </div>
          </div>

          {/* Right: Progress ring in accent cut panel */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 sm:w-56 shrink-0 border-t border-white/10 sm:border-t-0 sm:border-l sm:border-white/10">
            <div className="relative">
              <ProgressRing
                value={readiness?.overallScore || 91}
                size={110}
                strokeWidth={9}
                color="#a78bfa"
                label={`${readiness?.overallScore || 91}%`}
                sublabel="Ready"
                labelColor="text-white font-black"
              />
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
            </div>
            <p className="text-xs font-semibold text-indigo-200 mt-3 uppercase tracking-widest">AI Score</p>
          </div>
        </div>
      </div>

      {/* Pinned Announcement Alert (if any) */}
      {pinnedAnnouncement && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900/50 shadow-sm cursor-pointer hover:border-amber-300 dark:hover:border-amber-800 transition-all" onClick={() => navigate('/student/announcements')}>
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
              <Megaphone className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">{pinnedAnnouncement.category}</Badge>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{pinnedAnnouncement.publishedAt}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">{pinnedAnnouncement.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{pinnedAnnouncement.summary}</p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50">
              Read <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}


      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Applied Jobs', value: kpis.appliedJobs, change: 'Total applications', color: 'text-brand-600' },
          { label: 'Shortlisted', value: kpis.shortlisted, change: kpis.appliedJobs > 0 ? `${Math.round((kpis.shortlisted / kpis.appliedJobs) * 100)}% rate` : '0% rate', color: 'text-emerald-600' },
          { label: 'Interviews', value: kpis.interviews, change: 'Scheduled / pending', color: 'text-amber-600' },
          { label: 'Job Matches', value: kpis.jobMatches, change: 'Based on your skills', color: 'text-ai-600' },
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
            {pipeline.map((stage: any) => (
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
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Activity & Announcements</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === 'success' ? 'bg-emerald-500' :
                  item.type === 'interview' ? 'bg-brand-500' :
                  item.type === 'announcement' ? 'bg-amber-500' :
                  item.type === 'ai' ? 'bg-ai-500' :
                  'bg-slate-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.type === 'announcement' && <span className="font-medium text-amber-600 dark:text-amber-500 mr-1">{item.category} •</span>}
                    {item.time}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                No recent activity to show. Start applying for jobs!
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Quick Actions
            </h3>
            <AIBadge />
          </div>
          <div className="space-y-2.5">
            {[
              {
                label: 'Browse AI-Matched Jobs',
                to: '/student/jobs',
                icon: Target,
                gradient: 'from-indigo-500 via-brand-500 to-ai-600',
                shadow: 'shadow-indigo-500/25',
                badge: '98% Match'
              },
              {
                label: 'Update My Resume',
                to: '/student/resume',
                icon: FileText,
                gradient: 'from-blue-500 to-cyan-600',
                shadow: 'shadow-blue-500/25',
                badge: 'ATS Optimizing'
              },
              {
                label: 'Practice Interviews',
                to: '/student/interview-prep',
                icon: Mic,
                gradient: 'from-purple-500 to-pink-600',
                shadow: 'shadow-purple-500/25',
                badge: 'AI Mock'
              },
              {
                label: 'Talk to AI Assistant',
                to: '/student/ai-assistant',
                icon: Bot,
                gradient: 'from-emerald-500 to-teal-600',
                shadow: 'shadow-emerald-500/25',
                badge: '24/7 Active'
              },
              {
                label: 'Connect Job Portals',
                to: '/student/settings',
                icon: Link2,
                gradient: 'from-amber-500 to-orange-600',
                shadow: 'shadow-amber-500/25',
                badge: '4/6 Linked'
              },
            ].map(action => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-200 group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} text-white flex items-center justify-center shadow-md ${action.shadow} group-hover:scale-110 transition-transform duration-200 ring-2 ring-white/20 dark:ring-slate-900/40 shrink-0`}>
                      <IconComponent className="w-5 h-5 drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {action.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-full hidden sm:inline-block">
                      {action.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>


    </PageWrapper>
  );
};

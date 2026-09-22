import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, Users, Award, Building, Briefcase, FileText, CheckCircle, ChevronRight, BarChart2 } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Skeleton, Badge } from '../../components/ui';
import { analyticsService } from '../../services';
import { useAuthStore } from '../../store';
import type { CollegeAnalytics } from '../../types';

export const CollegeReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<CollegeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const analytics = await analyticsService.getCollegeAnalytics(user?.tenantId || '');
        setData(analytics);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.tenantId]);

  const handleExport = () => {
    // Placeholder for PDF export
    alert("Export functionality would trigger a PDF download of these reports.");
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  if (loading) {
    return (
      <PageWrapper title="Reports" breadcrumbs={[{ label: 'College' }, { label: 'Reports' }]}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-32"><Skeleton className="h-full w-full rounded-2xl" /></Card>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-80"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          <Card className="h-80"><Skeleton className="h-full w-full rounded-2xl" /></Card>
        </div>
      </PageWrapper>
    );
  }

  const safeData = data || {
    placementPercent: 0, totalStudents: 0, placedStudents: 0, avgPackage: 0, highestPackage: 0,
    departmentWise: [], topRecruiters: [], salaryDistribution: [],
    monthlyTrend: []
  };

  const { salaryDistribution } = safeData;
  
  // Safely extract counts from the array
  const getCount = (rangeKeyword: string) => {
    if (!Array.isArray(salaryDistribution)) return 0;
    const item = salaryDistribution.find(s => s.range.includes(rangeKeyword));
    return item ? item.count : 0;
  };

  const below5 = getCount('< 5');
  const between5and10 = getCount('5 - 10');
  const above10 = getCount('> 10');

  const totalSalaries = below5 + between5and10 + above10 || 1;
  
  const sDist = {
    low: (below5 / totalSalaries) * 100,
    mid: (between5and10 / totalSalaries) * 100,
    high: (above10 / totalSalaries) * 100,
  };

  return (
    <PageWrapper
      title="Placement Reports"
      subtitle="Comprehensive analytics and performance metrics"
      breadcrumbs={[{ label: 'College' }, { label: 'Reports' }]}
      actions={
        <Button size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport} variant="outline" className="bg-white dark:bg-slate-800">
          Export PDF
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 flex flex-col justify-between group hover:shadow-elevated transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-50 dark:bg-brand-900/10 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <Badge variant="blue" className="bg-white/50 backdrop-blur">+12% YoY</Badge>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Placement Rate</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{safeData.placementPercent}%</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between group hover:shadow-elevated transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Placed</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {safeData.placedStudents} <span className="text-lg text-slate-400 font-semibold">/ {safeData.totalStudents}</span>
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between group hover:shadow-elevated transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Highest Package</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(safeData.highestPackage)}</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between group hover:shadow-elevated transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Average Package</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(safeData.avgPackage)}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-500" /> Department Performance
            </h3>
          </div>
          <div className="space-y-5">
            {safeData.departmentWise?.length > 0 ? safeData.departmentWise.map((dept, i) => {
              const pct = dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-brand-600 transition-colors">{dept.department}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{pct}% ({dept.placed}/{dept.total})</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                    <div className="bg-brand-500 rounded-full h-full transition-all duration-1000 ease-out relative" style={{ width: `${pct}%` }}>
                      <div className="absolute inset-0 bg-white/20 dark:bg-black/10 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' }}></div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500 text-sm">No department data available.</div>
            )}
          </div>
        </Card>

        {/* Top Recruiters */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-500" /> Top Recruiters
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeData.topRecruiters?.length > 0 ? safeData.topRecruiters.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  {rec.company.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{rec.company}</h4>
                  <p className="text-xs text-slate-500 truncate">{rec.hired} Hired · {formatCurrency(rec.avgPackage)} Avg</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-slate-500 text-sm">No recruiter data available.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Salary Distribution */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" /> Salary Distribution
            </h3>
          </div>
          
          <div className="mb-6">
            <div className="w-full h-6 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 shadow-inner">
              <div className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-1000" style={{ width: `${sDist.low}%` }}></div>
              <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${sDist.mid}%` }}></div>
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${sDist.high}%` }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <div className="w-3 h-3 rounded-full bg-slate-400 mx-auto mb-2"></div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">&lt; 5 LPA</p>
              <p className="font-bold text-slate-900 dark:text-white">{below5} Offers</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30">
              <div className="w-3 h-3 rounded-full bg-brand-500 mx-auto mb-2"></div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">5 - 10 LPA</p>
              <p className="font-bold text-slate-900 dark:text-white">{between5and10} Offers</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2"></div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">&gt; 10 LPA</p>
              <p className="font-bold text-slate-900 dark:text-white">{above10} Offers</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Generated Reports</h3>
          <div className="space-y-3">
            {[
              { title: 'Placement Summary 2026', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { title: 'Department Wise Analysis', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { title: 'Top Recruiters List', icon: Building, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { title: 'Offer Acceptance Metrics', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map((report, i) => (
              <button key={i} onClick={handleExport} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-800/10 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${report.bg} ${report.color} flex items-center justify-center`}>
                    <report.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 transition-colors text-left">{report.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Skeleton } from '../../components/ui';
import { collegeService, analyticsService } from '../../services';
import { Building2, Mail, Phone, ArrowLeft, Users, TrendingUp, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatNumber } from '../../utils';
import type { College, CollegeAnalytics } from '../../types';

export const SuperAdminCollegeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [college, setCollege] = useState<College | null>(null);
  const [analytics, setAnalytics] = useState<CollegeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [collegeRes, analyticsRes] = await Promise.all([
          collegeService.getById(id),
          analyticsService.getCollegeAnalytics(id),
        ]);
        setCollege(collegeRes);
        setAnalytics(analyticsRes);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load college details');
        navigate('/super-admin/colleges');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const getPlanBadge = (p: string) => {
    switch (p) {
      case 'enterprise': return <Badge variant="purple">Enterprise</Badge>;
      case 'professional': return <Badge variant="indigo">Professional</Badge>;
      case 'starter': return <Badge variant="slate">Starter</Badge>;
      default: return <Badge variant="slate">{p}</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'active': return <Badge variant="green">Active</Badge>;
      case 'trial': return <Badge variant="blue">Trial</Badge>;
      case 'expired': return <Badge variant="red">Expired</Badge>;
      default: return <Badge variant="slate">{s}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageWrapper title="College Details" breadcrumbs={[{ label: 'Super Admin' }, { label: 'Colleges', to: '/super-admin/colleges' }, { label: 'Details' }]}>
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (!college) return null;

  return (
    <PageWrapper
      title={college.name}
      subtitle="College Profile & Analytics Overview"
      breadcrumbs={[
        { label: 'Super Admin' },
        { label: 'Colleges', to: '/super-admin/colleges' },
        { label: college.code || 'Details' }
      ]}
      actions={
        <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/super-admin/colleges')}>
          Back to Colleges
        </Button>
      }
    >
      <div className="space-y-6">
        <Card className="p-6 md:p-8 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/20 flex items-center justify-center text-brand-600 font-bold text-3xl md:text-4xl shadow-sm border border-brand-200/50 dark:border-brand-700/30">
              {college.code || college.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{college.name}</h2>
                {getPlanBadge(college.subscription.plan)}
                {getStatusBadge(college.subscription.status)}
                {!college.isActive && <Badge variant="red">Suspended</Badge>}
              </div>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4" /> {college.city}{college.state ? `, ${college.state}` : ''} 
                {college.establishedYear ? ` · Established ${college.establishedYear}` : ''}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 inline-flex">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span><strong className="text-slate-700 dark:text-slate-300">TPO:</strong> {college.tpoName}</span>
                </div>
                <a href={`mailto:${college.tpoEmail}`} className="text-brand-600 hover:underline">{college.tpoEmail}</a>
                {college.tpoPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{college.tpoPhone}</span>
                  </div>
                )}
                <div><strong className="text-slate-700 dark:text-slate-300">Joined:</strong> {formatDate(college.createdAt)}</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Usage */}
          <Card className="p-6 lg:col-span-1 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              Subscription Usage
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Students Active</span>
                  <span className="text-slate-500 font-semibold">{formatNumber(college.subscription.studentsUsed)} <span className="text-slate-400 font-normal">/ {formatNumber(college.subscription.studentsLimit)}</span></span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${college.subscription.studentsUsed / college.subscription.studentsLimit > 0.9 ? 'bg-red-500' : 'bg-brand-500'}`} 
                    style={{ width: `${Math.min(100, (college.subscription.studentsUsed / college.subscription.studentsLimit) * 100)}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">AI Credits Used</span>
                  <span className="text-slate-500 font-semibold">{formatNumber(college.subscription.aiCreditsUsed)} <span className="text-slate-400 font-normal">/ {formatNumber(college.subscription.aiCreditsLimit)}</span></span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${college.subscription.aiCreditsUsed / college.subscription.aiCreditsLimit > 0.9 ? 'bg-red-500' : 'bg-purple-500'}`} 
                    style={{ width: `${Math.min(100, (college.subscription.aiCreditsUsed / college.subscription.aiCreditsLimit) * 100)}%` }} 
                  />
                </div>
              </div>
              
              {college.subscription.expiresAt && (
                <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700 text-sm flex justify-between">
                  <span className="text-slate-500">Renewal Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(college.subscription.expiresAt)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Placement Analytics Summary */}
          <Card className="p-6 lg:col-span-2 border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Real-time Placement Analytics</h3>
            
            {analytics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                  <div className="text-emerald-600 dark:text-emerald-400 mb-2"><TrendingUp className="w-5 h-5" /></div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.placementPercent}%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Placement Rate</div>
                </div>
                
                <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-2xl border border-brand-100 dark:border-brand-800/30">
                  <div className="text-brand-600 dark:text-brand-400 mb-2"><Users className="w-5 h-5" /></div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(analytics.placedStudents)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Students Placed</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                  <div className="text-purple-600 dark:text-purple-400 mb-2"><Briefcase className="w-5 h-5" /></div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{(analytics.avgPackage / 100000).toFixed(1)}L</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average Package</div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                  <div className="text-amber-600 dark:text-amber-400 mb-2"><Briefcase className="w-5 h-5" /></div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{(analytics.highestPackage / 100000).toFixed(1)}L</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Highest Package</div>
                </div>
                
                <div className="col-span-2 md:col-span-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-8">
                  <div>
                    <span className="block text-xs text-slate-500">Total Registered</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(analytics.totalStudents)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Total Applications</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(analytics.totalApplications)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Total Interviews</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(analytics.totalInterviews)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-slate-500">No analytics data available for this college.</div>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

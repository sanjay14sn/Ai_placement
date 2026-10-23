import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Skeleton, Input, Select, Modal } from '../../components/ui';
import { collegeService, analyticsService } from '../../services';
import { Building2, Mail, Phone, ArrowLeft, Users, TrendingUp, Briefcase, Search, Trash2, ShieldAlert, GraduationCap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatNumber } from '../../utils';
import type { College, CollegeAnalytics, Student } from '../../types';

export const SuperAdminCollegeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [college, setCollege] = useState<College | null>(null);
  const [analytics, setAnalytics] = useState<CollegeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [collegeRes, analyticsRes] = await Promise.all([
          collegeService.getById(id),
          analyticsService.getCollegeAnalytics(id).catch(() => null),
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

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        setStudents(await collegeService.getStudents(id));
      } catch {
        setStudents([]);
        toast.error('Failed to load registered students');
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchData();
    fetchStudents();
  }, [id, navigate]);

  const departments = useMemo(
    () => Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter(s => {
      if (deptFilter && s.department !== deptFilter) return false;
      if (statusFilter && s.placementStatus !== statusFilter) return false;
      if (!q) return true;
      return [s.name, s.email, s.studentId, s.department].some(v => v?.toLowerCase().includes(q));
    });
  }, [students, studentSearch, deptFilter, statusFilter]);

  const placedCount = students.filter(s => s.placementStatus === 'placed').length;

  const placementBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'green' | 'amber' | 'red' | 'slate' }> = {
      placed: { label: 'Placed', variant: 'green' },
      not_placed: { label: 'Seeking', variant: 'amber' },
      not_eligible: { label: 'Not Eligible', variant: 'red' },
      opted_out: { label: 'Opted Out', variant: 'slate' },
    };
    const b = map[status] || { label: status || '—', variant: 'slate' as const };
    return <Badge variant={b.variant}>{b.label}</Badge>;
  };

  const handleDelete = async () => {
    if (!college) return;
    setDeleting(true);
    try {
      const result = await collegeService.delete(college.id, college.isActive);
      if (result === 'deleted') {
        toast.success(`${college.name} deleted`);
      } else {
        toast.success(`${college.name} removed from dashboard`, {
          description: 'Suspended on the server (logins disabled). Permanent deletion needs the backend DELETE endpoint.',
        });
      }
      navigate('/super-admin/colleges');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete college');
    } finally {
      setDeleting(false);
    }
  };

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
        <div className="flex items-center gap-2">
          {college && (
            <Button
              variant={college.isActive ? 'outline' : 'primary'}
              size="sm"
              onClick={async () => {
                try {
                  const res = await collegeService.toggleStatus(college.id);
                  const newStatus = typeof res?.isActive === 'boolean' ? res.isActive : !college.isActive;
                  setCollege(prev => prev ? { ...prev, isActive: newStatus } : null);
                  toast.success(newStatus ? '🎉 College activated successfully' : '⚠️ College suspended successfully');
                } catch {
                  toast.error('Failed to toggle status');
                }
              }}
            >
              {college.isActive ? 'Suspend College' : 'Activate College'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800/50 dark:hover:bg-red-900/20"
            onClick={() => setShowDelete(true)}
          >
            Delete
          </Button>
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/super-admin/colleges')}>
            Back to Colleges
          </Button>
        </div>
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
                {college.code && <Badge variant="indigo">College code {college.code}</Badge>}
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
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/30">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-brand-600 shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered Students</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {studentsLoading ? '…' : formatNumber(students.length)}
                  </div>
                </div>
                {!studentsLoading && students.length > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Placed</div>
                    <div className="text-sm font-semibold text-emerald-600">{placedCount}</div>
                  </div>
                )}
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

        {/* Registered Students Roster */}
        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" /> Registered Students
                <Badge variant="indigo">{studentsLoading ? '…' : students.length}</Badge>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Students who signed up with college code {college.code}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:w-auto w-full">
              <div className="sm:w-64">
                <Input
                  placeholder="Search name, USN, email…"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                placeholder="All Departments"
                options={departments.map(d => ({ value: d, label: d }))}
                className="sm:w-48"
              />
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                placeholder="All Statuses"
                options={[
                  { value: 'placed', label: 'Placed' },
                  { value: 'not_placed', label: 'Seeking' },
                  { value: 'not_eligible', label: 'Not Eligible' },
                  { value: 'opted_out', label: 'Opted Out' },
                ]}
                className="sm:w-40"
              />
            </div>
          </div>

          {studentsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {students.length === 0 ? 'No students registered yet' : 'No students match your filters'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {students.length === 0
                  ? `Students appear here once they register using college code ${college.code}.`
                  : 'Try a different search or filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Roll No / USN</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Degree · Batch</th>
                    <th className="px-4 py-3 font-semibold">CGPA</th>
                    <th className="px-4 py-3 font-semibold">KYC</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                              {s.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate">{s.name}</div>
                            <div className="text-xs text-slate-500 truncate">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{s.studentId || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[220px] truncate" title={s.department}>{s.department || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.degree || '—'} · {s.batch || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{typeof s.cgpa === 'number' ? s.cgpa.toFixed(2) : '—'}</td>
                      <td className="px-4 py-3">
                        {s.aadharNumber || s.aadharCard?.fileUrl ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><ShieldCheck className="w-3.5 h-3.5" /> Submitted</span>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{placementBadge(s.placementStatus)}</td>
                      <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">{(s as any).createdAt ? formatDate((s as any).createdAt) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={showDelete} onClose={() => !deleting && setShowDelete(false)} title="Delete college" size="sm">
        <div className="space-y-4">
          <div className="flex gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Permanently delete <strong>{college.name}</strong> ({college.code})? It has <strong>{students.length}</strong> registered student(s). This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDelete(false)} disabled={deleting}>Cancel</Button>
            <Button variant="primary" loading={deleting} onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />} className="bg-red-600 hover:bg-red-700 text-white">
              Delete College
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

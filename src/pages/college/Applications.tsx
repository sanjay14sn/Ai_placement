import React, { useEffect, useState } from 'react';
import { Search, Filter, Check, X, RefreshCw, Layers, CalendarPlus, CalendarCheck, ShieldAlert } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, ProgressRing, Pagination, EmptyState, Skeleton, AIBadge, Modal } from '../../components/ui';
import { applicationService, interviewService } from '../../services';
import { getMatchScoreRingColor, formatDate, formatTime } from '../../utils';
import { toast } from 'sonner';
import type { Application, Interview } from '../../types';

const emptyInterviewForm = {
  date: '',
  time: '',
  round: '1',
  type: 'technical' as Interview['type'],
  mode: 'video' as Interview['mode'],
  meetingLink: '',
  venue: '',
};

export const CollegeApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchParams] = useSearchParams();
  const [jobId, setJobId] = useState(searchParams.get('jobId') || '');
  const navigate = useNavigate();
  const [interviewsByApp, setInterviewsByApp] = useState<Record<string, Interview>>({});
  const [scheduleFor, setScheduleFor] = useState<Application | null>(null);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const LIMIT = 10;

  const fetchScheduledInterviews = async () => {
    try {
      const res = await interviewService.getAll({ page: 1, limit: 100 });
      const map: Record<string, Interview> = {};
      res.data
        .filter(i => i.applicationId && ['scheduled', 'confirmed'].includes(i.status))
        .forEach(i => { map[i.applicationId] = i; });
      setInterviewsByApp(map);
    } catch {
      setInterviewsByApp({});
    }
  };

  useEffect(() => { fetchScheduledInterviews(); }, []);

  const openSchedule = (app: Application) => {
    setScheduleFor(app);
    setInterviewForm(emptyInterviewForm);
    setConflictWarning(null);
  };

  const updateInterviewForm = async (patch: Partial<typeof emptyInterviewForm>) => {
    const next = { ...interviewForm, ...patch };
    setInterviewForm(next);
    if (scheduleFor && next.date && next.time && ('date' in patch || 'time' in patch)) {
      try {
        const res = await interviewService.checkConflicts(scheduleFor.student.id, next.date, next.time);
        setConflictWarning(res.hasConflict ? `${scheduleFor.student.name} already has an interview at this time.` : null);
      } catch {
        setConflictWarning(null);
      }
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFor) return;
    if (!interviewForm.date || !interviewForm.time) {
      toast.error('Choose a date and time');
      return;
    }
    setScheduling(true);
    try {
      await interviewService.schedule({
        applicationId: scheduleFor.id,
        studentId: scheduleFor.student.id,
        student: scheduleFor.student,
        company: scheduleFor.company,
        date: interviewForm.date,
        time: interviewForm.time,
        round: parseInt(interviewForm.round, 10),
        type: interviewForm.type,
        mode: interviewForm.mode,
        meetingLink: interviewForm.mode === 'video' ? interviewForm.meetingLink.trim() || undefined : undefined,
        venue: interviewForm.mode === 'in-person' ? interviewForm.venue.trim() || undefined : undefined,
      });
      toast.success(`Interview scheduled for ${scheduleFor.student.name}`, {
        action: { label: 'View', onClick: () => navigate('/college/interviews') },
      });
      setScheduleFor(null);
      fetchScheduledInterviews();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const renderInterviewAction = (app: Application, compact = false) => {
    if (app.status !== 'shortlisted') return null;
    const existing = interviewsByApp[app.id];
    if (existing) {
      return (
        <span
          title={`Round ${existing.round} interview on ${formatDate(existing.date)} at ${formatTime(existing.time)}`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold whitespace-nowrap"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          {formatDate(existing.date)}
        </span>
      );
    }
    return compact ? (
      <button onClick={() => openSchedule(app)} className="text-xs text-indigo-600 hover:underline">
        Schedule
      </button>
    ) : (
      <Button
        variant="outline"
        size="sm"
        leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
        onClick={() => openSchedule(app)}
        className="whitespace-nowrap"
      >
        Schedule interview
      </Button>
    );
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAll({
        search,
        status: status || undefined,
        jobId: jobId || undefined,
        page,
        limit: LIMIT,
      });
      setApplications(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, status, jobId, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      toast.success(`Application updated to ${newStatus.replace('_', ' ')}`);
      fetchApplications();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const getStatusBadgeVariant = (s: string) => {
    switch (s) {
      case 'selected': return 'green' as const;
      case 'rejected': return 'red' as const;
      case 'shortlisted': return 'indigo' as const;
      case 'applied': return 'blue' as const;
      case 'under_review': return 'amber' as const;
      default: return 'slate' as const;
    }
  };

  return (
    <PageWrapper
      title="Applications"
      breadcrumbs={[{ label: 'College' }, { label: 'Applications' }]}
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              aria-label="Search applications"
              placeholder="Search by student, register no., email, department, role or company"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={searchInput ? (
                <button type="button" aria-label="Clear search" onClick={() => setSearchInput('')} className="hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              ) : undefined}
            />
          </div>
          <div className="sm:w-48 shrink-0">
            <Select
              aria-label="Filter by stage"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              placeholder="All stages"
              options={[
                { value: 'applied', label: 'Applied' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'selected', label: 'Selected' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'withdrawn', label: 'Withdrawn' },
              ]}
            />
          </div>
        </div>
        {!loading && (search || status) && (
          <div className="flex items-center justify-between gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {total} {total === 1 ? 'result' : 'results'}
              {search && <> for <span className="font-semibold text-slate-700 dark:text-slate-200">“{search}”</span></>}
            </span>
            <button type="button" onClick={resetFilters} className="font-medium hover:text-slate-800 dark:hover:text-slate-200">
              Clear filters
            </button>
          </div>
        )}
      </Card>

      <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job Title / Company</th>
                  <th>Applied On</th>
                  <th>AI Match</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={<Layers className="w-6 h-6" />}
                        title={search || status ? 'No matching applications' : 'No applications yet'}
                        description={search || status
                          ? `Nothing matches${search ? ` "${search}"` : ''}${status ? ` in ${status.replace('_', ' ')}` : ''}.`
                          : 'Student applications to your drives will appear here.'}
                        action={search || status ? { label: 'Clear filters', onClick: resetFilters } : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const matchScore = app.matchScore ?? 0;
                    return (
                    <tr key={app.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={app.student.name} size="sm" />
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{app.student.name}</p>
                            <p className="text-xs text-slate-500">{app.student.department} · CGPA {app.student.cgpa}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{app.job.title}</p>
                        <p className="text-xs text-slate-400">{app.company.name}</p>
                      </td>
                      <td className="text-sm text-slate-500">
                        {formatDate(app.appliedAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ProgressRing
                            value={matchScore}
                            size={40}
                            strokeWidth={3}
                            color={getMatchScoreRingColor(matchScore)}
                            label={`${matchScore}%`}
                          />
                          {matchScore >= 80 && <AIBadge label="Top Fit" className="text-[10px]" />}
                        </div>
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {renderInterviewAction(app)}
                          {app.status === 'applied' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusUpdate(app.id, 'under_review')}
                                title="Review Application"
                                className="text-amber-600 hover:bg-amber-50"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                                title="Shortlist"
                                className="text-emerald-600 hover:bg-emerald-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {app.status === 'under_review' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                              title="Shortlist"
                              className="text-emerald-600 hover:bg-emerald-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {app.status !== 'selected' && app.status !== 'rejected' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              title="Reject Candidate"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && applications.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>

      <Modal
        isOpen={Boolean(scheduleFor)}
        onClose={() => { if (!scheduling) setScheduleFor(null); }}
        title="Schedule interview"
      >
        {scheduleFor && (
          <form onSubmit={handleScheduleInterview} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <Avatar name={scheduleFor.student.name} size="sm" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{scheduleFor.student.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {scheduleFor.job.title} · {scheduleFor.company.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={interviewForm.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => updateInterviewForm({ date: e.target.value })}
                required
              />
              <Input
                label="Time"
                type="time"
                value={interviewForm.time}
                onChange={e => updateInterviewForm({ time: e.target.value })}
                required
              />
            </div>

            {conflictWarning && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 rounded-xl flex items-start gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Round"
                value={interviewForm.round}
                onChange={e => updateInterviewForm({ round: e.target.value })}
                options={['1', '2', '3', '4'].map(r => ({ value: r, label: `Round ${r}` }))}
              />
              <Select
                label="Type"
                value={interviewForm.type}
                onChange={e => updateInterviewForm({ type: e.target.value as Interview['type'] })}
                options={[
                  { value: 'technical', label: 'Technical' },
                  { value: 'hr', label: 'HR' },
                  { value: 'managerial', label: 'Managerial' },
                ]}
              />
              <Select
                label="Mode"
                value={interviewForm.mode}
                onChange={e => updateInterviewForm({ mode: e.target.value as Interview['mode'] })}
                options={[
                  { value: 'video', label: 'Video call' },
                  { value: 'in-person', label: 'In person' },
                ]}
              />
            </div>

            {interviewForm.mode === 'video' ? (
              <Input
                label="Meeting link (optional)"
                placeholder="https://meet.google.com/..."
                value={interviewForm.meetingLink}
                onChange={e => updateInterviewForm({ meetingLink: e.target.value })}
              />
            ) : (
              <Input
                label="Venue (optional)"
                placeholder="e.g. Placement Cell, Block A"
                value={interviewForm.venue}
                onChange={e => updateInterviewForm({ venue: e.target.value })}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setScheduleFor(null)} disabled={scheduling}>
                Cancel
              </Button>
              <Button type="submit" loading={scheduling} leftIcon={<CalendarPlus className="w-4 h-4" />}>
                Schedule interview
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import { Search, Filter, Check, X, FileText, Bot, Eye, RefreshCw, Layers } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, ProgressRing, Pagination, EmptyState, Skeleton, AIBadge } from '../../components/ui';
import { applicationService } from '../../services';
import { getMatchScoreRingColor, formatDate, cn } from '../../utils';
import { toast } from 'sonner';
import type { Application } from '../../types';

export const CollegeApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const LIMIT = 10;

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

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      toast.success(`Application updated to ${newStatus.replace('_', ' ')}`);
      fetchApplications();
    } catch {
      toast.error('Failed to update status');
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

  const kanbanStages = [
    { id: 'applied', title: 'Applied', color: 'border-t-blue-500' },
    { id: 'under_review', title: 'Under Review', color: 'border-t-amber-500' },
    { id: 'shortlisted', title: 'Shortlisted', color: 'border-t-indigo-500' },
    { id: 'selected', title: 'Selected', color: 'border-t-emerald-500' },
  ];

  return (
    <PageWrapper
      title="Applications"
      subtitle={`${total} student applications`}
      breadcrumbs={[{ label: 'College' }, { label: 'Applications' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            Pipeline Kanban
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, ID or role..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            placeholder="All Stages"
            options={[
              { value: 'applied', label: 'Applied' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'selected', label: 'Selected' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            className="sm:w-44"
          />
        </div>
      </Card>

      {viewMode === 'table' ? (
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
                        title="No applications found"
                        description="Try adjusting your filters or search terms."
                      />
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
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
                            value={app.matchScore}
                            size={40}
                            strokeWidth={3}
                            color={getMatchScoreRingColor(app.matchScore)}
                            label={`${app.matchScore}%`}
                          />
                          {app.matchScore >= 80 && <AIBadge label="Top Fit" className="text-[10px]" />}
                        </div>
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
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
                  ))
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
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {kanbanStages.map((stage) => {
            const stageApps = applications.filter(a => a.status === stage.id);
            return (
              <div key={stage.id} className="flex flex-col gap-3 bg-slate-100 dark:bg-slate-800/40 p-4 rounded-2xl min-h-[400px]">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{stage.title}</h3>
                  <Badge variant="slate">{stageApps.length}</Badge>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                  {loading ? (
                    <Skeleton className="h-28 rounded-xl" />
                  ) : stageApps.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">No applications</div>
                  ) : (
                    stageApps.map((app) => (
                      <Card
                        key={app.id}
                        className={cn("p-4 border-t-4 hover:shadow-md transition-shadow", stage.color)}
                        padding={false}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Avatar name={app.student.name} size="sm" />
                            <Badge variant={getStatusBadgeVariant(app.status)} className="text-[10px]">
                              {app.matchScore}% Match
                            </Badge>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{app.student.name}</h4>
                          <p className="text-xs text-slate-500 mb-2 truncate">{app.job.title}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400">{formatDate(app.appliedAt)}</span>
                            <div className="flex gap-1">
                              {stage.id === 'applied' && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'under_review')}
                                  className="text-xs text-brand-600 hover:underline"
                                >
                                  Review
                                </button>
                              )}
                              {stage.id !== 'selected' && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'selected')}
                                  className="text-xs text-emerald-600 hover:underline"
                                >
                                  Select
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

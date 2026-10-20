import React, { useEffect, useState } from 'react';
import { Search, Check, X, Layers, ArrowLeft, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, ProgressRing, Pagination, EmptyState, Skeleton, AIBadge } from '../../components/ui';
import { applicationService, driveService } from '../../services';
import { getMatchScoreRingColor, formatDate } from '../../utils';
import { toast } from 'sonner';
import type { Application, PlacementDrive } from '../../types';

export const CollegeDriveCandidatesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [driveState, setDriveState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const LIMIT = 10;

  useEffect(() => {
    if (!id) return;
    setDriveState('loading');
    driveService.getById(id)
      .then(res => { setDrive(res); setDriveState('ready'); })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : '';
        setDriveState(/not found/i.test(message) ? 'missing' : 'error');
      });
  }, [id]);

  const fetchApplications = async () => {
    if (!id || driveState !== 'ready') return;
    setLoading(true);
    try {
      const res = await applicationService.getAll({
        search,
        status: status || undefined,
        driveId: id,
        page,
        limit: LIMIT,
      });
      setApplications(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, status, id, page, driveState]);

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    try {
      await applicationService.updateStatus(appId, newStatus);
      toast.success(`Candidate status updated to ${newStatus.replace('_', ' ')}`);
      fetchApplications();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadgeVariant = (s: string) => {
    switch (s) {
      case 'selected': return 'green';
      case 'rejected': return 'red';
      case 'shortlisted': return 'indigo';
      case 'applied': return 'blue';
      case 'under_review': return 'amber';
      default: return 'slate';
    }
  };

  const breadcrumbs = [
    { label: 'College' },
    { label: 'Drives', to: '/college/drives' },
    { label: 'Candidates' },
  ];

  if (driveState === 'missing' || driveState === 'error') {
    return (
      <PageWrapper title="Manage Candidates" breadcrumbs={breadcrumbs}>
        <Card>
          <EmptyState
            icon={<Layers className="w-6 h-6" />}
            title={driveState === 'missing' ? 'This drive no longer exists' : 'Could not load this drive'}
            description={driveState === 'missing'
              ? 'It may have been deleted. Its candidates were removed along with it.'
              : 'Check your connection and try again.'}
            action={driveState === 'missing'
              ? { label: 'Back to drives', onClick: () => navigate('/college/drives') }
              : { label: 'Try again', onClick: () => navigate(0) }}
          />
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Manage Candidates" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="min-w-0">
          {drive ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{drive.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {drive.company?.name || 'Company removed'} · {formatDate(drive.date)} · {total} {total === 1 ? 'candidate' : 'candidates'}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => navigate('/college/drives')} leftIcon={<ArrowLeft className="w-4 h-4" />} className="w-full sm:w-auto shrink-0">
          Back to drives
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              aria-label="Search candidates"
              placeholder="Search by student name or ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="sm:w-44 shrink-0">
            <Select
              aria-label="Filter by stage"
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
            />
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Applied On</th>
                <th>AI Match Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<Layers className="w-6 h-6" />}
                      title="No candidates found"
                      description="There are no students matching your criteria."
                    />
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={app.student?.name || 'Unknown'} size="sm" />
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{app.student?.name || 'Unknown Candidate'}</p>
                          <p className="text-xs text-slate-500">{app.student?.department || 'N/A'} · CGPA {app.student?.cgpa || 'N/A'}</p>
                        </div>
                      </div>
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
    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Search, Filter, CheckCircle2, Clock, XCircle,
  Building2, Briefcase, ArrowUpRight, Sparkles, ChevronRight, Award,
  FileText, ExternalLink, RefreshCw, AlertCircle, MapPin, DollarSign,
  TrendingUp, Check, ShieldCheck
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Modal, AIBadge, Progress, EmptyState, Skeleton } from '../../components/ui';
import { applicationService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { Application } from '../../types';

export const StudentApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'selected' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAll({ studentId: 'student-1', limit: 50 });
      // If student-1 list is sparse, fall back to default mock list
      if (res.data.length === 0) {
        const allRes = await applicationService.getAll({ limit: 20 });
        setApplications(allRes.data as Application[]);
      } else {
        setApplications(res.data as Application[]);
      }
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const inProgressCount = applications.filter(a => ['applied', 'under_review', 'shortlisted', 'assessment', 'technical', 'hr'].includes(a.status)).length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected' || a.status === 'withdrawn').length;

  const filteredApplications = applications.filter(app => {
    const companyName = app.company?.name || 'Company';
    const jobTitle = app.job?.title || 'Role';
    const matchesSearch =
      companyName.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.status.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'in_progress') {
      return ['applied', 'under_review', 'shortlisted', 'assessment', 'technical', 'hr'].includes(app.status);
    }
    if (filterTab === 'selected') {
      return app.status === 'selected';
    }
    if (filterTab === 'rejected') {
      return app.status === 'rejected' || app.status === 'withdrawn';
    }
    return true;
  });

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'selected':
        return <Badge variant="green" dot>🎉 Selected & Offered</Badge>;
      case 'shortlisted':
      case 'technical':
      case 'hr':
      case 'assessment':
        return <Badge variant="purple" dot>Shortlisted / Interview</Badge>;
      case 'under_review':
        return <Badge variant="amber" dot>Under Review</Badge>;
      case 'applied':
        return <Badge variant="blue" dot>Application Submitted</Badge>;
      case 'rejected':
        return <Badge variant="red" dot>Not Selected</Badge>;
      case 'withdrawn':
        return <Badge variant="slate" dot>Withdrawn</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      await applicationService.updateStatus(id, 'withdrawn');
      toast.success('Application withdrawn');
      setSelectedApp(null);
      fetchApplications();
    } catch {
      toast.error('Failed to withdraw application');
    }
  };

  return (
    <PageWrapper
      title="My Applications"
      subtitle="Track your campus recruitment drive submissions, pipeline progress, and job offers."
      breadcrumbs={[{ label: 'Student' }, { label: 'Applications' }]}
      actions={
        <Button size="sm" onClick={() => navigate('/student/jobs')}>
          Browse More Jobs
        </Button>
      }
    >
      {/* Funnel Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-brand-50/50 to-brand-100/30 dark:from-brand-950/30 dark:to-brand-900/10">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{applications.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Applications</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{inProgressCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Offers Received</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-ai-50/50 to-purple-100/30 dark:from-ai-950/30 dark:to-purple-900/10">
          <div className="w-10 h-10 rounded-2xl bg-ai-600 text-white flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">91%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg AI Match</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Card */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: `All (${applications.length})` },
              { id: 'in_progress', label: `In Progress (${inProgressCount})` },
              { id: 'selected', label: `Offers (${selectedCount})` },
              { id: 'rejected', label: `Archived (${rejectedCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as typeof filterTab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  filterTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by company or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Applications List Grid */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-36"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8 text-slate-400" />}
          title="No applications found"
          description={search ? `No applications match "${search}"` : "You haven't submitted applications under this category yet."}
          action={{ label: 'Explore Recommended Jobs', onClick: () => navigate('/student/jobs') }}
        />
      ) : (
        <div className="space-y-4 mb-6">
          {filteredApplications.map(app => {
            const companyName = app.company?.name || 'Tech Recruiter';
            const jobTitle = app.job?.title || 'Software Development Engineer';
            const minPkg = app.job?.salaryMin || 10;
            const maxPkg = app.job?.salaryMax || 16;
            const matchScore = app.matchScore || 88;

            return (
              <Card key={app.id} hover className="p-6 transition-all duration-200 border-slate-200 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Column: Recruiter Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-ai-600 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                      {companyName[0]}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug truncate">
                          {jobTitle}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">{companyName}</strong>
                        <span>·</span>
                        <span>Package: ₹{minPkg} - ₹{maxPkg} LPA</span>
                        <span>·</span>
                        <span>Applied {formatDate(app.appliedAt)}</span>
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <AIBadge label={`${matchScore}% Match`} />
                        <span className="text-xs text-slate-400">Current Stage: <strong className="text-slate-700 dark:text-slate-300">{app.currentStage || 'Application Review'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Offer Details / Stepper & Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    {app.status === 'selected' && app.offerDetails && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                        <p className="font-extrabold text-sm">₹{app.offerDetails.package} LPA Offer</p>
                        <p className="text-[10px] opacity-80">Joining: {formatDate(app.offerDetails.joiningDate)}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-initial text-xs"
                        onClick={() => setSelectedApp(app)}
                      >
                        View Timeline
                      </Button>

                      {(app.status === 'shortlisted' || app.status === 'technical' || app.status === 'hr') && (
                        <Button
                          variant="ai"
                          size="sm"
                          className="flex-1 sm:flex-initial text-xs"
                          onClick={() => navigate('/student/interviews')}
                        >
                          View Schedule
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pipeline Stepper Visualizer */}
                {app.timeline && app.timeline.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {app.timeline.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            step.status === 'passed' ? 'bg-emerald-500' :
                            step.status === 'current' ? 'bg-brand-600 animate-pulse' :
                            step.status === 'failed' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`} />
                          <span className={`text-[11px] truncate ${
                            step.status === 'current' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-500'
                          }`}>
                            {step.stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* APPLICATION TIMELINE & DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `${selectedApp.job?.title || 'Application'} Timeline` : 'Application Details'}
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedApp.company?.name || 'Company'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Applied on {formatDate(selectedApp.appliedAt)}</p>
              </div>
              <div>{getStatusBadge(selectedApp.status)}</div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-wider">Drive Pipeline Progress</h4>
              <div className="space-y-3">
                {selectedApp.timeline ? selectedApp.timeline.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        step.status === 'passed' ? 'bg-emerald-500' :
                        step.status === 'current' ? 'bg-brand-600' :
                        step.status === 'failed' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        {step.status === 'passed' ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{step.stage}</p>
                        {step.notes && <p className="text-[11px] text-slate-500 mt-0.5">{step.notes}</p>}
                      </div>
                    </div>
                    <Badge variant={step.status === 'passed' ? 'green' : step.status === 'current' ? 'indigo' : 'slate'} className="text-[10px]">
                      {step.status.toUpperCase()}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400">Application is under standard TPO screening.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
              {selectedApp.status !== 'withdrawn' && selectedApp.status !== 'selected' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                  onClick={() => handleWithdraw(selectedApp.id)}
                >
                  Withdraw Application
                </Button>
              ) : <div />}

              <Button size="sm" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Calendar, MapPin, Search, GraduationCap, CheckCircle2, XCircle, Users, Briefcase,
  IndianRupee, X, ChevronDown, ChevronUp, Clock, ArrowRight, Layers, AlertTriangle,
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Badge, Select, Skeleton, EmptyState } from '../../components/ui';
import { toast } from 'sonner';
import { driveService, applicationService, studentService } from '../../services';
import type { ApplicationStatus, PlacementDrive, Student } from '../../types';

type EffectiveStatus = 'upcoming' | 'ongoing' | 'expired' | 'completed' | 'cancelled';
type ViewFilter = 'all' | 'open' | 'eligible' | 'registered' | 'past';
type SortOrder = 'soonest' | 'package' | 'recent';

interface EligibilityCheck {
  label: string;
  requirement: string;
  yours: string;
  passed: boolean;
}

interface DriveView {
  drive: PlacementDrive;
  effective: EffectiveStatus;
  isOpen: boolean;
  checks: EligibilityCheck[];
  eligible: boolean;
  applicationStatus?: ApplicationStatus;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const getEffectiveStatus = (drive: PlacementDrive): EffectiveStatus => {
  if (drive.status === 'completed' || drive.status === 'cancelled') return drive.status;
  const start = startOfDay(new Date(drive.date));
  const end = startOfDay(new Date(drive.endDate || drive.date));
  const today = startOfDay(new Date());
  if (end < today) return 'expired';
  if (start <= today || drive.status === 'ongoing') return 'ongoing';
  return 'upcoming';
};

const daysUntil = (dateStr: string) => Math.round((startOfDay(new Date(dateStr)) - startOfDay(new Date())) / DAY_MS);

const relativeDay = (dateStr: string) => {
  const diff = daysUntil(dateStr);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return diff > 0 ? `In ${diff} days` : `${Math.abs(diff)} days ago`;
};

const formatLongDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'To be announced';

const formatPackage = (drive: PlacementDrive) => {
  const { salaryMin, salaryMax } = drive.job || {};
  if (!salaryMin && !salaryMax) return null;
  if (salaryMin && salaryMax && salaryMin !== salaryMax) return `₹${salaryMin}–${salaryMax} LPA`;
  return `₹${salaryMax || salaryMin} LPA`;
};

const JOB_TYPE_LABELS: Record<string, string> = {
  fulltime: 'Full time',
  parttime: 'Part time',
  internship: 'Internship',
  contract: 'Contract',
};

const formatJobType = (type?: string) => {
  if (!type) return 'Full time';
  const key = type.toLowerCase().replace(/[\s_-]/g, '');
  return JOB_TYPE_LABELS[key] || type.replace(/[_-]/g, ' ').replace(/^\w/, ch => ch.toUpperCase());
};

const getBranches = (drive: PlacementDrive) =>
  Array.from(new Set([...(drive.eligibility?.branches || []), ...(drive.eligibleDepartments || [])].filter(Boolean)));

const buildChecks = (drive: PlacementDrive, student: Student | null): EligibilityCheck[] => {
  if (!student) return [];
  const checks: EligibilityCheck[] = [];
  const minCgpa = drive.eligibility?.minCgpa ?? 0;
  if (minCgpa > 0) {
    checks.push({
      label: 'CGPA',
      requirement: `${minCgpa}+`,
      yours: student.cgpa != null ? String(student.cgpa) : 'Not set',
      passed: (student.cgpa ?? 0) >= minCgpa,
    });
  }
  const maxBacklogs = drive.eligibility?.maxBacklogs;
  if (maxBacklogs != null) {
    checks.push({
      label: 'Active backlogs',
      requirement: maxBacklogs === 0 ? 'None allowed' : `Up to ${maxBacklogs}`,
      yours: String(student.backlogs ?? 0),
      passed: (student.backlogs ?? 0) <= maxBacklogs,
    });
  }
  const branches = getBranches(drive);
  if (branches.length > 0 && !branches.some(b => b.toLowerCase() === 'all')) {
    const dept = (student.department || '').toLowerCase();
    checks.push({
      label: 'Department',
      requirement: branches.join(', '),
      yours: student.department || 'Not set',
      passed: branches.some(b => b.toLowerCase() === dept),
    });
  }
  return checks;
};

const STATUS_BADGE: Record<EffectiveStatus, { label: string; variant: 'blue' | 'green' | 'red' | 'slate' | 'amber' }> = {
  upcoming: { label: 'Upcoming', variant: 'blue' },
  ongoing: { label: 'Happening now', variant: 'green' },
  expired: { label: 'Closed', variant: 'red' },
  completed: { label: 'Completed', variant: 'slate' },
  cancelled: { label: 'Cancelled', variant: 'amber' },
};

const APPLICATION_LABEL: Record<string, { label: string; variant: 'blue' | 'green' | 'red' | 'slate' | 'amber' | 'indigo' | 'purple' }> = {
  applied: { label: 'Registered', variant: 'blue' },
  under_review: { label: 'Under review', variant: 'amber' },
  shortlisted: { label: 'Shortlisted', variant: 'indigo' },
  interview_scheduled: { label: 'Interview scheduled', variant: 'purple' },
  interviewed: { label: 'Interviewed', variant: 'purple' },
  offered: { label: 'Offer received', variant: 'green' },
  selected: { label: 'Selected', variant: 'green' },
  rejected: { label: 'Not selected', variant: 'red' },
  withdrawn: { label: 'Withdrawn', variant: 'slate' },
};

const VIEW_TABS: { id: ViewFilter; label: string }[] = [
  { id: 'all', label: 'All drives' },
  { id: 'open', label: 'Open for registration' },
  { id: 'eligible', label: 'Eligible for me' },
  { id: 'registered', label: 'My registrations' },
  { id: 'past', label: 'Past drives' },
];

export const StudentCampusDrivesPage: React.FC = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [applicationByDrive, setApplicationByDrive] = useState<Record<string, ApplicationStatus>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('soonest');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      driveService.getAll(),
      applicationService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      studentService.getMyProfile().catch(() => null),
    ]).then(([driveList, apps, profile]) => {
      const byDrive: Record<string, ApplicationStatus> = {};
      const byJob: Record<string, ApplicationStatus> = {};
      (apps.data || []).forEach(app => {
        const driveId = String((app as { driveId?: string }).driveId || '');
        if (driveId) byDrive[driveId] = app.status;
        const jobId = String(app.jobId || app.job?.id || '');
        if (jobId) byJob[jobId] = app.status;
      });
      driveList.forEach(drive => {
        if (!byDrive[drive.id] && drive.jobId && byJob[String(drive.jobId)]) byDrive[drive.id] = byJob[String(drive.jobId)];
      });
      setDrives(driveList);
      setApplicationByDrive(byDrive);
      setStudent(profile);
    }).catch(() => {
      toast.error('Failed to load campus drives');
    }).finally(() => setLoading(false));
  }, []);

  const driveViews = useMemo<DriveView[]>(() => drives.map(drive => {
    const effective = getEffectiveStatus(drive);
    const checks = buildChecks(drive, student);
    return {
      drive,
      effective,
      isOpen: effective === 'upcoming' || effective === 'ongoing',
      checks,
      eligible: checks.every(c => c.passed),
      applicationStatus: applicationByDrive[drive.id],
    };
  }), [drives, student, applicationByDrive]);

  const counts = useMemo(() => {
    const c: Record<ViewFilter, number> = { all: driveViews.length, open: 0, eligible: 0, registered: 0, past: 0 };
    driveViews.forEach(v => {
      if (v.isOpen) c.open += 1;
      if (v.isOpen && v.eligible) c.eligible += 1;
      if (v.applicationStatus) c.registered += 1;
      if (!v.isOpen) c.past += 1;
    });
    return c;
  }, [driveViews]);

  const nextDrive = useMemo(() => driveViews
    .filter(v => v.isOpen)
    .sort((a, b) => new Date(a.drive.date).getTime() - new Date(b.drive.date).getTime())[0], [driveViews]);

  const filteredViews = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = driveViews.filter(v => {
      const haystack = [v.drive.title, v.drive.company?.name, v.drive.company?.industry, v.drive.job?.title, v.drive.venue]
        .filter(Boolean).join(' ').toLowerCase();
      if (q && !haystack.includes(q)) return false;
      switch (view) {
        case 'open': return v.isOpen;
        case 'eligible': return v.isOpen && v.eligible;
        case 'registered': return !!v.applicationStatus;
        case 'past': return !v.isOpen;
        default: return true;
      }
    });
    return list.sort((a, b) => {
      if (sortOrder === 'package') return (b.drive.job?.salaryMax || b.drive.job?.salaryMin || 0) - (a.drive.job?.salaryMax || a.drive.job?.salaryMin || 0);
      if (sortOrder === 'recent') return new Date(b.drive.createdAt).getTime() - new Date(a.drive.createdAt).getTime();
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      const diff = new Date(a.drive.date).getTime() - new Date(b.drive.date).getTime();
      return a.isOpen ? diff : -diff;
    });
  }, [driveViews, search, view, sortOrder]);

  const hasFilters = !!search.trim() || view !== 'all';
  const resetFilters = () => { setSearch(''); setView('all'); };

  const handleRegister = async (id: string) => {
    setRegisteringId(id);
    try {
      await applicationService.applyToDrive(id);
      setApplicationByDrive(prev => ({ ...prev, [id]: 'applied' }));
      setDrives(prev => prev.map(d => d.id === id && d.stats ? { ...d, stats: { ...d.stats, registered: (d.stats.registered || 0) + 1 } } : d));
      toast.success('You are registered. Track progress under Applications.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit the registration';
      if (message.toLowerCase().includes('already applied')) {
        setApplicationByDrive(prev => ({ ...prev, [id]: prev[id] || 'applied' }));
      }
      toast.error(message);
    } finally {
      setRegisteringId(null);
    }
  };

  const summary = [
    { label: 'Open drives', value: String(counts.open), hint: `${counts.all} scheduled in total` },
    { label: 'Eligible for you', value: String(counts.eligible), hint: student ? 'Based on your profile' : 'Complete your profile' },
    { label: 'Registered', value: String(counts.registered), hint: counts.registered ? 'Tracked in Applications' : 'No registrations yet' },
    {
      label: 'Next drive',
      value: nextDrive ? relativeDay(nextDrive.drive.date) : '—',
      hint: nextDrive ? `${nextDrive.drive.company?.name || nextDrive.drive.title} · ${new Date(nextDrive.drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Nothing scheduled',
    },
  ];

  return (
    <PageWrapper
      title="Campus Drives"
      breadcrumbs={[{ label: 'Student' }, { label: 'Placements' }, { label: 'Campus Drives' }]}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Drives at your college</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Companies your placement cell has invited to campus. Check eligibility, dates and venue, then register.
          </p>
        </div>
        {student && (
          <button
            onClick={() => navigate('/student/profile')}
            className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:self-auto"
          >
            <GraduationCap className="h-4 w-4 text-brand-600" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-white">CGPA {student.cgpa ?? '—'}</span>
              {' · '}{student.department || 'Department not set'}
              {' · '}{student.backlogs ?? 0} backlog{(student.backlogs ?? 0) === 1 ? '' : 's'}
            </span>
          </button>
        )}
      </div>

      <Card padding={false} className="mb-5 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700 lg:grid-cols-4">
          {summary.map(item => (
            <div key={item.label} className="bg-white px-5 py-4 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{loading ? '…' : item.value}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{loading ? 'Loading' : item.hint}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Input
              aria-label="Search drives"
              placeholder="Search by company, role, industry or venue"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-full shrink-0 sm:w-52">
            <Select
              aria-label="Sort drives"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as SortOrder)}
              options={[
                { value: 'soonest', label: 'Soonest first' },
                { value: 'package', label: 'Highest package' },
                { value: 'recent', label: 'Recently announced' },
              ]}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                view === tab.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 text-[10px] ${view === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
          {hasFilters && (
            <button onClick={resetFilters} className="ml-auto text-xs font-medium text-brand-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)
        ) : filteredViews.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title={hasFilters ? 'No drives match your filters' : 'No campus drives yet'}
              description={hasFilters
                ? 'Try a different search term or view.'
                : 'Your placement cell has not scheduled any drives. New drives will appear here as soon as they are announced.'}
              action={hasFilters ? { label: 'Clear filters', onClick: resetFilters } : undefined}
            />
          </Card>
        ) : filteredViews.map(v => {
          const { drive, effective, isOpen, checks, eligible, applicationStatus } = v;
          const companyName = drive.company?.name || 'Company';
          const pkg = formatPackage(drive);
          const branches = getBranches(drive);
          const days = daysUntil(drive.date);
          const isExpanded = !!expanded[drive.id];
          const status = STATUS_BADGE[effective];
          const appLabel = applicationStatus ? APPLICATION_LABEL[applicationStatus] || { label: applicationStatus, variant: 'slate' as const } : null;
          const rounds = (drive.pipeline || []).slice().sort((a, b) => a.order - b.order);
          const registered = drive.stats?.registered ?? 0;

          const facts = [
            { icon: <IndianRupee className="h-4 w-4" />, label: 'Package', value: pkg || 'Shared at the drive', muted: !pkg },
            { icon: <Calendar className="h-4 w-4" />, label: 'Drive date', value: formatLongDate(drive.date) },
            { icon: <MapPin className="h-4 w-4" />, label: 'Venue', value: drive.venue || 'To be announced', muted: !drive.venue },
            { icon: <Users className="h-4 w-4" />, label: 'Openings', value: `${drive.openings || 1} position${(drive.openings || 1) === 1 ? '' : 's'}` },
            { icon: <GraduationCap className="h-4 w-4" />, label: 'Min CGPA', value: drive.eligibility?.minCgpa ? `${drive.eligibility.minCgpa}+` : 'No minimum' },
            { icon: <Layers className="h-4 w-4" />, label: 'Departments', value: branches.length ? branches.join(', ') : 'All departments' },
            { icon: <Briefcase className="h-4 w-4" />, label: 'Job type', value: formatJobType(drive.job?.type) },
            { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Registered', value: `${registered} student${registered === 1 ? '' : 's'}` },
          ];

          return (
            <Card key={drive.id} padding={false} className={`overflow-hidden ${isOpen ? '' : 'opacity-90'}`}>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className={`flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl font-bold text-white ${
                  isOpen ? 'bg-gradient-to-br from-brand-500 to-indigo-600' : 'bg-slate-400 dark:bg-slate-600'
                }`}>
                  {drive.company?.logo
                    ? <img src={drive.company.logo} alt={companyName} className="h-full w-full object-cover" />
                    : companyName[0]?.toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{companyName}</h3>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {student && isOpen && checks.length > 0 && (
                      eligible
                        ? <Badge variant="green"><CheckCircle2 className="mr-1 inline h-3 w-3" />You're eligible</Badge>
                        : <Badge variant="red"><XCircle className="mr-1 inline h-3 w-3" />Not eligible</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">{drive.title}</span>
                    {drive.job?.title && drive.job.title !== drive.title && <> · {drive.job.title}</>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{drive.company?.industry || 'Industry not specified'}</p>
                </div>
                </div>

                <div className={`shrink-0 rounded-xl px-4 py-2 text-left sm:text-right ${
                  isOpen ? 'bg-brand-50 dark:bg-brand-900/20' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <p className={`text-sm font-bold ${isOpen ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500'}`}>
                    {relativeDay(drive.date)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px border-y border-slate-100 bg-slate-100 dark:border-slate-700 dark:bg-slate-700 md:grid-cols-4">
                {facts.map(fact => (
                  <div key={fact.label} className="flex items-start gap-2.5 bg-white px-5 py-3 dark:bg-slate-800">
                    <span className="mt-0.5 text-slate-400">{fact.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{fact.label}</p>
                      <p className={`break-words text-sm font-semibold md:truncate ${fact.muted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`} title={fact.value}>
                        {fact.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {isExpanded && (
                <div className="grid gap-5 border-b border-slate-100 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-900/30 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">About this drive</h4>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {drive.description?.trim() || 'The placement cell has not added a description yet. Reach out to your TPO for role details.'}
                    </p>

                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Selection process</h4>
                    {rounds.length > 0 ? (
                      <ol className="flex flex-wrap items-center gap-2">
                        {rounds.map((round, i) => (
                          <li key={round.id || i} className="flex items-center gap-2">
                            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {i + 1}. {round.name}
                              {round.date && <span className="ml-1 text-slate-400">· {new Date(round.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                            </span>
                            {i < rounds.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Rounds will be shared by the placement cell before the drive.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your eligibility</h4>
                    {!student ? (
                      <p className="text-sm text-slate-500">Complete your profile to see how you match.</p>
                    ) : checks.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">This drive is open to every student.</p>
                    ) : (
                      <ul className="space-y-2">
                        {checks.map(check => (
                          <li key={check.label} className="flex items-start gap-2 rounded-lg bg-white p-2.5 text-sm dark:bg-slate-800">
                            {check.passed
                              ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                              : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white">{check.label}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Required: {check.requirement} · Yours: <span className={check.passed ? 'text-emerald-600' : 'text-red-600'}>{check.yours}</span>
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {isOpen
                      ? days > 0
                        ? `Registration open until ${new Date(drive.endDate || drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Registration closes today'
                      : effective === 'cancelled' ? 'This drive was cancelled' : 'Registration closed'}
                  </span>
                  {!eligible && isOpen && !applicationStatus && (
                    <span className="flex items-center gap-1.5 text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {(() => {
                        const failed = checks.filter(c => !c.passed).map(c => c.label);
                        return `${failed.join(' and ')} requirement${failed.length > 1 ? 's' : ''} not met`;
                      })()}
                    </span>
                  )}
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [drive.id]: !prev[drive.id] }))}
                    className="flex items-center gap-1 font-medium text-brand-600 hover:underline"
                  >
                    {isExpanded ? <>Hide details <ChevronUp className="h-3.5 w-3.5" /></> : <>View details <ChevronDown className="h-3.5 w-3.5" /></>}
                  </button>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {appLabel ? (
                    <>
                      <Badge variant={appLabel.variant}>{appLabel.label}</Badge>
                      <Button size="sm" variant="outline" onClick={() => navigate('/student/applications')}>
                        Track application
                      </Button>
                    </>
                  ) : !isOpen ? (
                    <Button size="sm" variant="outline" disabled>Registration closed</Button>
                  ) : !eligible ? (
                    <Button size="sm" variant="outline" disabled>Not eligible</Button>
                  ) : (
                    <Button size="sm" disabled={registeringId === drive.id} onClick={() => handleRegister(drive.id)}>
                      {registeringId === drive.id ? 'Registering…' : 'Register now'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageWrapper>
  );
};

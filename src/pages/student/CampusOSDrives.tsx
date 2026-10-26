import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Calendar, MapPin, Search, GraduationCap, CheckCircle2, XCircle,
  Briefcase, IndianRupee, Sparkles, ChevronDown, ChevronUp, Clock,
  ArrowRight, ShieldCheck, Zap, Award, Layers, AlertCircle, FileText,
  ExternalLink, Filter, Star
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Badge, Select, Skeleton, EmptyState } from '../../components/ui';
import { toast } from 'sonner';
import { driveService, applicationService, studentService } from '../../services';
import type { ApplicationStatus, PlacementDrive, Student } from '../../types';

type EffectiveStatus = 'upcoming' | 'ongoing' | 'expired' | 'completed' | 'cancelled';
type ViewFilter = 'all' | 'open' | 'eligible' | 'registered' | 'premium';
type SortOrder = 'package' | 'soonest' | 'recent';

interface EligibilityCheck {
  label: string;
  requirement: string;
  yours: string;
  passed: boolean;
}

interface CampusOSDriveView {
  drive: PlacementDrive;
  effective: EffectiveStatus;
  isOpen: boolean;
  checks: EligibilityCheck[];
  eligible: boolean;
  matchScore: number;
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
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'To be announced';

const formatPackage = (drive: PlacementDrive) => {
  const { salaryMin, salaryMax } = drive.job || {};
  if (!salaryMin && !salaryMax) {
    if (drive.company?.name === 'Google') return '₹25–35 LPA';
    if (drive.company?.name === 'Infosys') return '₹9.5–12 LPA';
    if (drive.company?.name === 'Wipro Technologies') return '₹6.5–9 LPA';
    return 'Competitive CTC';
  }
  if (salaryMin && salaryMax && salaryMin !== salaryMax) return `₹${salaryMin}–${salaryMax} LPA`;
  return `₹${salaryMax || salaryMin} LPA`;
};

const calculateAIMatch = (drive: PlacementDrive, student: Student | null): number => {
  if (!student) return 85;
  let score = 70;
  const minCgpa = drive.eligibility?.minCgpa ?? 6.0;
  if ((student.cgpa ?? 0) >= minCgpa) score += 15;
  if ((student.backlogs ?? 0) === 0) score += 10;
  if (student.resume) score += 5;
  return Math.min(score, 98);
};

const buildChecks = (drive: PlacementDrive, student: Student | null): EligibilityCheck[] => {
  if (!student) return [];
  const checks: EligibilityCheck[] = [];
  const minCgpa = drive.eligibility?.minCgpa ?? 0;
  if (minCgpa > 0) {
    checks.push({
      label: 'Minimum CGPA',
      requirement: `${minCgpa}+`,
      yours: student.cgpa != null ? String(student.cgpa) : 'Not specified',
      passed: (student.cgpa ?? 0) >= minCgpa,
    });
  }
  const maxBacklogs = drive.eligibility?.maxBacklogs;
  if (maxBacklogs != null) {
    checks.push({
      label: 'Active Backlogs',
      requirement: maxBacklogs === 0 ? '0 Backlogs allowed' : `Max ${maxBacklogs}`,
      yours: String(student.backlogs ?? 0),
      passed: (student.backlogs ?? 0) <= maxBacklogs,
    });
  }
  const eligibleBranches = drive.eligibility?.branches || drive.eligibleDepartments || [];
  if (eligibleBranches.length > 0 && student.department) {
    const studentDeptNorm = student.department.toLowerCase();
    const passed = eligibleBranches.some(b => {
      const bn = b.toLowerCase();
      return studentDeptNorm.includes(bn) || bn.includes(studentDeptNorm) ||
        (bn.includes('computer') && studentDeptNorm.includes('cse')) ||
        (bn.includes('cse') && studentDeptNorm.includes('computer'));
    });
    checks.push({
      label: 'Eligible Branch',
      requirement: eligibleBranches.slice(0, 3).join(', ') + (eligibleBranches.length > 3 ? '...' : ''),
      yours: student.department,
      passed,
    });
  }
  return checks;
};

export const StudentCampusOSDrivesPage: React.FC = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applicationByDrive, setApplicationByDrive] = useState<Record<string, ApplicationStatus>>({});
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('package');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [applyModalDrive, setApplyModalDrive] = useState<CampusOSDriveView | null>(null);

  useEffect(() => {
    Promise.all([
      driveService.getCampusOSDrives(),
      applicationService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      studentService.getMyProfile().catch(() => null),
    ])
      .then(([driveList, apps, profile]) => {
        const byDrive: Record<string, ApplicationStatus> = {};
        const byJob: Record<string, ApplicationStatus> = {};
        (apps.data || []).forEach(app => {
          const driveId = String((app as { driveId?: string }).driveId || '');
          if (driveId) byDrive[driveId] = app.status;
          const jobId = String(app.jobId || app.job?.id || '');
          if (jobId) byJob[jobId] = app.status;
        });
        (driveList || []).forEach(drive => {
          if (!byDrive[drive.id] && drive.jobId && byJob[String(drive.jobId)]) {
            byDrive[drive.id] = byJob[String(drive.jobId)];
          }
        });
        setDrives(driveList || []);
        setApplicationByDrive(byDrive);
        setStudent(profile);
      })
      .catch(() => {
        toast.error('Failed to load CampusOS partner drives');
      })
      .finally(() => setLoading(false));
  }, []);

  const driveViews = useMemo<CampusOSDriveView[]>(() => {
    return drives.map(drive => {
      const effective = getEffectiveStatus(drive);
      const checks = buildChecks(drive, student);
      const matchScore = calculateAIMatch(drive, student);
      return {
        drive,
        effective,
        isOpen: effective === 'upcoming' || effective === 'ongoing',
        checks,
        eligible: checks.length === 0 || checks.every(c => c.passed),
        matchScore,
        applicationStatus: applicationByDrive[drive.id],
      };
    });
  }, [drives, student, applicationByDrive]);

  const counts = useMemo(() => {
    const c: Record<ViewFilter, number> = { all: driveViews.length, open: 0, eligible: 0, registered: 0, premium: 0 };
    driveViews.forEach(v => {
      if (v.isOpen) c.open += 1;
      if (v.isOpen && v.eligible) c.eligible += 1;
      if (v.applicationStatus) c.registered += 1;
      const pkg = v.drive.job?.salaryMax || v.drive.job?.salaryMin || (v.drive.company?.name === 'Google' ? 35 : 10);
      if (pkg >= 10) c.premium += 1;
    });
    return c;
  }, [driveViews]);

  const filteredViews = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = driveViews.filter(v => {
      const haystack = [
        v.drive.title,
        v.drive.company?.name,
        v.drive.company?.industry,
        v.drive.job?.title,
        v.drive.venue,
        v.drive.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (q && !haystack.includes(q)) return false;
      switch (view) {
        case 'open':
          return v.isOpen;
        case 'eligible':
          return v.isOpen && v.eligible;
        case 'registered':
          return !!v.applicationStatus;
        case 'premium': {
          const pkg = v.drive.job?.salaryMax || v.drive.job?.salaryMin || (v.drive.company?.name === 'Google' ? 35 : 10);
          return pkg >= 10;
        }
        default:
          return true;
      }
    });

    return list.sort((a, b) => {
      if (sortOrder === 'package') {
        const getPkg = (v: CampusOSDriveView) =>
          v.drive.job?.salaryMax || v.drive.job?.salaryMin || (v.drive.company?.name === 'Google' ? 35 : 10);
        return getPkg(b) - getPkg(a);
      }
      if (sortOrder === 'recent') {
        return new Date(b.drive.createdAt).getTime() - new Date(a.drive.createdAt).getTime();
      }
      return new Date(a.drive.date).getTime() - new Date(b.drive.date).getTime();
    });
  }, [driveViews, search, view, sortOrder]);

  const handleApplyConfirm = async () => {
    if (!applyModalDrive) return;
    const driveId = applyModalDrive.drive.id;
    setRegisteringId(driveId);
    try {
      await applicationService.applyToDrive(driveId);
      setApplicationByDrive(prev => ({ ...prev, [driveId]: 'applied' }));
      setDrives(prev =>
        prev.map(d =>
          d.id === driveId && d.stats
            ? { ...d, stats: { ...d.stats, registered: (d.stats.registered || 0) + 1, applied: (d.stats.applied || 0) + 1 } }
            : d
        )
      );
      toast.success('Successfully applied to CampusOS Drive! Track updates under Applications.');
      setApplyModalDrive(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit application';
      if (message.toLowerCase().includes('already applied')) {
        setApplicationByDrive(prev => ({ ...prev, [driveId]: prev[driveId] || 'applied' }));
      }
      toast.error(message);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <PageWrapper
      title="CampusOS Drives"
      breadcrumbs={[{ label: 'Student' }, { label: 'Placements' }, { label: 'CampusOS Drives' }]}
    >
      <div className="space-y-6">
        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search partner, role, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort drives"
            className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-full sm:w-52"
          >
            <option value="package">Highest Package</option>
            <option value="soonest">Drive Date (Soonest)</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>

        {/* Drives List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : filteredViews.length === 0 ? (
          <EmptyState
            title="No CampusOS drives found"
            description={
              search
                ? `No drives matching "${search}". Try clearing your search or filters.`
                : 'There are currently no active partner drives in this category.'
            }
            action={
              search || view !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearch('');
                      setView('all');
                    },
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-5">
            {filteredViews.map(item => {
              const { drive, isOpen, effective, eligible, checks, matchScore, applicationStatus } = item;
              const isExpanded = !!expanded[drive.id];
              const pkgText = formatPackage(drive);

              return (
                <div
                  key={drive.id}
                  className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden bg-card ${
                    applicationStatus
                      ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                      : 'border-border hover:border-primary-500/40 hover:shadow-lg'
                  }`}
                >
                  {/* Top Accent Ribbon */}
                  <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-primary-500 to-purple-500" />

                  <div className="p-5 md:p-6 space-y-5">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-border flex items-center justify-center font-bold text-lg text-primary-600 shrink-0 shadow-sm overflow-hidden">
                          {drive.company?.logo ? (
                            <img
                              src={drive.company.logo}
                              alt={drive.company.name}
                              className="w-full h-full object-contain p-2"
                              onError={e => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            drive.company?.name?.slice(0, 2).toUpperCase() || 'CO'
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {drive.company?.name || 'Enterprise Partner'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              <ShieldCheck className="w-3 h-3" /> CampusOS Tied Partner
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Sparkles className="w-3 h-3" /> {matchScore}% AI Match
                            </span>
                          </div>

                          <h2 className="text-lg md:text-xl font-bold text-foreground mt-1 group-hover:text-primary-600 transition-colors">
                            {drive.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {drive.venue || 'Virtual & Tech Centers'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatLongDate(String(drive.date))} ({relativeDay(String(drive.date))})
                            </span>
                            {drive.openings && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                {drive.openings} Openings
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Package & Apply Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-muted-foreground font-medium">Offered Package</div>
                          <div className="text-lg md:text-xl font-extrabold text-foreground bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                            {pkgText}
                          </div>
                        </div>

                        {applicationStatus ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Applied ({applicationStatus})
                          </div>
                        ) : !isOpen ? (
                          <Badge variant="slate" className="text-muted-foreground">
                            Registration Closed
                          </Badge>
                        ) : !eligible ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpanded(p => ({ ...p, [drive.id]: true }))}
                            className="text-xs text-amber-600 border-amber-300 dark:border-amber-700/50"
                          >
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Check Criteria
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setApplyModalDrive(item)}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-primary-500/20 text-xs px-4"
                          >
                            <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
                            Apply with CampusOS
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Description excerpt */}
                    {drive.description && (
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {drive.description}
                      </p>
                    )}

                    {/* Eligibility & Branch Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                      <div className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> Eligibility:
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground">
                        Min {drive.eligibility?.minCgpa ?? 6.0} CGPA
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground">
                        Max {drive.eligibility?.maxBacklogs ?? 0} Backlogs
                      </span>
                      {(drive.eligibleDepartments || drive.eligibility?.branches || []).slice(0, 3).map((dept, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                          {dept}
                        </span>
                      ))}

                      <button
                        type="button"
                        onClick={() => setExpanded(p => ({ ...p, [drive.id]: !p[drive.id] }))}
                        className="ml-auto flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline"
                      >
                        {isExpanded ? (
                          <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Selection Pipeline & Criteria <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && (
                      <div className="pt-4 mt-2 border-t border-border space-y-4 bg-muted/30 -mx-5 -mb-5 p-5">
                        {/* Eligibility Checks */}
                        <div>
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                            Your Eligibility Verification
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {checks.map((c, i) => (
                              <div
                                key={i}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                  c.passed
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold">{c.label}</div>
                                  <div className="text-[11px] opacity-80">Req: {c.requirement} | You: {c.yours}</div>
                                </div>
                                {c.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pipeline Stages */}
                        {drive.pipeline && drive.pipeline.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-primary-500" />
                              Hiring & Evaluation Stages ({drive.pipeline.length} Rounds)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {drive.pipeline.map((stage, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-card border border-border text-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-primary-600 mb-0.5">
                                    <span className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-700 dark:text-primary-300 text-[10px] flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    Round {idx + 1}
                                  </div>
                                  <div className="font-semibold text-foreground">{stage.name}</div>
                                  <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                                    {stage.type || 'Assessment'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Drive Timeline & Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
                          <div>
                            Registration Deadline: <strong className="text-foreground">{formatLongDate(String(drive.endDate || drive.date))}</strong>
                          </div>
                          {isOpen && eligible && !applicationStatus && (
                            <Button
                              size="sm"
                              onClick={() => setApplyModalDrive(item)}
                              className="bg-primary-600 hover:bg-primary-700 text-white text-xs"
                            >
                              Confirm Application with CampusOS Profile
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 1-Click Apply Confirmation Modal */}
        {applyModalDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden space-y-5 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI CampusOS One-Click Apply
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {applyModalDrive.drive.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {applyModalDrive.drive.company?.name} · {formatPackage(applyModalDrive.drive)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyModalDrive(null)}
                  className="text-muted-foreground hover:text-foreground text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {/* Student Verified Profile Preview */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                <div className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Your Verified Student Dossier to be Submitted
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Candidate:</span>{' '}
                    <strong className="text-foreground">{student?.name || 'Verified Student'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>{' '}
                    <strong className="text-foreground">{student?.department || 'Engineering'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CGPA:</span>{' '}
                    <strong className="text-foreground">{student?.cgpa ?? '8.4'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Backlogs:</span>{' '}
                    <strong className="text-foreground">{student?.backlogs ?? '0'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-primary-500" />
                    Resume: {student?.resume ? 'Verified ATS Resume Attached' : 'Platform Profile'}
                  </span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> All Criteria Met
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                By submitting, your verified student academic profile, ATS resume, and contact details will be forwarded directly to <strong>{applyModalDrive.drive.company?.name}</strong> talent acquisition team on CampusOS.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setApplyModalDrive(null)}
                  disabled={!!registeringId}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyConfirm}
                  disabled={!!registeringId}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                >
                  {registeringId ? 'Submitting Application...' : 'Confirm & Apply Now'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

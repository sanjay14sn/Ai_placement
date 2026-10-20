import React, { useEffect, useMemo, useState } from 'react';
import { Target, Calendar, MapPin, Users, Plus, ArrowUpRight, Search, Trash2, X, RotateCcw, Briefcase, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Modal, Skeleton, EmptyState, Select, ConfirmDialog } from '../../components/ui';
import { driveService, companyService, departmentService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { PlacementDrive, Company, Department } from '../../types';
import { useAuthStore } from '../../store';

type EffectiveStatus = 'upcoming' | 'ongoing' | 'expired' | 'completed' | 'cancelled';
type StatusFilter = 'all' | EffectiveStatus;
type SortOrder = 'soonest' | 'latest' | 'recent';

const DAY_MS = 86_400_000;

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

const relativeDay = (dateStr: string) => {
  const diff = Math.round((startOfDay(new Date(dateStr)) - startOfDay(new Date())) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return diff > 0 ? `In ${diff} days` : `${Math.abs(diff)} days ago`;
};

interface EditForm {
  title: string;
  companyId: string;
  department: string;
  date: string;
  openings: string;
  venue: string;
  minCgpa: string;
  status: PlacementDrive['status'];
  description: string;
}

const CGPA_OPTIONS = ['6.0', '6.5', '7.0', '7.5', '8.0', '8.5'].map(v => ({ value: v, label: `${v}+` }));

const toDateInput = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-CA');
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'expired', label: 'Expired' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const CollegeDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('soonest');
  const [deleteTarget, setDeleteTarget] = useState<PlacementDrive | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<PlacementDrive | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  // New Drive Form State
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [openings, setOpenings] = useState('5');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    Promise.all([
      driveService.getAll(),
      companyService.getAll({ limit: 100, status: 'tied' }),
      departmentService.getAll(user?.tenantId || '')
    ]).then(([d, c, depts]) => {
      setDrives(d);
      setCompanies(c.data);
      setDepartmentsList(depts);
    }).finally(() => setLoading(false));
  }, [user?.tenantId]);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyId || !date || !venue || !role || !department) {
      toast.error('Please fill in all fields');
      return;
    }

    const selectedCompany = companies.find(c => c.id === companyId);
    if (!selectedCompany) return;

    try {
      const newDrive = await driveService.create({
        title,
        companyId,
        collegeId: user?.tenantId,
        company: {
          id: selectedCompany.id,
          name: selectedCompany.name,
          logo: selectedCompany.logo,
          industry: selectedCompany.industry
        },
        date,
        venue,
        status: 'upcoming',
        description: requirements,
        job: {
          id: `job-${Date.now()}`,
          title: role,
          salaryMin: 5,
          salaryMax: 10,
          type: 'fulltime'
        },
        eligibility: {
          minCgpa: parseFloat(minCgpa),
          maxBacklogs: 0,
          branches: [department],
          degree: ['B.E.', 'B.Tech'],
          graduationYear: [2025]
        },
        openings: parseInt(openings),
        stats: {
          registered: 0,
          eligible: 120,
          applied: 0,
          shortlisted: 0,
          assessment: 0,
          interviewed: 0,
          selected: 0,
          rejected: 0
        }
      });

      setDrives(prev => [newDrive as PlacementDrive, ...prev]);
      setIsModalOpen(false);
      toast.success('Placement drive scheduled successfully');
      // Reset form
      setTitle('');
      setCompanyId('');
      setDate('');
      setVenue('');
      setRole('');
      setDepartment('');
      setRequirements('');
    } catch {
      toast.error('Failed to schedule drive');
    }
  };

  const openEdit = (drive: PlacementDrive) => {
    const branches = [...(drive.eligibility?.branches || []), ...(drive.eligibleDepartments || [])];
    setEditTarget(drive);
    setEditForm({
      title: drive.title || '',
      companyId: drive.companyId || '',
      department: branches[0] || '',
      date: toDateInput(drive.date),
      openings: String(drive.openings || 1),
      venue: drive.venue || '',
      minCgpa: Number(drive.eligibility?.minCgpa ?? 7).toFixed(1),
      status: drive.status,
      description: drive.description || '',
    });
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm(null);
  };

  const updateEditForm = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setEditForm(prev => (prev ? { ...prev, [key]: value } : prev));

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm) return;
    if (!editForm.title.trim() || !editForm.date || !editForm.venue.trim()) {
      toast.error('Title, date and venue are required');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await driveService.update(editTarget.id, {
        title: editForm.title.trim(),
        ...(editForm.companyId ? { companyId: editForm.companyId } : {}),
        date: editForm.date,
        venue: editForm.venue.trim(),
        openings: Number(editForm.openings) || 1,
        status: editForm.status,
        description: editForm.description,
        eligibility: {
          ...editTarget.eligibility,
          minCgpa: parseFloat(editForm.minCgpa),
          ...(editForm.department ? { branches: [editForm.department] } : {}),
        },
      });
      setDrives(prev => prev.map(d => (d.id === editTarget.id ? { ...d, ...updated } : d)));
      toast.success('Drive updated');
      closeEdit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update this drive');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteDrive = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await driveService.delete(deleteTarget.id);
      setDrives(prev => prev.filter(d => d.id !== deleteTarget.id));
      const extras = [
        result?.removedApplications ? `${result.removedApplications} application(s)` : '',
        result?.removedInterviews ? `${result.removedInterviews} interview(s)` : '',
      ].filter(Boolean).join(' and ');
      toast.success(`${deleteTarget.title} deleted${extras ? `, along with ${extras}` : ''}`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete this drive');
    } finally {
      setDeleting(false);
    }
  };

  const drivesWithStatus = useMemo(
    () => drives.map(drive => ({ drive, effective: getEffectiveStatus(drive) })),
    [drives],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: drives.length, upcoming: 0, ongoing: 0, expired: 0, completed: 0, cancelled: 0 };
    drivesWithStatus.forEach(({ effective }) => { counts[effective] += 1; });
    return counts;
  }, [drives.length, drivesWithStatus]);

  const filteredDrives = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = drivesWithStatus.filter(({ drive, effective }) => {
      const haystack = [drive.title, drive.company?.name, drive.job?.title, drive.venue].filter(Boolean).join(' ').toLowerCase();
      const branches = [...(drive.eligibility?.branches || []), ...(drive.eligibleDepartments || [])];
      return (!q || haystack.includes(q))
        && (status === 'all' || effective === status)
        && (departmentFilter === 'all' || branches.includes(departmentFilter));
    });
    const time = (d: PlacementDrive) => new Date(d.date).getTime();
    return list.sort((a, b) => {
      if (sortOrder === 'latest') return time(b.drive) - time(a.drive);
      if (sortOrder === 'recent') return new Date(b.drive.createdAt || 0).getTime() - new Date(a.drive.createdAt || 0).getTime();
      const aPast = a.effective === 'expired' || a.effective === 'completed' || a.effective === 'cancelled';
      const bPast = b.effective === 'expired' || b.effective === 'completed' || b.effective === 'cancelled';
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aPast ? time(b.drive) - time(a.drive) : time(a.drive) - time(b.drive);
    });
  }, [drivesWithStatus, search, status, departmentFilter, sortOrder]);

  const hasFilters = !!search || status !== 'all' || departmentFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setDepartmentFilter('all');
  };

  const getStatusBadge = (s: EffectiveStatus) => {
    switch (s) {
      case 'upcoming': return <Badge variant="blue">Upcoming</Badge>;
      case 'ongoing': return <Badge variant="green" dot>Ongoing</Badge>;
      case 'expired': return <Badge variant="red">Expired</Badge>;
      case 'completed': return <Badge variant="slate">Completed</Badge>;
      case 'cancelled': return <Badge variant="amber">Cancelled</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Placement Drives"
      breadcrumbs={[{ label: 'College' }, { label: 'Drives' }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Campus hiring campaigns</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading
              ? 'Loading drives…'
              : `${statusCounts.upcoming + statusCounts.ongoing} active · ${statusCounts.expired} expired · ${drives.length} total`}
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          New drive
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 overflow-hidden" padding={false}>
        <div className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              aria-label="Search drives"
              placeholder="Search by drive, company, role or venue"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={search ? (
                <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              ) : undefined}
            />
          </div>
          <div className="grid grid-cols-2 lg:flex gap-3">
            <div className="lg:w-48 shrink-0">
              <Select
                aria-label="Filter by department"
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                options={[{ value: 'all', label: 'All departments' }, ...departmentsList.map(d => ({ value: d.code, label: d.code }))]}
              />
            </div>
            <div className="lg:w-44 shrink-0">
              <Select
                aria-label="Sort drives"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as SortOrder)}
                options={[
                  { value: 'soonest', label: 'Soonest first' },
                  { value: 'latest', label: 'Latest date first' },
                  { value: 'recent', label: 'Recently added' },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex items-center gap-2 overflow-x-auto">
          {STATUS_TABS.filter(tab => tab.value !== 'cancelled' || statusCounts.cancelled > 0).map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                status === tab.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
              <span className={`min-w-[1.25rem] px-1 rounded-md text-[10px] ${status === tab.value ? 'bg-white/20' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                {statusCounts[tab.value]}
              </span>
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<Target className="w-8 h-8" />}
            title="No matching drives"
            description={`No drives match${search ? ` "${search}"` : ''} with the selected filters.`}
            action={{ label: 'Reset filters', onClick: resetFilters }}
          />
        ) : (
          <EmptyState
            icon={<Target className="w-8 h-8" />}
            title="No drives scheduled"
            description="Schedule a new placement drive to begin campus hiring."
            action={{ label: 'Schedule drive', onClick: () => setIsModalOpen(true) }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map(({ drive, effective }) => (
            <Card
              key={drive.id}
              className={`p-6 hover:shadow-elevated transition-shadow duration-200 flex flex-col justify-between h-full ${effective === 'expired' || effective === 'cancelled' ? 'opacity-90' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${effective === 'expired' ? 'bg-slate-400 dark:bg-slate-600' : 'bg-gradient-to-br from-brand-500 to-ai-500'}`}>
                    {(drive.company?.name || drive.title || 'D')[0].toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(effective)}
                    <button
                      type="button"
                      aria-label={`Edit ${drive.title}`}
                      title="Edit drive"
                      onClick={() => openEdit(drive)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${drive.title}`}
                      title="Delete drive"
                      onClick={() => setDeleteTarget(drive)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mb-1 leading-snug">{drive.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">
                  {drive.company?.name || 'Company removed'}
                  {drive.company?.industry ? ` · ${drive.company.industry}` : ''}
                </p>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(drive.date)}</span>
                    <span className={`font-medium ${effective === 'expired' ? 'text-red-600 dark:text-red-400' : effective === 'ongoing' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      · {effective === 'expired' ? `Expired ${relativeDay(drive.endDate || drive.date).toLowerCase()}` : relativeDay(drive.date)}
                    </span>
                  </div>
                  {drive.job?.title && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{drive.job.title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{drive.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>CGPA threshold: {drive.eligibility?.minCgpa ?? '—'}+</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{drive.stats.registered}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Registered</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-600">{drive.stats.shortlisted}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Shortlist</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-600">{drive.stats.selected}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Selected</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs justify-center" 
                  rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/college/drives/${drive.id}/candidates`)}
                >
                  Manage Candidates
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Onboarding / Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Placement Drive">
        <form onSubmit={handleCreateDrive} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Drive Title</label>
            <Input
              placeholder="e.g. Google SDE Off-Campus 2025"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Company"
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              placeholder="-- Choose Company --"
              options={companies.map(c => ({ value: c.id, label: c.name }))}
              required
            />
            
            <Select
              label="Department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="-- Select Department --"
              options={departmentsList.map(d => ({ value: d.code, label: `${d.name} (${d.code})` }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Role / Position</label>
            <Input
              placeholder="e.g. Software Engineer, Business Analyst"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Drive Date</label>
              <Input
                type="date"
                min={new Date().toLocaleDateString('en-CA')}
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Openings</label>
              <Input
                type="number"
                value={openings}
                onChange={e => setOpenings(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Venue</label>
            <Input
              placeholder="e.g. Seminar Hall 3, Block A"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Min CGPA Requirement</label>
            <Select
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
              options={[
                { value: '6.0', label: '6.0+' },
                { value: '6.5', label: '6.5+' },
                { value: '7.0', label: '7.0+' },
                { value: '7.5', label: '7.5+' },
                { value: '8.0', label: '8.0+' },
              ]}
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Requirements / Description</label>
            <textarea
              placeholder="Enter drive requirements, skills expected, or job description..."
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule Drive</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editTarget && !!editForm} onClose={closeEdit} title="Edit drive">
        {editForm && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Drive title"
              value={editForm.title}
              onChange={e => updateEditForm('title', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Company"
                value={editForm.companyId}
                onChange={e => updateEditForm('companyId', e.target.value)}
                placeholder={editTarget?.company?.name ? undefined : '-- Choose company --'}
                options={[
                  ...companies.map(c => ({ value: c.id, label: c.name })),
                  ...(editTarget?.company && !companies.some(c => c.id === editForm.companyId)
                    ? [{ value: editForm.companyId, label: editTarget.company.name }]
                    : []),
                ]}
              />
              <Select
                label="Department"
                value={editForm.department}
                onChange={e => updateEditForm('department', e.target.value)}
                placeholder="-- Select department --"
                options={departmentsList.map(d => ({ value: d.code, label: `${d.name} (${d.code})` }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Drive date"
                type="date"
                value={editForm.date}
                onChange={e => updateEditForm('date', e.target.value)}
                required
              />
              <Input
                label="Openings"
                type="number"
                min="1"
                value={editForm.openings}
                onChange={e => updateEditForm('openings', e.target.value)}
                required
              />
            </div>

            <Input
              label="Venue"
              value={editForm.venue}
              onChange={e => updateEditForm('venue', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Min CGPA"
                value={editForm.minCgpa}
                onChange={e => updateEditForm('minCgpa', e.target.value)}
                options={CGPA_OPTIONS.some(o => o.value === editForm.minCgpa)
                  ? CGPA_OPTIONS
                  : [...CGPA_OPTIONS, { value: editForm.minCgpa, label: `${editForm.minCgpa}+` }]}
              />
              <Select
                label="Status"
                value={editForm.status}
                onChange={e => updateEditForm('status', e.target.value as PlacementDrive['status'])}
                options={[
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'ongoing', label: 'Ongoing' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Requirements / description</label>
              <textarea
                value={editForm.description}
                onChange={e => updateEditForm('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={closeEdit}>Cancel</Button>
              <Button type="submit" loading={savingEdit}>Save changes</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDrive}
        title="Delete drive?"
        message={`Are you sure you want to delete "${deleteTarget?.title ?? ''}"? Its student applications and scheduled interviews will also be removed. This can't be undone.`}
        confirmLabel="Delete drive"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
};

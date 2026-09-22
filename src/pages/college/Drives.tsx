import React, { useEffect, useState } from 'react';
import { Target, Calendar, MapPin, Users, Plus, Star, ArrowUpRight, Search, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Modal, Skeleton, EmptyState, Select } from '../../components/ui';
import { driveService, companyService, departmentService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { PlacementDrive, Company, Department } from '../../types';
import { useAuthStore } from '../../store';

export const CollegeDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
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

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.title.toLowerCase().includes(search.toLowerCase()) ||
      (drive.company?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || drive.status === status;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (s: PlacementDrive['status']) => {
    switch (s) {
      case 'upcoming': return <Badge variant="blue">Upcoming</Badge>;
      case 'ongoing': return <Badge variant="green" dot>Ongoing</Badge>;
      case 'completed': return <Badge variant="slate">Completed</Badge>;
      default: return <Badge variant="slate">{s}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Placement Drives"
      subtitle="Campus hiring campaigns"
      breadcrumbs={[{ label: 'College' }, { label: 'Drives' }]}
      actions={
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          New Drive
        </Button>
      }
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by company or drive title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'ongoing', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  status === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
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
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="No drives scheduled"
          description="Schedule a new placement drive to begin campus hiring."
          action={{ label: 'Schedule Drive', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map(drive => (
            <Card key={drive.id} className="p-6 hover:shadow-elevated transition-shadow duration-200 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-ai-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {(drive.company?.name || 'C')[0]}
                  </div>
                  {getStatusBadge(drive.status)}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mb-1 leading-snug">{drive.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{drive.company?.industry || 'Unknown'}</p>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(drive.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{drive.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>CGPA Threshold: {drive.eligibility.minCgpa}+</span>
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
    </PageWrapper>
  );
};

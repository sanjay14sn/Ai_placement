import React, { useState } from 'react';
import { 
  Building2, Plus, Calendar, MapPin, Users, Award, 
  Search, CheckCircle2, Clock, ArrowRight, ExternalLink, Filter
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal, EmptyState } from '../../components/ui';
import { mockDrives, mockColleges } from '../../mock/data';
import { formatDate } from '../../utils';
import { toast } from 'sonner';

export const RecruiterDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState(mockDrives);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [driveTitle, setDriveTitle] = useState('');
  const [targetCollege, setTargetCollege] = useState(mockColleges[0]?.name || 'RV College of Engineering');
  const [driveDate, setDriveDate] = useState('2025-09-25');
  const [driveVenue, setDriveVenue] = useState('Main Campus Auditorium');
  const [openings, setOpenings] = useState('15');
  const [minCgpa, setMinCgpa] = useState('7.5');

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.title.toLowerCase().includes(search.toLowerCase()) ||
                          drive.company.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveTitle) {
      toast.error('Please enter a drive title');
      return;
    }

    const newDrive: any = {
      id: `drive-new-${Date.now()}`,
      collegeId: 'college-1',
      companyId: 'company-1',
      company: { id: 'company-1', name: 'Infosys', logo: '', industry: 'IT Services' },
      jobId: 'job-1',
      job: { id: 'job-1', title: driveTitle, salaryMin: 8, salaryMax: 14, type: 'fulltime' },
      title: driveTitle,
      description: `Campus placement drive for ${targetCollege}`,
      date: driveDate,
      venue: driveVenue,
      status: 'upcoming',
      eligibleDepartments: ['CSE', 'ISE', 'ECE'],
      eligibility: { minCgpa: parseFloat(minCgpa), maxBacklogs: 0, branches: ['CSE', 'ISE'], degree: ['B.E.'], graduationYear: [2025] },
      openings: parseInt(openings),
      stats: { registered: 180, eligible: 140, applied: 110, shortlisted: 35, assessment: 20, interviewed: 10, selected: 0, rejected: 10 },
      createdAt: new Date().toISOString(),
    };

    setDrives([newDrive, ...drives]);
    setIsModalOpen(false);
    toast.success(`🎉 Campus placement drive "${driveTitle}" created for ${targetCollege}!`);
    setDriveTitle('');
  };

  return (
    <PageWrapper
      title="Campus Placement Drives"
      subtitle="Organize, launch, and monitor recruitment drives across partner colleges"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Campus Drives' }]}
      actions={
        <Button 
          size="sm" 
          leftIcon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsModalOpen(true)}
        >
          Schedule New Campus Drive
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-brand-600/5 to-indigo-600/5 border border-brand-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Campus Drives</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{drives.length} Drives</div>
            <p className="text-[11px] text-brand-600 font-medium mt-1">Across 12 Top Institutions</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Candidates</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">1,420 Students</div>
            <p className="text-[11px] text-slate-500 mt-1">Eligible for Assessment</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Openings</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">145 Roles</div>
            <p className="text-[11px] text-slate-500 mt-1">Software & Data Engineering</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offers Issued</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">68 Hired</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">₹12.4 LPA Average CTC</p>
          </Card>
        </div>

        {/* SEARCH AND STATUS FILTERS */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search drive title or college..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {(['all', 'upcoming', 'ongoing', 'completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st} Drives
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* DRIVE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((drive) => (
            <Card key={drive.id} className="p-6 hover:shadow-elevated transition-all border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{drive.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{drive.job.title} · {drive.openings} Openings</p>
                </div>

                <Badge 
                  variant={drive.status === 'ongoing' ? 'green' : drive.status === 'upcoming' ? 'indigo' : 'slate'}
                  className="capitalize"
                >
                  {drive.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>Date: <strong>{formatDate(drive.date)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>Venue: <strong>{drive.venue}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>Min CGPA Threshold: <strong>{drive.eligibility.minCgpa}+ CGPA</strong></span>
                </div>
              </div>

              {/* Progress Bar for Applicants */}
              {drive.stats && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Funnel Metrics</span>
                    <span className="text-brand-600">{drive.stats.shortlisted} Shortlisted / {drive.stats.registered} Registered</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, (drive.stats.shortlisted / (drive.stats.registered || 1)) * 100 * 2)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {drive.eligibleDepartments.slice(0, 3).map(d => (
                    <Badge key={d} variant="slate" className="text-[10px]">{d}</Badge>
                  ))}
                </div>

                <Button 
                  size="sm" 
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => toast.info(`Viewing analytics for ${drive.title}`)}
                >
                  Manage Drive
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CREATE DRIVE MODAL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule New Campus Placement Drive"
        >
          <form onSubmit={handleCreateDrive} className="space-y-4">
            <Input
              label="Drive Title"
              placeholder="e.g. Infosys Pan-Campus Drive 2025"
              value={driveTitle}
              onChange={e => setDriveTitle(e.target.value)}
              required
            />

            <Select
              label="Target Institution / College"
              value={targetCollege}
              onChange={e => setTargetCollege(e.target.value)}
              options={mockColleges.map(c => ({ value: c.name, label: `${c.name} (${c.city})` }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Drive Date"
                type="date"
                value={driveDate}
                onChange={e => setDriveDate(e.target.value)}
                required
              />

              <Input
                label="Openings Count"
                type="number"
                value={openings}
                onChange={e => setOpenings(e.target.value)}
                required
              />
            </div>

            <Input
              label="Campus Venue / Auditorium"
              placeholder="e.g. Main Seminar Hall, Block B"
              value={driveVenue}
              onChange={e => setDriveVenue(e.target.value)}
              required
            />

            <Select
              label="Minimum CGPA Cutoff"
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
              options={[
                { value: '6.5', label: '6.5+ CGPA' },
                { value: '7.0', label: '7.0+ CGPA' },
                { value: '7.5', label: '7.5+ CGPA' },
                { value: '8.0', label: '8.0+ CGPA' },
              ]}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Launch Drive Registration
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
};

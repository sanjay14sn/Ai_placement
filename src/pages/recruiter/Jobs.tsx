import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Users, Award, MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal, EmptyState, Skeleton, Stepper } from '../../components/ui';
import { jobService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { Job } from '../../types';

export const RecruiterJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [salaryMin, setSalaryMin] = useState('8');
  const [salaryMax, setSalaryMax] = useState('12');
  const [openings, setOpenings] = useState('5');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [skills, setSkills] = useState('React, TypeScript, Node.js');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getAll({ page: 1, limit: 100 });
      setJobs(res.data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !skills) {
      toast.error('Please enter a job title and skills');
      return;
    }

    try {
      const newJob = await jobService.create({
        title,
        location,
        salaryMin: parseFloat(salaryMin),
        salaryMax: parseFloat(salaryMax),
        openings: parseInt(openings),
        skills: skills.split(',').map(s => s.trim()),
        status: 'active',
        company: {
          id: 'company-1',
          name: 'Infosys',
          logo: '',
          industry: 'IT Services',
          hq: 'Bengaluru',
        },
        eligibility: {
          minCgpa: parseFloat(minCgpa),
          maxBacklogs: 0,
          branches: ['CSE', 'ISE'],
          degree: ['B.E.'],
          graduationYear: [2025],
          requiredSkills: skills.split(',').map(s => s.trim()).slice(0, 2),
        },
        stats: {
          eligible: 120,
          applied: 0,
          shortlisted: 0,
          interviewed: 0,
          selected: 0,
        },
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setJobs(prev => [newJob as Job, ...prev]);
      setIsModalOpen(false);
      toast.success('Job posted successfully!');
      // Reset
      setTitle('');
      setSkills('React, TypeScript, Node.js');
      setCurrentStep(0);
    } catch {
      toast.error('Failed to post job');
    }
  };

  const steps = [
    { id: 'details', title: 'Role Details' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'skills', title: 'Skills' },
  ];

  return (
    <PageWrapper
      title="My Jobs"
      subtitle="Manage your posted openings"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Jobs' }]}
      actions={
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Post New Job
        </Button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-48"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No jobs posted yet"
          description="Create your first job opening to start matching with candidates."
          action={{ label: 'Post Job', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5 hover:shadow-elevated transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{job.title}</h3>
                  <p className="text-xs text-slate-500">{job.company.name}</p>
                </div>
                <Badge variant={job.status === 'active' ? 'green' : 'slate'}>{job.status}</Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />₹{job.salaryMin}–{job.salaryMax} LPA</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Expires {formatDate(job.applicationDeadline)}</span>
              </div>

              {job.stats && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.stats.applied}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Applicants</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-600">{job.stats.shortlisted}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Shortlist</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-600">{job.stats.selected}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Hired</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post New Job Opening">
        <div className="mb-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <form onSubmit={handleCreateJob} className="space-y-4">
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label>
                <Input placeholder="e.g. Software Engineer Graduate" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Openings</label>
                  <Input type="number" value={openings} onChange={e => setOpenings(e.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setCurrentStep(1)}>Next: Eligibility</Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Min Package (LPA)</label>
                  <Input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Package (LPA)</label>
                  <Input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Min CGPA Threshold</label>
                <Select
                  value={minCgpa}
                  onChange={e => setMinCgpa(e.target.value)}
                  options={[
                    { value: '6.0', label: '6.0+ CGPA' },
                    { value: '6.5', label: '6.5+ CGPA' },
                    { value: '7.0', label: '7.0+ CGPA' },
                    { value: '7.5', label: '7.5+ CGPA' },
                    { value: '8.0', label: '8.0+ CGPA' },
                  ]}
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                <Button type="button" onClick={() => setCurrentStep(2)}>Next: Skills</Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Required Skills (Comma separated)</label>
                <Input placeholder="e.g. React, TypeScript, Node.js, SQL" value={skills} onChange={e => setSkills(e.target.value)} required />
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button type="submit">Create Job Posting</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </PageWrapper>
  );
};

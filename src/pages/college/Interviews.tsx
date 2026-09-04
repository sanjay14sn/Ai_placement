import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock, AlertTriangle, Check, X, ShieldAlert, Plus, Search, Video } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, Modal, EmptyState, Skeleton } from '../../components/ui';
import { interviewService, studentService, companyService } from '../../services';
import { formatDate, formatTime } from '../../utils';
import { toast } from 'sonner';
import type { Interview, Student, Company } from '../../types';

export const CollegeInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [round, setRound] = useState('1');
  const [type, setType] = useState<'technical' | 'hr' | 'managerial'>('technical');
  const [mode, setMode] = useState<'video' | 'in-person'>('video');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const [res, sList, cList] = await Promise.all([
        interviewService.getAll({ page: 1, limit: 100 }),
        studentService.getAll({ limit: 100 }),
        companyService.getAll({ limit: 100 }),
      ]);
      setInterviews(res.data);
      setStudents(sList.data);
      setCompanies(cList.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleTimeDateChange = async (selectedDate: string, selectedTime: string) => {
    setDate(selectedDate);
    setTime(selectedTime);

    if (studentId && selectedDate && selectedTime) {
      try {
        const res = await interviewService.checkConflicts(studentId, selectedDate, selectedTime);
        if (res.hasConflict && res.conflictingInterview) {
          setConflictWarning(
            `Warning: Candidate has another interview scheduled at this time with ${res.conflictingInterview.company.name}.`
          );
        } else {
          setConflictWarning(null);
        }
      } catch {
        setConflictWarning(null);
      }
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !companyId || !date || !time) {
      toast.error('Please complete all form fields');
      return;
    }

    const selectedStudent = students.find(s => s.id === studentId);
    const selectedCompany = companies.find(c => c.id === companyId);
    if (!selectedStudent || !selectedCompany) return;

    try {
      const newInterview = await interviewService.schedule({
        studentId,
        student: {
          id: selectedStudent.id,
          name: selectedStudent.name,
          email: selectedStudent.email,
          department: selectedStudent.department,
          cgpa: selectedStudent.cgpa,
        },
        companyId,
        company: {
          id: selectedCompany.id,
          name: selectedCompany.name,
          logo: selectedCompany.logo,
        },
        date,
        time,
        round: parseInt(round),
        type,
        mode,
        meetingLink: mode === 'video' ? 'https://meet.google.com/xyz-qprs-tuv' : undefined,
      });

      setInterviews(prev => [newInterview as Interview, ...prev]);
      setIsModalOpen(false);
      toast.success('Interview scheduled successfully');
      // Reset
      setStudentId('');
      setCompanyId('');
      setDate('');
      setTime('');
      setConflictWarning(null);
    } catch {
      toast.error('Failed to schedule interview');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await interviewService.updateStatus(id, newStatus);
      toast.success(`Interview marked as ${newStatus}`);
      fetchInterviews();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredInterviews = interviews.filter(i =>
    i.student.name.toLowerCase().includes(search.toLowerCase()) ||
    i.company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper
      title="Interviews"
      subtitle={`${filteredInterviews.length} interviews scheduled`}
      breadcrumbs={[{ label: 'College' }, { label: 'Interviews' }]}
      actions={
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Schedule Interview
        </Button>
      }
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <Input
          placeholder="Search by student name or company name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-44"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No interviews scheduled"
          description="Click Schedule Interview to coordinate a meeting."
          action={{ label: 'Schedule Interview', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id} className="p-5 hover:shadow-elevated transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={interview.student.name} size="sm" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{interview.student.name}</h3>
                    <p className="text-xs text-slate-500">{interview.student.department} · CGPA {interview.student.cgpa}</p>
                  </div>
                </div>
                <Badge variant={interview.status === 'completed' ? 'green' : interview.status === 'scheduled' ? 'blue' : 'slate'}>
                  {interview.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <div>
                  <span className="font-semibold block text-[10px] uppercase text-slate-400">Recruiter</span>
                  <span>{interview.company.name}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] uppercase text-slate-400">Round</span>
                  <span>Round {interview.round} ({interview.type.toUpperCase()})</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] uppercase text-slate-400">Time & Date</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{formatTime(interview.time)} · {formatDate(interview.date)}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] uppercase text-slate-400">Interview Mode</span>
                  <span className="flex items-center gap-1">
                    {interview.mode === 'video' ? <Video className="w-3 h-3 text-slate-400" /> : <User className="w-3 h-3 text-slate-400" />}
                    {interview.mode}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                {interview.status === 'scheduled' && (
                  <>
                    <Button variant="ghost" size="sm" className="text-emerald-600 font-semibold" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleUpdateStatus(interview.id, 'completed')}>
                      Complete
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 font-semibold" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleUpdateStatus(interview.id, 'cancelled')}>
                      Cancel
                    </Button>
                  </>
                )}
                {interview.meetingLink && interview.status === 'scheduled' && (
                  <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline ml-auto flex items-center gap-1 font-semibold">
                    Join Call <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Scheduler Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Student Interview">
        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Student</label>
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            >
              <option value="">-- Choose Candidate --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Company</label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            >
              <option value="">-- Choose Company --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interview Date</label>
              <Input
                type="date"
                value={date}
                onChange={e => handleTimeDateChange(e.target.value, time)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interview Time</label>
              <Input
                type="time"
                value={time}
                onChange={e => handleTimeDateChange(date, e.target.value)}
                required
              />
            </div>
          </div>

          {conflictWarning && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 rounded-xl flex items-start gap-2 text-xs">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Round Number</label>
              <Select
                value={round}
                onChange={e => setRound(e.target.value)}
                options={['1', '2', '3', '4'].map(r => ({ value: r, label: `Round ${r}` }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Round Type</label>
              <Select
                value={type}
                onChange={e => setType(e.target.value as 'technical')}
                options={[
                  { value: 'technical', label: 'Technical' },
                  { value: 'hr', label: 'HR Round' },
                  { value: 'managerial', label: 'Managerial' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interview Mode</label>
              <Select
                value={mode}
                onChange={e => setMode(e.target.value as 'video')}
                options={[
                  { value: 'video', label: 'Video Call' },
                  { value: 'in-person', label: 'In Person' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule Interview</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

// Quick helper
const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

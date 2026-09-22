import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock, AlertTriangle, Check, X, ShieldAlert, Plus, Search, Video } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, Modal, EmptyState, Skeleton } from '../../components/ui';
import { interviewService, studentService, companyService, departmentService } from '../../services';
import { formatDate, formatTime } from '../../utils';
import { toast } from 'sonner';
import type { Interview, Student, Company, Department } from '../../types';
import { useAuthStore } from '../../store';

export const CollegeInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  // Form State
  const [studentId, setStudentId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
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
      const [res, sList, cList, dList] = await Promise.all([
        interviewService.getAll({ page: 1, limit: 100 }),
        studentService.getAll({ limit: 1000 }),
        companyService.getAll({ limit: 100 }),
        departmentService.getAll(user?.tenantId || ''),
      ]);
      setInterviews(res.data);
      setStudents(sList.data);
      setCompanies(cList.data);
      setDepartments(dList);
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
      setSelectedDeptId('');
      setStudentSearch('');
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

  const filteredInterviews = interviews.filter(i => {
    const studentName = i.student?.name || 'Unknown Candidate';
    const companyName = i.company?.name || 'Unknown Company';
    const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase()) || companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by student name or company name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  statusFilter === tab
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table View */}
      {loading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No interviews found"
          description="Try adjusting your search or filters to see results."
          action={{ label: 'Schedule Interview', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <Card className="overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={interview.student?.name || 'Unknown'} size="sm" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{interview.student?.name || 'Unknown Candidate'}</p>
                          <p className="text-xs text-slate-500">{interview.student?.department || 'N/A'} · CGPA {interview.student?.cgpa || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {(interview.company?.name || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{interview.company?.name || 'Unknown Company'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(interview.date)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime(interview.time)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Round {interview.round} ({interview.type.toUpperCase()})
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 uppercase font-medium tracking-wide">
                          {interview.mode === 'video' ? <Video className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {interview.mode}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={interview.status === 'completed' ? 'green' : interview.status === 'scheduled' ? 'blue' : 'slate'}>
                        {interview.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        {interview.status === 'scheduled' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold px-2" onClick={() => handleUpdateStatus(interview.id, 'completed')}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold px-2" onClick={() => handleUpdateStatus(interview.id, 'cancelled')}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {interview.meetingLink && interview.status === 'scheduled' && (
                          <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300 text-xs font-semibold transition-colors">
                            Join Call <ArrowUpRight className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Scheduler Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Student Interview">
        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Department</label>
            <select
              value={selectedDeptId}
              onChange={e => { setSelectedDeptId(e.target.value); setStudentId(''); }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
            >
              <option value="">-- All Departments --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Search & Select Student</label>
            <Input 
              placeholder="Type to search student name..."
              value={studentSearch}
              onChange={e => { setStudentSearch(e.target.value); setStudentId(''); }}
              className="mb-2"
            />
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            >
              <option value="">-- Choose Candidate --</option>
              {students.filter(s => {
                const matchesDept = selectedDeptId ? s.departmentId === selectedDeptId : true;
                const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase());
                return matchesDept && matchesSearch;
              }).map(s => (
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

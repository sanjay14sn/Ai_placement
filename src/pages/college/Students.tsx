import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, Plus, Eye, Mail, MoreHorizontal, GraduationCap } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, Progress, Pagination, EmptyState, Skeleton, Modal } from '../../components/ui';
import { studentService, collegeService, departmentService } from '../../services';
import { getStatusColor, formatDate, cn } from '../../utils';
import { toast } from 'sonner';
import { useAuthStore } from '../../store';
import type { Student, Department } from '../../types';

export const StudentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('department') || searchParams.get('dept') || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dept, setDept] = useState(initialDept);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);

  useEffect(() => {
    const urlDept = searchParams.get('department') || searchParams.get('dept') || '';
    if (urlDept !== dept) {
      setDept(urlDept);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Add Student State
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  interface StudentFormState {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    collegeId: string;
    department: string;
    degree: string;
    batch: string;
    cgpa: number;
    gender: 'male' | 'female' | 'other';
    skillsInput: string;
    offersCount: number;
  }

  const initialFormState: StudentFormState = {
    name: '',
    studentId: '',
    email: '',
    phone: '',
    collegeId: '',
    department: 'CSE',
    degree: 'B.E.',
    batch: '2025',
    cgpa: 0,
    gender: 'male',
    skillsInput: '',
    offersCount: 0
  };

  const [formState, setFormState] = useState<StudentFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCollegesAndDepartments = async () => {
    try {
      const [collegesRes, deptRes] = await Promise.all([
        collegeService.getAll({ limit: 100 }),
        departmentService.getAll(user?.tenantId || '')
      ]);
      let mapped = collegesRes.data.map(c => ({ id: c.id, name: c.name }));
      if (user?.tenantId) {
        mapped = mapped.filter(c => c.id === user.tenantId);
      }
      setColleges(mapped);
      if (mapped.length > 0) {
        setFormState(prev => ({ ...prev, collegeId: mapped[0].id }));
      }
      setDepartmentsList(deptRes);
    } catch {
      toast.error('Failed to load initial data');
    }
  };

  useEffect(() => {
    fetchCollegesAndDepartments();
  }, [user?.tenantId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) errors.name = 'Name is required';
    if (!formState.studentId.trim()) errors.studentId = 'Roll ID is required';
    if (!formState.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formState.email)) errors.email = 'Invalid email address';
    if (!formState.phone.trim()) errors.phone = 'Phone number is required';
    if (!formState.collegeId) errors.collegeId = 'College selection is required';
    if (!formState.department) errors.department = 'Department is required';
    if (!formState.degree) errors.degree = 'Degree is required';
    if (!formState.batch) errors.batch = 'Batch is required';
    if (formState.cgpa < 0 || formState.cgpa > 10) errors.cgpa = 'CGPA must be between 0 and 10';
    if (formState.offersCount < 0) errors.offersCount = 'Offers count cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const skills = formState.skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await studentService.create({
        name: formState.name.trim(),
        studentId: formState.studentId.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        collegeId: formState.collegeId,
        department: formState.department,
        degree: formState.degree,
        batch: formState.batch,
        cgpa: formState.cgpa,
        gender: formState.gender,
        offersCount: formState.offersCount,
        skills,
      });

      toast.success('Student added successfully!');
      setIsAddModalOpen(false);
      setFormState({
        ...initialFormState,
        collegeId: colleges[0]?.id || ''
      });
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setActionLoading(false);
    }
  };

  const LIMIT = 10;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ search, department: dept || undefined, placementStatus: status || undefined, page, limit: LIMIT });
      setStudents(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [search, dept, status, page]);

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      await studentService.update(studentId, { placementStatus: newStatus as any });
      toast.success('Status updated');
      fetchStudents();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const placementBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'green' | 'amber' | 'red' | 'slate' }> = {
      placed: { label: 'Placed', variant: 'green' },
      not_placed: { label: 'Seeking', variant: 'amber' },
      not_eligible: { label: 'Not Eligible', variant: 'red' },
      opted_out: { label: 'Opted Out', variant: 'slate' },
    };
    const b = map[status] || { label: status, variant: 'slate' as const };
    return <Badge variant={b.variant}>{b.label}</Badge>;
  };

  return (
    <PageWrapper
      title="Students"
      subtitle={`${total} students`}
      breadcrumbs={[{ label: 'College' }, { label: 'Students' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.success('Exporting CSV...')}>
            Export
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => toast.info('Opening import wizard...')}>
            Import
          </Button>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => {
            setFormState({
              ...initialFormState,
              collegeId: colleges[0]?.id || ''
            });
            setFormErrors({});
            setIsAddModalOpen(true);
          }}>
            Add Student
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by Name or Register Number..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={dept}
            onChange={e => {
              const selected = e.target.value;
              setDept(selected);
              setPage(1);
              if (selected) {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('department', selected);
                  return next;
                });
              } else {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.delete('department');
                  next.delete('dept');
                  return next;
                });
              }
            }}
            placeholder="All Departments"
            options={departmentsList.map(d => ({ value: d.code, label: d.code }))}
            className="sm:w-48"
          />
          <Select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            placeholder="All Statuses"
            options={[
              { value: 'placed', label: 'Placed' },
              { value: 'not_placed', label: 'Seeking' },
              { value: 'not_eligible', label: 'Not Eligible' },
              { value: 'opted_out', label: 'Opted Out' },
            ]}
            className="sm:w-44"
          />
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: total, color: 'text-slate-900 dark:text-white' },
          { label: 'Eligible', value: students.filter(s => s.isEligible).length, color: 'text-brand-600 dark:text-brand-400' },
          { label: 'Placed', value: students.filter(s => s.placementStatus === 'placed').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'With Resume', value: students.filter(s => !!s.resume).length, color: 'text-ai-600 dark:text-ai-400' },
        ].map(stat => (
          <Card key={stat.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dept / Batch</th>
                <th>CGPA</th>
                <th>Skills</th>
                <th>Profile</th>
                <th>Resume</th>
                <th>Applications</th>
                <th>Offers</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={<GraduationCap className="w-6 h-6" />}
                      title="No students found"
                      description="Try adjusting your search filters"
                    />
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="cursor-pointer" onClick={() => navigate(`/college/students/${student.id}`)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{student.department}</p>
                      <p className="text-xs text-slate-400">{student.batch}</p>
                    </td>
                    <td>
                      <span className={cn('font-semibold text-sm',
                        student.cgpa >= 8 ? 'text-emerald-600' :
                        student.cgpa >= 7 ? 'text-brand-600' : 'text-amber-600'
                      )}>
                        {student.cgpa}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {student.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="slate" className="text-[10px]">{skill}</Badge>
                        ))}
                        {student.skills.length > 3 && (
                          <Badge variant="slate" className="text-[10px]">+{student.skills.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 w-24">
                        <Progress value={student.profileCompletion} size="sm" color={student.profileCompletion >= 80 ? 'green' : student.profileCompletion >= 60 ? 'brand' : 'amber'} />
                        <span className="text-xs text-slate-500">{student.profileCompletion}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={student.resume ? 'green' : 'red'}>
                        {student.resume ? 'Uploaded' : 'Missing'}
                      </Badge>
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">
                      {student.applications}
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">
                      {student.offersCount || 0}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="text-xs font-medium rounded px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        value={student.placementStatus}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      >
                        <option value="not_placed">Seeking</option>
                        <option value="placed">Placed</option>
                        <option value="not_eligible">Not Eligible</option>
                        <option value="opted_out">Opted Out</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/college/students/${student.id}`)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toast.success(`Notification sent to ${student.name}`)}>
                          <Mail className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && students.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Student"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button loading={actionLoading} onClick={handleAddSubmit}>Create Student</Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formState.name}
              onChange={e => setFormState({ ...formState, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              error={formErrors.name}
              required
            />
            <Input
              label="Student ID / Roll No"
              value={formState.studentId}
              onChange={e => setFormState({ ...formState, studentId: e.target.value })}
              placeholder="e.g. 1RV21CS045"
              error={formErrors.studentId}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formState.email}
              onChange={e => setFormState({ ...formState, email: e.target.value })}
              placeholder="e.g. rahul@rvce.edu.in"
              error={formErrors.email}
              required
            />
            <Input
              label="Phone Number"
              value={formState.phone}
              onChange={e => setFormState({ ...formState, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
              error={formErrors.phone}
              required
            />
            <Select
              label="College"
              value={formState.collegeId}
              onChange={e => setFormState({ ...formState, collegeId: e.target.value })}
              placeholder="Select College"
              options={colleges.map(c => ({ value: c.id, label: c.name }))}
              error={formErrors.collegeId}
              required
            />
            <Select
              label="Department"
              value={formState.department}
              onChange={e => setFormState({ ...formState, department: e.target.value })}
              placeholder="Select Department"
              options={departmentsList.map(d => ({ value: d.code, label: `${d.name} (${d.code})` }))}
              error={formErrors.department}
              required
            />
            <Select
              label="Degree"
              value={formState.degree}
              onChange={e => setFormState({ ...formState, degree: e.target.value })}
              placeholder="Select Degree"
              options={[
                { value: 'B.E.', label: 'B.E.' },
                { value: 'B.Tech', label: 'B.Tech' },
                { value: 'MCA', label: 'MCA' },
                { value: 'MBA', label: 'MBA' }
              ]}
              error={formErrors.degree}
              required
            />
            <Input
              label="Batch Year"
              value={formState.batch}
              onChange={e => setFormState({ ...formState, batch: e.target.value })}
              placeholder="e.g. 2025"
              error={formErrors.batch}
              required
            />
            <Input
              label="CGPA"
              type="number"
              step="0.01"
              value={formState.cgpa}
              onChange={e => setFormState({ ...formState, cgpa: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 8.50"
              error={formErrors.cgpa}
              required
            />
            <Select
              label="Gender"
              value={formState.gender}
              onChange={e => setFormState({ ...formState, gender: e.target.value as 'male' | 'female' | 'other' })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
              error={formErrors.gender}
              required
            />
            <Input
              label="Number of Offers"
              type="number"
              value={formState.offersCount}
              onChange={e => setFormState({ ...formState, offersCount: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 1"
              error={formErrors.offersCount}
            />
            <div className="md:col-span-2">
              <Input
                label="Skills Focus (comma-separated)"
                value={formState.skillsInput}
                onChange={e => setFormState({ ...formState, skillsInput: e.target.value })}
                placeholder="e.g. Java, React, SQL, HTML"
                hint="Enter skills separated by commas"
              />
            </div>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

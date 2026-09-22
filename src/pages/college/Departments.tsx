import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit2,
  User,
  Briefcase,
  GraduationCap,
  Users
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Cell } from 'recharts';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Progress, Modal, ConfirmDialog, StatCard, EmptyState } from '../../components/ui';
import { departmentService } from '../../services';
import { toast } from 'sonner';
import type { Department } from '../../types';
import { useAuthStore } from '../../store';

interface FormState {
  name: string;
  code: string;
  hod: string;
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  avgPackage: number;
  activeJobs: number;
  skillsInput: string;
}

const initialFormState: FormState = {
  name: '',
  code: '',
  hod: '',
  totalStudents: 60,
  eligibleStudents: 50,
  placedStudents: 0,
  avgPackage: 0,
  activeJobs: 0,
  skillsInput: ''
};

export const CollegeDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { user } = useAuthStore();
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Active/Current department state
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  
  // Form State
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const collegeId = user?.tenantId || '';
      const data = await departmentService.getAll(collegeId);
      setDepartments([...data]);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [user?.tenantId]);

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) errors.name = 'Department Name is required';
    else if (formState.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
    
    if (!formState.code.trim()) errors.code = 'Department Code is required';
    else if (!/^[A-Z0-9]{2,10}$/.test(formState.code.trim())) {
      errors.code = 'Code must be 2-10 uppercase alphanumeric characters';
    } else if (!currentDept && departments.some(d => d.code === formState.code.trim())) {
      errors.code = 'A department with this code already exists';
    }

    if (!formState.hod.trim()) errors.hod = 'HOD Name is required';
    
    if (formState.avgPackage < 0) errors.avgPackage = 'Average Package cannot be negative';
    if (formState.activeJobs < 0) errors.activeJobs = 'Active Jobs cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add Department handler
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setActionLoading(true);
    try {
      const skills = formState.skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
      await departmentService.create({
        collegeId: user?.tenantId || '',
        name: formState.name.trim(),
        code: formState.code.trim(),
        hod: formState.hod.trim(),
        avgPackage: formState.avgPackage,
        topSkills: skills,
        activeJobs: formState.activeJobs
      });
      
      toast.success('Department added successfully!');
      setIsAddModalOpen(false);
      setFormState(initialFormState);
      fetchDepartments();
    } catch {
      toast.error('Failed to add department');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Click handler
  const handleEditClick = (dept: Department) => {
    setCurrentDept(dept);
    setFormState({
      name: dept.name,
      code: dept.code,
      hod: dept.hod,
      totalStudents: dept.totalStudents,
      eligibleStudents: dept.eligibleStudents,
      placedStudents: dept.placedStudents,
      avgPackage: dept.avgPackage,
      activeJobs: dept.activeJobs,
      skillsInput: dept.topSkills.join(', ')
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Edit Department handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept || !validateForm()) return;
    
    setActionLoading(true);
    try {
      const skills = formState.skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
      await departmentService.update(currentDept.id, {
        name: formState.name.trim(),
        code: formState.code.trim(),
        hod: formState.hod.trim(),
        avgPackage: formState.avgPackage,
        topSkills: skills,
        activeJobs: formState.activeJobs
      });
      
      toast.success('Department updated successfully!');
      setIsEditModalOpen(false);
      setCurrentDept(null);
      setFormState(initialFormState);
      fetchDepartments();
    } catch {
      toast.error('Failed to update department');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Click handler
  const handleDeleteClick = (dept: Department) => {
    setCurrentDept(dept);
    setIsDeleteConfirmOpen(true);
  };

  // Delete Department handler
  const handleDeleteConfirm = async () => {
    if (!currentDept) return;
    setActionLoading(true);
    try {
      await departmentService.delete(currentDept.id);
      toast.success('Department deleted successfully!');
      setIsDeleteConfirmOpen(false);
      setCurrentDept(null);
      fetchDepartments();
    } catch {
      toast.error('Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  // Overall Statistics Calculations
  const totalIntake = departments.reduce((acc, d) => acc + d.totalStudents, 0);
  const totalEligible = departments.reduce((acc, d) => acc + d.eligibleStudents, 0);
  const totalPlaced = departments.reduce((acc, d) => acc + d.placedStudents, 0);
  const totalActiveJobs = departments.reduce((acc, d) => acc + (d.activeJobs || 0), 0);
  
  const overallPlacementPercent = totalEligible > 0 
    ? Math.round((totalPlaced / totalEligible) * 100) 
    : 0;
    
  const overallAvgPackage = departments.length > 0
    ? Number((departments.reduce((acc, d) => acc + d.avgPackage, 0) / departments.length).toFixed(1))
    : 0;

  // Search and Sort Filtering
  const filteredDepartments = departments
    .filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.hod.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'placement') return b.placementPercent - a.placementPercent;
      if (sortBy === 'salary') return b.avgPackage - a.avgPackage;
      if (sortBy === 'students') return b.totalStudents - a.totalStudents;
      return 0;
    });

  // Recharts color palettes
  const CHART_COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  return (
    <PageWrapper
      title="Departments"
      subtitle={`${departments.length} departments registered`}
      breadcrumbs={[{ label: 'College' }, { label: 'Departments' }]}
      actions={
        <Button 
          size="sm" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormState(initialFormState);
            setFormErrors({});
            setIsAddModalOpen(true);
          }}
        >
          Add Department
        </Button>
      }
    >
      {/* 1. Stat Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl h-24 border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Departments" 
            value={departments.length} 
            icon={<BookOpen className="w-5 h-5" />} 
            color="slate" 
          />
          <StatCard 
            title="Total Intake" 
            value={totalIntake} 
            icon={<Users className="w-5 h-5" />} 
            color="brand" 
          />
          <StatCard 
            title="Eligible Students" 
            value={totalEligible} 
            icon={<GraduationCap className="w-5 h-5" />} 
            color="purple" 
          />
          <StatCard 
            title="Active Jobs" 
            value={totalActiveJobs} 
            icon={<Briefcase className="w-5 h-5" />} 
            color="amber" 
          />
        </div>
      )}

      {/* 3. Filters & Search Section */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by department name, code, HOD..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            placeholder="Sort by"
            options={[
              { value: 'name', label: 'Name (A-Z)' },
              { value: 'placement', label: 'Placement Rate' },
              { value: 'salary', label: 'Avg Package' },
              { value: 'students', label: 'Intake Size' },
            ]}
            className="sm:w-56"
          />
        </div>
      </Card>

      {/* 4. Departments Table List */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>HOD</th>
                <th>Intake</th>
                <th>Placed / Eligible</th>
                <th>Avg Package</th>
                <th>Active Jobs</th>
                <th>Placement %</th>
                <th>Top Skills</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={<BookOpen className="w-6 h-6" />}
                      title="No departments found"
                      description={search ? "Try adjusting your search criteria" : "Click 'Add Department' to create one"}
                      action={search ? undefined : {
                        label: 'Add Department',
                        onClick: () => {
                          setFormState(initialFormState);
                          setFormErrors({});
                          setIsAddModalOpen(true);
                        }
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredDepartments.map(dept => {
                  const pct = dept.placementPercent !== undefined && dept.placementPercent > 0
                    ? dept.placementPercent
                    : (dept.eligibleStudents > 0 ? Math.round((dept.placedStudents / dept.eligibleStudents) * 100) : 0);
                  const progressColor = pct >= 80 ? 'green' : pct >= 60 ? 'brand' : pct >= 40 ? 'amber' : 'red';
                  const pctText = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-brand-600 dark:text-brand-400' : pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400';

                  return (
                    <tr 
                      key={dept.id} 
                      className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => navigate(`/college/departments/${dept.id}`)}
                    >
                      {/* Department name + code */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-ai-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">{dept.code}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">{dept.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {dept.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* HOD */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{dept.hod}</span>
                        </div>
                      </td>

                      {/* Total intake */}
                      <td>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{dept.totalStudents}</span>
                        <span className="text-xs text-slate-400 ml-1">students</span>
                      </td>

                      {/* Placed / Eligible */}
                      <td>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{dept.placedStudents}</span>
                        <span className="text-xs text-slate-400 mx-1">/</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{dept.eligibleStudents}</span>
                      </td>

                      {/* Avg Package */}
                      <td>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                          ₹{dept.avgPackage ? dept.avgPackage.toLocaleString('en-IN') : '—'}
                        </span>
                        {dept.avgPackage > 0 && <span className="text-xs text-slate-400 ml-1">LPA</span>}
                      </td>

                      {/* Active Jobs */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{dept.activeJobs}</span>
                        </div>
                      </td>

                      {/* Placement % with progress bar */}
                      <td>
                        <div className="flex items-center gap-2 min-w-[110px]">
                          <Progress value={pct} size="sm" color={progressColor} className="flex-1" />
                          <span className={`text-xs font-bold tabular-nums w-8 text-right ${pctText}`}>{pct}%</span>
                        </div>
                      </td>

                      {/* Skills */}
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {dept.topSkills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="slate" className="text-[10px] py-0.5 px-1.5">{skill}</Badge>
                          ))}
                          {dept.topSkills.length > 3 && (
                            <Badge variant="slate" className="text-[10px] py-0.5 px-1.5">+{dept.topSkills.length - 3}</Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/college/students?department=${dept.code}`)}
                            title={`View ${dept.code} Students`}
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-brand-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(dept)}
                            title="Edit Department"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(dept)}
                            title="Delete Department"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Visual Analytics Section (Placed at bottom) */}
      {!loading && departments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Placement Rates Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Placement Progress (%)</h3>
              <Badge variant="green" dot>Active Drives</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departments.map(d => ({
                ...d,
                placementPercent: d.placementPercent || (d.eligibleStudents > 0 ? Math.round((d.placedStudents / d.eligibleStudents) * 100) : 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <ChartTooltip formatter={(value) => [`${value}%`, 'Placement Rate']} />
                <Bar dataKey="placementPercent" radius={[4, 4, 0, 0]}>
                  {departments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Average Package Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Avg CTC Package (LPA)</h3>
              <Badge variant="blue">₹ Lakhs Per Annum</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" L" />
                <ChartTooltip formatter={(value) => [`₹${value} LPA`, 'Average CTC']} />
                <Bar dataKey="avgPackage" radius={[4, 4, 0, 0]}>
                  {departments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* 5. Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add College Department"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button loading={actionLoading} onClick={handleAddSubmit}>Create Department</Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              value={formState.name}
              onChange={e => setFormState({ ...formState, name: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              error={formErrors.name}
              required
            />
            <Input
              label="Department Code"
              value={formState.code}
              onChange={e => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CSE"
              error={formErrors.code}
              required
            />
            <Input
              label="Head of Department (HOD)"
              value={formState.hod}
              onChange={e => setFormState({ ...formState, hod: e.target.value })}
              placeholder="e.g. Dr. Rajesh Kumar"
              error={formErrors.hod}
              required
            />
            <Input
              label="Average CTC Package (LPA)"
              type="number"
              step="0.1"
              value={formState.avgPackage}
              onChange={e => setFormState({ ...formState, avgPackage: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 7.5"
              error={formErrors.avgPackage}
            />
            <Input
              label="Active Recruiting Jobs"
              type="number"
              value={formState.activeJobs}
              onChange={e => setFormState({ ...formState, activeJobs: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 15"
              error={formErrors.activeJobs}
            />
            <div className="md:col-span-2">
              <Input
                label="Top Skills Focus (comma-separated)"
                value={formState.skillsInput}
                onChange={e => setFormState({ ...formState, skillsInput: e.target.value })}
                placeholder="e.g. Java, React, SQL, TypeScript"
                hint="Enter skills separated by commas"
                error={formErrors.skillsInput}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 6. Edit Department Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Department: ${currentDept?.code}`}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button loading={actionLoading} onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              value={formState.name}
              onChange={e => setFormState({ ...formState, name: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              error={formErrors.name}
              required
            />
            <Input
              label="Department Code"
              value={formState.code}
              onChange={e => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CSE"
              error={formErrors.code}
              required
            />
            <Input
              label="Head of Department (HOD)"
              value={formState.hod}
              onChange={e => setFormState({ ...formState, hod: e.target.value })}
              placeholder="e.g. Dr. Rajesh Kumar"
              error={formErrors.hod}
              required
            />
            <Input
              label="Average CTC Package (LPA)"
              type="number"
              step="0.1"
              value={formState.avgPackage}
              onChange={e => setFormState({ ...formState, avgPackage: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 7.5"
              error={formErrors.avgPackage}
            />
            <Input
              label="Active Recruiting Jobs"
              type="number"
              value={formState.activeJobs}
              onChange={e => setFormState({ ...formState, activeJobs: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 15"
              error={formErrors.activeJobs}
            />
            <div className="md:col-span-2">
              <Input
                label="Top Skills Focus (comma-separated)"
                value={formState.skillsInput}
                onChange={e => setFormState({ ...formState, skillsInput: e.target.value })}
                placeholder="e.g. Java, React, SQL, TypeScript"
                hint="Enter skills separated by commas"
                error={formErrors.skillsInput}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 7. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete the ${currentDept?.name} (${currentDept?.code}) department? All associated analytics metrics for this department will be removed from this view. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  User,
  Star
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Progress, StatCard } from '../../components/ui';
import { departmentService } from '../../services';
import type { Department } from '../../types';
import { toast } from 'sonner';

export const DepartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await departmentService.getById(id);
        setDepartment(data);
      } catch (error) {
        toast.error('Failed to load department details');
        navigate('/college/departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id, navigate]);

  if (loading || !department) {
    return (
      <PageWrapper title="Loading..." breadcrumbs={[{ label: 'Departments', to: '/college/departments' }, { label: 'Loading' }]}>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const pct = department.placementPercent !== undefined && department.placementPercent > 0
    ? department.placementPercent
    : (department.eligibleStudents > 0 ? Math.round((department.placedStudents / department.eligibleStudents) * 100) : 0);
  
  const progressColor = pct >= 80 ? 'green' : pct >= 60 ? 'brand' : pct >= 40 ? 'amber' : 'red';
  const pctText = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-brand-600 dark:text-brand-400' : pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400';

  return (
    <PageWrapper
      title={`${department.name} Details`}
      subtitle={`ID: ${department.id}`}
      breadcrumbs={[
        { label: 'College' },
        { label: 'Departments', to: '/college/departments' },
        { label: department.code }
      ]}
      actions={
        <Button 
          variant="outline" 
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/college/departments')}
        >
          Back to Departments
        </Button>
      }
    >
      {/* 1. Hero Header */}
      <Card className="mb-6 p-6 md:p-8 bg-gradient-to-r from-brand-600 to-indigo-600 border-none shadow-lg shadow-brand-500/20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-3xl font-bold tracking-tight text-white">{department.code}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{department.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-brand-100 text-sm">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                <User className="w-4 h-4" />
                <span>HOD: <strong>{department.hod}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                <Briefcase className="w-4 h-4" />
                <span>Avg Package: <strong>₹{department.avgPackage.toLocaleString('en-IN')} LPA</strong></span>
              </div>
            </div>
          </div>
          <div className="md:ml-auto">
             <Button 
                variant="secondary" 
                leftIcon={<Users className="w-4 h-4" />}
                onClick={() => navigate(`/college/students?department=${department.code}`)}
                className="bg-white text-brand-700 hover:bg-slate-50 w-full md:w-auto"
              >
                View Department Students
              </Button>
          </div>
        </div>
      </Card>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Registered" 
          value={department.totalStudents} 
          icon={<Users className="w-5 h-5" />} 
          color="brand" 
        />
        <StatCard 
          title="Eligible Students" 
          value={department.eligibleStudents} 
          icon={<GraduationCap className="w-5 h-5" />} 
          color="purple" 
        />
        <StatCard 
          title="Placed Students" 
          value={department.placedStudents} 
          icon={<Star className="w-5 h-5" />} 
          color="green" 
        />
        <StatCard 
          title="Active Jobs" 
          value={department.activeJobs} 
          icon={<Briefcase className="w-5 h-5" />} 
          color="amber" 
        />
      </div>

      {/* 3. Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Placement Rate Card */}
        <Card className="lg:col-span-1 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-6">Overall Placement Rate</h3>
          <div className="relative w-36 h-36 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className={pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-brand-500' : 'text-amber-500'}
                strokeDasharray={`${pct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold tracking-tight ${pctText}`}>{pct}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Placed</span>
            </div>
          </div>
          <Progress value={pct} color={progressColor} className="w-full mb-2" />
          <p className="text-sm text-slate-500">
            {department.placedStudents} out of {department.eligibleStudents} eligible students placed
          </p>
        </Card>

        {/* Top Skills Card */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            Top Core Skills & Technologies
          </h3>
          {department.topSkills && department.topSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {department.topSkills.map((skill, i) => (
                <Badge key={i} variant="indigo" className="px-4 py-2 text-sm shadow-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No core skills registered for this department.</p>
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-500" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/college/students?department=${department.code}`)}
              >
                View Directory
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/college/jobs?department=${department.code}`)}
              >
                View Targeted Jobs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/college/analytics?department=${department.code}`)}
              >
                View Deep Analytics
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

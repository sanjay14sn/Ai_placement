import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, MapPin, GraduationCap, Award, FileText,
  Globe, Briefcase, Code, Edit3, Plus, Trash2,
  Save, CheckCircle2, Sparkles, ExternalLink, ShieldCheck, Calendar,
  DollarSign, Building2, Check, X
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, AIBadge, ProgressRing, Progress, Avatar, Input, Select, Modal } from '../../components/ui';
import { studentService, uploadService } from '../../services';
import type { Student, Project, Certification, Education } from '../../types';
import { toast } from 'sonner';

export const StudentProfilePage: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'education' | 'skills' | 'projects' | 'resume'>('overview');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Forms State
  const initialCertForm = { name: '', issuer: '', issueDate: '', url: '' };
  const [certForm, setCertForm] = useState(initialCertForm);
  const certFileRef = React.useRef<HTMLInputElement>(null);
  
  const initialProjectForm = { title: '', description: '', duration: '', technologies: '', githubUrl: '' };
  const [projectForm, setProjectForm] = useState(initialProjectForm);

  const initialExpForm = { company: '', role: '', type: 'internship', startDate: '', endDate: '', description: '' };
  const [expForm, setExpForm] = useState(initialExpForm);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    preferredLocations: '',
    preferredRoles: '',
    expectedSalary: 8,
    city: '',
    state: '',
    studentId: '',
    gender: 'female',
    dob: '2002-04-14',
    department: 'CSE',
    batch: '2025',
  });

  // New Skill Input
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    studentService.getMyProfile()
      .then(s => {
        setStudent(s);
        if (s) {
          setEditForm({
            name: s.name,
            phone: s.phone,
            email: s.email,
            linkedIn: s.linkedIn || '',
            github: s.github || '',
            portfolio: s.portfolio || '',
            preferredLocations: s.preferredLocations.join(', '),
            preferredRoles: s.preferredRoles.join(', '),
            expectedSalary: s.expectedSalary,
            city: s.address.city,
            state: s.address.state,
            studentId: s.studentId,
            gender: s.gender,
            dob: s.dob,
            department: s.department,
            batch: s.batch,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = () => {
    if (!student) return;
    const updated: Student = {
      ...student,
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      studentId: editForm.studentId,
      gender: editForm.gender as 'male' | 'female' | 'other',
      dob: editForm.dob,
      department: editForm.department,
      batch: editForm.batch,
      linkedIn: editForm.linkedIn,
      github: editForm.github,
      portfolio: editForm.portfolio,
      preferredLocations: editForm.preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
      preferredRoles: editForm.preferredRoles.split(',').map(s => s.trim()).filter(Boolean),
      expectedSalary: Number(editForm.expectedSalary),
      address: {
        ...student.address,
        city: editForm.city,
        state: editForm.state,
      },
    };
    setStudent(updated);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !student) return;
    if (student.skills.includes(newSkill.trim())) {
      toast.error('Skill already exists!');
      return;
    }
    const updatedSkills = [...student.skills, newSkill.trim()];
    
    try {
      await studentService.update(student.id, { skills: updatedSkills });
      setStudent({
        ...student,
        skills: updatedSkills,
      });
      setNewSkill('');
      toast.success(`Added ${newSkill.trim()} to skills!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    // ... logic remains but we just inject handleResumeUpload below it
    if (!student) return;
    const updatedSkills = student.skills.filter(s => s !== skillToRemove);
    
    try {
      await studentService.update(student.id, { skills: updatedSkills });
      setStudent({
        ...student,
        skills: updatedSkills,
      });
      toast.success(`Removed ${skillToRemove}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove skill');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    setUploadingResume(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      const resumeData = {
        id: `res-${Date.now()}`,
        studentId: student.id,
        fileName: uploadRes.filename || file.name,
        fileUrl: uploadRes.url,
        uploadedAt: new Date().toISOString(),
        score: Math.floor(Math.random() * 20) + 70, // Mock score
        atsScore: Math.floor(Math.random() * 20) + 70, // Mock ATS score
        analysis: {
          overallScore: 80,
          sections: { skills: 80, projects: 70, atsKeywords: 60, formatting: 90, achievements: 50, experience: 85, education: 100 },
          strengths: ['Formatting', 'Education'],
          weaknesses: ['Achievements'],
          missingSkills: ['AWS'],
          missingKeywords: ['Docker'],
          suggestions: ['Add more keywords'],
          certificationRecommendations: ['AWS Certified Developer']
        }
      };

      await studentService.update(student.id, { resume: resumeData });
      
      setStudent(prev => prev ? { ...prev, resume: resumeData } : null);
      toast.success('Resume uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveCertification = async () => {
    if (!certForm.name || !certForm.issuer || !student) return toast.error('Please fill all required fields');
    setIsSaving(true);
    try {
      let fileUrl = certForm.url;
      const file = certFileRef.current?.files?.[0];
      if (file) {
        const uploadRes = await uploadService.uploadFile(file);
        fileUrl = uploadRes.url;
      }
      
      const newCert = { id: `cert-${Date.now()}`, name: certForm.name, issuer: certForm.issuer, issueDate: certForm.issueDate, url: fileUrl };
      const updatedCerts = [...student.certifications, newCert];
      await studentService.update(student.id, { certifications: updatedCerts });
      
      setStudent({ ...student, certifications: updatedCerts });
      setIsCertModalOpen(false);
      setCertForm(initialCertForm);
      toast.success('Certification added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save certification');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description || !student) return toast.error('Title and description required');
    setIsSaving(true);
    try {
      const newProject = { 
        id: `proj-${Date.now()}`, 
        title: projectForm.title, 
        description: projectForm.description, 
        duration: projectForm.duration, 
        technologies: projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
        githubUrl: projectForm.githubUrl,
        highlights: []
      };
      const updatedProjects = [...student.projects, newProject];
      await studentService.update(student.id, { projects: updatedProjects });
      
      setStudent({ ...student, projects: updatedProjects });
      setIsProjectModalOpen(false);
      setProjectForm(initialProjectForm);
      toast.success('Project added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveExperience = async () => {
    if (!expForm.company || !expForm.role || !student) return toast.error('Company and role required');
    setIsSaving(true);
    try {
      const newExp = { 
        id: `exp-${Date.now()}`, 
        company: expForm.company, 
        role: expForm.role, 
        type: expForm.type as any, 
        startDate: expForm.startDate, 
        endDate: expForm.endDate, 
        description: expForm.description,
        isCurrent: !expForm.endDate,
        skills: []
      };
      const updatedExp = [...student.experience, newExp];
      await studentService.update(student.id, { experience: updatedExp });
      
      setStudent({ ...student, experience: updatedExp });
      setIsExpModalOpen(false);
      setExpForm(initialExpForm);
      toast.success('Experience added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save experience');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !student) {
    return (
      <PageWrapper title="Student Profile" breadcrumbs={[{ label: 'Student' }, { label: 'Profile' }]}>
        <div className="space-y-6">
          {/* Header Profile Hero Card Shimmer */}
          <div className="relative rounded-3xl p-6 sm:p-8 mb-6 h-64 bg-slate-200 dark:bg-slate-800/80 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 h-full">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-2/3">
                <div className="w-24 h-24 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse shrink-0" />
                <div className="space-y-4 w-full flex flex-col items-center sm:items-start">
                  <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-4 w-64 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse" />
                  <div className="flex gap-3 mt-2 justify-center sm:justify-start">
                    <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse hidden sm:block" />
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-64 h-24 bg-slate-300 dark:bg-slate-700 rounded-2xl animate-pulse shrink-0 hidden lg:block" />
            </div>
          </div>

          {/* Navigation Tabs Shimmer */}
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6 pb-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 w-36 bg-slate-200 dark:bg-slate-800/80 rounded-lg animate-pulse shrink-0" />
            ))}
          </div>

          {/* Content Shimmer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Metrics */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700/80 rounded-xl animate-pulse" />
              ))}
            </div>

            {/* Left Column - Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="h-80 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
              </div>
            </div>

            {/* Right Column - Social & AI */}
            <div className="space-y-6">
              <div className="h-40 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
              </div>
              <div className="h-96 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Student Profile"
      subtitle="Manage your personal information, academic credentials, and placement readiness."
      breadcrumbs={[{ label: 'Student' }, { label: 'Profile' }]}
      actions={
        isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveProfile}>
              Save Profile
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )
      }
    >
      {/* ── Bold Gradient Profile Hero Card ─────────────────────────────── */}
      <div className="relative rounded-3xl mb-6 text-white overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 30%, #5b21b6 50%, #1d4ed8 75%, #0369a1 100%)' }}>
        {/* Decorative radial glow blobs */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full pointer-events-none opacity-25" style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 70%)', transform: 'translate(35%, -35%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)', transform: 'translate(-30%, 40%)' }} />
        {/* Mesh grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch">
          {/* Left Panel: Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 flex-1 text-center sm:text-left">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0">
              <div className="p-[3px] rounded-full" style={{ background: 'linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)' }}>
                <div className="p-0.5 rounded-full bg-indigo-950/80">
                  <Avatar name={student.name} size="xl" className="w-24 h-24 text-2xl font-black bg-indigo-900 text-white" />
                </div>
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 bg-white/15 backdrop-blur-md text-white rounded-full shadow-lg hover:scale-110 hover:bg-white/25 transition-all ring-2 ring-white/25 cursor-pointer"
                title="Change Avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1">
              {/* Name row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {student.name}
                </h1>
                <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white" title="Edit Profile">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Eligible pill */}
              <div className="flex justify-center sm:justify-start mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-white/10 border border-white/25 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {student.isEligible ? 'Eligible for Drives ✨' : 'Not Eligible'}
                </span>
              </div>

              {/* Student ID & degree */}
              <p className="text-xs sm:text-sm text-indigo-200 font-medium mb-4">
                <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded-md mr-1.5 border border-white/10">{student.studentId}</span>
                · {student.degree} in {student.department} ({student.batch} Batch)
              </p>

              {/* Contact pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-white/90 hover:bg-white/20 transition-all">
                  <Mail className="w-3.5 h-3.5 text-sky-300" /> {student.email}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-white/90 hover:bg-white/20 transition-all">
                  <Phone className="w-3.5 h-3.5 text-violet-300" /> {student.phone}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-white/90 hover:bg-white/20 transition-all">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" /> {student.address.city}, {student.address.state}
                </span>
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent my-6" />

          {/* Right Panel: Profile Completion */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:w-60 gap-4 border-t border-white/10 lg:border-t-0">
            <div className="relative">
              <ProgressRing
                value={student.profileCompletion}
                size={88}
                strokeWidth={8}
                color="#a78bfa"
                label={`${student.profileCompletion}%`}
                labelColor="text-white font-black text-lg"
              />
              <div className="absolute inset-0 rounded-full blur-xl opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <p className="text-xs font-extrabold text-white uppercase tracking-widest">Profile Completion</p>
              </div>
              <p className="text-[11px] text-indigo-200 font-medium leading-snug">
                {student.profileCompletion >= 85 ? 'Profile ready for TPO screening' : 'Add missing projects'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Details', icon: <User className="w-4 h-4" /> },
          { id: 'education', label: 'Academics & Education', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'skills', label: 'Skills & Certifications', icon: <Code className="w-4 h-4" /> },
          { id: 'projects', label: 'Projects & Experience', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'resume', label: 'Resume & Socials', icon: <FileText className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & DETAILS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Placement Metrics */}
          <Card className="lg:col-span-3 p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gradient-to-r from-brand-50/50 to-ai-50/50 dark:from-brand-950/20 dark:to-ai-950/20">
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400">Current CGPA</p>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{student.cgpa}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Scale of 10.0</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400">Active Backlogs</p>
              <p className={`text-2xl font-black mt-1 ${student.backlogs === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>{student.backlogs}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">History of backlogs: 0</p>
            </div>

            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400">Placement Readiness</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{student.placementReadinessScore}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Top 20% Rank</p>
            </div>
          </Card>

          {/* Personal Info Card */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Personal Information
              </h3>
              {!isEditing && (
                <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                  <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                  <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                  <Input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
                  <Input value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Expected Salary (LPA)</label>
                  <Input type="number" value={editForm.expectedSalary} onChange={e => setEditForm({ ...editForm, expectedSalary: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Preferred Locations (comma separated)</label>
                  <Input value={editForm.preferredLocations} onChange={e => setEditForm({ ...editForm, preferredLocations: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Preferred Roles (comma separated)</label>
                  <Input value={editForm.preferredRoles} onChange={e => setEditForm({ ...editForm, preferredRoles: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="text-slate-400 mb-1">Gender / DOB</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{student.gender} · {student.dob}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="text-slate-400 mb-1">Roll / Student ID</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{student.studentId}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="text-slate-400 mb-1">Department & Batch</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{student.department} ({student.batch})</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="text-slate-400 mb-1">Expected Salary</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹{student.expectedSalary} LPA</p>
                </div>
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="text-slate-400 mb-1">Preferred Work Locations</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {student.preferredLocations.map(loc => (
                      <Badge key={loc} variant="blue" className="text-[10px]">{loc}</Badge>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="text-slate-400 mb-1">Target Roles</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {student.preferredRoles.map(role => (
                      <Badge key={role} variant="purple" className="text-[10px]">{role}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Social Profiles & Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Online Profiles
              </h3>
              <div className="space-y-3 text-xs">
                {student.linkedIn && (
                  <a href={student.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Globe className="w-4 h-4 text-blue-600" /> LinkedIn
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {student.github && (
                  <a href={student.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Code className="w-4 h-4 text-slate-800 dark:text-slate-200" /> GitHub
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </Card>

            <Card className="p-6 border-ai-200 dark:border-ai-900/40 bg-gradient-to-br from-white to-ai-50 dark:from-slate-900 dark:to-ai-950/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-ai-600 dark:text-ai-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Profile Optimizer</h3>
                <AIBadge />
              </div>
              
              <div className="mb-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Optimization Score</span>
                    <span className="text-sm font-bold text-ai-600 dark:text-ai-400">{student.profileCompletion}/100</span>
                  </div>
                  <Progress value={student.profileCompletion} color="ai" size="md" className="bg-ai-100 dark:bg-ai-900/30" />
                </div>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Complete the following AI-recommended steps to reach 100/100 and boost recruiter visibility:
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  {student.phone ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${student.phone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add phone number</p>
                    {!student.phone && <p className="text-[10px] text-ai-600 dark:text-ai-400 font-medium mt-0.5">+5 points to score</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {student.linkedIn ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${student.linkedIn ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add LinkedIn profile URL</p>
                    {!student.linkedIn && <p className="text-[10px] text-ai-600 dark:text-ai-400 font-medium mt-0.5">+5 points to score</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {student.skills && student.skills.length >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${student.skills && student.skills.length >= 3 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add at least 3 technical skills</p>
                    {(!student.skills || student.skills.length < 3) && <p className="text-[10px] text-ai-600 dark:text-ai-400 font-medium mt-0.5">+10 points to score</p>}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  {student.resume && student.resume.fileUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${student.resume && student.resume.fileUrl ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Upload latest ATS resume</p>
                    {(!student.resume || !student.resume.fileUrl) && <p className="text-[10px] text-ai-600 dark:text-ai-400 font-medium mt-0.5">+15 points to score</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {student.projects && student.projects.length >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${student.projects && student.projects.length >= 1 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add 1 or more projects</p>
                    {(!student.projects || student.projects.length < 1) && <p className="text-[10px] text-ai-600 dark:text-ai-400 font-medium mt-0.5">+15 points to score</p>}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  {student.certifications && student.certifications.length >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${student.certifications && student.certifications.length >= 1 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add 1 technical certification</p>
                    {(!student.certifications || student.certifications.length < 1) && <p className="text-[10px] text-ai-600 dark:text-ai-400 font-medium mt-0.5">+10 points to score</p>}
                  </div>
                </div>
              </div>

              <Button variant="ai" className="w-full text-xs" onClick={() => setActiveTab(student.skills?.length < 5 ? 'skills' : (!student.resume?.fileUrl ? 'resume' : 'projects'))}>
                Optimize Profile Now
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: EDUCATION */}
      {activeTab === 'education' && (
        <Card className="p-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Academic Qualifications
          </h3>

          <div className="space-y-4">
            {student.education.map(edu => (
              <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                    🎓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{edu.institution}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {edu.degree} {edu.specialization ? `· ${edu.specialization}` : ''} ({edu.yearOfPassing})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{edu.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="indigo" className="text-xs">
                    Score: {edu.score} {edu.scoreType === 'cgpa' ? 'CGPA' : '%'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: SKILLS & CERTIFICATIONS */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Management Card */}
          <Card className="p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Technical Skills
            </h3>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add new skill (e.g. Docker, GraphQL)..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); }}
              />
              <Button size="sm" onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {student.skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Certifications Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Certifications
              </h3>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsCertModalOpen(true)}>
                Add Cert
              </Button>
            </div>

            <div className="space-y-3">
              {student.certifications.length > 0 ? student.certifications.map(cert => (
                <div key={cert.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{cert.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cert.issuer} · Issued {cert.issueDate}</p>
                    {cert.credentialId && <p className="text-[10px] text-slate-400 mt-0.5">ID: {cert.credentialId}</p>}
                  </div>
                  <Badge variant="green" className="text-[10px]">Active</Badge>
                </div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-6">No certifications added yet.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: PROJECTS & EXPERIENCE */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Student Projects
              </h3>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsProjectModalOpen(true)}>
                Add Project
              </Button>
            </div>

            <div className="space-y-4">
              {student.projects.map(proj => (
                <div key={proj.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{proj.duration}</p>
                    </div>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" /> Repository
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map(tech => (
                      <Badge key={tech} variant="blue" className="text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Internship Experience */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Work / Internship Experience
              </h3>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsExpModalOpen(true)}>
                Add Experience
              </Button>
            </div>

            {student.experience.length > 0 ? student.experience.map(exp => (
              <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{exp.role} at {exp.company}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{exp.startDate} - {exp.endDate || 'Present'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{exp.description}</p>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-6">No internship experience added yet.</p>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: RESUME & SOCIALS */}
      {activeTab === 'resume' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Resume & ATS Score
            </h3>
            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
              />
              <Button size="sm" loading={uploadingResume} onClick={() => fileInputRef.current?.click()}>
                Upload New PDF
              </Button>
            </div>
          </div>

          {student.resume?.fileUrl ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{student.resume.fileName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Uploaded {student.resume.uploadedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-xs text-slate-400 block">ATS Score</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{student.resume.atsScore}/100</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info('Downloading resume PDF...')}>
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No resume uploaded yet.</p>
          )}
        </Card>
      )}

      {/* EDIT STUDENT PROFILE MODAL */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Student Profile & Preferences"
        size="lg"
      >
        <form onSubmit={e => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <Select
                  value={editForm.gender}
                  onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                  options={[
                    { value: 'female', label: 'Female' },
                    { value: 'male', label: 'Male' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <Input type="date" value={editForm.dob} onChange={e => setEditForm({ ...editForm, dob: e.target.value })} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <Input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                <Input value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Career Preferences */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-brand-600" /> Academic & Career Target
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll / Student ID</label>
                <Input value={editForm.studentId} onChange={e => setEditForm({ ...editForm, studentId: e.target.value })} required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <Select
                  value={editForm.department}
                  onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                  options={[
                    { value: 'CSE', label: 'Computer Science (CSE)' },
                    { value: 'ECE', label: 'Electronics & Comm (ECE)' },
                    { value: 'ISE', label: 'Information Science (ISE)' },
                    { value: 'ME', label: 'Mechanical Engg (ME)' },
                    { value: 'EEE', label: 'Electrical Engg (EEE)' },
                    { value: 'CIVIL', label: 'Civil Engg' },
                  ]}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch Year</label>
                <Input value={editForm.batch} onChange={e => setEditForm({ ...editForm, batch: e.target.value })} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Salary (LPA)</label>
                <Input type="number" value={editForm.expectedSalary} onChange={e => setEditForm({ ...editForm, expectedSalary: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Work Locations (comma separated)</label>
                <Input value={editForm.preferredLocations} onChange={e => setEditForm({ ...editForm, preferredLocations: e.target.value })} placeholder="e.g. Bengaluru, Pune, Remote" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Roles (comma separated)</label>
                <Input value={editForm.preferredRoles} onChange={e => setEditForm({ ...editForm, preferredRoles: e.target.value })} placeholder="e.g. Full Stack Developer, Backend Engineer" />
              </div>
            </div>
          </div>

          {/* Section 3: Social Links */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-600" /> Online Profiles & Portfolio
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile URL</label>
                <Input value={editForm.linkedIn} onChange={e => setEditForm({ ...editForm, linkedIn: e.target.value })} placeholder="https://linkedin.com/in/username" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile URL</label>
                <Input value={editForm.github} onChange={e => setEditForm({ ...editForm, github: e.target.value })} placeholder="https://github.com/username" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Portfolio Website</label>
                <Input value={editForm.portfolio} onChange={e => setEditForm({ ...editForm, portfolio: e.target.value })} placeholder="https://myportfolio.dev" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD CERTIFICATION MODAL */}
      <Modal isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} title="Add Certification" size="md">
        <form onSubmit={e => { e.preventDefault(); handleSaveCertification(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Certification Name</label>
            <Input value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issuing Organization</label>
            <Input value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
            <Input type="month" value={certForm.issueDate} onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Certificate (PDF/Image)</label>
            <input type="file" ref={certFileRef} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            <p className="text-[10px] text-slate-500 mt-1">Or provide a URL below if already hosted online.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Credential URL (Optional)</label>
            <Input value={certForm.url} onChange={e => setCertForm({ ...certForm, url: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setIsCertModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Save Certification</Button>
          </div>
        </form>
      </Modal>

      {/* ADD PROJECT MODAL */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Add Student Project" size="md">
        <form onSubmit={e => { e.preventDefault(); handleSaveProject(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
            <Input value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
              rows={3} 
              value={projectForm.description} 
              onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (e.g. Jan 2024 - Mar 2024)</label>
            <Input value={projectForm.duration} onChange={e => setProjectForm({ ...projectForm, duration: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technologies Used (comma separated)</label>
            <Input value={projectForm.technologies} onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })} placeholder="React, Node.js, MongoDB" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub / Project URL (Optional)</label>
            <Input value={projectForm.githubUrl} onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Save Project</Button>
          </div>
        </form>
      </Modal>

      {/* ADD EXPERIENCE MODAL */}
      <Modal isOpen={isExpModalOpen} onClose={() => setIsExpModalOpen(false)} title="Add Work / Internship Experience" size="md">
        <form onSubmit={e => { e.preventDefault(); handleSaveExperience(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
            <Input value={expForm.company} onChange={e => setExpForm({ ...expForm, company: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
            <Input value={expForm.role} onChange={e => setExpForm({ ...expForm, role: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <Select 
              value={expForm.type} 
              onChange={e => setExpForm({ ...expForm, type: e.target.value })} 
              options={[
                { value: 'internship', label: 'Internship' },
                { value: 'fulltime', label: 'Full Time' },
                { value: 'parttime', label: 'Part Time' },
                { value: 'freelance', label: 'Freelance' }
              ]} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <Input type="month" value={expForm.startDate} onChange={e => setExpForm({ ...expForm, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date (Leave blank if present)</label>
              <Input type="month" value={expForm.endDate} onChange={e => setExpForm({ ...expForm, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
              rows={3} 
              value={expForm.description} 
              onChange={e => setExpForm({ ...expForm, description: e.target.value })} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setIsExpModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Save Experience</Button>
          </div>
        </form>
      </Modal>

    </PageWrapper>
  );
};

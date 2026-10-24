import React, { useEffect, useState, useMemo } from 'react';
import {
  User, Mail, Phone, MapPin, GraduationCap, Award, FileText,
  Globe, Briefcase, Code, Edit3, Plus, Trash2,
  Save, CheckCircle2, Sparkles, ExternalLink, ShieldCheck, Calendar,
  DollarSign, Building2, Check, X, Lock, Camera, Upload, Loader2,
  Lightbulb, Target, Zap, CreditCard
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, AIBadge, ProgressRing, Progress, Avatar, Input, Select, Modal, Skeleton, ConfirmDialog } from '../../components/ui';
import { studentService, uploadService, jobService, aiService } from '../../services';
import { useAuthStore } from '../../store';
import type { Student, Project, Certification, Education, SavedResume } from '../../types';
import { timeAgo } from '../../utils';
import { toast } from 'sonner';

import { getMediaUrl } from '../../config/api';

const getImageUrl = getMediaUrl;

export const StudentProfilePage: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const aadharFileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [deleteResumeTarget, setDeleteResumeTarget] = useState<SavedResume | null>(null);
  const [deletingResume, setDeletingResume] = useState(false);
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'education' | 'skills' | 'projects' | 'resume'>('overview');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Avatar & Cover Image Edit States
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);

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
    isProfilePublic: true,
  });

  // New Skill Input
  const [newSkill, setNewSkill] = useState('');

  // AI Profile Optimizer Modal State
  const [isAiOptimizerOpen, setIsAiOptimizerOpen] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiOptimizerData, setAiOptimizerData] = useState<{
    headlineSuggestion: string;
    executiveSummary: string;
    recommendedSkills: string[];
    missingKeywords: string[];
    projectIdeas: { title: string; tech: string; summary: string }[];
    recruiterTips: string[];
  } | null>(null);

  const hasResume = useMemo(() => {
    return Boolean(
      (student?.resume && (student.resume.fileUrl || student.resume.fileName)) ||
      (savedResumes && savedResumes.length > 0)
    );
  }, [student?.resume, savedResumes]);

  const optimizationScore = useMemo(() => {
    if (!student) return 0;
    let score = 20; // Base: name, email, rollNo, college
    if (student.avatar) score += 10; // Profile photo (+10 points)
    if (student.phone) score += 5; // Phone (+5 points)
    if (student.linkedIn) score += 5; // LinkedIn URL (+5 points)
    if (student.skills && student.skills.length >= 3) score += 10; // 3+ technical skills (+10 points)
    if (hasResume) score += 15; // Latest ATS resume (+15 points)
    if (student.projects && student.projects.length >= 1) score += 15; // 1+ projects (+15 points)
    if (student.certifications && student.certifications.length >= 1) score += 10; // 1+ certification (+10 points)
    if (student.education && student.education.length >= 1) score += 10; // Academic details (+10 points)
    return Math.min(score, 100);
  }, [student, hasResume]);

  const handleOpenAiOptimizer = async () => {
    setIsAiOptimizerOpen(true);
    if (aiOptimizerData) return;
    setAiOptimizing(true);
    try {
      const res = await aiService.optimizeProfile();
      if (res) {
        setAiOptimizerData(res);
      }
    } catch {
      setAiOptimizerData({
        headlineSuggestion: `${student?.preferredRoles?.[0] || 'Software Engineer'} | Placement Ready | ${student?.department || 'CSE'}`,
        executiveSummary: `Proactive engineering student with hands-on technical skills and proven problem-solving abilities. Prepared for competitive campus recruitment rounds.`,
        recommendedSkills: ['Docker', 'TypeScript', 'Kubernetes', 'Redis', 'AWS Cloud'].filter(s => !(student?.skills || []).includes(s)),
        missingKeywords: ['CI/CD', 'System Design', 'REST API Optimization', 'Clean Code'],
        projectIdeas: [
          {
            title: 'Real-time Collaborative Code Workspace',
            tech: 'React, Node.js, WebSockets, Docker',
            summary: 'Engineered a concurrent collaborative coding editor with synchronized AST parsing and low-latency state diffs.'
          },
          {
            title: 'Cloud-Native Automated CI/CD Vulnerability Scanner',
            tech: 'TypeScript, Docker, AWS S3, GitHub Actions',
            summary: 'Built automated container vulnerability scanning gate preventing insecure build artifacts before deployment.'
          }
        ],
        recruiterTips: [
          'Highlight specific metrics (e.g., "Reduced response latency by 35% using caching").',
          'Ensure your ATS resume contains all keywords from your target role job descriptions.',
          'Verify your GitHub repository links are public and contain informative README files.'
        ]
      });
    } finally {
      setAiOptimizing(false);
    }
  };

  const handleAddAiSkill = async (skillToAdd: string) => {
    if (!student) return;
    if (student.skills.includes(skillToAdd)) {
      toast.info(`${skillToAdd} is already in your skills`);
      return;
    }
    const updatedSkills = [...student.skills, skillToAdd];
    try {
      await studentService.update(student.id, { skills: updatedSkills });
      setStudent(prev => prev ? { ...prev, skills: updatedSkills } : null);
      toast.success(`Added ${skillToAdd} to your skills (+points)!`);
    } catch {
      toast.error('Failed to add skill');
    }
  };

  const handleApplyHeadline = async (headline: string) => {
    if (!student) return;
    try {
      await studentService.update(student.id, { portfolio: headline });
      setStudent(prev => prev ? { ...prev, portfolio: headline } : null);
      toast.success('AI Professional Headline saved to profile!');
    } catch {
      toast.error('Failed to update headline');
    }
  };

  const handleUseProjectIdea = (idea: { title: string; tech: string; summary: string }) => {
    setProjectForm({
      title: idea.title,
      description: idea.summary,
      duration: '3 Months',
      technologies: idea.tech,
      githubUrl: student?.github || '',
    });
    setIsAiOptimizerOpen(false);
    setIsProjectModalOpen(true);
    toast.success('Project idea loaded into form!');
  };

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
            isProfilePublic: s.isProfilePublic !== false,
          });
        }
      })
      .finally(() => setLoading(false));
    jobService.getSavedResumes()
      .then(setSavedResumes)
      .catch(() => setSavedResumes([]))
      .finally(() => setLoadingResumes(false));
  }, []);

  const handleTogglePrivacy = async () => {
    if (!student) return;
    const nextPrivacy = student.isProfilePublic === false ? true : false;
    try {
      await studentService.update(student.id, { isProfilePublic: nextPrivacy });
      setStudent(prev => prev ? { ...prev, isProfilePublic: nextPrivacy } : prev);
      setEditForm(prev => ({ ...prev, isProfilePublic: nextPrivacy }));
      if (nextPrivacy) {
        toast.success('Profile is now Public. Anyone in CampusConnect can view your full profile.');
      } else {
        toast.success('Profile is now Private. Other students must connect with you to view your full profile.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile privacy');
    }
  };

  // ─── Avatar Handlers ────────────────────────────────────────────────────────
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    setIsUploadingAvatar(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      await studentService.update(student.id, { avatar: uploadRes.url });
      setStudent(prev => prev ? { ...prev, avatar: uploadRes.url } : prev);
      useAuthStore.getState().updateUser({ avatar: uploadRes.url });
      setIsAvatarModalOpen(false);
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!student) return;
    setIsUploadingAvatar(true);
    try {
      await studentService.update(student.id, { avatar: '' });
      setStudent(prev => prev ? { ...prev, avatar: '' } : prev);
      useAuthStore.getState().updateUser({ avatar: undefined });
      setIsAvatarModalOpen(false);
      toast.success('Profile picture removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ─── Cover Image Handlers ───────────────────────────────────────────────────
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    setIsUploadingCover(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      await studentService.update(student.id, { coverImage: uploadRes.url });
      setStudent(prev => prev ? { ...prev, coverImage: uploadRes.url } : prev);
      setIsCoverModalOpen(false);
      toast.success('Profile cover banner updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload background banner');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleRemoveCover = async () => {
    if (!student) return;
    setIsUploadingCover(true);
    try {
      await studentService.update(student.id, { coverImage: '' });
      setStudent(prev => prev ? { ...prev, coverImage: '' } : prev);
      setIsCoverModalOpen(false);
      toast.success('Background reset to default AI Campus OS gradient');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset background banner');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleOpenSavedResume = async (id: string) => {
    try {
      await jobService.openSavedResume(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open this resume');
    }
  };

  const handleDeleteSavedResume = async () => {
    if (!deleteResumeTarget) return;
    setDeletingResume(true);
    try {
      await jobService.deleteSavedResume(deleteResumeTarget.id);
      setSavedResumes(prev => prev.filter(r => r.id !== deleteResumeTarget.id));
      toast.success('Resume removed');
      setDeleteResumeTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove this resume');
    } finally {
      setDeletingResume(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
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
        isProfilePublic: editForm.isProfilePublic,
        address: {
          ...student.address,
          city: editForm.city,
          state: editForm.state,
        },
      };

      await studentService.update(student.id, updated);
      setStudent(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Upload your resume as a PDF');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingResume(true);
    try {
      const saved = await jobService.uploadSavedResume(file);
      setSavedResumes(prev => [saved, ...prev.filter(r => r.id !== saved.id)].slice(0, 5));

      const uploadRes = await uploadService.uploadFile(file);
      const resumeData = {
        ...(student.resume || {}),
        id: student.resume?.id || `res-${Date.now()}`,
        studentId: student.id,
        fileName: file.name,
        fileUrl: uploadRes.url,
        uploadedAt: new Date().toISOString(),
      } as NonNullable<Student['resume']>;

      await studentService.update(student.id, { resume: resumeData });
      setStudent(prev => prev ? { ...prev, resume: resumeData } : null);
      toast.success('Resume uploaded and shared with your placement cell');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setUploadingAadhar(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      const aadharCardData = {
        fileUrl: uploadRes.url,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };
      await studentService.update(student.id, { aadharCard: aadharCardData });
      setStudent(prev => prev ? { ...prev, aadharCard: aadharCardData } : prev);
      toast.success('Aadhar card updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload Aadhar card');
    } finally {
      setUploadingAadhar(false);
      if (aadharFileInputRef.current) aadharFileInputRef.current.value = '';
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
      breadcrumbs={[{ label: 'Student' }, { label: 'Profile' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePrivacy}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer shadow-xs ${
              student?.isProfilePublic !== false
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
            title="Click to toggle profile privacy (Public vs Private)"
          >
            {student?.isProfilePublic !== false ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Public Profile</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Private Profile</span>
              </>
            )}
          </button>
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
      }
    >
      {/* ── Bold Gradient Profile Hero Card ─────────────────────────────── */}
      <div className="relative rounded-2xl mb-6 text-white overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 30%, #5b21b6 50%, #1d4ed8 75%, #0369a1 100%)' }}>
        {/* Custom background cover or default mesh/glow */}
        {student.coverImage ? (
          <div className="absolute inset-0 z-0">
            <img
              src={getImageUrl(student.coverImage)}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-slate-900/50 backdrop-blur-[1px]" />
          </div>
        ) : (
          <>
            {/* Decorative radial glow blobs */}
            <div className="absolute top-0 right-0 w-[360px] h-[360px] rounded-full pointer-events-none opacity-25" style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 70%)', transform: 'translate(35%, -35%)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)', transform: 'translate(-30%, 40%)' }} />
            {/* Mesh grid overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </>
        )}

        {/* Edit Cover Banner button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={() => setIsCoverModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/65 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Change background cover banner"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-300" />
            <span>{student.coverImage ? 'Edit Cover' : 'Add Cover'}</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch">
          {/* Left Panel: Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:py-5 sm:px-6 flex-1 text-center sm:text-left">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0">
              <div className="p-[2.5px] rounded-full" style={{ background: 'linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)' }}>
                <div className="p-0.5 rounded-full bg-indigo-950/80">
                  <Avatar
                    name={student.name}
                    src={getImageUrl(student.avatar)}
                    size="lg"
                    className="w-16 h-16 sm:w-18 sm:h-18 text-xl font-black bg-indigo-900 text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:scale-110 transition-all ring-2 ring-white/30 cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1">
              {/* Name row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {student.name}
                </h1>
                <button onClick={() => setIsEditing(true)} className="p-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-white" title="Edit Profile">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Eligible & Privacy pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-white/10 border border-white/25 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {student.isEligible ? 'Eligible for Drives ✨' : 'Not Eligible'}
                </span>

                <button
                  type="button"
                  onClick={handleTogglePrivacy}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer backdrop-blur-sm shadow-xs ${
                    student.isProfilePublic !== false
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40'
                  }`}
                  title="Click to toggle profile privacy (Public vs Private)"
                >
                  {student.isProfilePublic !== false ? (
                    <>
                      <Globe className="w-3 h-3 text-emerald-300" />
                      <span>Public Profile</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-amber-300" />
                      <span>Private Profile (Connections Only)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Student ID & degree */}
              <p className="text-xs text-indigo-200 font-medium mb-2.5">
                <span className="font-mono text-white font-bold bg-white/10 px-1.5 py-0.5 rounded mr-1.5 border border-white/10">{student.studentId}</span>
                · {student.degree} in {student.department} ({student.batch} Batch)
              </p>

              {/* Contact pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px]">
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-white/90 hover:bg-white/20 transition-all">
                  <Mail className="w-3 h-3 text-sky-300" /> {student.email}
                </span>
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-white/90 hover:bg-white/20 transition-all">
                  <Phone className="w-3 h-3 text-violet-300" /> {student.phone}
                </span>
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-white/90 hover:bg-white/20 transition-all">
                  <MapPin className="w-3 h-3 text-emerald-300" /> {student.address.city}, {student.address.state}
                </span>
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent my-4" />

          {/* Right Panel: Profile Completion */}
          <div className="flex flex-col items-center justify-center p-4 sm:py-5 sm:px-5 lg:w-52 gap-2.5 border-t border-white/10 lg:border-t-0">
            <div className="relative">
              <ProgressRing
                value={optimizationScore}
                size={72}
                strokeWidth={6}
                color="#a78bfa"
                label={`${optimizationScore}%`}
                labelColor="text-white font-black text-sm"
              />
              <div className="absolute inset-0 rounded-full blur-lg opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-violet-300" />
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider">Profile Completion</p>
              </div>
              <p className="text-[10px] text-indigo-200 font-medium leading-snug">
                {optimizationScore >= 85 ? 'Profile ready for TPO screening' : 'Add missing items for 100%'}
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
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">100%</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Top 1% Rank</p>
            </div>
          </Card>

          {/* Personal Info Card */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Personal Information
              </h3>
              <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>

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
                    <span className="text-sm font-bold text-ai-600 dark:text-ai-400">{optimizationScore}/100</span>
                  </div>
                  <Progress value={optimizationScore} color="ai" size="md" className="bg-ai-100 dark:bg-ai-900/30" />
                </div>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Complete the following AI-recommended steps to reach 100/100 and boost recruiter visibility:
              </p>

              <div className="space-y-4 mb-6">
                {/* 1. Profile Photo */}
                <div className="flex items-start gap-3">
                  {student.avatar ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${student.avatar ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Upload profile photo</p>
                    {!student.avatar ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+10 points to score</span>
                        <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Add Photo</button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 2. Phone */}
                <div className="flex items-start gap-3">
                  {student.phone ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${student.phone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add phone number</p>
                    {!student.phone ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+5 points to score</span>
                        <button type="button" onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Edit</button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 3. LinkedIn */}
                <div className="flex items-start gap-3">
                  {student.linkedIn ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${student.linkedIn ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add LinkedIn profile URL</p>
                    {!student.linkedIn ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+5 points to score</span>
                        <button type="button" onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Edit</button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 4. Skills */}
                <div className="flex items-start gap-3">
                  {student.skills && student.skills.length >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${student.skills && student.skills.length >= 3 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add at least 3 technical skills</p>
                    {(!student.skills || student.skills.length < 3) ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+10 points to score</span>
                        <button type="button" onClick={() => setActiveTab('skills')} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Add Skills</button>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* 5. Resume */}
                <div className="flex items-start gap-3">
                  {hasResume ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${hasResume ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Upload latest ATS resume</p>
                    {!hasResume ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+15 points to score</span>
                        <button type="button" onClick={() => setActiveTab('resume')} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Upload</button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 6. Projects */}
                <div className="flex items-start gap-3">
                  {student.projects && student.projects.length >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${student.projects && student.projects.length >= 1 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add 1 or more projects</p>
                    {(!student.projects || student.projects.length < 1) ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+15 points to score</span>
                        <button type="button" onClick={() => setIsProjectModalOpen(true)} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Add Project</button>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* 7. Certifications */}
                <div className="flex items-start gap-3">
                  {student.certifications && student.certifications.length >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${student.certifications && student.certifications.length >= 1 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>Add 1 technical certification</p>
                    {(!student.certifications || student.certifications.length < 1) ? (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-ai-600 dark:text-ai-400 font-medium">+10 points to score</span>
                        <button type="button" onClick={() => setIsCertModalOpen(true)} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline">Add Cert</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <Button
                variant="ai"
                className="w-full text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                onClick={handleOpenAiOptimizer}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimize Profile with AI</span>
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
                accept=".pdf,application/pdf"
                onChange={handleResumeUpload}
              />
              <Button size="sm" loading={uploadingResume} onClick={() => fileInputRef.current?.click()}>
                Upload New PDF
              </Button>
            </div>
          </div>

          {student.resume?.fileUrl && (
            <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Profile resume · visible to your placement cell
                  </p>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">{student.resume.fileName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Uploaded {student.resume.uploadedAt ? new Date(student.resume.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {student.resume.atsScore > 0 ? (
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block">ATS Score</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{student.resume.atsScore}/100</span>
                  </div>
                ) : (
                  <Button variant="ai" size="sm" onClick={() => navigate('/student/ats-checker')}>
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Check ATS score
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.open(student.resume!.fileUrl, '_blank', 'noopener,noreferrer')}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Uploaded resumes</h4>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">Your last 5 uploads from Profile and Resume</span>
          </div>

          {loadingResumes ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : savedResumes.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No resumes uploaded yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload a PDF to share it with your placement cell and use it for job matching.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {savedResumes.map(resume => {
                const isProfileResume = resume.fileName === student.resume?.fileName;
                return (
                  <li key={resume.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{resume.fileName}</p>
                          {isProfileResume && <Badge variant="green" className="text-[10px] flex-shrink-0">Profile resume</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {(resume.size / 1024).toFixed(0)} KB · uploaded {timeAgo(resume.uploadedAt)}
                          {resume.lastQuery && <> · matched for “{resume.lastQuery}”</>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => navigate('/student/resume')}>
                        Find jobs
                      </Button>
                      <button
                        onClick={() => handleOpenSavedResume(resume.id)}
                        aria-label={`Open ${resume.fileName}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteResumeTarget(resume)}
                        aria-label={`Remove ${resume.fileName}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <ConfirmDialog
            isOpen={!!deleteResumeTarget}
            onClose={() => setDeleteResumeTarget(null)}
            onConfirm={handleDeleteSavedResume}
            title="Remove resume?"
            message={`"${deleteResumeTarget?.fileName || ''}" will be removed from your uploaded resumes.`}
            confirmLabel="Remove"
            confirmVariant="danger"
            loading={deletingResume}
          />

          {/* Government Identity / Aadhar Verification Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#08546c] dark:text-cyan-400" />
                  Government Identity & KYC Document
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified Aadhar Card document for placement drives & university verification
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={aadharFileInputRef}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                  onChange={handleAadharUpload}
                />
                <Button
                  size="sm"
                  variant="outline"
                  loading={uploadingAadhar}
                  onClick={() => aadharFileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  {student.aadharCard?.fileUrl ? 'Replace Aadhar' : 'Upload Aadhar'}
                </Button>
              </div>
            </div>

            {student.aadharCard?.fileUrl ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#08546c] dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-200/50">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {student.aadharCard.fileName || 'Aadhar Card Document'}
                      </span>
                      <Badge variant="green" className="text-[10px]">KYC Verified</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {student.aadharNumber ? `Aadhar No: •••• •••• ${student.aadharNumber.slice(-4)} · ` : ''}
                      Uploaded {student.aadharCard.uploadedAt ? new Date(student.aadharCard.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getImageUrl(student.aadharCard!.fileUrl), '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Aadhar
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No Aadhar card uploaded yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload your Aadhar card (PDF/Image) to complete your student KYC verification.
                </p>
              </div>
            )}
          </div>
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

      {/* EDIT STUDENT PROFILE & PREFERENCES MODAL */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Student Profile & Preferences" size="lg">
        <form onSubmit={e => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <Select
                  value={editForm.gender}
                  onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <Input type="date" value={editForm.dob} onChange={e => setEditForm({ ...editForm, dob: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <Input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                <Input value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Academic & Career Target */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Academic & Career Target
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll / Student ID</label>
                <Input value={editForm.studentId} onChange={e => setEditForm({ ...editForm, studentId: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <Input value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch Year</label>
                <Input value={editForm.batch} onChange={e => setEditForm({ ...editForm, batch: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Salary (LPA)</label>
                <Input type="number" value={editForm.expectedSalary} onChange={e => setEditForm({ ...editForm, expectedSalary: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Work Locations (comma separated)</label>
                <Input value={editForm.preferredLocations} onChange={e => setEditForm({ ...editForm, preferredLocations: e.target.value })} placeholder="e.g. Bengaluru, Hyderabad, Mumbai" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Roles (comma separated)</label>
                <Input value={editForm.preferredRoles} onChange={e => setEditForm({ ...editForm, preferredRoles: e.target.value })} placeholder="e.g. Software Engineer, Fullstack Developer" />
              </div>
            </div>
          </div>

          {/* Profile Privacy & Visibility */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-2">
              {editForm.isProfilePublic ? <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              Profile Privacy & Visibility
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Configure who can view your full profile, academic scores, and project portfolio in CampusConnect.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, isProfilePublic: true }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  editForm.isProfilePublic
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-extrabold text-xs">Public Profile</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Visible to everyone across Explore Students and CampusConnect.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, isProfilePublic: false }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  !editForm.isProfilePublic
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-extrabold text-xs">Private Profile</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Locked profile. Students must connect with you to see your full details.
                </p>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Save Profile</Button>
          </div>
        </form>
      </Modal>

      {/* ── Avatar Edit Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => !isUploadingAvatar && setIsAvatarModalOpen(false)}
        title="Change Profile Picture"
        size="sm"
      >
        <div className="space-y-5 py-1">
          {/* Current Avatar preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="p-1 rounded-full ring-4 ring-indigo-500/20 shadow-md">
                <Avatar
                  name={student.name}
                  src={getImageUrl(student.avatar)}
                  size="xl"
                  className="w-24 h-24 text-3xl font-bold bg-indigo-900 text-white shadow-inner"
                />
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white">
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student.avatar ? 'Click below to change or remove photo' : 'No photo uploaded yet'}
              </p>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={avatarFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileUpload}
          />

          {/* Direct Upload Dropzone Button */}
          <div
            onClick={() => !isUploadingAvatar && avatarFileInputRef.current?.click()}
            className="group cursor-pointer rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all p-5 flex flex-col items-center justify-center text-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isUploadingAvatar ? 'Uploading photo...' : 'Click to upload new photo'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                PNG, JPG, WebP or GIF up to 5MB
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            {student.avatar ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Remove photo
              </button>
            ) : <span />}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
              disabled={isUploadingAvatar}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Cover Image Edit Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={isCoverModalOpen}
        onClose={() => !isUploadingCover && setIsCoverModalOpen(false)}
        title="Change Profile Cover Banner"
        size="md"
      >
        <div className="space-y-5 py-1">
          {/* Banner Live Preview */}
          <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group">
            {student.coverImage ? (
              <img
                src={getImageUrl(student.coverImage)}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-semibold text-white/80"
                style={{ background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 30%, #5b21b6 50%, #1d4ed8 75%, #0369a1 100%)' }}
              >
                Default AI Campus OS Gradient
              </div>
            )}
            {isUploadingCover && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white">
                <Loader2 className="w-7 h-7 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={coverFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleCoverFileUpload}
          />

          {/* Direct Upload Dropzone Button */}
          <div
            onClick={() => !isUploadingCover && coverFileInputRef.current?.click()}
            className="group cursor-pointer rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all p-5 flex flex-col items-center justify-center text-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isUploadingCover ? 'Uploading banner...' : 'Click to upload banner image'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Landscape photo recommended (PNG, JPG, WebP)
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            {student.coverImage ? (
              <button
                type="button"
                onClick={handleRemoveCover}
                disabled={isUploadingCover}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Reset to default gradient
              </button>
            ) : <span />}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCoverModalOpen(false)}
              disabled={isUploadingCover}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI PROFILE OPTIMIZER MODAL */}
      <Modal
        isOpen={isAiOptimizerOpen}
        onClose={() => setIsAiOptimizerOpen(false)}
        title="AI Profile Optimizer & Recruiter Boost"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Header Score Overview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-ai-900 via-indigo-950 to-brand-950 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-ai-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-ai-300">Recruiter Visibility Engine</span>
                </div>
                <h3 className="text-lg font-black tracking-tight">AI Placement Optimization Score</h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Profiles scoring 90+ receive up to 3.8x more shortlist callbacks from campus recruiters.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-indigo-200">Current Score</p>
                  <p className="text-2xl font-black text-white">{optimizationScore}<span className="text-xs font-normal text-indigo-300">/100</span></p>
                </div>
                <div className="w-10 h-10 rounded-full bg-ai-500/30 border border-ai-400 flex items-center justify-center text-ai-300 font-bold">
                  {optimizationScore >= 90 ? '🏆' : optimizationScore >= 70 ? '⚡' : '🚀'}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={optimizationScore} color="ai" size="sm" className="bg-white/20" />
            </div>
          </div>

          {aiOptimizing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-ai-100 dark:bg-ai-950/80 text-ai-600 dark:text-ai-400 flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Gemini AI is analyzing your profile...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Scanning your department ({student.department}), target roles, skills, and industry benchmarks to produce tailored optimizations.
              </p>
              <Loader2 className="w-5 h-5 animate-spin text-ai-600 dark:text-ai-400 mt-2" />
            </div>
          ) : aiOptimizerData ? (
            <>
              {/* 1. Recruiter Headline Suggestion */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Recommended Recruiter Headline
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="ai"
                    className="text-[11px] h-7 px-3"
                    onClick={() => handleApplyHeadline(aiOptimizerData.headlineSuggestion)}
                  >
                    <Check className="w-3 h-3 mr-1" /> Apply to Profile
                  </Button>
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono">
                  "{aiOptimizerData.headlineSuggestion}"
                </p>
                {aiOptimizerData.executiveSummary && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    💡 Summary: {aiOptimizerData.executiveSummary}
                  </p>
                )}
              </div>

              {/* 2. Recommended High-Demand Skills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      High-Demand Skills to Add (+10 Points)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Click to add directly</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {aiOptimizerData.recommendedSkills.map(skill => {
                    const alreadyHas = student.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => !alreadyHas && handleAddAiSkill(skill)}
                        disabled={alreadyHas}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                          alreadyHas
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 cursor-default'
                            : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 cursor-pointer active:scale-95'
                        }`}
                      >
                        {alreadyHas ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                        <span>{skill}</span>
                        {alreadyHas ? <span className="text-[10px] opacity-75 font-normal">(Added)</span> : <span className="text-[10px] text-indigo-500 dark:text-indigo-400">+pts</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. High Impact Portfolio Projects */}
              {aiOptimizerData.projectIdeas && aiOptimizerData.projectIdeas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Top Project Ideas for Placement Rounds (+15 Points)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {aiOptimizerData.projectIdeas.map((idea, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{idea.title}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{idea.summary}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="indigo" className="text-[10px]">{idea.tech}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] h-7 px-3 shrink-0"
                          onClick={() => handleUseProjectIdea(idea)}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Use this Project
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Missing ATS Keywords */}
              {aiOptimizerData.missingKeywords && aiOptimizerData.missingKeywords.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Keywords Recruiters Look for in Your Department
                    </h4>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400">
                    Include these keywords inside your project descriptions and resume bullets to pass automated ATS filters:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiOptimizerData.missingKeywords.map(kw => (
                      <span key={kw} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-800/60">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Recruiter Tips */}
              {aiOptimizerData.recruiterTips && aiOptimizerData.recruiterTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-ai-600 dark:text-ai-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      TPO Placement Cell Insider Tips
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {aiOptimizerData.recruiterTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-ai-600 dark:text-ai-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">
              Score: <strong className="text-ai-600 dark:text-ai-400 font-bold">{optimizationScore}/100</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAiOptimizerOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, MapPin, GraduationCap, Award, FileText,
  Globe, Briefcase, Code, Edit3, Plus, Trash2,
  Save, CheckCircle2, Sparkles, ExternalLink, ShieldCheck, Calendar,
  DollarSign, Building2, Check, X
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, AIBadge, ProgressRing, Progress, Avatar, Input, Select, Modal } from '../../components/ui';
import { studentService } from '../../services';
import type { Student, Project, Certification, Education } from '../../types';
import { toast } from 'sonner';

export const StudentProfilePage: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'education' | 'skills' | 'projects' | 'resume'>('overview');
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
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
    studentService.getById('student-1')
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

  const handleAddSkill = () => {
    if (!newSkill.trim() || !student) return;
    if (student.skills.includes(newSkill.trim())) {
      toast.error('Skill already exists!');
      return;
    }
    setStudent({
      ...student,
      skills: [...student.skills, newSkill.trim()],
    });
    setNewSkill('');
    toast.success(`Added ${newSkill.trim()} to skills!`);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!student) return;
    setStudent({
      ...student,
      skills: student.skills.filter(s => s !== skillToRemove),
    });
    toast.success(`Removed ${skillToRemove}`);
  };

  if (loading || !student) {
    return (
      <PageWrapper title="Student Profile" breadcrumbs={[{ label: 'Student' }, { label: 'Profile' }]}>
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="md:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
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
      {/* Header Profile Hero Card */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-ai-800 rounded-3xl p-6 sm:p-8 mb-6 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-ai-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <Avatar name={student.name} size="xl" className="w-24 h-24 ring-4 ring-white/30 shadow-lg text-2xl font-black bg-white/20 text-white" />
              <button className="absolute bottom-0 right-0 p-1.5 bg-white text-brand-700 rounded-full shadow-md hover:bg-slate-100 transition-colors" title="Change Avatar">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{student.name}</h1>
                <Badge variant="green" className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                  {student.isEligible ? 'Eligible for Drives' : 'Not Eligible'}
                </Badge>
              </div>
              <p className="text-xs text-brand-100 font-medium">
                {student.studentId} · {student.degree} in {student.department} ({student.batch} Batch)
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-brand-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  <Mail className="w-3.5 h-3.5 text-brand-200" /> {student.email}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  <Phone className="w-3.5 h-3.5 text-brand-200" /> {student.phone}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-brand-200" /> {student.address.city}, {student.address.state}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full sm:w-auto justify-center sm:justify-start">
            <ProgressRing
              value={student.profileCompletion}
              size={64}
              strokeWidth={6}
              color="#fff"
              label={`${student.profileCompletion}%`}
              labelColor="text-white"
            />
            <div>
              <p className="text-xs font-bold text-white">Profile Completion</p>
              <p className="text-[11px] text-brand-200 mt-0.5">
                {student.profileCompletion >= 85 ? 'Profile ready for TPO screening' : 'Add missing projects'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
          <Card className="lg:col-span-3 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gradient-to-r from-brand-50/50 to-ai-50/50 dark:from-brand-950/20 dark:to-ai-950/20">
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
              <p className="text-xs text-slate-400">Applications Sent</p>
              <p className="text-2xl font-black text-ai-600 dark:text-ai-400 mt-1">{student.applications}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Active Campus Drives</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400">Placement Readiness</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{student.placementReadinessScore}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Top 20% Rank</p>
            </div>
          </Card>

          {/* Personal Info Card */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Personal Information
            </h3>

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

            <Card className="p-6 border-ai-200 dark:border-ai-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-ai-600 dark:text-ai-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Profile Optimizer</h3>
                <AIBadge />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Your profile is 88% complete. Adding 1 technical certification can boost recruiter view rates by <strong>35%</strong>.
              </p>
              <Button variant="ai" className="w-full text-xs" onClick={() => setActiveTab('skills')}>
                Add Certification
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
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => toast.info('Certification add modal ready!')}>
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
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => toast.info('Add project modal opened!')}>
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
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Work / Internship Experience
            </h3>

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
            <Button size="sm" onClick={() => toast.success('New resume uploaded!')}>
              Upload New PDF
            </Button>
          </div>

          {student.resume ? (
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
    </PageWrapper>
  );
};

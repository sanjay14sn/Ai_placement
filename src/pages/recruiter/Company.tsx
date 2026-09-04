import React, { useState, useEffect } from 'react';
import { 
  Building2, Globe, MapPin, Users, Briefcase, Award, Edit3, Plus, 
  ExternalLink, Code2, Phone, Mail, CheckCircle2, ShieldCheck, 
  Sparkles, Calendar, Layers, Check
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Modal, Avatar } from '../../components/ui';
import { mockCompanies, mockColleges } from '../../mock/data';
import { toast } from 'sonner';

export const RecruiterCompanyPage: React.FC = () => {
  // Use Infosys as default recruiter company profile
  const initialCompany = mockCompanies[0];
  const [company, setCompany] = useState(initialCompany);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'colleges'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState(company.name);
  const [editIndustry, setEditIndustry] = useState(company.industry);
  const [editHq, setEditHq] = useState(company.hq);
  const [editWebsite, setEditWebsite] = useState(company.website);
  const [editDesc, setEditDesc] = useState(company.description);

  useEffect(() => {
    setEditName(company.name);
    setEditIndustry(company.industry);
    setEditHq(company.hq);
    setEditWebsite(company.website);
    setEditDesc(company.description);
  }, [company]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(prev => ({
      ...prev,
      name: editName,
      industry: editIndustry,
      hq: editHq,
      website: editWebsite,
      description: editDesc,
    }));
    setIsEditModalOpen(false);
    toast.success('Company profile updated successfully!');
  };

  const perks = [
    { label: 'Health Insurance', desc: 'Comprehensive medical coverage for employee & family' },
    { label: 'Stock Options / ESOPs', desc: 'Performance-linked equity and retention bonuses' },
    { label: 'Flexible Work Hours', desc: 'Hybrid work model with flexible shift schedules' },
    { label: 'Learning & Certification Budget', desc: 'Annual budget for AWS, GCP, and AI courses' },
    { label: 'Parental Leave', desc: 'Extended maternity & paternity leave benefits' },
    { label: 'Wellness & Gym Allowance', desc: 'Monthly fitness stipend and mental health support' },
  ];

  return (
    <PageWrapper
      title="Company Profile"
      subtitle="Manage your corporate identity, tech stack, and recruitment details"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Company Profile' }]}
      actions={
        <Button 
          size="sm" 
          leftIcon={<Edit3 className="w-4 h-4" />} 
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Profile
        </Button>
      }
    >
      <div className="space-y-6">
        {/* HERO BANNER CARD */}
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg ring-4 ring-white/10">
                {company.name.charAt(0)}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{company.name}</h1>
                  <Badge variant="indigo" className="px-2.5 py-0.5 text-xs bg-brand-500/20 text-brand-300 border-brand-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 inline text-brand-400" />
                    Verified Employer
                  </Badge>
                  <Badge variant="slate" className="text-xs capitalize bg-white/10 text-slate-300 border-white/10">
                    {company.type}
                  </Badge>
                </div>

                <p className="text-slate-300 text-sm">{company.industry} · Founded {company.founded}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    {company.hq}, India
                  </span>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 text-brand-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {company.website.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                <div className="text-xs text-slate-400 font-medium">Active Jobs</div>
                <div className="text-xl font-bold text-white mt-0.5">{company.activeJobs} Openings</div>
              </div>
              <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                <div className="text-xs text-slate-400 font-medium">Total Hired</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">{company.totalHired}+ Engineers</div>
              </div>
              <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400 font-medium">Avg Package</div>
                <div className="text-xl font-bold text-indigo-300 mt-0.5">₹{company.avgPackage} LPA</div>
              </div>
            </div>
          </div>
        </Card>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Overview & Tech Stack
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'team'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Recruitment Team
          </button>
          <button
            onClick={() => setActiveTab('colleges')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'colleges'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Campus College Ties
          </button>
        </div>

        {/* TAB 1: OVERVIEW & TECH STACK */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About {company.name}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Headquarters</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{company.hq}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Company Size</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{company.size}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Highest Package</span>
                    <span className="text-sm font-bold text-emerald-600">₹{company.highestPackage} LPA</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Founded Year</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{company.founded}</span>
                  </div>
                </div>
              </Card>

              {/* Tech Stack */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-brand-600" />
                      Core Technology Stack
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Primary frameworks and tools used across engineering teams</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {company.techStack.map((tech) => (
                    <Badge key={tech} variant="slate" className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Perks & Benefits */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Employee Perks & Benefits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {perks.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.label}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Campus Drive Contact</h3>
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar name={company.recruiters[0]?.name || 'Priya Sharma'} size="sm" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        {company.recruiters[0]?.name || 'Dr. Priya Sharma'}
                      </h4>
                      <p className="text-[11px] text-slate-500">Lead Campus Talent Partner</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {company.recruiters[0]?.email || `campus@${company.name.toLowerCase().replace(/\s+/g, '')}.com`}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {company.recruiters[0]?.phone || '+91 98765 43210'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-brand-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">Campus Partner Pro</h3>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                  Direct connection with 100+ AI PlacementOS institutional placement cells for prioritized drive slots.
                </p>
                <Badge variant="indigo" className="bg-white/20 text-white border-white/20 text-xs px-3 py-1">
                  Active Pro Member
                </Badge>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: RECRUITMENT TEAM */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.recruiters.concat([
              {
                id: 'rec-2',
                userId: 'user-rec-2',
                companyId: company.id,
                name: 'Vikram Sethi',
                email: `v.sethi@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
                phone: '+91 98123 45678',
                designation: 'Senior Technical Recruiter',
                department: 'Talent Acquisition',
                isActive: true,
                activeJobs: 3,
                totalHired: 28,
                joinedAt: '2023-01-15',
              },
              {
                id: 'rec-3',
                userId: 'user-rec-3',
                companyId: company.id,
                name: 'Ananya Roy',
                email: `a.roy@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
                phone: '+91 97890 12345',
                designation: 'University Relations Lead',
                department: 'University Hiring',
                isActive: true,
                activeJobs: 5,
                totalHired: 45,
                joinedAt: '2022-06-10',
              }
            ]).map((recruiter) => (
              <Card key={recruiter.id} className="p-5 hover:shadow-elevated transition-all">
                <div className="flex items-start gap-4">
                  <Avatar name={recruiter.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{recruiter.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{recruiter.designation}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {recruiter.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {recruiter.phone}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Active Drives</span>
                        <span className="font-bold text-slate-900 dark:text-white">{recruiter.activeJobs}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Hired</span>
                        <span className="font-bold text-emerald-600">{recruiter.totalHired} Candidates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: CAMPUS COLLEGE TIES */}
        {activeTab === 'colleges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockColleges.slice(0, 6).map((college) => (
              <Card key={college.id} className="p-5 hover:shadow-elevated transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{college.name}</h4>
                    <p className="text-xs text-slate-500">{college.city}, {college.state}</p>
                  </div>
                  <Badge variant="indigo" className="text-[10px]">Tied Partner</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Students</span>
                    <span className="font-bold text-slate-900 dark:text-white">{college.totalStudents}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Placement Rate</span>
                    <span className="font-bold text-emerald-600">{college.stats.placementPercent}%</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-2 flex items-center justify-between">
                  <span>TPO: {college.tpoName}</span>
                  <Button size="xs" variant="outline">Schedule Drive</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          title="Edit Company Profile"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Company Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Industry"
                value={editIndustry}
                onChange={e => setEditIndustry(e.target.value)}
                required
              />
              <Input
                label="Headquarters City"
                value={editHq}
                onChange={e => setEditHq(e.target.value)}
                required
              />
            </div>

            <Input
              label="Website URL"
              value={editWebsite}
              onChange={e => setEditWebsite(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Company Overview & Description
              </label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
};

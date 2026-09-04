import React, { useEffect, useState } from 'react';
import {
  Building2, Search, Plus, Filter, Globe, MapPin, Users, Briefcase,
  DollarSign, CheckCircle, ShieldCheck, Eye, Edit3, Trash2, LayoutGrid,
  List, ExternalLink, AlertTriangle, Calendar, Mail, Phone, UserCheck, Send
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, Input, Select, Modal, Skeleton, EmptyState, ConfirmDialog, Tabs } from '../../components/ui';
import { companyService, driveService, jobService } from '../../services';
import { formatNumber } from '../../utils';
import type { Company, Recruiter } from '../../types';

export const CollegeCompaniesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isScheduleDriveModalOpen, setIsScheduleDriveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invite Form State
  const [formName, setFormName] = useState('');
  const [formIndustry, setFormIndustry] = useState('IT Services');
  const [formType, setFormType] = useState<Company['type']>('product');
  const [formHq, setFormHq] = useState('Bengaluru');
  const [formWebsite, setFormWebsite] = useState('');
  const [formHrName, setFormHrName] = useState('');
  const [formHrEmail, setFormHrEmail] = useState('');
  const [formHrPhone, setFormHrPhone] = useState('');
  const [formAvgPackage, setFormAvgPackage] = useState(8.5);
  const [formHighestPackage, setFormHighestPackage] = useState(22.0);
  const [formDescription, setFormDescription] = useState('');

  // Schedule Drive Form State
  const [driveTitle, setDriveTitle] = useState('');
  const [driveDate, setDriveDate] = useState('2025-10-15');
  const [driveVenue, setDriveVenue] = useState('Main Auditorium / Virtual');
  const [driveOpenings, setDriveOpenings] = useState(15);
  const [driveMinCgpa, setDriveMinCgpa] = useState(7.0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let finalType = typeFilter;
      if (activeTab === 'product') finalType = 'product';
      if (activeTab === 'service') finalType = 'service';
      if (activeTab === 'startup') finalType = 'startup';

      let finalStatus = 'all';
      if (activeTab === 'visiting') finalStatus = 'tied';

      const res = await companyService.getAll({
        search,
        type: finalType,
        status: finalStatus,
        page,
        limit: 12,
      });

      let list = res.data as Company[];
      if (activeTab === 'tier1') {
        list = list.filter(c => c.avgPackage >= 10 || c.highestPackage >= 20);
      } else if (activeTab === 'mass') {
        list = list.filter(c => c.type === 'service');
      }

      if (industryFilter !== 'all') {
        list = list.filter(c => c.industry.toLowerCase().includes(industryFilter.toLowerCase()));
      }

      setCompanies(list);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Error loading college companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, industryFilter, typeFilter, activeTab, page]);

  const handleOpenInvite = () => {
    setFormName('');
    setFormIndustry('Software & IT Services');
    setFormType('product');
    setFormHq('Bengaluru');
    setFormWebsite('https://www.example.com');
    setFormHrName('Rohan Malhotra');
    setFormHrEmail('hr@recruiter.com');
    setFormHrPhone('+91 98765 43210');
    setFormAvgPackage(9.5);
    setFormHighestPackage(24.0);
    setFormDescription('Leading software enterprise actively recruiting graduating students.');
    setIsInviteModalOpen(true);
  };

  const handleOpenScheduleDrive = (comp: Company) => {
    setSelectedCompany(comp);
    setDriveTitle(`${comp.name} Campus Drive 2025`);
    setDriveDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setDriveVenue('Main Auditorium, College Campus');
    setDriveOpenings(20);
    setDriveMinCgpa(7.0);
    setIsScheduleDriveModalOpen(true);
  };

  const handleSaveInvite = async () => {
    if (!formName || !formHrEmail) {
      showToast('Please fill in company name and HR email address');
      return;
    }
    setActionLoading(true);
    try {
      const newRecruiter: Recruiter = {
        id: `recruiter-${Date.now()}`,
        userId: `user-recruiter-${Date.now()}`,
        companyId: `company-${Date.now()}`,
        name: formHrName || 'Talent Acquisition Lead',
        email: formHrEmail,
        phone: formHrPhone || '+91 90000 00000',
        designation: 'Campus Recruiter',
        department: 'Human Resources',
        isActive: true,
        activeJobs: 1,
        totalHired: 0,
        joinedAt: new Date().toISOString().split('T')[0],
      };

      const created = await companyService.create({
        name: formName,
        industry: formIndustry,
        type: formType,
        hq: formHq,
        website: formWebsite,
        description: formDescription,
        avgPackage: formAvgPackage,
        highestPackage: formHighestPackage,
        isTied: true,
        recruiters: [newRecruiter],
      });

      showToast(`Invitation sent to ${formHrName} (${formName})! Added to visiting recruiters.`);
      setIsInviteModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmScheduleDrive = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      await driveService.create({
        collegeId: 'college-1',
        companyId: selectedCompany.id,
        title: driveTitle,
        date: driveDate,
        venue: driveVenue,
        openings: driveOpenings,
        status: 'upcoming',
        eligibleDepartments: ['CSE', 'ISE', 'ECE', 'EEE', 'ME'],
      });

      showToast(`Placement drive scheduled for ${selectedCompany.name} on ${driveDate}!`);
      setIsScheduleDriveModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTiedStatus = async (comp: Company) => {
    try {
      await companyService.toggleTiedStatus(comp.id);
      showToast(`Updated recruiter partnership status for ${comp.name}`);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      await companyService.delete(selectedCompany.id);
      showToast(`Removed ${selectedCompany.name} from visiting recruiter list.`);
      setIsDeleteConfirmOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setIndustryFilter('all');
    setTypeFilter('all');
    setActiveTab('all');
    setPage(1);
  };

  const getTypeBadge = (type: Company['type']) => {
    switch (type) {
      case 'product': return <Badge variant="purple">Product</Badge>;
      case 'service': return <Badge variant="blue">IT Services</Badge>;
      case 'startup': return <Badge variant="green">Startup</Badge>;
      case 'mnc': return <Badge variant="indigo">MNC</Badge>;
      case 'psu': return <Badge variant="amber">PSU</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Visiting Recruiter Companies"
      subtitle="Manage corporate campus recruiting partners, HR contacts, salary packages, and placement drives"
      breadcrumbs={[{ label: 'College' }, { label: 'Companies' }]}
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenInvite}>
          Invite New Recruiter
        </Button>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Partner Companies" value={totalCount || 20} change="Active recruiters" changeType="increase" icon={<Building2 className="w-5 h-5" />} color="brand" />
        <StatCard title="Upcoming Drives" value={5} change="Scheduled this month" changeType="increase" icon={<Calendar className="w-5 h-5" />} color="green" />
        <StatCard title="Total Students Hired" value="428" change="Across all departments" changeType="increase" icon={<Users className="w-5 h-5" />} color="purple" />
        <StatCard title="Highest Package" value="₹45.0 LPA" change="Google India offer" changeType="increase" icon={<DollarSign className="w-5 h-5" />} color="amber" />
        <StatCard title="Average CTC" value="₹8.6 LPA" change="Campus average" changeType="neutral" icon={<Briefcase className="w-5 h-5" />} color="purple" />
      </div>

      {/* Filters & Navigation */}
      <Card className="mb-6" padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Recruiters' },
              { id: 'visiting', label: 'Campus Partners' },
              { id: 'tier1', label: 'Tier-1 Premium (12+ LPA)' },
              { id: 'product', label: 'Product Companies' },
              { id: 'service', label: 'IT Services' },
            ]}
            activeTab={activeTab}
            onChange={(id) => { setActiveTab(id); setPage(1); }}
          />

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search company, industry, HR name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <Select
              options={[
                { value: 'all', label: 'All Industries' },
                { value: 'IT Services', label: 'IT Services' },
                { value: 'Technology', label: 'Product & Tech' },
                { value: 'FinTech', label: 'FinTech' },
                { value: 'Consulting', label: 'Consulting' },
                { value: 'E-Commerce', label: 'E-Commerce' },
              ]}
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
              className="w-40"
            />

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : companies.length === 0 ? (
          /* EMPTY DATA STATE */
          <EmptyState
            icon={<Building2 className="w-10 h-10 text-slate-400" />}
            title="No Companies Found"
            description="No recruiting companies match your active search terms or category filters."
            action={{ label: "Reset All Filters", onClick: resetFilters }}
            className="py-16"
          />
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((comp) => {
              const mainHr = comp.recruiters && comp.recruiters.length > 0 ? comp.recruiters[0] : null;

              return (
                <Card key={comp.id} hover className="flex flex-col justify-between p-5 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 font-bold text-lg text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-slate-600 shadow-sm">
                          {comp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">{comp.name}</h4>
                          <p className="text-xs text-slate-500">{comp.industry}</p>
                        </div>
                      </div>
                      {getTypeBadge(comp.type)}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {comp.description}
                    </p>

                    {/* Stats & HR Details */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Avg Package</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{comp.avgPackage} LPA</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Highest Offer</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">₹{comp.highestPackage} LPA</span>
                      </div>
                    </div>

                    {mainHr && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-50/50 dark:bg-brand-900/10 text-xs mb-3 border border-brand-100 dark:border-brand-900/30">
                        <UserCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{mainHr.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{mainHr.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenScheduleDrive(comp)} leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                      Schedule Drive
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedCompany(comp); setIsDetailModalOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedCompany(comp); setIsDeleteConfirmOpen(true); }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-6">Company Name</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">HR Recruiter Contact</th>
                  <th className="py-3.5 px-4">Avg CTC</th>
                  <th className="py-3.5 px-4">Highest CTC</th>
                  <th className="py-3.5 px-4">Partnership</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                {companies.map((comp) => {
                  const hr = comp.recruiters && comp.recruiters.length > 0 ? comp.recruiters[0] : null;

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-brand-200">
                            {comp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{comp.name}</p>
                            <p className="text-xs text-slate-400">{comp.hq}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">{comp.industry}</td>
                      <td className="py-4 px-4">{getTypeBadge(comp.type)}</td>

                      <td className="py-4 px-4 text-xs">
                        {hr ? (
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{hr.name}</p>
                            <p className="text-slate-400">{hr.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No HR assigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400">₹{comp.avgPackage} LPA</td>
                      <td className="py-4 px-4 font-semibold text-amber-600 dark:text-amber-400">₹{comp.highestPackage} LPA</td>

                      <td className="py-4 px-4">
                        <button onClick={() => handleToggleTiedStatus(comp)}>
                          <Badge variant={comp.isTied ? 'green' : 'slate'} dot>{comp.isTied ? 'Campus Partner' : 'Standard'}</Badge>
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => handleOpenScheduleDrive(comp)} leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                            Schedule
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedCompany(comp); setIsDetailModalOpen(true); }}>
                            Inspect
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedCompany(comp); setIsDeleteConfirmOpen(true); }}>
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {!loading && companies.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{companies.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> partner companies
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 1: Inspect Company Profile & Recruiters */}
      {selectedCompany && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Recruiter Corporate Profile — ${selectedCompany.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
                  {selectedCompany.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedCompany.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCompany.industry} • {selectedCompany.hq}</p>
                </div>
              </div>
              {getTypeBadge(selectedCompany.type)}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              {selectedCompany.description}
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">Total Hired Students</p>
                <p className="font-bold text-lg text-brand-600 dark:text-brand-400 mt-1">{selectedCompany.totalHired || 24}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">Average Salary Offer</p>
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400 mt-1">₹{selectedCompany.avgPackage} LPA</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">Highest Salary Offer</p>
                <p className="font-bold text-lg text-amber-600 dark:text-amber-400 mt-1">₹{selectedCompany.highestPackage} LPA</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">Assigned HR Recruiter Contacts</h4>
              {selectedCompany.recruiters && selectedCompany.recruiters.length > 0 ? (
                <div className="space-y-2">
                  {selectedCompany.recruiters.map(rec => (
                    <div key={rec.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{rec.name}</p>
                        <p className="text-slate-500">{rec.designation} • {rec.department}</p>
                      </div>
                      <div className="text-right font-mono text-slate-600 dark:text-slate-300">
                        <p>{rec.email}</p>
                        <p>{rec.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No recruiters assigned to this corporate profile yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Invite New Recruiter Company */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Corporate Recruiter to Campus"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleSaveInvite} leftIcon={<Send className="w-4 h-4" />}>
              Send Invitation & Onboard
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Razorpay Software Pvt Ltd"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Industry Sector"
              placeholder="e.g. FinTech / Software"
              value={formIndustry}
              onChange={(e) => setFormIndustry(e.target.value)}
            />

            <Select
              label="Company Classification"
              options={[
                { value: 'product', label: 'Product Company' },
                { value: 'service', label: 'IT Services' },
                { value: 'startup', label: 'Startup' },
                { value: 'mnc', label: 'Multinational (MNC)' },
              ]}
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
            />
          </div>

          <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 space-y-3">
            <h4 className="font-semibold text-xs text-brand-900 dark:text-brand-100 uppercase">Primary HR Contact Details</h4>

            <Input
              label="HR Recruiter Full Name"
              placeholder="Rohan Malhotra"
              value={formHrName}
              onChange={(e) => setFormHrName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="HR Email Address"
                type="email"
                placeholder="hr@company.com"
                value={formHrEmail}
                onChange={(e) => setFormHrEmail(e.target.value)}
                required
              />

              <Input
                label="HR Phone / Mobile"
                placeholder="+91 98765 43210"
                value={formHrPhone}
                onChange={(e) => setFormHrPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expected Average CTC (LPA ₹)"
              type="number"
              value={formAvgPackage}
              onChange={(e) => setFormAvgPackage(Number(e.target.value))}
            />

            <Input
              label="Highest Offered CTC (LPA ₹)"
              type="number"
              value={formHighestPackage}
              onChange={(e) => setFormHighestPackage(Number(e.target.value))}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Schedule Placement Drive */}
      {selectedCompany && (
        <Modal
          isOpen={isScheduleDriveModalOpen}
          onClose={() => setIsScheduleDriveModalOpen(false)}
          title={`Schedule Campus Drive — ${selectedCompany.name}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsScheduleDriveModalOpen(false)}>Cancel</Button>
              <Button variant="primary" loading={actionLoading} onClick={handleConfirmScheduleDrive}>
                Confirm & Schedule Drive
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Placement Drive Title"
              value={driveTitle}
              onChange={(e) => setDriveTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Drive Start Date"
                type="date"
                value={driveDate}
                onChange={(e) => setDriveDate(e.target.value)}
              />

              <Input
                label="Estimated Openings / Vacancies"
                type="number"
                value={driveOpenings}
                onChange={(e) => setDriveOpenings(Number(e.target.value))}
              />
            </div>

            <Input
              label="Campus Venue / Conduct Mode"
              value={driveVenue}
              onChange={(e) => setDriveVenue(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCompany}
        title="Remove Recruiter Company"
        message={`Are you sure you want to remove ${selectedCompany?.name} from your college visiting recruiter directory?`}
        confirmLabel="Remove Company"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

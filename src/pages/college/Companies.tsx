import React, { useEffect, useState } from 'react';
import {
  Building2, Search, Plus, MapPin, Users, Briefcase,
  IndianRupee, CheckCircle, Eye, Trash2, Calendar, Send, X, RotateCcw
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Badge, Button, Input, Select, Modal, Skeleton, EmptyState, ConfirmDialog } from '../../components/ui';
import { companyService, driveService, jobService } from '../../services';
import { formatNumber } from '../../utils';
import type { Company, Recruiter } from '../../types';
import { useAuthStore } from '../../store';

export const CollegeCompaniesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { user } = useAuthStore();

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<{ partners: number; hired: number; avg: string; highest: number } | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [upcomingDrives, setUpcomingDrives] = useState<number | null>(null);

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
      const res = await companyService.getAll({
        search,
        type: typeFilter,
        industry: industryFilter,
        status: 'all',
        page,
        limit: 10,
      });

      setCompanies(res.data as Company[]);
      setTotalPages(Math.max(1, res.totalPages));
      setTotalCount(res.total);
      if (res.stats) {
        setStats({
          partners: Number(res.stats.totalPartnerCompanies ?? res.total),
          hired: Number(res.stats.totalStudentsHired ?? 0),
          avg: String(res.stats.avgPackage ?? '—').replace(/^₹|\s*LPA$/g, ''),
          highest: Number(res.stats.highestPackage ?? 0),
        });
        if (Array.isArray(res.stats.industries)) setIndustries(res.stats.industries as string[]);
      }
    } catch (err) {
      console.error('Error loading college companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, industryFilter, typeFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    driveService.getAll()
      .then(drives => {
        const mine = drives.filter(d =>
          (!user?.tenantId || String((d as any).collegeId) === user.tenantId) &&
          d.status === 'upcoming' &&
          (!d.date || String(d.date).slice(0, 10) >= today)
        );
        setUpcomingDrives(mine.length);
      })
      .catch(() => setUpcomingDrives(0));
  }, [user?.tenantId]);

  const hasFilters = !!searchInput || industryFilter !== 'all' || typeFilter !== 'all';

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
        collegeId: user?.tenantId || '',
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
    setSearchInput('');
    setSearch('');
    setIndustryFilter('all');
    setTypeFilter('all');
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
      breadcrumbs={[{ label: 'College' }, { label: 'Companies' }]}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recruiter directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Companies that visit your campus, their packages and HR contacts
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenInvite} className="w-full sm:w-auto">
          Invite recruiter
        </Button>
      </div>

      {/* Top Stat Cards */}
      <Card className="mb-6 overflow-hidden" padding={false}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-slate-100 dark:bg-slate-700/60">
          {[
            { label: 'Partner companies', value: stats ? formatNumber(stats.partners) : null, icon: Building2, tone: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' },
            { label: 'Upcoming drives', value: upcomingDrives, icon: Calendar, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
            { label: 'Students hired', value: stats ? formatNumber(stats.hired) : null, icon: Users, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { label: 'Highest CTC', value: stats ? `₹${stats.highest}` : null, suffix: 'LPA', icon: IndianRupee, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
            { label: 'Average CTC', value: stats ? `₹${stats.avg}` : null, suffix: 'LPA', icon: Briefcase, tone: 'bg-ai-50 text-ai-600 dark:bg-ai-900/30 dark:text-ai-400' },
          ].map(({ label, value, suffix, icon: Icon, tone }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-800 ${i === 4 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
                {value === null || value === undefined ? (
                  <Skeleton className="h-6 w-14 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    {value}
                    {suffix && <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">{suffix}</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters & Navigation */}
      <Card className="mb-6 overflow-hidden" padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 min-w-0">
            <Input
              aria-label="Search companies"
              placeholder="Search by company, industry, city or HR name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={searchInput ? (
                <button type="button" aria-label="Clear search" onClick={() => setSearchInput('')} className="hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              ) : undefined}
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-3">
            <div className="md:w-52 shrink-0">
              <Select
                aria-label="Filter by industry"
                options={[{ value: 'all', label: 'All industries' }, ...industries.map(i => ({ value: i, label: i }))]}
                value={industryFilter}
                onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
              />
            </div>
            <div className="md:w-40 shrink-0">
              <Select
                aria-label="Filter by company type"
                options={[
                  { value: 'all', label: 'All types' },
                  { value: 'product', label: 'Product' },
                  { value: 'service', label: 'IT Services' },
                  { value: 'startup', label: 'Startup' },
                  { value: 'mnc', label: 'MNC' },
                  { value: 'psu', label: 'PSU' },
                ]}
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetFilters} className="self-start md:self-auto shrink-0">
              Reset
            </Button>
          )}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden md:block h-5 w-20 rounded-full" />
                <Skeleton className="hidden lg:block h-4 w-28" />
                <Skeleton className="hidden md:block h-4 w-24" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          /* EMPTY DATA STATE */
          <EmptyState
            icon={<Building2 className="w-10 h-10 text-slate-400" />}
            title={hasFilters ? 'No matching companies' : 'No recruiters yet'}
            description={hasFilters
              ? `Nothing matches${search ? ` "${search}"` : ''} with the selected filters.`
              : 'Invite your first recruiter to start scheduling campus drives.'}
            action={hasFilters
              ? { label: 'Reset filters', onClick: resetFilters }
              : { label: 'Invite recruiter', onClick: handleOpenInvite }}
            className="py-16"
          />
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-4">HR contact</th>
                  <th className="py-3 px-4" title="Average / highest CTC">Package</th>
                  <th className="py-3 px-4">Partnership</th>
                  <th className="py-3 pl-2 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                {companies.map((comp) => {
                  const hr = comp.recruiters && comp.recruiters.length > 0 ? comp.recruiters[0] : null;

                  return (
                    <tr key={comp.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => { setSelectedCompany(comp); setIsDetailModalOpen(true); }}
                          className="flex items-center gap-3 text-left min-w-0"
                        >
                          {comp.logo ? (
                            <img src={comp.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/30 text-brand-700 dark:text-brand-300 font-bold text-sm flex items-center justify-center shrink-0 ring-1 ring-brand-200/70 dark:ring-brand-800">
                              {comp.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 max-w-[280px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{comp.name}</p>
                              <span className="shrink-0">{getTypeBadge(comp.type)}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {comp.industry}
                              {comp.hq && (
                                <span className="inline-flex items-center gap-0.5 ml-1.5">
                                  <MapPin className="w-3 h-3" />{comp.hq}
                                </span>
                              )}
                            </p>
                          </div>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        {hr ? (
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{hr.name}</p>
                            <p className="text-slate-500 dark:text-slate-400 truncate">{hr.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not assigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap" title={`Average ₹${comp.avgPackage} LPA · Highest ₹${comp.highestPackage} LPA`}>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{comp.avgPackage}</span>
                        <span className="text-slate-300 dark:text-slate-600 mx-1.5">/</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">₹{comp.highestPackage}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">LPA</span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleTiedStatus(comp)}
                          title={comp.isTied ? 'Click to mark as standard' : 'Click to mark as campus partner'}
                          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <Badge variant={comp.isTied ? 'green' : 'slate'} dot>{comp.isTied ? 'Campus partner' : 'Standard'}</Badge>
                        </button>
                      </td>

                      <td className="py-4 pl-2 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleOpenScheduleDrive(comp)} leftIcon={<Calendar className="w-3.5 h-3.5" />} className="whitespace-nowrap">
                            Schedule drive
                          </Button>
                          <button
                            type="button"
                            aria-label={`View ${comp.name}`}
                            title="View details"
                            onClick={() => { setSelectedCompany(comp); setIsDetailModalOpen(true); }}
                            className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${comp.name}`}
                            title="Remove company"
                            onClick={() => { setSelectedCompany(comp); setIsDeleteConfirmOpen(true); }}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <p className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{companies.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> {totalCount === 1 ? 'company' : 'companies'}
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

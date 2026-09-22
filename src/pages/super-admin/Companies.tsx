import React, { useEffect, useState } from 'react';
import {
  Building2, Search, Plus, Filter, Globe, MapPin, Users, Briefcase,
  DollarSign, CheckCircle, ShieldCheck, Eye, Edit3, Trash2, LayoutGrid,
  List, ExternalLink, AlertTriangle, RefreshCw, XCircle
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, Input, Select, Modal, Skeleton, EmptyState, ConfirmDialog, Tabs } from '../../components/ui';
import { companyService } from '../../services';
import { formatNumber } from '../../utils';
import type { Company } from '../../types';

export const SuperAdminCompaniesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statsData, setStatsData] = useState({
    totalPartnerCompanies: 0,
    tiedCount: 0,
    totalStudentsHired: '0',
    avgPackage: '₹0.0 LPA',
  });

  // Selected Company Modals
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formIndustry, setFormIndustry] = useState('Technology');
  const [formType, setFormType] = useState<Company['type']>('product');
  const [formSize, setFormSize] = useState<Company['size']>('medium');
  const [formHq, setFormHq] = useState('Bengaluru');
  const [formWebsite, setFormWebsite] = useState('');
  const [formFounded, setFormFounded] = useState(2018);
  const [formAvgPackage, setFormAvgPackage] = useState(12.0);
  const [formHighestPackage, setFormHighestPackage] = useState(28.0);
  const [formDescription, setFormDescription] = useState('');
  const [formIsTied, setFormIsTied] = useState(true);

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
        status: statusFilter,
        page,
        limit: 12,
      });

      setCompanies(res.data as Company[]);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);

      if (res.stats) {
        setStatsData({
          totalPartnerCompanies: Number(res.stats.totalPartnerCompanies || res.total || 0),
          tiedCount: Number(res.stats.tiedCount || 0),
          totalStudentsHired: formatNumber(Number(res.stats.totalStudentsHired || 0)),
          avgPackage: String(res.stats.avgPackage || '₹0.0 LPA'),
        });
      }
    } catch (err) {
      console.error('Error loading companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, typeFilter, statusFilter, page]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormIndustry('Technology');
    setFormType('product');
    setFormSize('medium');
    setFormHq('Bengaluru');
    setFormWebsite('https://www.example.com');
    setFormFounded(2020);
    setFormAvgPackage(12.0);
    setFormHighestPackage(28.0);
    setFormDescription('Leading tech company empowering digital transformation.');
    setFormIsTied(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setSelectedCompany(comp);
    setFormName(comp.name);
    setFormIndustry(comp.industry);
    setFormType(comp.type);
    setFormSize(comp.size);
    setFormHq(comp.hq);
    setFormWebsite(comp.website || '');
    setFormFounded(comp.founded);
    setFormAvgPackage(comp.avgPackage);
    setFormHighestPackage(comp.highestPackage);
    setFormDescription(comp.description);
    setFormIsTied(comp.isTied);
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async () => {
    if (!formName) {
      showToast('Please enter a company name');
      return;
    }
    setActionLoading(true);
    try {
      await companyService.create({
        name: formName,
        industry: formIndustry || 'Technology',
        type: formType || 'product',
        size: formSize || 'medium',
        hq: formHq || 'Bengaluru',
        website: formWebsite,
        founded: formFounded,
        avgPackage: formAvgPackage,
        highestPackage: formHighestPackage,
        description: formDescription,
        isTied: formIsTied,
      });
      showToast(`Company "${formName}" onboarded successfully!`);
      setIsAddModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : 'Failed to onboard company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      await companyService.update(selectedCompany.id, {
        name: formName,
        industry: formIndustry,
        type: formType,
        size: formSize,
        hq: formHq,
        website: formWebsite,
        founded: formFounded,
        avgPackage: formAvgPackage,
        highestPackage: formHighestPackage,
        description: formDescription,
        isTied: formIsTied,
      });
      showToast(`Company "${formName}" updated successfully!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      showToast(e instanceof Error ? e.message : 'Failed to update company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTied = async (comp: Company) => {
    try {
      await companyService.toggleTiedStatus(comp.id);
      showToast(`Tied-up status updated for ${comp.name}`);
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
      showToast(`Company "${selectedCompany.name}" removed.`);
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
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const getTypeBadge = (type: Company['type']) => {
    switch (type) {
      case 'product': return <Badge variant="purple">Product</Badge>;
      case 'service': return <Badge variant="blue">Service</Badge>;
      case 'startup': return <Badge variant="green">Startup</Badge>;
      case 'mnc': return <Badge variant="indigo">MNC</Badge>;
      case 'psu': return <Badge variant="amber">PSU</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Company & Recruiter Directory"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Companies' }]}
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Onboard New Company
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

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Partner Companies" value={statsData.totalPartnerCompanies || totalCount} change="Active on platform" changeType="increase" icon={<Building2 className="w-5 h-5" />} color="brand" />
        <StatCard title="Tied-Up Partners" value={statsData.tiedCount} change="Exclusive drive contracts" changeType="increase" icon={<ShieldCheck className="w-5 h-5" />} color="purple" />
        <StatCard title="Total Students Hired" value={statsData.totalStudentsHired} change="Across all placement drives" changeType="increase" icon={<Users className="w-5 h-5" />} color="green" />
        <StatCard title="Avg Package Offered" value={statsData.avgPackage} change="Platform-wide average" changeType="neutral" icon={<DollarSign className="w-5 h-5" />} color="amber" />
      </div>

      {/* Search & Filter Header Bar */}
      <Card className="mb-6" padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 md:w-80">
            <Input
              placeholder="Search company, industry, HQ..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              options={[
                { value: 'all', label: 'All Company Types' },
                { value: 'product', label: 'Product' },
                { value: 'service', label: 'IT Services' },
                { value: 'startup', label: 'Startup' },
                { value: 'mnc', label: 'MNC' },
              ]}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-44"
            />
          </div>
        </div>

        {/* Content Container — Table List View */}
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : companies.length === 0 ? (
          /* EMPTY DATA STATE */
          <EmptyState
            icon={<Building2 className="w-10 h-10 text-slate-400" />}
            title="No Companies Found"
            description="No corporate recruiter profiles match your current search keywords or filters."
            action={{ label: "Reset Search & Filters", onClick: resetFilters }}
            className="py-16"
          />
        ) : (
          /* TABLE LIST VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-6">Company Name</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">HQ Location</th>
                  <th className="py-3.5 px-4">Avg Salary</th>
                  <th className="py-3.5 px-4">Tied Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-brand-200">
                          {comp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{comp.name}</p>
                          <p className="text-xs text-slate-400">Founded: {comp.founded}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">{comp.industry}</td>
                    <td className="py-4 px-4">{getTypeBadge(comp.type)}</td>
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">{comp.hq}</td>
                    <td className="py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400">₹{comp.avgPackage} LPA</td>
                    <td className="py-4 px-4">
                      <button onClick={() => handleToggleTied(comp)} className="cursor-pointer">
                        <Badge variant={comp.isTied ? 'green' : 'slate'} dot>{comp.isTied ? 'Tied-Up' : 'Standard'}</Badge>
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedCompany(comp); setIsDetailModalOpen(true); }}>
                          Inspect
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(comp)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedCompany(comp); setIsDeleteConfirmOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {!loading && companies.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{companies.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> companies
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

      {/* MODAL 1: Company Details */}
      {selectedCompany && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Corporate Profile — ${selectedCompany.name}`}
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
                  <p className="text-xs text-slate-500">{selectedCompany.industry} • Founded {selectedCompany.founded}</p>
                </div>
              </div>
              {getTypeBadge(selectedCompany.type)}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              {selectedCompany.description}
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">Headquarters</p>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-1">{selectedCompany.hq}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">Average Salary Package</p>
                <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 mt-1">₹{selectedCompany.avgPackage} LPA</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">Highest Salary Offer</p>
                <p className="font-semibold text-sm text-amber-600 dark:text-amber-400 mt-1">₹{selectedCompany.highestPackage} LPA</p>
              </div>
            </div>

            {selectedCompany.techStack && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Technologies & Skills Searched</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.techStack.map(skill => (
                    <Badge key={skill} variant="slate">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: Add / Edit Company */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? "Onboard Corporate Recruiter Partner" : `Edit Company — ${selectedCompany?.name}`}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={isAddModalOpen ? handleSaveAdd : handleSaveEdit}>
              {isAddModalOpen ? "Save & Onboard" : "Save Changes"}
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
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Industry Sector"
              placeholder="e.g. FinTech / Software"
              value={formIndustry}
              onChange={(e) => setFormIndustry(e.target.value)}
            />

            <Select
              label="Company Classification Type"
              options={[
                { value: 'product', label: 'Product Company' },
                { value: 'service', label: 'IT Services' },
                { value: 'startup', label: 'Startup' },
                { value: 'mnc', label: 'Multinational (MNC)' },
                { value: 'psu', label: 'Public Sector (PSU)' },
              ]}
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Headquarters Location"
              placeholder="e.g. Bengaluru, India"
              value={formHq}
              onChange={(e) => setFormHq(e.target.value)}
            />

            <Input
              label="Website URL"
              placeholder="https://www.company.com"
              value={formWebsite}
              onChange={(e) => setFormWebsite(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Average Package (LPA ₹)"
              type="number"
              value={formAvgPackage}
              onChange={(e) => setFormAvgPackage(Number(e.target.value))}
            />

            <Input
              label="Highest Package Offered (LPA ₹)"
              type="number"
              value={formHighestPackage}
              onChange={(e) => setFormHighestPackage(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Description</label>
            <textarea
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 resize-none h-20"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCompany}
        title="Remove Company Profile"
        message={`Are you sure you want to remove ${selectedCompany?.name}? This action cannot be undone.`}
        confirmLabel="Delete Company"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Filter, Mail, Phone, ArrowUpRight, ShieldAlert, Sparkles, Check, X, Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Pagination, EmptyState, Skeleton, Modal } from '../../components/ui';
import { collegeService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { College } from '../../types';

export const SuperAdminCollegesPage: React.FC = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<College | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    collegeService.getStudentCounts().then(setStudentCounts).catch(() => setStudentCounts({}));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await collegeService.delete(deleteTarget.id, deleteTarget.isActive);
      if (result === 'deleted') {
        toast.success(`${deleteTarget.name} deleted`);
      } else {
        toast.success(`${deleteTarget.name} removed from dashboard`, {
          description: 'Suspended on the server (logins disabled). Permanent deletion needs the backend DELETE endpoint.',
        });
      }
      setDeleteTarget(null);
      fetchColleges();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete college');
    } finally {
      setDeleting(false);
    }
  };

  const EMPTY_COLLEGE_FORM = {
    name: '',
    city: '',
    state: '',
    establishedYear: '',
    tpoName: '',
    tpoEmail: '',
    tpoPhone: '',
    password: '',
    plan: 'starter',
  };

  // Add College Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newCollege, setNewCollege] = useState(EMPTY_COLLEGE_FORM);

  // Edit College Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    establishedYear: '',
    tpoName: '',
    tpoEmail: '',
    tpoPhone: '',
    plan: 'starter' as College['subscription']['plan'],
    status: 'active' as College['subscription']['status'],
  });

  const LIMIT = 8;

  const fetchColleges = async () => {
    setLoading(true);
    try {
      // Fetch full set from API + database + sync so no colleges are missing
      const res = await collegeService.getAll({ limit: 200 });

      let filtered = [...res.data];

      // Filter by search query across name, code, city, state
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.state && c.state.toLowerCase().includes(q))
        );
      }

      // Filter by plan
      if (plan) filtered = filtered.filter(c => c.subscription.plan === plan);

      // Filter by status
      if (status) filtered = filtered.filter(c => c.subscription.status === status);

      const totalCount = filtered.length;
      setTotal(totalCount);
      const computedTotalPages = Math.max(1, Math.ceil(totalCount / LIMIT));
      setTotalPages(computedTotalPages);

      // Adjust page if current page exceeds computed totalPages
      const safePage = Math.min(page, computedTotalPages);
      if (safePage !== page && safePage > 0) {
        setPage(safePage);
      }

      // Paginate current slice
      const start = (safePage - 1) * LIMIT;
      setColleges(filtered.slice(start, start + LIMIT));
    } catch {
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [search, plan, status, page]);

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollege.name || !newCollege.tpoEmail || !newCollege.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const created = await collegeService.create({
        name: newCollege.name,
        city: newCollege.city,
        state: newCollege.state,
        establishedYear: parseInt(newCollege.establishedYear, 10),
        tpoName: newCollege.tpoName,
        tpoEmail: newCollege.tpoEmail,
        tpoPhone: newCollege.tpoPhone,
        password: newCollege.password,
        plan: newCollege.plan,
      });

      const code = created.college?.code;
      toast.success(`🎉 ${newCollege.name} Registered Successfully!`, {
        description: `College code ${code || 'assigned'}. TPO login: ${newCollege.tpoEmail}`,
        duration: 8000,
      });

      setShowAddModal(false);
      setNewCollege(EMPTY_COLLEGE_FORM);
      fetchColleges();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register college';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAdd = () => {
    setNewCollege(EMPTY_COLLEGE_FORM);
    setShowAddModal(true);
  };

  const handleOpenEdit = (college: College) => {
    setEditingCollege(college);
    setEditForm({
      name: college.name,
      code: college.code,
      city: college.city,
      state: college.state,
      establishedYear: String(college.establishedYear || ''),
      tpoName: college.tpoName,
      tpoEmail: college.tpoEmail,
      tpoPhone: college.tpoPhone || '',
      plan: college.subscription.plan,
      status: college.subscription.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;

    setSubmitting(true);
    try {
      const updatedData: Partial<College> = {
        name: editForm.name,
        code: editForm.code,
        city: editForm.city,
        state: editForm.state,
        establishedYear: parseInt(editForm.establishedYear || '2000', 10),
        tpoName: editForm.tpoName,
        tpoEmail: editForm.tpoEmail,
        tpoPhone: editForm.tpoPhone,
        subscription: {
          ...editingCollege.subscription,
          plan: editForm.plan,
          status: editForm.status,
        },
      };

      await collegeService.update(editingCollege.id, updatedData);

      setColleges(prev => prev.map(c => c.id === editingCollege.id ? {
        ...c,
        ...updatedData,
        subscription: { ...c.subscription, plan: editForm.plan, status: editForm.status }
      } : c));

      toast.success(`🎉 ${editForm.name} updated successfully!`);
      setShowEditModal(false);
      setEditingCollege(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update college';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    setTogglingId(id);
    // Optimistic UI update
    setColleges(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));

    try {
      const result = await collegeService.toggleStatus(id);
      const newStatus = typeof result?.isActive === 'boolean' ? result.isActive : !current;

      setColleges(prev => prev.map(c => c.id === id ? { ...c, isActive: newStatus } : c));

      toast.success(
        newStatus ? '🎉 College account activated successfully' : '⚠️ College account suspended successfully',
        {
          description: newStatus
            ? 'College portal and student logins are now active.'
            : 'College portal has been suspended. Student and TPO logins disabled.',
        }
      );
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setColleges(prev => prev.map(c => c.id === id ? { ...c, isActive: current } : c));
      const msg = err instanceof Error ? err.message : 'Failed to update college status';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const getPlanBadge = (p: College['subscription']['plan']) => {
    switch (p) {
      case 'enterprise': return <Badge variant="purple">Enterprise</Badge>;
      case 'professional': return <Badge variant="indigo">Professional</Badge>;
      case 'starter': return <Badge variant="slate">Starter</Badge>;
      default: return <Badge variant="slate">{p}</Badge>;
    }
  };

  const getStatusBadge = (s: College['subscription']['status']) => {
    switch (s) {
      case 'active': return <Badge variant="green">Active</Badge>;
      case 'trial': return <Badge variant="blue">Trial</Badge>;
      case 'expired': return <Badge variant="red">Expired</Badge>;
      default: return <Badge variant="slate">{s}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Colleges"
      subtitle="Manage registered universities & tenants"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Colleges' }]}
      actions={
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
          className="bg-[#08546c] hover:bg-[#064255] font-extrabold text-xs sm:text-sm px-4 py-2"
        >
          Add College
        </Button>
      }
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by university name or city..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={plan}
            onChange={e => { setPlan(e.target.value); setPage(1); }}
            placeholder="All Plans"
            options={[
              { value: 'starter', label: 'Starter' },
              { value: 'professional', label: 'Professional' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
            className="sm:w-44"
          />
          <Select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            placeholder="All Statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'trial', label: 'Trial' },
              { value: 'expired', label: 'Expired' },
            ]}
            className="sm:w-40"
          />
        </div>
        {(search || plan || status) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Found <strong className="text-slate-800 dark:text-slate-200">{total}</strong> {total === 1 ? 'college' : 'colleges'} matching your filters
            </span>
            <button
              type="button"
              onClick={() => { setSearch(''); setPlan(''); setStatus(''); setPage(1); }}
              className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title="No colleges found"
          description="Adjust your search criteria or register a new university tenant."
          action={{ label: 'Add College', onClick: handleOpenAdd }}
        />
      ) : (
        <div className="space-y-4">
          {colleges.map((college) => (
            <Card 
              key={college.id} 
              className="p-6 hover:shadow-elevated transition-all duration-200 cursor-pointer border hover:border-brand-500"
              onClick={() => navigate(`/super-admin/colleges/${college.id}`)}
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{college.name}</h3>
                    {college.code && <Badge variant="indigo">Code {college.code}</Badge>}
                    {getPlanBadge(college.subscription.plan)}
                    {getStatusBadge(college.subscription.status)}
                  </div>
                  <p className="text-xs text-slate-500">{college.city}, {college.state} · Established {college.establishedYear}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{college.tpoEmail}</span>
                    <span>TPO: {college.tpoName}</span>
                    <span>Registered: {formatDate(college.createdAt)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:self-center pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-3 gap-6 text-xs text-right sm:text-left">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Students</span>
                      <span className="font-bold text-slate-900 dark:text-white">{studentCounts[college.id] ?? 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">AI Credits</span>
                      <span className="font-bold text-slate-900 dark:text-white">{college.subscription.aiCreditsUsed} / {college.subscription.aiCreditsLimit}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                      <span className={`font-bold ${college.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {college.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs justify-center flex-1 sm:flex-none"
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(college); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={college.isActive ? 'outline' : 'primary'}
                      size="sm"
                      loading={togglingId === college.id}
                      className="text-xs justify-center flex-1 sm:flex-none"
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(college.id, college.isActive); }}
                    >
                      {college.isActive ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Quick Upgrade / Edit Plan"
                      className="text-brand-600 hover:bg-brand-50"
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(college); }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete college"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(college); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          <Card className="p-4 mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </Card>
        </div>
      )}

      {/* CREATE COLLEGE MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New College Tenant & Admin Account"
        size="lg"
      >
        <form onSubmit={handleCreateCollege} className="space-y-4" autoComplete="off">
          <div className="bg-cyan-50 dark:bg-slate-800/80 border border-cyan-200/80 dark:border-slate-700 p-3.5 rounded-2xl text-xs text-[#08546c] dark:text-cyan-300 font-medium leading-relaxed">
            🎓 <strong>Automatic College Admin Setup:</strong> Registering a college creates the institutional tenant and automatically provisions a <strong>College Admin / TPO account</strong>. The admin will use these login credentials to sign in.
          </div>

          <Input
            label="College / Institution Name *"
            placeholder="e.g. Sona College of Technology"
            value={newCollege.name}
            onChange={e => setNewCollege({ ...newCollege, name: e.target.value })}
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
            A college code of 3 letters and 1 number is generated automatically and shown here and on the TPO login.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City *"
              placeholder="e.g. Salem"
              value={newCollege.city}
              onChange={e => setNewCollege({ ...newCollege, city: e.target.value })}
              required
            />
            <Input
              label="State"
              placeholder="e.g. Tamil Nadu"
              value={newCollege.state}
              onChange={e => setNewCollege({ ...newCollege, state: e.target.value })}
            />
            <Input
              label="Established Year"
              placeholder="e.g. 1998"
              value={newCollege.establishedYear}
              onChange={e => setNewCollege({ ...newCollege, establishedYear: e.target.value })}
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              College Admin / TPO Credentials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin / TPO Name *"
                placeholder="e.g. Prof. Anitha Rajan"
                value={newCollege.tpoName}
                onChange={e => setNewCollege({ ...newCollege, tpoName: e.target.value })}
                required
              />
              <Input
                label="Admin Login Email *"
                type="email"
                placeholder="admin@sonatech.ac.in"
                value={newCollege.tpoEmail}
                onChange={e => setNewCollege({ ...newCollege, tpoEmail: e.target.value })}
                autoComplete="off"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Input
                label="Admin Login Password *"
                type={showPassword ? 'text' : 'password'}
                placeholder="password123"
                value={newCollege.password}
                onChange={e => setNewCollege({ ...newCollege, password: e.target.value })}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
              <Input
                label="TPO Contact Phone"
                placeholder="+91 9876543210"
                value={newCollege.tpoPhone}
                onChange={e => setNewCollege({ ...newCollege, tpoPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <Select
              label="Subscription Plan"
              value={newCollege.plan}
              onChange={e => setNewCollege({ ...newCollege, plan: e.target.value })}
              options={[
                { value: 'starter', label: 'Starter Plan (5,000 AI Credits)' },
                { value: 'professional', label: 'Professional Plan (20,000 AI Credits)' },
                { value: 'enterprise', label: 'Enterprise Plan (50,000 AI Credits)' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="bg-[#08546c] hover:bg-[#064255] text-white font-extrabold px-6"
            >
              Create College & Provision Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT COLLEGE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingCollege(null); }}
        title={`Edit ${editingCollege?.name || 'College Details'}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="College / Institution Name *"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <Input
              label="College code"
              value={editForm.code}
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City *"
              value={editForm.city}
              onChange={e => setEditForm({ ...editForm, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={editForm.state}
              onChange={e => setEditForm({ ...editForm, state: e.target.value })}
            />
            <Input
              label="Established Year"
              value={editForm.establishedYear}
              onChange={e => setEditForm({ ...editForm, establishedYear: e.target.value })}
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              TPO / College Admin Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin / TPO Name *"
                value={editForm.tpoName}
                onChange={e => setEditForm({ ...editForm, tpoName: e.target.value })}
                required
              />
              <Input
                label="Admin Contact Email *"
                type="email"
                value={editForm.tpoEmail}
                onChange={e => setEditForm({ ...editForm, tpoEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Subscription Plan"
              value={editForm.plan}
              onChange={e => setEditForm({ ...editForm, plan: e.target.value as College['subscription']['plan'] })}
              options={[
                { value: 'starter', label: 'Starter Plan' },
                { value: 'professional', label: 'Professional Plan' },
                { value: 'enterprise', label: 'Enterprise Plan' },
              ]}
            />

            <Select
              label="Subscription Status"
              value={editForm.status}
              onChange={e => setEditForm({ ...editForm, status: e.target.value as College['subscription']['status'] })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'trial', label: 'Trial' },
                { value: 'expired', label: 'Expired' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setShowEditModal(false); setEditingCollege(null); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="bg-[#08546c] hover:bg-[#064255] text-white font-extrabold px-6"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete college"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Permanently delete <strong>{deleteTarget?.name}</strong>
              {deleteTarget?.code ? ` (${deleteTarget.code})` : ''}? It has{' '}
              <strong>{deleteTarget ? studentCounts[deleteTarget.id] ?? 0 : 0}</strong> registered student(s). This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button
              variant="primary"
              loading={deleting}
              onClick={handleDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete College
            </Button>
          </div>
        </div>
      </Modal>

    </PageWrapper>
  );
};


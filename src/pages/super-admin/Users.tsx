import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../layouts';
import { Card, StatCard, Button, Input, Select, Badge, Avatar, ConfirmDialog, Skeleton, EmptyState, Modal, Tabs } from '../../components/ui';
import { 
  Users, Search, Filter, ShieldAlert, CheckCircle, Trash2, ShieldCheck, 
  Briefcase, GraduationCap, Building2, Eye, Mail, Phone, Calendar, Copy, 
  ExternalLink, FileText, Award, BookOpen, Check, Sparkles, MapPin, Globe, 
  Clock, CheckCircle2, XCircle, ArrowUpRight, DollarSign, Layers, Code, UserCheck, Shield
} from 'lucide-react';
import { userService } from '../../services';
import type { User, Role } from '../../types';
import { toast } from 'sonner';

export const SuperAdminUsersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, studentCount: 0, adminCount: 0 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Actions & Selection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Full Details Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<{
    user: any;
    student?: any;
    college?: any;
    recruiter?: any;
    applications?: any[];
  } | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 15,
      });

      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.total);
      
      if ((res as any).stats) {
        setStats((res as any).stats);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, roleFilter, statusFilter, page]);

  const handleOpenDetails = async (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setActiveDetailTab('overview');
    
    // Seed with immediate row data so user sees base info instantly
    setDetailData({
      user,
      student: null,
      college: user.collegeName ? { name: user.collegeName, code: user.collegeCode } : null,
      recruiter: null,
      applications: [],
    });

    try {
      const res = await userService.getById(user.id);
      if (res && res.data) {
        setDetailData(res.data);
      }
    } catch (err) {
      console.warn('Extended profile fetch notice:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleStatus(user.id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      
      // Update in local list
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      
      // Update in detail modal if active
      if (detailData && detailData.user && detailData.user.id === user.id) {
        setDetailData(prev => prev ? {
          ...prev,
          user: { ...prev.user, isActive: !prev.user.isActive }
        } : null);
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.delete(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteConfirmOpen(false);
      setIsDetailModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN': return <Badge variant="indigo"><ShieldAlert className="w-3 h-3 mr-1 inline" />Super Admin</Badge>;
      case 'COLLEGE_ADMIN': return <Badge variant="purple"><Building2 className="w-3 h-3 mr-1 inline" />College Admin</Badge>;
      case 'TPO': return <Badge variant="amber"><ShieldCheck className="w-3 h-3 mr-1 inline" />TPO</Badge>;
      case 'RECRUITER': return <Badge variant="blue"><Briefcase className="w-3 h-3 mr-1 inline" />Recruiter</Badge>;
      case 'STUDENT': return <Badge variant="green"><GraduationCap className="w-3 h-3 mr-1 inline" />Student</Badge>;
      default: return <Badge variant="slate">{role}</Badge>;
    }
  };

  const activeUser = detailData?.user || selectedUser;
  const student = detailData?.student;
  const college = detailData?.college;
  const recruiter = detailData?.recruiter;
  const applications = detailData?.applications || [];

  // Construct dynamic modal tabs based on role
  const detailTabs = [
    { id: 'overview', label: 'Overview & Account', icon: <UserCheck className="w-4 h-4" /> },
    ...(activeUser?.role === 'STUDENT' ? [
      { id: 'academic', label: 'Academic & Placement', icon: <GraduationCap className="w-4 h-4" /> },
      { id: 'skills', label: 'Skills & Projects', icon: <Code className="w-4 h-4" /> },
      { id: 'applications', label: 'Applications', icon: <Briefcase className="w-4 h-4" />, badge: applications.length },
    ] : []),
    ...(activeUser?.role === 'COLLEGE_ADMIN' || activeUser?.role === 'TPO' ? [
      { id: 'college', label: 'College & Campus', icon: <Building2 className="w-4 h-4" /> },
    ] : []),
    ...(activeUser?.role === 'RECRUITER' ? [
      { id: 'recruiter', label: 'Hiring Organization', icon: <Briefcase className="w-4 h-4" /> },
    ] : []),
    { id: 'permissions', label: 'Access & Permissions', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <PageWrapper 
      title="User Management" 
      subtitle="Manage all platform users, roles, and access permissions"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Users' }]}
    >
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={stats.totalUsers || totalCount} change="Registered accounts" changeType="increase" icon={<Users className="w-5 h-5" />} color="brand" />
        <StatCard title="Active Users" value={stats.activeUsers} change="Currently active" changeType="neutral" icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <StatCard title="Students" value={stats.studentCount} change="Learning & Applying" changeType="increase" icon={<GraduationCap className="w-5 h-5" />} color="blue" />
        <StatCard title="Admins" value={stats.adminCount} change="Platform & College" changeType="neutral" icon={<ShieldCheck className="w-5 h-5" />} color="purple" />
      </div>

      <Card padding={false} className="mb-6">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 md:w-80">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'SUPER_ADMIN', label: 'Super Admin' },
                { value: 'COLLEGE_ADMIN', label: 'College Admin' },
                { value: 'TPO', label: 'TPO' },
                { value: 'RECRUITER', label: 'Recruiter' },
                { value: 'STUDENT', label: 'Student' },
              ]}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-44"
            />
            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-40"
            />
          </div>
        </div>

        {/* Content Container — Table List View */}
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10 text-slate-400" />}
            title="No Users Found"
            description="No users match your current search keywords or filters."
            action={{ label: "Reset Search & Filters", onClick: resetFilters }}
            className="py-16"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleOpenDetails(user)}
                    className="hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-all cursor-pointer group"
                    title="Click to view full user profile & details"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
                            {user.name}
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-500 transition-opacity" />
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }} 
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge variant={user.isActive ? 'green' : 'slate'} dot>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); handleOpenDetails(user); }}
                          className="text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setIsDeleteConfirmOpen(true); }}
                        >
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
        {!loading && users.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{users.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> users
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

      {/* ─── FULL USER DETAILS MODAL ────────────────────────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={activeUser ? `User Profile — ${activeUser.name}` : 'User Details'}
        size="xl"
        footer={
          activeUser && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(activeUser)}
                >
                  {activeUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(activeUser);
                    setIsDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1 inline" />
                  Delete User
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          )
        }
      >
        {activeUser && (
          <div className="space-y-6">
            {/* Header Profile Hero Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-brand-50/20 to-slate-50 dark:from-slate-800/80 dark:via-brand-950/20 dark:to-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar name={activeUser.name} size="lg" className="w-16 h-16 text-xl shadow-md ring-2 ring-white dark:ring-slate-700" />
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white dark:ring-slate-800 ${activeUser.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeUser.name}</h3>
                    {getRoleBadge(activeUser.role)}
                    <Badge variant={activeUser.isActive ? 'green' : 'slate'} dot>
                      {activeUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {activeUser.isEmailVerified !== false && (
                      <Badge variant="blue">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {activeUser.email}
                      <button 
                        onClick={() => copyToClipboard(activeUser.email, 'Email address')}
                        className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors ml-0.5"
                        title="Copy email"
                      >
                        <Copy className="w-3 h-3 inline" />
                      </button>
                    </span>
                    {(activeUser.phone || student?.phone) && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {activeUser.phone || student?.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Joined {new Date(activeUser.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Pills */}
              <div className="flex md:flex-col items-end gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(activeUser.id || activeUser._id, 'User ID')}
                  className="text-xs text-slate-600 dark:text-slate-300"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy ID: #{String(activeUser.id || activeUser._id).slice(-6)}
                </Button>
                {activeUser.lastLogin && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last login {new Date(activeUser.lastLogin).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <Tabs 
              tabs={detailTabs} 
              activeTab={activeDetailTab} 
              onChange={setActiveDetailTab} 
            />

            {/* TAB CONTENT: Overview */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account Information Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-brand-500" />
                      Account & Identity
                    </h4>
                    <div className="space-y-2 text-sm divide-y divide-slate-200/60 dark:divide-slate-700/60">
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Full Name</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{activeUser.name}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Primary Email</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{activeUser.email}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Phone Number</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{activeUser.phone || student?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Platform Role</span>
                        <span className="font-medium">{getRoleBadge(activeUser.role)}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Account Status</span>
                        <Badge variant={activeUser.isActive ? 'green' : 'slate'} dot>
                          {activeUser.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* System & Affiliation Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      Affiliation & Organization
                    </h4>
                    <div className="space-y-2 text-sm divide-y divide-slate-200/60 dark:divide-slate-700/60">
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Affiliated Entity</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {college?.name || student?.collegeId?.name || activeUser.collegeName || recruiter?.name || 'Platform-wide / Direct'}
                        </span>
                      </div>
                      {(college?.code || student?.collegeId?.code || activeUser.collegeCode) && (
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Entity Code</span>
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200">
                            {college?.code || student?.collegeId?.code || activeUser.collegeCode}
                          </span>
                        </div>
                      )}
                      {(college?.city || student?.address?.city) && (
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Campus Location</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {college?.city || student?.address?.city}{college?.state ? `, ${college.state}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Registered On</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(activeUser.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">User ID</span>
                        <span className="font-mono text-xs text-slate-500 truncate max-w-[200px]">
                          {activeUser.id || activeUser._id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Specific Quick Summary Banner */}
                {activeUser.role === 'STUDENT' && student && (
                  <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/30 dark:bg-brand-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-brand-600 text-white shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                          {student.degree} — {student.department} ({student.batch || 'Batch'})
                        </h5>
                        <p className="text-xs text-slate-500">
                          Roll / USN: <span className="font-medium text-slate-700 dark:text-slate-300">{student.studentId || 'N/A'}</span> • CGPA: <span className="font-semibold text-brand-600 dark:text-brand-400">{student.cgpa || 'N/A'}</span> • Status: <span className="capitalize font-medium">{student.placementStatus?.replace('_', ' ') || 'Registered'}</span>
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveDetailTab('academic')}
                    >
                      View Academics <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Academic & Placement (For Students) */}
            {activeDetailTab === 'academic' && (
              <div className="space-y-4 pt-2">
                {student ? (
                  <>
                    {/* Academic Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500">Cumulative CGPA</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{student.cgpa ?? 'N/A'}</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Scale 10.0</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500">Active Backlogs</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{student.backlogs ?? 0}</p>
                        <span className={`text-[11px] font-medium ${student.backlogs === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {student.backlogs === 0 ? 'Clear Record' : 'Requires Clearance'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500">Readiness Score</span>
                        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{student.placementReadinessScore ?? 85}%</p>
                        <span className="text-[11px] text-brand-600">AI Placement Ready</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500">Offers Received</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{student.offersCount ?? 0}</p>
                        <span className="text-[11px] text-slate-500">Campus Drives</span>
                      </div>
                    </div>

                    {/* Detailed Academic Info Grid */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                        Degree & Academic Credentials
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">College Roll / USN</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{student.studentId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">Degree & Program</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{student.degree || 'B.Tech / B.E.'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">Department / Branch</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{student.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">Graduating Batch</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{student.batch || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">Placement Status</span>
                          <span className="capitalize font-semibold text-slate-900 dark:text-slate-100">
                            {student.placementStatus ? student.placementStatus.replace('_', ' ') : 'Not Placed'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">Drive Eligibility</span>
                          <Badge variant={student.isEligible !== false ? 'green' : 'amber'}>
                            {student.isEligible !== false ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Preferences & Expected CTC */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-brand-500" />
                        Career Preferences
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-500">Expected Salary</span>
                          <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {student.expectedSalary ? `₹${(student.expectedSalary / 100000).toFixed(1)} LPA` : 'Not specified'}
                          </span>
                        </div>
                        {student.preferredRoles && student.preferredRoles.length > 0 && (
                          <div className="py-1">
                            <span className="text-slate-500 block text-xs mb-1">Preferred Roles</span>
                            <div className="flex flex-wrap gap-1.5">
                              {student.preferredRoles.map((r: string, idx: number) => (
                                <Badge key={idx} variant="indigo" className="text-xs">{r}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {student.preferredLocations && student.preferredLocations.length > 0 && (
                          <div className="py-1">
                            <span className="text-slate-500 block text-xs mb-1">Preferred Locations</span>
                            <div className="flex flex-wrap gap-1.5">
                              {student.preferredLocations.map((loc: string, idx: number) => (
                                <Badge key={idx} variant="slate" className="text-xs">{loc}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resume Card if uploaded */}
                    {student.resume && (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{student.resume.fileName || 'Resume.pdf'}</p>
                            <p className="text-xs text-slate-500">
                              ATS Match Score: <span className="font-semibold text-emerald-600">{student.resume.atsScore || 85}%</span>
                            </p>
                          </div>
                        </div>
                        {student.resume.fileUrl && (
                          <a 
                            href={student.resume.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            View Resume <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={<GraduationCap className="w-10 h-10 text-slate-400" />}
                    title="No Detailed Student Record Linked"
                    description="This user has the STUDENT role but has not completed their college registration or enrollment record."
                    className="py-10"
                  />
                )}
              </div>
            )}

            {/* TAB CONTENT: Skills & Projects (For Students) */}
            {activeDetailTab === 'skills' && (
              <div className="space-y-4 pt-2">
                {student ? (
                  <>
                    {/* Skills list */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Technical & Professional Skills
                      </h4>
                      {student.skills && student.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 rounded-lg text-xs font-medium bg-brand-100/70 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No skills added yet.</p>
                      )}
                    </div>

                    {/* Projects */}
                    {student.projects && student.projects.length > 0 && (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-blue-500" />
                          Key Projects ({student.projects.length})
                        </h4>
                        <div className="space-y-3">
                          {student.projects.map((proj: any, idx: number) => (
                            <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{proj.title}</h5>
                                {proj.githubUrl && (
                                  <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
                                    GitHub <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{proj.description}</p>
                              {proj.technologies && (
                                <div className="flex flex-wrap gap-1">
                                  {proj.technologies.map((t: string, i: number) => (
                                    <Badge key={i} variant="slate" className="text-[10px]">{t}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {student.experience && student.experience.length > 0 && (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-purple-500" />
                          Work & Internships ({student.experience.length})
                        </h4>
                        <div className="space-y-2">
                          {student.experience.map((exp: any, idx: number) => (
                            <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                              <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                                <span>{exp.role} @ {exp.company}</span>
                                <span className="text-slate-500 font-normal">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {student.certifications && student.certifications.length > 0 && (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-500" />
                          Certifications ({student.certifications.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {student.certifications.map((cert: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{cert.name}</p>
                                <p className="text-slate-500">{cert.issuer} • {cert.issueDate}</p>
                              </div>
                              {cert.url && (
                                <a href={cert.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={<Code className="w-10 h-10 text-slate-400" />}
                    title="No Skills Profile"
                    description="No technical skills or projects are linked to this user."
                    className="py-10"
                  />
                )}
              </div>
            )}

            {/* TAB CONTENT: Applications (For Students) */}
            {activeDetailTab === 'applications' && (
              <div className="space-y-4 pt-2">
                {applications.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-3 px-4">Role & Company</th>
                          <th className="py-3 px-4">Applied Date</th>
                          <th className="py-3 px-4">Current Stage</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {applications.map((app: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {app.jobId?.title || 'Placement Job Opportunity'}
                              </p>
                              <p className="text-slate-500">{app.jobId?.companyName || app.companyId?.name || 'Company Partner'}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                              {app.currentStage || 'Application Submitted'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                app.status === 'selected' ? 'green' : 
                                app.status === 'shortlisted' ? 'indigo' : 
                                app.status === 'rejected' ? 'red' : 'slate'
                              }>
                                {app.status || 'Applied'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Briefcase className="w-10 h-10 text-slate-400" />}
                    title="No Applications Recorded"
                    description="This student has not submitted any campus placement drive applications yet."
                    className="py-10"
                  />
                )}
              </div>
            )}

            {/* TAB CONTENT: College / Campus (For College Admins & TPOs) */}
            {activeDetailTab === 'college' && (
              <div className="space-y-4 pt-2">
                {college ? (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      College & Campus Profile
                    </h4>
                    <div className="space-y-2 text-sm divide-y divide-slate-200/60 dark:divide-slate-700/60">
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Institution Name</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{college.name}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">College Code</span>
                        <span className="font-mono font-medium">{college.code || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Affiliation & Type</span>
                        <span className="font-medium">{college.affiliation || 'Autonomous'} • {college.type || 'Engineering'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Location</span>
                        <span className="font-medium">{college.city}, {college.state}</span>
                      </div>
                      {college.website && (
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Website</span>
                          <a href={college.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                            {college.website} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Building2 className="w-10 h-10 text-slate-400" />}
                    title="No College Record Assigned"
                    description="This admin is not directly assigned to an active campus tenant record."
                    className="py-10"
                  />
                )}
              </div>
            )}

            {/* TAB CONTENT: Recruiter / Company (For Recruiters) */}
            {activeDetailTab === 'recruiter' && (
              <div className="space-y-4 pt-2">
                {recruiter ? (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      Corporate Recruiter Profile
                    </h4>
                    <div className="space-y-2 text-sm divide-y divide-slate-200/60 dark:divide-slate-700/60">
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Company Name</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{recruiter.name}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Industry & Type</span>
                        <span className="font-medium">{recruiter.industry} ({recruiter.type})</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Headquarters</span>
                        <span className="font-medium">{recruiter.hq}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Briefcase className="w-10 h-10 text-slate-400" />}
                    title="No Company Record Assigned"
                    description="This recruiter does not have a formal corporate partner record attached."
                    className="py-10"
                  />
                )}
              </div>
            )}

            {/* TAB CONTENT: Access & Permissions */}
            {activeDetailTab === 'permissions' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-brand-500" />
                    Security Clearance & Role Authority
                  </h4>
                  <div className="space-y-2 text-xs">
                    {activeUser.role === 'SUPER_ADMIN' && (
                      <div className="space-y-2">
                        <p className="font-semibold text-brand-600 dark:text-brand-400">Root Super Administrator</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          <li>Unrestricted multi-tenant system control across all colleges and corporate partners</li>
                          <li>Platform-wide user management, role elevation, and security provisioning</li>
                          <li>System configuration, feature flag deployment, and billing governance</li>
                          <li>Access to immutable security audit logs and database diagnostics</li>
                        </ul>
                      </div>
                    )}
                    {activeUser.role === 'COLLEGE_ADMIN' && (
                      <div className="space-y-2">
                        <p className="font-semibold text-purple-600 dark:text-purple-400">College Campus Administrator</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          <li>Manage all students, branches, and placement officers within their campus tenant</li>
                          <li>Approve and coordinate campus placement drives and recruiter visits</li>
                          <li>Access institutional placement analytics, salary benchmarks, and compliance reports</li>
                        </ul>
                      </div>
                    )}
                    {activeUser.role === 'TPO' && (
                      <div className="space-y-2">
                        <p className="font-semibold text-amber-600 dark:text-amber-400">Training & Placement Officer</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          <li>Coordinate drive schedules, student shortlisting, and assessment rounds</li>
                          <li>Broadcast announcements and placement alerts to batches</li>
                          <li>Track candidate status from application through offer letter acceptance</li>
                        </ul>
                      </div>
                    )}
                    {activeUser.role === 'RECRUITER' && (
                      <div className="space-y-2">
                        <p className="font-semibold text-blue-600 dark:text-blue-400">Corporate Hiring Partner</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          <li>Post placement drive job requirements and compensation packages</li>
                          <li>Review AI candidate match scores and resume portfolios</li>
                          <li>Conduct technical and HR interviews, manage candidate pipeline</li>
                        </ul>
                      </div>
                    )}
                    {activeUser.role === 'STUDENT' && (
                      <div className="space-y-2">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">Student Candidate</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          <li>Profile creation, resume optimization, and AI ATS scoring</li>
                          <li>Apply to eligible campus placement drives and corporate openings</li>
                          <li>Participate in AI-proctored technical mock interviews and track applications</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit & Security Details */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-1.5">
                  <p><strong>Account ID:</strong> <span className="font-mono">{activeUser.id || activeUser._id}</span></p>
                  <p><strong>Auth Protocol:</strong> JSON Web Token (JWT) + Cryptographic bcrypt password hashing</p>
                  <p><strong>Last Activity:</strong> {activeUser.lastLogin ? new Date(activeUser.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmLabel="Delete User"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

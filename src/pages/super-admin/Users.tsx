import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../layouts';
import { Card, StatCard, Button, Input, Select, Badge, Avatar, ConfirmDialog, Skeleton, EmptyState } from '../../components/ui';
import { Users, Search, Filter, ShieldAlert, CheckCircle, Trash2, ShieldCheck, Briefcase, GraduationCap, Building2 } from 'lucide-react';
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

  // Actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleStatus(user.id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
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
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
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
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => handleToggleStatus(user)} className="cursor-pointer">
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
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedUser(user); setIsDeleteConfirmOpen(true); }}
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

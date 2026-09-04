import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Search, Filter, AlertOctagon, Key, Database, RefreshCw,
  FileText, Download, UserCheck, Lock, CheckCircle, Info, AlertTriangle, Eye, Clock
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { StatCard, Card, Badge, Button, Input, Select, Modal, Skeleton } from '../../components/ui';
import { superAdminAuditService } from '../../services';

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: { name: string; email: string; role: string; ip: string };
  action: string;
  category: 'Authentication' | 'Billing' | 'System Config' | 'Tenant' | 'User Management' | 'AI Model' | 'Security';
  severity: 'info' | 'warning' | 'critical' | 'security';
  target: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export const SuperAdminAuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportLoading, setExportLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        superAdminAuditService.getLogs({
          search,
          category: categoryFilter,
          severity: severityFilter,
          page,
          limit: 12,
        }),
        superAdminAuditService.getStats(),
      ]);

      setLogs(res.data as AuditLogItem[]);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, severityFilter, page]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await superAdminAuditService.exportLogs(exportFormat);
      showToast(`Exported ${res.count} audit logs in ${exportFormat.toUpperCase()} format!`);
      setIsExportModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  };

  const getSeverityBadge = (severity: AuditLogItem['severity']) => {
    switch (severity) {
      case 'info': return <Badge variant="blue">INFO</Badge>;
      case 'warning': return <Badge variant="amber">WARNING</Badge>;
      case 'critical': return <Badge variant="red" dot>CRITICAL</Badge>;
      case 'security': return <Badge variant="purple" dot>SECURITY</Badge>;
    }
  };

  const getCategoryBadge = (category: AuditLogItem['category']) => {
    switch (category) {
      case 'Security': return <Badge variant="purple">Security</Badge>;
      case 'Authentication': return <Badge variant="slate">Auth</Badge>;
      case 'Billing': return <Badge variant="green">Billing</Badge>;
      case 'System Config': return <Badge variant="indigo">System</Badge>;
      case 'Tenant': return <Badge variant="blue">Tenant</Badge>;
      case 'User Management': return <Badge variant="amber">User Mgmt</Badge>;
      case 'AI Model': return <Badge variant="ai">AI Model</Badge>;
      default: return <Badge variant="slate">{category}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="System Audit & Security Logs"
      subtitle="Immutable, real-time activity log of platform security events, administrative changes, and tenant mutations"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Audit Logs' }]}
      actions={
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={() => setIsExportModalOpen(true)}>
          Export Audit Trail
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard title="Total Recorded Events" value={stats.total} change="Full audit trail" changeType="neutral" icon={<ShieldCheck className="w-5 h-5" />} color="brand" />
            <StatCard title="Events Today" value={stats.todayCount} change="Active logging" changeType="increase" icon={<Clock className="w-5 h-5" />} color="green" />
            <StatCard title="Security Alerts" value={stats.securityCount} change="Brute force / IP blocks" changeType={stats.securityCount > 0 ? 'decrease' : 'neutral'} icon={<Lock className="w-5 h-5" />} color="purple" />
            <StatCard title="Auth Operations" value={stats.authCount} change="Logins, Tokens, Roles" changeType="neutral" icon={<UserCheck className="w-5 h-5" />} color="purple" />
          </>
        )}
      </div>

      {/* Filters & Data Table */}
      <Card padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 md:w-80">
            <Input
              placeholder="Search user, action, target, IP address..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Authentication', label: 'Authentication' },
                { value: 'Billing', label: 'Billing' },
                { value: 'System Config', label: 'System Config' },
                { value: 'Tenant', label: 'Tenant' },
                { value: 'User Management', label: 'User Management' },
                { value: 'AI Model', label: 'AI Model' },
                { value: 'Security', label: 'Security' },
              ]}
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-44"
            />

            <Select
              options={[
                { value: 'all', label: 'All Severities' },
                { value: 'info', label: 'INFO' },
                { value: 'warning', label: 'WARNING' },
                { value: 'critical', label: 'CRITICAL' },
                { value: 'security', label: 'SECURITY' },
              ]}
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              className="w-40"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-4">Actor / User</th>
                <th className="py-3.5 px-4">Event Action</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="p-4"><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No audit logs matching search filters.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{log.actor.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{log.actor.email} • IP: {log.ipAddress}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {log.target}
                    </td>

                    <td className="py-4 px-4">
                      {getCategoryBadge(log.category)}
                    </td>

                    <td className="py-4 px-4">
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Inspect Payload
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{logs.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> audit entries
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
      </Card>

      {/* MODAL 1: Inspect Audit Log Payload */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Inspection — ${selectedLog.action}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-slate-400">Timestamp</p>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedLog.timestamp}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-slate-400">Event ID</p>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedLog.id}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-slate-400">Actor Email & Role</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.actor.email} ({selectedLog.actor.role})</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-slate-400">IP Address</p>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedLog.ipAddress}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">User Agent String</p>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                {selectedLog.userAgent}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Event Metadata Payload (JSON Diff)</p>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Export Logs Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Audit Trail Data"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={exportLoading} onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
              Download Export File
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="File Export Format"
            options={[
              { value: 'json', label: 'Structured JSON (.json)' },
              { value: 'csv', label: 'Comma Separated Values (.csv)' },
            ]}
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
          />
        </div>
      </Modal>
    </PageWrapper>
  );
};

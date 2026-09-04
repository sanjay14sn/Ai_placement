import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Sparkles, Calendar, Clock, Award, ClipboardList,
  AlertCircle, ChevronRight, Search, Trash2, CheckCircle2, ArrowUpRight,
  Filter, ShieldAlert, Settings, ExternalLink
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, AIBadge, EmptyState, Skeleton } from '../../components/ui';
import { notificationService } from '../../services';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { Notification } from '../../types';

export const StudentNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'interview' | 'application' | 'ai'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll('student-1');
      setNotifications(data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    toast.success('Marked as read');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('Cleared all notifications');
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'interview') return n.type === 'interview';
    if (activeTab === 'application') return n.type === 'application' || n.type === 'selection';
    if (activeTab === 'ai') return n.type === 'ai';
    return true;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ai':
        return <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ai-500 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0"><Sparkles className="w-5 h-5" /></div>;
      case 'interview':
        return <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md flex-shrink-0"><Calendar className="w-5 h-5" /></div>;
      case 'selection':
        return <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md flex-shrink-0"><Award className="w-5 h-5" /></div>;
      case 'application':
        return <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-700 text-white flex items-center justify-center shadow-md flex-shrink-0"><ClipboardList className="w-5 h-5" /></div>;
      case 'reminder':
        return <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md flex-shrink-0"><Clock className="w-5 h-5" /></div>;
      default:
        return <div className="w-10 h-10 rounded-2xl bg-slate-600 text-white flex items-center justify-center shadow-md flex-shrink-0"><Bell className="w-5 h-5" /></div>;
    }
  };

  const getNotificationBadge = (type: Notification['type']) => {
    switch (type) {
      case 'ai': return <Badge variant="indigo">AI Insight</Badge>;
      case 'interview': return <Badge variant="blue">Interview</Badge>;
      case 'selection': return <Badge variant="green">Offer & Selection</Badge>;
      case 'application': return <Badge variant="purple">Application Status</Badge>;
      case 'reminder': return <Badge variant="amber">Deadline Reminder</Badge>;
      default: return <Badge variant="slate">Notification</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Notifications"
      subtitle="Stay updated with drive announcements, interview schedules, and AI application matches."
      breadcrumbs={[{ label: 'Student' }, { label: 'Notifications' }]}
      actions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="w-3.5 h-3.5 text-brand-600" />} onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleClearAll}>
            Clear
          </Button>
        </div>
      }
    >
      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-brand-50/50 to-brand-100/30 dark:from-brand-950/30 dark:to-brand-900/10">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{notifications.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Notifications</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{unreadCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unread Alerts</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-indigo-950/30 dark:to-indigo-900/10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {notifications.filter(n => n.type === 'ai').length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Matches</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {notifications.filter(n => n.type === 'selection').length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Offer Alerts</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'interview', label: 'Interviews 🎯' },
              { id: 'application', label: 'Applications 📋' },
              { id: 'ai', label: 'AI Matches 🤖' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Notifications List Feed */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-24"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-slate-400" />}
          title="No notifications found"
          description={search ? `No alerts match "${search}"` : "You're all caught up! No unread notifications under this view."}
        />
      ) : (
        <div className="space-y-3 mb-8">
          {filteredNotifications.map(item => (
            <Card
              key={item.id}
              className={`p-4 transition-all border ${
                !item.isRead
                  ? 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-start gap-4">
                {getNotificationIcon(item.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      {getNotificationBadge(item.type)}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" title="Unread Alert" />
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                    {item.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold p-0 hover:bg-transparent hover:underline"
                        onClick={() => {
                          if (!item.isRead) handleMarkAsRead(item.id);
                          navigate(item.link!);
                        }}
                        rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      >
                        View Details
                      </Button>
                    )}

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium ml-auto flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Settings Shortcut Banner */}
      <Card className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Customize Notification Alerts</h4>
            <p className="text-xs text-slate-400">Configure email digests, SMS reminders, and AI job match notifications.</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs"
          onClick={() => navigate('/student/settings')}
        >
          Manage Settings
        </Button>
      </Card>
    </PageWrapper>
  );
};

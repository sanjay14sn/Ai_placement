import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, CheckCheck, CheckCircle2, ClipboardList, Clock, Megaphone, Search, Award,
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Badge, Button, Card, EmptyState, Input, Skeleton } from '../../components/ui';
import { getNoticeFeed, notificationService, rememberNoticeRead } from '../../services';
import { useAuthStore, useNotificationStore } from '../../store';
import { formatDate } from '../../utils';
import { toast } from 'sonner';
import type { Notification } from '../../types';

type NoticeTab = 'all' | 'unread' | 'application' | 'interview' | 'reminder' | 'system';

export const CollegeNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<NoticeTab>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNoticeFeed(user?.role);
      setNotifications(data);
      setUnreadCount(data.filter((item) => !item.isRead).length);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.role]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markRead = async (ids: string[]) => {
    const stored = ids.filter((id) => !id.includes(':'));
    setNotifications((prev) => prev.map((item) => ids.includes(item.id) ? { ...item, isRead: true } : item));
    rememberNoticeRead(ids);
    if (stored.length === 1) await notificationService.markRead(stored[0]).catch(() => undefined);
    if (stored.length > 1) await notificationService.markAllRead().catch(() => undefined);
    setUnreadCount(Math.max(0, unreadCount - ids.filter((id) => notifications.find((item) => item.id === id && !item.isRead)).length));
  };

  const filtered = notifications.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || item.title.toLowerCase().includes(query) || item.message.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (activeTab === 'unread') return !item.isRead;
    if (activeTab === 'all') return true;
    return item.type === activeTab || (activeTab === 'application' && item.type === 'selection');
  });

  const iconFor = (type: Notification['type']) => {
    if (type === 'interview') return <Calendar className="w-5 h-5" />;
    if (type === 'selection') return <Award className="w-5 h-5" />;
    if (type === 'reminder') return <Clock className="w-5 h-5" />;
    if (type === 'system') return <Megaphone className="w-5 h-5" />;
    return <ClipboardList className="w-5 h-5" />;
  };

  const labelFor = (type: Notification['type']) => {
    if (type === 'interview') return 'Interview';
    if (type === 'selection') return 'Selection';
    if (type === 'reminder') return 'Drive';
    if (type === 'system') return 'Announcement';
    if (type === 'application') return 'Application';
    return 'Update';
  };

  return (
    <PageWrapper
      title="Notifications"
      subtitle="Applications, interviews, drives, and campus announcements"
      breadcrumbs={[{ label: 'College' }, { label: 'Notifications' }]}
      actions={unreadCount > 0 ? (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          onClick={() => markRead(notifications.filter((item) => !item.isRead).map((item) => item.id))}
        >
          Mark all read
        </Button>
      ) : undefined}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'All', value: notifications.length, icon: <Bell className="w-4 h-4" /> },
          { label: 'Unread', value: unreadCount, icon: <Clock className="w-4 h-4" /> },
          { label: 'Applications', value: notifications.filter((item) => item.type === 'application' || item.type === 'selection').length, icon: <ClipboardList className="w-4 h-4" /> },
          { label: 'Interviews', value: notifications.filter((item) => item.type === 'interview').length, icon: <Calendar className="w-4 h-4" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300 flex items-center justify-center">{stat.icon}</div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-1 overflow-x-auto">
            {([
              ['all', 'All'],
              ['unread', 'Unread'],
              ['application', 'Applications'],
              ['interview', 'Interviews'],
              ['reminder', 'Drives'],
              ['system', 'Announcements'],
            ] as [NoticeTab, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto w-full sm:w-64">
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-24"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-slate-400" />}
          title="No notifications"
          description={search ? `Nothing matches "${search}"` : 'New applications, interviews, and drive updates will show up here.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className={`p-4 ${item.isRead ? '' : 'border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  {iconFor(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    <Badge variant="blue">{labelFor(item.type)}</Badge>
                    {!item.isRead && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    <span className="ml-auto text-[11px] text-slate-400">{item.createdAt ? formatDate(item.createdAt) : ''}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.message}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {item.link && item.link !== '/college/notifications' && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-brand-600"
                        onClick={() => {
                          if (!item.isRead) markRead([item.id]);
                          navigate(item.link!);
                        }}
                      >
                        Open
                      </button>
                    )}
                    {!item.isRead && (
                      <button
                        type="button"
                        className="text-xs text-slate-500 inline-flex items-center gap-1 ml-auto"
                        onClick={() => markRead([item.id])}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Briefcase, GraduationCap, BookOpen,
  BarChart3, Settings, Bell, Bot, Calendar, FileText, FileCheck, Search, Sun, Moon,
  ChevronLeft, ChevronRight, LogOut, User, Command, CreditCard, Menu, X,
  Activity, Layers, AlertCircle, UserCheck, TrendingUp, Zap, Target,
  ClipboardList, MessageSquare, Award, BookMarked, Lightbulb,
  Building, ListChecks, Network, Video, Newspaper, Sparkles
} from 'lucide-react';
import { useAuthStore, useUIStore, useNotificationStore } from '../../store';
import { Avatar, Badge } from '../ui';
import { cn } from '../../utils';
import type { Role } from '../../types';

// ─── Nav Item Types ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  badge?: number | string;
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// ─── Role Nav Config ──────────────────────────────────────────────────────────

const getSidebarNav = (role: Role): NavSection[] => {
  switch (role) {
    case 'SUPER_ADMIN':
      return [
        {
          items: [
            { label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, to: '/super-admin/overview', end: true },
          ]
        },
        {
          title: 'Management',
          items: [
            { label: 'Newsroom', icon: <Newspaper className="w-4 h-4" />, to: '/super-admin/newsroom' },
            { label: 'CampusConnect', icon: <MessageSquare className="w-4 h-4" />, to: '/super-admin/campus-connect', badge: 'Feed' },
            { label: 'Video Programs', icon: <Video className="w-4 h-4" />, to: '/super-admin/programs' },
            { label: 'Colleges', icon: <Building2 className="w-4 h-4" />, to: '/super-admin/colleges' },
            { label: 'Companies', icon: <Building className="w-4 h-4" />, to: '/super-admin/companies' },
            { label: 'Users', icon: <Users className="w-4 h-4" />, to: '/super-admin/users' },
          ]
        },
        {
          title: 'Billing',
          items: [
            { label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" />, to: '/super-admin/subscriptions', badge: 'Soon' },
            { label: 'Plans', icon: <Layers className="w-4 h-4" />, to: '/super-admin/plans', badge: 'Soon' },
            { label: 'Usage', icon: <Activity className="w-4 h-4" />, to: '/super-admin/usage' },
          ]
        },
        {
          title: 'Insights',
          items: [
            { label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, to: '/super-admin/analytics' },
            { label: 'Settings', icon: <Settings className="w-4 h-4" />, to: '/super-admin/settings' },
          ]
        },
      ];

    case 'COLLEGE_ADMIN':
    case 'TPO':
      return [
        {
          items: [
            { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/college/dashboard', end: true },
          ]
        },
        {
          title: 'Students',
          items: [
            { label: 'Students', icon: <GraduationCap className="w-4 h-4" />, to: '/college/students' },
            { label: 'Departments', icon: <BookOpen className="w-4 h-4" />, to: '/college/departments' },
          ]
        },
        {
          title: 'Placements',
          items: [
            { label: 'Companies', icon: <Building2 className="w-4 h-4" />, to: '/college/companies' },
            { label: 'Drives', icon: <Target className="w-4 h-4" />, to: '/college/drives' },
            { label: 'Applications', icon: <ClipboardList className="w-4 h-4" />, to: '/college/applications' },
            { label: 'Interviews', icon: <UserCheck className="w-4 h-4" />, to: '/college/interviews' },
            { label: 'Calendar', icon: <Calendar className="w-4 h-4" />, to: '/college/calendar' },
            { label: 'Events', icon: <Calendar className="w-4 h-4" />, to: '/college/events' },
          ]
        },
        {
          title: 'Intelligence',
          items: [
            { label: 'Video Programs', icon: <Video className="w-4 h-4" />, to: '/college/programs' },
            { label: 'Reports', icon: <FileText className="w-4 h-4" />, to: '/college/reports' },
          ]
        },
        {
          items: [
            { label: 'Notifications', icon: <Bell className="w-4 h-4" />, to: '/college/notifications' },
            { label: 'Settings', icon: <Settings className="w-4 h-4" />, to: '/college/settings' },
          ]
        },
      ];

    case 'STUDENT':
      return [
        {
          items: [
            { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/student/dashboard', end: true },
            { label: 'Newsroom', icon: <Newspaper className="w-4 h-4" />, to: '/student/newsroom', badge: 'Live' },
          ]
        },
        {
          title: 'CampusConnect',
          items: [
            { label: 'Community / Feed', icon: <Activity className="w-4 h-4" />, to: '/student/community' },
            { label: 'Explore Students', icon: <Search className="w-4 h-4" />, to: '/student/explore-students' },
            { label: 'Connections', icon: <UserCheck className="w-4 h-4" />, to: '/student/connections' },
            { label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, to: '/student/messages' },
            { label: 'Communities', icon: <Users className="w-4 h-4" />, to: '/student/communities' },
            { label: 'Events', icon: <Calendar className="w-4 h-4" />, to: '/student/events' },
          ]
        },
        {
          title: 'My Profile',
          items: [
            { label: 'Profile', icon: <User className="w-4 h-4" />, to: '/student/profile' },
            { label: 'Resume', icon: <FileText className="w-4 h-4" />, to: '/student/resume' },
          ]
        },
        {
          title: 'Placements',
          items: [
            { label: 'Campus Drives', icon: <Target className="w-4 h-4" />, to: '/student/drives' },
            { label: 'Applications', icon: <ClipboardList className="w-4 h-4" />, to: '/student/applications' },
            { label: 'Interviews', icon: <UserCheck className="w-4 h-4" />, to: '/student/interviews' },
            { label: 'Calendar', icon: <Calendar className="w-4 h-4" />, to: '/student/calendar' },
          ]
        },
        {
          title: 'AI Career Tools',
          items: [
            { label: 'Video Programs', icon: <Video className="w-4 h-4" />, to: '/student/programs' },
            { label: 'ATS Score Checker', icon: <FileCheck className="w-4 h-4" />, to: '/student/ats-checker' },
            { label: 'Interview Prep', icon: <BookMarked className="w-4 h-4" />, to: '/student/interview-prep' },
            { label: 'AI Assistant', icon: <Bot className="w-4 h-4" />, to: '/student/ai-assistant' },
          ]
        },
        {
          items: [
            { label: 'Notifications', icon: <Bell className="w-4 h-4" />, to: '/student/notifications' },
          ]
        },
      ];

    case 'RECRUITER':
      return [
        {
          items: [
            { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/recruiter/dashboard', end: true },
          ]
        },
        {
          title: 'Company',
          items: [
            { label: 'Company Profile', icon: <Building2 className="w-4 h-4" />, to: '/recruiter/company' },
            { label: 'Jobs', icon: <Briefcase className="w-4 h-4" />, to: '/recruiter/jobs' },
          ]
        },
        {
          title: 'Talent',
          items: [
            { label: 'Candidates', icon: <Users className="w-4 h-4" />, to: '/recruiter/candidates' },
            { label: 'Shortlists', icon: <ListChecks className="w-4 h-4" />, to: '/recruiter/shortlists' },
            { label: 'Drives', icon: <Target className="w-4 h-4" />, to: '/recruiter/drives' },
            { label: 'Interviews', icon: <UserCheck className="w-4 h-4" />, to: '/recruiter/interviews' },
            { label: 'Calendar', icon: <Calendar className="w-4 h-4" />, to: '/recruiter/calendar' },
          ]
        },
        {
          title: 'Intelligence',
          items: [
            { label: 'Video Programs', icon: <Video className="w-4 h-4" />, to: '/recruiter/programs' },
            { label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, to: '/recruiter/analytics' },
            { label: 'AI Recruiter', icon: <Bot className="w-4 h-4" />, to: '/recruiter/ai-assistant' },
          ]
        },
        {
          items: [
            { label: 'Settings', icon: <Settings className="w-4 h-4" />, to: '/recruiter/settings' },
          ]
        },
      ];

    default:
      return [];
  }
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageUnread, setMessageUnread] = useState(0);
  const [pendingInvites, setPendingInvites] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    if (!user?.tenantId || user.collegeCode) return;
    if (user.role !== 'TPO' && user.role !== 'COLLEGE_ADMIN') return;
    let cancelled = false;
    import('../../services').then(({ collegeService }) => collegeService.getById(user.tenantId!))
      .then((college) => {
        if (!cancelled) updateUser({ collegeCode: college.code, collegeName: college.name });
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [user?.tenantId, user?.collegeCode, user?.role, updateUser]);

  useEffect(() => {
    if (!user || (user.role !== 'STUDENT' && user.role !== 'TPO' && user.role !== 'COLLEGE_ADMIN')) return;
    let cancelled = false;
    const loadNotices = () => {
      import('../../services').then(({ getNoticeFeed }) => getNoticeFeed(user.role))
        .then((items) => {
          if (!cancelled) useNotificationStore.getState().setUnreadCount(items.filter((item) => !item.isRead).length);
        })
        .catch(() => undefined);
    };
    loadNotices();
    window.addEventListener('notifications-updated', loadNotices);
    return () => {
      cancelled = true;
      window.removeEventListener('notifications-updated', loadNotices);
    };
  }, [user?.role, location.pathname]);

  useEffect(() => {
    if (user?.role !== 'STUDENT') return;
    let cancelled = false;
    const load = () => {
      import('../../services').then(({ communityService }) => communityService.getUnreadCount())
        .then((count) => { if (!cancelled) setMessageUnread(count); })
        .catch(() => undefined);
    };
    load();
    window.addEventListener('messages-unread', load);
    return () => {
      cancelled = true;
      window.removeEventListener('messages-unread', load);
    };
  }, [user?.role, location.pathname]);

  useEffect(() => {
    if (user?.role !== 'STUDENT' || !user.id) return;
    let cancelled = false;
    const load = () => {
      import('../../services').then(({ communityService }) => communityService.getConnections())
        .then((rows) => {
          if (cancelled) return;
          const asId = (value: { _id?: string; id?: string } | string | null | undefined) =>
            String((value && typeof value === 'object' ? value._id || value.id : value) || '');
          const me = String(user.id);
          const count = (rows || []).filter((row: { status?: string; requester?: { _id?: string; id?: string } | string; recipient?: { _id?: string; id?: string } | string }) =>
            row.status === 'pending' && (asId(row.recipient) === me || asId(row.requester) === me)
          ).length;
          setPendingInvites(count);
        })
        .catch(() => undefined);
    };
    load();
    window.addEventListener('connections-updated', load);
    return () => {
      cancelled = true;
      window.removeEventListener('connections-updated', load);
    };
  }, [user?.role, user?.id, location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      document.body.style.overflow = mobileNavOpen && !mq.matches ? 'hidden' : '';
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  if (!user) return null;

  const navSections = getSidebarNav(user.role);
  const collapsed = isDesktop && sidebarCollapsed;

  const getRoleBadge = (role: Role) => {
    const map: Record<Role, { label: string; color: 'blue' | 'green' | 'purple' | 'amber' | 'indigo' }> = {
      SUPER_ADMIN: { label: 'Super Admin', color: 'purple' },
      COLLEGE_ADMIN: { label: 'College Admin', color: 'indigo' },
      TPO: { label: 'TPO', color: 'blue' },
      RECRUITER: { label: 'Recruiter', color: 'amber' },
      STUDENT: { label: 'Student', color: 'green' },
    };
    return map[role];
  };

  const roleBadge = getRoleBadge(user.role);

  const getPortalBranding = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN': return { name: 'AI Campus OS', sub: 'Admin Console' };
      case 'COLLEGE_ADMIN':
      case 'TPO': return { name: 'AI Campus OS', sub: user.collegeCode ? `College code ${user.collegeCode}` : 'TPO Dashboard' };
      case 'STUDENT': return { name: 'AI Campus OS', sub: 'Student Portal' };
      case 'RECRUITER': return { name: 'AI Campus OS', sub: 'Recruiter Portal' };
    }
  };

  const branding = getPortalBranding(user.role);

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 z-40 flex w-[min(86vw,280px)] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:transition-all',
      mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0',
      collapsed ? 'lg:w-16' : 'lg:w-[260px]'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-ai-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50 leading-none truncate">{branding.name}</p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">{branding.sub}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 hide-scrollbar">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && !collapsed && (
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5 mb-0.5">
                {section.title}
              </p>
            )}
            {section.title && collapsed && <div className="border-t border-slate-100 dark:border-slate-800 mx-2 mb-2 mt-2" />}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                  collapsed ? 'justify-center px-0 mx-auto w-10 h-10' : '',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <span className="relative flex-shrink-0">
                  {item.icon}
                  {collapsed && item.to === '/student/messages' && messageUnread > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold tabular-nums text-white ring-2 ring-white dark:ring-slate-900">
                      {messageUnread > 9 ? '9+' : messageUnread}
                    </span>
                  )}
                  {collapsed && item.to === '/student/connections' && pendingInvites > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold tabular-nums text-white ring-2 ring-white dark:ring-slate-900">
                      {pendingInvites > 9 ? '9+' : pendingInvites}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm shadow-rose-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {item.to === '/student/messages' && messageUnread > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm shadow-rose-500/30">
                        {messageUnread > 9 ? '9+' : messageUnread}
                      </span>
                    )}
                    {item.to === '/student/connections' && pendingInvites > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm shadow-amber-500/30">
                        {pendingInvites > 9 ? '9+' : pendingInvites}
                      </span>
                    )}
                    {typeof item.badge === 'number' && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm shadow-brand-600/30">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                    {typeof item.badge === 'string' && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className={cn('border-t border-slate-100 dark:border-slate-800 p-2 flex-shrink-0')}>
        <div className={cn('flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer', collapsed && 'justify-center px-0')}>
          <Avatar name={user.name} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <Badge variant={roleBadge.color} className="text-[9px] mt-0.5">{roleBadge.label}</Badge>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────

interface TopbarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, breadcrumbs, actions }) => {
  const { theme, toggleTheme, sidebarCollapsed, openCommandPalette, setMobileNavOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={cn(
      'fixed top-0 right-0 left-0 h-14 sm:h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-30 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 transition-all duration-300',
      sidebarCollapsed ? 'lg:left-16' : 'lg:left-[260px]'
    )}>
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="lg:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      {/* Left: Title / Breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-0.5 min-w-0 overflow-hidden">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {crumb.to ? (
                  <button onClick={() => navigate(crumb.to!)} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {title && (
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{title}</h1>
            {subtitle && <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">— {subtitle}</span>}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0 max-w-[58%] sm:max-w-none overflow-x-auto hide-scrollbar">
        {actions}

        {/* Search/Command */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Search...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => {
            const role = user?.role;
            if (role === 'STUDENT') navigate('/student/notifications');
            else if (role === 'COLLEGE_ADMIN' || role === 'TPO') navigate('/college/notifications');
            else navigate('/recruiter/settings');
          }}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold tabular-nums text-white ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Avatar name={user?.name || 'U'} size="sm" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:block max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-modal z-50 py-1 animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
                  {user?.collegeCode && (
                    <p className="text-xs font-bold text-[#08546c] dark:text-cyan-400 mt-1">College code {user.collegeCode}</p>
                  )}
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── Command Palette ──────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
  category: string;
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) closeCommandPalette();
        else useUIStore.getState().openCommandPalette();
      }
      if (e.key === 'Escape') closeCommandPalette();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [commandPaletteOpen, closeCommandPalette]);

  const baseItems: CommandItem[] = [
    { id: '1', label: 'Student List', icon: <GraduationCap className="w-4 h-4" />, to: '/college/students', category: 'Navigation' },
    { id: '2', label: 'Job Listings', icon: <Briefcase className="w-4 h-4" />, to: '/college/jobs', category: 'Navigation' },
    { id: '3', label: 'Placement Drives', icon: <Target className="w-4 h-4" />, to: '/college/drives', category: 'Navigation' },
    { id: '6', label: 'Reports', icon: <FileText className="w-4 h-4" />, to: '/college/reports', category: 'Navigation' },
    { id: '7', label: 'Companies', icon: <Building2 className="w-4 h-4" />, to: '/college/companies', category: 'Navigation' },
    { id: '8', label: 'Interviews', icon: <UserCheck className="w-4 h-4" />, to: '/college/interviews', category: 'Navigation' },
    { id: '9', label: 'Settings', icon: <Settings className="w-4 h-4" />, to: '/college/settings', category: 'Settings' },
    { id: '10', label: 'Notifications', icon: <Bell className="w-4 h-4" />, to: '/college/notifications', category: 'Navigation' },
  ];

  const filtered = query
    ? baseItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : baseItems;

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeCommandPalette} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-modal w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-slide-up">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="flex-1 text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none placeholder-slate-400"
          />
          <kbd className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">ESC</kbd>
        </div>
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5">{category}</p>
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.to); closeCommandPalette(); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
                >
                  <span className="text-slate-400">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
};

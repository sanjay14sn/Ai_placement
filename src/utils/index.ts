import type { Role, Program, ProgramVideo, VideoResource } from '../types';

// ─── Permission Matrix ─────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Student Management
  'students.view': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO'],
  'students.create': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO'],
  'students.edit': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO'],
  'students.delete': ['SUPER_ADMIN', 'COLLEGE_ADMIN'],
  'students.export': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO'],

  // Job Management
  'jobs.view': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER', 'STUDENT'],
  'jobs.create': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'jobs.edit': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'jobs.delete': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'RECRUITER'],
  'jobs.apply': ['STUDENT'],

  // Company Management
  'companies.view': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'companies.create': ['SUPER_ADMIN', 'COLLEGE_ADMIN'],
  'companies.edit': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'RECRUITER'],

  // Applications
  'applications.view.all': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'applications.view.own': ['STUDENT'],
  'applications.shortlist': ['COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'applications.reject': ['COLLEGE_ADMIN', 'TPO', 'RECRUITER'],

  // Interviews
  'interviews.schedule': ['COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'interviews.view.all': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'interviews.view.own': ['STUDENT'],

  // Drives
  'drives.create': ['COLLEGE_ADMIN', 'TPO'],
  'drives.view': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
  'drives.register': ['STUDENT'],

  // Analytics
  'analytics.platform': ['SUPER_ADMIN'],
  'analytics.college': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO'],
  'analytics.recruiter': ['RECRUITER'],

  // Admin
  'admin.colleges': ['SUPER_ADMIN'],
  'admin.subscriptions': ['SUPER_ADMIN'],
  'admin.users': ['SUPER_ADMIN', 'COLLEGE_ADMIN'],
  'admin.settings': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],

  // AI
  'ai.assistant': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER', 'STUDENT'],
  'ai.placement_officer': ['COLLEGE_ADMIN', 'TPO'],
  'ai.match': ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const hasPermission = (role: Role | null | undefined, permission: Permission): boolean => {
  if (!role) return false;
  const allowed = PERMISSIONS[permission] as readonly string[];
  return allowed.includes(role);
};

export const hasRole = (userRole: Role | null | undefined, ...roles: Role[]): boolean => {
  if (!userRole) return false;
  return roles.includes(userRole);
};

// ─── Route Role Guards ────────────────────────────────────────────────────────

export const ROUTE_ROLE_MAP: Record<string, Role[]> = {
  '/super-admin': ['SUPER_ADMIN'],
  '/college': ['COLLEGE_ADMIN', 'TPO'],
  '/student': ['STUDENT'],
  '/recruiter': ['RECRUITER'],
};

export const getDefaultRoute = (role: Role): string => {
  switch (role) {
    case 'SUPER_ADMIN': return '/super-admin/overview';
    case 'COLLEGE_ADMIN':
    case 'TPO': return '/college/dashboard';
    case 'STUDENT': return '/student/dashboard';
    case 'RECRUITER': return '/recruiter/dashboard';
    default: return '/login';
  }
};

// ─── Utility Functions ────────────────────────────────────────────────────────

export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatCurrency = (amount: number, suffix = 'LPA'): string => {
  if (amount >= 100) return `₹${(amount / 100).toFixed(1)}Cr ${suffix}`;
  if (amount >= 1) return `₹${amount.toFixed(1)} ${suffix}`;
  return `₹${(amount * 100).toFixed(0)}K ${suffix}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Local calendar day as YYYY-MM-DD, so both calendars land an event on the same date. */
export const toDateKey = (value: string | Date): string => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const timeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    // Application statuses
    applied: 'badge-blue',
    under_review: 'badge-amber',
    shortlisted: 'badge-indigo',
    assessment: 'badge-purple',
    technical: 'badge-purple',
    hr: 'badge-purple',
    selected: 'badge-green',
    rejected: 'badge-red',
    withdrawn: 'badge-slate',

    // Interview statuses
    scheduled: 'badge-blue',
    confirmed: 'badge-indigo',
    attended: 'badge-green',
    no_show: 'badge-red',
    completed: 'badge-green',
    cancelled: 'badge-slate',

    // Job statuses
    active: 'badge-green',
    draft: 'badge-slate',
    paused: 'badge-amber',
    closed: 'badge-red',
    expired: 'badge-red',

    // Drive statuses
    upcoming: 'badge-blue',
    ongoing: 'badge-green',

    // Placement statuses
    placed: 'badge-green',
    not_placed: 'badge-amber',
    not_eligible: 'badge-red',
    opted_out: 'badge-slate',

    // Subscription
    trial: 'badge-amber',
    subscription_expired: 'badge-red',

    // General
    active_general: 'badge-green',
  };
  return map[status] || 'badge-slate';
};

export const getMatchScoreColor = (score: number): string => {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-brand-600 dark:text-brand-400';
  if (score >= 55) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

export const getMatchScoreRingColor = (score: number): string => {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#4f46e5';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const normalizeVideo = (vid: any, index: number = 0): ProgramVideo => {
  const doc = vid?._doc || {};
  return {
    id: String(vid?.id || vid?._id || doc.id || doc._id || `vid-${index + 1}`),
    order: Number(vid?.order ?? doc.order ?? (index + 1)),
    title: String(vid?.title || doc.title || `Module ${index + 1}`),
    description: String(vid?.description || doc.description || ''),
    duration: String(vid?.duration || doc.duration || '30:00'),
    videoUrl: String(vid?.videoUrl || doc.videoUrl || ''),
    thumbnail: vid?.thumbnail || doc.thumbnail,
    isCompleted: Boolean(vid?.isCompleted ?? doc.isCompleted ?? false),
    resources: Array.isArray(vid?.resources || doc.resources)
      ? (vid?.resources || doc.resources).map((res: any, rIdx: number): VideoResource => {
          const rDoc = res?._doc || {};
          return {
            id: String(res?.id || res?._id || rDoc.id || rDoc._id || `res-${rIdx + 1}`),
            title: String(res?.title || rDoc.title || 'Handout Resource'),
            type: (res?.type || rDoc.type || 'link'),
            url: String(res?.url || rDoc.url || '#'),
            size: res?.size || rDoc.size,
          };
        })
      : [],
  };
};

export const normalizeProgram = (prog: any): Program => {
  if (!prog) return prog;
  const doc = prog?._doc || {};
  const base = { ...doc, ...prog };
  const rawVideos = base.videos || [];
  const normalizedVideos: ProgramVideo[] = Array.isArray(rawVideos)
    ? rawVideos.map((v: any, idx: number) => normalizeVideo(v, idx))
    : [];

  return {
    ...base,
    id: String(base.id || base._id || ''),
    videos: normalizedVideos,
    videosCount: normalizedVideos.length || base.videosCount || 0,
  };
};

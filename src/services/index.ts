// ─────────────────────────────────────────────────────────────────────────────
// AI Campus OS — API Client
// Connects to real backend API at /api/* with JWT auth
// Falls back gracefully if backend is unavailable
// ─────────────────────────────────────────────────────────────────────────────
import { mockPlatformStats, mockPlatformCharts } from '../mock/data';
import { API_BASE, BACKEND_BASE, getMediaUrl } from '../config/api';
import { normalizeProgram } from '../utils';

export { API_BASE, BACKEND_BASE, getMediaUrl };

// ─── Token Storage ────────────────────────────────────────────────────────────

const getToken = (): string | null => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

// ─── Core Fetch Helper ────────────────────────────────────────────────────────

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
};

const api = async <T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, auth = true, params } = options;

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error ${response.status}`);
  }

  return data;
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api<{ data: { user: unknown; token: string } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    return res.data as { user: import('../types').User; token: string };
  },

  register: async (data: { name: string; email: string; password: string; role: import('../types').Role }) => {
    const endpoint = data.role === 'COLLEGE_ADMIN'
      ? '/auth/register/college'
      : '/auth/register/student';
    const res = await api<{ data: unknown }>( endpoint, { method: 'POST', body: data, auth: false });
    return res.data as { user: import('../types').User; token: string };
  },

  registerStudent: async (data: Record<string, unknown>) => {
    const res = await api<{ data: unknown; message: string }>('/auth/register/student', {
      method: 'POST', body: data, auth: false,
    });
    return res;
  },

  registerCollege: async (data: Record<string, unknown>) => {
    const res = await api<{ data: unknown; message: string }>('/auth/register/college', {
      method: 'POST', body: data, auth: false,
    });
    return res;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await api<{ data: { user: unknown; token: string }; message: string }>('/auth/verify-otp', {
      method: 'POST', body: { email, otp }, auth: false,
    });
    return res.data as { user: import('../types').User; token: string };
  },

  resendOtp: async (email: string) => {
    return api('/auth/resend-otp', { method: 'POST', body: { email }, auth: false });
  },

  forgotPassword: async (email: string) => {
    return api('/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
  },

  forgotPasswordOtp: async (email: string) => {
    return api<{ success: boolean; message: string }>('/auth/forgot-password-otp', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  },

  resetPassword: async (token: string, password: string) => {
    return api('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false });
  },

  resetPasswordOtp: async (data: { email: string; otp: string; password: string }) => {
    return api<{ success: boolean; message: string }>('/auth/reset-password-otp', {
      method: 'POST',
      body: data,
      auth: false,
    });
  },

  getMe: async () => {
    const res = await api<{ data: unknown }>('/auth/me');
    return res.data as import('../types').User;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
  },
};

export const authApi = authService;

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  getAll: async (params?: import('../types').FilterParams & { role?: string, status?: string }) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').User> & { stats?: any } }>('/users', {
      params: params as Record<string, string>,
      auth: true,
    });
    return res; // returns { data, stats, success }
  },

  getById: async (id: string) => {
    const res = await api<{
      success: boolean;
      data: {
        user: import('../types').User & { [key: string]: any };
        student?: import('../types').Student | null;
        college?: any;
        recruiter?: any;
        applications?: any[];
      };
    }>(`/users/${id}`, {
      auth: true,
    });
    return res;
  },

  toggleStatus: async (id: string) => {
    const res = await api<{ data: import('../types').User }>(`/users/${id}/toggle-status`, {
      method: 'PATCH',
      auth: true,
    });
    return res.data;
  },

  delete: async (id: string) => {
    return api(`/users/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

// ─── Student Service ──────────────────────────────────────────────────────────

export const studentService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Student> }>('/students', {
      params: params as Record<string, string>,
      auth: true,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Student }>(`/students/${id}`, { auth: true });
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api<{ data: import('../types').Student }>('/students/me', { auth: true });
    return res.data;
  },

  getDashboardData: async () => {
    const res = await api<{ data: any }>('/students/me/dashboard', { auth: true });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').Student>) => {
    const res = await api<{ data: import('../types').Student }>(`/students/${id}`, {
      method: 'PUT', body: updates, auth: true,
    });
    return res.data;
  },

  create: async (data: Partial<import('../types').Student>) => {
    const res = await api<{ data: import('../types').Student }>('/students', {
      method: 'POST', body: data, auth: true,
    });
    return res.data;
  },

  register: async (data: Record<string, unknown>) => {
    return api<{
      data: import('../types').Student & { userId: string };
      token: string;
      user: import('../types').User;
    }>('/students/register', {
      method: 'POST', body: data, auth: false,
    });
  },

  delete: async (id: string) => {
    return api(`/students/${id}`, { method: 'DELETE', auth: true });
  },

  importBulk: async (_file: File): Promise<{ success: number; errors: number }> => {
    // File upload — use FormData
    const formData = new FormData();
    formData.append('file', _file);
    const token = getToken();
    const response = await fetch(`${API_BASE}/students/bulk-import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    return data.data || { success: 0, errors: 0 };
  },

  getStats: async (collegeId?: string) => {
    const res = await api<{ data: unknown }>('/students/stats', {
      params: collegeId ? { collegeId } : {},
      auth: false,
    });
    return res.data as { total: number; eligible: number; placed: number; withResume: number; avgCgpa: number; profileComplete: number };
  },
};

// ─── Job Service ──────────────────────────────────────────────────────────────

export const jobService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Job> }>('/jobs', { params: params as Record<string, string>, auth: true });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Job }>(`/jobs/${id}`, { auth: false });
    return res.data;
  },

  create: async (data: Partial<import('../types').Job>) => {
    const res = await api<{ data: import('../types').Job }>('/jobs', { method: 'POST', body: data, auth: true });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').Job>) => {
    const res = await api<{ data: import('../types').Job }>(`/jobs/${id}`, { method: 'PUT', body: updates, auth: false });
    return res.data;
  },

  getRecommendedForStudent: async () => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Job> }>('/jobs', { params: { status: 'active', limit: '10' }, auth: true });
    return (res.data.data || []).map(j => ({ ...j, matchScore: 70 + Math.floor(Math.random() * 25) }));
  },

  searchGoogleJobs: async (source: File | { resumeId: string }) => {
    const form = new FormData();
    if (source instanceof File) form.append('resume', source, source.name);
    else form.append('resumeId', source.resumeId);
    const token = getToken();
    const response = await fetch(`${API_BASE}/jobs/google`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load Google jobs');
    return {
      jobs: (data.data || []) as {
        id: string;
        title: string;
        companyName: string;
        location: string;
        via: string;
        description: string;
        schedule: string;
        postedAt: string;
        applyLink: string;
        ratings: { source: string; rating: number | null; reviews: number | null; link: string }[];
      }[],
      query: String(data.query || ''),
      resume: (data.resume || null) as import('../types').SavedResume | null,
    };
  },

  getSavedResumes: async () => {
    const res = await api<{ data: import('../types').SavedResume[] }>('/jobs/resumes', { auth: true });
    return res.data;
  },

  uploadSavedResume: async (file: File) => {
    const form = new FormData();
    form.append('resume', file, file.name);
    const token = getToken();
    const response = await fetch(`${API_BASE}/jobs/resumes`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Could not upload this resume');
    return data.data as import('../types').SavedResume;
  },

  getSavedResumeFile: async (resume: import('../types').SavedResume) => {
    const token = getToken();
    const response = await fetch(`${API_BASE}/jobs/resumes/${resume.id}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Could not load this resume');
    }
    const blob = await response.blob();
    return new File([blob], resume.fileName, { type: blob.type || 'application/pdf' });
  },

  openSavedResume: async (id: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE}/jobs/resumes/${id}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Could not open this resume');
    }
    const url = URL.createObjectURL(await response.blob());
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },

  deleteSavedResume: async (id: string) => {
    await api(`/jobs/resumes/${id}`, { method: 'DELETE', auth: true });
  },
};

// ─── Company Service ──────────────────────────────────────────────────────────

export const companyService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Company> }>('/companies', {
      params: params as Record<string, string>,
      auth: true,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Company }>(`/companies/${id}`, { auth: false });
    return res.data;
  },

  create: async (data: Partial<import('../types').Company>) => {
    const res = await api<{ data: import('../types').Company }>('/companies', { method: 'POST', body: data, auth: true });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').Company>) => {
    const res = await api<{ data: import('../types').Company }>(`/companies/${id}`, { method: 'PUT', body: updates, auth: false });
    return res.data;
  },

  toggleStatus: async (id: string) => {
    const res = await api<{ data: import('../types').Company }>(`/companies/${id}/toggle-status`, { method: 'PATCH', auth: false });
    return res.data;
  },

  toggleTiedStatus: async (id: string) => {
    const res = await api<{ data: import('../types').Company }>(`/companies/${id}/toggle-tied`, { method: 'PATCH', auth: false });
    return res.data;
  },

  delete: async (id: string) => {
    return api(`/companies/${id}`, { method: 'DELETE', auth: false });
  },
};

// ─── Application Service ──────────────────────────────────────────────────────

export const applicationService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Application> }>('/applications', { params: params as Record<string, string>, auth: true });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Application }>(`/applications/${id}`, { auth: false });
    return res.data;
  },

  apply: async (jobId: string, driveId?: string) => {
    const res = await api<{ data: import('../types').Application }>('/applications', {
      method: 'POST', body: { jobId, driveId }, auth: true,
    });
    return res.data;
  },

  applyToDrive: async (driveId: string) => {
    const res = await api<{ data: import('../types').Application }>('/applications', {
      method: 'POST', body: { driveId }, auth: true,
    });
    return res.data;
  },

  shortlistCandidate: async (studentId: string, jobId?: string) => {
    const res = await api<{ data: import('../types').Application }>('/applications', {
      method: 'POST', body: { studentId, jobId, status: 'shortlisted', isShortlisted: true }, auth: true,
    });
    return res.data;
  },

  updateStatus: async (id: string, status: string, recruiterNotes?: string) => {
    const res = await api<{ data: import('../types').Application }>(`/applications/${id}/status`, {
      method: 'PUT', body: { status, recruiterNotes }, auth: true,
    });
    return res.data;
  },
};

// ─── Interview Service ────────────────────────────────────────────────────────

export const interviewService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Interview> }>('/interviews', { params: params as Record<string, string>, auth: true });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Interview }>(`/interviews/${id}`, { auth: false });
    return res.data;
  },

  schedule: async (data: Partial<import('../types').Interview>) => {
    const res = await api<{ data: import('../types').Interview }>('/interviews', { method: 'POST', body: data, auth: true });
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api<{ data: import('../types').Interview }>(`/interviews/${id}/status`, {
      method: 'PUT', body: { status }, auth: true,
    });
    return res.data;
  },

  checkConflicts: async (studentId: string, date: string, time: string) => {
    const res = await api<{ data: { hasConflict: boolean; conflictingInterview: import('../types').Interview | null } }>('/interviews/check-conflicts', {
      params: { studentId, date, time }, auth: true,
    });
    return res.data;
  },
};

// ─── Drive Service ────────────────────────────────────────────────────────────

export const driveService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PlacementDrive[] }>('/drives', { params: params as Record<string, string>, auth: true });
    return res.data;
  },

  getCampusOSDrives: async (params?: Record<string, any>) => {
    const res = await api<{ data: import('../types').PlacementDrive[] }>('/drives', {
      params: { ...params, campusos: 'true' } as Record<string, string>,
      auth: true,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').PlacementDrive }>(`/drives/${id}`, { auth: false });
    return res.data;
  },

  create: async (data: Partial<import('../types').PlacementDrive>) => {
    const res = await api<{ data: import('../types').PlacementDrive }>('/drives', { method: 'POST', body: data, auth: false });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').PlacementDrive>) => {
    const res = await api<{ data: import('../types').PlacementDrive }>(`/drives/${id}`, { method: 'PUT', body: updates, auth: true });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api<{ data: { removedApplications: number; removedInterviews: number } }>(`/drives/${id}`, { method: 'DELETE', auth: true });
    return res.data;
  },
};

// ─── Analytics Service ────────────────────────────────────────────────────────

export const analyticsService = {
  getCollegeAnalytics: async (collegeId: string) => {
    const res = await api<{ data: import('../types').CollegeAnalytics }>(`/analytics/college/${collegeId}`, { auth: false });
    return res.data;
  },

  getPlatformStats: async () => {
    try {
      const res = await api<{ data: import('../types').PlatformStats }>('/analytics/platform', { auth: false });
      return res.data;
    } catch {
      return mockPlatformStats;
    }
  },

  getPlatformCharts: async () => {
    try {
      const res = await api<{ data: typeof mockPlatformCharts }>('/analytics/platform/charts', { auth: false });
      return res.data;
    } catch {
      return mockPlatformCharts;
    }
  },

  getRecruitingFunnel: async (_companyId: string) => {
    return [
      { stage: 'Applied', count: 450, percent: 100 },
      { stage: 'Shortlisted', count: 180, percent: 40 },
      { stage: 'Assessment', count: 120, percent: 27 },
      { stage: 'Technical', count: 75, percent: 17 },
      { stage: 'HR Round', count: 45, percent: 10 },
      { stage: 'Selected', count: 28, percent: 6 },
    ];
  },
};

// ─── Recruiter Service ────────────────────────────────────────────────────────

export const recruiterService = {
  getDashboardData: async () => {
    const res = await api<{ data: any }>('/recruiter/me/dashboard', { auth: true });
    return res.data;
  }
};

// ─── College Service ──────────────────────────────────────────────────────────

const getLocalRegisteredColleges = (): import('../types').College[] => {
  try {
    const raw = localStorage.getItem('aicampus_registered_colleges') || localStorage.getItem('placementos_registered_colleges');
    if (!raw) return [];
    const parsed: import('../types').College[] = JSON.parse(raw);
    // Purge legacy mock entries with non-mongo IDs like 'college-1'
    return Array.isArray(parsed) ? parsed.filter(c => c && c.id && !c.id.startsWith('college-')) : [];
  } catch {
    return [];
  }
};

const saveLocalRegisteredColleges = (colleges: import('../types').College[]) => {
  try {
    // Only persist valid real colleges
    const clean = colleges.filter(c => c && c.id && !c.id.startsWith('college-'));
    localStorage.setItem('aicampus_registered_colleges', JSON.stringify(clean));
  } catch {}
};

// Colleges removed from the dashboard while the backend lacks DELETE /colleges/:id
const REMOVED_KEY = 'aicampus_removed_colleges';
const getRemovedCollegeIds = (): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};
const addRemovedCollegeId = (id: string) => {
  try {
    localStorage.setItem(REMOVED_KEY, JSON.stringify(Array.from(new Set([...getRemovedCollegeIds(), id]))));
  } catch {}
};

export const collegeService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const local = getLocalRegisteredColleges();
    try {
      const queryLimit = params?.limit ? Math.max(Number(params.limit), 100) : 200;
      const res = await api<{ data: import('../types').PaginatedResponse<import('../types').College> }>('/colleges', {
        params: { ...params, limit: queryLimit },
        auth: false,
      });
      const apiColleges = res?.data?.data || [];

      // Backend (MongoDB) is the single source of truth when reachable
      const removed = new Set(getRemovedCollegeIds());
      const combined: import('../types').College[] = apiColleges
        .map(c => {
          const id = c.id || (c as any)._id;
          const code = (c.code || (c.name ? c.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + '1' : 'COL1')).toUpperCase();
          return { ...c, id, code };
        })
        .filter(c => !removed.has(c.id));

      // Refresh the offline cache so deleted / stale colleges don't linger
      saveLocalRegisteredColleges(combined);

      return {
        data: combined,
        total: combined.length,
        page: res?.data?.page || 1,
        limit: res?.data?.limit || combined.length,
        totalPages: Math.ceil(combined.length / 10),
      };
    } catch (err) {
      console.warn('Failed to fetch colleges from API, using locally registered colleges:', err);
      return { data: local, total: local.length, page: 1, limit: 10, totalPages: Math.ceil(local.length / 10) };
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api<{ data: import('../types').College }>(`/colleges/${id}`);
      const c = res.data;
      return { ...c, id: c.id || (c as any)._id } as import('../types').College;
    } catch (err) {
      const found = getLocalRegisteredColleges().find(c => c.id === id || c.code === id);
      if (found) return found;
      throw err;
    }
  },

  /** All real students registered under a college (filtered client-side by collegeId). */
  getStudents: async (collegeId: string): Promise<import('../types').Student[]> => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Student> }>('/students', {
      params: { collegeId, limit: 1000 },
      auth: true,
    });
    const list = res?.data?.data || [];
    return list
      .map(s => ({ ...s, id: s.id || (s as any)._id }))
      .filter(s => String((s as any).collegeId?._id || s.collegeId) === collegeId);
  },

  /** Real registered-student count per collegeId. */
  getStudentCounts: async (): Promise<Record<string, number>> => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Student> }>('/students', {
      params: { limit: 1000 },
      auth: true,
    });
    const counts: Record<string, number> = {};
    (res?.data?.data || []).forEach(s => {
      const cid = String((s as any).collegeId?._id || s.collegeId || '');
      if (cid) counts[cid] = (counts[cid] || 0) + 1;
    });
    return counts;
  },

  /**
   * Deletes a college. If the backend has no DELETE route yet, falls back to
   * suspending it on the server and hiding it from lists in this browser.
   * Returns 'deleted' or 'suspended' so the UI can tell the user what happened.
   */
  delete: async (id: string, isActive = true): Promise<'deleted' | 'suspended'> => {
    try {
      await api(`/colleges/${id}`, { method: 'DELETE', auth: true });
      saveLocalRegisteredColleges(getLocalRegisteredColleges().filter(c => c.id !== id));
      return 'deleted';
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!/route not found|404/i.test(msg)) throw err;

      // Fallback: deactivate on the server (blocks TPO/student logins), then hide locally
      if (isActive) {
        await api(`/colleges/${id}/toggle-status`, { method: 'PATCH', auth: false });
      }
      addRemovedCollegeId(id);
      saveLocalRegisteredColleges(getLocalRegisteredColleges().filter(c => c.id !== id));
      return 'suspended';
    }
  },

  lookup: async (q: string) => {
    const qLower = q.trim().toLowerCase();
    const local = getLocalRegisteredColleges();
    const localMatch = local.find(c =>
      c.code?.toLowerCase() === qLower ||
      c.name?.toLowerCase().includes(qLower)
    );
    if (localMatch) {
      return {
        id: localMatch.id,
        name: localMatch.name,
        code: localMatch.code,
        city: localMatch.city,
        departments: localMatch.departments || [],
      };
    }
    try {
      const res = await api<{ data: {
        id: string;
        name: string;
        code: string;
        city: string;
        departments: { id: string; name: string; code: string }[];
      } | null }>('/colleges/lookup', { params: { q }, auth: false });
      return res.data;
    } catch {
      return null;
    }
  },

  create: async (data: {
    name: string;
    code?: string;
    city: string;
    state?: string;
    establishedYear?: number;
    tpoName: string;
    tpoEmail: string;
    tpoPhone?: string;
    password?: string;
    plan?: string;
  }) => {
    let result: { college: import('../types').College; adminUser: unknown };
    try {
      const res = await api<{ data: { college: import('../types').College; adminUser: unknown } }>('/colleges', {
        method: 'POST',
        body: data,
      });
      result = res.data;
    } catch {
      // Fallback offline creation so registration works seamlessly even if backend is offline
      const code = data.code || (data.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + '1');
      const mockCol: import('../types').College = {
        id: `college-${Date.now()}`,
        name: data.name,
        code,
        city: data.city,
        state: data.state || '',
        country: 'India',
        phone: data.tpoPhone || '080-12345678',
        email: data.tpoEmail,
        establishedYear: data.establishedYear || 2000,
        affiliation: 'Affiliated University',
        type: 'engineering',
        totalStudents: 0,
        tpoName: data.tpoName,
        tpoEmail: data.tpoEmail,
        tpoPhone: data.tpoPhone,
        subscription: {
          plan: (data.plan as any) || 'starter',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          studentsLimit: 1000,
          studentsUsed: 0,
          aiCreditsLimit: 1000,
          aiCreditsUsed: 0,
          recruitersLimit: 50,
          recruitersUsed: 0,
          jobsLimit: 100,
          jobsUsed: 0,
        },
        stats: {
          totalStudents: 0,
          eligibleStudents: 0,
          placedStudents: 0,
          placementPercent: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalInterviews: 0,
          avgPackage: 0,
          highestPackage: 0,
        },
        departments: ['CSE', 'ISE', 'ECE', 'MECH'],
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      result = { college: mockCol, adminUser: { email: data.tpoEmail } };
    }

    if (result?.college) {
      const existing = getLocalRegisteredColleges();
      const filtered = existing.filter(c => c.code !== result.college.code && c.id !== result.college.id);
      saveLocalRegisteredColleges([result.college, ...filtered]);
    }
    return result;
  },

  update: async (id: string, updates: Partial<import('../types').College>): Promise<import('../types').College> => {
    let result: import('../types').College | null = null;
    try {
      const res = await api<{ data: import('../types').College }>(`/colleges/${id}`, {
        method: 'PUT',
        body: updates,
        auth: true,
      });
      if (res?.data) {
        result = res.data;
      }
    } catch (err) {
      console.warn('API PUT /colleges/:id failed, updating local storage:', err);
    }

    const local = getLocalRegisteredColleges();
    const existingIndex = local.findIndex(c => c.id === id || c.code === id);
    const existing = existingIndex !== -1 ? local[existingIndex] : null;
    const fallbackCollege: import('../types').College = {
      ...(existing || {}),
      id,
      ...updates,
      ...(result || {}),
    } as import('../types').College;

    if (existingIndex !== -1) {
      local[existingIndex] = fallbackCollege;
      saveLocalRegisteredColleges(local);
    } else {
      saveLocalRegisteredColleges([fallbackCollege, ...local]);
    }
    return result || fallbackCollege;
  },

  toggleStatus: async (id: string) => {
    let updatedCollege: import('../types').College | null = null;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isMongoId) {
      const res = await api<{ data: import('../types').College; success: boolean }>(`/colleges/${id}/toggle-status`, {
        method: 'PATCH',
        auth: false,
      });
      if (res?.data) {
        updatedCollege = res.data;
      }
    }

    // Sync with local registered colleges storage
    const local = getLocalRegisteredColleges();
    const existing = local.find(c => c.id === id);
    const newIsActive = updatedCollege ? updatedCollege.isActive : !(existing?.isActive ?? true);

    const updated = local.map(c => c.id === id ? { ...c, isActive: newIsActive } : c);
    if (!existing && updatedCollege) {
      updated.push(updatedCollege);
    }
    saveLocalRegisteredColleges(updated);

    return updatedCollege || { id, isActive: newIsActive };
  },

  resetPassword: async (id: string, password: string) => {
    const res = await api<{ success: boolean; message: string; data: any }>(`/colleges/${id}/reset-password`, {
      method: 'POST',
      body: { password },
    });
    return res;
  },
};

// ─── Notification Service ─────────────────────────────────────────────────────

export const notificationService = {
  getAll: async () => {
    const res = await api<{ data: import('../types').Notification[] }>('/notifications');
    return res.data;
  },

  markRead: async (id: string) => {
    return api(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllRead: async () => {
    return api('/notifications/read-all', { method: 'PATCH' });
  },
};

// ─── Announcement Service ───────────────────────────────────────────────────

export const announcementService = {
  getAll: async () => {
    const res = await api<{ data: import('../types').NewsArticle[] }>('/announcements', { auth: true });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').NewsArticle }>(`/announcements/${id}`, { auth: true });
    return res.data;
  },

  create: async (data: Partial<import('../types').NewsArticle>) => {
    const res = await api<{ data: import('../types').NewsArticle }>('/announcements', { method: 'POST', body: data, auth: true });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').NewsArticle>) => {
    const res = await api<{ data: import('../types').NewsArticle }>(`/announcements/${id}`, { method: 'PUT', body: updates, auth: true });
    return res.data;
  },

  delete: async (id: string) => {
    return api(`/announcements/${id}`, { method: 'DELETE', auth: true });
  },

  togglePin: async (id: string) => {
    const res = await api<{ data: import('../types').NewsArticle }>(`/announcements/${id}/pin`, { method: 'PATCH', auth: true });
    return res.data;
  },

  toggleLike: async (id: string) => {
    const res = await api<{ data: import('../types').NewsArticle }>(`/announcements/${id}/like`, { method: 'PATCH', auth: true });
    return res.data;
  },

  incrementView: async (id: string) => {
    return api(`/announcements/${id}/view`, { method: 'PATCH', auth: true });
  }
};

const READ_NOTICES_KEY = 'aicampus-read-notices';

const readNoticeIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_NOTICES_KEY) || '[]');
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
};

export const rememberNoticeRead = (ids: string[]) => {
  const current = readNoticeIds();
  ids.forEach((id) => current.add(id));
  localStorage.setItem(READ_NOTICES_KEY, JSON.stringify([...current]));
  window.dispatchEvent(new Event('notifications-updated'));
};

export const getNoticeFeed = async (role?: string, collegeId?: string) => {
  const seen = readNoticeIds();
  const stored = await notificationService.getAll().catch(() => [] as import('../types').Notification[]);
  const saved = stored.map((item) => ({ ...item, isRead: item.isRead || seen.has(item.id) }));
  if (role !== 'TPO' && role !== 'COLLEGE_ADMIN') return saved;

  const filterParams = (collegeId ? { collegeId, limit: 12 } : { limit: 12 }) as import('../types').FilterParams;
  const [applications, interviews, drives, announcements] = await Promise.all([
    applicationService.getAll(filterParams).catch(() => ({ data: [] as import('../types').Application[] })),
    interviewService.getAll(filterParams).catch(() => ({ data: [] as import('../types').Interview[] })),
    driveService.getAll(collegeId ? ({ collegeId } as any) : undefined).catch(() => [] as import('../types').PlacementDrive[]),
    announcementService.getAll().catch(() => [] as import('../types').NewsArticle[]),
  ]);

  const activity: import('../types').Notification[] = [
    ...(applications.data || []).map((app) => ({
      id: `application:${app.id}`,
      userId: '',
      type: app.status === 'selected' ? 'selection' as const : 'application' as const,
      title: app.status === 'selected'
        ? `${app.student?.name || 'A student'} was selected`
        : `${app.student?.name || 'A student'} applied`,
      message: `${app.student?.department || 'Student'} · ${app.job?.title || 'a role'}${app.company?.name ? ` at ${app.company.name}` : ''} · ${app.status.replace(/_/g, ' ')}`,
      isRead: seen.has(`application:${app.id}`),
      link: '/college/applications',
      createdAt: app.appliedAt || app.updatedAt,
    })),
    ...(interviews.data || [])
      .filter((item) => item.status !== 'cancelled')
      .map((item) => ({
        id: `interview:${item.id}`,
        userId: '',
        type: 'interview' as const,
        title: `${item.student?.name || 'Student'} · ${item.type} round ${item.round}`,
        message: `${item.job?.title || 'Interview'}${item.company?.name ? ` at ${item.company.name}` : ''} · ${item.date} ${item.time} · ${item.status.replace(/_/g, ' ')}`,
        isRead: seen.has(`interview:${item.id}`),
        link: '/college/interviews',
        createdAt: item.createdAt || item.date,
      })),
    ...drives
      .filter((drive) => drive.status === 'upcoming' || drive.status === 'ongoing')
      .map((drive) => ({
        id: `drive:${drive.id}`,
        userId: '',
        type: 'reminder' as const,
        title: drive.title,
        message: `${drive.company?.name || 'Campus drive'} · ${drive.status} · ${drive.venue || 'Venue to be announced'}`,
        isRead: seen.has(`drive:${drive.id}`),
        link: '/college/drives',
        createdAt: drive.date || drive.createdAt,
      })),
    ...announcements.slice(0, 8).map((article) => ({
      id: `announcement:${article.id}`,
      userId: '',
      type: 'system' as const,
      title: article.title,
      message: article.summary || article.category,
      isRead: seen.has(`announcement:${article.id}`),
      link: '/college/notifications',
      createdAt: article.publishedAt || article.updatedAt,
    })),
  ];

  const storedIds = new Set(saved.map((item) => item.id));
  return [...saved, ...activity.filter((item) => !storedIds.has(item.id))]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ─── Department Service ───────────────────────────────────────────────────────

export const departmentService = {
  getAll: async (collegeId: string) => {
    const res = await api<{ data: import('../types').Department[] }>('/departments', {
      params: { collegeId },
      auth: false,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Department }>(`/departments/${id}`, { auth: false });
    return res.data;
  },

  create: async (data: Partial<import('../types').Department>) => {
    const res = await api<{ data: import('../types').Department }>('/departments', { method: 'POST', body: data, auth: false });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').Department>) => {
    const res = await api<{ data: import('../types').Department }>(`/departments/${id}`, { method: 'PUT', body: updates, auth: false });
    return res.data;
  },

  delete: async (id: string) => {
    return api(`/departments/${id}`, { method: 'DELETE', auth: false });
  },
};

// ─── AI Service (still client-side logic + fallback) ─────────────────────────

import { sleep } from '../utils';

export interface ResumeAnalysisResult {
  fileName: string;
  targetRole: string;
  overallScore: number;
  atsScore: number;
  formattingScore: number;
  impactScore: number;
  parsedSummary: {
    name: string;
    email: string;
    phone: string;
    wordCount: number;
    detectedSections: string[];
    skillsFound: string[];
  };
  sections: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  missingSkills: string[];
  bulletFixes: { original: string; optimized: string; reason: string }[];
  atsChecklist: { check: string; passed: boolean; details: string }[];
  suggestions: string[];
  certificationRecommendations: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toText = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(', ');
  if (isRecord(value)) {
    for (const key of ['text', 'name', 'title', 'keyword', 'skill', 'value', 'description', 'details', 'feedback']) {
      if (typeof value[key] === 'string' && value[key]) return value[key] as string;
    }
    return Object.values(value).map(toText).filter(Boolean).join(' – ');
  }
  return '';
};

const toScore = (value: unknown): number => {
  const raw = isRecord(value) ? (value.score ?? value.value ?? value.percentage) : value;
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  if (!Number.isFinite(num)) return 0;
  return Math.round(Math.min(100, Math.max(0, num <= 1 && num > 0 ? num * 100 : num)));
};

const toTextList = (value: unknown): string[] => {
  if (value == null) return [];
  if (typeof value === 'string') return value.split(/\n|;|,(?![^(]*\))/).map(s => s.trim()).filter(Boolean);
  if (Array.isArray(value)) return value.map(toText).map(s => s.trim()).filter(Boolean);
  if (isRecord(value)) return Object.entries(value).map(([k, v]) => (typeof v === 'boolean' ? k : toText(v) || k)).filter(Boolean);
  return [];
};

const toList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) return Object.values(value);
  return [];
};

export const normalizeResumeAnalysis = (raw: unknown, fileName = 'resume.pdf', targetRole = 'Software Engineer'): ResumeAnalysisResult => {
  const data = isRecord(raw) ? raw : {};
  const summary = isRecord(data.parsedSummary) ? data.parsedSummary : {};
  const sectionsRaw = isRecord(data.sections) ? data.sections : {};
  const sections: Record<string, number> = {};
  Object.entries(sectionsRaw).forEach(([key, value]) => { sections[key] = toScore(value); });

  return {
    fileName: toText(data.fileName) || fileName,
    targetRole: toText(data.targetRole) || targetRole,
    overallScore: toScore(data.overallScore),
    atsScore: toScore(data.atsScore),
    formattingScore: toScore(data.formattingScore),
    impactScore: toScore(data.impactScore),
    parsedSummary: {
      name: toText(summary.name),
      email: toText(summary.email),
      phone: toText(summary.phone),
      wordCount: Math.round(Number(summary.wordCount) || 0),
      detectedSections: toTextList(summary.detectedSections),
      skillsFound: toTextList(summary.skillsFound),
    },
    sections,
    strengths: toTextList(data.strengths),
    weaknesses: toTextList(data.weaknesses),
    matchedKeywords: toTextList(data.matchedKeywords),
    missingKeywords: toTextList(data.missingKeywords),
    missingSkills: toTextList(data.missingSkills),
    bulletFixes: toList(data.bulletFixes).map(item => {
      const fix = isRecord(item) ? item : {};
      return {
        original: toText(fix.original ?? fix.before),
        optimized: toText(fix.optimized ?? fix.after ?? fix.improved),
        reason: toText(fix.reason ?? fix.why ?? fix.explanation),
      };
    }).filter(fix => fix.original || fix.optimized),
    atsChecklist: toList(data.atsChecklist).map(item => {
      const entry = isRecord(item) ? item : {};
      const passed = entry.passed ?? entry.pass ?? entry.status;
      return {
        check: toText(entry.check ?? entry.name ?? entry.item) || toText(item),
        passed: passed === true || (typeof passed === 'string' && /^(true|pass|passed|yes|ok)$/i.test(passed)),
        details: toText(entry.details ?? entry.detail ?? entry.description ?? entry.note),
      };
    }).filter(entry => entry.check),
    suggestions: toTextList(data.suggestions),
    certificationRecommendations: toTextList(data.certificationRecommendations),
  };
};

export const aiService = {
  getMatchScore: async (studentId: string, jobId: string) => {
    const res = await api<{ data: {
      studentId: string;
      jobId: string;
      overallScore: number;
      breakdown: { skillMatch: number; educationMatch: number; cgpaMatch: number; certificationMatch: number; locationMatch: number; preferenceMatch: number };
      matchedSkills: string[];
      missingSkills: string[];
      recommendation: 'suitable' | 'borderline' | 'not_suitable';
      explanation: string;
      strengths: string[];
      concerns: string[];
    } }>('/ai/match', { method: 'POST', body: { studentId, jobId } });
    return res.data;
  },

  getChat: async (mode: string) => {
    const res = await api<{ data: { messages: { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[] } }>('/ai/chat', { params: { mode } });
    return res.data;
  },

  chat: async (
    message: string,
    role: string,
    history: { role: string; content: string }[] = [],
  ): Promise<{ content: string; richContent?: unknown }> => {
    const res = await api<{ data: { content: string } }>('/ai/chat', { method: 'POST', body: { message, mode: role, history } });
    return res.data;
  },

  startInterview: async (company: string, round: string) => {
    const res = await api<{ data: {
      sessionId: string;
      token: string;
      models: string[];
      instructions: string;
      remainingToday: number;
    } }>('/ai/interview/sessions', { method: 'POST', body: { company, round } });
    return res.data;
  },

  refreshInterviewToken: async (sessionId: string) => {
    const res = await api<{ data: { token: string; models: string[] } }>(`/ai/interview/sessions/${sessionId}/token`, { method: 'POST' });
    return res.data;
  },

  completeInterview: async (
    sessionId: string,
    transcript: { role: 'interviewer' | 'candidate'; text: string }[],
    model?: string,
  ) => {
    const res = await api<{ data: {
      id: string;
      company: string;
      round: string;
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      transcript: { role: 'interviewer' | 'candidate'; text: string }[];
    } }>(`/ai/interview/sessions/${sessionId}/complete`, { method: 'POST', body: { transcript, model } });
    return res.data;
  },

  listInterviews: async () => {
    const res = await api<{ data: {
      id: string;
      company: string;
      round: string;
      score: number;
      feedback: string;
      createdAt: string;
    }[] }>('/ai/interview/sessions');
    return res.data;
  },

  optimizeProfile: async () => {
    const res = await api<{ success: boolean; data: {
      headlineSuggestion: string;
      executiveSummary: string;
      recommendedSkills: string[];
      missingKeywords: string[];
      projectIdeas: { title: string; tech: string; summary: string }[];
      recruiterTips: string[];
    } }>('/ai/optimize-profile', { method: 'POST' });
    return res.data;
  },

  analyzeResume: async (file: File | string, targetRole: string = 'Full Stack Developer'): Promise<ResumeAnalysisResult> => {
    if (typeof file !== 'string') {
      const form = new FormData();
      form.append('resume', file, file.name);
      form.append('targetRole', targetRole);
      const token = getToken();
      const response = await fetch(`${API_BASE}/ai/analyze-resume`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to analyze resume');
      return normalizeResumeAnalysis(data.data, file.name, targetRole);
    }

    await sleep(2000);
    const fileName = file;
    const isSampleHigh = fileName.toLowerCase().includes('high') || fileName.toLowerCase().includes('senior') || fileName.toLowerCase().includes('arjun');
    const isSampleLow = fileName.toLowerCase().includes('fresher') || fileName.toLowerCase().includes('basic') || fileName.toLowerCase().includes('low');

    const roleKeywordsMap: Record<string, { matched: string[]; missingKeywords: string[]; missingSkills: string[] }> = {
      'Full Stack Developer': {
        matched: ['React', 'TypeScript', 'Node.js', 'REST API', 'Git', 'MongoDB', 'TailwindCSS'],
        missingKeywords: ['CI/CD Pipelines', 'System Design', 'Microservices', 'Unit Testing'],
        missingSkills: ['Docker', 'Kubernetes', 'AWS S3', 'Redis'],
      },
      'Data Scientist / AI Engineer': {
        matched: ['Python', 'Pandas', 'NumPy', 'SQL', 'Scikit-Learn', 'Data Visualization'],
        missingKeywords: ['MLOps', 'Hyperparameter Tuning', 'Model Deployment', 'Feature Engineering'],
        missingSkills: ['PyTorch', 'TensorFlow', 'Docker', 'MLflow'],
      },
      'Backend Engineer': {
        matched: ['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'SQL', 'Git'],
        missingKeywords: ['gRPC', 'Distributed Systems', 'Message Queues', 'Caching'],
        missingSkills: ['Kafka', 'Redis', 'Docker', 'Kubernetes'],
      },
      'Frontend Developer': {
        matched: ['React', 'JavaScript', 'HTML5', 'CSS3', 'TailwindCSS', 'Redux'],
        missingKeywords: ['Web Vitals Optimization', 'Accessibility (a11y)', 'SSR / Next.js'],
        missingSkills: ['TypeScript', 'Jest / Vitest', 'Cypress', 'GraphQL'],
      },
      'DevOps / Cloud Engineer': {
        matched: ['Linux', 'Docker', 'Bash Scripting', 'Git', 'AWS', 'Networking'],
        missingKeywords: ['Infrastructure as Code', 'Zero Downtime Deployment', 'Monitoring'],
        missingSkills: ['Kubernetes', 'Terraform', 'Prometheus', 'Ansible'],
      },
      'Telecaller': {
        matched: ['Communication', 'Customer Service', 'Cold Calling', 'Sales', 'CRM', 'Lead Generation', 'Inbound', 'Outbound'],
        missingKeywords: ['Objection Handling', 'B2B Sales', 'Active Listening', 'Negotiation', 'Target Achievement'],
        missingSkills: ['Salesforce', 'Zendesk', 'HubSpot', 'Telemarketing', 'Conversion Rate'],
      }
    };

    const genericFallback = {
        matched: ['Communication', 'Problem Solving', 'Teamwork', 'Project Management', 'Time Management'],
        missingKeywords: ['Leadership', 'Strategic Planning', 'Data Analysis', 'Agile'],
        missingSkills: ['Critical Thinking', 'Adaptability', 'Cross-functional Collaboration'],
    };

    const roleData = roleKeywordsMap[targetRole] || genericFallback;

    if (isSampleHigh) {
      return {
        fileName,
        targetRole,
        overallScore: 92,
        atsScore: 90,
        formattingScore: 95,
        impactScore: 88,
        parsedSummary: {
          name: 'Arjun Sharma',
          email: 'arjun.s@srmist.edu.in',
          phone: '+91 98765 43210',
          wordCount: 485,
          detectedSections: ['Education', 'Experience', 'Projects', 'Skills', 'Certifications'],
          skillsFound: [...roleData.matched, 'GraphQL', 'Docker', 'Jest'],
        },
        sections: {
          skills: 95,
          projects: 90,
          atsKeywords: 90,
          formatting: 96,
          achievements: 88,
          experience: 92,
          education: 98,
        },
        strengths: [
          'Strong technical stack alignment with recruiter queries',
          'Quantified impact metrics in 85% of work experience bullets',
          'Clean single-column ATS readable layout with standard headings',
          'Includes verified Github repository links and live project URLs',
        ],
        weaknesses: [
          'Could add 1-2 more cloud infrastructure keywords (e.g. AWS Lambda, Terraform)',
          'Executive summary could be slightly more concise (under 3 lines)',
        ],
        matchedKeywords: [...roleData.matched, 'Agile', 'Jira', 'CI/CD'],
        missingKeywords: roleData.missingKeywords.slice(0, 2),
        missingSkills: roleData.missingSkills.slice(0, 2),
        bulletFixes: [
          {
            original: 'Built backend APIs for student portal using Node.js.',
            optimized: 'Engineered RESTful Node.js microservices handling 45,000+ monthly requests with sub-100ms latency.',
            reason: 'Adds action verb "Engineered" and quantifies volume (45k requests) and performance (100ms).',
          },
          {
            original: 'Responsible for fixing UI bugs in React application.',
            optimized: 'Resolved 35+ critical React UI bugs, boosting lighthouse performance score from 68 to 94.',
            reason: 'Replaces passive "Responsible for" with direct result metric (Lighthouse 68 -> 94).',
          },
        ],
        atsChecklist: [
          { check: 'Standard Section Titles', passed: true, details: 'Used standard headers (Experience, Education, Skills)' },
          { check: 'Single-Column Layout', passed: true, details: 'No multi-column tables or complex text frames' },
          { check: 'Font Readability', passed: true, details: 'Clean standard typography (Inter / Arial)' },
          { check: 'Quantified Metrics', passed: true, details: 'Contains numbers, %, and performance data' },
          { check: 'Action Verbs Usage', passed: true, details: '100% of bullets start with strong action verbs' },
          { check: 'Contact Details Parsing', passed: true, details: 'Valid Email, Phone number, and SRM student ID found' },
        ],
        suggestions: [
          'Add 1-2 cloud infrastructure certifications (e.g., AWS Certified Developer)',
          'Include exact tech stack version numbers for key frameworks (e.g. React 18, Node 20)',
          'Mention automated unit testing coverage percentage in project highlights',
        ],
        certificationRecommendations: ['AWS Certified Developer - Associate', 'Meta Front-End Developer Professional'],
      };
    }

    if (isSampleLow) {
      return {
        fileName,
        targetRole,
        overallScore: 62,
        atsScore: 55,
        formattingScore: 70,
        impactScore: 50,
        parsedSummary: {
          name: 'Student Candidate',
          email: 'student@srmist.edu.in',
          phone: '+91 90000 00000',
          wordCount: 220,
          detectedSections: ['Education', 'Skills', 'Projects'],
          skillsFound: ['Java', 'C++', 'HTML', 'CSS', 'SQL'],
        },
        sections: {
          skills: 65,
          projects: 55,
          atsKeywords: 50,
          formatting: 70,
          achievements: 40,
          experience: 45,
          education: 85,
        },
        strengths: [
          'Solid educational background with SRM University degree listed',
          'Basic core programming languages (Java, C++) present',
        ],
        weaknesses: [
          'Missing critical recruiter search keywords for ' + targetRole,
          'Zero quantified metrics (no %, $, numbers, or scale mentioned)',
          'Short resume length (< 250 words) indicates low detail level',
          'Missing Work Experience / Internship section header',
        ],
        matchedKeywords: ['Java', 'SQL', 'HTML', 'CSS'],
        missingKeywords: roleData.missingKeywords,
        missingSkills: roleData.missingSkills,
        bulletFixes: [
          {
            original: 'Worked on database project using SQL.',
            optimized: 'Designed and optimized PostgreSQL database schema with 12 relational tables for e-commerce catalog.',
            reason: 'Specifies exact database type, table count, and design action.',
          },
          {
            original: 'Did web development course.',
            optimized: 'Completed 60-hour Full-Stack Web Development certification, implementing 3 full-stack React & Express projects.',
            reason: 'Provides course scale and tangible project outputs.',
          },
        ],
        atsChecklist: [
          { check: 'Standard Section Titles', passed: true, details: 'Found Education and Skills headers' },
          { check: 'Single-Column Layout', passed: true, details: 'Standard text structure detected' },
          { check: 'Font Readability', passed: true, details: 'Standard font size' },
          { check: 'Quantified Metrics', passed: false, details: 'No numerical metrics or percentages detected' },
          { check: 'Action Verbs Usage', passed: false, details: 'Uses weak phrases like "Worked on" and "Did"' },
          { check: 'Work Experience Section', passed: false, details: 'Internship or Experience section is missing' },
        ],
        suggestions: [
          'Add at least 3-4 bullet points per project using the STAR method',
          'Incorporate target recruiter keywords like ' + roleData.missingKeywords.slice(0, 3).join(', '),
          'Include metrics such as dataset sizes, query speeds, user counts, or code test coverage',
          'Add link to active GitHub profile showing code repositories',
        ],
        certificationRecommendations: ['Oracle Certified Professional Java SE', 'AWS Cloud Practitioner'],
      };
    }

    const extractedName = 'Not Found';
    const extractedEmail = 'Not Found';
    const extractedPhone = 'Not Found';
    const extractedSkills: string[] = [];

    // Dynamic calculation based on actual parsed skills
    const targetKeywords = [...roleData.matched, ...roleData.missingKeywords, ...roleData.missingSkills];
    const actualMatched = targetKeywords.filter(tk => 
      extractedSkills.some(es => es.toLowerCase().includes(tk.toLowerCase()))
    );
    const actualMissing = targetKeywords.filter(tk => !actualMatched.includes(tk));
    
    const matchPercentage = targetKeywords.length > 0 ? Math.round((actualMatched.length / targetKeywords.length) * 100) : 10;
    const atsScore = Math.max(15, matchPercentage);
    const overallScore = Math.max(30, Math.floor(atsScore * 0.7 + 25));
    const missingTop = actualMissing.slice(0, 4);

    return {
      fileName,
      targetRole,
      overallScore: overallScore,
      atsScore: atsScore,
      formattingScore: 85,
      impactScore: Math.min(80, atsScore + 10),
      parsedSummary: {
        name: extractedName,
        email: extractedEmail,
        phone: extractedPhone,
        wordCount: Math.floor(extractedSkills.length * 15 + 200),
        detectedSections: ['Skills', 'Experience', 'Education'],
        skillsFound: extractedSkills,
      },
      sections: {
        skills: atsScore,
        projects: 70,
        atsKeywords: atsScore,
        formatting: 85,
        achievements: 65,
        experience: 75,
        education: 80,
      },
      strengths: [
        actualMatched.length > 0 ? `Successfully parsed key technical skills including ${actualMatched.slice(0, 2).join(', ')}` : 'Document structure parsed successfully',
        extractedEmail !== 'Not Found' ? 'Contact information parsed correctly' : 'Readable layout'
      ],
      weaknesses: [
        missingTop.length > 0 ? `Missing high-priority recruiter keywords: ${missingTop.join(', ')}` : 'Could include more measurable impact metrics in experience section',
      ],
      matchedKeywords: actualMatched.length > 0 ? actualMatched : ['No exact target tech matches found'],
      missingKeywords: actualMissing.slice(0, 5),
      missingSkills: actualMissing.slice(5, 10),
      bulletFixes: [
        {
          original: 'Worked on assigned daily tasks.',
          optimized: `Spearheaded key ${targetRole.split(' ')[0] || 'department'} initiatives resulting in a 20% measurable improvement in core metrics.`,
          reason: 'Adds context, metrics, and role-specific action verbs.',
        }
      ],
      atsChecklist: [
        { check: 'Standard Section Titles', passed: true, details: 'Recognized standard headers' },
        { check: 'Contact Info Parsing', passed: extractedEmail !== 'Not Found', details: extractedEmail !== 'Not Found' ? 'Email found' : 'Email missing' },
      ],
      suggestions: [
        missingTop.length > 0 ? `Add missing skills like ${missingTop.join(', ')}` : 'Continue optimizing bullet points for impact',
      ],
      certificationRecommendations: ['Relevant Certification for ' + targetRole],
    };
  },

  getSkillGap: async (studentId: string, targetRole: string) => {
    const res = await api<{ data: {
      studentId: string;
      targetRole: string;
      currentSkills: string[];
      requiredSkills: string[];
      matchedSkills: string[];
      missingSkills: string[];
      matchPercent: number;
      learningResources: { title: string; url?: string }[];
    } }>('/ai/skill-gap', { method: 'POST', body: { studentId, targetRole } });
    return res.data;
  },

  getPlacementReadiness: async (studentId?: string) => {
    const res = await api<{ data: {
      overallScore: number;
      breakdown: { resume: number; skills: number; projects: number; certifications: number; communication: number; interviewReadiness: number };
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      improvementTimeline: { week: number; action: string; expectedGain: number }[];
    } }>('/ai/readiness', { params: studentId ? { studentId } : undefined });
    return res.data;
  },

  getMockInterviewQuestion: async (company: string, round: string) => {
    const res = await api<{ data: { question: string } }>('/ai/interview-question', { method: 'POST', body: { company, round } });
    return res.data.question;
  },
};

// ─── Billing Service (mock — no DB billing yet) ───────────────────────────────

export const billingService = {
  getPlans: async () => {
    await sleep(300);
    return [
      { id: 'starter' as const, name: 'Starter', price: 4999, annualPrice: 49990, studentsLimit: 500, aiCreditsLimit: 1000, recruitersLimit: 10, jobsLimit: 50, features: ['Up to 500 students', '10 recruiters', '50 active jobs', '1,000 AI credits/month', 'Basic analytics', 'Email support'] },
      { id: 'professional' as const, name: 'Professional', price: 12999, annualPrice: 129990, studentsLimit: 2000, aiCreditsLimit: 5000, recruitersLimit: 50, jobsLimit: 200, features: ['Up to 2,000 students', '50 recruiters', '200 active jobs', '5,000 AI credits/month', 'Advanced analytics & reports', 'AI Placement Officer', 'Priority support'], isPopular: true },
      { id: 'enterprise' as const, name: 'Enterprise', price: 29999, annualPrice: 299990, studentsLimit: 999999, aiCreditsLimit: 50000, recruitersLimit: 999, jobsLimit: 999, features: ['Unlimited students', 'Unlimited recruiters', 'Unlimited jobs', '50,000 AI credits/month', 'Full AI suite', 'API access', 'Dedicated account manager'] },
    ];
  },

  getInvoices: async (_collegeId: string) => {
    await sleep(350);
    return Array.from({ length: 8 }, (_, i) => ({
      id: `inv-${i + 1}`,
      collegeId: _collegeId,
      amount: [4999, 12999, 29999][i % 3],
      status: i === 0 ? 'pending' as const : 'paid' as const,
      date: new Date(2025, 7 - i, 1).toISOString(),
      dueDate: new Date(2025, 8 - i, 1).toISOString(),
      plan: ['starter', 'professional', 'enterprise'][i % 3] as 'starter',
      period: `${new Date(2025, 7 - i, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    }));
  },
};

// ─── Super Admin Services (still mostly mock) ─────────────────────────────────

import {
  mockSubscriptionsList, mockUsageStats,
  mockSuperAdminAnalyticsData, mockPlatformSettings, mockAuditLogs,
} from '../mock/data';

export const superAdminSubscriptionService = {
  getAll: async (params?: import('../types').FilterParams) => {
    await sleep(350);
    let list = [...mockSubscriptionsList];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      list = list.filter(s => s.collegeName.toLowerCase().includes(q) || s.collegeCode.toLowerCase().includes(q));
    }
    if (params?.plan && params.plan !== 'all') list = list.filter(s => s.plan === params.plan);
    if (params?.status && params.status !== 'all') list = list.filter(s => s.status === params.status);
    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 10;
    const start = (page - 1) * limit;
    return { data: list.slice(start, start + limit), total: list.length, page, limit, totalPages: Math.ceil(list.length / limit) };
  },

  getStats: async () => {
    await sleep(300);
    const active = mockSubscriptionsList.filter(s => s.status === 'active').length;
    const trial = mockSubscriptionsList.filter(s => s.status === 'trial').length;
    const expiring = mockSubscriptionsList.filter(s => s.status === 'expiring').length;
    const mrr = mockSubscriptionsList.reduce((acc, s) => acc + (s.billingCycle === 'annual' ? Math.round(s.amount / 12) : s.amount), 0);
    return { total: mockSubscriptionsList.length, active, trial, expiring, mrr, enterpriseCount: 3, arr: mrr * 12 };
  },

  updatePlan: async (id: string, updates: Partial<typeof mockSubscriptionsList[0]>) => {
    await sleep(500);
    const idx = mockSubscriptionsList.findIndex(s => s.id === id);
    if (idx !== -1) { Object.assign(mockSubscriptionsList[idx], updates); return mockSubscriptionsList[idx]; }
    throw new Error('Not found');
  },

  extendTrial: async (id: string, extraDays: number) => {
    await sleep(400);
    const item = mockSubscriptionsList.find(s => s.id === id);
    if (item) {
      const exp = new Date(item.expiresAt);
      exp.setDate(exp.getDate() + extraDays);
      item.expiresAt = exp.toISOString().split('T')[0];
      item.status = 'trial';
      return item;
    }
    throw new Error('Not found');
  },

  cancel: async (id: string) => {
    await sleep(400);
    const item = mockSubscriptionsList.find(s => s.id === id);
    if (item) { item.status = 'cancelled'; item.autoRenew = false; return item; }
    throw new Error('Not found');
  },
};

export const superAdminUsageService = {
  getOverview: async () => { await sleep(350); return mockUsageStats; },
  getTenantUsage: async (params?: import('../types').FilterParams) => {
    await sleep(300);
    let list = [...mockUsageStats.tenantUsage];
    if (params?.search) { const q = (params.search as string).toLowerCase(); list = list.filter(t => t.collegeName.toLowerCase().includes(q)); }
    if (params?.status && params.status !== 'all') list = list.filter(t => t.status === params.status);
    return list;
  },
  grantBonusCredits: async (collegeId: string, bonusCredits: number, _reason?: string) => {
    await sleep(500);
    const item = mockUsageStats.tenantUsage.find(t => t.collegeId === collegeId);
    if (item) { item.aiCreditsLimit += bonusCredits; return item; }
    throw new Error('Not found');
  },
  resetUsageCounter: async (collegeId: string) => {
    await sleep(400);
    const item = mockUsageStats.tenantUsage.find(t => t.collegeId === collegeId);
    if (item) { item.aiCreditsUsed = 0; item.aiUsagePercent = 0; return item; }
    throw new Error('Not found');
  },
};

export const superAdminAnalyticsExtendedService = {
  getAnalyticsData: async (_timeframe = '30d') => { await sleep(450); return mockSuperAdminAnalyticsData; },
  exportAnalyticsReport: async (format: 'pdf' | 'csv' | 'xlsx') => { await sleep(800); return { success: true, downloadUrl: `#export-${format}-${Date.now()}` }; },
};

export const superAdminAuditService = {
  getLogs: async (params?: import('../types').FilterParams) => {
    await sleep(350);
    let logs = [...mockAuditLogs];
    if (params?.search) { const q = (params.search as string).toLowerCase(); logs = logs.filter(l => l.action.toLowerCase().includes(q) || l.actor.name.toLowerCase().includes(q)); }
    if (params?.category && params.category !== 'all') logs = logs.filter(l => l.category === params.category);
    if (params?.severity && params.severity !== 'all') logs = logs.filter(l => l.severity === params.severity);
    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 15;
    const start = (page - 1) * limit;
    return { data: logs.slice(start, start + limit), total: logs.length, page, limit, totalPages: Math.ceil(logs.length / limit) };
  },
  getStats: async () => {
    await sleep(250);
    return { total: mockAuditLogs.length, todayCount: 8, securityCount: 5, authCount: 23, systemCount: 12 };
  },
  exportLogs: async (format: 'json' | 'csv') => { await sleep(600); return { success: true, count: mockAuditLogs.length, format }; },
};

export const superAdminSettingsService = {
  getSettings: async () => { await sleep(300); return mockPlatformSettings; },
  updateSettings: async <K extends keyof typeof mockPlatformSettings>(section: K, updates: Partial<typeof mockPlatformSettings[K]>) => {
    await sleep(600);
    Object.assign(mockPlatformSettings[section], updates);
    return mockPlatformSettings[section];
  },
  triggerDatabaseBackup: async () => { await sleep(1500); return { success: true, timestamp: new Date().toISOString(), size: '14.8 GB', location: 's3://aicampus-backups/daily/db_prod_backup.tar.gz' }; },
  flushCache: async () => { await sleep(800); return { success: true, keysCleared: 14250, freedMemoryMB: 384 }; },
};

export const programService = {
  getAll: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      const res = await api<{ success: boolean; data: import('../types').Program[] }>('/programs', { params, auth: false });
      return (res.data || []).map(normalizeProgram);
    } catch (err) {
      console.warn('Backend /programs failed, using store cache:', err);
      return [];
    }
  },
  getById: async (id: string) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>(`/programs/${id}`, { auth: false });
    return normalizeProgram(res.data);
  },
  create: async (data: Partial<import('../types').Program>) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>('/programs', {
      method: 'POST',
      body: data,
    });
    return normalizeProgram(res.data);
  },
  update: async (id: string, data: Partial<import('../types').Program>) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>(`/programs/${id}`, {
      method: 'PUT',
      body: data,
    });
    return normalizeProgram(res.data);
  },
  delete: async (id: string) => {
    const res = await api<{ success: boolean; message: string }>(`/programs/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
  togglePublish: async (id: string) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>(`/programs/${id}/publish`, {
      method: 'PATCH',
    });
    return normalizeProgram(res.data);
  },
};

// ─── Upload Service ───────────────────────────────────────────────────────────

export const uploadService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // We cannot use the default api() wrapper easily because it sets Content-Type: application/json
    // So we fetch directly
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    const endpoint = token ? `${API_BASE}/upload` : `${API_BASE}/upload/public`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'File upload failed');
    return data.data as { url: string; filename: string; mimetype: string; size: number };
  }
};

// ─── Community Service ────────────────────────────────────────────────────────

export const communityService = {
  getFeed: async () => {
    const res = await api<{ data: any[] }>('/community/feed');
    return res.data;
  },
  createPost: async (postData: { title?: string; content: string; type: string; hashtags?: string[]; bullets?: string[]; media?: string[] }) => {
    const res = await api<{ data: any }>('/community/feed', {
      method: 'POST',
      body: postData,
    });
    return res.data;
  },
  deletePost: async (postId: string) => {
    const res = await api<{ success: boolean }>(`/community/feed/${postId}`, {
      method: 'DELETE',
    });
    return res;
  },
  getConnections: async () => {
    const res = await api<{ data: any[] }>('/community/connections');
    return res.data;
  },
  createConnectionRequest: async (recipientId: string) => {
    const res = await api<{ data: any }>('/community/connections', {
      method: 'POST',
      body: { recipientId },
    });
    return res.data;
  },
  updateConnectionRequest: async (connectionId: string, status: 'accepted' | 'rejected') => {
    const res = await api<{ data: any }>(`/community/connections/${connectionId}`, {
      method: 'PATCH',
      body: { status },
    });
    return res.data;
  },
  removeConnection: async (connectionId: string) => {
    return api(`/community/connections/${connectionId}`, { method: 'DELETE' });
  },
  getConversations: async () => {
    const res = await api<{ data: any[] }>('/community/conversations');
    return res.data;
  },
  createConversation: async (userId: string) => {
    const res = await api<{ data: any }>('/community/conversations', {
      method: 'POST',
      body: { userId },
    });
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api<{ data: { count: number } }>('/community/messages/unread');
    return res.data.count;
  },
  getMessages: async (conversationId: string) => {
    const res = await api<{ data: any[] }>(`/community/messages/${conversationId}`);
    return res.data;
  },
  sendMessage: async (
    conversationId: string,
    content: string,
    attachment?: { url: string; name?: string; type?: 'image' | 'file'; size?: number }
  ) => {
    const res = await api<{ data: any }>('/community/messages', {
      method: 'POST',
      body: { conversationId, content, attachment },
    });
    return res.data;
  },
  getGroups: async () => {
    const res = await api<{ data: any[] }>('/community/groups');
    return res.data;
  },
  createGroup: async (name: string, description: string) => {
    const res = await api<{ data: any }>('/community/groups', {
      method: 'POST',
      body: { name, description },
    });
    return res.data;
  },
  getGroupById: async (id: string) => {
    const res = await api<{ data: any }>(`/community/groups/${id}`);
    return res.data;
  },
  joinGroup: async (id: string) => {
    const res = await api<{ data: any }>(`/community/groups/${id}/join`, {
      method: 'POST'
    });
    return res.data;
  },
  leaveGroup: async (id: string) => {
    const res = await api<{ data: any }>(`/community/groups/${id}/leave`, {
      method: 'POST'
    });
    return res.data;
  },
  getEvents: async () => {
    const res = await api<{ data: any[] }>('/community/events');
    return res.data;
  },
  createEvent: async (data: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    type: 'Webinar' | 'Orientation' | 'Masterclass';
    speaker: string;
    speakerRole?: string;
    speakerAvatar?: string;
    image?: string;
  }) => {
    const res = await api<{ data: any }>('/community/events', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },
  updateEvent: async (id: string, data: Partial<{
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    type: 'Webinar' | 'Orientation' | 'Masterclass';
    speaker: string;
    speakerRole?: string;
    speakerAvatar?: string;
    image?: string;
  }>) => {
    const res = await api<{ data: any }>(`/community/events/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.data;
  },
  registerForEvent: async (id: string) => {
    const res = await api<{ data: any }>(`/community/events/${id}/register`, {
      method: 'POST',
    });
    return res.data;
  },
  deleteEvent: async (id: string) => {
    return api(`/community/events/${id}`, { method: 'DELETE' });
  },
  exploreStudents: async () => {
    const res = await api<{ data: any[] }>('/community/explore-students');
    return res.data;
  },
  getOpportunities: async () => {
    const res = await api<{ data: any[] }>('/community/opportunities');
    return res.data;
  }
};

// ─── Email Service (Backend Integration) ──────────────────────────────────────
export const emailApi = {
  sendTest: async (to: string) => {
    return api<{ success: boolean; message: string }>('/email/test', {
      method: 'POST',
      body: { to },
      auth: false,
    });
  },
  contactSales: async (data: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    role?: string;
    message?: string;
  }) => {
    return api<{ success: boolean; message: string }>('/email/contact-sales', {
      method: 'POST',
      body: data,
      auth: false,
    });
  },
};

export * from './payment.service';


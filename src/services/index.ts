// ─────────────────────────────────────────────────────────────────────────────
// AI PlacementOS — API Client
// Connects to real backend API at /api/* with JWT auth
// Falls back gracefully if backend is unavailable
// ─────────────────────────────────────────────────────────────────────────────
import { mockPlatformStats, mockPlatformCharts } from '../mock/data';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

  resetPassword: async (token: string, password: string) => {
    return api('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false });
  },

  getMe: async () => {
    const res = await api<{ data: unknown }>('/auth/me');
    return res.data as import('../types').User;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
  },
};

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  getAll: async (params?: import('../types').FilterParams & { role?: string, status?: string }) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').User> & { stats?: any } }>('/users', {
      params: params as Record<string, string>,
      auth: true,
    });
    return res; // returns { data, stats, success }
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
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Job> }>('/jobs', { params: params as Record<string, string>, auth: false });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Job }>(`/jobs/${id}`, { auth: false });
    return res.data;
  },

  create: async (data: Partial<import('../types').Job>) => {
    const res = await api<{ data: import('../types').Job }>('/jobs', { method: 'POST', body: data, auth: false });
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
};

// ─── Company Service ──────────────────────────────────────────────────────────

export const companyService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PaginatedResponse<import('../types').Company> }>('/companies', {
      params: params as Record<string, string>,
      auth: false,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').Company }>(`/companies/${id}`, { auth: false });
    return res.data;
  },

  create: async (data: Partial<import('../types').Company>) => {
    const res = await api<{ data: import('../types').Company }>('/companies', { method: 'POST', body: data, auth: false });
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

  apply: async (jobId: string) => {
    const res = await api<{ data: import('../types').Application }>('/applications', {
      method: 'POST', body: { jobId }, auth: true,
    });
    return res.data;
  },

  updateStatus: async (id: string, status: string, recruiterNotes?: string) => {
    const res = await api<{ data: import('../types').Application }>(`/applications/${id}/status`, {
      method: 'PUT', body: { status, recruiterNotes }, auth: false,
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
    const res = await api<{ data: import('../types').Interview }>('/interviews', { method: 'POST', body: data, auth: false });
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api<{ data: import('../types').Interview }>(`/interviews/${id}/status`, {
      method: 'PUT', body: { status }, auth: false,
    });
    return res.data;
  },

  checkConflicts: async (studentId: string, date: string, time: string) => {
    const res = await api<{ data: { hasConflict: boolean; conflictingInterview: import('../types').Interview | null } }>('/interviews/check-conflicts', {
      params: { studentId, date, time }, auth: false,
    });
    return res.data;
  },
};

// ─── Drive Service ────────────────────────────────────────────────────────────

export const driveService = {
  getAll: async (params?: import('../types').FilterParams) => {
    const res = await api<{ data: import('../types').PlacementDrive[] }>('/drives', { params: params as Record<string, string>, auth: false });
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

export const collegeService = {
  getAll: async (params?: import('../types').FilterParams) => {
    try {
      const res = await api<{ data: import('../types').PaginatedResponse<import('../types').College> }>('/colleges', {
        params: params as Record<string, string>,
        auth: false,
      });
      return res.data;
    } catch (err) {
      console.warn('Failed to fetch colleges from API:', err);
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },

  getById: async (id: string) => {
    const res = await api<{ data: import('../types').College }>(`/colleges/${id}`);
    return res.data;
  },

  create: async (data: {
    name: string;
    code: string;
    city: string;
    state?: string;
    establishedYear?: number;
    tpoName: string;
    tpoEmail: string;
    tpoPhone?: string;
    password?: string;
    plan?: string;
  }) => {
    const res = await api<{ data: { college: import('../types').College; adminUser: unknown } }>('/colleges', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  update: async (id: string, updates: Partial<import('../types').College>) => {
    const res = await api<{ data: import('../types').College }>(`/colleges/${id}`, {
      method: 'PUT',
      body: updates,
    });
    return res.data;
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

export const aiService = {
  getMatchScore: async (studentId: string, jobId: string) => {
    await sleep(800);
    return {
      studentId,
      jobId,
      overallScore: 78,
      breakdown: { skillMatch: 82, educationMatch: 100, cgpaMatch: 95, certificationMatch: 75, locationMatch: 80, preferenceMatch: 70 },
      matchedSkills: ['Java', 'Spring Boot', 'SQL'],
      missingSkills: ['Docker', 'Kubernetes'],
      recommendation: 'suitable' as const,
      explanation: 'Good match based on your skills and education.',
      strengths: ['Java', 'Spring Boot', 'SQL'],
      concerns: ['Missing Docker knowledge'],
    };
  },

  chat: async (message: string, _role: string): Promise<{ content: string; richContent?: unknown }> => {
    await sleep(1200);
    return { content: `I understand you're asking about "${message}". Let me analyze the placement data for you. Please connect to our AI service for detailed insights.` };
  },

  analyzeResume: async (file: File | string, targetRole: string = 'Full Stack Developer') => {
    await sleep(2000);
    const fileName = typeof file === 'string' ? file : file.name;
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

    let extractedName = 'Not Found';
    let extractedEmail = 'Not Found';
    let extractedPhone = 'Not Found';
    let extractedSkills: string[] = [];

    if (typeof file !== 'string') {
      try {
        console.log("Starting backend API call for resume parsing with file:", file.name);
        const form = new FormData();
        form.append("resume", file, file.name);

        const response = await fetch(`${API_BASE}/ats/parse-resume`, {
            method: "POST",
            headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
            body: form,
        });
        
        console.log("Backend response status:", response.status);

        if (response.ok) {
          const json = await response.json();
          // The backend wraps the response in { success: true, data: result }
          // And Affinda's result itself is { data: { ... }, meta: { ... } }
          const affindaData = json.data?.data || json.data || {};
          console.log("Backend extracted data:", affindaData);
          
          const person = affindaData?.person || {};
          const nameObj = person?.name || affindaData?.name || {};
          const contact = affindaData?.contact || {};
          
          let extractedNameCandidate = nameObj?.formatted || nameObj?.raw || nameObj?.first;
          if (!extractedNameCandidate && nameObj?.given) {
            extractedNameCandidate = `${nameObj.given} ${nameObj.family || ''}`.trim();
          }
          
          // Validation to ensure this is actually a resume
          const hasSkills = affindaData?.skills && affindaData.skills.length > 0;
          const hasWork = affindaData?.workExperience && affindaData.workExperience.length > 0;
          const hasEducation = affindaData?.education && affindaData.education.length > 0;
          const hasName = extractedNameCandidate;
          
          if (!hasSkills && !hasWork && !hasEducation && !hasName) {
            throw new Error("The uploaded file does not appear to be a valid resume. Please upload a standard resume document.");
          }
          
          extractedName = hasName || extractedName;
          
          const emails = contact?.emails || person?.emails || affindaData?.emails || [];
          extractedEmail = typeof emails?.[0] === 'string' ? emails[0] : (emails?.[0]?.email || extractedEmail);
          
          const phones = contact?.phoneNumbers || person?.phoneNumbers || affindaData?.phoneNumbers || [];
          extractedPhone = phones?.[0]?.formatted || phones?.[0]?.raw || (typeof phones?.[0] === 'string' ? phones[0] : extractedPhone);
          
          if (affindaData?.skills && Array.isArray(affindaData.skills)) {
            extractedSkills = affindaData.skills.map((s: any) => typeof s === 'string' ? s : (s.name || '')).filter(Boolean);
            console.log("Extracted skills array:", extractedSkills);
          }
        } else {
          const errText = await response.text();
          console.error("Backend ATS API error response:", errText);
          throw new Error("Failed to parse resume from backend API.");
        }
      } catch (err: any) {
        console.error("Error calling backend ATS API:", err);
        throw new Error(err.message || "Failed to process resume parsing.");
      }
    }

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
    await sleep(700);
    const targetSkills: Record<string, string[]> = {
      'Software Engineer': ['Java', 'Spring Boot', 'SQL', 'Git', 'REST API', 'Docker', 'System Design'],
      'Data Analyst': ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics', 'Power BI', 'Machine Learning'],
    };
    const required = targetSkills[targetRole] || targetSkills['Software Engineer'];
    return {
      studentId, targetRole,
      currentSkills: ['Java', 'Spring Boot', 'SQL', 'Git'],
      requiredSkills: required,
      matchedSkills: ['Java', 'Spring Boot', 'SQL'],
      missingSkills: required.filter(s => !['Java', 'Spring Boot', 'SQL', 'Git'].includes(s)),
      matchPercent: 65,
      learningResources: [],
    };
  },

  getPlacementReadiness: async (studentId?: string) => {
    await sleep(1500);
    return {
      overallScore: 76,
      breakdown: { resume: 85, skills: 72, projects: 68, certifications: 75, communication: 70, interviewReadiness: 65 },
      strengths: ['Strong technical foundation', 'Good CGPA'],
      weaknesses: ['Limited project diversity'],
      recommendations: ['Complete your resume', 'Add 2 more projects', 'Take an AWS certification'],
      improvementTimeline: [
        { week: 1, action: 'Upload and optimize resume', expectedGain: 8 },
        { week: 2, action: 'Complete missing profile sections', expectedGain: 5 },
      ],
    };
  },

  getMockInterviewQuestion: async (company: string, round: string) => {
    await sleep(500);
    const questions: Record<string, string[]> = {
      technical: ['Explain the difference between process and thread.', 'What is the time complexity of quicksort?'],
      hr: [`Tell me about yourself.`, `Why do you want to work at ${company}?`],
      coding: ['Given an array, find two numbers that add up to a target.', 'Check if a string is a palindrome.'],
    };
    const set = questions[round] || questions.technical;
    return set[Math.floor(Math.random() * set.length)];
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
  triggerDatabaseBackup: async () => { await sleep(1500); return { success: true, timestamp: new Date().toISOString(), size: '14.8 GB', location: 's3://placementos-backups/daily/db_prod_backup.tar.gz' }; },
  flushCache: async () => { await sleep(800); return { success: true, keysCleared: 14250, freedMemoryMB: 384 }; },
};

export const programService = {
  getAll: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      const res = await api<{ success: boolean; data: import('../types').Program[] }>('/programs', { params, auth: false });
      return res.data;
    } catch (err) {
      console.warn('Backend /programs failed, using store cache:', err);
      return [];
    }
  },
  getById: async (id: string) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>(`/programs/${id}`, { auth: false });
    return res.data;
  },
  create: async (data: Partial<import('../types').Program>) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>('/programs', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },
  update: async (id: string, data: Partial<import('../types').Program>) => {
    const res = await api<{ success: boolean; data: import('../types').Program }>(`/programs/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.data;
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
    return res.data;
  },
};

// ─── Upload Service ───────────────────────────────────────────────────────────

export const uploadService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // We cannot use the default api() wrapper easily because it sets Content-Type: application/json
    // So we fetch directly
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'File upload failed');
    return data.data as { url: string; filename: string; mimetype: string; size: number };
  }
};


import { sleep } from '../utils';
import {
  mockStudents, mockCompanies, mockJobs, mockApplications,
  mockInterviews, mockDrives, mockColleges, mockDepartments,
  mockNotifications, mockPlatformStats, mockCollegeAnalytics,
  mockPlatformCharts, mockAuditLogs, mockSubscriptionsList,
  mockUsageStats, mockSuperAdminAnalyticsData, mockPlatformSettings,
} from '../mock/data';
import { DEMO_USERS } from '../store';
import type { Role, User, FilterParams, PaginatedResponse, Department } from '../types';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, _password: string): Promise<{ user: User; token: string }> => {
    await sleep(800);
    const roleMap: Record<string, Role> = {
      'admin@placementos.ai': 'SUPER_ADMIN',
      'tpo@rvce.edu.in': 'COLLEGE_ADMIN',
      'tpo2@rvce.edu.in': 'TPO',
      'hr@infosys.com': 'RECRUITER',
      'arjun.sharma@rvce.edu.in': 'STUDENT',
    };
    const role = roleMap[email] || 'STUDENT';
    const user = DEMO_USERS[role];
    return { user, token: `mock-token-${role}-${Date.now()}` };
  },

  register: async (data: { name: string; email: string; password: string; role: Role }): Promise<{ user: User; token: string }> => {
    await sleep(1000);
    const user: User = {
      id: `user-new-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return { user, token: `mock-token-${Date.now()}` };
  },

  forgotPassword: async (_email: string): Promise<void> => {
    await sleep(700);
  },

  resetPassword: async (_token: string, _password: string): Promise<void> => {
    await sleep(700);
  },
};

// ─── Student Service ──────────────────────────────────────────────────────────

export const studentService = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<typeof mockStudents[0]>> => {
    await sleep(400);
    let data = [...mockStudents];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    if (params?.department) data = data.filter(s => s.department === params.department);
    if (params?.placementStatus) data = data.filter(s => s.placementStatus === params.placementStatus);
    if (params?.isEligible !== undefined) data = data.filter(s => s.isEligible === params.isEligible);

    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 20;
    const start = (page - 1) * limit;

    return {
      data: data.slice(start, start + limit),
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit),
    };
  },

  getById: async (id: string) => {
    await sleep(300);
    return mockStudents.find(s => s.id === id) || mockStudents[0];
  },

  update: async (id: string, updates: Partial<typeof mockStudents[0]>) => {
    await sleep(500);
    const idx = mockStudents.findIndex(s => s.id === id);
    if (idx !== -1) Object.assign(mockStudents[idx], updates);
    return mockStudents[idx] || mockStudents[0];
  },

  create: async (data: Partial<typeof mockStudents[0]>) => {
    await sleep(600);
    const cgpa = data.cgpa || 0;
    const isEligible = cgpa >= 6.5;
    
    let departmentId = data.departmentId || '';
    if (!departmentId && data.department) {
      const idx = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'MCA', 'MBA'].indexOf(data.department);
      departmentId = idx !== -1 ? `dept-${idx + 1}` : 'dept-1';
    }

    const newStudent = {
      id: `student-${Date.now()}`,
      userId: `user-student-${Date.now()}`,
      collegeId: data.collegeId || 'college-1',
      studentId: data.studentId || `1RV21${data.department?.substring(0, 2) || 'CS'}${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      department: data.department || 'CSE',
      departmentId,
      batch: data.batch || '2025',
      degree: data.degree || 'B.E.',
      cgpa,
      backlogs: data.backlogs || 0,
      gender: data.gender || 'male',
      dob: data.dob || '2003-01-01',
      address: data.address || { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      skills: data.skills || [],
      certifications: data.certifications || [],
      projects: data.projects || [],
      education: data.education || [
        {
          id: `edu-${Date.now()}-1`,
          level: 'graduation' as const,
          institution: 'RV College of Engineering',
          degree: data.degree || 'B.E.',
          specialization: data.department || 'CSE',
          score: cgpa,
          scoreType: 'cgpa' as const,
          yearOfPassing: parseInt(data.batch || '2025') || 2025,
          location: 'Bengaluru',
        }
      ],
      experience: data.experience || [],
      profileCompletion: data.profileCompletion || 50,
      placementStatus: data.placementStatus || 'not_placed',
      isEligible,
      placementReadinessScore: data.placementReadinessScore || 65,
      applications: 0,
      interviews: 0,
      createdAt: new Date().toISOString().split('T')[0],
    } as typeof mockStudents[0];
    
    mockStudents.unshift(newStudent);
    return newStudent;
  },

  delete: async (_id: string) => {
    await sleep(400);
  },

  importBulk: async (_file: File): Promise<{ success: number; errors: number }> => {
    await sleep(2000);
    return { success: 45, errors: 3 };
  },

  getStats: async (_collegeId: string) => {
    await sleep(300);
    return {
      total: mockStudents.length,
      eligible: mockStudents.filter(s => s.isEligible).length,
      placed: mockStudents.filter(s => s.placementStatus === 'placed').length,
      withResume: mockStudents.filter(s => !!s.resume).length,
      avgCgpa: mockStudents.reduce((sum, s) => sum + s.cgpa, 0) / mockStudents.length,
      profileComplete: mockStudents.filter(s => s.profileCompletion >= 80).length,
    };
  },
};

// ─── Job Service ──────────────────────────────────────────────────────────────

export const jobService = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<typeof mockJobs[0]>> => {
    await sleep(350);
    let data = [...mockJobs];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      data = data.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.name.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    if (params?.status) data = data.filter(j => j.status === params.status);
    if (params?.type) data = data.filter(j => j.type === params.type);

    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 20;
    const start = (page - 1) * limit;

    return {
      data: data.slice(start, start + limit),
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit),
    };
  },

  getById: async (id: string) => {
    await sleep(250);
    return mockJobs.find(j => j.id === id) || mockJobs[0];
  },

  create: async (data: Partial<typeof mockJobs[0]>) => {
    await sleep(700);
    return { id: `job-${Date.now()}`, ...data, status: 'draft' as const };
  },

  update: async (id: string, updates: Partial<typeof mockJobs[0]>) => {
    await sleep(400);
    const idx = mockJobs.findIndex(j => j.id === id);
    if (idx !== -1) Object.assign(mockJobs[idx], updates);
    return mockJobs[idx] || mockJobs[0];
  },

  getRecommendedForStudent: async (_studentId: string) => {
    await sleep(600);
    return mockJobs
      .filter(j => j.status === 'active')
      .slice(0, 10)
      .map(j => ({
        ...j,
        matchScore: 70 + Math.floor(Math.random() * 25),
        aiExplanation: `Your Java and Spring Boot skills align well with this role. Your CGPA of 8.5 exceeds the minimum requirement of ${j.eligibility.minCgpa}.`,
      }));
  },
};

// ─── Company Service ──────────────────────────────────────────────────────────

export const companyService = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<typeof mockCompanies[0]>> => {
    await sleep(350);
    let data = [...mockCompanies];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.hq.toLowerCase().includes(q));
    }
    if (params?.type && params.type !== 'all') {
      data = data.filter(c => c.type === params.type);
    }
    if (params?.status && params.status !== 'all') {
      if (params.status === 'active') data = data.filter(c => c.isActive);
      if (params.status === 'tied') data = data.filter(c => c.isTied);
      if (params.status === 'inactive') data = data.filter(c => !c.isActive);
    }

    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 10;
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) || 1 };
  },

  getById: async (id: string) => {
    await sleep(250);
    return mockCompanies.find(c => c.id === id) || mockCompanies[0];
  },

  create: async (data: Partial<typeof mockCompanies[0]>) => {
    await sleep(600);
    const newCompany = {
      id: `company-${Date.now()}`,
      name: data.name || '',
      industry: data.industry || 'Technology',
      type: data.type || 'product',
      size: data.size || 'medium',
      hq: data.hq || 'Bengaluru',
      description: data.description || '',
      website: data.website || '',
      founded: data.founded || 2020,
      techStack: data.techStack || ['Java', 'React', 'Python'],
      activeJobs: 1,
      totalHired: 0,
      avgPackage: data.avgPackage || 8.0,
      highestPackage: data.highestPackage || 18.0,
      recruiters: [],
      isActive: true,
      isTied: data.isTied !== undefined ? data.isTied : true,
      colleges: ['college-1'],
      createdAt: new Date().toISOString().split('T')[0],
    } as typeof mockCompanies[0];
    mockCompanies.unshift(newCompany);
    return newCompany;
  },

  update: async (id: string, updates: Partial<typeof mockCompanies[0]>) => {
    await sleep(400);
    const idx = mockCompanies.findIndex(c => c.id === id);
    if (idx !== -1) {
      Object.assign(mockCompanies[idx], updates);
      return mockCompanies[idx];
    }
    throw new Error('Company not found');
  },

  toggleStatus: async (id: string) => {
    await sleep(300);
    const item = mockCompanies.find(c => c.id === id);
    if (item) {
      item.isActive = !item.isActive;
      return item;
    }
    throw new Error('Company not found');
  },

  toggleTiedStatus: async (id: string) => {
    await sleep(300);
    const item = mockCompanies.find(c => c.id === id);
    if (item) {
      item.isTied = !item.isTied;
      return item;
    }
    throw new Error('Company not found');
  },

  delete: async (id: string) => {
    await sleep(400);
    const idx = mockCompanies.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockCompanies.splice(idx, 1);
    }
  },
};

// ─── Application Service ──────────────────────────────────────────────────────

export const applicationService = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<typeof mockApplications[0]>> => {
    await sleep(400);
    let data = [...mockApplications];
    if (params?.studentId) data = data.filter(a => a.studentId === params.studentId);
    if (params?.jobId) data = data.filter(a => a.jobId === params.jobId);
    if (params?.status) data = data.filter(a => a.status === params.status);
    if (params?.companyId) data = data.filter(a => a.companyId === params.companyId);

    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 20;
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) };
  },

  getById: async (id: string) => {
    await sleep(250);
    return mockApplications.find(a => a.id === id) || mockApplications[0];
  },

  apply: async (studentId: string, jobId: string) => {
    await sleep(600);
    return {
      id: `application-${Date.now()}`,
      studentId,
      jobId,
      status: 'applied' as const,
      appliedAt: new Date().toISOString(),
    };
  },

  updateStatus: async (id: string, status: string) => {
    await sleep(400);
    const idx = mockApplications.findIndex(a => a.id === id);
    if (idx !== -1) Object.assign(mockApplications[idx], { status, updatedAt: new Date().toISOString() });
    return mockApplications[idx];
  },
};

// ─── Interview Service ────────────────────────────────────────────────────────

export const interviewService = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<typeof mockInterviews[0]>> => {
    await sleep(350);
    let data = [...mockInterviews];
    if (params?.studentId) data = data.filter(i => i.studentId === params.studentId);
    if (params?.status) data = data.filter(i => i.status === params.status);
    if (params?.date) data = data.filter(i => i.date === params.date);

    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 20;
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) };
  },

  getById: async (id: string) => {
    await sleep(250);
    return mockInterviews.find(i => i.id === id) || mockInterviews[0];
  },

  schedule: async (data: Partial<typeof mockInterviews[0]>) => {
    await sleep(700);
    return { id: `interview-${Date.now()}`, ...data, status: 'scheduled' as const };
  },

  updateStatus: async (id: string, status: string) => {
    await sleep(400);
    const idx = mockInterviews.findIndex(i => i.id === id);
    if (idx !== -1) Object.assign(mockInterviews[idx], { status });
    return mockInterviews[idx];
  },

  checkConflicts: async (_studentId: string, date: string, time: string) => {
    await sleep(300);
    // Simulate conflict detection
    const conflict = mockInterviews.find(i => i.date === date && i.time === time);
    return conflict ? { hasConflict: true, conflictingInterview: conflict } : { hasConflict: false };
  },
};

// ─── Drive Service ────────────────────────────────────────────────────────────

export const driveService = {
  getAll: async (params?: FilterParams) => {
    await sleep(350);
    let data = [...mockDrives];
    if (params?.status) data = data.filter(d => d.status === params.status);
    if (params?.collegeId) data = data.filter(d => d.collegeId === params.collegeId);
    return data;
  },

  getById: async (id: string) => {
    await sleep(250);
    return mockDrives.find(d => d.id === id) || mockDrives[0];
  },

  create: async (data: Partial<typeof mockDrives[0]>) => {
    await sleep(700);
    return { id: `drive-${Date.now()}`, ...data } as typeof mockDrives[0];
  },
};

// ─── AI Service ───────────────────────────────────────────────────────────────

export const aiService = {
  getMatchScore: async (studentId: string, jobId: string) => {
    await sleep(800);
    const student = mockStudents.find(s => s.id === studentId) || mockStudents[0];
    const job = mockJobs.find(j => j.id === jobId) || mockJobs[0];
    const matchedSkills = student.skills.filter(s => job.skills.includes(s));
    const missingSkills = job.skills.filter(s => !student.skills.includes(s));
    const skillMatch = Math.round((matchedSkills.length / Math.max(job.skills.length, 1)) * 100);
    const cgpaMatch = student.cgpa >= job.eligibility.minCgpa ? 100 : Math.round((student.cgpa / job.eligibility.minCgpa) * 100);
    const educationMatch = job.eligibility.branches.includes(student.department) ? 100 : 0;
    const certMatch = 70 + Math.floor(Math.random() * 30);
    const locationMatch = student.preferredLocations.includes(job.location) ? 100 : 70;
    const prefMatch = 75 + Math.floor(Math.random() * 25);
    const overall = Math.round((skillMatch * 0.35 + educationMatch * 0.2 + cgpaMatch * 0.2 + certMatch * 0.1 + locationMatch * 0.1 + prefMatch * 0.05));

    return {
      studentId,
      jobId,
      overallScore: overall,
      breakdown: {
        skillMatch,
        educationMatch,
        cgpaMatch,
        certificationMatch: certMatch,
        locationMatch,
        preferenceMatch: prefMatch,
      },
      matchedSkills,
      missingSkills,
      recommendation: overall >= 85 ? 'highly_suitable' : overall >= 70 ? 'suitable' : overall >= 55 ? 'moderate' : 'not_suitable',
      explanation: `${student.name} is a ${overall >= 85 ? 'highly' : 'moderately'} suitable candidate for the ${job.title} role at ${job.company.name}.`,
      strengths: matchedSkills.slice(0, 3),
      concerns: missingSkills.length > 0 ? [`Missing: ${missingSkills.slice(0, 2).join(', ')}`] : [],
    };
  },

  chat: async (message: string, role: 'college' | 'student' | 'recruiter'): Promise<{ content: string; richContent?: unknown }> => {
    await sleep(1200 + Math.random() * 800);

    const responses: Record<string, { content: string }> = {
      eligible: {
        content: `Based on current eligibility criteria, **126 students** are eligible for the upcoming placement drives.\n\n- **CSE**: 48 students\n- **ISE**: 32 students  \n- **ECE**: 28 students\n- **Others**: 18 students\n\nWould you like me to filter by specific department or CGPA threshold?`,
      },
      match: {
        content: `I found **23 students** with more than 90% AI match score for active jobs.\n\nTop matches:\n1. **Arjun Sharma** - 96% match with Google SDE role\n2. **Priya Nair** - 94% match with Amazon Backend Engineer\n3. **Rohan Verma** - 92% match with Microsoft SDE II\n\nShall I send them notifications about these opportunities?`,
      },
      placement: {
        content: `**CSE department** has the highest placement rate at **87.3%**, followed by:\n\n| Department | Placed | Rate |\n|-----------|--------|------|\n| CSE | 89/102 | 87.3% |\n| ISE | 76/92 | 82.6% |\n| ECE | 58/82 | 70.7% |\n| EEE | 42/72 | 58.3% |\n| ME | 31/68 | 45.6% |`,
      },
      resume: {
        content: `I found **12 students** who haven't uploaded their resumes yet:\n\n- 8 students from ECE department\n- 2 from ME department\n- 2 from Civil department\n\nShall I send them reminder notifications?`,
      },
      report: {
        content: `Generating **CSE Placement Report 2025**...\n\nReport includes:\n✅ Placement statistics\n✅ Department-wise breakdown\n✅ Top recruiters\n✅ Salary distribution\n✅ Month-over-month trends\n\nReport ready for download!`,
      },
      risk: {
        content: `I've identified **18 students at placement risk**:\n\n🔴 **High Risk (5 students)**: CGPA < 6.5, 0 applications\n🟡 **Medium Risk (8 students)**: No resume, profile < 60%\n🟢 **Low Risk (5 students)**: Resume uploaded but no applications\n\nWould you like me to send personalized action plans to these students?`,
      },
    };

    const lowerMsg = message.toLowerCase();
    if (role === 'college') {
      if (lowerMsg.includes('eligible')) return responses.eligible;
      if (lowerMsg.includes('90%') || lowerMsg.includes('match')) return responses.match;
      if (lowerMsg.includes('placement rate') || lowerMsg.includes('department')) return responses.placement;
      if (lowerMsg.includes('resume')) return responses.resume;
      if (lowerMsg.includes('report')) return responses.report;
      if (lowerMsg.includes('risk')) return responses.risk;
    }

    if (role === 'student') {
      if (lowerMsg.includes('eligible')) {
        return { content: `Based on your profile, you are eligible for **34 active jobs**.\n\nTop matches for you:\n1. **Java Developer** at Google - 94% match\n2. **Backend Engineer** at Amazon - 91% match\n3. **SDE** at Flipkart - 88% match\n\nWould you like to apply to any of these?` };
      }
      if (lowerMsg.includes('not eligible')) {
        return { content: `You are not eligible for that job because:\n\n❌ **Minimum CGPA required**: 8.0 (yours: 7.8)\n❌ **Branch not listed**: The company has not listed your branch\n\nHowever, I found **12 similar jobs** where you ARE eligible!` };
      }
      if (lowerMsg.includes('data analyst')) {
        return { content: `For a **Data Analyst** role, you should learn:\n\n**Missing skills:**\n- 📊 Python (Pandas, NumPy)\n- 📈 SQL (Advanced queries)\n- 📉 Tableau or Power BI\n- 🤖 Basic Machine Learning\n\n**Estimated time**: 8-12 weeks\n\nShall I create a personalized learning plan?` };
      }
      if (lowerMsg.includes('improve') || lowerMsg.includes('score')) {
        return { content: `Your **Placement Readiness Score is 76/100**. Here's how to improve:\n\n1. ✅ Upload resume (+10 points)\n2. 📝 Add 2 more projects (+8 points)\n3. 🏆 Get AWS certification (+7 points)\n4. 🔗 Complete LinkedIn profile (+5 points)\n\nExpected score after improvements: **92/100**` };
      }
    }

    return {
      content: `I understand you're asking about "${message}". Here's what I found:\n\nI've analyzed the data and can provide you with insights about students, jobs, and placement statistics. What specific information would be most helpful?`,
    };
  },

  analyzeResume: async (_file: File) => {
    await sleep(3000);
    return {
      overallScore: 82,
      atsScore: 74,
      sections: {
        skills: 90,
        projects: 75,
        atsKeywords: 65,
        formatting: 88,
        achievements: 55,
        experience: 60,
        education: 95,
      },
      strengths: ['Strong technical skills section', 'Well-structured education section', 'Good formatting'],
      weaknesses: ['Missing quantified achievements', 'No certifications listed'],
      missingSkills: ['Docker', 'Kubernetes', 'CI/CD', 'System Design'],
      missingKeywords: ['Agile', 'JIRA', 'Microservices', 'REST API'],
      suggestions: [
        'Add quantified metrics (e.g., "reduced load time by 40%")',
        'Include 2-3 technical certifications',
        'Add a professional summary section',
        'Use active voice in project descriptions',
        'Include GitHub link with active repositories',
      ],
      certificationRecommendations: ['AWS Cloud Practitioner', 'Google Associate Cloud Engineer'],
    };
  },

  getSkillGap: async (studentId: string, targetRole: string) => {
    await sleep(700);
    const student = mockStudents.find(s => s.id === studentId) || mockStudents[0];
    const targetSkills: Record<string, string[]> = {
      'Software Engineer': ['Java', 'Spring Boot', 'SQL', 'Git', 'REST API', 'Docker', 'System Design'],
      'Data Analyst': ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics', 'Power BI', 'Machine Learning'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Bash'],
      'Frontend Developer': ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML', 'Figma', 'REST API'],
    };
    const required = targetSkills[targetRole] || targetSkills['Software Engineer'];
    const matched = student.skills.filter(s => required.includes(s));
    const missing = required.filter(s => !student.skills.includes(s));

    return {
      studentId,
      targetRole,
      currentSkills: student.skills,
      requiredSkills: required,
      matchedSkills: matched,
      missingSkills: missing,
      matchPercent: Math.round((matched.length / required.length) * 100),
      learningResources: missing.map(skill => ({
        skill,
        courses: [
          { name: `${skill} Fundamentals`, platform: 'Coursera', duration: '4 weeks', isFree: false },
          { name: `Learn ${skill}`, platform: 'YouTube', duration: '8 hours', isFree: true },
        ],
        estimatedTime: '3-4 weeks',
      })),
    };
  },

  getPlacementReadiness: async (studentId: string) => {
    await sleep(500);
    const student = mockStudents.find(s => s.id === studentId) || mockStudents[0];
    return {
      studentId,
      overallScore: student.placementReadinessScore,
      breakdown: {
        resume: student.resume ? 85 + Math.floor(Math.random() * 15) : 0,
        skills: Math.round((student.skills.length / 15) * 100),
        projects: student.projects.length > 0 ? 70 + Math.floor(Math.random() * 30) : 20,
        certifications: student.certifications.length > 0 ? 75 + Math.floor(Math.random() * 25) : 30,
        communication: 65 + Math.floor(Math.random() * 30),
        interviewReadiness: 55 + Math.floor(Math.random() * 40),
      },
      strengths: ['Strong technical foundation', 'Good CGPA', 'Active on GitHub'],
      weaknesses: ['Limited project diversity', 'No internship experience'],
      recommendations: [
        'Complete your resume and get it AI-reviewed',
        'Add 2 more projects with quantified impact',
        'Take an AWS or Google Cloud certification',
        'Practice 50+ LeetCode problems',
        'Join mock interview sessions',
      ],
      improvementTimeline: [
        { week: 1, action: 'Upload and optimize resume', expectedGain: 8 },
        { week: 2, action: 'Complete missing profile sections', expectedGain: 5 },
        { week: 3, action: 'Add certification to profile', expectedGain: 7 },
        { week: 4, action: 'Complete 2 practice interviews', expectedGain: 6 },
      ],
    };
  },

  getMockInterviewQuestion: async (company: string, round: string) => {
    await sleep(500);
    const questions: Record<string, string[]> = {
      technical: [
        'Explain the difference between process and thread.',
        'What is the time complexity of quicksort in the worst case?',
        'Design a URL shortener like bit.ly. What are the key components?',
        'How would you optimize a slow SQL query?',
        'Explain the SOLID principles with examples.',
      ],
      hr: [
        'Tell me about yourself.',
        'Why do you want to work at ' + company + '?',
        'What are your greatest strengths and weaknesses?',
        'Describe a challenging project you worked on and how you handled it.',
        'Where do you see yourself in 5 years?',
      ],
      coding: [
        'Given an array of integers, find two numbers that add up to a target.',
        'Write a function to check if a string is a palindrome.',
        'Implement a stack using two queues.',
        'Find the maximum subarray sum (Kadane\'s algorithm).',
        'Reverse a linked list iteratively and recursively.',
      ],
    };

    const set = questions[round] || questions.technical;
    return set[Math.floor(Math.random() * set.length)];
  },
};

// ─── Analytics Service ────────────────────────────────────────────────────────

export const analyticsService = {
  getCollegeAnalytics: async (_collegeId: string) => {
    await sleep(500);
    return mockCollegeAnalytics;
  },

  getPlatformStats: async () => {
    await sleep(400);
    return mockPlatformStats;
  },

  getPlatformCharts: async () => {
    await sleep(500);
    return mockPlatformCharts;
  },

  getRecruitingFunnel: async (_companyId: string) => {
    await sleep(400);
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

// ─── College Service ──────────────────────────────────────────────────────────

export const collegeService = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<typeof mockColleges[0]>> => {
    await sleep(400);
    let data = [...mockColleges];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 20;
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) };
  },

  getById: async (id: string) => {
    await sleep(250);
    return mockColleges.find(c => c.id === id) || mockColleges[0];
  },

  create: async (data: Partial<typeof mockColleges[0]>) => {
    await sleep(700);
    return { id: `college-${Date.now()}`, ...data } as typeof mockColleges[0];
  },
};

// ─── Notification Service ─────────────────────────────────────────────────────

export const notificationService = {
  getAll: async (_userId: string) => {
    await sleep(300);
    return mockNotifications;
  },

  markRead: async (_id: string) => {
    await sleep(200);
  },

  markAllRead: async (_userId: string) => {
    await sleep(300);
  },
};

// ─── Department Service ───────────────────────────────────────────────────────

export const departmentService = {
  getAll: async (_collegeId: string) => {
    await sleep(300);
    return mockDepartments;
  },

  getById: async (id: string) => {
    await sleep(200);
    return mockDepartments.find(d => d.id === id) || mockDepartments[0];
  },

  create: async (data: Partial<Department>) => {
    await sleep(400);
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      collegeId: 'college-1',
      name: data.name || '',
      code: data.code || '',
      hod: data.hod || '',
      totalStudents: data.totalStudents || 0,
      eligibleStudents: data.eligibleStudents || 0,
      placedStudents: data.placedStudents || 0,
      placementPercent: data.totalStudents ? Math.round(((data.placedStudents || 0) / data.totalStudents) * 100) : 0,
      avgPackage: data.avgPackage || 0,
      topSkills: data.topSkills || [],
      activeJobs: data.activeJobs || 0,
    };
    mockDepartments.push(newDept);
    return newDept;
  },

  update: async (id: string, updates: Partial<Department>) => {
    await sleep(300);
    const idx = mockDepartments.findIndex(d => d.id === id);
    if (idx !== -1) {
      Object.assign(mockDepartments[idx], updates);
      const d = mockDepartments[idx];
      if (updates.placedStudents !== undefined || updates.totalStudents !== undefined) {
        d.placementPercent = d.totalStudents ? Math.round((d.placedStudents / d.totalStudents) * 100) : 0;
      }
      return d;
    }
    throw new Error('Department not found');
  },

  delete: async (id: string) => {
    await sleep(300);
    const idx = mockDepartments.findIndex(d => d.id === id);
    if (idx !== -1) {
      mockDepartments.splice(idx, 1);
    }
  },
};

// ─── Billing Service ──────────────────────────────────────────────────────────

export const billingService = {
  getPlans: async () => {
    await sleep(300);
    return [
      {
        id: 'starter' as const,
        name: 'Starter',
        price: 4999,
        annualPrice: 49990,
        studentsLimit: 500,
        aiCreditsLimit: 1000,
        recruitersLimit: 10,
        jobsLimit: 50,
        features: [
          'Up to 500 students',
          '10 recruiters',
          '50 active jobs',
          '1,000 AI credits/month',
          'Basic analytics',
          'Email support',
          'Student portal',
          'Recruiter portal',
        ],
      },
      {
        id: 'professional' as const,
        name: 'Professional',
        price: 12999,
        annualPrice: 129990,
        studentsLimit: 2000,
        aiCreditsLimit: 5000,
        recruitersLimit: 50,
        jobsLimit: 200,
        features: [
          'Up to 2,000 students',
          '50 recruiters',
          '200 active jobs',
          '5,000 AI credits/month',
          'Advanced analytics & reports',
          'AI Placement Officer',
          'Resume AI analysis',
          'Bulk student import',
          'Priority support',
          'Custom branding',
        ],
        isPopular: true,
      },
      {
        id: 'enterprise' as const,
        name: 'Enterprise',
        price: 29999,
        annualPrice: 299990,
        studentsLimit: 999999,
        aiCreditsLimit: 50000,
        recruitersLimit: 999,
        jobsLimit: 999,
        features: [
          'Unlimited students',
          'Unlimited recruiters',
          'Unlimited jobs',
          '50,000 AI credits/month',
          'Real-time analytics',
          'AI Placement Officer',
          'Full AI suite',
          'API access',
          'Custom integrations',
          'Dedicated account manager',
          'SLA guarantee',
          'On-premise option',
        ],
      },
    ];
  },

  getInvoices: async (_collegeId: string) => {
    await sleep(350);
    return Array.from({ length: 8 }, (_, i) => ({
      id: `inv-${i + 1}`,
      collegeId: 'college-1',
      amount: [4999, 12999, 29999][i % 3],
      status: i === 0 ? 'pending' as const : 'paid' as const,
      date: new Date(2025, 7 - i, 1).toISOString(),
      dueDate: new Date(2025, 8 - i, 1).toISOString(),
      plan: ['starter', 'professional', 'enterprise'][i % 3] as 'starter',
      period: `${new Date(2025, 7 - i, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    }));
  },
};

// ─── Super Admin Subscriptions Service ────────────────────────────────────────

export const superAdminSubscriptionService = {
  getAll: async (params?: FilterParams) => {
    await sleep(350);
    let list = [...mockSubscriptionsList];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      list = list.filter(s => s.collegeName.toLowerCase().includes(q) || s.collegeCode.toLowerCase().includes(q) || s.city.toLowerCase().includes(q));
    }
    if (params?.plan && params.plan !== 'all') {
      list = list.filter(s => s.plan === params.plan);
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter(s => s.status === params.status);
    }
    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 10;
    const start = (page - 1) * limit;

    return {
      data: list.slice(start, start + limit),
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit),
    };
  },

  getStats: async () => {
    await sleep(300);
    const active = mockSubscriptionsList.filter(s => s.status === 'active').length;
    const trial = mockSubscriptionsList.filter(s => s.status === 'trial').length;
    const expiring = mockSubscriptionsList.filter(s => s.status === 'expiring').length;
    const mrr = mockSubscriptionsList.reduce((acc, s) => acc + (s.billingCycle === 'annual' ? Math.round(s.amount / 12) : s.amount), 0);
    const enterpriseCount = mockSubscriptionsList.filter(s => s.plan === 'enterprise').length;
    
    return {
      total: mockSubscriptionsList.length,
      active,
      trial,
      expiring,
      mrr,
      enterpriseCount,
      arr: mrr * 12,
    };
  },

  updatePlan: async (id: string, updates: Partial<typeof mockSubscriptionsList[0]>) => {
    await sleep(500);
    const idx = mockSubscriptionsList.findIndex(s => s.id === id);
    if (idx !== -1) {
      Object.assign(mockSubscriptionsList[idx], updates);
      return mockSubscriptionsList[idx];
    }
    throw new Error('Subscription not found');
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
    throw new Error('Subscription not found');
  },

  cancel: async (id: string) => {
    await sleep(400);
    const item = mockSubscriptionsList.find(s => s.id === id);
    if (item) {
      item.status = 'cancelled';
      item.autoRenew = false;
      return item;
    }
    throw new Error('Subscription not found');
  },
};

// ─── Super Admin Usage Service ────────────────────────────────────────────────

export const superAdminUsageService = {
  getOverview: async () => {
    await sleep(350);
    return mockUsageStats;
  },

  getTenantUsage: async (params?: FilterParams) => {
    await sleep(300);
    let list = [...mockUsageStats.tenantUsage];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      list = list.filter(t => t.collegeName.toLowerCase().includes(q) || t.collegeCode.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter(t => t.status === params.status);
    }
    return list;
  },

  grantBonusCredits: async (collegeId: string, bonusCredits: number, _reason?: string) => {
    await sleep(500);
    const item = mockUsageStats.tenantUsage.find(t => t.collegeId === collegeId);
    if (item) {
      item.aiCreditsLimit += bonusCredits;
      item.aiUsagePercent = Math.round((item.aiCreditsUsed / item.aiCreditsLimit) * 100);
      if (item.aiUsagePercent < 75) item.status = 'normal';
      return item;
    }
    throw new Error('Tenant usage record not found');
  },

  resetUsageCounter: async (collegeId: string) => {
    await sleep(400);
    const item = mockUsageStats.tenantUsage.find(t => t.collegeId === collegeId);
    if (item) {
      item.aiCreditsUsed = 0;
      item.aiUsagePercent = 0;
      item.status = 'normal';
      return item;
    }
    throw new Error('Tenant usage record not found');
  },
};

// ─── Super Admin Analytics Service ─────────────────────────────────────────────

export const superAdminAnalyticsExtendedService = {
  getAnalyticsData: async (_timeframe = '30d') => {
    await sleep(450);
    return mockSuperAdminAnalyticsData;
  },

  exportAnalyticsReport: async (format: 'pdf' | 'csv' | 'xlsx') => {
    await sleep(800);
    return { success: true, downloadUrl: `#export-${format}-${Date.now()}` };
  },
};

// ─── Super Admin Audit Log Service ────────────────────────────────────────────

export const superAdminAuditService = {
  getLogs: async (params?: FilterParams) => {
    await sleep(350);
    let logs = [...mockAuditLogs];
    if (params?.search) {
      const q = (params.search as string).toLowerCase();
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.actor.name.toLowerCase().includes(q) ||
        l.actor.email.toLowerCase().includes(q) ||
        l.ipAddress.includes(q)
      );
    }
    if (params?.category && params.category !== 'all') {
      logs = logs.filter(l => l.category === params.category);
    }
    if (params?.severity && params.severity !== 'all') {
      logs = logs.filter(l => l.severity === params.severity);
    }
    const page = (params?.page as number) || 1;
    const limit = (params?.limit as number) || 15;
    const start = (page - 1) * limit;

    return {
      data: logs.slice(start, start + limit),
      total: logs.length,
      page,
      limit,
      totalPages: Math.ceil(logs.length / limit),
    };
  },

  getStats: async () => {
    await sleep(250);
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = mockAuditLogs.filter(l => l.timestamp.startsWith(today));
    const securityCount = mockAuditLogs.filter(l => l.category === 'Security' || l.severity === 'critical' || l.severity === 'security').length;
    const authCount = mockAuditLogs.filter(l => l.category === 'Authentication').length;
    const systemCount = mockAuditLogs.filter(l => l.category === 'System Config').length;

    return {
      total: mockAuditLogs.length,
      todayCount: todayLogs.length,
      securityCount,
      authCount,
      systemCount,
    };
  },

  exportLogs: async (format: 'json' | 'csv') => {
    await sleep(600);
    return { success: true, count: mockAuditLogs.length, format };
  },
};

// ─── Super Admin Settings Service ─────────────────────────────────────────────

export const superAdminSettingsService = {
  getSettings: async () => {
    await sleep(300);
    return mockPlatformSettings;
  },

  updateSettings: async <K extends keyof typeof mockPlatformSettings>(
    section: K,
    updates: Partial<typeof mockPlatformSettings[K]>
  ) => {
    await sleep(600);
    Object.assign(mockPlatformSettings[section], updates);
    return mockPlatformSettings[section];
  },

  triggerDatabaseBackup: async () => {
    await sleep(1500);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      size: '14.8 GB',
      location: 's3://placementos-backups/daily/db_prod_backup.tar.gz',
    };
  },

  flushCache: async () => {
    await sleep(800);
    return { success: true, keysCleared: 14250, freedMemoryMB: 384 };
  },
};


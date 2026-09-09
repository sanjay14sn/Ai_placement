// ─── Core Entity Types ───────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'TPO' | 'RECRUITER' | 'STUDENT';

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';

export type PlacementStatus = 'not_placed' | 'placed' | 'not_eligible' | 'opted_out';
export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'assessment'
  | 'technical'
  | 'hr'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type InterviewStatus = 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'completed' | 'cancelled';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'expired';
export type DriveStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  tenantId?: string; // collegeId for college users
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── College / Tenant ────────────────────────────────────────────────────────

export interface College {
  id: string;
  name: string;
  code: string;
  logo?: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  phone: string;
  email: string;
  establishedYear: number;
  affiliation: string; // VTU, Anna University, etc.
  type: 'engineering' | 'arts' | 'commerce' | 'medical' | 'law' | 'management';
  totalStudents: number;
  departments: string[];
  tpoName: string;
  tpoEmail: string;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: string;
    studentsLimit: number;
    studentsUsed: number;
    aiCreditsLimit: number;
    aiCreditsUsed: number;
    recruitersLimit: number;
    recruitersUsed: number;
    jobsLimit: number;
    jobsUsed: number;
  };
  stats: {
    totalStudents: number;
    eligibleStudents: number;
    placedStudents: number;
    placementPercent: number;
    activeJobs: number;
    totalApplications: number;
    totalInterviews: number;
    avgPackage: number;
    highestPackage: number;
  };
  isActive: boolean;
  createdAt: string;
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  collegeId: string;
  name: string;
  code: string; // CSE, ISE, ECE, etc.
  hod: string;
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  placementPercent: number;
  avgPackage: number;
  topSkills: string[];
  activeJobs: number;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  collegeId: string;
  userId: string;
  studentId: string; // college roll number
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  departmentId: string;
  batch: string; // 2024, 2025
  degree: string; // B.E., B.Tech, MCA
  cgpa: number;
  backlogs: number;
  gender: 'male' | 'female' | 'other';
  dob: string;
  address: {
    city: string;
    state: string;
    pincode: string;
  };
  skills: string[];
  certifications: Certification[];
  projects: Project[];
  education: Education[];
  experience: Experience[];
  resume?: Resume;
  profileCompletion: number;
  placementStatus: PlacementStatus;
  isEligible: boolean;
  placementReadinessScore: number;
  aiMatchScore?: number;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  preferredLocations: string[];
  preferredRoles: string[];
  expectedSalary: number;
  applications: number; // count
  interviews: number; // count
  createdAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  duration: string;
  highlights: string[];
}

export interface Education {
  id: string;
  level: 'sslc' | 'puc' | 'diploma' | 'graduation' | 'postgraduation';
  institution: string;
  degree: string;
  specialization?: string;
  score: number;
  scoreType: 'percentage' | 'cgpa';
  yearOfPassing: number;
  location: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: 'internship' | 'fulltime' | 'parttime' | 'freelance';
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
}

export interface Resume {
  id: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  score: number;
  atsScore: number;
  analysis: ResumeAnalysis;
}

export interface ResumeAnalysis {
  overallScore: number;
  sections: {
    skills: number;
    projects: number;
    atsKeywords: number;
    formatting: number;
    achievements: number;
    experience: number;
    education: number;
  };
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
  certificationRecommendations: string[];
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  type: 'product' | 'service' | 'startup' | 'mnc' | 'psu';
  website?: string;
  linkedIn?: string;
  description: string;
  hq: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  founded: number;
  revenue?: string;
  techStack: string[];
  activeJobs: number;
  totalHired: number;
  avgPackage: number;
  highestPackage: number;
  recruiters: Recruiter[];
  isActive: boolean;
  isTied: boolean; // tied up with college
  colleges: string[]; // college IDs
  createdAt: string;
}

export interface Recruiter {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  designation: string;
  department: string;
  isActive: boolean;
  activeJobs: number;
  totalHired: number;
  joinedAt: string;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  companyId: string;
  company: Pick<Company, 'id' | 'name' | 'logo' | 'industry' | 'hq'>;
  recruiterId: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  type: 'fulltime' | 'internship' | 'contract' | 'parttime';
  location: string;
  isRemote: boolean;
  salaryMin: number;
  salaryMax: number;
  experience: string; // "0-2 years", "Fresher"
  openings: number;
  status: JobStatus;
  eligibility: JobEligibility;
  skills: string[];
  niceToHave: string[];
  benefits: string[];
  applicationDeadline: string;
  driveDate?: string;
  postedAt: string;
  collegeIds: string[]; // which colleges this job is posted to
  stats: {
    eligible: number;
    applied: number;
    shortlisted: number;
    interviewed: number;
    selected: number;
  };
  pipeline: DriveStage[];
}

export interface JobEligibility {
  minCgpa: number;
  maxBacklogs: number;
  branches: string[];
  degree: string[];
  graduationYear: number[];
  requiredCertifications?: string[];
  requiredSkills?: string[];
}

// ─── Placement Drive ─────────────────────────────────────────────────────────

export interface PlacementDrive {
  id: string;
  collegeId: string;
  companyId: string;
  company: Pick<Company, 'id' | 'name' | 'logo' | 'industry'>;
  jobId: string;
  job: Pick<Job, 'id' | 'title' | 'salaryMin' | 'salaryMax' | 'type'>;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  venue: string;
  status: DriveStatus;
  eligibleDepartments: string[];
  eligibility: JobEligibility;
  openings: number;
  pipeline: DriveStage[];
  stats: {
    registered: number;
    eligible: number;
    applied: number;
    shortlisted: number;
    assessment: number;
    interviewed: number;
    selected: number;
    rejected: number;
  };
  createdAt: string;
}

export interface DriveStage {
  id: string;
  name: string;
  order: number;
  type: 'application' | 'assessment' | 'technical' | 'hr' | 'final' | 'custom';
  description?: string;
  date?: string;
  duration?: number; // minutes
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface Application {
  id: string;
  studentId: string;
  student?: Pick<Student, 'id' | 'name' | 'email' | 'avatar' | 'department' | 'cgpa' | 'skills'>;
  jobId: string;
  job?: Pick<Job, 'id' | 'title' | 'salaryMin' | 'salaryMax' | 'type'>;
  companyId: string;
  company?: Pick<Company, 'id' | 'name' | 'logo' | 'industry'>;
  driveId?: string;
  status: ApplicationStatus;
  currentStage: string;
  appliedAt: string;
  updatedAt: string;
  timeline: ApplicationTimeline[];
  matchScore?: number;
  notes?: string;
  recruiterNotes?: string;
  isShortlisted: boolean;
  offerDetails?: {
    package: number;
    joiningDate: string;
    location: string;
    accepted?: boolean;
  };
}

export interface ApplicationTimeline {
  stage: string;
  status: 'pending' | 'passed' | 'failed' | 'current';
  date?: string;
  notes?: string;
}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface Interview {
  id: string;
  applicationId: string;
  studentId: string;
  student?: Pick<Student, 'id' | 'name' | 'email' | 'avatar' | 'department' | 'cgpa'>;
  jobId: string;
  job?: Pick<Job, 'id' | 'title'>;
  companyId: string;
  company?: Pick<Company, 'id' | 'name' | 'logo'>;
  driveId?: string;
  recruiterId: string;
  type: 'technical' | 'hr' | 'managerial' | 'coding' | 'case-study' | 'final';
  round: number;
  status: InterviewStatus;
  date: string;
  time: string;
  duration: number; // minutes
  mode: 'in-person' | 'video' | 'phone';
  meetingLink?: string;
  venue?: string;
  panelists?: string[];
  feedback?: InterviewFeedback;
  createdAt: string;
}

export interface InterviewFeedback {
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  culturalFitScore: number;
  overallScore: number;
  recommendation: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
  strengths: string[];
  improvements: string[];
  notes: string;
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AIMatchScore {
  studentId: string;
  jobId: string;
  overallScore: number;
  breakdown: {
    skillMatch: number;
    educationMatch: number;
    cgpaMatch: number;
    certificationMatch: number;
    locationMatch: number;
    preferenceMatch: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: 'highly_suitable' | 'suitable' | 'moderate' | 'not_suitable';
  explanation: string;
  strengths: string[];
  concerns: string[];
}

export interface SkillGapAnalysis {
  studentId: string;
  targetJobId?: string;
  targetRole?: string;
  currentSkills: string[];
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercent: number;
  learningResources: LearningResource[];
}

export interface LearningResource {
  skill: string;
  courses: {
    name: string;
    platform: string;
    duration: string;
    url?: string;
    isFree: boolean;
  }[];
  estimatedTime: string;
}

export interface PlacementReadiness {
  studentId: string;
  overallScore: number;
  breakdown: {
    resume: number;
    skills: number;
    projects: number;
    certifications: number;
    communication: number;
    interviewReadiness: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  improvementTimeline: {
    week: number;
    action: string;
    expectedGain: number;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  richContent?: RichContent;
}

export interface RichContent {
  type: 'table' | 'cards' | 'chart' | 'actions';
  data: unknown;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface CollegeAnalytics {
  placementPercent: number;
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  avgPackage: number;
  highestPackage: number;
  lowestPackage: number;
  totalApplications: number;
  totalInterviews: number;
  selectionRate: number;
  offerAcceptanceRate: number;
  interviewAttendanceRate: number;
  departmentWise: {
    department: string;
    placed: number;
    total: number;
    avgPackage: number;
  }[];
  monthlyTrend: {
    month: string;
    placed: number;
    applications: number;
    interviews: number;
  }[];
  topRecruiters: {
    company: string;
    hired: number;
    avgPackage: number;
  }[];
  salaryDistribution: {
    range: string;
    count: number;
  }[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: 'job' | 'application' | 'interview' | 'reminder' | 'selection' | 'rejection' | 'system' | 'ai';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number; // monthly
  annualPrice: number;
  studentsLimit: number;
  aiCreditsLimit: number;
  recruitersLimit: number;
  jobsLimit: number;
  features: string[];
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  collegeId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  dueDate: string;
  plan: SubscriptionPlan;
  period: string;
  downloadUrl?: string;
}

// ─── Super Admin ──────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalColleges: number;
  activeColleges: number;
  trialColleges: number;
  totalStudents: number;
  totalCompanies: number;
  activeJobs: number;
  totalInterviews: number;
  placedStudents: number;
  activeSubscriptions: number;
  mrr: number; // monthly recurring revenue
  totalRevenue: number;
  aiUsagePercent: number;
  expiringSubscriptions: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// ─── Video Programs & Content Hub ─────────────────────────────────────────────

export type TargetAudience = 'ALL' | 'STUDENT' | 'COLLEGE_ADMIN' | 'TPO' | 'RECRUITER';

export interface VideoResource {
  id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'code' | 'link' | 'doc';
  url: string;
  size?: string;
}

export interface ProgramVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  order: number;
  resources?: VideoResource[];
  isCompleted?: boolean;
}

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  targetAudience: TargetAudience[];
  thumbnailUrl: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar?: string;
  isPublished: boolean;
  totalDuration: string;
  videosCount: number;
  videos: ProgramVideo[];
  enrolledCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Newsroom & Official Announcements ─────────────────────────────────────────

export type NewsCategory =
  | 'Campus Announcement'
  | 'Placement Drive Alert'
  | 'Policy Update'
  | 'Industry Trends'
  | 'Tech News'
  | 'Press Release';

export type NewsPriority = 'urgent' | 'high' | 'normal';

export interface NewsAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: 'pdf' | 'doc' | 'image' | 'link';
}

export interface NewsComment {
  id: string;
  articleId: string;
  userName: string;
  userRole: Role;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: NewsCategory;
  priority: NewsPriority;
  targetAudience: TargetAudience[];
  coverImage: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  isPinned: boolean;
  isPublished: boolean;
  viewsCount: number;
  likesCount: number;
  likedByUsers?: string[];
  comments: NewsComment[];
  attachments?: NewsAttachment[];
  publishedAt: string;
  updatedAt: string;
}



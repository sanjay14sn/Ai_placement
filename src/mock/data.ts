import type { College, Student, Company, Job, PlacementDrive, Application, Interview, Recruiter, Department, Notification } from '../types';

// ─── Helper Functions ─────────────────────────────────────────────────────────

const randomBetween = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomSubset = <T>(arr: T[], min = 2, max = 5): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const pastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const futureDate = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEPARTMENTS = ['CSE', 'AI & DS', 'ECE', 'EEE', 'ME', 'Biotech', 'MCA', 'MBA'];

const SKILLS_POOL = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
  'Node.js', 'Spring Boot', 'Django', 'FastAPI', 'Express.js', 'SQL', 'MySQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'GCP', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'HTML', 'CSS', 'Tailwind CSS',
  'C++', 'C', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Flutter',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
  'Tableau', 'Power BI', 'Excel', 'Figma', 'Linux', 'Bash', 'Terraform',
  'Microservices', 'System Design', 'Data Structures', 'Algorithms',
];

const STUDENT_NAMES = [
  'Arjun Sharma', 'Priya Nair', 'Rohan Verma', 'Ananya Krishnan', 'Kiran Patel',
  'Sneha Reddy', 'Vikram Singh', 'Divya Menon', 'Aditya Kumar', 'Pooja Iyer',
  'Rahul Gupta', 'Kavya Pillai', 'Siddharth Joshi', 'Meera Nambiar', 'Akash Shah',
  'Ishaan Bhat', 'Nandini Rao', 'Aarav Mehta', 'Lakshmi Subramaniam', 'Dev Choudhary',
  'Riya Kapoor', 'Aryan Mishra', 'Tanvi Desai', 'Nikhil Patil', 'Shreya Pillai',
  'Harsh Agarwal', 'Isha Sharma', 'Manav Tiwari', 'Aditi Nair', 'Pranav Kumar',
  'Swati Rajput', 'Kartik Nanda', 'Shivani Jain', 'Raghav Bhatt', 'Ayushi Soni',
  'Varun Chopra', 'Diya Singh', 'Aniket Mukherjee', 'Gauri Shinde', 'Yash Khanna',
  'Pallavi Rao', 'Udit Bhatnagar', 'Simran Kaur', 'Aakash Verma', 'Riddhi Mehta',
  'Tarun Srivastava', 'Deepika Nair', 'Rohit Jha', 'Anjali Pillai', 'Sachin Gupta',
  'Bhavna Patel', 'Chirag Shah', 'Archana Iyer', 'Vivek Mishra', 'Komal Yadav',
  'Ritesh Shetty', 'Nisha Kumar', 'Ashwin Menon', 'Preeti Sharma', 'Alok Dubey',
  'Sunita Krishnan', 'Farhan Khan', 'Megha Srivastava', 'Nitin Rawat', 'Shikha Aggarwal',
  'Sameer Bajaj', 'Rekha Pandey', 'Gaurav Chatterjee', 'Kavita Bose', 'Rajesh Pillai',
  'Amrita Saxena', 'Karan Malhotra', 'Supriya Dixit', 'Mohit Trivedi', 'Neha Deshpande',
  'Parth Solanki', 'Shruti Nair', 'Kunal Prajapati', 'Vinita Roy', 'Saurabh Kundu',
  'Trisha Ghosh', 'Harsh Pandey', 'Smita Naik', 'Debanjan Sen', 'Anushka Singh',
  'Vikash Rathi', 'Poonam Desai', 'Sujit Das', 'Sweta Chakraborty', 'Abhinav Garg',
  'Sonal Mehta', 'Dhruv Khurana', 'Renu Tiwari', 'Pavan Reddy', 'Namita Soni',
  'Jatin Bhardwaj', 'Heena Kapoor', 'Sunil Sharma', 'Prerna Verma', 'Vijay Patel',
];

const COLLEGE_NAMES = [
  { name: 'SRM Institute of Science and Technology', city: 'Chennai (KTR)', state: 'Tamil Nadu', affiliation: 'Deemed University' },
  { name: 'RV College of Engineering', city: 'Bengaluru', state: 'Karnataka', affiliation: 'VTU' },
  { name: 'BMS College of Engineering', city: 'Bengaluru', state: 'Karnataka', affiliation: 'VTU' },
  { name: 'PESIT South Campus', city: 'Bengaluru', state: 'Karnataka', affiliation: 'VTU' },
  { name: 'Manipal Institute of Technology', city: 'Manipal', state: 'Karnataka', affiliation: 'MAHE' },
  { name: 'SSN College of Engineering', city: 'Chennai', state: 'Tamil Nadu', affiliation: 'Anna University' },
  { name: 'CEG Anna University', city: 'Chennai', state: 'Tamil Nadu', affiliation: 'Anna University' },
  { name: 'Sona College of Technology', city: 'Salem', state: 'Tamil Nadu', affiliation: 'Anna University' },
  { name: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu', affiliation: 'Deemed' },
  { name: 'Pune Institute of Computer Technology', city: 'Pune', state: 'Maharashtra', affiliation: 'SPPU' },
  { name: 'RAIT Mumbai', city: 'Mumbai', state: 'Maharashtra', affiliation: 'Mumbai University' },
];

const COMPANY_DATA = [
  { name: 'Infosys', industry: 'IT Services', type: 'service' as const, size: 'enterprise' as const, hq: 'Bengaluru', avgPkg: 3.6, maxPkg: 9.5 },
  { name: 'TCS', industry: 'IT Services', type: 'service' as const, size: 'enterprise' as const, hq: 'Mumbai', avgPkg: 3.5, maxPkg: 7.0 },
  { name: 'Wipro', industry: 'IT Services', type: 'service' as const, size: 'enterprise' as const, hq: 'Bengaluru', avgPkg: 3.5, maxPkg: 6.5 },
  { name: 'Google India', industry: 'Technology', type: 'product' as const, size: 'enterprise' as const, hq: 'Bengaluru', avgPkg: 24.0, maxPkg: 45.0 },
  { name: 'Microsoft India', industry: 'Technology', type: 'product' as const, size: 'enterprise' as const, hq: 'Hyderabad', avgPkg: 22.0, maxPkg: 40.0 },
  { name: 'Amazon India', industry: 'E-Commerce & Cloud', type: 'product' as const, size: 'enterprise' as const, hq: 'Bengaluru', avgPkg: 20.0, maxPkg: 38.0 },
  { name: 'Flipkart', industry: 'E-Commerce', type: 'product' as const, size: 'enterprise' as const, hq: 'Bengaluru', avgPkg: 18.0, maxPkg: 35.0 },
  { name: 'Razorpay', industry: 'FinTech', type: 'startup' as const, size: 'medium' as const, hq: 'Bengaluru', avgPkg: 16.0, maxPkg: 28.0 },
  { name: 'Swiggy', industry: 'Food Tech', type: 'startup' as const, size: 'large' as const, hq: 'Bengaluru', avgPkg: 14.0, maxPkg: 26.0 },
  { name: 'Zepto', industry: 'Q-Commerce', type: 'startup' as const, size: 'medium' as const, hq: 'Mumbai', avgPkg: 12.0, maxPkg: 22.0 },
  { name: 'Cognizant', industry: 'IT Services', type: 'service' as const, size: 'enterprise' as const, hq: 'Chennai', avgPkg: 4.0, maxPkg: 10.0 },
  { name: 'Accenture', industry: 'Consulting', type: 'service' as const, size: 'enterprise' as const, hq: 'Mumbai', avgPkg: 4.5, maxPkg: 12.0 },
  { name: 'Deloitte India', industry: 'Consulting', type: 'service' as const, size: 'enterprise' as const, hq: 'Mumbai', avgPkg: 7.0, maxPkg: 18.0 },
  { name: 'PhonePe', industry: 'FinTech', type: 'startup' as const, size: 'large' as const, hq: 'Bengaluru', avgPkg: 15.0, maxPkg: 28.0 },
  { name: 'CRED', industry: 'FinTech', type: 'startup' as const, size: 'medium' as const, hq: 'Bengaluru', avgPkg: 18.0, maxPkg: 32.0 },
  { name: 'Ola Cabs', industry: 'Mobility', type: 'startup' as const, size: 'large' as const, hq: 'Bengaluru', avgPkg: 12.0, maxPkg: 22.0 },
  { name: 'Myntra', industry: 'Fashion E-Commerce', type: 'product' as const, size: 'large' as const, hq: 'Bengaluru', avgPkg: 14.0, maxPkg: 26.0 },
  { name: 'HCL Technologies', industry: 'IT Services', type: 'service' as const, size: 'enterprise' as const, hq: 'Noida', avgPkg: 3.8, maxPkg: 9.0 },
  { name: 'Mu Sigma', industry: 'Analytics', type: 'service' as const, size: 'large' as const, hq: 'Bengaluru', avgPkg: 5.0, maxPkg: 12.0 },
  { name: 'Siemens India', industry: 'Industrial Tech', type: 'mnc' as const, size: 'enterprise' as const, hq: 'Mumbai', avgPkg: 8.0, maxPkg: 18.0 },
];

const JOB_TITLES = [
  'Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Developer',
  'Data Analyst', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Cloud Engineer',
  'Android Developer', 'iOS Developer', 'Product Manager', 'Business Analyst',
  'QA Engineer', 'System Administrator', 'Network Engineer', 'Security Analyst',
  'Java Developer', 'Python Developer', 'React Developer', 'Node.js Developer',
  'Associate Software Engineer', 'Graduate Engineer Trainee', 'Trainee Engineer',
];

// ─── Colleges ─────────────────────────────────────────────────────────────────

export const mockColleges: College[] = COLLEGE_NAMES.map((col, i) => ({
  id: `college-${i + 1}`,
  name: col.name,
  code: col.name.replace(/[^A-Z]/g, '').substring(0, 5) || `COL${i + 1}`,
  city: col.city,
  state: col.state,
  country: 'India',
  affiliation: col.affiliation,
  type: 'engineering',
  phone: `+91 ${Math.floor(8000000000 + Math.random() * 1999999999)}`,
  email: `admin@${col.name.toLowerCase().replace(/\s+/g, '')}.edu.in`,
  website: `https://www.${col.name.toLowerCase().replace(/\s+/g, '')}.edu.in`,
  establishedYear: 1960 + Math.floor(Math.random() * 40),
  totalStudents: 2000 + Math.floor(Math.random() * 3000),
  departments: DEPARTMENTS.slice(0, 6 + Math.floor(Math.random() * 3)),
  tpoName: randomItem(STUDENT_NAMES),
  tpoEmail: `tpo@${col.name.toLowerCase().replace(/\s+/g, '')}.edu.in`,
  subscription: {
    plan: randomItem(['starter', 'professional', 'enterprise'] as const),
    status: randomItem(['active', 'active', 'active', 'trial', 'expired'] as const),
    expiresAt: futureDate(Math.floor(Math.random() * 365)),
    studentsLimit: 1000,
    studentsUsed: 500 + Math.floor(Math.random() * 400),
    aiCreditsLimit: 5000,
    aiCreditsUsed: Math.floor(Math.random() * 4000),
    recruitersLimit: 50,
    recruitersUsed: 10 + Math.floor(Math.random() * 30),
    jobsLimit: 200,
    jobsUsed: 50 + Math.floor(Math.random() * 100),
  },
  stats: {
    totalStudents: 800 + Math.floor(Math.random() * 400),
    eligibleStudents: 600 + Math.floor(Math.random() * 200),
    placedStudents: 400 + Math.floor(Math.random() * 200),
    placementPercent: 60 + Math.floor(Math.random() * 35),
    activeJobs: 20 + Math.floor(Math.random() * 30),
    totalApplications: 2000 + Math.floor(Math.random() * 3000),
    totalInterviews: 1000 + Math.floor(Math.random() * 2000),
    avgPackage: 5 + Math.floor(Math.random() * 8),
    highestPackage: 20 + Math.floor(Math.random() * 25),
  },
  isActive: i !== 8,
  createdAt: pastDate(300 + i * 30),
}));

// ─── Departments ──────────────────────────────────────────────────────────────

export const mockDepartments: Department[] = DEPARTMENTS.map((dept, i) => ({
  id: `dept-${i + 1}`,
  collegeId: 'college-1',
  name: {
    CSE: 'Computer Science & Engineering',
    ISE: 'Information Science & Engineering',
    ECE: 'Electronics & Communication Engineering',
    EEE: 'Electrical & Electronics Engineering',
    ME: 'Mechanical Engineering',
    Civil: 'Civil Engineering',
    MCA: 'Master of Computer Applications',
    MBA: 'Master of Business Administration',
  }[dept] || dept,
  code: dept,
  hod: randomItem(STUDENT_NAMES),
  totalStudents: 120 + Math.floor(Math.random() * 80),
  eligibleStudents: 90 + Math.floor(Math.random() * 40),
  placedStudents: 60 + Math.floor(Math.random() * 40),
  placementPercent: 55 + Math.floor(Math.random() * 40),
  avgPackage: 4 + Math.floor(Math.random() * 8),
  topSkills: randomSubset(SKILLS_POOL, 5, 8),
  activeJobs: 5 + Math.floor(Math.random() * 15),
}));

// ─── Companies ────────────────────────────────────────────────────────────────

export const mockRecruiters: Recruiter[] = COMPANY_DATA.map((c, i) => ({
  id: `recruiter-${i + 1}`,
  userId: `user-recruiter-${i + 1}`,
  companyId: `company-${i + 1}`,
  name: randomItem(STUDENT_NAMES),
  email: `hr${i + 1}@${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
  phone: `+91 ${Math.floor(8000000000 + Math.random() * 1999999999)}`,
  designation: randomItem(['HR Manager', 'Talent Acquisition Lead', 'Campus Recruiter', 'HR Business Partner', 'Talent Partner']),
  department: 'Human Resources',
  isActive: true,
  activeJobs: 1 + Math.floor(Math.random() * 5),
  totalHired: 5 + Math.floor(Math.random() * 50),
  joinedAt: pastDate(200 + Math.floor(Math.random() * 300)),
}));

export const mockCompanies: Company[] = COMPANY_DATA.map((c, i) => ({
  id: `company-${i + 1}`,
  name: c.name,
  industry: c.industry,
  type: c.type,
  size: c.size,
  hq: c.hq,
  description: `${c.name} is a leading ${c.industry} company based in ${c.hq}, India. Known for innovation and excellence in technology.`,
  website: `https://www.${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
  founded: 1980 + Math.floor(Math.random() * 40),
  techStack: randomSubset(SKILLS_POOL, 5, 10),
  activeJobs: 2 + Math.floor(Math.random() * 5),
  totalHired: 10 + Math.floor(Math.random() * 100),
  avgPackage: c.avgPkg,
  highestPackage: c.maxPkg,
  recruiters: [mockRecruiters[i]],
  isActive: true,
  isTied: i < 15,
  colleges: ['college-1', 'college-2', 'college-3'],
  createdAt: pastDate(200 + Math.floor(Math.random() * 300)),
}));

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const mockJobs: Job[] = Array.from({ length: 50 }, (_, i) => {
  const company = randomItem(mockCompanies);
  const salaryMin = Math.round((company.avgPackage * 0.7) * 10) / 10;
  const salaryMax = Math.round((company.avgPackage * 1.4) * 10) / 10;
  const skills = randomSubset(SKILLS_POOL, 4, 8);
  const branches = randomSubset(DEPARTMENTS, 2, 5);
  const status: Job['status'] = i < 35 ? 'active' : i < 42 ? 'closed' : 'draft';

  return {
    id: `job-${i + 1}`,
    companyId: company.id,
    company: { id: company.id, name: company.name, logo: company.logo, industry: company.industry, hq: company.hq },
    recruiterId: company.recruiters[0]?.id || 'recruiter-1',
    title: randomItem(JOB_TITLES),
    description: `We are looking for a talented ${randomItem(JOB_TITLES)} to join our team at ${company.name}. You will be working on cutting-edge technology products and solving complex engineering challenges.`,
    responsibilities: [
      'Design and develop scalable software solutions',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code with proper documentation',
      'Participate in code reviews and technical discussions',
      'Troubleshoot and debug production issues',
    ],
    requirements: [
      'Strong fundamentals in data structures and algorithms',
      'Good problem-solving skills',
      'Experience with version control (Git)',
      'Excellent communication skills',
    ],
    type: randomItem(['fulltime', 'fulltime', 'fulltime', 'internship'] as const),
    location: randomItem(['Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune', 'Delhi NCR', 'Remote']),
    isRemote: Math.random() > 0.7,
    salaryMin,
    salaryMax,
    experience: randomItem(['Fresher', '0-1 years', '0-2 years', '1-3 years']),
    openings: 2 + Math.floor(Math.random() * 20),
    status,
    eligibility: {
      minCgpa: randomItem([6.0, 6.5, 7.0, 7.5, 8.0]),
      maxBacklogs: randomItem([0, 0, 0, 1, 2]),
      branches,
      degree: ['B.E.', 'B.Tech'],
      graduationYear: [2025, 2026],
      requiredSkills: skills.slice(0, 3),
    },
    skills,
    niceToHave: randomSubset(SKILLS_POOL, 2, 4),
    benefits: ['Health Insurance', 'Stock Options', 'Flexible Work Hours', 'Learning Budget'],
    applicationDeadline: status === 'active' ? futureDate(10 + Math.floor(Math.random() * 30)) : pastDate(10),
    postedAt: pastDate(5 + Math.floor(Math.random() * 60)),
    collegeIds: ['college-1', 'college-2', 'college-3'],
    stats: {
      eligible: 80 + Math.floor(Math.random() * 120),
      applied: 40 + Math.floor(Math.random() * 80),
      shortlisted: 10 + Math.floor(Math.random() * 30),
      interviewed: 5 + Math.floor(Math.random() * 20),
      selected: 1 + Math.floor(Math.random() * 8),
    },
    pipeline: [
      { id: 'p1', name: 'Application', order: 1, type: 'application' },
      { id: 'p2', name: 'Online Assessment', order: 2, type: 'assessment' },
      { id: 'p3', name: 'Technical Interview', order: 3, type: 'technical' },
      { id: 'p4', name: 'HR Interview', order: 4, type: 'hr' },
      { id: 'p5', name: 'Final Selection', order: 5, type: 'final' },
    ],
  };
});

// ─── Students ─────────────────────────────────────────────────────────────────

export const mockStudents: Student[] = STUDENT_NAMES.slice(0, 100).map((name, i) => {
  const department = DEPARTMENTS[i % DEPARTMENTS.length];
  const cgpa = Math.round(randomBetween(5.5, 9.9) * 10) / 10;
  const skills = randomSubset(SKILLS_POOL, 4, 10);
  const isEligible = cgpa >= 6.5;
  const isPlaced = isEligible && Math.random() > 0.4;
  const profileCompletion = 50 + Math.floor(Math.random() * 50);

  return {
    id: `student-${i + 1}`,
    collegeId: 'college-1',
    userId: `user-student-${i + 1}`,
    studentId: `1RV${21 + Math.floor(i / 60)}${department.substring(0, 2)}${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@rvce.edu.in`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
    department,
    departmentId: `dept-${DEPARTMENTS.indexOf(department) + 1}`,
    batch: '2025',
    degree: department === 'MCA' ? 'MCA' : department === 'MBA' ? 'MBA' : 'B.E.',
    cgpa,
    backlogs: cgpa < 7 ? Math.floor(Math.random() * 3) : 0,
    gender: randomItem(['male', 'female', 'male', 'female', 'other'] as const),
    dob: `200${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    address: {
      city: randomItem(['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi']),
      state: 'Karnataka',
      pincode: String(560000 + Math.floor(Math.random() * 100)),
    },
    skills,
    certifications: i % 3 === 0 ? [
      {
        id: `cert-${i}-1`,
        name: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: pastDate(180),
        expiryDate: futureDate(550),
        credentialId: `AWS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    ] : [],
    projects: [
      {
        id: `proj-${i}-1`,
        title: randomItem(['E-Commerce Platform', 'Task Manager App', 'Weather Dashboard', 'Chat Application', 'Portfolio Website', 'Blog CMS', 'Library Management']),
        description: 'A full-stack web application built with modern technologies.',
        technologies: skills.slice(0, 3),
        githubUrl: `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}`,
        duration: '2 months',
        highlights: ['Implemented REST APIs', 'Responsive UI design', '95% test coverage'],
      },
    ],
    education: [
      {
        id: `edu-${i}-1`,
        level: 'graduation' as const,
        institution: 'RV College of Engineering',
        degree: 'B.E.',
        specialization: department,
        score: cgpa,
        scoreType: 'cgpa' as const,
        yearOfPassing: 2025,
        location: 'Bengaluru',
      },
      {
        id: `edu-${i}-2`,
        level: 'puc' as const,
        institution: `${randomItem(['Sri Chaitanya', 'Narayana', 'BASE', 'Deeksha'])} PU College`,
        degree: 'PUC / 12th',
        score: 80 + Math.floor(Math.random() * 20),
        scoreType: 'percentage' as const,
        yearOfPassing: 2021,
        location: 'Karnataka',
      },
    ],
    experience: i % 4 === 0 ? [
      {
        id: `exp-${i}-1`,
        company: randomItem(['Startup Inc.', 'TechCorp', 'WebDev Studio', 'InnovateTech']),
        role: 'Software Development Intern',
        type: 'internship' as const,
        startDate: pastDate(150),
        endDate: pastDate(30),
        isCurrent: false,
        description: 'Worked on frontend development and API integration.',
        skills: skills.slice(0, 3),
      },
    ] : [],
    resume: profileCompletion > 70 ? {
      id: `resume-${i}`,
      studentId: `student-${i + 1}`,
      fileName: `${name.replace(' ', '_')}_Resume.pdf`,
      fileUrl: '/sample-resume.pdf',
      uploadedAt: pastDate(20),
      score: 65 + Math.floor(Math.random() * 30),
      atsScore: 60 + Math.floor(Math.random() * 35),
      analysis: {
        overallScore: 65 + Math.floor(Math.random() * 30),
        sections: {
          skills: 70 + Math.floor(Math.random() * 25),
          projects: 60 + Math.floor(Math.random() * 30),
          atsKeywords: 55 + Math.floor(Math.random() * 35),
          formatting: 75 + Math.floor(Math.random() * 20),
          achievements: 50 + Math.floor(Math.random() * 40),
          experience: i % 4 === 0 ? 70 + Math.floor(Math.random() * 25) : 30,
          education: 85 + Math.floor(Math.random() * 15),
        },
        strengths: ['Strong technical skills section', 'Good project descriptions', 'Clear formatting'],
        weaknesses: ['Missing quantified achievements', 'No certifications listed', 'Short summary'],
        missingSkills: randomSubset(SKILLS_POOL, 2, 5),
        missingKeywords: ['Agile', 'JIRA', 'Problem Solving', 'Team Collaboration'],
        suggestions: [
          'Add quantified metrics to achievements',
          'Include GitHub profile link',
          'Add a professional summary',
        ],
        certificationRecommendations: ['AWS Cloud Practitioner', 'Google Associate Cloud Engineer', 'Oracle Java Certification'],
      },
    } : undefined,
    profileCompletion,
    placementStatus: isPlaced ? 'placed' : isEligible ? 'not_placed' : 'not_eligible',
    isEligible,
    placementReadinessScore: 50 + Math.floor(Math.random() * 45),
    aiMatchScore: 60 + Math.floor(Math.random() * 35),
    linkedIn: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
    github: `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}`,
    preferredLocations: randomSubset(['Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune', 'Remote'], 2, 4),
    preferredRoles: randomSubset(['Software Engineer', 'Data Analyst', 'Full Stack Developer', 'Backend Engineer'], 1, 3),
    expectedSalary: 4 + Math.floor(Math.random() * 8),
    applications: Math.floor(Math.random() * 10),
    interviews: Math.floor(Math.random() * 5),
    createdAt: pastDate(60 + Math.floor(Math.random() * 200)),
  };
});

// ─── Applications ─────────────────────────────────────────────────────────────

const APPLICATION_STATUSES: Application['status'][] = [
  'applied', 'under_review', 'shortlisted', 'assessment', 'technical', 'hr', 'selected', 'rejected',
];

export const mockApplications: Application[] = Array.from({ length: 150 }, (_, i) => {
  const student = randomItem(mockStudents);
  const job = randomItem(mockJobs);
  const status = APPLICATION_STATUSES[i % APPLICATION_STATUSES.length];

  return {
    id: `application-${i + 1}`,
    studentId: student.id,
    student: { id: student.id, name: student.name, email: student.email, avatar: student.avatar, department: student.department, cgpa: student.cgpa, skills: student.skills },
    jobId: job.id,
    job: { id: job.id, title: job.title, salaryMin: job.salaryMin, salaryMax: job.salaryMax, type: job.type },
    companyId: job.companyId,
    company: job.company,
    status,
    currentStage: status,
    appliedAt: pastDate(30 + Math.floor(Math.random() * 60)),
    updatedAt: pastDate(Math.floor(Math.random() * 15)),
    timeline: [
      { stage: 'Applied', status: 'passed', date: pastDate(30 + Math.floor(Math.random() * 60)) },
      { stage: 'Under Review', status: ['under_review', 'shortlisted', 'assessment', 'technical', 'hr', 'selected', 'rejected'].includes(status) ? 'passed' : 'pending' },
      { stage: 'Shortlisted', status: ['shortlisted', 'assessment', 'technical', 'hr', 'selected'].includes(status) ? 'passed' : status === 'rejected' ? 'failed' : 'pending' },
      { stage: 'Assessment', status: ['assessment', 'technical', 'hr', 'selected'].includes(status) ? 'passed' : 'pending' },
      { stage: 'Technical', status: ['technical', 'hr', 'selected'].includes(status) ? 'passed' : 'pending' },
      { stage: 'HR Round', status: ['hr', 'selected'].includes(status) ? 'passed' : 'pending' },
      { stage: 'Selected', status: status === 'selected' ? 'passed' : 'pending' },
    ],
    matchScore: 60 + Math.floor(Math.random() * 35),
    isShortlisted: ['shortlisted', 'assessment', 'technical', 'hr', 'selected'].includes(status),
    offerDetails: status === 'selected' ? {
      package: job.salaryMin + Math.random() * (job.salaryMax - job.salaryMin),
      joiningDate: futureDate(60 + Math.floor(Math.random() * 60)),
      location: job.location,
      accepted: Math.random() > 0.2,
    } : undefined,
  };
});

// ─── Interviews ───────────────────────────────────────────────────────────────

export const mockInterviews: Interview[] = Array.from({ length: 80 }, (_, i) => {
  const student = randomItem(mockStudents);
  const job = randomItem(mockJobs);
  const app = randomItem(mockApplications);
  const statuses: Interview['status'][] = ['scheduled', 'confirmed', 'attended', 'no_show', 'completed', 'cancelled'];

  return {
    id: `interview-${i + 1}`,
    applicationId: app.id,
    studentId: student.id,
    student: { id: student.id, name: student.name, email: student.email, avatar: student.avatar, department: student.department, cgpa: student.cgpa },
    jobId: job.id,
    job: { id: job.id, title: job.title },
    companyId: job.companyId,
    company: { id: job.companyId, name: job.company.name, logo: job.company.logo },
    recruiterId: job.recruiterId,
    type: randomItem(['technical', 'hr', 'managerial', 'coding', 'final'] as const),
    round: 1 + Math.floor(Math.random() * 3),
    status: statuses[i % statuses.length],
    date: i < 40 ? futureDate(Math.floor(Math.random() * 14)) : pastDate(Math.floor(Math.random() * 30)),
    time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '30' : '00'}`,
    duration: randomItem([30, 45, 60, 90]),
    mode: randomItem(['video', 'video', 'in-person', 'phone'] as const),
    meetingLink: Math.random() > 0.5 ? 'https://meet.google.com/abc-defg-hij' : undefined,
    panelists: [randomItem(STUDENT_NAMES), randomItem(STUDENT_NAMES)],
    feedback: statuses[i % statuses.length] === 'completed' ? {
      technicalScore: 60 + Math.floor(Math.random() * 40),
      communicationScore: 65 + Math.floor(Math.random() * 35),
      problemSolvingScore: 60 + Math.floor(Math.random() * 40),
      culturalFitScore: 70 + Math.floor(Math.random() * 30),
      overallScore: 65 + Math.floor(Math.random() * 35),
      recommendation: randomItem(['strongly_recommend', 'recommend', 'neutral', 'not_recommend'] as const),
      strengths: ['Good communication', 'Strong technical knowledge'],
      improvements: ['Can improve problem solving speed'],
      notes: 'Overall a good candidate with strong fundamentals.',
    } : undefined,
    createdAt: pastDate(20 + Math.floor(Math.random() * 40)),
  };
});

// ─── Placement Drives ────────────────────────────────────────────────────────

export const mockDrives: PlacementDrive[] = Array.from({ length: 15 }, (_, i) => {
  const company = mockCompanies[i % mockCompanies.length];
  const job = mockJobs[i % mockJobs.length];
  const statuses: PlacementDrive['status'][] = ['upcoming', 'upcoming', 'ongoing', 'completed', 'completed', 'completed'];

  return {
    id: `drive-${i + 1}`,
    collegeId: 'college-1',
    companyId: company.id,
    company: { id: company.id, name: company.name, logo: company.logo, industry: company.industry },
    jobId: job.id,
    job: { id: job.id, title: job.title, salaryMin: job.salaryMin, salaryMax: job.salaryMax, type: job.type },
    title: `${company.name} Campus Drive 2025`,
    description: `${company.name} is conducting a campus placement drive at RV College of Engineering.`,
    date: i < 5 ? futureDate(5 + i * 7) : pastDate(i * 10),
    venue: 'Main Auditorium, RV College of Engineering',
    status: statuses[i % statuses.length],
    eligibleDepartments: randomSubset(DEPARTMENTS, 3, 6),
    eligibility: {
      minCgpa: randomItem([6.5, 7.0, 7.5, 8.0]),
      maxBacklogs: randomItem([0, 0, 1]),
      branches: randomSubset(DEPARTMENTS, 3, 5),
      degree: ['B.E.', 'B.Tech'],
      graduationYear: [2025],
    },
    openings: 5 + Math.floor(Math.random() * 25),
    pipeline: [
      { id: 'dp1', name: 'Application', order: 1, type: 'application' },
      { id: 'dp2', name: 'Online Assessment', order: 2, type: 'assessment' },
      { id: 'dp3', name: 'Technical Interview', order: 3, type: 'technical' },
      { id: 'dp4', name: 'HR Interview', order: 4, type: 'hr' },
      { id: 'dp5', name: 'Final Selection', order: 5, type: 'final' },
    ],
    stats: {
      registered: 200 + Math.floor(Math.random() * 100),
      eligible: 150 + Math.floor(Math.random() * 80),
      applied: 120 + Math.floor(Math.random() * 60),
      shortlisted: 60 + Math.floor(Math.random() * 40),
      assessment: 40 + Math.floor(Math.random() * 30),
      interviewed: 20 + Math.floor(Math.random() * 20),
      selected: 5 + Math.floor(Math.random() * 15),
      rejected: 70 + Math.floor(Math.random() * 50),
    },
    createdAt: pastDate(30 + i * 5),
  };
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    type: 'ai',
    title: 'AI Job Match Found',
    message: 'You have a 95% match for the Java Developer role at Google India.',
    isRead: false,
    link: '/student/jobs/job-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    type: 'interview',
    title: 'Interview Scheduled',
    message: 'Your technical interview with Infosys is scheduled for tomorrow at 10:30 AM.',
    isRead: false,
    link: '/student/interviews',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-student-1',
    type: 'reminder',
    title: 'Application Deadline',
    message: 'Application deadline for TCS NextStep closes in 2 hours.',
    isRead: false,
    link: '/student/jobs/job-5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'user-student-1',
    type: 'application',
    title: 'Application Shortlisted',
    message: 'Congratulations! You have been shortlisted for Amazon India\'s SDE role.',
    isRead: true,
    link: '/student/applications',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'notif-5',
    userId: 'user-student-1',
    type: 'selection',
    title: 'Selected!',
    message: 'Congratulations! You have been selected by Razorpay for the Backend Engineer role with a package of 16 LPA.',
    isRead: true,
    link: '/student/applications',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// ─── Platform Stats (Super Admin) ────────────────────────────────────────────

export const mockPlatformStats = {
  totalColleges: 127,
  activeColleges: 112,
  trialColleges: 15,
  totalStudents: 8534,
  totalCompanies: 342,
  activeJobs: 456,
  totalInterviews: 5234,
  placedStudents: 2856,
  activeSubscriptions: 98,
  mrr: 4250000, // INR
  totalRevenue: 38500000,
  aiUsagePercent: 78,
  expiringSubscriptions: 12,
};

// ─── Analytics Data ───────────────────────────────────────────────────────────

export const mockCollegeAnalytics = {
  placementPercent: 0,
  totalStudents: 850,
  eligibleStudents: 720,
  placedStudents: 0,
  avgPackage: 0,
  highestPackage: 42.0,
  lowestPackage: 3.5,
  totalApplications: 4200,
  totalInterviews: 1800,
  selectionRate: 29.8,
  offerAcceptanceRate: 91.2,
  interviewAttendanceRate: 88.5,
  departmentWise: DEPARTMENTS.map(dept => ({
    department: dept,
    placed: 40 + Math.floor(Math.random() * 60),
    total: 100 + Math.floor(Math.random() * 60),
    avgPackage: 4 + Math.floor(Math.random() * 10),
  })),
  monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
    placed: 10 + Math.floor(Math.random() * 60),
    applications: 100 + Math.floor(Math.random() * 200),
    interviews: 50 + Math.floor(Math.random() * 100),
  })),
  topRecruiters: mockCompanies.slice(0, 8).map(c => ({
    company: c.name,
    hired: 5 + Math.floor(Math.random() * 30),
    avgPackage: c.avgPackage,
  })),
  salaryDistribution: [
    { range: '3-5 LPA', count: 120 },
    { range: '5-8 LPA', count: 180 },
    { range: '8-12 LPA', count: 140 },
    { range: '12-18 LPA', count: 60 },
    { range: '18-25 LPA', count: 25 },
    { range: '25+ LPA', count: 11 },
  ],
};

// ─── Chart Data (Super Admin) ─────────────────────────────────────────────────

export const mockPlatformCharts = {
  collegeGrowth: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
    colleges: 80 + i * 4 + Math.floor(Math.random() * 5),
    students: 5000 + i * 280 + Math.floor(Math.random() * 200),
  })),
  revenueChart: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
    mrr: 2800000 + i * 120000 + Math.floor(Math.random() * 100000),
    arr: 28000000 + i * 1200000,
  })),
  subscriptionDistribution: [
    { plan: 'Starter', count: 45, color: '#94a3b8' },
    { plan: 'Professional', count: 62, color: '#6366f1' },
    { plan: 'Enterprise', count: 20, color: '#7c3aed' },
  ],
  placementsOverTime: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
    placed: 150 + i * 25 + Math.floor(Math.random() * 50),
    jobs: 30 + i * 3 + Math.floor(Math.random() * 10),
  })),
};

// ─── Super Admin Detailed Mock Data ──────────────────────────────────────────

export const mockAuditLogs = Array.from({ length: 45 }, (_, i) => {
  const actions = [
    { action: 'TENANT_SUBSCRIPTION_UPGRADED', category: 'Billing', severity: 'info', target: 'SSN College of Engineering', details: { fromPlan: 'Professional', toPlan: 'Enterprise', mrrIncrease: '₹17,000' } },
    { action: 'USER_ROLE_UPDATED', category: 'User Management', severity: 'info', target: 'Arjun Sharma (Student -> TPO Assistant)', details: { modifiedBy: 'Super Admin', college: 'RV College of Engineering' } },
    { action: 'AI_CREDITS_BONUS_GRANTED', category: 'Tenant', severity: 'info', target: 'VIT Vellore', details: { bonusCredits: 10000, reason: 'High Drive Volume Promo' } },
    { action: 'FAILED_LOGIN_ATTEMPT', category: 'Authentication', severity: 'warning', target: 'admin@stranger.org', details: { ip: '185.220.101.4', attemptsCount: 3, location: 'Frankfurt, DE' } },
    { action: 'SECURITY_IP_BLOCKED', category: 'Security', severity: 'critical', target: 'IP 185.220.101.4', details: { reason: 'Brute force pattern detected', duration: '24 hours' } },
    { action: 'SYSTEM_SETTINGS_UPDATED', category: 'System Config', severity: 'info', target: 'AI Engine Configuration', details: { modelUpdated: 'Gemini 1.5 Pro', temperature: 0.2 } },
    { action: 'NEW_COLLEGE_ONBOARDED', category: 'Tenant', severity: 'info', target: 'IIT Madras Technology Campus', details: { initialPlan: 'Enterprise', adminEmail: 'tpo@iitm.ac.in' } },
    { action: 'SUBSCRIPTION_RENEWAL_FAILED', category: 'Billing', severity: 'warning', target: 'PESIT South Campus', details: { invoiceId: 'INV-2025-089', reason: 'Card expired' } },
    { action: 'BULK_STUDENT_DATA_EXPORTED', category: 'User Management', severity: 'info', target: 'BMS College of Engineering', details: { count: 1250, format: 'CSV', requestedBy: 'tpo@bmsce.ac.in' } },
    { action: 'RECRUITER_COMPANY_VERIFIED', category: 'Tenant', severity: 'info', target: 'Razorpay Software Pvt Ltd', details: { verifiedBy: 'Super Admin', status: 'Approved' } },
    { action: 'AI_RATE_LIMIT_EXCEEDED', category: 'AI Model', severity: 'warning', target: 'RAMAIAH Institute of Tech', details: { requestsPerMin: 1420, threshold: 1000 } },
    { action: 'DATABASE_BACKUP_COMPLETED', category: 'System Config', severity: 'info', target: 'Primary Postgres Cluster', details: { backupSize: '14.2 GB', duration: '4m 12s', storage: 'AWS S3' } },
  ];

  const item = actions[i % actions.length];
  const daysAgo = Math.floor(i / 3);
  const minutesAgo = (i * 37) % 1440;

  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);

  const actors = [
    { name: 'Sanjay Admin', email: 'admin@placementos.ai', role: 'SUPER_ADMIN', ip: '106.51.78.12' },
    { name: 'System Automation', email: 'system@placementos.ai', role: 'SUPER_ADMIN', ip: '127.0.0.1' },
    { name: 'Vikram TPO', email: 'tpo@rvce.edu.in', role: 'COLLEGE_ADMIN', ip: '49.207.210.44' },
    { name: 'Priya Recruiter', email: 'hr@infosys.com', role: 'RECRUITER', ip: '182.72.198.2' },
    { name: 'Security Monitor', email: 'security@placementos.ai', role: 'SUPER_ADMIN', ip: '10.0.4.15' },
  ];

  return {
    id: `audit-${1000 + i}`,
    timestamp: d.toISOString(),
    actor: actors[i % actors.length],
    action: item.action,
    category: item.category as 'Authentication' | 'Billing' | 'System Config' | 'Tenant' | 'User Management' | 'AI Model' | 'Security',
    severity: item.severity as 'info' | 'warning' | 'critical' | 'security',
    target: item.target,
    details: item.details,
    ipAddress: actors[i % actors.length].ip,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  };
});

export const mockSubscriptionsList = mockColleges.map((col, i) => {
  const plans = ['starter', 'professional', 'enterprise'] as const;
  const plan = col.subscription.plan || plans[i % 3];
  const prices = { starter: 4999, professional: 12999, enterprise: 29999 };
  const statuses = ['active', 'active', 'active', 'trial', 'expiring', 'expired'] as const;
  const status = i === 1 ? 'expiring' : (col.subscription.status === 'cancelled' ? 'cancelled' : statuses[i % statuses.length]);

  return {
    id: `sub-${100 + i}`,
    collegeId: col.id,
    collegeName: col.name,
    collegeCode: col.code,
    city: col.city,
    plan,
    status,
    billingCycle: (i % 2 === 0 ? 'annual' : 'monthly') as 'annual' | 'monthly',
    amount: (i % 2 === 0 ? prices[plan] * 10 : prices[plan]),
    currency: 'INR',
    startDate: pastDate(180 + i * 15),
    expiresAt: status === 'expiring' ? futureDate(7) : futureDate(60 + i * 20),
    autoRenew: i % 5 !== 0,
    studentsUsed: col.subscription.studentsUsed,
    studentsLimit: col.subscription.studentsLimit,
    aiCreditsUsed: col.subscription.aiCreditsUsed,
    aiCreditsLimit: col.subscription.aiCreditsLimit,
    recruitersUsed: col.subscription.recruitersUsed,
    recruitersLimit: col.subscription.recruitersLimit,
    jobsUsed: col.subscription.jobsUsed,
    jobsLimit: col.subscription.jobsLimit,
    invoicesCount: 6 + (i % 5),
    lastPaymentDate: pastDate(15 + (i % 20)),
    lastPaymentStatus: i === 4 ? 'failed' : i === 7 ? 'pending' : 'paid',
  };
});

export const mockUsageStats = {
  totalAiCreditsLimit: 2500000,
  totalAiCreditsUsed: 1845000,
  aiUsagePercent: 73.8,
  totalStorageLimitGB: 5000,
  totalStorageUsedGB: 3420,
  storageUsagePercent: 68.4,
  apiRequestsToday: 684200,
  avgResponseTimeMs: 138,
  activeSessionsNow: 4120,
  resumesParsedMonth: 28450,
  mockInterviewsConducted: 9420,
  aiMatchScorings: 142800,
  
  serviceBreakdown: [
    { name: 'AI Resume Analyzer & Parser', percent: 38, credits: 701100, color: '#6366f1' },
    { name: 'AI Candidate Match Engine', percent: 28, credits: 516600, color: '#8b5cf6' },
    { name: 'AI Mock Interview Coach', percent: 22, credits: 405900, color: '#10b981' },
    { name: 'AI Placement Officer Assistant', percent: 12, credits: 221400, color: '#f59e0b' },
  ],

  dailyTrend: Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      aiCredits: 110000 + Math.floor(Math.random() * 45000),
      apiRequests: 42000 + Math.floor(Math.random() * 20000),
      storageGB: 3200 + i * 15,
      activeUsers: 2800 + Math.floor(Math.random() * 1400),
    };
  }),

  tenantUsage: mockColleges.map((col, i) => {
    const aiUsed = col.subscription.aiCreditsUsed;
    const aiLimit = col.subscription.aiCreditsLimit;
    const aiPercent = Math.round((aiUsed / aiLimit) * 100);
    const storageUsed = 120 + Math.floor(Math.random() * 350);
    const storageLimit = 500;
    
    let status: 'normal' | 'warning' | 'exceeded' = 'normal';
    if (aiPercent >= 90 || i === 2) status = 'exceeded';
    else if (aiPercent >= 75 || i === 5) status = 'warning';

    return {
      collegeId: col.id,
      collegeName: col.name,
      collegeCode: col.code,
      plan: col.subscription.plan,
      aiCreditsUsed: aiUsed,
      aiCreditsLimit: aiLimit,
      aiUsagePercent: aiPercent,
      storageUsedGB: storageUsed,
      storageLimitGB: storageLimit,
      resumesParsed: 850 + Math.floor(Math.random() * 1200),
      mockInterviews: 180 + Math.floor(Math.random() * 400),
      studentsActive: col.subscription.studentsUsed,
      studentsLimit: col.subscription.studentsLimit,
      apiRequestsToday: 12000 + Math.floor(Math.random() * 35000),
      status,
    };
  }),
};

export const mockSuperAdminAnalyticsData = {
  overview: {
    totalTenants: 127,
    activeStudents: 8534,
    totalPlacedStudents: 2856,
    avgPlatformPlacementRate: 78.4,
    avgPackageLPA: 8.6,
    highestPackageLPA: 45.0,
    totalJobsPosted: 1450,
    totalOffersIssued: 3120,
    recruiterPartnerCompanies: 342,
    aiMatchingAccuracyPercent: 94.2,
  },
  
  tierWisePlacement: [
    { tier: 'Tier 1 (IIT/NIT/Top Auto)', colleges: 18, placementRate: 92.4, avgPackage: 18.5, maxPackage: 45.0 },
    { tier: 'Tier 2 (Premier State/Private)', colleges: 45, placementRate: 82.1, avgPackage: 9.2, maxPackage: 32.0 },
    { tier: 'Tier 3 (Affiliated Colleges)', colleges: 64, placementRate: 68.5, avgPackage: 5.4, maxPackage: 18.0 },
  ],

  departmentLeaderboard: DEPARTMENTS.map(d => ({
    department: d,
    totalStudents: 900 + Math.floor(Math.random() * 500),
    placedStudents: 650 + Math.floor(Math.random() * 400),
    placementPercent: 65 + Math.floor(Math.random() * 30),
    avgSalary: 4.5 + Math.floor(Math.random() * 80) / 10,
    topRecruiter: randomItem(COMPANY_DATA).name,
  })),

  recruiterFunnel: [
    { stage: 'Total Job Openings Posted', count: 1450, percent: 100 },
    { stage: 'Applications Submitted', count: 48500, percent: 85 },
    { stage: 'Shortlisted by AI & Recruiters', count: 16200, percent: 33 },
    { stage: 'Assessments & Technical Rounds', count: 8900, percent: 18 },
    { stage: 'HR & Final Interviews', count: 4100, percent: 8.5 },
    { stage: 'Offers Accepted & Placed', count: 3120, percent: 6.4 },
  ],

  aiImpactComparison: [
    { metric: 'Avg Days to Hire', withAI: '12 Days', traditional: '38 Days', improvement: '68% Faster' },
    { metric: 'Resume Screening Efficiency', withAI: '99.2%', traditional: '42.0%', improvement: '2.3x Better' },
    { metric: 'Offer Acceptance Rate', withAI: '91.5%', traditional: '74.0%', improvement: '+17.5%' },
    { metric: 'Student Placement Readiness', withAI: '84/100', traditional: '58/100', improvement: '+26 Pts' },
  ],
};

export const mockPlatformSettings = {
  general: {
    platformName: 'PlacementOS AI SaaS Platform',
    supportEmail: 'support@placementos.ai',
    contactPhone: '+91 80 4567 8900',
    primaryCurrency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    maintenanceMode: false,
    announcementBanner: '🚀 PlacementOS v2.4 Live: Multi-Model AI Resume Parsing & Automated Recruiter Matching enabled!',
    enablePublicRegistration: true,
  },

  aiEngine: {
    primaryProvider: 'Gemini 1.5 Pro',
    fallbackProvider: 'Claude 3.5 Sonnet',
    maxTokensPerReq: 2048,
    temperature: 0.2,
    tokenRateLimitPerMin: 15000,
    enableAutoModeration: true,
    enableAIPlacementOfficer: true,
    enableMockInterviewCoach: true,
    resumeParsingModel: 'DeepParser-v3 (ATS Optimized)',
  },

  security: {
    enforce2FAForAdmins: true,
    sessionTimeoutMinutes: 60,
    maxFailedLoginAttempts: 5,
    passwordPolicyStrength: 'strong',
    enableIpWhitelisting: false,
    whitelistedIPs: '106.51.78.12, 49.207.210.44',
    auditLogLevel: 'verbose',
  },

  email: {
    provider: 'SendGrid API',
    senderName: 'PlacementOS System',
    senderEmail: 'notifications@placementos.ai',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    enableEmailAlerts: true,
    sendWeeklyReports: true,
  },

  billing: {
    taxRatePercent: 18,
    currencySymbol: '₹',
    gracePeriodDays: 7,
    autoSuspendOverdueTenants: false,
    paymentGateway: 'Razorpay Enterprise API',
    webhookEndpoint: 'https://api.placementos.ai/v1/webhooks/razorpay',
  },
};

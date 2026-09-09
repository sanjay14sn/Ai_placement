import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Program, Role } from '../types';

interface ProgramStore {
  programs: Program[];
  completedVideos: Record<string, boolean>; // `${programId}_${videoId}` -> boolean
  addProgram: (program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  togglePublishStatus: (id: string) => void;
  toggleVideoCompleted: (programId: string, videoId: string) => void;
  getProgramsForRole: (role: Role) => Program[];
}

const INITIAL_PROGRAMS: Program[] = [
  // ─── Direct Students Programs ─────────────────────────────────────────────
  {
    id: 'prog-student-1',
    title: 'A-Z Placement Prep & Technical Interview Masterclass',
    subtitle: 'Complete roadmap to crack Tier-1 product & service tech interviews',
    description: 'Master Data Structures & Algorithms, System Design basics, Core CS fundamentals (OS, DBMS, CN), and Live Coding interviews curated specifically for campus placements.',
    category: 'Placement Training',
    targetAudience: ['STUDENT'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Vikramaditya Sharma',
    instructorTitle: 'Ex-Google SDE & Chief Technical Educator',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isPublished: true,
    totalDuration: '4h 45m',
    videosCount: 4,
    enrolledCount: 1420,
    rating: 4.9,
    tags: ['DSA', 'System Design', 'Technical Interview', 'Coding'],
    createdAt: '2026-08-10',
    updatedAt: '2026-08-15',
    videos: [
      {
        id: 'vid-s1-1',
        order: 1,
        title: 'Mastering Coding Interviews & DSA Patterns',
        description: 'Two pointers, sliding window, binary search, and dynamic programming patterns commonly asked in campus online tests.',
        duration: '45:00',
        videoUrl: 'https://www.youtube.com/embed/1uF7oP33-9w',
        resources: [
          { id: 'res-1', title: 'Top 50 DSA Cheat Sheet (PDF)', type: 'pdf', url: '#', size: '2.4 MB' },
          { id: 'res-2', title: 'Python & C++ Starter Code', type: 'code', url: '#', size: '1.1 MB' }
        ]
      },
      {
        id: 'vid-s1-2',
        order: 2,
        title: 'System Design Basics for Undergraduates',
        description: 'Understand Scalability, Load Balancers, Caching, Databases (SQL vs NoSQL), and Microservices for technical rounds.',
        duration: '58:30',
        videoUrl: 'https://www.youtube.com/embed/bUHFg8CZFuc',
        resources: [
          { id: 'res-3', title: 'System Design Architecture Diagrams', type: 'ppt', url: '#', size: '4.8 MB' }
        ]
      },
      {
        id: 'vid-s1-3',
        order: 3,
        title: 'DBMS & SQL Live Queries Workout',
        description: 'Joins, Subqueries, Indexing, ACID Properties, and normalization scenario-based questions.',
        duration: '50:15',
        videoUrl: 'https://www.youtube.com/embed/HXV3zeQKqGY',
        resources: [
          { id: 'res-4', title: 'Top SQL Interview Questions & Scripts', type: 'doc', url: '#', size: '850 KB' }
        ]
      },
      {
        id: 'vid-s1-4',
        order: 4,
        title: 'HR Round Playbook & Behavioral Questions',
        description: 'How to answer "Tell me about yourself", STAR method scenarios, salary expectations, and confidence building.',
        duration: '40:00',
        videoUrl: 'https://www.youtube.com/embed/y8YH0Qbu5hU',
        resources: [
          { id: 'res-5', title: 'Behavioral Answer Framework Worksheet', type: 'pdf', url: '#', size: '1.5 MB' }
        ]
      }
    ]
  },
  {
    id: 'prog-student-2',
    title: 'ATS Resume Masterclass & Portfolio Accelerator',
    subtitle: 'Pass AI resume screeners and land 3x more interview callbacks',
    description: 'Learn how ATS parsers rank candidate resumes, how to format bullet points with impact metrics, and how to build high-scoring GitHub portfolios.',
    category: 'Career Advice',
    targetAudience: ['STUDENT'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Neha Kapoor',
    instructorTitle: 'Senior Talent Acquisition Specialist',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    isPublished: true,
    totalDuration: '2h 15m',
    videosCount: 3,
    enrolledCount: 980,
    rating: 4.8,
    tags: ['Resume', 'ATS', 'Portfolio', 'Job Search'],
    createdAt: '2026-08-18',
    updatedAt: '2026-08-20',
    videos: [
      {
        id: 'vid-s2-1',
        order: 1,
        title: 'Deconstructing ATS Algorithms & Formatting',
        description: 'Font choices, column structures, keywords optimization, and avoiding common ATS parser pitfalls.',
        duration: '35:00',
        videoUrl: 'https://www.youtube.com/embed/y8YH0Qbu5hU',
        resources: [
          { id: 'res-6', title: 'LaTeX & Word ATS Clean Templates', type: 'doc', url: '#', size: '3.2 MB' }
        ]
      },
      {
        id: 'vid-s2-2',
        order: 2,
        title: 'Action Verbs & Impact Metrics Writing',
        description: 'Transforming boring duty statements into high-impact bullet points with numbers and results.',
        duration: '45:00',
        videoUrl: 'https://www.youtube.com/embed/1uF7oP33-9w',
        resources: [
          { id: 'res-7', title: '100+ High-Impact Action Verbs Bank', type: 'pdf', url: '#', size: '600 KB' }
        ]
      },
      {
        id: 'vid-s2-3',
        order: 3,
        title: 'Building a Standout GitHub & Portfolio Site',
        description: 'README formatting, live deployments, project documentation, and showcasing full-stack applications.',
        duration: '55:00',
        videoUrl: 'https://www.youtube.com/embed/bUHFg8CZFuc',
      }
    ]
  },

  // ─── College Placement Officers (TPO / College Admin) Programs ─────────────
  {
    id: 'prog-tpo-1',
    title: 'Campus Placement Strategy 2026 & Corporate Relations',
    subtitle: 'Strategic playbook for TPOs to maximize corporate tie-ups and student placement rates',
    description: 'Learn how top-tier universities streamline campus drives, invite marquee tech firms, manage multi-round virtual interviews, and boost average CTC packages.',
    category: 'TPO Orientation',
    targetAudience: ['COLLEGE_ADMIN', 'TPO'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Dr. Ramesh Sundaram',
    instructorTitle: 'Director of Corporate Relations & Placement Veteran',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    isPublished: true,
    totalDuration: '3h 30m',
    videosCount: 3,
    enrolledCount: 340,
    rating: 5.0,
    tags: ['TPO Strategy', 'Campus Drives', 'Corporate Relations', 'Placement OS'],
    createdAt: '2026-07-15',
    updatedAt: '2026-08-01',
    videos: [
      {
        id: 'vid-t1-1',
        order: 1,
        title: 'Automating Campus Drive Logistics on PlacementOS',
        description: 'Creating job listings, batch eligibility criteria, automated shortlisting, and real-time candidate notifications.',
        duration: '50:00',
        videoUrl: 'https://www.youtube.com/embed/1uF7oP33-9w',
        resources: [
          { id: 'res-t1', title: 'TPO Placement Operating SOP (PDF)', type: 'pdf', url: '#', size: '5.1 MB' }
        ]
      },
      {
        id: 'vid-t1-2',
        order: 2,
        title: 'Corporate Engagement & MoU Signings Guide',
        description: 'Outreach strategies to invite global MNCs, startups, and PSUs for early-bird recruitment slots.',
        duration: '1h 10m',
        videoUrl: 'https://www.youtube.com/embed/bUHFg8CZFuc',
        resources: [
          { id: 'res-t2', title: 'Corporate Outreach Email & Deck Templates', type: 'ppt', url: '#', size: '8.4 MB' }
        ]
      },
      {
        id: 'vid-t1-3',
        order: 3,
        title: 'Student Readiness Analytics & Intervention',
        description: 'Using AI Placement Readiness metrics to identify at-risk students and run targeted bootcamp interventions.',
        duration: '45:00',
        videoUrl: 'https://www.youtube.com/embed/HXV3zeQKqGY',
      }
    ]
  },
  {
    id: 'prog-tpo-2',
    title: 'TPO Operational Excellence & Legal Norms',
    subtitle: 'Offer policies, dual placement rules, and student compliance management',
    description: 'Guidelines on crafting transparent placement policies, handling dream vs non-dream company offers, and managing student disciplinary codes.',
    category: 'Policy & Compliance',
    targetAudience: ['COLLEGE_ADMIN', 'TPO'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Prof. Anjali Mehta',
    instructorTitle: 'Head of Placement Cell & Institutional Policy Advisor',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    isPublished: true,
    totalDuration: '1h 45m',
    videosCount: 2,
    enrolledCount: 290,
    rating: 4.9,
    tags: ['Placement Policy', 'Compliance', 'TPO Guidelines'],
    createdAt: '2026-08-05',
    updatedAt: '2026-08-10',
    videos: [
      {
        id: 'vid-t2-1',
        order: 1,
        title: 'Drafting Standardized Placement Policy Documents',
        description: 'Defining One Student One Job rules, PPO acceptance criteria, and penalty clauses for non-attendance.',
        duration: '45:00',
        videoUrl: 'https://www.youtube.com/embed/y8YH0Qbu5hU',
        resources: [
          { id: 'res-t3', title: 'Sample College Placement Policy Template', type: 'doc', url: '#', size: '1.2 MB' }
        ]
      },
      {
        id: 'vid-t2-2',
        order: 2,
        title: 'Conflict Resolution & Offer Letter Auditing',
        description: 'Handling joining date delays, bond verification, and background checks smoothly.',
        duration: '1h 00m',
        videoUrl: 'https://www.youtube.com/embed/1uF7oP33-9w',
      }
    ]
  },

  // ─── Companies / Recruiters Programs ───────────────────────────────────────
  {
    id: 'prog-rec-1',
    title: 'High-Velocity Campus Hiring & AI Candidate Screening',
    subtitle: 'Streamline bulk campus drives, automated assessments, and speed interviews',
    description: 'Best practices for corporate hiring teams to post multi-tier job descriptions, conduct AI-driven resume screening, and manage candidate pipelines efficiently.',
    category: 'Corporate Hiring',
    targetAudience: ['RECRUITER'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Sanjay Deshmukh',
    instructorTitle: 'VP of Talent Acquisition, TechCorp',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isPublished: true,
    totalDuration: '2h 40m',
    videosCount: 3,
    enrolledCount: 510,
    rating: 4.9,
    tags: ['Recruitment', 'AI Screening', 'Campus Drives', 'Interview Panel'],
    createdAt: '2026-07-20',
    updatedAt: '2026-08-12',
    videos: [
      {
        id: 'vid-r1-1',
        order: 1,
        title: 'Optimizing Job Criteria & AI Match Score Thresholds',
        description: 'How to configure CGPA, branch, and skill filters on PlacementOS to automatically surface top 5% talent.',
        duration: '45:00',
        videoUrl: 'https://www.youtube.com/embed/bUHFg8CZFuc',
        resources: [
          { id: 'res-r1', title: 'Recruiter Playbook for Campus Hiring', type: 'pdf', url: '#', size: '3.9 MB' }
        ]
      },
      {
        id: 'vid-r1-2',
        order: 2,
        title: 'Conducting Structured Technical & HR Panel Rounds',
        description: 'Standardized scorecards, reducing interviewer bias, and automated candidate feedback submission.',
        duration: '55:00',
        videoUrl: 'https://www.youtube.com/embed/HXV3zeQKqGY',
      },
      {
        id: 'vid-r1-3',
        order: 3,
        title: 'Employer Branding on University Portals',
        description: 'Showcasing tech stack, company culture, employee benefits, and internship stipends to attract top talent.',
        duration: '40:00',
        videoUrl: 'https://www.youtube.com/embed/y8YH0Qbu5hU',
        resources: [
          { id: 'res-r2', title: 'Employer Brand Media Guidelines', type: 'ppt', url: '#', size: '6.2 MB' }
        ]
      }
    ]
  }
];

export const useProgramStore = create<ProgramStore>()(
  persist(
    (set, get) => ({
      programs: INITIAL_PROGRAMS,
      completedVideos: {},

      addProgram: (programData) => {
        const id = `prog-${Date.now()}`;
        const newProgram: Program = {
          ...programData,
          id,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ programs: [newProgram, ...state.programs] }));
      },

      updateProgram: (id, updates) => {
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : p
          ),
        }));
      },

      deleteProgram: (id) => {
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id),
        }));
      },

      togglePublishStatus: (id) => {
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === id ? { ...p, isPublished: !p.isPublished } : p
          ),
        }));
      },

      toggleVideoCompleted: (programId, videoId) => {
        const key = `${programId}_${videoId}`;
        set((state) => ({
          completedVideos: {
            ...state.completedVideos,
            [key]: !state.completedVideos[key],
          },
        }));
      },

      getProgramsForRole: (role) => {
        const { programs } = get();
        if (role === 'SUPER_ADMIN') return programs;
        return programs.filter((p) => {
          if (!p.isPublished) return false;
          if (p.targetAudience.includes('ALL')) return true;
          if (role === 'STUDENT' && p.targetAudience.includes('STUDENT')) return true;
          if ((role === 'COLLEGE_ADMIN' || role === 'TPO') &&
              (p.targetAudience.includes('COLLEGE_ADMIN') || p.targetAudience.includes('TPO'))) return true;
          if (role === 'RECRUITER' && p.targetAudience.includes('RECRUITER')) return true;
          return false;
        });
      },
    }),
    {
      name: 'placementos-program-storage',
      partialize: (state) => ({ programs: state.programs, completedVideos: state.completedVideos }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NewsArticle, NewsComment, Role } from '../types';

interface NewsroomStore {
  articles: NewsArticle[];
  addArticle: (articleData: Omit<NewsArticle, 'id' | 'publishedAt' | 'updatedAt' | 'viewsCount' | 'likesCount' | 'comments' | 'slug'>) => void;
  updateArticle: (id: string, updates: Partial<NewsArticle>) => void;
  deleteArticle: (id: string) => void;
  togglePinStatus: (id: string) => void;
  togglePublishStatus: (id: string) => void;
  incrementViews: (id: string) => void;
  toggleLike: (id: string, userId: string) => void;
  addComment: (articleId: string, comment: Omit<NewsComment, 'id' | 'createdAt' | 'articleId'>) => void;
  getArticlesForRole: (role: Role) => NewsArticle[];
}

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'revised-placement-policy-2026',
    title: '🚨 URGENT: Revised Placement Policy & One-Student-One-Job Regulations',
    summary: 'Official Super Admin mandate regarding dream company upgrades, PPO acceptance deadlines, and attendance rules for virtual drives.',
    content: `
### Executive Summary
The Super Administration team has released the official **Campus Placement Directive for 2026**. This policy governs all affiliated colleges, students, and participating recruiters to ensure fair, transparent, and high-yield recruitment drives.

---

### Key Policy Highlights

1. **One-Student-One-Job Norm**:
   - Once a student secures a confirmed offer with a package below ₹8 LPA, they remain eligible for **Dream Category Companies** (packages exceeding ₹12 LPA).
   - Once a student accepts an offer >= ₹12 LPA, all further campus drive registrations for that student will be automatically frozen.

2. **Pre-Placement Offer (PPO) Acceptance**:
   - Students receiving PPOs from summer internships must communicate their acceptance or refusal within **7 business days** of release on PlacementOS.

3. **Drive Attendance Compliance**:
   - Shortlisted candidates who fail to attend scheduled technical or HR interview rounds without a 24-hour prior medical or TPO exemption will be barred from the next two drive eligibility lists.

---

### Action Required by Students
- Review your uploaded resume ATS score before participating in upcoming drives.
- Keep your linked contact details and CGPA grade sheets updated on the Student Portal.
    `,
    category: 'Policy Update',
    priority: 'urgent',
    targetAudience: ['STUDENT', 'COLLEGE_ADMIN', 'TPO'],
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Rajesh Kumar',
    authorRole: 'Chief Super Admin & Placement Director',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    isPinned: true,
    isPublished: true,
    viewsCount: 3840,
    likesCount: 245,
    likedByUsers: ['user-student-1'],
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-02',
    attachments: [
      {
        id: 'att-1',
        name: 'Official_Placement_Policy_Directive_2026.pdf',
        url: '#',
        size: '1.8 MB',
        type: 'pdf'
      }
    ],
    comments: [
      {
        id: 'comm-1',
        articleId: 'news-1',
        userName: 'Arjun Sharma',
        userRole: 'STUDENT',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        content: 'Does the Dream upgrade rule apply if we receive a PPO from our previous internship?',
        createdAt: '2026-09-02 10:30 AM'
      },
      {
        id: 'comm-2',
        articleId: 'news-1',
        userName: 'Rajesh Kumar (Super Admin)',
        userRole: 'SUPER_ADMIN',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        content: 'Hi Arjun! Yes, PPOs follow the exact CTC tier criteria. If the PPO is under ₹8 LPA, you remain eligible for Dream drives.',
        createdAt: '2026-09-02 11:15 AM'
      }
    ]
  },
  {
    id: 'news-2',
    slug: 'national-mega-campus-drive-2026',
    title: '🚀 National Mega Off-Campus Drive 2026: 45+ Product Tech Firms Hiring',
    summary: 'PlacementOS Super Admin partners with leading tech unicorns to host a joint placement drive offering packages up to 32 LPA.',
    content: `
### Mega Hiring Event Announcement
PlacementOS Super Admin is thrilled to announce the **National Mega Tech Campus Drive 2026**. Over 45 marquee product engineering companies, including cloud infrastructure providers, AI startups, and fintech leaders, will be recruiting directly through PlacementOS.

---

### Event Timeline & Details
- **Registration Deadline**: September 25, 2026
- **Online AI Screening Round**: October 2, 2026
- **Live Virtual Interview Days**: October 10 – 12, 2026

---

### Open Job Profiles
1. **Software Development Engineer I (Frontend / Backend / Fullstack)** (CTC: ₹14 – ₹32 LPA)
2. **AI / Machine Learning Associate** (CTC: ₹16 – ₹28 LPA)
3. **Cloud & DevOps Systems Analyst** (CTC: ₹10 – ₹18 LPA)
4. **Data Engineer & Analytics Specialist** (CTC: ₹12 – ₹22 LPA)

---

### How to Apply
Students can apply directly via the **Recommended Jobs** section on their Student Dashboard. Ensure your ATS Resume Score is at least **80%** to guarantee automated eligibility.
    `,
    category: 'Placement Drive Alert',
    priority: 'high',
    targetAudience: ['STUDENT'],
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Super Admin Editorial Team',
    authorRole: 'Corporate Relations & PlacementOS Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    isPinned: true,
    isPublished: true,
    viewsCount: 5120,
    likesCount: 412,
    likedByUsers: [],
    publishedAt: '2026-08-28',
    updatedAt: '2026-08-29',
    attachments: [
      {
        id: 'att-2',
        name: 'National_Drive_Company_List_&_Syllabus.pdf',
        url: '#',
        size: '3.4 MB',
        type: 'pdf'
      }
    ],
    comments: [
      {
        id: 'comm-3',
        articleId: 'news-2',
        userName: 'Priya Verma',
        userRole: 'STUDENT',
        content: 'Is this drive open for 2025 batch backlogged students if backlogs are cleared?',
        createdAt: '2026-08-29 02:15 PM'
      }
    ]
  },
  {
    id: 'news-3',
    slug: 'ai-system-design-hackathon-fellowship',
    title: '💡 AI & System Design Fellowship: $10,000 Prize Pool & Fast-Track Interviews',
    summary: 'Join the 48-hour global student buildathon. Top 50 finalists receive direct interview tickets for Senior SDE & AI Roles.',
    content: `
### Global Student Buildathon & Fellowship
PlacementOS in collaboration with leading AI technology partners announces the **2026 AI & System Design Student Buildathon**.

---

### Key Details
- **Eligibility**: Open to all undergraduate engineering & computer science students.
- **Track 1**: Generative AI Apps & Agentic Systems.
- **Track 2**: Distributed Infrastructure & Scalable System Architecture.

---

### Prizes & Fast-Track Interviews
- **Grand Prize Pool**: $10,000 Cash + AWS/Google Cloud Credits.
- **Recruitment Perk**: Top 50 finalists bypass round 1 screening for participating Tech Giants.
    `,
    category: 'Campus Announcement',
    priority: 'normal',
    targetAudience: ['STUDENT'],
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Vikramaditya Sharma',
    authorRole: 'Head of Technical Mentorship',
    isPinned: false,
    isPublished: true,
    viewsCount: 2190,
    likesCount: 189,
    likedByUsers: [],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    comments: []
  },
  {
    id: 'news-4',
    slug: 'august-2026-placement-champions',
    title: '🏆 August 2026 Placement Champions: 1,400+ Students Placed Across Partner Colleges',
    summary: 'Celebrating our top-performing students and highest CTC packages recorded this month on PlacementOS.',
    content: `
### PlacementOS August Monthly Highlights
We are excited to celebrate an extraordinary month of campus placement milestones across our university network.

---

### Performance Snapshot
- **Total Offers Extended**: 1,420+
- **Highest International Package**: $140,000 USD (₹1.16 Cr CTC)
- **Highest Domestic Package**: ₹44.5 LPA
- **Average Batch Package**: ₹8.6 LPA

Congratulations to all selected candidates, TPO cells, and participating recruitment teams!
    `,
    category: 'Press Release',
    priority: 'normal',
    targetAudience: ['STUDENT', 'COLLEGE_ADMIN', 'TPO', 'RECRUITER'],
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    authorName: 'PlacementOS Press Office',
    authorRole: 'Platform Communications',
    isPinned: false,
    isPublished: true,
    viewsCount: 4100,
    likesCount: 310,
    likedByUsers: [],
    publishedAt: '2026-08-15',
    updatedAt: '2026-08-15',
    comments: []
  }
];

export const useNewsroomStore = create<NewsroomStore>()(
  persist(
    (set, get) => ({
      articles: INITIAL_NEWS,

      addArticle: (articleData) => {
        const id = `news-${Date.now()}`;
        const slug = articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newArticle: NewsArticle = {
          ...articleData,
          id,
          slug,
          viewsCount: 1,
          likesCount: 0,
          likedByUsers: [],
          comments: [],
          publishedAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ articles: [newArticle, ...state.articles] }));
      },

      updateArticle: (id, updates) => {
        set((state) => ({
          articles: state.articles.map((art) =>
            art.id === id
              ? { ...art, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
              : art
          ),
        }));
      },

      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter((art) => art.id !== id),
        }));
      },

      togglePinStatus: (id) => {
        set((state) => ({
          articles: state.articles.map((art) =>
            art.id === id ? { ...art, isPinned: !art.isPinned } : art
          ),
        }));
      },

      togglePublishStatus: (id) => {
        set((state) => ({
          articles: state.articles.map((art) =>
            art.id === id ? { ...art, isPublished: !art.isPublished } : art
          ),
        }));
      },

      incrementViews: (id) => {
        set((state) => ({
          articles: state.articles.map((art) =>
            art.id === id ? { ...art, viewsCount: art.viewsCount + 1 } : art
          ),
        }));
      },

      toggleLike: (id, userId) => {
        set((state) => ({
          articles: state.articles.map((art) => {
            if (art.id !== id) return art;
            const likedList = art.likedByUsers || [];
            const hasLiked = likedList.includes(userId);
            const updatedList = hasLiked
              ? likedList.filter((u) => u !== userId)
              : [...likedList, userId];
            const updatedLikesCount = hasLiked ? Math.max(0, art.likesCount - 1) : art.likesCount + 1;
            return {
              ...art,
              likedByUsers: updatedList,
              likesCount: updatedLikesCount,
            };
          }),
        }));
      },

      addComment: (articleId, commentData) => {
        const newComm: NewsComment = {
          ...commentData,
          id: `comm-${Date.now()}`,
          articleId,
          createdAt: 'Just now',
        };
        set((state) => ({
          articles: state.articles.map((art) =>
            art.id === articleId
              ? { ...art, comments: [...art.comments, newComm] }
              : art
          ),
        }));
      },

      getArticlesForRole: (role) => {
        const { articles } = get();
        if (role === 'SUPER_ADMIN') return articles;
        return articles.filter((art) => {
          if (!art.isPublished) return false;
          if (art.targetAudience.includes('ALL')) return true;
          if (role === 'STUDENT' && art.targetAudience.includes('STUDENT')) return true;
          if ((role === 'COLLEGE_ADMIN' || role === 'TPO') &&
              (art.targetAudience.includes('COLLEGE_ADMIN') || art.targetAudience.includes('TPO'))) return true;
          if (role === 'RECRUITER' && art.targetAudience.includes('RECRUITER')) return true;
          return false;
        });
      },
    }),
    {
      name: 'placementos-newsroom-storage',
      partialize: (state) => ({ articles: state.articles }),
    }
  )
);

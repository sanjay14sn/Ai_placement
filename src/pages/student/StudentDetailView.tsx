import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, GraduationCap, Award, MessageSquare, Briefcase, 
  ExternalLink, Download, Share2, ShieldCheck, Check, UserPlus, UserMinus,
  Sparkles, Star, Code2, Mail, Lock, Clock, X
} from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Card, ConfirmDialog } from '../../components/ui';
import { communityService, studentService } from '../../services';
import { useAuthStore } from '../../store';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface StudentProfile {
  id: string;
  name: string;
  year: string;
  dept: string;
  college: string;
  location: string;
  matchScore: number;
  coverImage: string;
  avatarImage: string;
  skills: string[];
  interests: string[];
  bio: string;
  mutualCount: number;
  mutualAvatars: string[];
  status: 'connect' | 'pending' | 'connected';
  isPlaced: boolean;
  placedAt?: string;
  cgpa: string;
  rollNo: string;
  userId?: string;
  email: string;
  projects: { title: string; tech: string; desc: string }[];
  certifications: string[];
  github?: string;
  linkedin?: string;
  isProfilePublic?: boolean;
}

const STUDENT_DATABASE: Record<string, StudentProfile> = {
  'c1': {
    id: 'c1',
    name: 'Arjun K',
    year: 'Final Year',
    dept: 'CSE 2025 · Computer Science',
    college: 'RV College of Engineering',
    location: 'Bangalore, India',
    matchScore: 95,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    skills: ['C++', 'Distributed Systems', 'Java', 'System Design'],
    interests: ['Backend Development', 'System Architecture'],
    bio: 'Software Engineer placed @ Microsoft. Passionate about distributed systems, microservices, and high-performance computing.',
    mutualCount: 4,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connected',
    isPlaced: true,
    placedAt: 'Microsoft',
    cgpa: '9.42',
    rollNo: '1RV21CSE015',
    email: 'arjun.k@rvce.edu.in',
    projects: [
      { title: 'Cloud Infrastructure Monitoring Dashboard', tech: 'Go · React · Prometheus', desc: 'Real-time telemetry and metrics aggregator for cloud microservices.' }
    ],
    certifications: ['Microsoft Certified: Azure Solutions Architect Expert']
  },
  'c2': {
    id: 'c2',
    name: 'Priya Sharma',
    year: '4th Year',
    dept: 'ECE 2024 · Electronics',
    college: 'VIT Chennai',
    location: 'Bangalore, India',
    matchScore: 92,
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping'],
    interests: ['Product Design', 'User Research'],
    bio: 'Product Designer placed @ Google. Crafting intuitive user experiences and accessible design systems.',
    mutualCount: 2,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connected',
    isPlaced: true,
    placedAt: 'Google',
    cgpa: '9.18',
    rollNo: '20ECE0104',
    email: 'priya.sharma@vit.ac.in',
    projects: [
      { title: 'Accessible Campus Mobile App UX', tech: 'Figma · Design Systems · User Testing', desc: 'End-to-end design research and prototype for inclusive campus mobile app.' }
    ],
    certifications: ['Google UX Design Professional Certificate']
  },
  'c3': {
    id: 'c3',
    name: 'Rohit Menon',
    year: 'Final Year',
    dept: 'IT 2025 · Information Technology',
    college: 'BMS College of Engineering',
    location: 'Hyderabad, India',
    matchScore: 89,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    skills: ['React', 'Node.js', 'AWS', 'GraphQL', 'TypeScript'],
    interests: ['Full Stack Development', 'Cloud Native Apps'],
    bio: 'Full Stack Developer placed @ Amazon. Building resilient web services and high-scale cloud platforms.',
    mutualCount: 3,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connected',
    isPlaced: true,
    placedAt: 'Amazon',
    cgpa: '8.95',
    rollNo: '1BM21IT078',
    email: 'rohit.menon@bmsce.ac.in',
    projects: [
      { title: 'E-Commerce Micro-services Platform', tech: 'React · Node.js · AWS DynamoDB', desc: 'Serverless web platform handling real-time inventory and payments.' }
    ],
    certifications: ['AWS Certified Developer Associate']
  },
  'c4': {
    id: 'c4',
    name: 'Sneha Reddy',
    year: 'Final Year',
    dept: 'CSE 2025 · Computer Science',
    college: 'PES University',
    location: 'Bangalore, India',
    matchScore: 91,
    coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    skills: ['React', 'Next.js', 'TailwindCSS', 'Web Performance'],
    interests: ['Frontend Engineering', 'UI Frameworks'],
    bio: 'Frontend Architect & UI Specialist. Open to software engineering and frontend developer roles.',
    mutualCount: 5,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connect',
    isPlaced: false,
    cgpa: '9.05',
    rollNo: 'PES1202100452',
    email: 'sneha.reddy@pes.edu',
    projects: [
      { title: 'High Performance Component Library', tech: 'React · TypeScript · Tailwind', desc: 'Zero-dependency design kit benchmarked for sub-50ms render times.' }
    ],
    certifications: ['Meta Front-End Developer Professional']
  },
  'c5': {
    id: 'c5',
    name: 'Vikramaditya S',
    year: 'Final Year',
    dept: 'ECE 2025 · Electronics & Comm',
    college: 'MSRIT Bangalore',
    location: 'Bangalore, India',
    matchScore: 87,
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    skills: ['C/C++', 'RTOS', 'ARM Cortex', 'Embedded C', 'IoT'],
    interests: ['Embedded Firmware', 'Robotics'],
    bio: 'Embedded Systems Engineer specializing in microcontrollers, RTOS kernel customization, and hardware design.',
    mutualCount: 3,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connect',
    isPlaced: false,
    cgpa: '8.76',
    rollNo: '1MS21EC089',
    email: 'vikram.s@msrit.edu',
    projects: [
      { title: 'Autonomous Drone Flight Controller', tech: 'Embedded C · FreeRTOS · STM32', desc: 'Real-time telemetry and attitude stabilization system for autonomous quadcopters.' }
    ],
    certifications: ['Arm Certified Embedded Systems Specialist']
  },
  'c6': {
    id: 'c6',
    name: 'Ananya Deshmukh',
    year: '4th Year',
    dept: 'IT 2024 · Information Tech',
    college: 'VJTI Mumbai',
    location: 'Mumbai, India',
    matchScore: 94,
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    skills: ['Apache Spark', 'Python', 'SQL', 'Snowflake', 'Airflow'],
    interests: ['Data Engineering', 'Big Data Analytics'],
    bio: 'Data Engineer placed @ Goldman Sachs. Specialized in large-scale data pipelines, ETL workflows, and real-time streaming analytics.',
    mutualCount: 6,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connected',
    isPlaced: true,
    placedAt: 'Goldman Sachs',
    cgpa: '9.30',
    rollNo: '20IT0032',
    email: 'ananya.d@vjti.ac.in',
    projects: [
      { title: 'Financial Market Tick Data Pipeline', tech: 'PySpark · Kafka · Snowflake', desc: 'Stream processing architecture parsing 10M events/min for algorithmic risk assessment.' }
    ],
    certifications: ['Databricks Certified Data Engineer Professional']
  },
  'c7': {
    id: 'c7',
    name: 'Karthik Raja',
    year: 'Final Year',
    dept: 'CSE 2025 · AI & Data Science',
    college: 'SRM Institute',
    location: 'Bangalore, India',
    matchScore: 96,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    skills: ['PyTorch', 'CUDA', 'Deep Learning', 'LLMs', 'Transformers'],
    interests: ['AI Research', 'Computer Vision'],
    bio: 'ML Research Engineer placed @ NVIDIA. Researching deep neural network optimization and LLM acceleration.',
    mutualCount: 8,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connected',
    isPlaced: true,
    placedAt: 'NVIDIA',
    cgpa: '9.65',
    rollNo: 'RA2111003010112',
    email: 'karthik.raja@srmist.edu.in',
    projects: [
      { title: 'Quantized LLM Inference Engine', tech: 'PyTorch · CUDA C++ · TensorRT', desc: 'Custom CUDA kernels reducing Transformer model memory footprint by 60%.' }
    ],
    certifications: ['NVIDIA Certified Fundamentals of Deep Learning']
  },
  'c8': {
    id: 'c8',
    name: 'Divya Subramanian',
    year: 'Final Year',
    dept: 'ISE 2025 · Information Science',
    college: 'SSN College of Engineering',
    location: 'Chennai, India',
    matchScore: 88,
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    skills: ['Cloud Security', 'Kubernetes Security', 'IAM', 'Penetration Testing'],
    interests: ['Cybersecurity', 'DevSecOps'],
    bio: 'Cloud Security Analyst specializing in threat detection, identity & access management, and DevSecOps pipelines.',
    mutualCount: 4,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connect',
    isPlaced: false,
    cgpa: '8.82',
    rollNo: '21ISE029',
    email: 'divya.s@ssn.edu.in',
    projects: [
      { title: 'Automated Container Vulnerability Scanner', tech: 'Python · Docker · Trivy · AWS GuardDuty', desc: 'CI/CD security gate blocking vulnerable container images prior to deployment.' }
    ],
    certifications: ['Certified Information Systems Security Professional (Study)', 'AWS Certified Security Specialty']
  },
  'c9': {
    id: 'c9',
    name: 'Aditya Verma',
    year: 'Final Year',
    dept: 'CSE 2025 · Computer Science',
    college: 'IIT Dharwad',
    location: 'Bangalore, India',
    matchScore: 90,
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
    skills: ['Go', 'gRPC', 'PostgreSQL', 'Docker', 'System Design'],
    interests: ['Backend Engineering', 'Microservices'],
    bio: 'Backend & Go Engineer building high-throughput REST and gRPC microservices with robust database architectures.',
    mutualCount: 7,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connect',
    isPlaced: false,
    cgpa: '8.91',
    rollNo: '210010008',
    email: 'aditya.verma@iitdh.ac.in',
    projects: [
      { title: 'High Concurrency Rate Limiter Service', tech: 'Go · Redis · gRPC', desc: 'Distributed token-bucket rate limiter handling 50k requests/second per node.' }
    ],
    certifications: ['Certified Kubernetes Administrator (CKA)']
  },
  'c10': {
    id: 'c10',
    name: 'Rahul Gowda',
    year: 'Final Year',
    dept: 'ME 2025 · Mechanical Engineering',
    college: 'RV College of Engineering',
    location: 'Bengaluru, India',
    matchScore: 82,
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Python', 'MATLAB'],
    interests: ['Thermal Engineering', 'Robotics & Automation'],
    bio: 'Mechanical Engineering senior specializing in computational fluid dynamics and automated manufacturing systems.',
    mutualCount: 3,
    mutualAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
    ],
    status: 'connect',
    isPlaced: false,
    cgpa: '7.40',
    rollNo: '1RV21ME042',
    email: 'rahul.g@rvce.edu.in',
    projects: [
      { title: 'Autonomous Robotic Arm with Inverse Kinematics', tech: 'Python · ROS · SolidWorks', desc: '6-DOF robotic manipulator with real-time trajectory optimization.' }
    ],
    certifications: ['Certified SOLIDWORKS Associate (CSWA)'],
    isProfilePublic: false
  }
};

// Aliases for numeric string IDs (1-10)
STUDENT_DATABASE['1'] = STUDENT_DATABASE['c1'];
STUDENT_DATABASE['2'] = STUDENT_DATABASE['c2'];
STUDENT_DATABASE['3'] = STUDENT_DATABASE['c3'];
STUDENT_DATABASE['4'] = STUDENT_DATABASE['c4'];
STUDENT_DATABASE['5'] = STUDENT_DATABASE['c5'];
STUDENT_DATABASE['6'] = STUDENT_DATABASE['c6'];
STUDENT_DATABASE['7'] = STUDENT_DATABASE['c7'];
STUDENT_DATABASE['8'] = STUDENT_DATABASE['c8'];
STUDENT_DATABASE['9'] = STUDENT_DATABASE['c9'];
STUDENT_DATABASE['10'] = STUDENT_DATABASE['c10'];
STUDENT_DATABASE['rahul-gowda'] = STUDENT_DATABASE['c10'];

import { getMediaUrl } from '../../config/api';

const getImageUrl = getMediaUrl;

const profileFromRecord = (raw: Record<string, any>): StudentProfile => {
  const user = raw.userId && typeof raw.userId === 'object' ? raw.userId : null;
  const college = raw.collegeId && typeof raw.collegeId === 'object' ? raw.collegeId : null;
  const placed = raw.placementStatus === 'placed';
  const currentRole = (raw.experience || []).find((item: { isCurrent?: boolean }) => item.isCurrent) || raw.experience?.[0];
  const city = raw.address?.city || college?.city || 'India';
  const state = raw.address?.state;
  const bio = currentRole?.company
    ? `${currentRole.role || 'Software Engineer'} placed @ ${currentRole.company}. Passionate about high performance engineering, modern systems, and continuous learning.`
    : raw.bio || `${placed ? 'Placed student' : 'Aspiring professional'} interested in ${raw.department || 'their field'}.`;
  return {
    id: String(raw.id || raw._id),
    name: user?.name || raw.name || 'Student',
    year: raw.batch || '2025',
    dept: raw.department || '',
    college: college?.name || 'RV College of Engineering',
    location: state ? `${city}, ${state}` : city,
    matchScore: raw.placementReadinessScore || 80,
    coverImage: getImageUrl(raw.coverImage) || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    avatarImage: getImageUrl(user?.avatar || raw.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    skills: raw.skills || [],
    interests: raw.preferredRoles || [],
    bio,
    mutualCount: 0,
    mutualAvatars: [],
    status: 'connect',
    isPlaced: placed,
    placedAt: currentRole?.company,
    cgpa: raw.cgpa != null ? String(raw.cgpa) : 'N/A',
    rollNo: raw.studentId || '',
    userId: user?.id || user?._id || (typeof raw.userId === 'string' ? raw.userId : ''),
    email: user?.email || raw.email || '',
    projects: (raw.projects || []).map((project: { title?: string; technologies?: string[]; tech?: string; description?: string; desc?: string }) => ({
      title: project.title || 'Project',
      tech: Array.isArray(project.technologies) ? project.technologies.join(' · ') : (project.tech || ''),
      desc: project.description || project.desc || '',
    })),
    certifications: (raw.certifications || []).map((item: string | { name?: string }) => typeof item === 'string' ? item : item.name).filter(Boolean) as string[],
    github: raw.github,
    linkedin: raw.linkedIn,
    isProfilePublic: raw.isProfilePublic !== false,
  };
};

export const StudentDetailViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<'connect' | 'pending' | 'connected'>('connect');
  const [connectionId, setConnectionId] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const currentUserId = user?.id || user?._id || '';
  const isSelf = String(currentUserId) === String(student?.userId || '');
  const isPrivate = student?.isProfilePublic === false;
  const isLocked = isPrivate && !isSelf && connectStatus !== 'connected';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      if (!id) {
        if (!cancelled) {
          setStudent(null);
          setLoading(false);
        }
        return;
      }

      try {
        const [record, connections] = await Promise.all([
          studentService.getById(id),
          communityService.getConnections().catch(() => []),
        ]);
        if (cancelled) return;

        const profile = profileFromRecord(record as unknown as Record<string, any>);
        const owner = (record as { userId?: string | { id?: string; _id?: string } }).userId;
        const ownerId = typeof owner === 'object' ? (owner?.id || owner?._id) : owner;
        const docId = String((record as any).id || (record as any)._id || '');
        const asId = (value: { _id?: string; id?: string } | string | null | undefined) =>
          String((value && typeof value === 'object' ? value._id || value.id : value) || '');

        const connection = (connections as { _id?: string; id?: string; status?: string; requester?: { _id?: string; id?: string } | string; recipient?: { _id?: string; id?: string } | string }[]).find((item) => {
          const req = asId(item.requester);
          const rec = asId(item.recipient);
          return req === String(ownerId || '') || rec === String(ownerId || '') || req === docId || rec === docId;
        });

        if (connection?.status === 'accepted') profile.status = 'connected';
        else if (connection?.status === 'pending') profile.status = 'pending';
        setConnectionId(asId(connection?._id || connection?.id));
        setStudent(profile);
        setConnectStatus(profile.status);
      } catch (err) {
        // Fallback to local mock cache if offline or network failure
        const fallback = STUDENT_DATABASE[id];
        if (fallback && !cancelled) {
          setStudent(fallback);
          setConnectStatus(fallback.status);
        } else if (!cancelled) {
          setStudent(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const openMessage = () => {
    if (!student?.userId) return;
    navigate('/student/messages', {
      state: { userId: student.userId, name: student.name, avatar: student.avatarImage, role: student.dept },
    });
  };

  const confirmRemoveConnection = async () => {
    if (!connectionId || !student) return;
    setRemoving(true);
    try {
      await communityService.removeConnection(connectionId);
      setConnectStatus('connect');
      setConnectionId('');
      setConfirmRemove(false);
      window.dispatchEvent(new Event('connections-updated'));
      toast.success(`${student.name} was removed from your connections`);
    } catch {
      toast.error('Could not remove this connection');
    } finally {
      setRemoving(false);
    }
  };

  const cancelConnectRequest = async () => {
    let connId = connectionId;
    if (!connId && student?.userId) {
      try {
        const connections = await communityService.getConnections();
        const asId = (v: any) => String(v?._id || v?.id || v || '');
        const found = connections.find((c: any) => 
          (asId(c.recipient) === String(student.userId) || asId(c.requester) === String(student.userId)) && c.status === 'pending'
        );
        connId = found ? asId(found._id || found.id) : '';
      } catch (e) {}
    }
    if (connId) {
      try {
        await communityService.removeConnection(connId);
      } catch (e) {}
    }
    setConnectStatus('connect');
    setConnectionId('');
    window.dispatchEvent(new Event('connections-updated'));
    toast.success('Connection request cancelled');
  };

  const toggleConnect = async () => {
    const targetId = student?.userId || student?.id;
    if (!targetId || connectStatus !== 'connect') return;
    setConnectStatus('pending');
    try {
      const res = await communityService.createConnectionRequest(targetId);
      const asId = (v: any) => String(v?._id || v?.id || v || '');
      if (res) setConnectionId(asId(res._id || res.id));
      window.dispatchEvent(new Event('connections-updated'));
      toast.success('Connection request sent!');
    } catch (err: any) {
      setConnectStatus('connect');
      toast.error(err?.message || 'Failed to send connection request');
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Student Profile" breadcrumbs={[{ label: 'Explore Students', to: '/student/explore-students' }]}>
        <Card className="p-10 text-sm text-slate-500">Loading profile...</Card>
      </PageWrapper>
    );
  }

  if (!student) {
    return (
      <PageWrapper title="Student Profile" breadcrumbs={[{ label: 'Explore Students', to: '/student/explore-students' }]}>
        <Card className="p-10 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">This student profile could not be opened.</p>
          <Link to="/student/explore-students" className="text-sm font-bold text-indigo-600">Back to Explore Students</Link>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={student.name}
      breadcrumbs={[
        { label: 'CampusConnect', to: '/student/community' },
        { label: 'Explore Students', to: '/student/explore-students' },
        { label: student.name }
      ]}
    >
      <div className="space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/student/explore-students"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Back to Explore Students
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Profile link for ${student.name} copied!`)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              Share
            </button>
          </div>
        </div>

        {/* ── Main Profile Container Card ───────────────────────────────────── */}
        <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-md">
          {/* Cover Image Header Banner */}
          <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900">
            <img
              src={student.coverImage}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none" />
          </div>

          {/* Profile Header Content */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative bg-white dark:bg-slate-900">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <div className="relative shrink-0">
                  <img
                    src={student.avatarImage}
                    alt={student.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl"
                  />
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Online now" />
                </div>

                <div className="mb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {student.name}
                    </h1>
                    <ShieldCheck className="w-6 h-6 text-indigo-500 fill-indigo-100 dark:fill-indigo-950" />
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {student.matchScore}% Match
                    </span>
                    {student.isPlaced && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Placed at {student.placedAt || 'Top Tech Firm'} 🚀
                      </span>
                    )}
                    {student.isProfilePublic === false && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Private Profile
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                    {student.year} · {student.dept}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      {student.college}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      {student.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {connectStatus === "connected" ? (
                  <>
                    <button type="button" className="flex-1 md:flex-initial px-6 py-3 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-default">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Connected
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(true)}
                      className="flex-1 md:flex-initial px-5 py-3 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserMinus className="w-4 h-4" />
                      Remove
                    </button>
                  </>
                ) : connectStatus === "pending" ? (
                  <div className="flex items-center gap-2 flex-1 md:flex-initial">
                    <span className="flex-1 md:flex-initial px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-default">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      Pending
                    </span>
                    <button
                      type="button"
                      onClick={cancelConnectRequest}
                      className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      title="Cancel Request"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel Request
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={toggleConnect}
                    className="flex-1 md:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isLocked ? "Connect to See Full Profile" : "Connect"}
                  </button>
                )}

                <button
                  onClick={openMessage}
                  className="flex-1 md:flex-initial px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Message
                </button>

                {!isLocked && (
                  <button
                    onClick={() => alert(`Downloading ${student.name}'s resume...`)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                    title="Download Resume"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isLocked ? (
              <div className="mt-8 p-8 sm:p-12 text-center rounded-3xl bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 dark:from-slate-800/60 dark:via-indigo-950/20 dark:to-slate-800/60 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 relative overflow-hidden shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
                  🔒 Private Profile
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  Connect to See Full Profile
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  {student.name}'s academic scores, projects, certifications, technical stack, and direct contact details are private. Connect with {student.name} to view their full profile.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {connectStatus === 'connect' ? (
                    <button
                      onClick={toggleConnect}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connect to See Full Profile
                    </button>
                  ) : connectStatus === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-500" /> Request Pending
                      </span>
                      <button
                        onClick={cancelConnectRequest}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Cancel Request
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              /* ── 2 Column Grid Content ────────────────────────────────────────── */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              {/* Left Column (2 cols) */}
              <div className="lg:col-span-2 space-y-8">
                {/* About & Bio */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                    About & Bio
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                    {student.bio}
                  </p>
                </div>

                {/* Technical Skills & Stack */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                    Technical Skills & Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                        {skill}
                      </span>
                    ))}
                    {student.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-3.5 py-1.5 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-900/60 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5 text-violet-500" />
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Projects & Contributions */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">
                    Featured Projects & Contributions
                  </h3>
                  <div className="space-y-4">
                    {student.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-500" />
                            {proj.title}
                          </h4>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 bg-indigo-100/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg">
                            {proj.tech}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {proj.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Certifications */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                    Verified Certifications
                  </h3>
                  <div className="space-y-2.5">
                    {student.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (1 col) */}
              <div className="space-y-6">
                {/* Academic Snapshot Card */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Academic Snapshot
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">CGPA</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {student.cgpa} / 10.0
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Roll / ID</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {student.rollNo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Department</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {student.dept}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Batch Year</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {student.year}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Links Card */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Contact & Links
                  </h3>
                  
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <GithubIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                      <a href={student.github || '#'} className="hover:underline text-indigo-600 dark:text-indigo-400 font-bold truncate">
                        {(student.github || `github.com/${student.name.toLowerCase().replace(/\s+/g, '')}`).replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <LinkedinIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                      <a href={student.linkedin || '#'} className="hover:underline text-indigo-600 dark:text-indigo-400 font-bold truncate">
                        {(student.linkedin || `linkedin.com/in/${student.name.toLowerCase().replace(/\s+/g, '')}`).replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </Card>
      </div>
      <ConfirmDialog
        isOpen={confirmRemove}
        onClose={() => { if (!removing) setConfirmRemove(false); }}
        onConfirm={confirmRemoveConnection}
        title="Remove connection?"
        message={`Are you sure you want to remove ${student.name} from your connections?`}
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removing}
      />
    </PageWrapper>
  );
};

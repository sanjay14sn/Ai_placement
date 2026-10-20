import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Sparkles, Filter, ChevronDown, X, MoreHorizontal, 
  ChevronLeft, ChevronRight, UserPlus, Check, Users, SlidersHorizontal,
  MapPin, GraduationCap, Award, MessageSquare, Briefcase, ExternalLink,
  Download, Share2, ShieldCheck, CheckCircle2, Star, BookOpen, Code2, Mail, Phone, Calendar, Lock, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Modal, Skeleton } from '../../components/ui';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

import { getMediaUrl } from '../../config/api';

const getImageUrl = getMediaUrl;

interface StudentCardData {
  id: string;
  userId?: string;
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
  moreSkillsCount: number;
  bio: string;
  status: 'connect' | 'pending' | 'connected';
  isPlaced: boolean;
  placedAt?: string;
  isAlumni?: boolean;
  isMentor?: boolean;
  cgpa?: string;
  rollNo?: string;
  email?: string;
  projects?: { title: string; tech: string; desc: string }[];
  certifications?: string[];
  connectionId?: string;
  isProfilePublic?: boolean;
}

export const ExploreStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'alumni' | 'mentors'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Selected student for full profile modal
  const [selectedStudentModal, setSelectedStudentModal] = useState<StudentCardData | null>(null);

  // Filter States
  const [selectedCollege, setSelectedCollege] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'match' | 'name'>('relevance');

  // More Filters Modal State
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [placementFilter, setPlacementFilter] = useState<'all' | 'open' | 'placed'>('all');

  const [studentCards, setStudentCards] = useState<StudentCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const applySuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setActivePage(1);
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { communityService } = await import('../../services');
      const data = await communityService.exploreStudents();
      const connData = await communityService.getConnections();
      
      const currentUserStr = localStorage.getItem('auth-storage');
      let currentUserId = '';
      if (currentUserStr) {
        try {
          const authStorage = JSON.parse(currentUserStr);
          currentUserId = authStorage?.state?.user?.id || authStorage?.state?.user?._id || '';
        } catch (e) {}
      }

      if (data && data.length > 0) {
        const formatted: StudentCardData[] = data
          .map((s: any) => {
            const asId = (value: any) => String(value?._id || value?.id || value || '');
            const uId = asId(s.userId) || asId(s._id || s.id);

            let currentStatus: 'connect' | 'pending' | 'connected' = 'connect';
            const conn = connData.find((c: any) => asId(c.requester) === uId || asId(c.recipient) === uId);
            const connectionId = conn ? asId(conn._id || conn.id) : '';

            if (conn) {
              if (conn.status === 'accepted') {
                currentStatus = 'connected';
              } else if (conn.status === 'pending') {
                currentStatus = 'pending';
              }
            }

              const currentExp = (s.experience || []).find((e: any) => e.isCurrent) || s.experience?.[0];
              const bio = currentExp?.company
                ? `${currentExp.role || 'Software Engineer'} placed @ ${currentExp.company}. Passionate about high performance engineering.`
                : (s.resume?.overallScore ? `Placement Readiness Score: ${s.resume.overallScore}%` : `${s.placementStatus === 'placed' ? 'Placed student' : 'Aspiring professional'} interested in ${s.department || 'technology'}.`);

              return {
                id: s._id || s.id,
                userId: uId,
                name: s.userId?.name || s.name || 'Unknown User',
                year: s.batch || 'Unknown Year',
                dept: s.department || 'Unknown Dept',
                college: s.collegeId?.name || 'Unknown College',
                location: s.address?.city || s.collegeId?.city || 'India',
                matchScore: s.placementReadinessScore || (85 + Math.floor(Math.random() * 10)),
                coverImage: getImageUrl(s.coverImage) || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
                avatarImage: getImageUrl(s.userId?.avatar || s.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                skills: s.skills || [],
                interests: s.preferredRoles || [],
                moreSkillsCount: Math.max(0, (s.skills?.length || 0) - 4),
                bio,
                status: currentStatus,
                isPlaced: s.placementStatus === 'placed',
                isAlumni: s.placementStatus === 'placed' || parseInt(s.batch || '2025') <= 2024,
                isMentor: s.placementStatus === 'placed' && (Number(s.cgpa || 0) >= 8.5 || (s.placementReadinessScore || 0) >= 88),
                placedAt: currentExp?.company,
                cgpa: s.cgpa?.toString() || 'N/A',
                rollNo: s.studentId || '',
                email: s.userId?.email || s.email || '',
                projects: (s.projects || []).map((p: any) => ({
                  title: p.title || 'Project',
                  tech: Array.isArray(p.technologies) ? p.technologies.join(' · ') : (p.tech || ''),
                  desc: p.description || p.desc || '',
                })),
                certifications: (s.certifications || []).map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean),
                connectionId,
                isProfilePublic: s.isProfilePublic !== false,
              };
          })
          .filter((card: StudentCardData) => card.userId && String(card.userId) !== String(currentUserId));

        setStudentCards(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return studentCards.filter(card => {
      // Tab Filtering
      if (activeTab === 'alumni' && !card.isAlumni) return false;
      if (activeTab === 'mentors' && !card.isMentor) return false;

      // Text Search
      if (searchQuery.trim() !== '') {
        const queryTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
        const textToSearch = `${card.name} ${card.bio} ${card.college} ${card.dept} ${card.skills.join(' ')} ${card.location} ${card.year}`.toLowerCase();
        
        const matches = queryTerms.every(term => textToSearch.includes(term));
        if (!matches) return false;
      }

      // Dropdown Filters
      if (selectedCollege !== 'All' && !card.college.toLowerCase().includes(selectedCollege.toLowerCase())) return false;
      if (selectedDept !== 'All' && card.dept !== selectedDept) return false;
      if (selectedYear !== 'All' && card.year !== selectedYear) return false;
      if (selectedSkill !== 'All' && !card.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase())) return false;
      if (selectedLocation !== 'All' && !card.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      if (selectedInterest !== 'All' && !card.interests.some(i => i.toLowerCase().includes(selectedInterest.toLowerCase()))) return false;

      // More Filters
      if (card.matchScore < minMatchScore) return false;
      if (placementFilter === 'placed' && !card.isPlaced) return false;
      if (placementFilter === 'open' && card.isPlaced) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // relevance
    });
  }, [studentCards, searchQuery, activeTab, selectedCollege, selectedDept, selectedYear, selectedSkill, selectedLocation, selectedInterest, minMatchScore, placementFilter, sortBy]);

  // Active filter chips bar
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; reset: () => void }[] = [];
    if (selectedCollege !== 'All') chips.push({ key: 'college', label: selectedCollege, reset: () => setSelectedCollege('All') });
    if (selectedDept !== 'All') chips.push({ key: 'dept', label: selectedDept, reset: () => setSelectedDept('All') });
    if (selectedYear !== 'All') chips.push({ key: 'year', label: selectedYear, reset: () => setSelectedYear('All') });
    if (selectedSkill !== 'All') chips.push({ key: 'skill', label: selectedSkill, reset: () => setSelectedSkill('All') });
    if (selectedLocation !== 'All') chips.push({ key: 'location', label: selectedLocation, reset: () => setSelectedLocation('All') });
    if (selectedInterest !== 'All') chips.push({ key: 'interest', label: selectedInterest, reset: () => setSelectedInterest('All') });
    if (minMatchScore > 0) chips.push({ key: 'match', label: `Min ${minMatchScore}% Match`, reset: () => setMinMatchScore(0) });
    if (placementFilter !== 'all') chips.push({ key: 'placement', label: placementFilter === 'placed' ? 'Placed' : 'Open to Offers', reset: () => setPlacementFilter('all') });
    return chips;
  }, [selectedCollege, selectedDept, selectedYear, selectedSkill, selectedLocation, selectedInterest, minMatchScore, placementFilter]);

  const handleClearAll = () => {
    setSelectedCollege('All');
    setSelectedDept('All');
    setSelectedYear('All');
    setSelectedSkill('All');
    setSelectedLocation('All');
    setSelectedInterest('All');
    setMinMatchScore(0);
    setPlacementFilter('all');
  };

  const toggleConnect = async (id: string) => {
    try {
      const targetCard = studentCards.find(c => c.id === id);
      if (!targetCard || targetCard.status !== 'connect') return;

      // Optimistic UI update
      setStudentCards(prev => prev.map(c => {
        if (c.id === id) {
          const updated = {
            ...c,
            status: 'pending' as const
          };
          if (selectedStudentModal && selectedStudentModal.id === id) {
            setSelectedStudentModal(updated);
          }
          return updated;
        }
        return c;
      }));

      const { communityService } = await import('../../services');
      const res = await communityService.createConnectionRequest(targetCard.userId || id);
      const asId = (v: any) => String(v?._id || v?.id || v || '');
      const newConnId = asId(res?._id || res?.id || '');
      if (newConnId) {
        setStudentCards(prev => prev.map(c => c.id === id ? { ...c, connectionId: newConnId } : c));
        if (selectedStudentModal && selectedStudentModal.id === id) {
          setSelectedStudentModal(prev => prev ? { ...prev, connectionId: newConnId } : prev);
        }
      }
      window.dispatchEvent(new Event('connections-updated'));
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Failed to toggle connection:', error);
      // Revert UI on failure
      setStudentCards(prev => prev.map(c => {
        if (c.id === id) {
          const updated = {
            ...c,
            status: 'connect' as const
          };
          if (selectedStudentModal && selectedStudentModal.id === id) {
            setSelectedStudentModal(updated);
          }
          return updated;
        }
        return c;
      }));
      toast.error((error as any)?.message || 'Failed to send connection request');
    }
  };

  const cancelConnect = async (cardId: string, userId?: string) => {
    try {
      const targetCard = studentCards.find(c => c.id === cardId);
      let connId = targetCard?.connectionId;
      const { communityService } = await import('../../services');
      if (!connId) {
        const conns = await communityService.getConnections();
        const asId = (v: any) => String(v?._id || v?.id || v || '');
        const targetUserId = String(userId || targetCard?.userId || '');
        const found = conns.find((c: any) => 
          (asId(c.recipient) === targetUserId || asId(c.requester) === targetUserId) && c.status === 'pending'
        );
        connId = found ? asId(found._id || found.id) : '';
      }
      if (connId) {
        await communityService.removeConnection(connId);
      }
      setStudentCards(prev => prev.map(c => {
        if (c.id === cardId) {
          const updated = { ...c, status: 'connect' as const, connectionId: '' };
          if (selectedStudentModal && selectedStudentModal.id === cardId) {
            setSelectedStudentModal(updated);
          }
          return updated;
        }
        return c;
      }));
      window.dispatchEvent(new Event('connections-updated'));
      toast.success('Connection request cancelled');
    } catch (error) {
      console.error('Failed to cancel connection:', error);
      toast.error('Failed to cancel request');
    }
  };

  // Extract dynamic dropdown options from the fetched students
  const uniqueColleges = useMemo(() => Array.from(new Set(studentCards.map(c => c.college))).filter(Boolean).sort(), [studentCards]);
  const uniqueDepts = useMemo(() => Array.from(new Set(studentCards.map(c => c.dept))).filter(Boolean).sort(), [studentCards]);
  const uniqueYears = useMemo(() => Array.from(new Set(studentCards.map(c => c.year))).filter(Boolean).sort(), [studentCards]);
  const uniqueSkills = useMemo(() => Array.from(new Set(studentCards.flatMap(c => c.skills))).filter(Boolean).sort(), [studentCards]);
  const uniqueLocations = useMemo(() => Array.from(new Set(studentCards.map(c => c.location))).filter(Boolean).sort(), [studentCards]);
  const uniqueInterests = useMemo(() => Array.from(new Set(studentCards.flatMap(c => c.interests))).filter(Boolean).sort(), [studentCards]);

  // Search Suggestions
  const searchSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();
    
    // Add matching names
    studentCards.filter(c => c.name.toLowerCase().includes(query)).forEach(c => suggestions.add(c.name));
    // Add matching skills
    uniqueSkills.filter(s => s.toLowerCase().includes(query)).forEach(s => suggestions.add(s));
    // Add matching colleges
    uniqueColleges.filter(c => c.toLowerCase().includes(query)).forEach(c => suggestions.add(c));
    // Add matching locations
    uniqueLocations.filter(l => l.toLowerCase().includes(query)).forEach(l => suggestions.add(l));

    return Array.from(suggestions).slice(0, 5); // Max 5 suggestions
  }, [searchQuery, studentCards, uniqueSkills, uniqueColleges, uniqueLocations]);

  return (
    <PageWrapper
      title="Explore Students"
      breadcrumbs={[{ label: 'CampusConnect' }, { label: 'Explore Students' }]}
    >
      <div className="space-y-6">
        {/* ── 1. Search Bar Header ─────────────────────────────────────────── */}
        <Card className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-visible z-50">
          <div className="relative w-full" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setActivePage(1); // Reset to first page on search
              }}
              placeholder="Search students by name, skills, college, or location..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <ul className="absolute z-[100] left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden">
                {searchSuggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        applySuggestion(suggestion);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* ── 2. Interactive Filter Dropdowns Row ────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* College Dropdown */}
              <div className="relative">
                <select
                  value={selectedCollege}
                  onChange={e => setSelectedCollege(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">College: All</option>
                  {uniqueColleges.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Department Dropdown */}
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Department: All</option>
                  {uniqueDepts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Year: All</option>
                  {uniqueYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Skills Dropdown */}
              <div className="relative">
                <select
                  value={selectedSkill}
                  onChange={e => setSelectedSkill(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Skills: All</option>
                  {uniqueSkills.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Location Dropdown */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Location: All</option>
                  {uniqueLocations.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Interests Dropdown */}
              <div className="relative">
                <select
                  value={selectedInterest}
                  onChange={e => setSelectedInterest(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Interests: All</option>
                  {uniqueInterests.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* More Filters Modal Trigger Button */}
              <button
                onClick={() => setIsMoreFiltersOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                More Filters
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="appearance-none px-3 py-1.5 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="match">Match Score: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeChips.map(chip => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 rounded-full text-xs font-bold shadow-2xs"
                >
                  {chip.label}
                  <button
                    onClick={chip.reset}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── 3. Full-width Student Cards Grid & Pagination ───────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="text-slate-900 dark:text-white font-extrabold text-sm mr-1">{filteredStudents.length}</span> students found
              </p>
            )}
          </div>

          {isLoading ? (
            <div data-shimmer="students" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800">
                  <Skeleton className="h-24 w-full rounded-none" />
                  <div className="px-3.5 pb-3">
                    <Skeleton className="-mt-8 h-14 w-14 rounded-full border-4 border-white dark:border-slate-900" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                    <div className="mt-3 flex gap-1">
                      <Skeleton className="h-5 w-12 rounded-md" />
                      <Skeleton className="h-5 w-14 rounded-md" />
                      <Skeleton className="h-5 w-10 rounded-md" />
                    </div>
                    <Skeleton className="mt-3 h-3 w-full" />
                    <Skeleton className="mt-1.5 h-3 w-4/5" />
                  </div>
                  <div className="flex justify-end border-t border-slate-100 px-3.5 py-3 dark:border-slate-800">
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredStudents.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map(card => (
                <Card 
                  key={card.id} 
                  onClick={() => navigate(`/student/explore-students/${card.id}`)}
                  className="p-0 overflow-hidden hover:shadow-elevated transition-all duration-300 flex flex-col justify-between border-slate-200/80 dark:border-slate-800 group cursor-pointer"
                >
                  <div>
                    {/* Cover Banner */}
                    <div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900">
                      <img
                        src={card.coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Avatar Overlap & Content */}
                    <div className="px-3.5 pt-0 pb-3 relative">
                      {/* Avatar with online indicator */}
                      <div className="-mt-8 mb-2 flex items-end justify-between">
                        <div className="relative">
                          <img
                            src={card.avatarImage}
                            alt={card.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-md"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/student/explore-students/${card.id}`); }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Student Info */}
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {card.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {card.year} · {card.dept}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mb-2.5">
                        {card.college}
                      </p>

                      {/* Skill Pills */}
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {card.skills.map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                          >
                            {skill}
                          </span>
                        ))}
                        {card.moreSkillsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            +{card.moreSkillsCount}
                          </span>
                        )}
                      </div>

                      {/* Bio Quote */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed min-h-[32px]">
                        {card.bio}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="px-3.5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end">
                    {/* Button Action */}
                    {card.status === 'connected' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/student/messages', { state: { userId: card.userId, name: card.name, avatar: card.avatarImage, role: card.dept } });
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Message
                      </button>
                    ) : card.status === 'pending' ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          Pending
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelConnect(card.id, card.userId);
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          title="Cancel connection request"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleConnect(card.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No students match your filter criteria</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try clearing active filters or selecting different options.</p>
              <Button size="sm" onClick={handleClearAll}>Reset Filters</Button>
            </Card>
          )}

          {/* ── Pagination Footer ────────────────────────────────────────── */}
          {!isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePage === p
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setActivePage(p => Math.min(5, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* ── More Filters Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        title="More Filters"
        size="md"
      >
        <div className="space-y-6 py-2">
          {/* Min Match Score */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Minimum AI Match Score ({minMatchScore}%)
            </label>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minMatchScore}
              onChange={e => setMinMatchScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (All)</span>
              <span>75%</span>
              <span>95%+</span>
            </div>
          </div>

          {/* Placement Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Placement Status
            </label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Statuses' },
                { value: 'open', label: 'Open to Offers' },
                { value: 'placed', label: 'Already Placed' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPlacementFilter(opt.value as any)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    placementFilter === opt.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMinMatchScore(0);
                setPlacementFilter('all');
              }}
            >
              Reset
            </Button>
            <Button type="button" onClick={() => setIsMoreFiltersOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Full Student Profile Modal ────────────────────────────────────────── */}
      {selectedStudentModal && (
        <Modal
          isOpen={!!selectedStudentModal}
          onClose={() => setSelectedStudentModal(null)}
          size="xl"
        >
          <div className="relative -m-6 flex flex-col max-h-[85vh] overflow-y-auto">
            {/* Cover Banner Header */}
            <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 shrink-0">
              <img
                src={selectedStudentModal.coverImage}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent pointer-events-none" />
              
              {/* Action Buttons top right */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => alert(`Profile link for ${selectedStudentModal.name} copied to clipboard!`)}
                  className="p-2 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-xl backdrop-blur-md transition-colors cursor-pointer"
                  title="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedStudentModal(null)}
                  className="p-2 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-xl backdrop-blur-md transition-colors cursor-pointer"
                  title="Close Profile"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Profile Info Section */}
            <div className="px-6 pb-6 pt-0 relative bg-white dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                <div className="flex items-end gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={selectedStudentModal.avatarImage}
                      alt={selectedStudentModal.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
                    />
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Online now" />
                  </div>
                  <div className="mb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {selectedStudentModal.name}
                      </h2>
                      <ShieldCheck className="w-5 h-5 text-indigo-500 fill-indigo-100 dark:fill-indigo-950" />
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {selectedStudentModal.matchScore}% Match
                      </span>
                      {selectedStudentModal.isPlaced && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Placed at {selectedStudentModal.placedAt || 'Top Tech Firm'} 🚀
                        </span>
                      )}
                      {selectedStudentModal.isProfilePublic === false && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Private Profile
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {selectedStudentModal.year} · {selectedStudentModal.dept}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        {selectedStudentModal.college}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {selectedStudentModal.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connect & Message Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  {selectedStudentModal.status === 'connect' ? (
                    <button
                      onClick={() => toggleConnect(selectedStudentModal.id)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      {selectedStudentModal.isProfilePublic === false ? "Connect to See Full Profile" : "Connect"}
                    </button>
                  ) : selectedStudentModal.status === 'pending' ? (
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <span className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-default">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        Pending
                      </span>
                      <button
                        onClick={() => cancelConnect(selectedStudentModal.id, selectedStudentModal.userId)}
                        className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Cancel Request"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Connected
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedStudentModal(null);
                      navigate('/student/messages', { state: { userId: selectedStudentModal.userId, name: selectedStudentModal.name, avatar: selectedStudentModal.avatarImage, role: selectedStudentModal.dept } });
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    Message
                  </button>
                  {!(selectedStudentModal.isProfilePublic === false && selectedStudentModal.status !== 'connected') && (
                    <button
                      onClick={() => alert(`Downloading ${selectedStudentModal.name}'s verified resume...`)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Extended Details Grid or Locked Private Profile */}
              {selectedStudentModal.isProfilePublic === false && selectedStudentModal.status !== 'connected' ? (
                <div className="my-6 p-8 text-center rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/20 dark:from-slate-800/60 dark:to-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3 shadow-xs">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 mb-2">
                    🔒 Private Profile
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">
                    Connect to See Full Profile
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                    {selectedStudentModal.name}'s project work, technical stack, scores, and contacts are locked. Connect to view their full profile.
                  </p>
                  {selectedStudentModal.status === 'connect' ? (
                    <button
                      onClick={() => toggleConnect(selectedStudentModal.id)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Connect to See Full Profile
                    </button>
                  ) : selectedStudentModal.status === 'pending' ? (
                    <div className="inline-flex items-center gap-2">
                      <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> Request Pending
                      </span>
                      <button
                        onClick={() => cancelConnect(selectedStudentModal.id, selectedStudentModal.userId)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel Request
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                {/* Main Info Column (2 cols) */}
                <div className="md:col-span-2 space-y-6">
                  {/* Bio Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      About & Bio
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {selectedStudentModal.bio} Enthusiastic engineering student focused on building high-performance software solutions, collaborating on impactful open-source projects, and exploring modern AI framework implementations.
                    </p>
                  </div>

                  {/* Technical Skills & Expertise */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Technical Skills & Stack
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudentModal.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Code2 className="w-3 h-3 text-indigo-500" />
                          {skill}
                        </span>
                      ))}
                      {selectedStudentModal.interests.map(interest => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/60 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Star className="w-3 h-3 text-violet-500" />
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Projects */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                      Featured Projects & Contributions
                    </h3>
                    <div className="space-y-3">
                      {(selectedStudentModal.projects || [
                        { title: 'PlacementOS Mobile Client', tech: 'Flutter · Firebase · REST API', desc: 'Designed and implemented real-time notifications, interactive placement roadmap, and automated resume score checker.' },
                        { title: 'AI Resume Compatibility Screener', tech: 'Python · PyTorch · Scikit-Learn', desc: 'NLP-based parser that evaluates resume match percentages against job descriptions with 94% accuracy.' }
                      ]).map((proj, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                              {proj.title}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-100/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md">
                              {proj.tech}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {proj.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications & Badges */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Verified Certifications
                    </h3>
                    <div className="space-y-2">
                      {(selectedStudentModal.certifications || [
                        'Google Cloud Certified Associate Cloud Engineer',
                        'Flutter & Dart Complete Masterclass (Udemy)',
                        'PlacementOS Verified AI Readiness Badge'
                      ]).map((cert, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Info Column (1 col) */}
                <div className="space-y-6">
                  {/* Academic Snapshot Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Academic Snapshot
                    </h3>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">CGPA</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                          {selectedStudentModal.cgpa || '8.85'} / 10.0
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Roll / ID</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedStudentModal.rollNo || '21CSE084'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Department</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedStudentModal.dept}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 dark:text-slate-400">Batch Year</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedStudentModal.year === 'Final Year' ? '2025' : '2026'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Social Links */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Contact & Links
                    </h3>
                    
                    <div className="space-y-2.5 text-xs font-medium">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{selectedStudentModal.email || `${selectedStudentModal.name.toLowerCase().replace(/\s+/g, '.')}@sonatech.ac.in`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <GithubIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <a href="#" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                          github.com/{selectedStudentModal.name.toLowerCase().replace(/\s+/g, '')}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <LinkedinIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <a href="#" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                          linkedin.com/in/{selectedStudentModal.name.toLowerCase().replace(/\s+/g, '')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
      )}
    </PageWrapper>
  );
};

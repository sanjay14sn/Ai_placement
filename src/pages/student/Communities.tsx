import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Sparkles, ChevronDown, CheckCircle2, Code2, Cloud, 
  Briefcase, Bot, GraduationCap, Check, Plus, Filter, ShieldCheck, Loader2, X
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge } from '../../components/ui';

interface CommunityItem {
  id: string;
  name: string;
  category: string;
  members: number;
  description: string;
  isVerified: boolean;
  isJoined: boolean;
  iconType: 'bot' | 'code' | 'cloud' | 'briefcase';
  iconBg: string;
  iconColor: string;
  badgeBg: string;
}

export const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All', 'Technology', 'Coding', 'Career', 'Design', 'Entrepreneurship', 'Interview Prep', 'Student Clubs'
  ];

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCommunities = async () => {
    try {
        const { communityService } = await import('../../services');
        const groups = await communityService.getGroups();
        
        const mapped: CommunityItem[] = groups.map((g: any, i: number) => {
          // Assign random styling based on index or string length just for aesthetic variety
          const types: ('bot' | 'code' | 'cloud' | 'briefcase')[] = ['bot', 'code', 'cloud', 'briefcase'];
          const iconType = types[i % types.length];
          
          let iconBg = '';
          let iconColor = '';
          let badgeBg = '';

          if (iconType === 'bot') {
            iconBg = 'bg-purple-100 dark:bg-purple-950/80';
            iconColor = 'text-purple-600 dark:text-purple-400';
            badgeBg = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
          } else if (iconType === 'code') {
            iconBg = 'bg-blue-100 dark:bg-blue-950/80';
            iconColor = 'text-blue-600 dark:text-blue-400';
            badgeBg = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
          } else if (iconType === 'cloud') {
            iconBg = 'bg-emerald-100 dark:bg-emerald-950/80';
            iconColor = 'text-emerald-600 dark:text-emerald-400';
            badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
          } else {
            iconBg = 'bg-amber-100 dark:bg-amber-950/80';
            iconColor = 'text-amber-600 dark:text-amber-400';
            badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
          }

          const currentUserId = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.user?._id;
          const isJoined = g.members?.some((m: any) => (m._id || m) === currentUserId);

          return {
            id: g._id,
            name: g.name,
            category: 'Tech Club', // You can map real categories if added to backend
            members: g.members?.length || 0,
            description: g.description,
            isVerified: true,
            isJoined: !!isJoined,
            iconType,
            iconBg,
            iconColor,
            badgeBg
          };
        });

        setCommunities(mapped);
      } catch (err) {
        console.error('Failed to fetch communities:', err);
      } finally {
        setIsLoading(false);
      }
  };

  React.useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim() || !newCommunityDesc.trim()) return;
    
    setIsCreating(true);
    try {
      const { communityService } = await import('../../services');
      await communityService.createGroup(newCommunityName, newCommunityDesc);
      
      // Refresh list
      await fetchCommunities();
      
      // Reset & close modal
      setNewCommunityName('');
      setNewCommunityDesc('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create community', err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCommunities = useMemo(() => {
    return communities.filter(c => {
      const matchesCategory = selectedCategory === 'All' || 
        c.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Technology' && c.category === 'Tech Club') ||
        (selectedCategory === 'Coding' && c.category === 'Coding Guild');
      
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [communities, selectedCategory, searchQuery]);

  const toggleJoin = (id: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          isJoined: !c.isJoined,
          members: c.isJoined ? c.members - 1 : c.members + 1
        };
      }
      return c;
    }));
  };

  const renderIcon = (type: CommunityItem['iconType'], colorClass: string) => {
    switch (type) {
      case 'bot':
        return <Bot className={`w-6 h-6 ${colorClass}`} />;
      case 'code':
        return <Code2 className={`w-6 h-6 ${colorClass}`} />;
      case 'cloud':
        return <Cloud className={`w-6 h-6 ${colorClass}`} />;
      case 'briefcase':
        return <Briefcase className={`w-6 h-6 ${colorClass}`} />;
      default:
        return <Users className={`w-6 h-6 ${colorClass}`} />;
    }
  };

  return (
    <PageWrapper title="Campus Communities">
      <div className="space-y-6">
        {/* ── 1. Top Section Header ─────────────────────────────────────────── */}
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
            COMMUNITIES
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Campus Communities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Discover communities, clubs, and groups that match your interests and career goals.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 mt-3">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{filteredCommunities.length} communities available</span>
          </div>
        </div>

        {/* ── 2. Category Filter Pills & Search Bar Row ────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input & Select Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search communities..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs focus:outline-none"
              >
                <option value="All">All Communities</option>
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── 3. Communities 3-Column Grid ─────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading communities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCommunities.map(item => (
            <Card key={item.id} className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Top Row: Icon + Badge & Members */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* Left Icon Square */}
                  <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                    {renderIcon(item.iconType, item.iconColor)}
                  </div>

                  {/* Right Badge & Members count */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${item.badgeBg}`}>
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {item.members} members
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight mb-2">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 min-h-[36px]">
                  {item.description}
                </p>

                {/* Verified Campus Community Badge */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  <span>Verified Campus Community</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => navigate(`/student/communities/${item.id}`)}
                  className="flex-1 py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                >
                  View Community
                </button>

                {item.isJoined ? (
                  <button
                    onClick={() => toggleJoin(item.id)}
                    className="flex-1 py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Joined</span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                ) : (
                  <button
                    onClick={() => toggleJoin(item.id)}
                    className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Join Community</span>
                  </button>
                )}
              </div>
            </Card>
          ))}

          {/* ── Card 5: Empty Filter Result / Reset Card ───────────────────── */}
          <Card className="p-6 text-center bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center min-h-[260px]">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              No communities found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[220px] mb-4">
              Try another search or explore a different category.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              Clear Filters
            </button>
          </Card>

          {/* ── Card 6: Want to start a community? CTA Card ──────────────── */}
          <Card className="p-6 text-center bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center min-h-[260px]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              Want to start a community?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[220px] mb-4">
              Create a new community for your college, club, or interest area.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors cursor-pointer shadow-2xs"
            >
              Create Community
            </button>
          </Card>
        </div>
        )}
      </div>

      {/* Create Community Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isCreating && setIsModalOpen(false)} />
          <Card className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Start a Community</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Community Name</label>
                <input
                  type="text"
                  required
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="e.g. Competitive Programmers Guild"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  required
                  rows={4}
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  placeholder="What is this community about? Who is it for?"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </PageWrapper>
  );
};


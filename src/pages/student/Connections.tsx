import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, UserCheck, MessageSquare, Clock, MapPin, 
  LayoutGrid, List, ChevronRight, ArrowRight, Check, X, Sparkles, Building2, Loader2, UserMinus
} from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Card, Button, Avatar, Badge, ConfirmDialog } from '../../components/ui';

interface ConnectionItem {
  id: string;
  connectionId: string;
  profileId?: string;
  name: string;
  dept: string;
  title: string;
  isPlaced: boolean;
  placedAt?: string;
  companyColor?: string;
  location: string;
  avatar: string;
}

interface PendingItem {
  id: string;
  outgoing?: boolean;
  name: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
}

interface SidebarPerson {
  id: string;
  name: string;
  year: string;
  role: string;
  avatar: string;
  isConnected?: boolean;
}

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my' | 'pending' | 'recommended'>('my');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recently' | 'name' | 'company'>('recently');

  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [removeTarget, setRemoveTarget] = useState<ConnectionItem | null>(null);
  const [removing, setRemoving] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingItem[]>([]);
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState<SidebarPerson[]>([]);
  const [recommendedAlumni, setRecommendedAlumni] = useState<SidebarPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { communityService } = await import('../../services');
      const connData = await communityService.getConnections();
      const studentsData = await communityService.exploreStudents();
      
      const currentUserStr = localStorage.getItem('auth-storage');
      let currentUserId = '';
      if (currentUserStr) {
        try {
          const authStorage = JSON.parse(currentUserStr);
          currentUserId = authStorage?.state?.user?.id || authStorage?.state?.user?._id || '';
        } catch (e) {}
      }

      const asId = (value: any) => String(value?._id || value?.id || value || "");
      const me = String(currentUserId || "");
      const accepted = connData.filter((c: any) => c.status === "accepted");
      const pending = connData.filter((c: any) => c.status === "pending" && (asId(c.recipient) === me || asId(c.requester) === me));

      const connectionCards = accepted.map((c: any) => {
        const reqId = asId(c.requester);
        const recId = asId(c.recipient);
        const isRequester = reqId === me;
        const otherUserId = isRequester ? recId : reqId;
        const otherUserObj = isRequester ? c.recipient : c.requester;
        
        const studentProfile = studentsData.find((s: any) => asId(s.userId) === otherUserId || asId(s._id || s.id) === otherUserId);
        const currentExp = (studentProfile?.experience || []).find((e: any) => e.isCurrent) || studentProfile?.experience?.[0];
        const placedCompany = currentExp?.company || studentProfile?.company || (studentProfile?.placementStatus === 'placed' ? 'Top Tech Firm' : '');

        return {
          id: otherUserId,
          connectionId: asId(c._id || c.id),
          profileId: studentProfile?._id || studentProfile?.id || otherUserId,
          name: otherUserObj?.name || studentProfile?.name || "Unknown User",
          dept: studentProfile ? `${studentProfile.batch || '2025'} · ${studentProfile.department || 'Student'}` : 'Student',
          title: studentProfile?.placementStatus === 'placed' ? `Placed @ ${placedCompany}` : 'Student',
          isPlaced: studentProfile?.placementStatus === 'placed',
          placedAt: placedCompany || 'Company',
          companyColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          location: studentProfile?.address?.city || studentProfile?.collegeId?.city || 'India',
          avatar: otherUserObj?.avatar || studentProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
        };
      });
      
      const pendingCards = pending.map((c: any) => {
        const incoming = asId(c.recipient) === me;
        const other = incoming ? c.requester : c.recipient;
        const otherId = asId(other);
        const studentProfile = studentsData.find((s: any) => asId(s.userId) === otherId || asId(s._id || s.id) === otherId);
        const currentExp = (studentProfile?.experience || []).find((e: any) => e.isCurrent) || studentProfile?.experience?.[0];
        const placedCompany = currentExp?.company || studentProfile?.company || (studentProfile?.placementStatus === 'placed' ? 'Top Tech Firm' : '');

        return {
          id: c._id || c.id,
          userId: otherId,
          outgoing: !incoming,
          name: other?.name || studentProfile?.userId?.name || studentProfile?.name || "Unknown",
          role: studentProfile ? `${studentProfile.batch || "2025"} · ${studentProfile.department || "Student"}` : "Student",
          company: incoming ? (studentProfile?.placementStatus === "placed" ? `Placed @ ${placedCompany}` : "Open to Offers") : "Request sent",
          location: studentProfile?.address?.city || studentProfile?.collegeId?.city || "India",
          avatar: other?.avatar || studentProfile?.userId?.avatar || studentProfile?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        };
      });

      setConnections(connectionCards);
      setPendingRequests(pendingCards);

      // Extract recommended alumni
      const alumni = studentsData
        .filter((s: any) => s.placementStatus === 'placed' && s.userId && (s.userId._id || s.userId.id || s.userId) !== currentUserId)
        .map((s: any) => {
          const uId = s.userId?._id || s.userId?.id || s.userId;
          const currentExp = (s.experience || []).find((e: any) => e.isCurrent) || s.experience?.[0];
          const placedCompany = currentExp?.company || s.company || 'Top Tech Firm';
          return {
            id: uId || s._id,
            name: s.userId?.name || s.name || 'Alumni',
            year: s.batch || '2020',
            role: `Placed @ ${placedCompany}`,
            avatar: s.userId?.avatar || s.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
            isConnected: connData.some((conn: any) => asId(conn.requester) === String(uId) || asId(conn.recipient) === String(uId)),
          };
        })
        .slice(0, 3);
      setRecommendedAlumni(alumni);
      
      // Extract people you may know
      const people = studentsData
        .filter((s: any) => s.placementStatus !== 'placed' && s.userId && (s.userId._id || s.userId.id || s.userId) !== currentUserId)
        .map((s: any) => {
          const uId = s.userId?._id || s.userId?.id || s.userId;
          return {
            id: uId || s._id,
            name: s.userId?.name || s.name || 'Student',
            year: s.batch || '2025',
            role: s.department || 'Student',
            avatar: s.userId?.avatar || s.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
            isConnected: connData.some((conn: any) => asId(conn.requester) === String(uId) || asId(conn.recipient) === String(uId)),
          }
        })
        .slice(0, 3);
      setPeopleYouMayKnow(people);
      
    } catch (error) {
      console.error('Failed to fetch connections data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const { communityService } = await import('../../services');
      await communityService.removeConnection(removeTarget.connectionId);
      setConnections(prev => prev.filter(card => card.connectionId !== removeTarget.connectionId));
      window.dispatchEvent(new Event('connections-updated'));
      toast.success(`${removeTarget.name} was removed from your connections`);
      setRemoveTarget(null);
    } catch (error) {
      console.error('Failed to remove connection', error);
      toast.error('Could not remove this connection');
    } finally {
      setRemoving(false);
    }
  };

  const handleAcceptPending = async (connectionId: string, action: 'accepted' | 'rejected') => {
    try {
      const { communityService } = await import('../../services');
      await communityService.updateConnectionRequest(connectionId, action);
      setPendingRequests(prev => prev.filter(p => p.id !== connectionId));
      window.dispatchEvent(new Event('connections-updated'));
      if (action === 'accepted') {
        fetchData(); // Refresh list to show new connection
        toast.success('Connection request accepted!');
      } else {
        toast.info('Connection request declined');
      }
    } catch (err) {
      console.error('Failed to update request', err);
      toast.error('Failed to update request');
    }
  };

  const handleCancelOutgoing = async (connectionId: string) => {
    try {
      const { communityService } = await import('../../services');
      await communityService.removeConnection(connectionId);
      setPendingRequests(prev => prev.filter(p => p.id !== connectionId));
      window.dispatchEvent(new Event('connections-updated'));
      toast.success('Connection request cancelled');
    } catch (err) {
      console.error('Failed to cancel request', err);
      toast.error('Failed to cancel connection request');
    }
  };

  const toggleConnectSidebar = async (id: string, listType: 'people' | 'alumni') => {
    try {
      const { communityService } = await import('../../services');
      await communityService.createConnectionRequest(id);
      window.dispatchEvent(new Event('connections-updated'));
      
      if (listType === 'people') {
        setPeopleYouMayKnow(prev => prev.map(p => p.id === id ? { ...p, isConnected: true } : p));
      } else {
        setRecommendedAlumni(prev => prev.map(p => p.id === id ? { ...p, isConnected: true } : p));
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <PageWrapper
      title="My Network"
      breadcrumbs={[{ label: 'CampusConnect' }, { label: 'My Network' }]}
    >
      <div className="space-y-6">
        {/* ── 2. Navigation Tab Bar matching exact pill design ────────────── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'my'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>My Connections</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {connections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Invites</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {pendingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'recommended'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Recommended Alumni</span>
          </button>
        </div>

        {/* ── 3. Main Grid Layout (Left: Cards Grid / Right: Sidebar Widgets) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left / Main Column (3 Cols wide on lg+) */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your network...</p>
              </div>
            ) : (
              <>
                {activeTab === 'my' && (
              <>
                {/* Header controls row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    My Connections <span className="text-slate-400 font-semibold text-sm">({connections.length})</span>
                  </h2>

                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none cursor-pointer shadow-2xs"
                      >
                        <option value="recently">Recently Connected</option>
                        <option value="name">Name A-Z</option>
                        <option value="company">Company</option>
                      </select>
                    </div>

                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connection Cards Grid matching exact layout */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
                  {connections.map(card => (
                    <Card key={card.id} className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl hover:shadow-md transition-shadow relative group">
                      {/* Avatar & Online status */}
                      <div className="relative mb-3 inline-block">
                        <img
                          src={card.avatar}
                          alt={card.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                      </div>

                      {/* Info Details */}
                      <div className="space-y-1 mb-3">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {card.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {card.dept}
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {card.title}
                        </p>
                      </div>

                      {/* Placed @ Company Badge / Open to Offers Badge */}
                      <div className="mb-3">
                        {card.isPlaced && card.placedAt ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${card.companyColor}`}>
                            <Building2 className="w-3.5 h-3.5" />
                            Placed @ {card.placedAt}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            Open to Offers
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-4">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{card.location}</span>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate('/student/messages', { state: { userId: card.id, name: card.name, avatar: card.avatar, role: card.title } })}
                          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </button>
                        <button
                          onClick={() => navigate(`/student/explore-students/${card.profileId || card.id}`)}
                          className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(card)}
                          className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Bottom Start Building Network Banner matching exact design */}
                <Card className="p-8 sm:p-10 text-center bg-gradient-to-b from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-900 border-dashed border-2 border-indigo-200 dark:border-slate-800 rounded-3xl mt-8">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shadow-md">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Start building your network
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Connect with students and alumni from your campus to explore new career opportunities and mentorship.
                    </p>
                    <button
                      onClick={() => navigate('/student/explore-students')}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      Explore People
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  Pending Invites <span className="text-amber-500 font-semibold text-sm">({pendingRequests.length})</span>
                </h2>

                {pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map(item => (
                      <Card key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-3.5">
                          <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover shadow-xs" />
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{item.role}</p>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 inline-block">{item.company}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.outgoing ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Request sent
                              </span>
                              <button
                                onClick={() => handleCancelOutgoing(item.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel Request
                              </button>
                            </div>
                          ) : (
                            <>
                          <button
                            onClick={() => handleAcceptPending(item.id, "accepted")}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleAcceptPending(item.id, "rejected")}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-slate-500 font-medium">
                    No pending connection invitations right now.
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'recommended' && (
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  Recommended Alumni
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recommendedAlumni.map(person => (
                    <Card key={person.id} className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <div>
                        <img src={person.avatar} alt={person.name} className="w-14 h-14 rounded-full object-cover mb-3" />
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{person.name}</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{person.year}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{person.role}</p>
                      </div>
                      <button
                        onClick={() => toggleConnectSidebar(person.id, 'alumni')}
                        className={`mt-4 w-full py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          person.isConnected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                        }`}
                      >
                        {person.isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        {person.isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* ── Right Column / Sidebar Widgets (1 Col wide on lg+) ────────── */}
          <div className="space-y-5">
            {/* Widget 1: Grow your network */}
            <Card className="p-5 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Grow your network
                </h3>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Find and connect with people from your campus.
              </p>
              <button
                onClick={() => navigate('/student/explore-students')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore People</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Card>

            {/* Widget 2: People you may know */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  People you may know
                </h3>
                <button
                  onClick={() => navigate('/student/explore-students')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  See all
                </button>
              </div>

              <div className="space-y-3.5">
                {peopleYouMayKnow.map(person => (
                  <div key={person.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={person.avatar} alt={person.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{person.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{person.year}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">{person.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleConnectSidebar(person.id, 'people')}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                        person.isConnected
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800'
                      }`}
                      title={person.isConnected ? 'Connected' : 'Connect'}
                    >
                      {person.isConnected ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Widget 3: Recommended Alumni */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Recommended Alumni
                </h3>
                <button
                  onClick={() => navigate('/student/explore-students')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  See all
                </button>
              </div>

              <div className="space-y-3.5">
                {recommendedAlumni.map(person => (
                  <div key={person.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={person.avatar} alt={person.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{person.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{person.year}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">{person.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleConnectSidebar(person.id, 'alumni')}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                        person.isConnected
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800'
                      }`}
                      title={person.isConnected ? 'Connected' : 'Connect'}
                    >
                      {person.isConnected ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={Boolean(removeTarget)}
        onClose={() => { if (!removing) setRemoveTarget(null); }}
        onConfirm={handleRemoveConnection}
        title="Remove connection?"
        message={removeTarget ? `Are you sure you want to remove ${removeTarget.name} from your connections?` : ''}
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removing}
      />
    </PageWrapper>
  );
};

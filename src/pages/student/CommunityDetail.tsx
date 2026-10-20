import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Bot, Code2, Cloud, Briefcase, CheckCircle2, MessageSquare, Share2, Info, FileText, Loader2, Shield } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Avatar } from '../../components/ui';

export const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [community, setCommunity] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessingAction, setIsProcessingAction] = React.useState(false);

  const fetchCommunity = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { communityService } = await import('../../services');
      const groupData = await communityService.getGroupById(id);
      
      const currentUserId = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.user?._id;
      const isJoined = groupData.members?.some((m: any) => (m._id || m) === currentUserId);

      // Random style mapping for aesthetic
      const i = groupData.name.length;
      const types: ('bot' | 'code' | 'cloud' | 'briefcase')[] = ['bot', 'code', 'cloud', 'briefcase'];
      const iconType = types[i % types.length];
      let iconBg = 'bg-slate-100';
      let iconColor = 'text-slate-600';
      
      if (iconType === 'bot') {
        iconBg = 'bg-purple-100 dark:bg-purple-950/80';
        iconColor = 'text-purple-600 dark:text-purple-400';
      } else if (iconType === 'code') {
        iconBg = 'bg-blue-100 dark:bg-blue-950/80';
        iconColor = 'text-blue-600 dark:text-blue-400';
      } else if (iconType === 'cloud') {
        iconBg = 'bg-emerald-100 dark:bg-emerald-950/80';
        iconColor = 'text-emerald-600 dark:text-emerald-400';
      } else {
        iconBg = 'bg-amber-100 dark:bg-amber-950/80';
        iconColor = 'text-amber-600 dark:text-amber-400';
      }

      setCommunity({
        ...groupData,
        category: 'Tech Club', // Using static category for now
        membersCount: groupData.members?.length || 0,
        isJoined: !!isJoined,
        iconType,
        iconBg,
        iconColor
      });
    } catch (error) {
      console.error('Failed to fetch community', error);
      setCommunity(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const toggleJoin = async () => {
    if (!id || !community) return;
    setIsProcessingAction(true);
    try {
      const { communityService } = await import('../../services');
      if (community.isJoined) {
        await communityService.leaveGroup(id);
      } else {
        await communityService.joinGroup(id);
      }
      await fetchCommunity();
    } catch (error) {
      console.error('Failed to toggle join status', error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Loading Community">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading community details...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!community) {
    return (
      <PageWrapper title="Community Not Found">
        <div className="flex flex-col items-center justify-center py-32">
          <Users className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">Unknown Community</h2>
          <p className="text-slate-500 font-medium">This community does not exist or has been removed.</p>
          <Button className="mt-6" onClick={() => navigate('/student/communities')}>
            Back to Communities
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const renderIcon = (type: string, colorClass: string, sizeClass = 'w-10 h-10') => {
    switch (type) {
      case 'bot': return <Bot className={`${sizeClass} ${colorClass}`} />;
      case 'code': return <Code2 className={`${sizeClass} ${colorClass}`} />;
      case 'cloud': return <Cloud className={`${sizeClass} ${colorClass}`} />;
      case 'briefcase': return <Briefcase className={`${sizeClass} ${colorClass}`} />;
      default: return <Users className={`${sizeClass} ${colorClass}`} />;
    }
  };

  return (
    <PageWrapper title={community.name} breadcrumbs={[{ label: 'Communities', to: '/student/communities' }, { label: community.name }]}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/student/communities')}
          className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Communities
        </button>

        {/* Header Banner Section */}
        <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-3xl relative">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-10 -mb-20 w-48 h-48 bg-black/10 rounded-full blur-2xl mix-blend-overlay"></div>
          
          <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${community.iconBg} shadow-2xl flex items-center justify-center shrink-0 backdrop-blur-md border-4 border-white/20`}>
              {renderIcon(community.iconType, community.iconColor, 'w-12 h-12')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                  {community.category}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Users className="w-3.5 h-3.5" /> {community.membersCount} Members
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{community.name}</h1>
              <p className="text-indigo-100 font-medium max-w-2xl leading-relaxed text-sm sm:text-base">
                {community.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed / Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Community Feed</h2>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No posts yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">Be the first to start a discussion in {community.name}!</p>
                <Button className="mt-4" size="sm">Start Discussion</Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" /> About
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                {community.description}
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full flex items-center justify-center gap-2" 
                  variant={community.isJoined ? 'outline' : 'primary'}
                  onClick={toggleJoin}
                  disabled={isProcessingAction}
                >
                  {isProcessingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : community.isJoined ? (
                    'Leave Community'
                  ) : (
                    'Join Community'
                  )}
                </Button>
                <Button className="w-full" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> Rules
              </h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3 font-medium">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Be respectful to all members.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> No spam or self-promotion.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Stay on topic regarding {community.category.toLowerCase()}.</li>
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Members ({community.members?.length || 0})
              </h3>
              <div className="space-y-4">
                {/* Admins / Owners */}
                {community.admins?.map((admin: any) => (
                  <div key={admin._id} className="flex items-center gap-3">
                    <Avatar src={admin.avatar} name={admin.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{admin.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Owner</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Regular Members */}
                {community.members?.filter((m: any) => !community.admins?.some((a: any) => a._id === m._id)).map((member: any) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 truncate">Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

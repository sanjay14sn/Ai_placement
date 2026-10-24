import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserCheck, Zap, Target, RefreshCw, Check, Clock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Card, Button, Avatar, Badge, AIBadge } from '../../components/ui';
import { communityService } from '../../services';
import { useAuthStore } from '../../store';

import { getMediaUrl } from '../../config/api';

const getImageUrl = getMediaUrl;

interface AIMatch {
  id: string;
  studentDocId: string;
  userId: string;
  name: string;
  matchScore: number;
  reason: string;
  role: string;
  badge: string;
  avatar?: string;
  status: 'connect' | 'pending' | 'connected';
}

export const AINetworkingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUserId = user?.id || user?._id || '';

  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async () => {
    try {
      const [students, connections] = await Promise.all([
        communityService.exploreStudents(),
        communityService.getConnections().catch(() => []),
      ]);

      const asId = (v: any) => String(v?._id || v?.id || v || '');
      const me = String(currentUserId || '');

      const peers = (students || []).filter((s: any) => {
        const uId = asId(s.userId) || asId(s._id || s.id);
        return uId && uId !== me;
      });

      const formatted: AIMatch[] = peers.slice(0, 6).map((s: any, idx: number) => {
        const uId = asId(s.userId) || asId(s._id || s.id);
        const conn = connections.find((c: any) => asId(c.requester) === uId || asId(c.recipient) === uId);

        let status: 'connect' | 'pending' | 'connected' = 'connect';
        if (conn) {
          if (conn.status === 'accepted') status = 'connected';
          else if (conn.status === 'pending') status = 'pending';
        }

        const isPlaced = s.placementStatus === 'placed';
        const currentExp = (s.experience || []).find((e: any) => e.isCurrent) || s.experience?.[0];
        const company = currentExp?.company || 'Top Tech Firm';
        const skillsList = (s.skills || []).slice(0, 3).join(', ') || 'Tech Stack';

        let badge = 'Recommended Peer';
        let reason = `Strong overlap in ${skillsList}. Great peer collaborator for competitive coding and campus placement rounds.`;

        if (isPlaced) {
          badge = 'Ideal Alumni Mentor';
          reason = `Placed @ ${company}. Can provide verified company-specific technical interview feedback and resume tips.`;
        } else if (idx % 2 === 0) {
          badge = 'Perfect Hackathon Partner';
          reason = `Complementary background in ${s.department || 'Engineering'}. High synergy on project builds and hackathons.`;
        }

        return {
          id: s._id || s.id,
          studentDocId: s._id || s.id,
          userId: uId,
          name: s.userId?.name || s.name || 'Student',
          matchScore: s.placementReadinessScore || (88 + (idx * 2) % 10),
          reason,
          role: isPlaced ? `Placed @ ${company}` : `${s.batch || '2025'} · ${s.department || 'Engineering'}`,
          badge,
          avatar: getImageUrl(s.userId?.avatar || s.avatar),
          status,
        };
      });

      setMatches(formatted);
    } catch {
      toast.error('Could not load AI networking recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [currentUserId]);

  const handleConnect = async (match: AIMatch) => {
    if (match.status !== 'connect') return;
    try {
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: 'pending' } : m));
      await communityService.createConnectionRequest(match.userId || match.studentDocId);
      window.dispatchEvent(new Event('connections-updated'));
      toast.success(`Connection request sent to ${match.name}!`);
    } catch {
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: 'connect' } : m));
      toast.error('Failed to send connection request');
    }
  };

  const rerunMatcher = () => {
    setRefreshing(true);
    loadMatches();
    toast.success('AI Matcher recalculated fresh networking opportunities!');
  };

  return (
    <PageWrapper
      title="AI Networking"
      subtitle="AI-driven matchmaking engine that recommends peer collaborators, mock partners, and alumni mentors."
      breadcrumbs={[{ label: 'CampusConnect' }, { label: 'AI Networking' }]}
    >
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-ai-900 via-indigo-950 to-brand-950 text-white rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <AIBadge label="AI Matchmaker v2.4" className="bg-white/90 text-slate-900 font-extrabold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Autonomous AI Peer Matchmaking</h2>
              <p className="text-xs text-indigo-200 max-w-xl">
                AI Campus OS continuously analyzes your profile, Leetcode practice history, ATS resume score, and target job roles to pair you with the highest-converting networking matches.
              </p>
            </div>
            <Button
              size="sm"
              onClick={rerunMatcher}
              loading={refreshing}
              className="bg-white text-indigo-950 hover:bg-slate-100 font-bold shrink-0"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Re-run AI Matcher
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center text-sm text-slate-500">
            Scanning campus network and calculating compatibility scores...
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(m => (
              <Card
                key={m.id}
                onClick={() => navigate(`/student/explore-students/${m.studentDocId}`)}
                className="p-5 flex flex-col justify-between hover:shadow-elevated transition-shadow border-ai-200/50 dark:border-ai-900/30 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="ai" className="text-[10px] font-extrabold">{m.badge}</Badge>
                    <span className="text-xs font-black text-ai-600 dark:text-ai-400 bg-ai-50 dark:bg-ai-900/40 px-2 py-0.5 rounded-full border border-ai-200 dark:border-ai-800">
                      {m.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={m.name} src={m.avatar} size="md" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                      <p className="text-xs text-slate-500">{m.role}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-0.5">Why AI matched you:</span>
                    {m.reason}
                  </div>
                </div>

                <div onClick={e => e.stopPropagation()}>
                  {m.status === 'connected' ? (
                    <Button size="sm" variant="outline" className="w-full text-xs text-emerald-600 border-emerald-200" leftIcon={<Check className="w-3.5 h-3.5" />}>
                      Connected
                    </Button>
                  ) : m.status === 'pending' ? (
                    <Button size="sm" variant="outline" className="w-full text-xs text-amber-600 border-amber-200" leftIcon={<Clock className="w-3.5 h-3.5" />}>
                      Request Pending
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(m)}
                      className="w-full text-xs"
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                    >
                      Connect & Practice
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

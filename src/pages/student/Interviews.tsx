import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, User, CheckCircle2, ArrowUpRight,
  Search, ShieldAlert, Award, Star, BookOpen, Sparkles, Filter,
  Building2, ChevronRight, MessageSquare, ExternalLink, RefreshCw
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Avatar, AIBadge, Progress, EmptyState, Skeleton } from '../../components/ui';
import { interviewService } from '../../services';
import { formatDate, formatTime } from '../../utils';
import { toast } from 'sonner';
import type { Interview } from '../../types';

export const StudentInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      // Fetch interviews for the current student
      const res = await interviewService.getAll({ studentId: 'student-1', limit: 50 });
      // If mock list for student-1 is empty or sparse, fall back to all interviews
      if (res.data.length === 0) {
        const allRes = await interviewService.getAll({ limit: 20 });
        setInterviews(allRes.data);
      } else {
        setInterviews(res.data);
      }
    } catch {
      toast.error('Failed to load interview schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled' || i.status === 'confirmed');
  const completedInterviews = interviews.filter(i => i.status === 'completed' || i.status === 'attended');

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch =
      interview.company.name.toLowerCase().includes(search.toLowerCase()) ||
      (interview.job?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      interview.type.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'upcoming') {
      return interview.status === 'scheduled' || interview.status === 'confirmed';
    }
    if (activeTab === 'completed') {
      return interview.status === 'completed' || interview.status === 'attended';
    }
    return true;
  });

  return (
    <PageWrapper
      title="My Interviews"
      subtitle="Track your upcoming campus drive rounds, technical interviews, and evaluation feedback."
      breadcrumbs={[{ label: 'Student' }, { label: 'Interviews' }]}
      actions={
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchInterviews}>
          Refresh Schedule
        </Button>
      }
    >
      {/* Key Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-brand-50/50 to-brand-100/30 dark:from-brand-950/30 dark:to-brand-900/10">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{upcomingInterviews.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming Rounds</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{completedInterviews.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-ai-50/50 to-purple-100/30 dark:from-ai-950/30 dark:to-purple-900/10">
          <div className="w-10 h-10 rounded-2xl bg-ai-600 text-white flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">88%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg Feedback Score</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">2</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Final Rounds</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Interviews ({interviews.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Upcoming ({upcomingInterviews.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Completed ({completedInterviews.length})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search company, role, or round..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-56"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-slate-400" />}
          title="No interviews found"
          description={search ? `No results for "${search}"` : "You don't have any interviews scheduled under this filter."}
          action={search ? { label: 'Clear Search', onClick: () => setSearch('') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map((interview) => {
            const isUpcoming = interview.status === 'scheduled' || interview.status === 'confirmed';
            const isCompleted = interview.status === 'completed' || interview.status === 'attended';

            return (
              <Card key={interview.id} hover className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-700">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-ai-600 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                        {interview.company.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          {interview.company.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {interview.job?.title || 'Software Development Role'}
                        </p>
                      </div>
                    </div>

                    <Badge variant={
                      isCompleted ? 'green' :
                      isUpcoming ? 'indigo' :
                      interview.status === 'cancelled' ? 'red' : 'slate'
                    } dot>
                      {interview.status === 'scheduled' ? 'Scheduled' :
                       interview.status === 'confirmed' ? 'Confirmed' :
                       interview.status === 'completed' ? 'Completed' : interview.status}
                    </Badge>
                  </div>

                  {/* Details Pill Box */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-slate-400">Round Details</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Round {interview.round}: {interview.type.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-slate-400">Mode & Duration</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        {interview.mode === 'video' ? <Video className="w-3.5 h-3.5 text-brand-500" /> : <User className="w-3.5 h-3.5 text-brand-500" />}
                        {interview.mode === 'video' ? 'Video Call' : 'In Person'} ({interview.duration} mins)
                      </span>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
                        <Clock className="w-4 h-4" /> {formatTime(interview.time)} · {formatDate(interview.date)}
                      </span>
                      {interview.panelists && interview.panelists.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          Panel: {interview.panelists.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completed Feedback Section (if feedback exists) */}
                  {isCompleted && interview.feedback && (
                    <div className="mb-4 p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <Award className="w-4 h-4 text-emerald-600" /> Interview Scorecard
                        </span>
                        <Badge variant="green" className="text-[10px]">
                          {interview.feedback.recommendation.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white dark:bg-slate-800 rounded-xl mb-3 border border-emerald-100 dark:border-emerald-900/40">
                        <div>
                          <p className="text-[10px] text-slate-400">Technical</p>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{interview.feedback.technicalScore}/100</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Communication</p>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{interview.feedback.communicationScore}/100</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Overall</p>
                          <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{interview.feedback.overallScore}%</p>
                        </div>
                      </div>

                      {interview.feedback.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          "{interview.feedback.notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  {isUpcoming ? (
                    <>
                      {interview.meetingLink ? (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="ai" size="sm" className="w-full text-xs" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                            Join Google Meet
                          </Button>
                        </a>
                      ) : (
                        <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => toast.info(`Venue: ${interview.venue || 'Campus Auditorium'}`)}>
                          View Venue Details
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => navigate('/student/interview-prep')}
                      >
                        Interview Prep
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/student/applications')}>
                      View Application Details
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

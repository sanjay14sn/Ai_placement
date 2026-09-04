import React, { useState } from 'react';
import { 
  Calendar, Clock, Video, UserCheck, Star, Plus, Search, 
  CheckCircle2, XCircle, FileText, Sparkles, MessageSquare, ExternalLink 
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal, Avatar } from '../../components/ui';
import { mockInterviews } from '../../mock/data';
import { formatDate } from '../../utils';
import { toast } from 'sonner';

export const RecruiterInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState(mockInterviews.slice(0, 20));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Feedback Modal State
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [techScore, setTechScore] = useState('85');
  const [commScore, setCommScore] = useState('90');
  const [probScore, setProbScore] = useState('80');
  const [recommendation, setRecommendation] = useState('recommend');
  const [notes, setNotes] = useState('Candidate demonstrated strong technical clarity and good problem solving skills.');

  const filteredInterviews = interviews.filter(inv => {
    const matchesSearch = inv.student.name.toLowerCase().includes(search.toLowerCase()) ||
                          inv.job.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenFeedback = (inv: any) => {
    setSelectedInterview(inv);
    setIsFeedbackModalOpen(true);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setInterviews(prev => prev.map(item => item.id === selectedInterview.id ? {
      ...item,
      status: 'completed',
      feedback: {
        technicalScore: parseInt(techScore),
        communicationScore: parseInt(commScore),
        problemSolvingScore: parseInt(probScore),
        culturalFitScore: 85,
        overallScore: Math.round((parseInt(techScore) + parseInt(commScore) + parseInt(probScore)) / 3),
        recommendation: recommendation as any,
        strengths: ['Great fundamentals', 'Clean coding style'],
        improvements: ['Can expand system design experience'],
        notes,
      }
    } : item));

    setIsFeedbackModalOpen(false);
    toast.success(`🎉 Interview feedback submitted for ${selectedInterview.student.name}!`);
  };

  return (
    <PageWrapper
      title="Candidate Interviews"
      subtitle="Schedule rounds, conduct live interviews, and submit evaluation feedback"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Interviews' }]}
    >
      <div className="space-y-6">
        {/* KPI METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-brand-600/5 to-indigo-600/5 border border-brand-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Interviews</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{interviews.length} Slots</div>
            <p className="text-[11px] text-brand-600 font-medium mt-1">Next 7 Days Agenda</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {interviews.filter(i => i.status === 'completed' || i.feedback).length} Rounds
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Feedback Submitted</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Feedback</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">4 Reviews</div>
            <p className="text-[11px] text-slate-500 mt-1">Requires Panelist Score</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommended Fit</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">82% High Fit</div>
            <p className="text-[11px] text-slate-500 mt-1">Based on Panelist Ratings</p>
          </Card>
        </div>

        {/* SEARCH AND FILTERS */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search candidate name or position..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              className="md:w-48"
            />

            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Interview Types' },
                { value: 'technical', label: 'Technical' },
                { value: 'coding', label: 'Coding / Systems' },
                { value: 'hr', label: 'HR / Behavioral' },
              ]}
              className="md:w-48"
            />
          </div>
        </Card>

        {/* INTERVIEW CARDS GRID */}
        <div className="space-y-3">
          {filteredInterviews.map((inv) => (
            <Card key={inv.id} className="p-5 hover:shadow-elevated transition-all border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                
                {/* Candidate & Round Info */}
                <div className="flex items-center gap-4 flex-1">
                  <Avatar name={inv.student.name} size="md" />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{inv.student.name}</h3>
                      <Badge variant="indigo" className="text-[10px] capitalize">
                        Round {inv.round}: {inv.type}
                      </Badge>
                      <Badge 
                        variant={inv.status === 'completed' ? 'green' : inv.status === 'scheduled' ? 'indigo' : 'slate'}
                        className="text-[10px] capitalize"
                      >
                        {inv.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Position: <strong className="text-slate-900 dark:text-white">{inv.job.title}</strong> · Dept: {inv.student.department}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {formatDate(inv.date)} at {inv.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {inv.duration} Mins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score feedback & Action buttons */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {inv.feedback ? (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          Rating: {inv.feedback.overallScore}/100
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize block mt-0.5">
                        Rec: {inv.feedback.recommendation.replace('_', ' ')}
                      </span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenFeedback(inv)}
                      leftIcon={<FileText className="w-3.5 h-3.5" />}
                    >
                      Submit Feedback
                    </Button>
                  )}

                  <a 
                    href={inv.meetingLink || 'https://meet.google.com/abc-defg-hij'} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <Button size="sm" leftIcon={<Video className="w-3.5 h-3.5" />}>
                      Join Video Call
                    </Button>
                  </a>
                </div>

              </div>
            </Card>
          ))}
        </div>

        {/* FEEDBACK MODAL */}
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title={`Interviewer Evaluation: ${selectedInterview?.student.name}`}
        >
          {selectedInterview && (
            <form onSubmit={handleSaveFeedback} className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                <p>Candidate: <strong className="text-slate-900 dark:text-white">{selectedInterview.student.name}</strong></p>
                <p>Round: <strong className="text-slate-900 dark:text-white">Round {selectedInterview.round} ({selectedInterview.type})</strong></p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Tech Score (0-100)"
                  type="number"
                  value={techScore}
                  onChange={e => setTechScore(e.target.value)}
                  required
                />
                <Input
                  label="Comm Score (0-100)"
                  type="number"
                  value={commScore}
                  onChange={e => setCommScore(e.target.value)}
                  required
                />
                <Input
                  label="Problem Solving"
                  type="number"
                  value={probScore}
                  onChange={e => setProbScore(e.target.value)}
                  required
                />
              </div>

              <Select
                label="Hiring Recommendation"
                value={recommendation}
                onChange={e => setRecommendation(e.target.value)}
                options={[
                  { value: 'strongly_recommend', label: 'Strongly Recommend' },
                  { value: 'recommend', label: 'Recommend' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'not_recommend', label: 'Do Not Recommend' },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Interviewer Notes & Key Strengths
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Evaluation
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};

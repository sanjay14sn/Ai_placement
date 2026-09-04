import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Building2, Clock, Star, ChevronRight, Filter, Search, Zap } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, AIBadge, ProgressRing, Skeleton, EmptyState, Pagination } from '../../components/ui';
import { jobService } from '../../services';
import { getMatchScoreRingColor, formatDate } from '../../utils';
import type { Job } from '../../types';
import { toast } from 'sonner';

interface JobWithMatch extends Job {
  matchScore?: number;
  aiExplanation?: string;
}

export const StudentJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedAi, setExpandedAi] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 5;
  const navigate = useNavigate();

  useEffect(() => {
    jobService.getRecommendedForStudent('student-1')
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / limit) || 1;
  const paginatedJobs = filtered.slice((page - 1) * limit, page * limit);

  const getMatchBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent Match', variant: 'green' as const };
    if (score >= 80) return { label: 'Great Match', variant: 'indigo' as const };
    if (score >= 70) return { label: 'Good Match', variant: 'blue' as const };
    return { label: 'Moderate Match', variant: 'amber' as const };
  };

  return (
    <PageWrapper
      title="Recommended Jobs"
      subtitle="AI-curated opportunities for you"
      breadcrumbs={[{ label: 'Student' }, { label: 'Jobs' }]}
    >
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-ai-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" />
            <AIBadge label="AI Recommendations" className="bg-white/90 text-slate-950 font-extrabold shadow-sm px-3 py-1" />
          </div>
          <h2 className="text-lg font-bold mb-1">
            {loading ? 'Finding your best matches...' : `${jobs.length} jobs matched for you`}
          </h2>
          <p className="text-brand-200 text-sm">Based on your skills, CGPA, preferences, and career goals</p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <Input
          placeholder="Search jobs by title or company..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Job Cards */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-1/2 mb-3" />
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No jobs found"
          description="Try adjusting your search or check back later"
        />
      ) : (
        <div className="space-y-4">
          {paginatedJobs.map((job) => {
            const match = getMatchBadge(job.matchScore || 0);
            const isExpanded = expandedAi === job.id;

            return (
              <Card key={job.id} className="p-6 hover:shadow-elevated transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Company Logo */}
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-ai-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {job.company.name[0]}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{job.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{job.company.name} · {job.company.industry}</p>
                      </div>
                      {/* Match Score Ring */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <ProgressRing
                          value={job.matchScore || 0}
                          size={52}
                          strokeWidth={4}
                          color={getMatchScoreRingColor(job.matchScore || 0)}
                          label={`${job.matchScore}%`}
                        />
                        <Badge variant={match.variant}>{match.label}</Badge>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location} {job.isRemote && '(Remote OK)'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        ₹{job.salaryMin}–{job.salaryMax} LPA
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {formatDate(job.applicationDeadline)}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills.slice(0, 5).map(skill => (
                        <Badge key={skill} variant="slate">{skill}</Badge>
                      ))}
                      {job.skills.length > 5 && (
                        <Badge variant="slate">+{job.skills.length - 5} more</Badge>
                      )}
                    </div>

                    {/* AI Explanation */}
                    <div>
                      <button
                        onClick={() => setExpandedAi(isExpanded ? null : job.id)}
                        className="flex items-center gap-1.5 text-xs text-ai-600 dark:text-ai-400 font-medium hover:underline mb-2"
                      >
                        <AIBadge label="" className="w-4 h-4 px-0" />
                        Why this job? {isExpanded ? '▲' : '▼'}
                      </button>
                      {isExpanded && job.aiExplanation && (
                        <div className="bg-ai-50 dark:bg-ai-900/20 border border-ai-200 dark:border-ai-800 rounded-xl p-3 mb-3">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{job.aiExplanation}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => { toast.success(`Applied to ${job.title} at ${job.company.name}!`); }}>
                        Apply Now
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/student/jobs/${job.id}`)}>
                        View Job
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toast.success('Saved to wishlist!')}>
                        <Star className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {totalFiltered > limit && (
            <Card className="p-4 mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={totalFiltered}
                limit={limit}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </Card>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

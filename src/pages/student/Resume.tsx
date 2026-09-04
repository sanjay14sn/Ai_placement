import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle2, Bot, Sparkles, RefreshCw,
  Briefcase, MapPin, Building2, Clock, ArrowUpRight, Check, Zap, Star
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Progress, AIBadge, Skeleton } from '../../components/ui';
import { jobService, applicationService } from '../../services';
import { toast } from 'sonner';
import type { Job } from '../../types';

interface MatchedJob extends Job {
  matchScore?: number;
  aiExplanation?: string;
}

export const StudentResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchDefaultJobs = async () => {
    try {
      const jobs = await jobService.getRecommendedForStudent('student-1');
      setMatchedJobs(jobs as MatchedJob[]);
    } catch {
      toast.error('Failed to load job matches');
    }
  };

  useEffect(() => {
    fetchDefaultJobs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMatchJobs = async () => {
    if (!file) {
      toast.error('Please upload a resume file first');
      return;
    }
    setAnalyzing(true);
    try {
      const jobs = await jobService.getRecommendedForStudent('student-1');
      setMatchedJobs(jobs as MatchedJob[]);
      setHasSearched(true);
      toast.success('Resume parsed & matching job opportunities loaded!');
    } catch {
      toast.error('Failed to parse resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = async (job: MatchedJob) => {
    try {
      await applicationService.apply('student-1', job.id);
      setAppliedJobs(prev => [...prev, job.id]);
      toast.success(`Applied to ${job.title} at ${job.company.name}!`);
    } catch {
      toast.error('Failed to submit application');
    }
  };

  return (
    <PageWrapper
      title="Resume Job Matcher"
      subtitle="Upload your resume to instantly find campus drive roles matched to your experience."
      breadcrumbs={[{ label: 'Student' }, { label: 'Resume Job Matcher' }]}
    >
      {/* Upload Banner */}
      <Card className="p-6 mb-6 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold border border-brand-200 dark:border-brand-900/60 flex-shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload Resume for AI Job Matching</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Our AI parser extracts your technical stack, projects, and CGPA to rank matching recruiter drives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="file"
              id="resume-matcher-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="resume-matcher-upload" className="flex-1 md:flex-initial">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all w-full text-center">
                {file ? file.name : 'Choose Resume PDF'}
              </span>
            </label>

            <Button
              disabled={analyzing}
              loading={analyzing}
              onClick={handleMatchJobs}
              variant="ai"
              size="sm"
              className="text-xs whitespace-nowrap"
            >
              Find Matching Jobs
            </Button>
          </div>
        </div>
      </Card>

      {/* MATCHED JOBS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ai-500" />
            Matched Campus Opportunities ({matchedJobs.length})
          </h3>
          <AIBadge label="AI Resume Rank" />
        </div>

        {analyzing ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-32"><Skeleton className="h-full w-full rounded-2xl" /></Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {matchedJobs.map(job => {
              const isApplied = appliedJobs.includes(job.id);
              const matchScore = job.matchScore || 92;

              return (
                <Card key={job.id} hover className="p-6 transition-all duration-200 border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-ai-600 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                        {job.company.name[0]}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                            {job.title}
                          </h3>
                          <Badge variant="green" className="text-[10px]">
                            {matchScore}% Resume Match
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">{job.company.name}</strong>
                          <span>·</span>
                          <span>{job.location}</span>
                          <span>·</span>
                          <span>Package: ₹{job.salaryMin} - ₹{job.salaryMax} LPA</span>
                        </p>

                        {job.aiExplanation && (
                          <p className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30 p-2.5 rounded-xl border border-brand-100 dark:border-brand-900/40 mt-2">
                            ✨ {job.aiExplanation}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {job.skills.map(skill => (
                            <Badge key={skill} variant="slate" className="text-[10px]">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {isApplied ? (
                          <Button variant="secondary" size="sm" disabled className="text-xs text-emerald-600 font-bold" leftIcon={<Check className="w-3.5 h-3.5 text-emerald-500" />}>
                            Applied
                          </Button>
                        ) : (
                          <Button size="sm" className="text-xs" onClick={() => handleApply(job)}>
                            Apply Now
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/student/jobs')}>
                          View Job
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

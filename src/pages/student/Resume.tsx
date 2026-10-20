import React, { useEffect, useState } from 'react';
import { Upload, Sparkles, FileText, Eye, Trash2, Search } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Skeleton, ConfirmDialog } from '../../components/ui';
import { jobService } from '../../services';
import { timeAgo } from '../../utils';
import type { SavedResume } from '../../types';
import { toast } from 'sonner';

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

interface GoogleJob {
  id: string;
  title: string;
  companyName: string;
  location: string;
  via: string;
  description: string;
  schedule: string;
  postedAt: string;
  applyLink: string;
  ratings: { source: string; rating: number | null; reviews: number | null; link: string }[];
}

export const StudentResumePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [googleJobs, setGoogleJobs] = useState<GoogleJob[]>([]);
  const [googleQuery, setGoogleQuery] = useState('');
  const [matchError, setMatchError] = useState('');
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedResume | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    jobService.getSavedResumes()
      .then(setSavedResumes)
      .catch(() => setSavedResumes([]))
      .finally(() => setLoadingResumes(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const runMatch = async (source: File | SavedResume) => {
    setAnalyzing(true);
    setMatchError('');
    setActiveResumeId(source instanceof File ? null : source.id);
    try {
      const result = await jobService.searchGoogleJobs(source instanceof File ? source : { resumeId: source.id });
      setGoogleJobs(result.jobs);
      setGoogleQuery(result.query);
      setHasSearched(true);
      if (result.resume) {
        const saved = result.resume;
        setActiveResumeId(saved.id);
        setSavedResumes(prev => [saved, ...prev.filter(r => r.id !== saved.id)].slice(0, 5));
        if (source instanceof File) setFile(null);
      }
      toast.success(result.jobs.length ? 'Google job listings loaded for your resume.' : 'No Google jobs matched this resume.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Google jobs';
      setGoogleJobs([]);
      setGoogleQuery('');
      setHasSearched(false);
      setMatchError(message);
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatchJobs = () => {
    if (!file || file.size === 0) {
      toast.error('Upload a resume PDF first');
      return;
    }
    runMatch(file);
  };

  const handleOpenResume = async (resume: SavedResume) => {
    try {
      await jobService.openSavedResume(resume.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open this resume');
    }
  };

  const handleDeleteResume = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobService.deleteSavedResume(deleteTarget.id);
      setSavedResumes(prev => prev.filter(r => r.id !== deleteTarget.id));
      if (activeResumeId === deleteTarget.id) setActiveResumeId(null);
      toast.success(`${deleteTarget.fileName} removed`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove this resume');
    } finally {
      setDeleting(false);
    }
  };

  const activeResume = savedResumes.find(r => r.id === activeResumeId);

  return (
    <PageWrapper
      title="Resume Job Matcher"
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

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 w-full justify-end">
              <input
                type="file"
                id="resume-matcher-upload"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-matcher-upload" className="flex-1 md:flex-initial">
                <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all w-full text-center border border-transparent">
                  {file ? file.name : 'Choose Resume PDF'}
                </span>
              </label>

              <Button
                disabled={analyzing || !file || file.size === 0}
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
        </div>
      </Card>

      <Card className="mb-6 overflow-hidden" padding={false}>
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Recent resumes</h3>
          {!loadingResumes && savedResumes.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{savedResumes.length} of 5 saved</span>
          )}
        </div>
        {loadingResumes ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : savedResumes.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
            Resumes you upload are saved here, so you can find matching jobs again without re-uploading.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {savedResumes.map(resume => {
              const isActive = resume.id === activeResumeId;
              return (
                <li
                  key={resume.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 transition-colors ${isActive ? 'bg-brand-50/60 dark:bg-brand-900/20' : ''}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{resume.fileName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {formatSize(resume.size)} · used {timeAgo(resume.lastUsedAt)}
                        {resume.lastQuery && <> · <span className="italic">“{resume.lastQuery}”</span></>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant={isActive ? 'primary' : 'outline'}
                      leftIcon={<Search className="w-3.5 h-3.5" />}
                      loading={analyzing && isActive}
                      disabled={analyzing}
                      onClick={() => runMatch(resume)}
                      className="text-xs whitespace-nowrap"
                    >
                      Find jobs
                    </Button>
                    <button
                      type="button"
                      aria-label={`Open ${resume.fileName}`}
                      title="Open PDF"
                      onClick={() => handleOpenResume(resume)}
                      className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${resume.fileName}`}
                      title="Remove"
                      onClick={() => setDeleteTarget(resume)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ai-500" />
            Google Jobs ({googleJobs.length})
          </h3>
          {googleQuery && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
              {googleQuery}{activeResume ? ` · ${activeResume.fileName}` : ''}
            </span>
          )}
        </div>

        {analyzing ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-32"><Skeleton className="h-full w-full rounded-2xl" /></Card>
            ))}
          </div>
        ) : googleJobs.length === 0 ? (
          <Card className="p-6 text-sm text-slate-500 dark:text-slate-400">
            {matchError
              || (hasSearched
                ? 'No live Google listings came back for this resume.'
                : 'Upload a resume and choose Find Matching Jobs to load live Google listings and company ratings.')}
          </Card>
        ) : (
          <div className="space-y-4">
            {googleJobs.map(job => (
              <Card key={job.id} hover className="p-6 border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-ai-600 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                      {(job.companyName || 'G')[0]}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{job.title}</h3>
                        <Badge variant="blue" className="text-[10px]">Google Jobs</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">{job.companyName}</strong>
                        <span>·</span>
                        <span>{job.location}</span>
                        {job.schedule && <><span>·</span><span>{job.schedule}</span></>}
                        {job.postedAt && <><span>·</span><span>{job.postedAt}</span></>}
                        {job.via && <><span>·</span><span>{job.via}</span></>}
                      </p>
                      {job.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 line-clamp-3">{job.description}</p>
                      )}
                      {job.ratings.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {job.ratings.map(rating => (
                            <Badge key={`${job.id}-${rating.source}`} variant="slate" className="text-[10px]">
                              {rating.source}{rating.rating != null ? ` ${rating.rating}` : ''}{rating.reviews != null ? ` · ${rating.reviews} reviews` : ''}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      className="text-xs"
                      disabled={!job.applyLink}
                      onClick={() => window.open(job.applyLink, '_blank', 'noopener,noreferrer')}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteResume}
        title="Remove resume?"
        message={`Are you sure you want to remove ${deleteTarget?.fileName ?? 'this resume'} from your recent resumes?`}
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
};

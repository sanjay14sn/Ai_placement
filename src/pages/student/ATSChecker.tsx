import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Bot, Sparkles, RefreshCw, BarChart, FileCheck } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Progress, ProgressRing, AIBadge } from '../../components/ui';
import { aiService } from '../../services';
import { toast } from 'sonner';

export const StudentATSCheckerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof aiService.analyzeResume>> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const res = await aiService.analyzeResume(file);
      setAnalysis(res);
      toast.success('ATS resume evaluation completed!');
    } catch {
      toast.error('Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageWrapper
      title="ATS Score Checker"
      subtitle="Analyze your resume structure, keyword density, section formatting, and ATS compatibility score."
      breadcrumbs={[{ label: 'Student' }, { label: 'ATS Score Checker' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 transition-colors h-full min-h-[320px]">
            <Upload className="w-10 h-10 text-brand-600 dark:text-brand-400 mb-4 animate-bounce-slow" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Upload Resume File</h3>
            <p className="text-xs text-slate-400 text-center mb-6 max-w-[220px]">PDF format supported. Max size 5MB.</p>

            <input
              type="file"
              id="ats-resume-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="ats-resume-upload" className="mb-4">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all">
                Choose PDF File
              </span>
            </label>

            {file && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 w-full mb-6">
                <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate flex-1">{file.name}</span>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!file || analyzing}
              loading={analyzing}
              onClick={handleAnalyze}
              variant="ai"
            >
              Calculate ATS Score
            </Button>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {analyzing ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
              <div className="w-12 h-12 bg-gradient-to-br from-ai-500 to-brand-500 rounded-2xl flex items-center justify-center text-white mb-4 animate-pulse-slow">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">AI ATS Resume Screening</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">Checking section hierarchy, font readability, and keyword density...</p>
              <Progress value={65} animated className="max-w-xs" />
            </Card>
          ) : !analysis ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">No Analysis Generated</h3>
              <p className="text-xs text-slate-400 max-w-xs">Upload your resume PDF and click Calculate ATS Score to view detailed section breakdown and keyword recommendations.</p>
            </Card>
          ) : (
            <>
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 flex items-center gap-6">
                  <ProgressRing
                    value={analysis.overallScore}
                    size={80}
                    strokeWidth={6}
                    color="#4f46e5"
                    label={`${analysis.overallScore}`}
                    sublabel="Overall"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Overall ATS Score</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Resume formatting & section hierarchy are optimized.</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-center gap-6">
                  <ProgressRing
                    value={analysis.atsScore}
                    size={80}
                    strokeWidth={6}
                    color="#10b981"
                    label={`${analysis.atsScore}`}
                    sublabel="Keywords"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Keyword Matching Score</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Score based on recruiter keyword relevance.</p>
                  </div>
                </Card>
              </div>

              {/* Skills Breakdown */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Section Analysis Breakdown</h3>
                  <AIBadge label="AI Breakdown" />
                </div>
                <div className="space-y-3">
                  {Object.entries(analysis.sections).map(([sec, score]) => (
                    <div key={sec}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="capitalize text-slate-600 dark:text-slate-400">{sec}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{score}%</span>
                      </div>
                      <Progress value={score} size="sm" color={score >= 80 ? 'green' : score >= 60 ? 'brand' : 'amber'} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="font-semibold text-emerald-600 mb-4 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysis.strengths.map((str, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-500">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-red-500 mb-4 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" /> Improvement Areas
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-red-500">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Keyword Recommendations */}
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-3">Recommended ATS Keywords to Add</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map(keyword => (
                    <Badge key={keyword} variant="ai" className="px-3 py-1 text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {analysis.missingSkills.map(skill => (
                    <Badge key={skill} variant="purple" className="px-3 py-1 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertCircle, Bot, Sparkles, RefreshCw,
  FileCheck, Copy, Check, Download, ArrowRight, Zap, Target, Layers, ShieldCheck, Award, Trash2
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Progress, ProgressRing, AIBadge, Select, Tabs } from '../../components/ui';
import { aiService } from '../../services';
import { toast } from 'sonner';

type AnalysisData = Awaited<ReturnType<typeof aiService.analyzeResume>>;

export const StudentATSCheckerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedBullet, setCopiedBullet] = useState<number | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [savedToProfile, setSavedToProfile] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('atsRecentAnalyses');
    if (saved) {
      try {
        setRecentAnalyses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent analyses", e);
      }
    }
  }, []);

  const handleSelectRecent = (recent: AnalysisData) => {
    setAnalysis(recent);
    setTargetRole(recent.targetRole);
    setSampleName(recent.fileName);
    setFile(null);
    setSavedToProfile(false);
    setAnalysisError(null);
  };

  const handleDeleteRecent = (recentToDelete: AnalysisData, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentAnalyses(prev => {
      const updated = prev.filter(r => r.fileName !== recentToDelete.fileName || r.targetRole !== recentToDelete.targetRole);
      localStorage.setItem('atsRecentAnalyses', JSON.stringify(updated));
      return updated;
    });
    toast.success('Removed from recent checks');
  };

  const roleOptions = [
    { value: 'Full Stack Developer', label: 'Full Stack Developer' },
    { value: 'Data Scientist / AI Engineer', label: 'Data Scientist / AI Engineer' },
    { value: 'Backend Engineer', label: 'Backend Engineer' },
    { value: 'Frontend Developer', label: 'Frontend Developer' },
    { value: 'DevOps / Cloud Engineer', label: 'DevOps / Cloud Engineer' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSampleName(null);
      setSavedToProfile(false);
    }
  };

  const handleSelectSample = (sampleType: 'high' | 'low') => {
    if (sampleType === 'high') {
      setSampleName('Arjun_Sharma_FullStack_Resume.pdf');
    } else {
      setSampleName('Student_Fresher_Resume_Draft.pdf');
    }
    setFile(null);
    setSavedToProfile(false);
  };

  const handleAnalyze = async () => {
    const inputPayload = sampleName || file;
    if (!inputPayload) {
      toast.error('Please choose a file or select a sample resume');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(15);
    setAnalysisStep('Reading PDF structure & layout hierarchy...');

    const timer1 = setTimeout(() => {
      setAnalysisProgress(45);
      setAnalysisStep('Extracting technical keywords & skills...');
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisStep('Matching against recruiter search filters...');
    }, 1200);

    try {
      const res = await aiService.analyzeResume(inputPayload, targetRole);
      setAnalysisProgress(100);
      setAnalysisStep('Evaluation complete!');
      setTimeout(() => {
        setAnalysis(res);
        setAnalyzing(false);
        toast.success(`ATS evaluation complete for target role: ${targetRole}`);
        
        setRecentAnalyses(prev => {
          const updated = [res, ...prev.filter(r => r.fileName !== res.fileName || r.targetRole !== res.targetRole)].slice(0, 5);
          localStorage.setItem('atsRecentAnalyses', JSON.stringify(updated));
          return updated;
        });
      }, 400);
    } catch (error: any) {
      const msg = error.message || 'Failed to analyze resume';
      toast.error(msg);
      setAnalysisError(msg);
      setAnalyzing(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(index);
    toast.success('Optimized bullet copied to clipboard!');
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    toast.success(`Keyword "${keyword}" copied!`);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleSaveToProfile = () => {
    setSavedToProfile(true);
    toast.success('ATS resume score updated in your Student Profile!');
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const reportText = `ATS RESUME AUDIT REPORT
Target Role: ${analysis.targetRole}
File Analyzed: ${analysis.fileName}
Overall Score: ${analysis.overallScore}/100
ATS Keyword Match: ${analysis.atsScore}%
Formatting Score: ${analysis.formattingScore}%
Impact Score: ${analysis.impactScore}%

TOP STRENGTHS:
${analysis.strengths.map(s => `- ${s}`).join('\n')}

IMPROVEMENT AREAS:
${analysis.weaknesses.map(w => `- ${w}`).join('\n')}

RECOMMENDED KEYWORDS TO ADD:
${analysis.missingKeywords.join(', ')}

RECOMMENDED CERTIFICATIONS:
${analysis.certificationRecommendations.join(', ')}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Audit_Report_${analysis.targetRole.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ATS audit report downloaded!');
  };

  const displayFileName = sampleName || (file ? file.name : null);

  return (
    <PageWrapper
      title="AI ATS Resume Score Checker"
      breadcrumbs={[{ label: 'Student' }, { label: 'ATS Score Checker' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Target Role Selector Card */}
          <Card padding className="border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Target Job Role</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Select the recruiter role standard you want to benchmark your resume against.
            </p>
            <div className="relative">
              <input
                type="text"
                list="role-options"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Data Scientist"
              />
              <datalist id="role-options">
                {roleOptions.map((opt: any) => (
                  <option key={opt.value} value={opt.value} />
                ))}
              </datalist>
            </div>
          </Card>

          {/* Upload Area */}
          <Card className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 transition-colors">
            <Upload className="w-9 h-9 text-brand-600 dark:text-brand-400 mb-3 animate-bounce-slow" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Upload Resume File</h3>
            <p className="text-xs text-slate-400 text-center mb-4 max-w-[220px]">
              PDF format supported (Max 5MB).
            </p>

            <input
              type="file"
              id="ats-resume-upload"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="ats-resume-upload" className="mb-4">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all">
                Choose File
              </span>
            </label>

            {/* Display selected file/sample */}
            {displayFileName && (
              <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200 dark:border-brand-900/60 w-full mb-4">
                <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1">{displayFileName}</span>
                {sampleName && <Badge variant="indigo" className="text-[10px]">Sample</Badge>}
              </div>
            )}


            {/* Recent Analyses Area */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Recent Checks:</span>
              
              {recentAnalyses.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {recentAnalyses.map((recent, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectRecent(recent)}
                      className={`text-left text-xs p-2 rounded-xl border transition-all flex flex-col justify-center ${
                        analysis?.fileName === recent.fileName && analysis?.targetRole === recent.targetRole
                          ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="truncate flex-1 pr-2">📄 {recent.fileName}</span>
                        <Badge variant={recent.overallScore >= 80 ? 'green' : recent.overallScore >= 70 ? 'indigo' : 'amber'} className="text-[9px]">{recent.overallScore}%</Badge>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] text-slate-400 font-normal">Role: {recent.targetRole}</span>
                        <div 
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                          onClick={(e) => handleDeleteRecent(recent, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 p-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  No recent checks found. Upload a resume to see history here!
                </div>
              )}
            </div>

            <Button
              className="w-full mt-5"
              disabled={!displayFileName || analyzing}
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
            <Card className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[380px]">
              <div className="w-14 h-14 bg-gradient-to-br from-ai-500 to-brand-500 rounded-2xl flex items-center justify-center text-white mb-4 animate-pulse-slow shadow-lg">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">AI ATS Resume Screening</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs">{analysisStep}</p>
              <Progress value={analysisProgress} animated color="ai" className="max-w-xs" />
            </Card>
          ) : !analysis ? (
            <Card className={`p-12 text-center flex flex-col items-center justify-center h-full min-h-[380px] ${analysisError ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${analysisError ? 'bg-red-100 dark:bg-red-900/40 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {analysisError ? <AlertCircle className="w-7 h-7" /> : <FileCheck className="w-7 h-7" />}
              </div>
              <h3 className={`font-bold text-base mb-1 ${analysisError ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                {analysisError ? 'Validation Error' : 'No Analysis Generated Yet'}
              </h3>
              <p className={`text-xs max-w-xs mb-4 ${analysisError ? 'text-red-600 dark:text-red-300 font-medium' : 'text-slate-400'}`}>
                {analysisError || <>Upload your resume PDF or select a sample resume on the left, then click <strong>Calculate ATS Score</strong>.</>}
              </p>
            </Card>
          ) : (
            <>
              {/* Top Score Rings Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <ProgressRing
                    value={analysis.overallScore}
                    size={72}
                    strokeWidth={6}
                    color={analysis.overallScore >= 80 ? '#10b981' : analysis.overallScore >= 70 ? '#4f46e5' : '#f59e0b'}
                    label={`${analysis.overallScore}`}
                    sublabel="/100"
                  />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">Overall ATS</h4>
                  <Badge variant={analysis.overallScore >= 80 ? 'green' : analysis.overallScore >= 70 ? 'indigo' : 'amber'} className="text-[9px] mt-1">
                    {analysis.overallScore >= 80 ? 'Super-Match' : analysis.overallScore >= 70 ? 'Good Match' : 'Needs Work'}
                  </Badge>
                </Card>

                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <ProgressRing
                    value={analysis.atsScore}
                    size={72}
                    strokeWidth={6}
                    color="#10b981"
                    label={`${analysis.atsScore}%`}
                  />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">Keywords</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5">Recruiter Match</span>
                </Card>

                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <ProgressRing
                    value={analysis.formattingScore}
                    size={72}
                    strokeWidth={6}
                    color="#4f46e5"
                    label={`${analysis.formattingScore}%`}
                  />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">Formatting</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5">Parser Layout</span>
                </Card>

                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <ProgressRing
                    value={analysis.impactScore}
                    size={72}
                    strokeWidth={6}
                    color="#8b5cf6"
                    label={`${analysis.impactScore}%`}
                  />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">Impact Metrics</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5">STAR Bullets</span>
                </Card>
              </div>

              {/* Action Toolbar */}
              <Card className="p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Benchmark:</span>
                  <Badge variant="indigo" className="text-xs font-semibold">{analysis.targetRole}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={savedToProfile ? 'secondary' : 'primary'}
                    onClick={handleSaveToProfile}
                    leftIcon={savedToProfile ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Award className="w-3.5 h-3.5" />}
                  >
                    {savedToProfile ? 'Saved to Profile' : 'Save Score to Profile'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadReport}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export Report
                  </Button>
                </div>
              </Card>

              {/* Tabs Navigation */}
              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: 'overview', label: 'Overview & Breakdown', icon: <Layers className="w-4 h-4" /> },
                  { id: 'keywords', label: 'Keyword Audit', icon: <Target className="w-4 h-4" /> },
                  { id: 'bullets', label: 'STAR Bullet Fixes', icon: <Sparkles className="w-4 h-4" /> },
                  { id: 'checklist', label: 'ATS Checklist', icon: <ShieldCheck className="w-4 h-4" /> },
                ]}
              />

              {/* TAB 1: Overview & Section Breakdown */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Parsed Summary Card */}
                  <Card className="p-5 border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Parsed Resume Data</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block">Candidate</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analysis.parsedSummary.name || 'Extracted Name'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Email</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate block" title={analysis.parsedSummary.email}>{analysis.parsedSummary.email || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Phone</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate block" title={analysis.parsedSummary.phone}>{analysis.parsedSummary.phone || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Word Count</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analysis.parsedSummary.wordCount} words</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Sections Found</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analysis.parsedSummary.detectedSections.length} Sections</strong>
                      </div>
                    </div>
                  </Card>

                  {/* Section Breakdown */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Section Analysis Breakdown</h3>
                      <AIBadge label="AI Audit" />
                    </div>
                    <div className="space-y-3">
                      {Object.entries(analysis.sections).map(([sec, score]) => (
                        <div key={sec}>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="capitalize text-slate-600 dark:text-slate-400">{sec.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{score}%</span>
                          </div>
                          <Progress value={score} size="sm" color={score >= 80 ? 'green' : score >= 65 ? 'brand' : 'amber'} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5">
                      <h3 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2 text-sm">
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

                    <Card className="p-5">
                      <h3 className="font-semibold text-red-500 mb-3 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-500" /> Areas for Improvement
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
                </div>
              )}

              {/* TAB 2: Keyword Audit */}
              {activeTab === 'keywords' && (
                <div className="space-y-6">
                  {/* Found Keywords */}
                  <Card className="p-6">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Recruiter Keywords ({analysis.matchedKeywords.length})
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">These keywords were found in your resume and match automated recruiter queries for {analysis.targetRole}:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedKeywords.map(kw => (
                        <Badge key={kw} variant="green" className="px-3 py-1 text-xs font-medium">
                          ✓ {kw}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  {/* Missing Keywords */}
                  <Card className="p-6">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-ai-500" /> Missing Recruiter Keywords (Click to Copy)
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Include these high-demand terms in your work experience or skills section to boost recruiter shortlist rate:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map(kw => (
                        <button
                          key={kw}
                          onClick={() => handleCopyKeyword(kw)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-ai-50 hover:bg-ai-100 dark:bg-ai-950/50 dark:hover:bg-ai-900/60 text-ai-700 dark:text-ai-300 text-xs font-semibold rounded-full border border-ai-200 dark:border-ai-800/60 transition-all cursor-pointer"
                        >
                          + {kw}
                          {copiedKeyword === kw ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-ai-400" />}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Missing Skills */}
                  <Card className="p-6">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Missing Technical Skills</h3>
                    <p className="text-xs text-slate-400 mb-4">Skills commonly expected for {analysis.targetRole} candidate shortlists:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map(sk => (
                        <Badge key={sk} variant="amber" className="px-3 py-1 text-xs">
                          {sk}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 3: STAR Bullet Point Optimizer */}
              {activeTab === 'bullets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI STAR Method Bullet Rewrite Recommendations</h3>
                      <p className="text-xs text-slate-400">Replace weak passive phrases with high-impact quantified action bullets.</p>
                    </div>
                    <AIBadge label="STAR Method" />
                  </div>

                  {analysis.bulletFixes.map((fix, idx) => (
                    <Card key={idx} className="p-5 space-y-3 border-slate-200 dark:border-slate-700">
                      <div className="bg-red-50/60 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-1">Original Resume Bullet</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">"{fix.original}"</p>
                      </div>

                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-brand-500 rotate-90 sm:rotate-0" />
                      </div>

                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" /> AI Optimized STAR Bullet
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBullet(fix.optimized, idx)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                          >
                            {copiedBullet === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy Bullet
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">"{fix.optimized}"</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">💡 Why: {fix.reason}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* TAB 4: ATS Compliance Checklist */}
              {activeTab === 'checklist' && (
                <Card className="p-6">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">ATS Software Parsing Checklist</h3>
                  <p className="text-xs text-slate-400 mb-6">Verifies if top ATS parsers (Taleo, Greenhouse, Workday) can read your document without dropping data.</p>
                  <div className="space-y-3">
                    {analysis.atsChecklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                        {item.passed ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{item.check}</h4>
                            <Badge variant={item.passed ? 'green' : 'amber'} className="text-[9px]">
                              {item.passed ? 'PASSED' : 'WARNING'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations & Certifications Footer inside checklist */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-brand-600" /> Recommended Certifications to Increase Recruiter Score
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.certificationRecommendations.map(cert => (
                        <Badge key={cert} variant="indigo" className="px-3 py-1.5 text-xs">
                          📜 {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};


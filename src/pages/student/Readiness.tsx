import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, TrendingUp, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  Bot, RefreshCw, FileText, Zap, ShieldCheck, Target, Layers, ArrowUpRight
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, ProgressRing, Progress, AIBadge } from '../../components/ui';
import { aiService } from '../../services';
import { getMatchScoreRingColor } from '../../utils';
import { toast } from 'sonner';

export const StudentReadinessPage: React.FC = () => {
  const navigate = useNavigate();
  const [readiness, setReadiness] = useState<Awaited<ReturnType<typeof aiService.getPlacementReadiness>> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReadiness = async () => {
    setLoading(true);
    try {
      const data = await aiService.getPlacementReadiness('student-1');
      setReadiness(data);
    } catch {
      toast.error('Failed to load readiness score');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  if (loading || !readiness) {
    return (
      <PageWrapper title="Placement Readiness" breadcrumbs={[{ label: 'Student' }, { label: 'Readiness' }]}>
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  const breakdownItems = [
    { label: 'Resume ATS Score', score: readiness.breakdown.resume, target: 90, color: 'brand' as const },
    { label: 'Technical Core Skills', score: readiness.breakdown.skills, target: 85, color: 'green' as const },
    { label: 'Project Portfolio Impact', score: readiness.breakdown.projects, target: 80, color: 'ai' as const },
    { label: 'Industry Certifications', score: readiness.breakdown.certifications, target: 75, color: 'amber' as const },
    { label: 'Communication & HR', score: readiness.breakdown.communication, target: 80, color: 'green' as const },
    { label: 'Mock Interview Performance', score: readiness.breakdown.interviewReadiness, target: 85, color: 'brand' as const },
  ];

  return (
    <PageWrapper
      title="Placement Readiness Analysis"
      subtitle="AI-driven evaluation of your campus placement potential and action plan."
      breadcrumbs={[{ label: 'Student' }, { label: 'Readiness' }]}
      actions={
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchReadiness}>
          Re-Analyze Profile
        </Button>
      }
    >
      {/* Hero Readiness Gauge Banner */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-ai-800 rounded-3xl p-6 sm:p-8 mb-8 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-ai-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <AIBadge label="AI Evaluation Engine" className="bg-white/90 text-slate-950 font-extrabold shadow-sm px-3 py-1" />
              <Badge variant="green" className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                Top 20% Batch Rank
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Overall Readiness: {readiness.overallScore}%
            </h1>
            <p className="text-brand-100 text-sm leading-relaxed">
              Your profile shows strong technical alignment for Product & Tier-1 companies. Following the 4-week recommendation plan can boost your readiness to <strong>92%+</strong>.
            </p>

            <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-brand-700 hover:bg-slate-100 font-semibold"
                onClick={() => navigate('/student/resume')}
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                Optimize Resume
              </Button>
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                onClick={() => navigate('/student/ai-assistant')}
                leftIcon={<Bot className="w-3.5 h-3.5" />}
              >
                Talk to AI Coach
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 w-full sm:w-auto justify-center">
            <ProgressRing
              value={readiness.overallScore}
              size={110}
              strokeWidth={8}
              color="#fff"
              label={`${readiness.overallScore}%`}
              sublabel="Score"
              labelColor="text-white"
            />
            <p className="text-xs text-brand-100 mt-2 font-medium">Placement Readiness</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Breakdown & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: 6-Factor Breakdown */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Readiness Score Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evaluation across 6 core placement criteria.</p>
            </div>
            <Badge variant="indigo">6 Key Metrics</Badge>
          </div>

          <div className="space-y-5">
            {breakdownItems.map(item => (
              <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.label}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Target: {item.target}%</span>
                    <span className={`font-black ${item.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}`}>
                      {item.score}%
                    </span>
                  </div>
                </div>
                <Progress value={item.score} color={item.color} size="md" />
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Strengths & Weaknesses */}
        <div className="space-y-6">
          {/* Strengths Card */}
          <Card className="p-6">
            <h3 className="font-bold text-base text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Key Profile Strengths
            </h3>

            <div className="space-y-3 text-xs">
              {readiness.strengths.map((str, i) => (
                <div key={i} className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Areas for Improvement */}
          <Card className="p-6">
            <h3 className="font-bold text-base text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Areas to Improve
            </h3>

            <div className="space-y-3 text-xs">
              {readiness.weaknesses.map((weak, i) => (
                <div key={i} className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{weak}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Actionable Recommendations & 4-Week Boost Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Action Plan */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ai-600 dark:text-ai-400" />
                Actionable AI Recommendations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High-impact tasks designed to maximize your drive shortlist rate.</p>
            </div>
            <AIBadge />
          </div>

          <div className="space-y-3">
            {readiness.recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{rec}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex-shrink-0"
                  onClick={() => {
                    if (rec.includes('resume')) navigate('/student/resume');
                    else if (rec.includes('interview')) navigate('/student/interview-prep');
                    else navigate('/student/profile');
                  }}
                  rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                >
                  Start Task
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Col: 4-Week Point Boost Plan */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            4-Week Point Boost Plan
          </h3>

          <div className="space-y-3">
            {readiness.improvementTimeline.map(plan => (
              <div key={plan.week} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase block">Week {plan.week}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.action}</span>
                </div>
                <Badge variant="green" className="text-[10px] font-extrabold flex-shrink-0">
                  +{plan.expectedGain} Pts
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

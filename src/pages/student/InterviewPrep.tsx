import React, { useState } from 'react';
import { Play, Sparkles, Send, Bot, RefreshCw, BarChart2, Star, Award, AlertTriangle } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Select, AIBadge, Badge, ProgressRing } from '../../components/ui';
import { aiService } from '../../services';
import { toast } from 'sonner';

export const StudentInterviewPrepPage: React.FC = () => {
  const [company, setCompany] = useState('Google India');
  const [round, setRound] = useState('technical');
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    modelAnswer: string;
  } | null>(null);

  const companies = [
    { value: 'Google India', label: 'Google India' },
    { value: 'Microsoft India', label: 'Microsoft India' },
    { value: 'Amazon India', label: 'Amazon India' },
    { value: 'Infosys', label: 'Infosys' },
    { value: 'Razorpay', label: 'Razorpay' },
  ];

  const rounds = [
    { value: 'technical', label: 'Technical Core' },
    { value: 'coding', label: 'Coding / DSA Round' },
    { value: 'hr', label: 'HR Round' },
  ];

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    setAnswer('');
    try {
      const q = await aiService.getMockInterviewQuestion(company, round);
      setQuestion(q);
      toast.success('Mock question loaded! Good luck.');
    } catch {
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      // Mock evaluation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const score = Math.floor(65 + Math.random() * 30);
      setResult({
        score,
        feedback: `Your response was solid but could be structured better. You hit the key technical terms but missed detailing the worst-case complexities.`,
        strengths: [
          'Demonstrated clear conceptual understanding',
          'Good usage of correct terminology',
        ],
        improvements: [
          'Add concrete code or execution steps',
          'Quantify details regarding performance trade-offs',
        ],
        modelAnswer: round === 'hr'
          ? 'Use the STAR methodology. Describe a specific Situation, explain the Task, detail the Action you took, and conclude with the Result/impact.'
          : 'Explain the core logic, state Time & Space complexities clearly (e.g. O(N) time and O(1) space), and walk through an example edge case.',
      });
      toast.success('Interview answer evaluated!');
    } catch {
      toast.error('Failed to evaluate answer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title="AI Mock Interview"
      subtitle="Interactive training with instant feedback"
      breadcrumbs={[{ label: 'Student' }, { label: 'Interview Prep' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Interview Setup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Target Company</label>
                <Select value={company} onChange={e => setCompany(e.target.value)} options={companies} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Interview Round</label>
                <Select value={round} onChange={e => setRound(e.target.value)} options={rounds} />
              </div>
              <Button
                variant="ai"
                className="w-full mt-2"
                onClick={handleStart}
                loading={loading}
              >
                {question ? 'Get New Question' : 'Start Mock Session'}
              </Button>
            </div>
          </Card>

          {result && (
            <Card className="p-6 flex flex-col items-center text-center">
              <ProgressRing
                value={result.score}
                size={100}
                strokeWidth={7}
                color={result.score >= 80 ? '#10b981' : result.score >= 60 ? '#6366f1' : '#ef4444'}
                label={`${result.score}`}
                sublabel="Score"
              />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-4">AI Score Overview</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">You scored better than 76% of candidates for similar roles.</p>
            </Card>
          )}
        </div>

        {/* Q&A Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!question ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Begin Mock Session</h3>
              <p className="text-xs text-slate-400 max-w-xs">Select your parameters and click "Start Mock Session" to receive an interactive question from the AI interviewer.</p>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-ai-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Interviewer Question</h3>
                <AIBadge label="Google AI Assistant" />
              </div>

              {/* Streaming-like Question Output */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6">
                "{question}"
              </div>

              {!result && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Your Response</label>
                    <textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your complete answer here. Be as detailed as possible, discussing edge cases, algorithms, or situations..."
                      className="w-full h-32 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" loading={submitting} disabled={!answer.trim() || submitting}>
                      Submit Answer
                    </Button>
                  </div>
                </form>
              )}

              {result && (
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700 animate-slide-up">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">AI Feedback Summary</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      {result.feedback}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">💪 Strengths</h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-500">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 mb-2">⚠️ Areas to Polish</h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {result.improvements.map((imp, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-amber-500">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">💡 Recommended Structure / Model Answer</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-brand-50/20 dark:bg-brand-950/20 p-3 rounded-lg border border-brand-100/40 dark:border-brand-900/40">
                      {result.modelAnswer}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleStart} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Try Another Question
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

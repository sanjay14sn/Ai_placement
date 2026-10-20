import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Bot, RefreshCw, Award, AlertTriangle, Camera, Mic, Volume2, Keyboard, Building2, Send } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, ProgressRing, Input, Textarea } from '../../components/ui';
import { aiService } from '../../services';
import { connectLiveInterview, type LiveInterview, type TranscriptTurn } from './interviewLive';
import { toast } from 'sonner';

type InterviewStatus = 'setup' | 'starting' | 'ai_speaking' | 'recording_user' | 'evaluating' | 'finished';

type InterviewResult = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  transcript: TranscriptTurn[];
  company: string;
  round: string;
};

type HistoryItem = {
  id: string;
  company: string;
  round: string;
  score: number;
  createdAt: string;
};

export const StudentInterviewPrepPage: React.FC = () => {
  const [company, setCompany] = useState('Google India');
  const [round, setRound] = useState('technical');
  const [status, setStatus] = useState<InterviewStatus>('setup');
  const [elapsed, setElapsed] = useState(0);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [draft, setDraft] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveRef = useRef<LiveInterview | null>(null);
  const sessionIdRef = useRef('');

  const companies = [
    { value: 'Google India', label: 'Google India' },
    { value: 'Microsoft India', label: 'Microsoft India' },
    { value: 'Amazon India', label: 'Amazon India' },
    { value: 'Infosys', label: 'Infosys' },
  ];
  const rounds = [
    { value: 'technical', label: 'Technical Core' },
    { value: 'hr', label: 'HR Round' },
  ];

  const loadHistory = () => {
    aiService.listInterviews().then(setHistory).catch(() => {});
  };

  useEffect(() => {
    loadHistory();
    return () => {
      liveRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (status !== 'ai_speaking' && status !== 'recording_user') return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const stopMedia = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleStartSession = async () => {
    const targetCompany = company.trim();
    if (!targetCompany) {
      toast.error('Type a target company');
      return;
    }
    setCompany(targetCompany);
    setStatus('starting');
    setResult(null);
    setTurns([]);
    setElapsed(0);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      const session = await aiService.startInterview(targetCompany, round);
      sessionIdRef.current = session.sessionId;
      liveRef.current = await connectLiveInterview({
        token: session.token,
        models: session.models,
        instructions: session.instructions,
        stream: mediaStream,
        video: videoRef.current,
        refreshToken: async () => (await aiService.refreshInterviewToken(session.sessionId)).token,
        handlers: {
          onReady: () => setStatus('ai_speaking'),
          onAiSpeaking: () => setStatus('ai_speaking'),
          onListening: () => setStatus('recording_user'),
          onTranscript: setTurns,
          onError: (message) => toast.error(message),
        },
      });
    } catch (error) {
      stopMedia();
      liveRef.current = null;
      setStatus('setup');
      toast.error(error instanceof Error ? error.message : 'Could not start the interview');
    }
  };

  const handleFinishSession = async () => {
    const transcript = liveRef.current?.stop() || turns;
    const model = liveRef.current?.model;
    liveRef.current = null;
    stopMedia();
    setStatus('evaluating');
    try {
      const scored = await aiService.completeInterview(sessionIdRef.current, transcript, model);
      setResult(scored);
      setStatus('finished');
      loadHistory();
      toast.success('Interview evaluation complete');
    } catch (error) {
      setStatus('setup');
      toast.error(error instanceof Error ? error.message : 'Could not score this interview');
    }
  };

  const sendTypedAnswer = () => {
    const sent = liveRef.current?.sendText(draft) || false;
    if (!sent) {
      toast.error('Wait until the interviewer is connected');
      return;
    }
    setDraft('');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const questionCount = Math.max(1, turns.filter((turn) => turn.role === 'interviewer').length);
  const latestQuestion = [...turns].reverse().find((turn) => turn.role === 'interviewer')?.text;
  const live = status === 'starting' || status === 'ai_speaking' || status === 'recording_user';
  const canEditSetup = status === 'setup' || status === 'finished';

  return (
    <PageWrapper
      title="Live Voice AI Interview"
      breadcrumbs={[{ label: 'Student' }, { label: 'Interview Prep' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Interview Setup</p>
              <h3 className="font-bold text-base mt-0.5">Choose the interview</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Input
                  label="Target company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Type any company"
                  disabled={!canEditSetup}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {companies.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={!canEditSetup}
                      onClick={() => setCompany(item.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                        company === item.value
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interview round</p>
                <div className="grid grid-cols-2 gap-2">
                  {rounds.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={!canEditSetup}
                      onClick={() => setRound(item.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition-colors ${
                        round === item.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {(status === 'setup' || status === 'finished') && (
                <Button variant="ai" className="w-full mt-4" onClick={handleStartSession}>
                  {status === 'finished' ? 'Start Another Mock Session' : 'Start Mock Session'}
                </Button>
              )}

              {live && (
                <Button
                  variant="outline"
                  className="w-full mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                  onClick={handleFinishSession}
                  disabled={status === 'starting'}
                >
                  End interview and score
                </Button>
              )}
            </div>
          </Card>

          {status === 'finished' && result && (
            <Card className="p-6 flex flex-col items-center text-center animate-slide-up">
              <ProgressRing
                value={result.score}
                size={120}
                strokeWidth={8}
                color={result.score >= 80 ? '#10b981' : result.score >= 60 ? '#6366f1' : '#ef4444'}
                label={`${result.score}`}
                sublabel="Final Score"
              />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-4">{result.company}</h3>
              <p className="text-xs text-slate-400 mt-1">{result.round === 'hr' ? 'HR Round' : 'Technical Core'}</p>
            </Card>
          )}

          {history.length > 0 && (status === 'setup' || status === 'finished') && (
            <Card className="p-6">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Past interviews</h3>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{item.company}</p>
                      <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`min-w-8 text-center text-xs font-bold px-2 py-1 rounded-full ${item.score >= 80 ? 'bg-emerald-100 text-emerald-700' : item.score >= 50 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{item.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {status === 'setup' && (
            <Card className="overflow-hidden min-h-[500px]">
              <div className="relative px-8 py-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-5">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-2xl mb-2">Ready for your interview</h3>
                <p className="text-sm text-slate-300 max-w-lg">
                  {company.trim() || 'Your company'} · {rounds.find((item) => item.value === round)?.label}. The interviewer speaks each question. Answer out loud, or type it below once the session starts.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <Mic className="w-4 h-4 text-emerald-300 mb-2" />
                    <p className="text-sm font-semibold">Speak</p>
                    <p className="text-xs text-slate-300 mt-1">Use your microphone when the interviewer is listening.</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <Keyboard className="w-4 h-4 text-indigo-300 mb-2" />
                    <p className="text-sm font-semibold">Type</p>
                    <p className="text-xs text-slate-300 mt-1">Write an answer and send it. The interviewer continues from that text.</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {live && (
            <Card className="p-0 overflow-hidden flex flex-col bg-black">
              <div className="relative w-full aspect-video flex flex-col">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between z-10">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                      <Bot className="w-5 h-5 text-ai-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{company}</p>
                        <p className="text-sm font-semibold text-white">Question {questionCount}</p>
                      </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl text-white font-mono text-sm">
                      {formatTime(elapsed)}
                    </div>
                  </div>

                  {status === 'ai_speaking' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                      <div className="flex flex-col items-center text-white">
                        <Volume2 className="w-16 h-16 text-brand-400 mb-4" />
                        <h2 className="text-2xl font-bold tracking-wide">AI is speaking...</h2>
                        <p className="text-slate-300 mt-2">Listen carefully to the question</p>
                      </div>
                    </div>
                  )}

                  {status === 'recording_user' && (
                    <div className="z-10 mt-auto flex flex-col items-center">
                      <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400 font-medium flex items-center gap-2">
                          <Mic className="w-4 h-4" /> Listening
                        </span>
                      </div>
                    </div>
                  )}

                  {status === 'starting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                      <div className="flex flex-col items-center text-white">
                        <RefreshCw className="w-10 h-10 animate-spin text-brand-400 mb-4" />
                        <h2 className="text-xl font-bold">Connecting to AI Interviewer...</h2>
                        <p className="text-slate-400 mt-2">Opening camera, microphone, and Gemini voice</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {live && status !== 'starting' && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Keyboard className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Type your answer</h3>
              </div>
              {latestQuestion && (
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3">
                  {latestQuestion}
                </p>
              )}
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write your answer here..."
                rows={4}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) sendTypedAnswer();
                }}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-slate-400">Press Cmd+Enter to send. You can still speak.</p>
                <Button size="sm" onClick={sendTypedAnswer} disabled={!draft.trim()}>
                  <Send className="w-3.5 h-3.5" />
                  Send answer
                </Button>
              </div>
            </Card>
          )}

          {status === 'evaluating' && (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[500px] border-brand-200 dark:border-brand-900/50">
              <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-6 relative">
                <Bot className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Analyzing Interview</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                Gemini is scoring the transcript from this {company} session.
              </p>
            </Card>
          )}

          {status === 'finished' && result && (
            <Card className="p-0 overflow-hidden border-emerald-200 dark:border-emerald-900/50">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interview Final Report</h2>
              </div>
              <div className="p-6 space-y-8">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Overall Feedback</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    {result.feedback}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Communication Strengths
                    </h4>
                    <ul className="space-y-3">
                      {result.strengths.map((item) => (
                        <li key={item} className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                    </h4>
                    <ul className="space-y-3">
                      {result.improvements.map((item) => (
                        <li key={item} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <span className="text-amber-500 mt-0.5">!</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {result.transcript.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Transcript</h4>
                    <div className="space-y-3">
                      {result.transcript.map((turn, index) => (
                        <div key={`${turn.role}-${index}`} className="text-sm">
                          <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                            {turn.role === 'interviewer' ? 'Interviewer' : 'You'}
                          </p>
                          <p className="text-slate-700 dark:text-slate-300">{turn.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

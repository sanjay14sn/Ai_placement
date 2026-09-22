import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Sparkles, Bot, RefreshCw, Star, Award, AlertTriangle, Video, Camera, Square, Mic, Volume2 } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Select, AIBadge, ProgressRing } from '../../components/ui';
import { toast } from 'sonner';

type InterviewStatus = 'setup' | 'starting' | 'ai_speaking' | 'recording_user' | 'evaluating' | 'finished';

const MOCK_QUESTIONS = [
  "Welcome to the interview! Could you please introduce yourself and walk me through your most relevant technical experience?",
  "That's great. Can you describe a challenging technical problem you solved recently and the approach you took?",
  "Excellent. Finally, how do you ensure the code you write is maintainable and scalable?"
];

export const StudentInterviewPrepPage: React.FC = () => {
  const [company, setCompany] = useState('Google India');
  const [round, setRound] = useState('technical');
  
  const [status, setStatus] = useState<InterviewStatus>('setup');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Result state
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);

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

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera or microphone.');
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (status === 'recording_user') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status]);

  const speakQuestion = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1;
    
    // Try to find a good English voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      // Done speaking, start recording user
      setStatus('recording_user');
      setRecordingTime(0);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      // Fallback: start recording immediately if speech fails
      setStatus('recording_user');
      setRecordingTime(0);
    };

    setStatus('ai_speaking');
    synthRef.current.speak(utterance);
  }, []);

  const handleStartSession = async () => {
    // Unlock audio context / speech synth with user gesture
    if (synthRef.current) {
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      synthRef.current.speak(dummy);
    }

    setStatus('starting');
    setResult(null);
    setCurrentQuestionIdx(0);
    
    const hasCamera = await startCamera();
    if (hasCamera) {
      // Wait a moment for UI to settle, then ask first question
      setTimeout(() => {
        speakQuestion(MOCK_QUESTIONS[0]);
      }, 1000);
    } else {
      setStatus('setup');
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      speakQuestion(MOCK_QUESTIONS[nextIdx]);
    } else {
      // Finished all questions
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    setStatus('evaluating');
    stopCamera();
    
    try {
      // Mock evaluation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const score = Math.floor(75 + Math.random() * 20);
      setResult({
        score,
        feedback: `Great job overall. You maintained good eye contact and answered confidently. Your technical explanations were clear, though you could dive deeper into performance metrics for the second question.`,
        strengths: [
          'Excellent verbal communication and clarity',
          'Good structural breakdown of problems',
          'Maintained confident body language'
        ],
        improvements: [
          'Elaborate more on trade-offs when discussing technical approaches',
          'Avoid filler words during complex explanations'
        ]
      });
      setStatus('finished');
      toast.success('Interview evaluation complete!');
    } catch {
      toast.error('Failed to evaluate session');
      setStatus('setup');
    }
  };

  const handleReset = () => {
    stopCamera();
    if (synthRef.current) synthRef.current.cancel();
    setStatus('setup');
    setResult(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <PageWrapper
      title="Live Voice AI Interview"
      subtitle="Fully dynamic, voice-driven multi-turn interview preparation"
      breadcrumbs={[{ label: 'Student' }, { label: 'Interview Prep' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SETUP & RESULTS PANEL (Left) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Interview Setup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Target Company</label>
                <Select 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                  options={companies} 
                  disabled={status !== 'setup' && status !== 'finished'} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Interview Round</label>
                <Select 
                  value={round} 
                  onChange={e => setRound(e.target.value)} 
                  options={rounds} 
                  disabled={status !== 'setup' && status !== 'finished'} 
                />
              </div>
              
              {(status === 'setup' || status === 'finished') && (
                <Button
                  variant="ai"
                  className="w-full mt-4"
                  onClick={handleStartSession}
                >
                  {status === 'finished' ? 'Start Another Mock Session' : 'Start Mock Session'}
                </Button>
              )}
              
              {status !== 'setup' && status !== 'finished' && (
                <Button
                  variant="outline"
                  className="w-full mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                  onClick={handleReset}
                >
                  End Session Early
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
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-4">Interview Performance</h3>
              <p className="text-xs text-slate-400 mt-1">You scored better than 82% of candidates.</p>
            </Card>
          )}
        </div>

        {/* MAIN VIDEO & INTERACTION PANEL (Right) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* IDLE STATE */}
          {status === 'setup' && (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6 relative">
                <Camera className="w-8 h-8" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></div>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Ready for your Voice Interview</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                The AI will verbally ask you questions. There will be no text prompt. Listen carefully and speak your answers clearly into the camera.
              </p>
            </Card>
          )}

          {/* ACTIVE INTERVIEW STATE */}
          {(status === 'starting' || status === 'ai_speaking' || status === 'recording_user') && (
            <Card className="p-0 overflow-hidden flex flex-col bg-black">
              
              <div className="relative w-full aspect-video flex flex-col">
                {/* User Camera Feed */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                />
                
                {/* OVERLAYS */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  
                  {/* Top Bar: Interview Progress */}
                  <div className="flex items-center justify-between z-10">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                      <Bot className="w-5 h-5 text-ai-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Google AI Interviewer</p>
                        <p className="text-sm font-semibold text-white">Question {currentQuestionIdx + 1} of {MOCK_QUESTIONS.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center Overlay: AI Speaking State */}
                  {status === 'ai_speaking' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                      <div className="flex flex-col items-center text-white animate-pulse">
                        <Volume2 className="w-16 h-16 text-brand-400 mb-4" />
                        <h2 className="text-2xl font-bold tracking-wide">AI is speaking...</h2>
                        <p className="text-slate-300 mt-2">Listen carefully to the question</p>
                        
                        {/* Audio visualizer bars (CSS mock) */}
                        <div className="flex items-center justify-center gap-1.5 mt-8 h-12">
                          {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div 
                              key={i} 
                              className="w-2 bg-brand-400 rounded-full animate-bounce" 
                              style={{ height: `${Math.random() * 100 + 20}%`, animationDelay: `${i * 0.1}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Bar: Recording State & Controls */}
                  {status === 'recording_user' && (
                    <div className="z-10 mt-auto flex flex-col items-center animate-slide-up">
                      
                      <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-4 mb-6">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                        <span className="text-white font-mono font-bold text-lg tracking-wider">{formatTime(recordingTime)}</span>
                        <div className="w-px h-6 bg-white/20 mx-2"></div>
                        <span className="text-emerald-400 font-medium animate-pulse flex items-center gap-2">
                          <Mic className="w-4 h-4" /> Recording Answer
                        </span>
                      </div>

                      <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={handleNextQuestion}
                        className="bg-brand-600 hover:bg-brand-500 border-none shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white w-64 rounded-xl font-bold text-base"
                      >
                        Finished Answering →
                      </Button>
                      <p className="text-white/60 text-xs mt-3">Click when you have completed your response</p>
                    </div>
                  )}

                  {/* Starting State */}
                  {status === 'starting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                      <div className="flex flex-col items-center text-white">
                        <RefreshCw className="w-10 h-10 animate-spin text-brand-400 mb-4" />
                        <h2 className="text-xl font-bold">Connecting to AI Interviewer...</h2>
                        <p className="text-slate-400 mt-2">Initializing camera and audio</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </Card>
          )}

          {/* EVALUATING STATE */}
          {status === 'evaluating' && (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[500px] border-brand-200 dark:border-brand-900/50">
              <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-6 relative">
                <Bot className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Analyzing Interview</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                The AI is evaluating your verbal responses, tone, confidence, and technical accuracy across all questions...
              </p>
            </Card>
          )}

          {/* FINISHED STATE */}
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
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                    </h4>
                    <ul className="space-y-3">
                      {result.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <span className="text-amber-500 mt-0.5">!</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </PageWrapper>
  );
};

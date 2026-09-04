import React, { useEffect, useState, useRef } from 'react';
import { Bot, Send, User, Zap, BookOpen, Users, FileText, TrendingUp, RefreshCw } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, AIBadge, Badge } from '../../components/ui';
import { aiService } from '../../services';
import { useAuthStore } from '../../store';
import { cn } from '../../utils';
import type { ChatMessage } from '../../types';

const SUGGESTED_QUERIES = [
  { icon: <Users className="w-4 h-4" />, text: 'Which students are eligible for tomorrow\'s drive?' },
  { icon: <TrendingUp className="w-4 h-4" />, text: 'Which department has the highest placement rate?' },
  { icon: <FileText className="w-4 h-4" />, text: 'Show students who haven\'t uploaded resumes' },
  { icon: <BookOpen className="w-4 h-4" />, text: 'Generate CSE placement report' },
  { icon: <Zap className="w-4 h-4" />, text: 'Which students are at placement risk?' },
  { icon: <Users className="w-4 h-4" />, text: 'Show students with more than 90% AI match' },
];

const STUDENT_SUGGESTIONS = [
  'What jobs am I eligible for?',
  'How can I improve my placement score?',
  'Show me jobs above 6 LPA',
  'Give me Java interview questions',
  'What should I learn for a data analyst role?',
];

// Simple markdown-like renderer
const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('# ')) {
          return <h3 key={i} className="font-bold text-base">{line.slice(2)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h4 key={i} className="font-semibold">{line.slice(3)}</h4>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <div key={i} className="flex items-start gap-2"><span className="text-brand-500 mt-1">•</span><span>{line.slice(2)}</span></div>;
        }
        if (line.match(/^\d+\./)) {
          return <div key={i} className="flex items-start gap-2"><span className="text-brand-500 font-medium">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
        }
        if (line.includes('|') && line.includes('|', line.indexOf('|') + 1)) {
          const cells = line.split('|').filter(c => c.trim());
          return (
            <div key={i} className="flex gap-4 py-1 border-b border-slate-100 dark:border-slate-700">
              {cells.map((cell, j) => <span key={j} className={cn('text-xs', j === 0 ? 'font-medium w-28' : 'text-slate-600 dark:text-slate-400')}>{cell.trim()}</span>)}
            </div>
          );
        }
        if (line.trim() === '---' || line.match(/^\|---/)) return <hr key={i} className="border-slate-200 dark:border-slate-700" />;
        if (line.trim() === '') return <div key={i} className="h-1" />;
        // Bold inline
        const boldified = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldified }} />;
      })}
    </div>
  );
};

interface AIAssistantPageProps {
  mode?: 'college' | 'student' | 'recruiter';
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ mode = 'college' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: mode === 'college'
        ? `Hello! I'm your **AI Placement Officer**. I can help you with:\n\n- Finding eligible students for drives\n- Generating placement reports\n- Identifying at-risk students\n- Sending mass notifications\n- Analyzing placement trends\n\nWhat would you like to know?`
        : mode === 'student'
        ? `Hi there! I'm your **AI Career Assistant**. I can help you:\n\n- Find jobs you're eligible for\n- Improve your placement readiness\n- Analyze your skill gaps\n- Prepare for interviews\n- Track your applications\n\nWhat can I help you with today?`
        : `Hello! I'm your **AI Recruiter Assistant**. I can help you:\n\n- Find top-matched candidates for your roles\n- Analyze candidate profiles\n- Schedule interviews efficiently\n- Generate recruiting analytics\n\nWhat would you like to know?`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || thinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      const response = await aiService.chat(text, mode);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setThinking(false);
    }
  };

  const suggestions = mode === 'student' ? STUDENT_SUGGESTIONS.map(s => ({ icon: <Zap className="w-4 h-4" />, text: s })) : SUGGESTED_QUERIES;

  const title = mode === 'college' ? 'AI Placement Officer' : mode === 'student' ? 'AI Career Assistant' : 'AI Recruiter';

  return (
    <PageWrapper
      title={title}
      subtitle="Powered by AI"
      breadcrumbs={[{ label: mode === 'college' ? 'College' : mode === 'student' ? 'Student' : 'Recruiter' }, { label: title }]}
    >
      <div className="h-[calc(100vh-160px)]">
        {/* Center: Chat */}
        <div className="h-full flex flex-col">
          <Card padding={false} className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-ai-500 to-brand-500 rounded-xl flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Online</span>
                  <AIBadge label="GPT-4o" className="ml-1" />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                  <div className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-ai-500 to-brand-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-3.5 h-3.5 text-white" />
                      : <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    }
                  </div>
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-3',
                    msg.role === 'assistant'
                      ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      : 'bg-brand-600 text-white'
                  )}>
                    {msg.role === 'assistant' ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    {/* Action buttons for AI responses */}
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="outline" size="sm" className="text-xs">View Details</Button>
                        {msg.content.includes('student') && (
                          <Button size="sm" className="text-xs">Send Reminder</Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking animation */}
              {thinking && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-ai-500 to-brand-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-ai-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-ai-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 bg-ai-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
                <p className="text-xs text-slate-400 mb-2">Suggested questions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {s.icon}
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
              <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Ask the ${title}...`}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || thinking} loading={thinking} size="icon" variant="ai">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

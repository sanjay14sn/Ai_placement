import React, { useEffect, useState, useRef } from 'react';
import { Bot, Send, User, Zap, BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, AIBadge } from '../../components/ui';
import { aiService } from '../../services';
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

const renderInline = (text: string) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px] text-slate-800 dark:bg-slate-700 dark:text-slate-100">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

type AnswerBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: { depth: number; text: string }[] };

const parseAnswer = (content: string): AnswerBlock[] => {
  const blocks: AnswerBlock[] = [];
  let list: { depth: number; text: string }[] | null = null;
  const flushList = () => {
    if (list?.length) blocks.push({ type: 'list', items: list });
    list = null;
  };

  content.split('\n').forEach((raw) => {
    const line = raw.replace(/\t/g, '  ');
    if (!line.trim() || line.trim() === '---') {
      flushList();
      return;
    }
    const heading = line.match(/^#{1,3}\s+(.*)$/);
    const section = line.trim().match(/^\*\*(.+?)\*\*:?$/);
    if (heading || section) {
      flushList();
      blocks.push({ type: 'heading', text: (heading?.[1] || section?.[1] || '').replace(/:$/, '') });
      return;
    }
    const bullet = line.match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      if (!list) list = [];
      list.push({ depth: Math.min(3, Math.floor(bullet[1].length / 2)), text: bullet[2] });
      return;
    }
    flushList();
    blocks.push({ type: 'paragraph', text: line.trim() });
  });
  flushList();
  return blocks;
};

const MessageContent: React.FC<{ content: string }> = ({ content }) => (
  <div className="space-y-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
    {parseAnswer(content).map((block, index) => {
      if (block.type === 'heading') {
        return (
          <h4 key={index} className="pt-1 text-[13px] font-semibold text-slate-950 dark:text-white">
            {block.text}
          </h4>
        );
      }
      if (block.type === 'list') {
        return (
          <ul key={index} className="space-y-1.5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-2" style={{ marginLeft: item.depth * 16 }}>
                <span className={cn('mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full', item.depth ? 'bg-slate-300 dark:bg-slate-500' : 'bg-brand-500')} />
                <span>{renderInline(item.text)}</span>
              </li>
            ))}
          </ul>
        );
      }
      return <p key={index}>{renderInline(block.text)}</p>;
    })}
  </div>
);

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
    let cancelled = false;
    aiService.getChat(mode).then((data) => {
      if (cancelled || !data?.messages?.length) return;
      setMessages((prev) => {
        const welcome = prev.filter((item) => item.id === 'welcome');
        const local = prev.filter((item) => item.id !== 'welcome');
        const saved = data.messages;
        const extra = local.filter((item) => !saved.some((entry) => entry.role === item.role && entry.content === item.content));
        return [...welcome, ...saved, ...extra];
      });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [mode]);

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
      const history = messages
        .filter(item => item.id !== 'welcome')
        .slice(-8)
        .map(item => ({ role: item.role, content: item.content }));
      const response = await aiService.chat(text, mode, history);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Gemini could not answer that.',
        timestamp: new Date().toISOString(),
      }]);
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
                  <AIBadge label="Campus" className="ml-1" />
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
                    'rounded-2xl px-4 py-3',
                    msg.role === 'assistant'
                      ? 'max-w-[min(42rem,92%)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      : 'max-w-[75%] bg-brand-600 text-white'
                  )}>
                    {msg.role === 'assistant' ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
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

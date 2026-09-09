import React, { useState } from 'react';
import {
  Newspaper, Search, Pin, Eye, ThumbsUp, MessageSquare, Download,
  Calendar, ArrowRight, Sparkles, AlertTriangle, Send, Share2, CheckCircle2
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Button, Card, Badge, Input, Modal, Avatar, Textarea } from '../../components/ui';
import { useNewsroomStore } from '../../store/newsroomStore';
import { useAuthStore } from '../../store';
import type { NewsArticle } from '../../types';
import { toast } from 'sonner';

export const StudentNewsroomPage: React.FC = () => {
  const { getArticlesForRole, incrementViews, toggleLike, addComment } = useNewsroomStore();
  const { user } = useAuthStore();
  const articles = getArticlesForRole('STUDENT');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Active Reader Modal
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const categories = [
    'ALL',
    'Campus Announcement',
    'Placement Drive Alert',
    'Policy Update',
    'Press Release'
  ];

  const handleOpenArticle = (article: NewsArticle) => {
    incrementViews(article.id);
    setActiveArticle(article);
    setCommentInput('');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeArticle) return;

    addComment(activeArticle.id, {
      userName: user?.name || 'Student User',
      userRole: user?.role || 'STUDENT',
      userAvatar: user?.avatar,
      content: commentInput
    });

    setCommentInput('');
    toast.success('Question/Comment posted to Super Admin!');

    // Update local modal state to show new comment immediately
    const updated = useNewsroomStore.getState().articles.find(a => a.id === activeArticle.id);
    if (updated) setActiveArticle(updated);
  };

  // Filtered list
  const filteredArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const pinnedArticles = articles.filter(a => a.isPinned);
  const topPinnedArticle = pinnedArticles.length > 0 ? pinnedArticles[0] : null;

  return (
    <PageWrapper
      title="Campus Newsroom & Official Broadcasts"
      subtitle="Official Super Admin announcements, placement drive mandates, and campus news"
    >
      <div className="space-y-6">
        {/* Pinned Top Urgent Announcement Banner */}
        {topPinnedArticle && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 border border-brand-800/60 shadow-2xl p-6 sm:p-8 text-white group">
            <img
              src={topPinnedArticle.coverImage}
              alt={topPinnedArticle.title}
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                  <Pin className="w-3.5 h-3.5 fill-slate-950" /> Pinned Announcement
                </span>
                {topPinnedArticle.priority === 'urgent' && (
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold animate-pulse shadow-md">
                    🔥 URGENT DIRECTIVE
                  </span>
                )}
                <Badge variant="blue" className="bg-white/20 text-white border-white/30 text-xs">
                  {topPinnedArticle.category}
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                {topPinnedArticle.title}
              </h2>

              <p className="text-brand-100 text-sm line-clamp-2 leading-relaxed max-w-2xl">
                {topPinnedArticle.summary}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={() => handleOpenArticle(topPinnedArticle)}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Read Full Directive
                </Button>
                {topPinnedArticle.attachments && topPinnedArticle.attachments.length > 0 && (
                  <span className="text-xs text-brand-200 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-brand-400" /> Includes Official PDF Attachment
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'All Broadcasts' : cat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Newsfeed Grid */}
        {filteredArticles.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-800">
            <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No broadcasts found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Check back soon for new Super Admin announcements and drive alerts.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const hasLiked = article.likedByUsers?.includes(user?.id || 'user-student-1');

              return (
                <Card
                  key={article.id}
                  className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col group cursor-pointer"
                  onClick={() => handleOpenArticle(article)}
                >
                  {/* Thumbnail Cover */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-[10px] font-bold shadow">
                        {article.category}
                      </span>
                      {article.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-2 right-2 text-white/90 text-[11px] font-medium flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3" /> {article.publishedAt}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>

                    {/* Footer stats */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-500" /> {article.viewsCount}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(article.id, user?.id || 'user-student-1');
                          }}
                          className={`flex items-center gap-1 hover:text-brand-600 transition-colors ${
                            hasLiked ? 'text-brand-600 font-bold' : ''
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-brand-600' : ''}`} /> {article.likesCount}
                        </button>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> {article.comments.length}
                        </span>
                      </div>

                      <span className="font-semibold text-brand-600 flex items-center gap-1">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── Reader Modal & Student Q&A Comments ──────────────────────────── */}
        {activeArticle && (
          <Modal
            isOpen={!!activeArticle}
            onClose={() => setActiveArticle(null)}
            title="Official Super Admin Broadcast"
            size="xl"
          >
            <div className="space-y-6">
              {/* Header Image */}
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-slate-900">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">{activeArticle.category}</Badge>
                    {activeArticle.priority === 'urgent' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold animate-pulse">
                        Urgent Directive
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                    {activeArticle.title}
                  </h2>
                </div>
              </div>

              {/* Author & Stats Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <Avatar name={activeArticle.authorName} size="sm" src={activeArticle.authorAvatar} />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{activeArticle.authorName}</p>
                    <p className="text-[11px] text-slate-400">{activeArticle.authorRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span>Published {activeArticle.publishedAt}</span>
                  <button
                    onClick={() => toggleLike(activeArticle.id, user?.id || 'user-student-1')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-bold hover:bg-brand-100 transition-all"
                  >
                    <ThumbsUp className="w-4 h-4 fill-brand-600" />
                    {activeArticle.likesCount} Likes
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {activeArticle.content}
              </div>

              {/* Attachments Section */}
              {activeArticle.attachments && activeArticle.attachments.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-brand-600" /> Official Attachment Document:
                  </p>
                  <a
                    href={activeArticle.attachments[0].url}
                    onClick={(e) => { e.preventDefault(); toast.info(`Downloading ${activeArticle.attachments![0].name}`); }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📄</span>
                      <span>{activeArticle.attachments[0].name} ({activeArticle.attachments[0].size || 'PDF'})</span>
                    </div>
                    <span className="text-xs font-semibold underline">Download PDF</span>
                  </a>
                </div>
              )}

              {/* Q&A & Comments Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600" /> Student Q&A & Comments ({activeArticle.comments.length})
                </h4>

                {/* Comment Input */}
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <Input
                    placeholder="Ask a question or comment on this announcement..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="text-xs flex-1"
                  />
                  <Button type="submit" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
                    Post
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {activeArticle.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No questions posted yet. Be the first to ask!</p>
                  ) : (
                    activeArticle.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          comm.userRole === 'SUPER_ADMIN'
                            ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{comm.userName}</span>
                            {comm.userRole === 'SUPER_ADMIN' && (
                              <Badge variant="purple" className="text-[9px]">Super Admin</Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{comm.createdAt}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageWrapper>
  );
};

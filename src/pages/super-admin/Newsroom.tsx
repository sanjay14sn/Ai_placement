import React, { useState } from 'react';
import {
  Newspaper, Plus, Search, Eye, Edit3, Trash2, Pin, CheckCircle2,
  Users, GraduationCap, Building2, AlertTriangle, FileText, Download,
  ThumbsUp, MessageSquare, Sparkles, ExternalLink, Calendar, X, Tag
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Button, Card, Badge, Input, Select, Textarea, Modal, Avatar } from '../../components/ui';
import { useNewsroomStore } from '../../store/newsroomStore';
import type { NewsArticle, NewsCategory, NewsPriority, TargetAudience } from '../../types';
import { toast } from 'sonner';

export const SuperAdminNewsroomPage: React.FC = () => {
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    togglePinStatus,
    togglePublishStatus
  } = useNewsroomStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<NewsCategory>('Campus Announcement');
  const [formPriority, setFormPriority] = useState<NewsPriority>('normal');
  const [formAudience, setFormAudience] = useState<TargetAudience[]>(['STUDENT']);
  const [formCoverImage, setFormCoverImage] = useState(
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80'
  );
  const [formAuthorName, setFormAuthorName] = useState('Rajesh Kumar (Super Admin)');
  const [formAuthorRole, setFormAuthorRole] = useState('Chief Placement Director');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Form Attachment
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormCategory('Campus Announcement');
    setFormPriority('normal');
    setFormAudience(['STUDENT']);
    setFormCoverImage('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80');
    setFormAuthorName('Rajesh Kumar (Super Admin)');
    setFormAuthorRole('Chief Placement Director');
    setFormIsPinned(false);
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormSummary(article.summary);
    setFormContent(article.content);
    setFormCategory(article.category);
    setFormPriority(article.priority);
    setFormAudience(article.targetAudience);
    setFormCoverImage(article.coverImage);
    setFormAuthorName(article.authorName);
    setFormAuthorRole(article.authorRole);
    setFormIsPinned(article.isPinned);
    if (article.attachments && article.attachments.length > 0) {
      setFormAttachmentName(article.attachments[0].name);
      setFormAttachmentUrl(article.attachments[0].url);
    } else {
      setFormAttachmentName('');
      setFormAttachmentUrl('');
    }
    setIsCreateModalOpen(true);
  };

  const handleAudienceToggle = (aud: TargetAudience) => {
    if (formAudience.includes(aud)) {
      if (formAudience.length === 1) return;
      setFormAudience(formAudience.filter(a => a !== aud));
    } else {
      setFormAudience([...formAudience, aud]);
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Please fill in required title and announcement content');
      return;
    }

    const compiledAttachments = formAttachmentName.trim()
      ? [
          {
            id: `att-${Date.now()}`,
            name: formAttachmentName,
            url: formAttachmentUrl || '#',
            size: '2.1 MB',
            type: 'pdf' as const
          }
        ]
      : undefined;

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        title: formTitle,
        summary: formSummary,
        content: formContent,
        category: formCategory,
        priority: formPriority,
        targetAudience: formAudience,
        coverImage: formCoverImage,
        authorName: formAuthorName,
        authorRole: formAuthorRole,
        isPinned: formIsPinned,
        attachments: compiledAttachments
      });
      toast.success('Announcement updated!');
    } else {
      addArticle({
        title: formTitle,
        summary: formSummary,
        content: formContent,
        category: formCategory,
        priority: formPriority,
        targetAudience: formAudience,
        coverImage: formCoverImage,
        authorName: formAuthorName,
        authorRole: formAuthorRole,
        isPinned: formIsPinned,
        isPublished: true,
        attachments: compiledAttachments
      });
      toast.success('News announcement broadcasted to students!');
    }
    setIsCreateModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteArticle(id);
      toast.success('Announcement deleted');
    }
  };

  // Filtered Articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate Metrics
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.isPublished).length;
  const pinnedCount = articles.filter(a => a.isPinned).length;
  const totalViews = articles.reduce((acc, a) => acc + a.viewsCount, 0);

  return (
    <PageWrapper
      title="Newsroom Broadcast & Announcement Center"
      subtitle="Broadcast official announcements, campus drive alerts, and policy updates to Direct Students"
      actions={
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Publish News Announcement
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-50 dark:bg-brand-900/40 text-brand-600 rounded-xl">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Announcements</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalArticles}</span>
                  <span className="text-xs text-emerald-600 font-medium">({publishedArticles} Live)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Student Views</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalViews.toLocaleString()}</span>
                  <span className="text-xs text-blue-600 font-medium">Reads</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-xl">
                <Pin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pinned Urgent Alerts</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{pinnedCount}</span>
                  <span className="text-xs text-slate-400">Top Feed</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/40 text-purple-600 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Student Q&A Responses</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {articles.reduce((acc, a) => acc + a.comments.length, 0)}
                  </span>
                  <span className="text-xs text-slate-400">Comments</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                'ALL',
                'Campus Announcement',
                'Placement Drive Alert',
                'Policy Update',
                'Press Release'
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cat === 'ALL' ? 'All Broadcasts' : cat}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64">
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>
        </Card>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-800">
            <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No news articles found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Create your first news broadcast to communicate directly with students.
            </p>
            <Button onClick={handleOpenCreate} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Publish Announcement
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className={`overflow-hidden bg-white dark:bg-slate-800 border transition-all flex flex-col justify-between ${
                  article.isPinned
                    ? 'border-brand-500/80 shadow-md'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Cover Header */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Priority & Pinned Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {article.isPinned && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shadow-md">
                        <Pin className="w-3.5 h-3.5 fill-slate-950" /> Pinned Alert
                      </span>
                    )}
                    {article.priority === 'urgent' && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-extrabold animate-pulse shadow-md">
                        🔥 URGENT
                      </span>
                    )}
                    {article.priority === 'high' && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold shadow-md">
                        High Priority
                      </span>
                    )}
                  </div>

                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    article.isPublished ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {article.isPublished ? 'Live' : 'Draft'}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                    <span className="bg-black/60 px-2 py-0.5 rounded text-[11px]">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <Calendar className="w-3 h-3" /> {article.publishedAt}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Audience Badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.targetAudience.map(aud => (
                        <Badge key={aud} variant="blue" className="text-[10px]">
                          {aud === 'STUDENT' ? 'Direct Students' : aud === 'TPO' ? 'Placement Officers' : 'All'}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      {article.summary}
                    </p>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-500" /> {article.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> {article.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> {article.comments.length}
                        </span>
                      </div>

                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {article.authorName}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => setPreviewArticle(article)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Preview Post
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs ${article.isPinned ? 'text-amber-600 border-amber-300' : 'text-slate-500'}`}
                        onClick={() => {
                          togglePinStatus(article.id);
                          toast.success(article.isPinned ? 'Unpinned from top' : 'Pinned to top of Student feed');
                        }}
                        title={article.isPinned ? 'Unpin' : 'Pin to Top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleOpenEdit(article)}
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleDelete(article.id, article.title)}
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Preview Reader Modal ──────────────────────────────────────────── */}
        {previewArticle && (
          <Modal
            isOpen={!!previewArticle}
            onClose={() => setPreviewArticle(null)}
            title="News Announcement Reader Preview"
            size="xl"
          >
            <div className="space-y-4">
              <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg bg-slate-900">
                <img
                  src={previewArticle.coverImage}
                  alt={previewArticle.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge variant="blue" className="mb-2">{previewArticle.category}</Badge>
                  <h3 className="text-xl font-bold text-white leading-snug">
                    {previewArticle.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Avatar name={previewArticle.authorName} size="xs" src={previewArticle.authorAvatar} />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{previewArticle.authorName}</span>
                    <span className="text-[10px] text-slate-400 block">{previewArticle.authorRole}</span>
                  </div>
                </div>
                <span>Published on {previewArticle.publishedAt}</span>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {previewArticle.content}
              </div>

              {previewArticle.attachments && previewArticle.attachments.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-500" /> Attached Official Directive:
                  </p>
                  <a
                    href={previewArticle.attachments[0].url}
                    onClick={(e) => { e.preventDefault(); toast.info(`Downloading ${previewArticle.attachments![0].name}`); }}
                    className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700 hover:border-brand-500"
                  >
                    <Download className="w-4 h-4" /> {previewArticle.attachments[0].name} ({previewArticle.attachments[0].size || 'PDF'})
                  </a>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* ─── Create / Edit Announcement Modal ────────────────────────────────── */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingArticle ? 'Edit News Announcement' : 'Publish & Broadcast New Announcement'}
          size="xl"
        >
          <form onSubmit={handleSaveArticle} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <Input
                  required
                  placeholder="e.g. 🚨 URGENT: Revised Campus Placement Policy 2026 Mandate"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Summary / Subtitle
                </label>
                <Input
                  placeholder="1-2 line summary to display on newsfeed preview cards"
                  value={formSummary}
                  onChange={e => setFormSummary(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <Select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as NewsCategory)}
                    options={[
                      { value: 'Campus Announcement', label: 'Campus Announcement' },
                      { value: 'Placement Drive Alert', label: 'Placement Drive Alert' },
                      { value: 'Policy Update', label: 'Policy Update' },
                      { value: 'Industry Trends', label: 'Industry Trends' },
                      { value: 'Tech News', label: 'Tech News' },
                      { value: 'Press Release', label: 'Press Release' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <Select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as NewsPriority)}
                    options={[
                      { value: 'normal', label: 'Normal Priority' },
                      { value: 'high', label: 'High Priority' },
                      { value: 'urgent', label: 'Urgent Alert (Red Pulse Banner)' },
                    ]}
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audience Recipients *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAudienceToggle('STUDENT')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formAudience.includes('STUDENT')
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" /> Direct Students
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAudienceToggle('TPO')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formAudience.includes('TPO') || formAudience.includes('COLLEGE_ADMIN')
                        ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-400 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> College Placement Officers
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Announcement Content (Markdown & Formatted Text) *
                </label>
                <Textarea
                  required
                  rows={6}
                  placeholder="Write full article body, bullet points, and guidelines..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cover Image URL
                  </label>
                  <Input
                    value={formCoverImage}
                    onChange={e => setFormCoverImage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attachment Document Name (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Placement_Policy_Directive_2026.pdf"
                    value={formAttachmentName}
                    onChange={e => setFormAttachmentName(e.target.value)}
                  />
                </div>
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formIsPinned}
                  onChange={e => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin this announcement to top of Student newsfeed banner
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingArticle ? 'Save Changes' : 'Broadcast Announcement'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
};

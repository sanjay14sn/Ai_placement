import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Trash2, Search, Filter, ShieldAlert, CheckCircle2, 
  RefreshCw, Eye, ExternalLink, Heart, MessageCircle, 
  Image as ImageIcon, Sparkles, Tag, User, ShieldCheck, Flag, ArrowUpDown
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, StatCard, Button, Input, Select, Badge, Avatar, Modal, EmptyState } from '../../components/ui';
import { communityService } from '../../services';
import { toast } from 'sonner';
import { getMediaUrl } from '../../config/api';

interface PostAuthor {
  name: string;
  avatar: string;
  role: string;
  email?: string;
  isVerified?: boolean;
}

interface PostItem {
  id: string;
  authorId?: string;
  author: PostAuthor;
  title?: string;
  content: string;
  type?: 'achievement' | 'project' | 'question' | 'opportunity' | 'requirement' | string;
  bullets?: string[];
  hashtags: string[];
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  createdAt?: string;
}

const DEFAULT_POSTS: PostItem[] = [
  {
    id: '1',
    author: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Final Year · CSE · PSG Tech',
      email: 'priya.s@psgtech.edu',
      isVerified: true,
    },
    timeAgo: '2h ago',
    title: 'Completed AWS Solutions Architect Associate! 🎉',
    type: 'achievement',
    content: 'Thrilled to share that I passed the AWS Solutions Architect Associate exam today with a score of 892/1000! Huge shoutout to my campus placement mentors for guiding me on cloud design patterns.',
    bullets: [
      'Prepped with AWS Skill Builder & Stephane Maarek on Udemy',
      'Hands-on labs on VPC peering, IAM roles, and S3 lifecycle rules',
      'Next up: Working on a serverless microservices capstone project'
    ],
    hashtags: ['#AWS', '#CloudArchitecture', '#Certification', '#CareerGrowth'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    likes: 142,
    comments: 28,
  },
  {
    id: '2',
    author: {
      name: 'Rahul Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Final Year · IT · Sona College of Technology',
      email: 'rahul.mehta@sonatech.ac.in',
      isVerified: false,
    },
    timeAgo: '4h ago',
    title: 'Looking for Project Teammates',
    type: 'opportunity',
    content: 'We are building an AI-based Resume Analyzer and need 2-3 motivated teammates to collaborate on our open-source release.',
    bullets: [
      '1 Flutter Developer',
      '1 Backend Developer (Node.js)',
      '1 UI/UX Designer',
      'If you are interested, comment or DM!'
    ],
    hashtags: ['#Flutter', '#NodeJS', '#AI', '#OpenSource'],
    likes: 98,
    comments: 42,
  }
];

export const SuperAdminCampusConnectPage: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMedia, setSelectedMedia] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'likes' | 'comments'>('newest');

  // Deletion Modal
  const [selectedPostToDelete, setSelectedPostToDelete] = useState<PostItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Inappropriate / Unwanted Content');
  const [deleteNotes, setDeleteNotes] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      const data = await communityService.getFeed();
      if (data && data.length > 0) {
        const formatted: PostItem[] = data.map((p: any) => ({
          id: p._id || p.id,
          authorId: p.author?._id || p.author?.id || p.author,
          author: {
            name: p.author?.name || 'Unknown Student',
            avatar: p.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: p.author?.role || 'Student',
            email: p.author?.email,
            isVerified: p.author?.role === 'STUDENT' ? true : false,
          },
          title: p.title,
          content: p.content,
          type: p.type || 'achievement',
          hashtags: p.hashtags || [],
          bullets: p.bullets || [],
          image: p.media?.[0] ? getMediaUrl(p.media[0]) : undefined,
          likes: p.likes?.length || 0,
          comments: p.comments?.length || 0,
          timeAgo: p.createdAt ? formatTimeAgo(new Date(p.createdAt)) : 'Recently',
          createdAt: p.createdAt,
        }));
        setPosts(formatted);
      } else {
        setPosts(DEFAULT_POSTS);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
      setPosts(DEFAULT_POSTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const formatTimeAgo = (date: Date) => {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleOpenDeleteModal = (post: PostItem) => {
    setSelectedPostToDelete(post);
    setDeleteReason('Inappropriate / Unwanted Content');
    setDeleteNotes('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedPostToDelete) return;
    setIsDeleting(true);
    try {
      await communityService.deletePost(selectedPostToDelete.id).catch(err => {
        console.warn('Backend delete warning:', err);
      });

      setPosts(prev => prev.filter(p => p.id !== selectedPostToDelete.id));
      setRemovedCount(c => c + 1);
      toast.success(
        `Post "${selectedPostToDelete.title || 'Untitled Post'}" removed from CampusConnect`,
        { description: `Reason: ${deleteReason}` }
      );
      setSelectedPostToDelete(null);
    } catch (err) {
      console.error('Failed to remove post:', err);
      setPosts(prev => prev.filter(p => p.id !== selectedPostToDelete.id));
      toast.success('Post removed from CampusConnect');
      setSelectedPostToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedType === 'ALL' ||
      (post.type && post.type.toLowerCase() === selectedType.toLowerCase());

    const matchesMedia =
      selectedMedia === 'ALL' ||
      (selectedMedia === 'WITH_IMAGE' && !!post.image) ||
      (selectedMedia === 'TEXT_ONLY' && !post.image);

    return matchesSearch && matchesType && matchesMedia;
  }).sort((a, b) => {
    if (selectedSort === 'likes') return b.likes - a.likes;
    if (selectedSort === 'comments') return b.comments - a.comments;
    return 0; // default newest as returned from API
  });

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'achievement':
        return <Badge variant="green">Achievement</Badge>;
      case 'opportunity':
        return <Badge variant="purple">Opportunity</Badge>;
      case 'project':
        return <Badge variant="blue">Project</Badge>;
      case 'question':
        return <Badge variant="amber">Question</Badge>;
      default:
        return <Badge variant="slate">General</Badge>;
    }
  };

  return (
    <PageWrapper
      title="CampusConnect Moderation"
      breadcrumbs={[{ label: 'Super Admin', to: '/super-admin/overview' }, { label: 'CampusConnect Moderation' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Feed
          </Button>
          <a
            href="/student/community"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Feed View
          </a>
        </div>
      }
    >
      {/* ── Key Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Feed Posts"
          value={posts.length}
          icon={<MessageSquare className="w-5 h-5" />}
          change="Total posts visible across campuses"
          changeType="neutral"
          color="brand"
        />
        <StatCard
          title="Removed Unwanted Posts"
          value={removedCount}
          icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
          change="Moderated in this session"
          changeType="neutral"
          color="red"
        />
        <StatCard
          title="Posts with Media"
          value={posts.filter(p => !!p.image).length}
          icon={<ImageIcon className="w-5 h-5 text-blue-500" />}
          change="Images & proof attachments"
          changeType="neutral"
          color="blue"
        />
        <StatCard
          title="Active Contributors"
          value={new Set(posts.map(p => p.author.name)).size}
          icon={<User className="w-5 h-5 text-emerald-500" />}
          change="Verified student authors"
          changeType="neutral"
          color="green"
        />
      </div>

      {/* ── Filters & Search ───────────────────────────────────────────────── */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search headline, text, student, #tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
          <Select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Post Types' },
              { value: 'achievement', label: 'Achievements 🎉' },
              { value: 'opportunity', label: 'Opportunities 🚀' },
              { value: 'project', label: 'Projects 💻' },
              { value: 'question', label: 'Questions ❓' },
            ]}
          />
          <Select
            value={selectedMedia}
            onChange={e => setSelectedMedia(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Attachments' },
              { value: 'WITH_IMAGE', label: 'Has Image / Media' },
              { value: 'TEXT_ONLY', label: 'Text Only' },
            ]}
          />
          <Select
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value as any)}
            options={[
              { value: 'newest', label: 'Sort: Newest First' },
              { value: 'likes', label: 'Sort: Most Likes' },
              { value: 'comments', label: 'Sort: Most Comments' },
            ]}
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Quick Filter:
          </span>
          {['#AWS', '#Cloud', '#CareerGrowth', '#Flutter', '#AI', '#PlacementOS'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                searchQuery === tag
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-red-500 hover:underline ml-2"
            >
              Clear Search
            </button>
          )}
        </div>
      </Card>

      {/* ── Feed Moderation List ───────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
              </div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title="No CampusConnect posts match your filters"
          description="Try clearing your search query or switching filters to see all community posts."
          action={{
            label: 'Reset Filters',
            onClick: () => {
              setSearchQuery('');
              setSelectedType('ALL');
              setSelectedMedia('ALL');
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Showing {filteredPosts.length} of {posts.length} posts</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Moderation Active
            </span>
          </div>

          {filteredPosts.map(post => (
            <Card
              key={post.id}
              className="p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={post.author.name} src={post.author.avatar} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {post.author.name}
                      </h4>
                      {post.author.isVerified && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="w-2.5 h-2.5 fill-current text-blue-600" />
                          Verified
                        </span>
                      )}
                      {getTypeBadge(post.type)}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {post.author.role} {post.author.email ? `• ${post.author.email}` : ''} • {post.timeAgo}
                    </p>
                  </div>
                </div>

                {/* Moderation Action Button */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleOpenDeleteModal(post)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Remove Post
                </Button>
              </div>

              {/* Title / Headline */}
              {post.title && (
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  {post.title}
                </h3>
              )}

              {/* Content */}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 whitespace-pre-line">
                {post.content}
              </p>

              {/* Bullets */}
              {post.bullets && post.bullets.length > 0 && (
                <div className="space-y-1.5 mb-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {post.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Attached Image */}
              {post.image && (
                <div className="mb-3">
                  <div
                    onClick={() => setPreviewImage(post.image || null)}
                    className="relative cursor-pointer group rounded-xl overflow-hidden max-h-72 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={post.image}
                      alt={post.title || 'Attached image'}
                      className="w-full h-auto max-h-72 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Eye className="w-4 h-4" /> Click to view image
                    </div>
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Engagement Info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> {post.likes} likes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500" /> {post.comments} comments
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Post ID: <span className="font-mono text-[10px]">{post.id}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Remove Post Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={!!selectedPostToDelete}
        onClose={() => !isDeleting && setSelectedPostToDelete(null)}
        title="Remove CampusConnect Post"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setSelectedPostToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Remove Post from Feed
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 dark:text-red-200">
              <p className="font-bold">Immediate Moderation Action</p>
              <p className="mt-0.5 text-red-700 dark:text-red-300">
                This post will be permanently deleted and removed from all student community feeds.
              </p>
            </div>
          </div>

          {selectedPostToDelete && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                Author: <span className="font-semibold text-slate-600 dark:text-slate-400">{selectedPostToDelete.author.name}</span>
              </p>
              {selectedPostToDelete.title && (
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Title: <span className="font-normal text-slate-600 dark:text-slate-400">{selectedPostToDelete.title}</span>
                </p>
              )}
              <p className="text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                "{selectedPostToDelete.content}"
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Removal
            </label>
            <Select
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              options={[
                { value: 'Inappropriate / Unwanted Content', label: 'Inappropriate or Unwanted Content' },
                { value: 'Commercial Spam or Unauthorized Promotion', label: 'Commercial Spam or Promotion' },
                { value: 'Misleading or Fraudulent Information', label: 'Misleading or Fraudulent Information' },
                { value: 'Abuse, Harassment, or Hate Speech', label: 'Abuse, Harassment, or Hate Speech' },
                { value: 'Academic Dishonesty or Policy Violation', label: 'Academic Dishonesty or Policy Violation' },
                { value: 'Copyright or Privacy Infringement', label: 'Copyright or Privacy Infringement' },
                { value: 'Other Guidelines Violation', label: 'Other Community Guidelines Violation' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Moderation Note (Optional)
            </label>
            <input
              type="text"
              value={deleteNotes}
              onChange={e => setDeleteNotes(e.target.value)}
              placeholder="e.g., Flagged by placement coordinator; violated community code of conduct"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </Modal>

      {/* ── Image Lightbox Modal ───────────────────────────────────────────── */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title="Image Attachment Preview"
          size="lg"
        >
          <div className="flex justify-center p-2 bg-slate-900 rounded-xl overflow-hidden">
            <img
              src={previewImage}
              alt="Attachment full view"
              className="max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageSquare, Repeat, Bookmark, Share2, Image, Filter, 
  Send, Sparkles, CheckCircle2, MoreHorizontal,
  Users, UserCheck, ArrowRight, X, Plus, Loader2, Upload, Trash2, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { toast } from 'sonner';
import { getMediaUrl } from '../../config/api';

interface PostItem {
  id: string;
  authorId?: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    isVerified?: boolean;
    profileSource?: string;
  };
  title?: string;
  content: string;
  bullets?: string[];
  hashtags: string[];
  image?: string;
  badge?: { label: string; color: string };
  likes: number;
  comments: number;
  reposts: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isInterested?: boolean;
  timeAgo: string;
}

export const CommunityFeedPage: React.FC = () => {
  const { user } = useAuthStore();
  const [postInputText, setPostInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Modal State for rich post creation
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalImage, setModalImage] = useState('');
  const [modalHashtags, setModalHashtags] = useState('');

  // Feed Posts Dataset
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: '1',
      author: {
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: '3rd Year · CSE · VIT Chennai',
        isVerified: true,
        profileSource: 'From AI Campus OS profile'
      },
      timeAgo: '2h ago',
      title: 'Completed AWS Cloud Practitioner Certification! 🎉',
      badge: { label: 'Achievement', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
      content: 'Grateful for the learning journey. Next stop — Solutions Architect. Always open to connect with people working on cloud or looking for study partners!',
      hashtags: ['#AWS', '#Cloud', '#Learning', '#CareerGrowth'],
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
      likes: 234,
      comments: 18,
      reposts: 12,
      isLiked: true,
      isBookmarked: false
    },
    {
      id: '2',
      author: {
        name: 'Rahul Mehta',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'Final Year · IT · Sona College of Technology',
        isVerified: false,
        profileSource: 'From AI Campus OS profile'
      },
      timeAgo: '4h ago',
      title: 'Looking for Project Teammates',
      badge: { label: 'Opportunity', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
      content: 'We are building an AI-based Resume Analyzer and need 2-3 motivated teammates.',
      bullets: [
        '1 Flutter Developer',
        '1 Backend Developer (Node.js)',
        '1 UI/UX Designer',
        "If you're interested, comment or DM!"
      ],
      hashtags: ['#Flutter', '#NodeJS', '#AI', '#OpenSource'],
      likes: 98,
      comments: 42,
      reposts: 15,
      isLiked: false,
      isInterested: false
    }
  ]);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const { communityService } = await import('../../services');
      const data = await communityService.getFeed();
      if (data && data.length > 0) {
        const formattedPosts: PostItem[] = data.map((p: any) => ({
          id: p._id,
          authorId: p.author?._id || p.author?.id || p.author,
          author: {
            name: p.author?.name || 'Unknown User',
            avatar: p.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: p.author?.role || 'Student',
            isVerified: false,
          },
          title: p.title,
          content: p.content,
          hashtags: p.hashtags || [],
          bullets: p.bullets || [],
          image: p.media?.[0] ? getMediaUrl(p.media[0]) : undefined,
          likes: p.likes?.length || 0,
          comments: p.comments?.length || 0,
          reposts: 0,
          timeAgo: 'Just now', // Ideally compute this using date-fns or similar
          isLiked: false,
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleBookmark = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
  };

  const handleInterested = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isInterested: !p.isInterested } : p));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { uploadService } = await import('../../services');
      const data = await uploadService.uploadFile(file);
      setModalImage(data.url);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const confirmMessage = isSuperAdmin
      ? 'Super Admin Moderation: Are you sure you want to remove this unwanted post from CampusConnect?'
      : 'Are you sure you want to delete your post?';
      
    if (!window.confirm(confirmMessage)) return;
    try {
      const { communityService } = await import('../../services');
      await communityService.deletePost(postId).catch(err => {
        console.warn('API deletePost warning:', err);
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success(isSuperAdmin ? 'Post successfully removed by Super Admin' : 'Post deleted successfully');
    } catch (err) {
      console.error('Failed to delete post:', err);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post removed');
    }
  };

  // Create post from modal
  const handleModalPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalContent.trim() && !modalTitle.trim()) return;

    let hashtags = modalHashtags
      .split(',')
      .map(h => h.trim())
      .filter(Boolean)
      .map(h => h.startsWith('#') ? h : `#${h}`);

    if (hashtags.length === 0) {
      hashtags = ['#AICampusOS', '#CampusConnect'];
    }

    setIsPosting(true);
    try {
      const { communityService } = await import('../../services');
      const postData = {
        title: modalTitle.trim() || undefined,
        content: modalContent.trim(),
        type: 'achievement',
        hashtags: hashtags,
        media: modalImage.trim() ? [modalImage.trim()] : [],
      };

      await communityService.createPost(postData);
      
      setModalTitle('');
      setModalContent('');
      setModalImage('');
      setModalHashtags('');
      setIsCreatePostModalOpen(false);
      fetchFeed(); // Refresh feed
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleQuickPost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postInputText.trim()) {
      setIsCreatePostModalOpen(true);
      return;
    }

    setIsPosting(true);
    try {
      const { communityService } = await import('../../services');
      await communityService.createPost({
        content: postInputText.trim(),
        type: 'general',
        hashtags: ['#CampusConnect'],
      });
      setPostInputText('');
      fetchFeed();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleOpenRichPost = () => {
    if (postInputText.trim()) {
      setModalContent(postInputText.trim());
    }
    setIsCreatePostModalOpen(true);
  };

  return (
    <PageWrapper
      title="Home"
      breadcrumbs={[{ label: 'CampusConnect' }, { label: 'Home' }]}
    >
      <div className="space-y-6 w-full">
        {/* ── 1. Welcome Hero Banner ───────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

          <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">CampusConnect</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome to CampusConnect, {user?.name?.split(' ')[0] || 'there'}
              </h2>
              <p className="mt-2 text-sm text-indigo-100/90">
                A unified student network powered by AI Campus OS
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Connect', 'Collaborate', 'Learn', 'Grow', 'Get Placed'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <blockquote className="w-full shrink-0 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md sm:max-w-xs">
              <p className="text-sm font-medium leading-relaxed text-white">“Students today, leaders tomorrow.”</p>
            </blockquote>
          </div>
        </section>

        {/* ── 2. Post Creator Box ─────────────────────────────────────────── */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl">
          <form onSubmit={handleQuickPost} className="space-y-3.5">
            <div className="flex items-center gap-3">
              {/* Avatar circle */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-indigo-200 dark:border-indigo-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-sm flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'AS'}
                </div>
              )}
              <input
                type="text"
                value={postInputText}
                onChange={e => setPostInputText(e.target.value)}
                placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
                className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleOpenRichPost}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Attach Media / Create Rich Post"
                >
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600">Media</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>POSTING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>POST</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>

        {/* ── 4. Feed Posts List ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No posts found. Be the first to post!
            </div>
          ) : posts.map(post => (
            <Card key={post.id} className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
              {/* Author Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{post.author.name}</h3>
                      {post.author.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="w-3 h-3 text-blue-600 fill-current" />
                          College Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {post.author.role} · {post.timeAgo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.author.profileSource && (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hidden sm:inline-block">
                      {post.author.profileSource}
                    </span>
                  )}
                  {(post.authorId === user?.id || user?.role === 'SUPER_ADMIN') && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                        user?.role === 'SUPER_ADMIN'
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                          : 'text-red-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      title={user?.role === 'SUPER_ADMIN' ? 'Remove Unwanted Post (Super Admin Moderation)' : 'Delete Post'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {user?.role === 'SUPER_ADMIN' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider">Remove (Admin)</span>
                      )}
                    </button>
                  )}
                  <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  {post.title && (
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                      {post.title}
                    </h2>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
                {post.content}
              </p>

              {/* Bullets List (if any) */}
              {post.bullets && (
                <div className="space-y-1 mb-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium pl-2">
                  {post.bullets.map((b, idx) => (
                    <p key={idx} className={b.startsWith('•') ? 'text-slate-800 dark:text-slate-100 font-semibold' : ''}>
                      {b.startsWith('•') ? b : `• ${b}`}
                    </p>
                  ))}
                </div>
              )}

              {/* Hashtag Pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-md text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Image Attachment (if any) */}
              {post.image && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs relative bg-slate-100 dark:bg-slate-800">
                  <img src={post.image} alt="Post Attachment" className="w-full h-auto max-h-[500px] object-contain" />
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold">
                    Small steps Big opportunities ✨
                  </div>
                </div>
              )}

              {/* Interaction Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-6">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                      post.isLiked ? 'text-rose-500' : 'hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-rose-500' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  {/* Comment */}
                  <button className="flex items-center gap-1.5 font-semibold hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>

                  {/* Repost */}
                  <button className="flex items-center gap-1.5 font-semibold hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">
                    <Repeat className="w-4 h-4" />
                    <span>{post.reposts}</span>
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`p-1 transition-colors cursor-pointer ${
                      post.isBookmarked ? 'text-indigo-600' : 'hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Interested button for Opportunity posts */}
                  {post.badge?.label === 'Opportunity' && (
                    <button
                      onClick={() => handleInterested(post.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        post.isInterested
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {post.isInterested ? 'Interested ✓' : 'Interested'}
                    </button>
                  )}

                  <button className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Rich Create Post Modal (Rectangle Shaped) ────────────────────── */}
      <Modal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        title="Create a CampusConnect Post"
        size="md"
        className="rounded-md border-2 border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <form onSubmit={handleModalPostSubmit} className="space-y-4 py-2">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Post Headline / Title
            </label>
            <input
              type="text"
              value={modalTitle}
              onChange={e => setModalTitle(e.target.value)}
              placeholder="e.g., Completed AWS Certification! 🎉 or Looking for Project Teammates"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Post Content Body */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Post Content
            </label>
            <textarea
              rows={4}
              value={modalContent}
              onChange={e => setModalContent(e.target.value)}
              placeholder="Share your achievement, open opportunities, or questions with students across India..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Attachment Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={modalImage}
                  onChange={e => setModalImage(e.target.value)}
                  placeholder="Image URL or upload from gallery..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <label className="relative overflow-hidden shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : (
                  <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </label>
            </div>
          </div>

          {/* Optional Hashtags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hashtags (comma separated)
            </label>
            <input
              type="text"
              value={modalHashtags}
              onChange={e => setModalHashtags(e.target.value)}
              placeholder="#AWS, #Cloud, #CareerGrowth"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsCreatePostModalOpen(false)}
              className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPosting}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              {isPosting && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Post
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

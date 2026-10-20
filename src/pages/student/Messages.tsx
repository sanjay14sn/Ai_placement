import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Search, MoreVertical, Paperclip, CheckCheck, 
  Image as ImageIcon, ArrowLeft, MessageSquare, FileText, Download, X, Loader2, ExternalLink, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Badge, Skeleton } from '../../components/ui';

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarBg?: string;
  unread: number;
  online: boolean;
  lastMessage: string;
  time: string;
}

interface MessageItem {
  id: string;
  sender: 'me' | 'them';
  text: string;
  attachment?: {
    url: string;
    name?: string;
    type?: 'image' | 'file';
    size?: number;
  };
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import { BACKEND_BASE as backendUrl, getMediaUrl } from '../../config/api';

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const MessagesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Attachment States & Refs ───────────────────────────────────────────────
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    previewUrl: string;
    name: string;
    type: 'image' | 'file';
    size: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Chat Contacts Dataset ───────────────────────────────────────────────────
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [conversations, setConversations] = useState<Record<string, MessageItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit');
      e.target.value = '';
      return;
    }

    const previewUrl = type === 'image' ? URL.createObjectURL(file) : '';
    setPendingAttachment({
      file,
      previewUrl,
      name: file.name,
      type,
      size: file.size,
    });
  };

  // Initialize Socket.io and fetch data
  useEffect(() => {
    let newSocket: Socket;
    const init = async () => {
      const startedAt = Date.now();
      try {
        const { communityService } = await import('../../services');
        const currentUserStr = localStorage.getItem('auth-storage');
        let currentUserId = '';
        if (currentUserStr) {
          try {
            const authStorage = JSON.parse(currentUserStr);
            currentUserId = authStorage?.state?.user?.id || authStorage?.state?.user?._id || '';
          } catch (e) {}
        }
        
        let convsData = [];
        try {
           convsData = await communityService.getConversations();
        } catch(e) {}
        
        let formattedChats: ChatContact[] = [];
        
        if (convsData && convsData.length > 0) {
          // Deduplicate by participants in case the DB got duplicate records due to strict mode races
          const uniqueConvs = [];
          const seenParticipants = new Set();
          
          for (const conv of convsData) {
            const pIds = conv.participants.map((p: any) => p._id || p.id).sort().join(',');
            if (!seenParticipants.has(pIds)) {
              seenParticipants.add(pIds);
              uniqueConvs.push(conv);
            }
          }
          
          formattedChats = uniqueConvs.map((conv: any) => {
            const other = conv.participants.find((p: any) => p._id !== currentUserId && p.id !== currentUserId) || conv.participants[0];
            return {
              id: conv._id,
              name: other.name || 'User',
              role: other.role || 'Student',
              avatar: other.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              avatarBg: 'bg-indigo-600',
              unread: 0,
              online: true,
              lastMessage: conv.lastMessage ? conv.lastMessage.content : 'Started a new conversation',
              time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            };
          });
        }

        // Handle routing state from connections
        if (location.state && location.state.userId) {
           const { userId, name, avatar, role } = location.state as any;
           // If we don't have a conversation with this user yet, hit the api
           const personId = (value: any) => String(value?._id || value?.id || value || '');
           let activeConv = convsData.find((c:any) => c.participants.some((p:any) => personId(p) === String(userId)));
           
           if (!activeConv) {
              try {
                activeConv = await communityService.createConversation(userId);
                const newChat = {
                  id: activeConv._id,
                  name: name || 'User',
                  role: role || 'Student',
                  avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  avatarBg: 'bg-indigo-600',
                  unread: 0,
                  online: true,
                  lastMessage: 'Started a new conversation',
                  time: 'Just now'
                };
                formattedChats = [newChat, ...formattedChats];
              } catch (e) {}
           } else {
              // Move existing to top
              const exIdx = formattedChats.findIndex(c => c.id === activeConv._id);
              if (exIdx > -1) {
                 const [exChat] = formattedChats.splice(exIdx, 1);
                 formattedChats = [exChat, ...formattedChats];
              }
           }
           
           if (activeConv) {
             setActiveChatId(activeConv._id);
           }
           window.history.replaceState({}, document.title);
        } else if (formattedChats.length > 0) {
           setActiveChatId(formattedChats[0].id);
        }
        
        setChats(formattedChats);
        
        // Init socket
        if (currentUserId) {
          newSocket = io(backendUrl);
          newSocket.emit('join_chat', currentUserId);
          
          newSocket.on('receive_message', (msg: any) => {
            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgItem: MessageItem = {
              id: msg._id,
              sender: String(msg.sender?._id || msg.sender?.id || msg.sender || '') === String(currentUserId) ? 'me' : 'them',
              text: msg.content,
              attachment: msg.attachment,
              time: timeStr,
              status: 'delivered'
            };
            
            // Update messages
            setConversations(prev => {
              const prevList = prev[msg.conversation] || [];
              // Prevent duplicate if we already added optimistically
              if (prevList.some(m => m.id === msg._id || (m.sender === 'me' && m.text === msg.content && m.status === 'sent'))) {
                return prev;
              }
              return {
                ...prev,
                [msg.conversation]: [...prevList, msgItem]
              };
            });
            
            // Update sidebar
            setChats(prevChats => prevChats.map(c => c.id === msg.conversation ? {
              ...c,
              lastMessage: msg.content,
              time: timeStr,
              unread: msg.conversation === activeChatId ? 0 : (c.unread || 0) + 1
            } : c));
          });
          setSocket(newSocket);
        }
      } catch (err) {
         console.error(err);
      } finally {
         const remain = Math.max(0, 450 - (Date.now() - startedAt));
         window.setTimeout(() => setLoading(false), remain);
      }
    };
    init();
    
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [location.state]);

  // Fetch messages for active chat
  useEffect(() => {
     if (loading) return;
     if (!activeChatId) {
       setThreadLoading(false);
       return;
     }
     let cancelled = false;
     const fetchMsgs = async () => {
        setThreadLoading(true);
        try {
           const { communityService } = await import('../../services');
           const msgs = await communityService.getMessages(activeChatId);
           window.dispatchEvent(new Event('messages-unread'));
           
           const currentUserStr = localStorage.getItem('auth-storage');
           let currentUserId = '';
           if (currentUserStr) {
             try {
               const authStorage = JSON.parse(currentUserStr);
               currentUserId = authStorage?.state?.user?.id || authStorage?.state?.user?._id || '';
             } catch (e) {}
           }
           
           const formattedMsgs: MessageItem[] = msgs.map((m: any) => ({
              id: m._id,
              sender: (m.sender?._id || m.sender?.id || m.sender) === currentUserId ? 'me' : 'them',
              text: m.content,
              attachment: m.attachment,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered' as const
           }));
           
           if (!cancelled) {
             setConversations(prev => ({
                ...prev,
                [activeChatId]: formattedMsgs
             }));
           }
        } catch (e) {
           console.error(e);
        } finally {
           if (!cancelled) setThreadLoading(false);
        }
     };
     
     fetchMsgs();
     return () => { cancelled = true; };
  }, [activeChatId, loading]);

  const selectedChat = chats.find(c => c.id === activeChatId) || null;
  const activeMessages = conversations[activeChatId] || [];

  // Filtered contacts based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, activeChatId]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileShowChat(true);
    // Mark as read
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !pendingAttachment) || !activeChatId || isUploading) return;

    const text = messageText.trim();
    const toUpload = pendingAttachment;

    setMessageText('');
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let uploadedAttachment: { url: string; name: string; type: 'image' | 'file'; size: number } | undefined = undefined;

    if (toUpload) {
      setIsUploading(true);
      try {
        const { uploadService } = await import('../../services');
        const uploadRes = await uploadService.uploadFile(toUpload.file);
        uploadedAttachment = {
          url: uploadRes.url,
          name: uploadRes.filename || toUpload.name,
          type: toUpload.type,
          size: uploadRes.size || toUpload.size,
        };
      } catch (err: any) {
        console.error('File upload failed:', err);
        toast.error('Failed to upload file');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const displayText = text || (uploadedAttachment?.type === 'image' ? 'Sent an image' : uploadedAttachment ? 'Sent an attachment' : '');

    const optimisticMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'me',
      text: displayText,
      attachment: uploadedAttachment,
      time: currentTime,
      status: 'sent'
    };

    // Optimistic Update messages
    setConversations(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), optimisticMsg]
    }));

    // Update last message in sidebar
    setChats(prev => prev.map(c => c.id === activeChatId ? {
      ...c,
      lastMessage: displayText,
      time: currentTime
    } : c));
    
    try {
       const { communityService } = await import('../../services');
       await communityService.sendMessage(activeChatId, text, uploadedAttachment);
    } catch (err) {
       console.error("Failed to send msg", err);
       toast.error('Failed to send message');
    }
  };

  return (
    <PageWrapper
      title="Messages"
      breadcrumbs={[{ label: 'CampusConnect' }, { label: 'Messages' }]}
    >
      {/* ── Main Full Screen Container ─────────────────────────────────────── */}
      <div className="h-[calc(100dvh-6.5rem)] sm:h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-9rem)] min-h-[22rem] w-full max-w-full flex bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
        
        {/* ── Left Contacts Sidebar (Hidden on mobile if chat active) ─────── */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-900/60 shrink-0 ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-3.5 rounded-2xl flex items-center gap-3.5">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/4" />
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                </div>
              ))
            ) : filteredChats.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {searchQuery.trim() ? 'No matching chats' : 'No conversations yet'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {searchQuery.trim()
                    ? 'Try another name.'
                    : 'Chats you start with classmates will be listed here.'}
                </p>
              </div>
            ) : filteredChats.map(chat => {
              const isSelected = activeChatId === chat.id;
              const initials = chat.name.split(' ').map(n => n[0]).join('').substring(0, 2);

              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700'
                      : 'hover:bg-white/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Avatar & Online Dot */}
                  <div className="relative shrink-0">
                    {chat.avatar ? (
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${chat.avatarBg || 'bg-indigo-600'} text-white font-black text-sm flex items-center justify-center shadow-2xs`}>
                        {initials}
                      </div>
                    )}
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" title="Online" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {chat.name}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                        {chat.time}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate mb-1">
                      {chat.role}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm shadow-brand-600/30">
                          {chat.unread > 9 ? '9+' : chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Active Chat Area (Full height flex column) ───────────── */}
        <div className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-900 ${
          !mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {!loading && !selectedChat ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">No conversations yet</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                When you message a classmate, the conversation opens here. Start from Explore Students or your connections.
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/explore-students')}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700"
              >
                Find students
              </button>
            </div>
          ) : (
          <>
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 shadow-2xs">
            <div className="flex items-center gap-3.5">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {loading ? (
                <>
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </>
              ) : !selectedChat ? (
                <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
              ) : (
                <>
                  <div className="relative shrink-0">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                    />
                    {selectedChat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      {selectedChat.name}
                    </h3>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online · <span className="text-slate-500 dark:text-slate-400 font-semibold">{selectedChat.role}</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Header Action Tools — No Call Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate('/student/explore-students')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                title="View All Students"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Explore</span>
              </button>
            </div>
          </div>

          {/* Messages Body Area (Full Height Scrollable) */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50/50 to-indigo-50/20 dark:from-slate-900 dark:to-slate-950">
            {loading || threadLoading ? (
              <div className="space-y-4 pt-2">
                <div className="flex justify-center"><Skeleton className="h-5 w-16 rounded-full" /></div>
                <div className="flex justify-start"><Skeleton className="h-14 w-48 rounded-2xl" /></div>
                <div className="flex justify-end"><Skeleton className="h-14 w-56 rounded-2xl" /></div>
                <div className="flex justify-start"><Skeleton className="h-20 w-64 rounded-2xl" /></div>
                <div className="flex justify-end"><Skeleton className="h-12 w-40 rounded-2xl" /></div>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">No messages yet</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Say hello to {selectedChat?.name || 'them'} to start this conversation.
                </p>
              </div>
            ) : (
            <>
            {/* Date Badge */}
            <div className="flex justify-center my-2">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-2xs">
                Today
              </span>
            </div>

            {activeMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-md p-4 rounded-2xl shadow-sm transition-all ${
                  msg.sender === 'me'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                }`}>
                  {/* Attachment if present */}
                  {msg.attachment && msg.attachment.type === 'image' && (
                    <div className="mb-2 overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <a href={getMediaUrl(msg.attachment.url)} target="_blank" rel="noopener noreferrer" className="block group relative">
                        <img
                          src={getMediaUrl(msg.attachment.url)}
                          alt={msg.attachment.name || 'Shared image'}
                          className="max-h-60 w-full object-cover rounded-xl transition-transform group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" /> Open full image
                        </div>
                      </a>
                    </div>
                  )}

                  {msg.attachment && msg.attachment.type === 'file' && (
                    <a
                      href={getMediaUrl(msg.attachment.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={msg.attachment.name || 'download'}
                      className={`mb-2 flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        msg.sender === 'me'
                          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          : 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${msg.sender === 'me' ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{msg.attachment.name || 'Attachment'}</p>
                        {msg.attachment.size && (
                          <p className={`text-[10px] ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatFileSize(msg.attachment.size)}
                          </p>
                        )}
                      </div>
                      <Download className="w-4 h-4 shrink-0 opacity-80" />
                    </a>
                  )}

                  {(!msg.attachment || (msg.text && msg.text !== 'Sent an image' && msg.text !== 'Sent an attachment')) && (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'me' && (
                      <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            </>
            )}
          </div>

          {/* Chat Footer Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col gap-2"
          >
            {/* Attachment Preview Chip */}
            {pendingAttachment && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 min-w-0">
                  {pendingAttachment.type === 'image' ? (
                    <img
                      src={pendingAttachment.previewUrl}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-xl border border-slate-300 dark:border-slate-600 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {pendingAttachment.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatFileSize(pendingAttachment.size)} · Ready to send
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingAttachment.previewUrl) URL.revokeObjectURL(pendingAttachment.previewUrl);
                    setPendingAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    if (imageInputRef.current) imageInputRef.current.value = '';
                  }}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelected(e, 'file')}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.zip,.xls,.xlsx,.csv,.ppt,.pptx"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileSelected(e, 'image')}
                className="hidden"
                accept="image/*"
              />

              <div className="flex items-center gap-0.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
                  title="Attach file (PDF, Doc, Zip, etc.)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
                  title="Attach Image (PNG, JPG, etc.)"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={pendingAttachment ? "Add a caption..." : "Type a message..."}
                disabled={isUploading}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />

              <button
                type="submit"
                disabled={(!messageText.trim() && !pendingAttachment) || isUploading}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};


import React, { useEffect, useState, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, Trash2, Users, Video, 
  Image as ImageIcon, Upload, X, Search, Download, Copy, Check, ExternalLink, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Button, Card, EmptyState, Input, Modal, Select, Textarea, Pagination } from '../../components/ui';
import { communityService, uploadService } from '../../services';
import { formatDate, formatTime } from '../../utils';

export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  batch?: string;
  phone?: string;
  avatar?: string;
}

interface CollegeEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  speakerRole?: string;
  speakerAvatar?: string;
  image?: string;
  type: 'Webinar' | 'Orientation' | 'Masterclass';
  attendeesCount: number;
  registeredStudents?: RegisteredStudent[];
}

const emptyForm = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  type: 'Webinar' as CollegeEvent['type'],
  speaker: '',
  speakerRole: '',
  image: '',
};

const EVENT_PRESET_IMAGES = [
  {
    label: 'Campus Orientation',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tech Webinar',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Leadership Masterclass',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Auditorium Hall',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
  },
];

import { getMediaUrl } from '../../config/api';
const getImageUrl = getMediaUrl;

const toDateInputValue = (d: string | Date) => {
  try {
    const dt = new Date(d);
    return dt.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

export const CollegeEventsPage: React.FC = () => {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Search & Pagination state
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Registered students modal state
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<CollegeEvent | null>(null);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [hasCopiedEmails, setHasCopiedEmails] = useState(false);

  const loadEvents = () => {
    setLoading(true);
    communityService.getEvents()
      .then((data) => setEvents(data))
      .catch((err) => toast.error(err.message || 'Could not load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const setField = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: CollegeEvent) => {
    setEditingEventId(event.id);
    setForm({
      title: event.title,
      description: event.description || '',
      date: toDateInputValue(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      type: event.type,
      speaker: event.speaker,
      speakerRole: event.speakerRole || '',
      image: event.image || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setForm(emptyForm);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const data = await uploadService.uploadFile(file);
      setField('image', data.url);
      toast.success('Event poster uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload poster');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime || !form.endTime || !form.location || !form.speaker) {
      toast.error('Fill in the title, speaker, date, time, and venue');
      return;
    }

    setSaving(true);
    try {
      if (editingEventId) {
        const updated = await communityService.updateEvent(editingEventId, form);
        setEvents((prev) =>
          prev.map((ev) => (ev.id === editingEventId ? { ...ev, ...updated } : ev))
        );
        toast.success('Event updated successfully');
      } else {
        const created = await communityService.createEvent(form);
        setEvents((prev) => [...prev, created].sort((a, b) => +new Date(a.date) - +new Date(b.date)));
        toast.success('Event posted. Students can see it under Events.');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    try {
      await communityService.deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      if (selectedEventForAttendees?.id === id) {
        setSelectedEventForAttendees(null);
      }
      toast.success('Event removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove the event');
    }
  };

  // Filter & Paginate events
  const filteredEvents = useMemo(() => {
    const q = eventSearchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter((ev) =>
      ev.title.toLowerCase().includes(q) ||
      ev.speaker.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      ev.type.toLowerCase().includes(q)
    );
  }, [events, eventSearchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEvents = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, safeCurrentPage, itemsPerPage]);

  // Filter registered students in attendees modal
  const filteredAttendees = useMemo(() => {
    if (!selectedEventForAttendees?.registeredStudents) return [];
    const q = attendeeSearchQuery.trim().toLowerCase();
    if (!q) return selectedEventForAttendees.registeredStudents;
    return selectedEventForAttendees.registeredStudents.filter((student) =>
      student.name?.toLowerCase().includes(q) ||
      student.email?.toLowerCase().includes(q) ||
      student.studentId?.toLowerCase().includes(q) ||
      student.department?.toLowerCase().includes(q)
    );
  }, [selectedEventForAttendees, attendeeSearchQuery]);

  const handleCopyEmails = () => {
    const list = selectedEventForAttendees?.registeredStudents || [];
    const emails = list.map((s) => s.email).filter(Boolean).join(', ');
    if (!emails) {
      toast.error('No emails to copy');
      return;
    }
    navigator.clipboard.writeText(emails);
    setHasCopiedEmails(true);
    toast.success(`${list.length} email(s) copied to clipboard!`);
    setTimeout(() => setHasCopiedEmails(false), 2500);
  };

  const handleExportCSV = () => {
    const list = selectedEventForAttendees?.registeredStudents || [];
    if (list.length === 0) {
      toast.error('No student registrations to export');
      return;
    }

    const headers = ['Name', 'USN/Roll No', 'Department', 'Batch', 'Email', 'Phone'];
    const rows = list.map((s) => [
      `"${s.name || ''}"`,
      `"${s.studentId || ''}"`,
      `"${s.department || ''}"`,
      `"${s.batch || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registered-students-${selectedEventForAttendees?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendee list downloaded as CSV');
  };

  return (
    <PageWrapper
      title="Events & Webinars"
      breadcrumbs={[{ label: 'College' }, { label: 'Events' }]}
    >
      {!loading && events.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Posted events</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {events.length} {events.length === 1 ? 'event' : 'events'} visible to your students
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Quick search events */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => {
                  setEventSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search events or speakers..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate} className="w-full sm:w-auto">
              Post event
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No events posted yet"
          description="Post a webinar, orientation, or masterclass. Students of this college will see it on their Events page."
          action={{ label: 'Post event', onClick: handleOpenCreate }}
        />
      ) : filteredEvents.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No events matched "{eventSearchQuery}"</h4>
          <p className="text-xs text-slate-400 mt-1">Try searching with a different title, speaker name, or venue.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setEventSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedEvents.map((event) => {
            const isOnline = event.location.toLowerCase().includes('online') || event.location.toLowerCase().includes('zoom');
            return (
              <Card key={event.id} className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row items-stretch gap-5">
                  {/* Event Poster Thumbnail */}
                  <div className="relative w-full md:w-56 h-40 md:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                    {event.image ? (
                      <img
                        src={getImageUrl(event.image)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-white ${
                        event.type === 'Webinar' ? 'bg-indigo-600' : event.type === 'Orientation' ? 'bg-purple-600' : 'bg-emerald-600'
                      }`}>
                        <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                        <span className="font-extrabold text-xs uppercase tracking-wider">{event.type}</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md ${
                        event.type === 'Webinar' ? 'bg-indigo-600/90' : event.type === 'Orientation' ? 'bg-purple-600/90' : 'bg-emerald-600/90'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950/40"
                            leftIcon={<Pencil className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEdit(event)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => handleDelete(event.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Speaker: <span className="text-slate-900 dark:text-white font-bold">{event.speaker}</span>
                        {event.speakerRole ? ` · ${event.speakerRole}` : ''}
                      </p>

                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-0.5">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-2">
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {isOnline ? <Video className="w-3.5 h-3.5 text-sky-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                          {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar with Registered Students Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventForAttendees(event);
                          setAttendeeSearchQuery('');
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all cursor-pointer border border-indigo-200/80 dark:border-indigo-800"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{event.attendeesCount} Registered Student{event.attendeesCount === 1 ? '' : 's'}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-200/80 dark:bg-indigo-800 px-1.5 py-0.5 rounded text-indigo-900 dark:text-indigo-100 ml-1">
                          View List
                        </span>
                      </button>

                      <span className="text-[11px] text-slate-400">
                        Visible to all enrolled students
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {filteredEvents.length > itemsPerPage && (
            <div className="pt-3">
              <Pagination
                page={safeCurrentPage}
                totalPages={totalPages}
                total={filteredEvents.length}
                limit={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Post or Edit an Event ────────────────────────────────────── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingEventId ? 'Edit Event' : 'Post an event'} 
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Title" 
            value={form.title} 
            onChange={(e) => setField('title', e.target.value)} 
            placeholder="Campus Placement Orientation 2025-26" 
            required 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
              options={[
                { value: 'Webinar', label: 'Webinar' },
                { value: 'Orientation', label: 'Orientation' },
                { value: 'Masterclass', label: 'Masterclass' },
              ]}
            />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start time" type="time" value={form.startTime} onChange={(e) => setField('startTime', e.target.value)} required />
            <Input label="End time" type="time" value={form.endTime} onChange={(e) => setField('endTime', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Speaker" value={form.speaker} onChange={(e) => setField('speaker', e.target.value)} placeholder="Prof. S. K. Sharma" required />
            <Input label="Speaker role" value={form.speakerRole} onChange={(e) => setField('speakerRole', e.target.value)} placeholder="Placement Head (TPO)" />
          </div>

          <Input label="Venue or link" value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Main Auditorium or Online (Zoom)" required />
          
          {/* ── Event Image / Poster Section ───────────────────────────── */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Event Cover Image / Poster
            </label>

            {form.image ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                <img 
                  src={getImageUrl(form.image)} 
                  alt="Poster preview" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setField('image', '')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Poster
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setField('image', '')}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/30 transition-all">
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Uploading event poster...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to upload poster image
                        </p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, or WEBP (Max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageFileChange} 
                    disabled={isUploadingImage} 
                  />
                </label>

                {/* Preset image suggestions */}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Or pick a curated banner preset:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EVENT_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setField('image', preset.url)}
                        className="group relative h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all text-left cursor-pointer"
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-bold text-white leading-tight">
                            {preset.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Image URL fallback */}
                <Input
                  placeholder="Or paste an image URL directly (https://...)"
                  value={form.image}
                  onChange={(e) => setField('image', e.target.value)}
                />
              </div>
            )}
          </div>

          <Textarea 
            label="Description" 
            value={form.description} 
            onChange={(e) => setField('description', e.target.value)} 
            placeholder="What students should expect" 
            rows={3} 
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" disabled={saving || isUploadingImage}>
              {saving ? (editingEventId ? 'Saving...' : 'Posting...') : (editingEventId ? 'Save Changes' : 'Post event')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Registered Students Viewer ─────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedEventForAttendees)}
        onClose={() => setSelectedEventForAttendees(null)}
        title={selectedEventForAttendees ? `Registered Students — ${selectedEventForAttendees.title}` : 'Registered Students'}
        size="xl"
      >
        {selectedEventForAttendees && (
          <div className="space-y-4">
            {/* Header summary & action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {selectedEventForAttendees.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {formatDate(selectedEventForAttendees.date)} · {formatTime(selectedEventForAttendees.startTime)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{selectedEventForAttendees.attendeesCount}</span> registered student{selectedEventForAttendees.attendeesCount === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={hasCopiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopyEmails}
                  disabled={!selectedEventForAttendees.registeredStudents?.length}
                >
                  {hasCopiedEmails ? 'Copied!' : 'Copy Emails'}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExportCSV}
                  disabled={!selectedEventForAttendees.registeredStudents?.length}
                >
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={attendeeSearchQuery}
                onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                placeholder="Search registered students by name, roll no, department, or email..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            {/* Students List Table */}
            {filteredAttendees.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {selectedEventForAttendees.attendeesCount === 0 ? 'No students registered yet' : 'No matching students found'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {selectedEventForAttendees.attendeesCount === 0 
                    ? 'Students can register for this event from their CampusConnect Events page.'
                    : 'Try searching with a different name, USN, or department.'}
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-300">Student</th>
                      <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-300">Roll No / USN</th>
                      <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-300">Department</th>
                      <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-300">Batch</th>
                      <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-300">Email & Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredAttendees.map((student, idx) => (
                      <tr key={student.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {student.avatar ? (
                              <img src={getImageUrl(student.avatar)} alt={student.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                                {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                {student.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {student.studentId || <span className="text-slate-400 font-normal italic">—</span>}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">
                          {student.department || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">
                          {student.batch || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {student.email}
                          </p>
                          {student.phone && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {student.phone}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedEventForAttendees(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

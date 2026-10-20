import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin, Video, User, Building, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Card, Badge, Skeleton, Button, Modal, Input, Select, Textarea } from '../../components/ui';
import { driveService, interviewService, communityService, jobService } from '../../services';
import { formatTime, toDateKey } from '../../utils';
import type { PlacementDrive, Interview } from '../../types';

interface CampusEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  speakerRole?: string;
  image?: string;
  type: 'Webinar' | 'Orientation' | 'Masterclass';
}

interface DeadlineItem {
  id: string;
  title: string;
  companyName: string;
  date: string;
  time: string;
}

const toDateInput = (date: Date) => toDateKey(date);

export const CollegeCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: toDateInput(new Date()),
    startTime: '',
    endTime: '',
    location: '',
    type: 'Webinar' as CampusEvent['type'],
    speaker: '',
    speakerRole: '',
    image: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dList, iList, posted, jobs] = await Promise.all([
          driveService.getAll(),
          interviewService.getAll({ page: 1, limit: 100 }),
          communityService.getEvents().catch(() => []),
          jobService.getAll({ limit: 100, status: 'active' }).catch(() => ({ data: [] })),
        ]);
        setDrives(dList);
        setInterviews(iList.data);
        setCampusEvents(posted);
        setDeadlines((jobs.data || []).filter((job) => job.applicationDeadline).map((job) => {
          const when = new Date(job.applicationDeadline);
          return {
            id: job.id,
            title: job.title,
            companyName: job.company?.name || 'Company',
            date: toDateKey(when),
            time: `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`,
          };
        }));
      } catch (error) {
        console.error('Failed to fetch calendar data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Find events for a specific day
  const getEventsForDate = (checkDate: Date) => {
    const key = toDateKey(checkDate);
    return {
      drives: drives.filter(d => toDateKey(d.date) === key),
      interviews: interviews.filter(i => toDateKey(i.date) === key),
      campus: campusEvents.filter(event => toDateKey(event.date) === key),
      deadlines: deadlines.filter(item => item.date === key),
    };
  };

  const getEventsForDay = (day: number) => getEventsForDate(new Date(year, month, day));
  const selectedEvents = getEventsForDate(selectedDate);

  const openPost = () => {
    setForm((prev) => ({ ...prev, date: toDateInput(selectedDate) }));
    setIsModalOpen(true);
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime || !form.endTime || !form.location || !form.speaker) {
      toast.error('Fill in the title, speaker, date, time, and venue');
      return;
    }
    setSaving(true);
    try {
      const created = await communityService.createEvent(form);
      setCampusEvents((prev) => [...prev, created]);
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        speaker: '',
        speakerRole: '',
      }));
      setIsModalOpen(false);
      toast.success('Event posted for this day');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not post the event');
    } finally {
      setSaving(false);
    }
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 border-b border-r border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const isToday = isSameDay(new Date(), new Date(year, month, d));
    const { drives: dayDrives, interviews: dayInterviews, campus: dayCampus, deadlines: dayDeadlines } = getEventsForDay(d);
    const hasEvents = dayDrives.length > 0 || dayInterviews.length > 0 || dayCampus.length > 0 || dayDeadlines.length > 0;

    days.push(
      <div 
        key={d} 
        onClick={() => setSelectedDate(new Date(year, month, d))}
        className={`h-24 sm:h-32 border-b border-r border-slate-100 dark:border-slate-800/60 p-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 relative ${
          isSelected ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
            isToday 
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' 
              : isSelected 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' 
                : 'text-slate-700 dark:text-slate-300'
          }`}>
            {d}
          </span>
          {hasEvents && (
            <div className="flex gap-1">
              {dayDrives.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
              {dayInterviews.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>}
              {dayCampus.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
              {dayDeadlines.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
            </div>
          )}
        </div>
        
        <div className="mt-2 space-y-1 overflow-hidden h-[50px] sm:h-[70px]">
          {dayDrives.length > 0 && (
            <div className="text-[10px] truncate px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded font-semibold border border-blue-100 dark:border-blue-800">
              {dayDrives.length} {dayDrives.length === 1 ? 'Placement Drive' : 'Placement Drives'}
            </div>
          )}
          {dayInterviews.length > 0 && (
            <div className="text-[10px] truncate px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded font-semibold border border-purple-100 dark:border-purple-800">
              {dayInterviews.length} {dayInterviews.length === 1 ? 'Interview' : 'Interviews'}
            </div>
          )}
          {dayCampus.slice(0, 1).map(event => (
            <div key={event.id} className="text-[10px] truncate px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded font-semibold border border-emerald-100 dark:border-emerald-800">
              {event.startTime} {event.title}
            </div>
          ))}
          {dayDeadlines.slice(0, 2).map(item => (
            <div key={item.id} className="text-[10px] truncate px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded font-semibold border border-red-100 dark:border-red-800">
              {item.time} {item.companyName}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <PageWrapper
      title="Placement Calendar"
      breadcrumbs={[{ label: 'College' }, { label: 'Calendar' }]}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Calendar Grid */}
        <div className="flex-1">
          <Card className="overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {monthNames[month]} {year}
                </h2>
                <button onClick={goToToday} className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  Today
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
              {weekDays.map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800/60 last:border-0">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 bg-white dark:bg-slate-900">
              {loading ? (
                Array.from({ length: 35 }).map((_, i) => (
                  <div key={`skel-${i}`} className="h-24 sm:h-32 border-b border-r border-slate-100 dark:border-slate-800/60 p-2">
                    <Skeleton className="w-6 h-6 rounded-full mb-2" />
                    <Skeleton className="w-full h-4 rounded mb-1" />
                  </div>
                ))
              ) : (
                days
              )}
            </div>
          </Card>
        </div>

        {/* Agenda Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <Card className="p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm sticky top-24">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Agenda</h3>
                <p className="text-sm text-slate-500 font-medium">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openPost}>
                Post
              </Button>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : selectedEvents.drives.length === 0 && selectedEvents.interviews.length === 0 && selectedEvents.campus.length === 0 && selectedEvents.deadlines.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No events scheduled</p>
                  <Button size="sm" className="mt-4" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openPost}>
                    Post event
                  </Button>
                </div>
              ) : (
                <>
                  {selectedEvents.drives.map(drive => (
                    <div key={drive.id} className="relative pl-4 border-l-2 border-blue-500">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900"></div>
                      <Badge variant="blue" className="mb-2">Placement Drive</Badge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{drive.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        <Building className="w-3.5 h-3.5" />
                        {drive.company.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {drive.venue}
                      </div>
                    </div>
                  ))}

                  {selectedEvents.campus.map(event => (
                    <div key={event.id} className="relative pl-4 border-l-2 border-emerald-500">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900"></div>
                      <Badge variant="green" className="mb-2">{event.type}</Badge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </div>
                    </div>
                  ))}

                  {selectedEvents.deadlines.map(item => (
                    <div key={item.id} className="relative pl-4 border-l-2 border-red-500">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-red-500 ring-4 ring-white dark:ring-slate-900"></div>
                      <Badge variant="red" className="mb-2">Deadline</Badge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        <Building className="w-3.5 h-3.5" />
                        {item.companyName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(item.time)}
                      </div>
                    </div>
                  ))}

                  {selectedEvents.interviews.map(interview => (
                    <div key={interview.id} className="relative pl-4 border-l-2 border-purple-500">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-white dark:ring-slate-900"></div>
                      <Badge variant="purple" className="mb-2">Round {interview.round} Interview</Badge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{interview.student.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {interview.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {interview.mode === 'video' ? <Video className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {interview.mode === 'video' ? 'Video Call' : 'In Person'}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post an event" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Campus Placement Orientation 2025-26" required />
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
          <Input label="Event Cover Image URL" value={form.image} onChange={(e) => setField('image', e.target.value)} placeholder="https://images.unsplash.com/... or uploaded image URL" />
          <Textarea label="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="What students should expect" rows={3} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Posting...' : 'Post event'}</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

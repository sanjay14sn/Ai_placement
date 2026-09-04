import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video,
  Building2, CheckCircle2, AlertCircle, Plus, Filter, ArrowUpRight,
  Sparkles, ExternalLink, MapPin, Search, List, Grid
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Modal, AIBadge, Input } from '../../components/ui';
import { interviewService, driveService } from '../../services';
import { formatDate, formatTime } from '../../utils';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'interview' | 'drive' | 'deadline' | 'assessment';
  companyName: string;
  companyLogo?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  venue?: string;
  meetingLink?: string;
  status?: string;
  description?: string;
}

export const StudentCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'interview' | 'drive' | 'deadline'>('all');
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<{ dateStr: string; events: CalendarEvent[] } | null>(null);

  // Fetch student events from interviewService and driveService
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const [interviewsRes, drivesRes] = await Promise.all([
          interviewService.getAll({ limit: 50 }),
          driveService.getAll({ status: 'upcoming' }),
        ]);

        const mappedInterviews: CalendarEvent[] = interviewsRes.data.map(i => ({
          id: i.id,
          title: `Round ${i.round}: ${i.type.toUpperCase()} Interview`,
          type: 'interview',
          companyName: i.company.name,
          date: i.date,
          time: i.time,
          meetingLink: i.meetingLink,
          venue: i.venue || 'Online / Google Meet',
          status: i.status,
          description: `Interview round with ${i.company.name} panelists. Mode: ${i.mode}`,
        }));

        const mappedDrives: CalendarEvent[] = drivesRes.map(d => ({
          id: d.id,
          title: d.title,
          type: 'drive',
          companyName: d.company.name,
          date: d.date,
          time: '09:30',
          venue: d.venue,
          status: d.status,
          description: `Placement Drive for ${d.company.name} at ${d.venue}`,
        }));

        // Mock application deadlines
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const deadlines: CalendarEvent[] = [
          {
            id: 'dead-1',
            title: 'Google SDE Application Closes',
            type: 'deadline',
            companyName: 'Google India',
            date: `${y}-${m}-15`,
            time: '23:59',
            description: 'Last date to submit ATS resume for Google campus drive.',
          },
          {
            id: 'dead-2',
            title: 'Amazon Online Assessment Deadline',
            type: 'assessment',
            companyName: 'Amazon India',
            date: `${y}-${m}-22`,
            time: '18:00',
            description: '90-minute coding test link on HackerRank platform.',
          },
        ];

        setEvents([...mappedInterviews, ...mappedDrives, ...deadlines]);
      } catch {
        toast.error('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Calendar Date Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered Events
  const filteredEvents = events.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  // Get events for specific date string YYYY-MM-DD
  const getEventsForDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    return filteredEvents.filter(e => e.date === dateKey);
  };

  const getEventBadgeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'drive': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'deadline': return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'assessment': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const getEventDotColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview': return 'bg-indigo-500';
      case 'drive': return 'bg-emerald-500';
      case 'deadline': return 'bg-red-500';
      case 'assessment': return 'bg-amber-500';
    }
  };

  return (
    <PageWrapper
      title="Placement Calendar"
      subtitle="Track campus recruitment drives, interview slots, and application deadlines."
      breadcrumbs={[{ label: 'Student' }, { label: 'Calendar' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-slate-400'}`}
              title="Month View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    >
      {/* Calendar Controls & Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white min-w-[180px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { type: 'all', label: 'All Events' },
              { type: 'interview', label: 'Interviews 🎯' },
              { type: 'drive', label: 'Drives 🏢' },
              { type: 'deadline', label: 'Deadlines ⏰' },
            ].map(f => (
              <button
                key={f.type}
                onClick={() => setFilterType(f.type as typeof filterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterType === f.type
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* VIEW MODE 1: MONTH GRID */}
      {viewMode === 'month' && (
        <Card padding={false} className="overflow-hidden mb-6 border-slate-200 dark:border-slate-700">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center font-bold text-xs text-slate-500 dark:text-slate-400 py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            {/* Previous Month Padding Days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayOfMonth + i + 1;
              return (
                <div key={`prev-${i}`} className="min-h-[110px] p-2 bg-slate-50/50 dark:bg-slate-900/40 opacity-40">
                  <span className="text-xs font-medium text-slate-400">{dayNum}</span>
                </div>
              );
            })}

            {/* Active Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = getEventsForDay(dayNum);
              const isToday =
                dayNum === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[110px] p-2 transition-colors relative flex flex-col justify-between group ${
                    isToday ? 'bg-brand-50/30 dark:bg-brand-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[85px] hide-scrollbar">
                    {dayEvents.slice(0, 3).map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-semibold truncate border transition-all ${getEventBadgeColor(event.type)}`}
                      >
                        <span className="truncate block">{event.time} {event.companyName}</span>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        onClick={() => {
                          const monthStr = String(month + 1).padStart(2, '0');
                          const dayStr = String(dayNum).padStart(2, '0');
                          setSelectedDateEvents({ dateStr: `${year}-${monthStr}-${dayStr}`, events: dayEvents });
                        }}
                        className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline px-1"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VIEW MODE 2: CHRONOLOGICAL LIST */}
      {viewMode === 'list' && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" /> Upcoming Placement Schedule
          </h3>

          <div className="space-y-3">
            {filteredEvents.length > 0 ? filteredEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 hover:border-brand-500 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getEventDotColor(event.type)}`} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{event.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {event.companyName} · <strong className="text-slate-700 dark:text-slate-300">{formatTime(event.time)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={event.type === 'interview' ? 'indigo' : event.type === 'drive' ? 'green' : 'amber'}>
                    {formatDate(event.date)}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-8">No events match the selected filter.</p>
            )}
          </div>
        </Card>
      )}

      {/* EVENT DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Details'}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 uppercase text-[10px]">Recruiter</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedEvent.companyName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 uppercase text-[10px]">Date & Time</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">
                  {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 uppercase text-[10px]">Venue / Location</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedEvent.venue || 'Online Call'}</span>
              </div>

              {selectedEvent.description && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">Details</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              {selectedEvent.meetingLink && (
                <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="ai" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Join Meeting
                  </Button>
                </a>
              )}
              {selectedEvent.type === 'interview' && (
                <Button size="sm" onClick={() => { setSelectedEvent(null); navigate('/student/interview-prep'); }}>
                  Practice Round
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MULTIPLE EVENTS MODAL FOR A SINGLE DATE */}
      <Modal
        isOpen={Boolean(selectedDateEvents)}
        onClose={() => setSelectedDateEvents(null)}
        title={`Events on ${selectedDateEvents ? formatDate(selectedDateEvents.dateStr) : ''}`}
      >
        <div className="space-y-3">
          {selectedDateEvents?.events.map(ev => (
            <div
              key={ev.id}
              onClick={() => { setSelectedDateEvents(null); setSelectedEvent(ev); }}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{ev.title}</p>
                <p className="text-[11px] text-slate-400">{ev.companyName} · {formatTime(ev.time)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
      </Modal>
    </PageWrapper>
  );
};

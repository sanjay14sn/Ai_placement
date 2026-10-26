import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Filter, Video, 
  MapPin, Building2, ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal } from '../../components/ui';
import { mockDrives, mockInterviews } from '../../mock/data';
import { driveService, interviewService } from '../../services';
import { toast } from 'sonner';

export const RecruiterCalendarPage: React.FC = () => {
  const [eventFilter, setEventFilter] = useState<'all' | 'drives' | 'interviews'>('all');
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('interview');
  const [eventDate, setEventDate] = useState('2026-10-26');
  const [eventTime, setEventTime] = useState('11:00');

  // Combined Agenda Events
  const [events, setEvents] = useState<any[]>([
    { id: 'e1', title: 'Infosys Campus Placement Drive', type: 'drive', date: '2026-10-28', time: '09:30 AM', venue: 'RVCE Auditorium' },
    { id: 'e2', title: 'Technical Interview: Rahul Sharma', type: 'interview', date: '2026-10-26', time: '10:30 AM', venue: 'Google Meet' },
    { id: 'e3', title: 'System Design Interview: Priya Nair', type: 'interview', date: '2026-10-27', time: '02:00 PM', venue: 'Google Meet' },
    { id: 'e4', title: 'Application Deadline: Software Engineer', type: 'deadline', date: '2026-10-30', time: '11:59 PM', venue: 'Portal Online' },
    { id: 'e5', title: 'HR Cultural Round: Arjun Verma', type: 'interview', date: '2026-10-29', time: '04:00 PM', venue: 'Google Meet' },
    { id: 'e6', title: 'TCS Digital Drive Day 1', type: 'drive', date: '2026-10-31', time: '09:00 AM', venue: 'Sona Tech Campus' },
  ]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      driveService.getAll().catch(() => null),
      interviewService.getAll({ limit: 50 }).catch(() => null),
    ]).then(([drivesRes, interviewsRes]) => {
      if (!mounted) return;
      const apiEvents: any[] = [];
      if (Array.isArray(drivesRes) && drivesRes.length > 0) {
        drivesRes.forEach(d => {
          apiEvents.push({
            id: d.id || `drive-${Math.random()}`,
            title: d.title || 'Campus Placement Drive',
            type: 'drive',
            date: d.date ? d.date.slice(0, 10) : '2026-10-28',
            time: '09:30 AM',
            venue: d.venue || 'Campus Auditorium',
          });
        });
      }

      const interviewList = (interviewsRes as any)?.data || interviewsRes;
      if (Array.isArray(interviewList) && interviewList.length > 0) {
        interviewList.forEach(inv => {
          apiEvents.push({
            id: inv.id || `inv-${Math.random()}`,
            title: `Interview: ${inv.student?.name || 'Candidate'} (${inv.type || 'Round'})`,
            type: 'interview',
            date: inv.date ? inv.date.slice(0, 10) : '2026-10-26',
            time: inv.time || '11:00 AM',
            venue: inv.meetingLink ? 'Video Meet' : 'Campus Placement Cell',
          });
        });
      }

      if (apiEvents.length > 0) {
        setEvents(prev => {
          // Merge unique events by id
          const existingIds = new Set(prev.map(e => e.id));
          const additions = apiEvents.filter(e => !existingIds.has(e.id));
          return [...additions, ...prev];
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = events.filter(e => {
    if (eventFilter === 'all') return true;
    if (eventFilter === 'drives') return e.type === 'drive';
    if (eventFilter === 'interviews') return e.type === 'interview';
    return true;
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    const newEvt = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      type: eventType,
      date: eventDate,
      time: eventTime,
      venue: eventType === 'interview' ? 'Google Meet / Online' : 'Campus Auditorium',
    };

    if (eventType === 'drive') {
      try {
        await driveService.create({
          title: eventTitle,
          date: eventDate,
          venue: 'Campus Auditorium',
          status: 'upcoming',
        });
      } catch (err) {
        console.warn('API drive creation fallback:', err);
      }
    } else if (eventType === 'interview') {
      try {
        await interviewService.schedule({
          date: eventDate,
          time: eventTime,
          type: 'technical' as any,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
        });
      } catch (err) {
        console.warn('API interview schedule fallback:', err);
      }
    }

    setEvents(prev => [newEvt, ...prev]);
    toast.success(`🎉 Event "${eventTitle}" added to Placement Calendar for ${eventDate}!`);
    setIsAddModalOpen(false);
    setEventTitle('');
  };

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <PageWrapper
      title="Recruiter Placement Calendar"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Calendar' }]}
      actions={
        <Button 
          size="sm" 
          leftIcon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Calendar Event
        </Button>
      }
    >
      <div className="space-y-6">
        {/* CALENDAR HEADER BAR */}
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" aria-label="Previous Month"><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="icon" variant="outline" aria-label="Next Month"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-600" />
              {currentMonth}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'drives', 'interviews'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setEventFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  eventFilter === type
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </Card>

        {/* MAIN GRID & AGENDA SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MONTH GRID */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((day) => {
                  const dayEvts = filteredEvents.filter(e => {
                    try {
                      const parts = (e.date || '').split('-');
                      const d = parseInt(parts[2], 10);
                      return d === day;
                    } catch {
                      return false;
                    }
                  });

                  const isToday = day === 26;

                  return (
                    <div 
                      key={day}
                      className={`min-h-[76px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        isToday
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                          : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-xs font-extrabold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                      </span>

                      <div className="space-y-1 mt-1">
                        {dayEvts.slice(0, 2).map((evt: any) => (
                          <div 
                            key={evt.id}
                            className={`px-1.5 py-0.5 rounded text-white text-[9px] font-bold truncate ${
                              evt.type === 'drive' ? 'bg-indigo-600' : evt.type === 'interview' ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                            title={evt.title}
                          >
                            {evt.title}
                          </div>
                        ))}
                        {dayEvts.length > 2 && (
                          <div className="text-[8px] font-semibold text-slate-400 pl-1">
                            +{dayEvts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* AGENDA SIDEBAR */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Upcoming Agenda</span>
                <Badge variant="indigo" className="text-[10px]">{filteredEvents.length} Events</Badge>
              </h3>

              <div className="space-y-3">
                {filteredEvents.map((evt) => (
                  <div 
                    key={evt.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={evt.type === 'drive' ? 'indigo' : evt.type === 'interview' ? 'green' : 'amber'}
                        className="text-[10px] capitalize"
                      >
                        {evt.type}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">{evt.time}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{evt.title}</h4>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {evt.venue} · {evt.date}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ADD EVENT MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Calendar Event"
        >
          <form onSubmit={handleAddEvent} className="space-y-4">
            <Input
              label="Event Title"
              placeholder="e.g. Technical Interview Round 2"
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              required
            />

            <Select
              label="Event Type"
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              options={[
                { value: 'interview', label: 'Candidate Interview' },
                { value: 'drive', label: 'Campus Placement Drive' },
                { value: 'deadline', label: 'Application Deadline' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
              />
              <Input
                label="Time"
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add to Calendar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
};

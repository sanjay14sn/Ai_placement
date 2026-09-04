import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Filter, Video, 
  MapPin, Building2, ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal } from '../../components/ui';
import { mockDrives, mockInterviews } from '../../mock/data';
import { toast } from 'sonner';

export const RecruiterCalendarPage: React.FC = () => {
  const [eventFilter, setEventFilter] = useState<'all' | 'drives' | 'interviews'>('all');
  const [currentMonth, setCurrentMonth] = useState('September 2025');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('interview');
  const [eventDate, setEventDate] = useState('2025-09-15');
  const [eventTime, setEventTime] = useState('11:00');

  // Combined Agenda Events
  const events = [
    { id: 'e1', title: 'Infosys Campus Placement Drive', type: 'drive', date: '2025-09-08', time: '09:30 AM', venue: 'RVCE Auditorium' },
    { id: 'e2', title: 'Technical Interview: Rahul Sharma', type: 'interview', date: '2025-09-10', time: '10:30 AM', venue: 'Google Meet' },
    { id: 'e3', title: 'System Design Interview: Priya Nair', type: 'interview', date: '2025-09-12', time: '02:00 PM', venue: 'Google Meet' },
    { id: 'e4', title: 'Application Deadline: Software Engineer', type: 'deadline', date: '2025-09-18', time: '11:59 PM', venue: 'Portal Online' },
    { id: 'e5', title: 'HR Cultural Round: Arjun Verma', type: 'interview', date: '2025-09-22', time: '04:00 PM', venue: 'Google Meet' },
    { id: 'e6', title: 'TCS Digital Drive Day 1', type: 'drive', date: '2025-09-25', time: '09:00 AM', venue: 'Sona Tech Campus' },
  ];

  const filteredEvents = events.filter(e => {
    if (eventFilter === 'all') return true;
    if (eventFilter === 'drives') return e.type === 'drive';
    if (eventFilter === 'interviews') return e.type === 'interview';
    return true;
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;
    toast.success(`🎉 Event "${eventTitle}" added to Placement Calendar for ${eventDate}!`);
    setIsAddModalOpen(false);
    setEventTitle('');
  };

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <PageWrapper
      title="Recruiter Placement Calendar"
      subtitle="Schedule, view, and track campus drives, interviews, and deadlines"
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
              <Button size="xs" variant="outline" iconOnly={<ChevronLeft className="w-4 h-4" />} aria-label="Previous Month" />
              <Button size="xs" variant="outline" iconOnly={<ChevronRight className="w-4 h-4" />} aria-label="Next Month" />
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
                  const hasDrive = day === 8 || day === 25;
                  const hasInterview = day === 10 || day === 12 || day === 22;
                  const hasDeadline = day === 18;

                  return (
                    <div 
                      key={day}
                      className={`min-h-[76px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        day === 10
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                          : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-xs font-extrabold ${day === 10 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                      </span>

                      <div className="space-y-1 mt-1">
                        {hasDrive && (
                          <div className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold truncate">
                            Campus Drive
                          </div>
                        )}
                        {hasInterview && (
                          <div className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold truncate">
                            Interview Round
                          </div>
                        )}
                        {hasDeadline && (
                          <div className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[9px] font-bold truncate">
                            Job Deadline
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

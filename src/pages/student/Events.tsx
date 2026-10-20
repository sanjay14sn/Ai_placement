import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from '../../layouts';
import { Card, EmptyState } from '../../components/ui';
import { communityService } from '../../services';
import { formatDate, formatTime } from '../../utils';

interface EventItem {
  id: string;
  title: string;
  speaker: string;
  speakerRole?: string;
  speakerAvatar?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'Webinar' | 'Orientation' | 'Masterclass';
  isRegistered: boolean;
  image?: string;
  attendeesCount: number;
}

import { getMediaUrl } from '../../config/api';

const getImageUrl = getMediaUrl;

export const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityService.getEvents()
      .then((data) => setEvents(data))
      .catch((err) => toast.error(err.message || 'Could not load events'))
      .finally(() => setLoading(false));
  }, []);

  const toggleRegister = async (id: string) => {
    try {
      const updated = await communityService.registerForEvent(id);
      setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...updated } : ev)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update registration');
    }
  };

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter(ev =>
      ev.title.toLowerCase().includes(q) ||
      ev.speaker.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <PageWrapper
      title="Events & Webinars"
      breadcrumbs={[{ label: 'CampusConnect' }, { label: 'Events' }]}
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex justify-end">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events or speakers..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No events yet"
            description="Webinars, orientations, and masterclasses posted by your TPO will show up here."
          />
        ) : (
        <div className="space-y-5">
          {filteredEvents.map(ev => { 
            const isOnline = ev.location.toLowerCase().includes('zoom') || ev.location.toLowerCase().includes('online');
            return (
            <Card key={ev.id} className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch gap-5">
              {/* Event Cover Image Poster */}
              <div className="relative w-full md:w-64 h-44 md:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                {ev.image ? (
                  <img
                    src={getImageUrl(ev.image)}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${ev.type === 'Webinar' ? 'bg-indigo-600' : ev.type === 'Orientation' ? 'bg-purple-600' : 'bg-emerald-600'}`} />
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${
                    ev.type === 'Webinar' ? 'bg-indigo-600/90' : ev.type === 'Orientation' ? 'bg-purple-600/90' : 'bg-emerald-600/90'
                  }`}>
                    {ev.type}
                  </span>
                </div>
              </div>

              {/* Event Details Content */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold">
                      <Calendar className="w-4 h-4" />
                      {formatDate(ev.date)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {formatTime(ev.startTime)} - {formatTime(ev.endTime)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    {ev.title}
                  </h3>

                  {/* Speaker Details */}
                  <div className="flex items-center gap-2.5 pt-1">
                    {ev.speakerAvatar ? (
                      <img
                        src={ev.speakerAvatar}
                        alt={ev.speaker}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px] font-black">
                        {ev.speaker.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Speaker: {ev.speaker}
                      </p>
                      {ev.speakerRole && (
                        <p className="text-[11px] font-semibold text-slate-400">
                          {ev.speakerRole}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Info & Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                      {isOnline ? (
                        <Video className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <MapPin className="w-4 h-4 text-purple-500" />
                      )}
                      {ev.location}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      {ev.attendeesCount} attending
                    </span>
                  </div>

                  {ev.isRegistered ? (
                    <button
                      onClick={() => toggleRegister(ev.id)}
                      className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleRegister(ev.id)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
          })}
        </div>
        )}
      </div>
    </PageWrapper>
  );
};

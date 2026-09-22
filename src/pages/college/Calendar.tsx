import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin, Video, User, Building, Users } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Badge, Skeleton } from '../../components/ui';
import { driveService, interviewService } from '../../services';
import type { PlacementDrive, Interview } from '../../types';

export const CollegeCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dList, iList] = await Promise.all([
          driveService.getAll(),
          interviewService.getAll({ page: 1, limit: 100 }),
        ]);
        setDrives(dList);
        setInterviews(iList.data);
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
  const getEventsForDay = (day: number) => {
    const checkDate = new Date(year, month, day);
    const dayDrives = drives.filter(d => isSameDay(new Date(d.date), checkDate));
    const dayInterviews = interviews.filter(i => isSameDay(new Date(i.date), checkDate));
    return { drives: dayDrives, interviews: dayInterviews };
  };

  const selectedEvents = isSameDay(currentDate, selectedDate) 
    ? getEventsForDay(selectedDate.getDate())
    : { drives: [], interviews: [] };
    
  if (selectedDate.getMonth() !== currentDate.getMonth() || selectedDate.getFullYear() !== currentDate.getFullYear()) {
    // If selected date is in another month but we clicked it, we shouldn't fail, but let's just use it
    const checkDate = selectedDate;
    selectedEvents.drives = drives.filter(d => isSameDay(new Date(d.date), checkDate));
    selectedEvents.interviews = interviews.filter(i => isSameDay(new Date(i.date), checkDate));
  }

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 border-b border-r border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const isToday = isSameDay(new Date(), new Date(year, month, d));
    const { drives: dayDrives, interviews: dayInterviews } = getEventsForDay(d);
    const hasEvents = dayDrives.length > 0 || dayInterviews.length > 0;

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
        </div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <PageWrapper
      title="Placement Calendar"
      subtitle="Track drives, interviews, and deadlines"
      breadcrumbs={[{ label: 'College' }, { label: 'Calendar' }]}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Calendar Grid */}
        <div className="flex-1">
          <Card className="overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
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
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Agenda</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : selectedEvents.drives.length === 0 && selectedEvents.interviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No events scheduled</p>
                  <p className="text-xs text-slate-500 mt-1">Take a break or schedule a new event.</p>
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
    </PageWrapper>
  );
};

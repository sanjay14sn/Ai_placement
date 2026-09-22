import React, { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, Search, GraduationCap, ChevronRight, CheckCircle2, Megaphone } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Badge, Select, Skeleton } from '../../components/ui';
import { toast } from 'sonner';
import { driveService } from '../../services';
import type { PlacementDrive } from '../../types';

interface StudentDrive extends PlacementDrive {
  isRegistered?: boolean;
}

export const StudentCampusDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<StudentDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'registered' | 'upcoming'>('all');

  useEffect(() => {
    driveService.getAll().then((data) => {
      setDrives(data);
    }).catch(() => {
      toast.error('Failed to load campus drives');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filteredDrives = drives.filter(d => {
    const companyName = d.company?.name || d.title;
    const matchesSearch = !search || companyName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'registered' && d.isRegistered) ||
                         (filter === 'upcoming' && d.status === 'upcoming');
    return matchesSearch && matchesFilter;
  });

  const handleRegister = (id: string) => {
    setDrives(prev => prev.map(d => d.id === id ? { ...d, isRegistered: true } : d));
    toast.success('Successfully registered for the campus drive!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <Badge variant="blue">Upcoming</Badge>;
      case 'ongoing': return <Badge variant="green" className="animate-pulse">Ongoing</Badge>;
      case 'completed': return <Badge variant="slate">Completed</Badge>;
      default: return null;
    }
  };

  return (
    <PageWrapper
      title="Campus Drives"
      subtitle="Upcoming recruitment events by top companies"
      breadcrumbs={[{ label: 'Student' }, { label: 'Placements' }, { label: 'Campus Drives' }]}
    >
      {/* Hero Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 mb-6 text-white overflow-hidden shadow-2xl border border-brand-500/30 group bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <Badge variant="amber" className="font-extrabold shadow-sm px-3 py-1 uppercase tracking-wider">Placement Season 2026</Badge>
            </div>
            <h2 className="text-2xl font-extrabold mb-1.5 drop-shadow-md text-white">
              {drives.filter(d => d.status === 'upcoming' || d.status === 'ongoing').length} Active Drives
            </h2>
            <p className="text-brand-100 text-sm font-medium max-w-xl">
              Don't miss out! Register for upcoming drives and secure your dream job before graduation.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hidden md:block">
            <p className="text-xs font-semibold text-brand-100 uppercase mb-1">Next Major Drive</p>
            <p className="text-lg font-bold">Amazon SDE-1</p>
            <p className="text-sm font-medium text-amber-300">Oct 25, 2026</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <div className="w-full sm:w-48 shrink-0">
            <Select 
              value={filter} 
              onChange={e => setFilter(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Drives' },
                { value: 'upcoming', label: 'Upcoming Only' },
                { value: 'registered', label: 'My Registrations' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Drives Grid */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
        ) : filteredDrives.map(drive => (
          <Card key={drive.id} className="p-6 hover:shadow-elevated transition-shadow duration-200">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Company & Core Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md border border-slate-700 overflow-hidden">
                    {drive.company?.logo ? <img src={drive.company.logo} alt={drive.company.name} className="w-full h-full object-cover" /> : (drive.company?.name ? drive.company.name[0] : drive.title[0] || 'C')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{drive.company?.name || drive.title}</h3>
                      {getStatusBadge(drive.status)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{drive.company?.industry || 'Technology'}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="slate" className="text-xs bg-slate-100 dark:bg-slate-800">
                        {drive.job?.title || drive.title}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="flex flex-col justify-between gap-4 md:w-72 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Package</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {drive.job?.salaryMin ? `₹${drive.job.salaryMin} - ${drive.job.salaryMax} LPA` : 'Not Specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Eligibility</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs text-right max-w-[120px]">
                      {drive.eligibility?.minCgpa ? `${drive.eligibility.minCgpa}+ CGPA` : 'Any'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Drive Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {drive.date ? new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {drive.isRegistered ? (
                    <Button variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Registered
                    </Button>
                  ) : (
                    <Button variant="primary" className="w-full shadow-md" onClick={() => handleRegister(drive.id)}>
                      Register Now
                    </Button>
                  )}
                  <p className="text-center text-[10px] text-slate-400 mt-2">
                    Deadline: {drive.endDate ? new Date(drive.endDate).toLocaleDateString() : (drive.date ? new Date(drive.date).toLocaleDateString() : 'N/A')}
                  </p>
                </div>
              </div>

            </div>
          </Card>
        ))}
        {!loading && filteredDrives.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No drives found</h3>
            <p className="text-slate-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

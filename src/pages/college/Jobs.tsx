import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Briefcase, MapPin, Clock, Building2, Users, Eye } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Pagination, EmptyState, Skeleton } from '../../components/ui';
import { jobService } from '../../services';
import { formatDate } from '../../utils';
import type { Job } from '../../types';

export const CollegeJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    jobService.getAll({ search, status: status || undefined, page, limit: 12 })
      .then(res => { setJobs(res.data); setTotal(res.total); setTotalPages(res.totalPages); })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  const statusColors: Record<string, 'green' | 'amber' | 'slate' | 'red'> = {
    active: 'green', draft: 'slate', paused: 'amber', closed: 'red', expired: 'red'
  };

  return (
    <PageWrapper title="Jobs" subtitle={`${total} total`}
      breadcrumbs={[{ label: 'College' }, { label: 'Jobs' }]}
      actions={<Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/college/jobs/create')}>Post Job</Button>}
    >
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input className="flex-1" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
          <Select value={status} onChange={e => setStatus(e.target.value)} placeholder="All Statuses" options={[{value:'active',label:'Active'},{value:'draft',label:'Draft'},{value:'closed',label:'Closed'}]} className="sm:w-40" />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-48 rounded-2xl"/>)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={<Briefcase className="w-6 h-6"/>} title="No jobs found" description="Try adjusting filters" action={{label:'Post a Job', onClick:()=>navigate('/college/jobs/create')}}/>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {jobs.map(job => (
              <Card key={job.id} className="p-5 hover:shadow-elevated transition-shadow cursor-pointer" onClick={()=>navigate(`/college/jobs/${job.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-ai-500 rounded-xl flex items-center justify-center text-white font-bold">{job.company.name[0]}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{job.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job.company.name}</p>
                    </div>
                  </div>
                  <Badge variant={statusColors[job.status] || 'slate'}>{job.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/>₹{job.salaryMin}–{job.salaryMax}L</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{job.openings} openings</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Deadline: {formatDate(job.applicationDeadline)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <div><p className="text-sm font-bold text-slate-900 dark:text-white">{job.stats.eligible}</p><p className="text-[10px] text-slate-400">Eligible</p></div>
                  <div><p className="text-sm font-bold text-brand-600">{job.stats.applied}</p><p className="text-[10px] text-slate-400">Applied</p></div>
                  <div><p className="text-sm font-bold text-emerald-600">{job.stats.selected}</p><p className="text-[10px] text-slate-400">Selected</p></div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={12} onPageChange={setPage}/>
        </>
      )}
    </PageWrapper>
  );
};

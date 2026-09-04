import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Bot, UserCheck, Star, GraduationCap, Award, Mail } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, ProgressRing, Pagination, EmptyState, Skeleton, AIBadge } from '../../components/ui';
import { studentService } from '../../services';
import { getMatchScoreRingColor } from '../../utils';
import { toast } from 'sonner';
import type { Student } from '../../types';

interface Candidate extends Student {
  matchScore: number;
}

export const RecruiterCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const navigate = useNavigate();

  const LIMIT = 10;

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        search,
        department: dept || undefined,
        page,
        limit: LIMIT,
      });

      // Inject AI Match Score for demonstration
      const processed = res.data.map(s => ({
        ...s,
        matchScore: s.cgpa >= 8.5 ? 85 + Math.floor(Math.random() * 15) : 60 + Math.floor(Math.random() * 25),
      })).sort((a, b) => b.matchScore - a.matchScore);

      setCandidates(processed);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [search, dept, minCgpa, page]);

  const handleShortlist = (id: string, name: string) => {
    toast.success(`Shortlisted candidate ${name}!`);
  };

  return (
    <PageWrapper
      title="Candidates"
      subtitle={`${total} candidate profiles`}
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Candidates' }]}
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name, skills, or department..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={dept}
            onChange={e => { setDept(e.target.value); setPage(1); }}
            placeholder="All Departments"
            options={['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'MCA', 'MBA'].map(d => ({ value: d, label: d }))}
            className="sm:w-48"
          />
          <Select
            value={minCgpa}
            onChange={e => { setMinCgpa(e.target.value); setPage(1); }}
            placeholder="Min CGPA"
            options={[
              { value: '6.0', label: '6.0+ CGPA' },
              { value: '7.0', label: '7.0+ CGPA' },
              { value: '8.0', label: '8.0+ CGPA' },
              { value: '9.0', label: '9.0+ CGPA' },
            ]}
            className="sm:w-40"
          />
        </div>
      </Card>

      {/* Grid of Candidates */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-28"><Skeleton className="h-full w-full rounded-2xl" /></Card>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-6 h-6" />}
          title="No candidates found"
          description="Try adjusting your search query or filters."
        />
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className="p-6 hover:shadow-elevated transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/college/students/${candidate.id}`)}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar name={candidate.name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{candidate.name}</h3>
                    <Badge variant={candidate.placementStatus === 'placed' ? 'green' : 'slate'} className="text-[10px]">
                      {candidate.placementStatus === 'placed' ? 'Placed' : 'Available'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{candidate.degree} in {candidate.department} · CGPA {candidate.cgpa} · Batch {candidate.batch}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {candidate.skills.slice(0, 5).map(skill => (
                      <Badge key={skill} variant="slate" className="text-[10px]">{skill}</Badge>
                    ))}
                    {candidate.skills.length > 5 && (
                      <Badge variant="slate" className="text-[10px]">+{candidate.skills.length - 5} more</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2">
                    <ProgressRing
                      value={candidate.matchScore}
                      size={48}
                      strokeWidth={4}
                      color={getMatchScoreRingColor(candidate.matchScore)}
                      label={`${candidate.matchScore}%`}
                    />
                    <div className="text-right">
                      <AIBadge label="AI Score" className="text-[9px]" />
                      <p className="text-[10px] text-slate-400 mt-0.5">Top Fit</p>
                    </div>
                  </div>

                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => handleShortlist(candidate.id, candidate.name)}
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    >
                      Shortlist
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!loading && candidates.length > 0 && (
            <div className="pt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

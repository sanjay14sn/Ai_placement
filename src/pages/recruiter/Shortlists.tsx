import React, { useState } from 'react';
import { 
  Search, Filter, UserCheck, Star, Calendar, Download, 
  Send, ChevronRight, CheckCircle2, XCircle, Clock, Sparkles,
  ArrowRight, ShieldCheck, Mail, Phone
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Avatar, ProgressRing, Modal } from '../../components/ui';
import { mockApplications, mockStudents, mockJobs } from '../../mock/data';
import { getMatchScoreRingColor } from '../../utils';
import { toast } from 'sonner';

export const RecruiterShortlistsPage: React.FC = () => {
  const [applications, setApplications] = useState(mockApplications.slice(0, 25));
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  
  // Schedule Interview Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('2025-09-10');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [roundType, setRoundType] = useState('technical');

  // Filter applications based on criteria
  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.student.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.job.title.toLowerCase().includes(search.toLowerCase()) ||
                          app.student.department.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || app.status === stageFilter;
    const matchesDept = deptFilter === 'all' || app.student.department === deptFilter;
    return matchesSearch && matchesStage && matchesDept;
  });

  // Calculate Metrics
  const totalShortlisted = applications.length;
  const inAssessment = applications.filter(a => a.status === 'assessment').length;
  const inTechnical = applications.filter(a => a.status === 'technical' || a.status === 'shortlisted').length;
  const selectedHired = applications.filter(a => a.status === 'selected').length;

  const handleStageChange = (appId: string, newStage: any) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStage } : a));
    toast.success(`Candidate pipeline stage updated to ${newStage.toUpperCase()}`);
  };

  const handleOpenScheduleModal = (app: any) => {
    setSelectedApp(app);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    toast.success(`🎉 Interview scheduled with ${selectedApp.student.name} for ${interviewDate} at ${interviewTime}!`, {
      description: 'Calendar invite and Google Meet link sent via email.'
    });
    setIsScheduleModalOpen(false);
  };

  const handleExportCSV = () => {
    toast.success(`Exported ${filteredApps.length} shortlisted candidates to CSV report!`);
  };

  return (
    <PageWrapper
      title="Shortlists & Candidate Pipeline"
      subtitle="Track, manage, and schedule candidates across active hiring rounds"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Shortlists' }]}
      actions={
        <Button 
          size="sm" 
          variant="outline" 
          leftIcon={<Download className="w-4 h-4" />} 
          onClick={handleExportCSV}
        >
          Export Shortlist CSV
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-brand-600/5 to-indigo-600/5 border border-brand-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Shortlisted</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalShortlisted} Candidates</div>
            <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-medium">Top 15% AI Match Qualified</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Assessment</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{inAssessment} Pending</div>
            <p className="text-[11px] text-slate-500 mt-1">Coding & Cognitive Tests</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Technical Round</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{inTechnical} Active</div>
            <p className="text-[11px] text-slate-500 mt-1">1-on-1 Interview Slots</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offers Extended</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{selectedHired} Selected</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">94% Offer Acceptance Rate</p>
          </Card>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search candidate name, role, or skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <Select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Pipeline Stages' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'assessment', label: 'Assessment' },
                { value: 'technical', label: 'Technical Round' },
                { value: 'hr', label: 'HR Round' },
                { value: 'selected', label: 'Selected / Hired' },
              ]}
              className="md:w-52"
            />

            <Select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'CSE', label: 'Computer Science (CSE)' },
                { value: 'ISE', label: 'Information Tech (ISE)' },
                { value: 'ECE', label: 'Electronics (ECE)' },
                { value: 'ME', label: 'Mechanical (ME)' },
              ]}
              className="md:w-48"
            />
          </div>
        </Card>

        {/* SHORTLISTED CANDIDATES LIST */}
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <Card key={app.id} className="p-5 hover:shadow-elevated transition-all border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                
                {/* Candidate Info */}
                <div className="flex items-center gap-4 flex-1">
                  <Avatar name={app.student.name} size="md" />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{app.student.name}</h3>
                      <Badge variant="indigo" className="text-[10px]">
                        {app.student.department}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">CGPA {app.student.cgpa}</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Applied for <strong className="text-slate-900 dark:text-white">{app.job.title}</strong> · Applied {app.appliedAt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.student.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="slate" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Match Ring & Stage Selector */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <ProgressRing
                      value={app.matchScore}
                      size={44}
                      strokeWidth={4}
                      color={getMatchScoreRingColor(app.matchScore)}
                      label={`${app.matchScore}%`}
                    />
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                        AI Fit Score
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Top Match</span>
                    </div>
                  </div>

                  {/* Stage Dropdown */}
                  <Select
                    value={app.status}
                    onChange={(e) => handleStageChange(app.id, e.target.value)}
                    options={[
                      { value: 'shortlisted', label: 'Stage: Shortlisted' },
                      { value: 'assessment', label: 'Stage: Assessment' },
                      { value: 'technical', label: 'Stage: Technical' },
                      { value: 'hr', label: 'Stage: HR Round' },
                      { value: 'selected', label: 'Stage: Hired' },
                    ]}
                    className="w-44 text-xs font-semibold"
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenScheduleModal(app)}
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Schedule Interview
                    </Button>
                  </div>
                </div>

              </div>
            </Card>
          ))}
        </div>

        {/* SCHEDULE INTERVIEW MODAL */}
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title={`Schedule Interview: ${selectedApp?.student.name}`}
        >
          {selectedApp && (
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Position</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedApp.job.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedApp.student.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">AI Match</span>
                  <span className="font-bold text-emerald-600">{selectedApp.matchScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Interview Round Type"
                  value={roundType}
                  onChange={e => setRoundType(e.target.value)}
                  options={[
                    { value: 'technical', label: 'Technical Round 1' },
                    { value: 'coding', label: 'System Design / Coding' },
                    { value: 'hr', label: 'HR & Cultural Fit' },
                    { value: 'final', label: 'Final Leadership Round' },
                  ]}
                />

                <Input
                  label="Interview Date"
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={interviewTime}
                  onChange={e => setInterviewTime(e.target.value)}
                  required
                />

                <Select
                  label="Duration"
                  options={[
                    { value: '30', label: '30 Minutes' },
                    { value: '45', label: '45 Minutes' },
                    { value: '60', label: '60 Minutes (1 Hour)' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Meeting Link (Google Meet / MS Teams)
                </label>
                <Input
                  defaultValue="https://meet.google.com/xyz-abcd-efg"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Send Invite & Confirm Slot
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};

import React, { useState } from 'react';
import {
  Video, Play, CheckCircle2, Circle, Clock, Building, BookOpen, Star, FileText,
  Search, Sparkles, Download, Layers
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Button, Card, Badge, Input, Modal, Avatar } from '../../components/ui';
import { useProgramStore } from '../../store/programStore';
import type { Program, ProgramVideo } from '../../types';
import { toast } from 'sonner';

export const RecruiterProgramsPage: React.FC = () => {
  const { getProgramsForRole, completedVideos, toggleVideoCompleted } = useProgramStore();
  const programs = getProgramsForRole('RECRUITER');
  const [searchQuery, setSearchQuery] = useState('');

  // Video player state
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [activeVideo, setActiveVideo] = useState<ProgramVideo | null>(null);

  const filteredPrograms = programs.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper
      title="Corporate Hiring & Recruiter Masterclasses"
      subtitle="Super Admin guidance on campus recruitment best practices, AI candidate screening & virtual drive execution"
    >
      <div className="space-y-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="amber" className="bg-white/20 text-white border-white/30 text-xs mb-3">
              <Building className="w-3.5 h-3.5 mr-1" /> Employer Hiring Excellence
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hire Top 5% Campus Talent with AI & Automation
            </h2>
            <p className="text-sm text-amber-100 mt-2 leading-relaxed">
              Discover best practices for bulk campus hiring, automated ATS candidate scoring, employer branding, and structured interview panel scorecards.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-600" /> Recruiter Guides & Webinars ({filteredPrograms.length})
          </h3>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search recruiter videos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-800">
            <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No recruiter video programs available</h3>
            <p className="text-sm text-slate-500 mt-1">
              Super Admin has not published any videos targeted for Companies / Recruiters yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={program.thumbnailUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  <button
                    onClick={() => {
                      setActiveProgram(program);
                      setActiveVideo(program.videos[0] || null);
                    }}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-amber-600 transition-all opacity-95"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>

                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {program.totalDuration}
                  </span>

                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 text-[10px] font-bold shadow">
                    {program.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {program.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={program.instructorName} size="xs" src={program.instructorAvatar} />
                        <span className="truncate max-w-[120px] font-medium text-slate-700 dark:text-slate-300">
                          {program.instructorName}
                        </span>
                      </div>
                      <span className="font-semibold text-amber-600">
                        {program.videosCount} Video Modules
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveProgram(program);
                        setActiveVideo(program.videos[0] || null);
                      }}
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Watch Program
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Video Modal Player ─────────────────────────────────────────────── */}
        {activeProgram && activeVideo && (
          <Modal
            isOpen={!!activeProgram}
            onClose={() => setActiveProgram(null)}
            title={activeProgram.title}
            size="xl"
          >
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-slate-800">
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Module {activeVideo.order}: {activeVideo.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Duration: {activeVideo.duration} • Speaker: {activeProgram.instructorName}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      toggleVideoCompleted(activeProgram.id, activeVideo.id);
                      toast.success(
                        completedVideos[`${activeProgram.id}_${activeVideo.id}`]
                          ? 'Module marked incomplete'
                          : 'Module completed'
                      );
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      completedVideos[`${activeProgram.id}_${activeVideo.id}`]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {completedVideos[`${activeProgram.id}_${activeVideo.id}`] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Watched
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" /> Mark as Watched
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {activeVideo.description}
                </p>

                {activeVideo.resources && activeVideo.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500" /> Recruiter Guidelines & Playbooks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeVideo.resources.map((res) => (
                        <a
                          key={res.id}
                          href={res.url}
                          onClick={(e) => { e.preventDefault(); toast.info(`Downloading Recruiter Resource: ${res.title}`); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-amber-500 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-500" /> {res.title} ({res.size || 'Download'})
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recruiter Modules ({activeProgram.videos.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeProgram.videos.map((vid) => (
                    <button
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        activeVideo.id === vid.id
                          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-semibold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          activeVideo.id === vid.id ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {vid.order}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{vid.title}</p>
                          <p className="text-[11px] text-slate-400">{vid.duration}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-amber-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageWrapper>
  );
};

import React, { useState } from 'react';
import {
  Video, Play, CheckCircle2, Circle, Clock, BookOpen, Star, FileText,
  Search, Award, Sparkles, Check, Download, ArrowRight
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Button, Card, Badge, Input, Modal, Avatar } from '../../components/ui';
import { useProgramStore } from '../../store/programStore';
import type { Program, ProgramVideo } from '../../types';
import { toast } from 'sonner';

export const StudentProgramsPage: React.FC = () => {
  const { getProgramsForRole, completedVideos, toggleVideoCompleted } = useProgramStore();
  const programs = getProgramsForRole('STUDENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Video Player state
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [activeVideo, setActiveVideo] = useState<ProgramVideo | null>(null);

  const categories = ['ALL', 'Placement Training', 'Career Advice', 'Technical'];

  const filteredPrograms = programs.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getProgramProgress = (program: Program) => {
    if (!program.videos || program.videos.length === 0) return 0;
    const completedCount = program.videos.filter(
      v => completedVideos[`${program.id}_${v.id}`]
    ).length;
    return Math.round((completedCount / program.videos.length) * 100);
  };

  return (
    <PageWrapper
      title="Placement Learning & Video Masterclasses"
      subtitle="Curated video modules, technical prep & interview masterclasses assigned by Super Admin"
    >
      <div className="space-y-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-ai-600 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="blue" className="bg-white/20 text-white border-white/30 text-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Student Career Accelerator
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Master Technical Rounds & Land Top Placement Offers
            </h2>
            <p className="text-sm text-brand-100 mt-2 leading-relaxed">
              Watch high-impact video lectures from tech leaders, download placement handouts, and complete practice modules to boost your Placement Readiness Score.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'All Video Courses' : cat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search video tutorials..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Programs Cards Grid */}
        {filteredPrograms.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-800">
            <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No video programs available</h3>
            <p className="text-sm text-slate-500 mt-1">
              Check back soon for new placement video releases from your Super Admin team.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => {
              const progress = getProgramProgress(program);
              return (
                <Card
                  key={program.id}
                  className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col group"
                >
                  {/* Thumbnail with overlay */}
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
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-brand-600 transition-all opacity-95"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {program.totalDuration}
                    </span>

                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-[10px] font-bold shadow">
                      {program.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {program.rating}
                        </span>
                        <span>{program.enrolledCount} Students Enrolled</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {program.subtitle}
                      </p>
                    </div>

                    {/* Progress Bar & Footer */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          <span>Course Progress</span>
                          <span className="text-brand-600">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Avatar name={program.instructorName} size="xs" src={program.instructorAvatar} />
                          <span className="truncate max-w-[110px]">{program.instructorName}</span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveProgram(program);
                            setActiveVideo(program.videos[0] || null);
                          }}
                          leftIcon={<Play className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          {progress > 0 ? 'Continue Watching' : 'Start Course'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── Video Learning Modal Player ───────────────────────────────────── */}
        {activeProgram && activeVideo && (
          <Modal
            isOpen={!!activeProgram}
            onClose={() => setActiveProgram(null)}
            title={activeProgram.title}
            size="xl"
          >
            <div className="space-y-4">
              {/* Responsive Video Embed */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-slate-800">
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Active Video Header & Complete Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Module {activeVideo.order}: {activeVideo.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Duration: {activeVideo.duration} • Instructor: {activeProgram.instructorName}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      toggleVideoCompleted(activeProgram.id, activeVideo.id);
                      toast.success(
                        completedVideos[`${activeProgram.id}_${activeVideo.id}`]
                          ? 'Module marked as incomplete'
                          : 'Module completed! Great job 🎉'
                      );
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      completedVideos[`${activeProgram.id}_${activeVideo.id}`]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {completedVideos[`${activeProgram.id}_${activeVideo.id}`] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" /> Mark as Completed
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {activeVideo.description}
                </p>

                {/* Handouts & Attachments */}
                {activeVideo.resources && activeVideo.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-500" /> Attached Learning Materials & Starter Code:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeVideo.resources.map((res) => (
                        <a
                          key={res.id}
                          href={res.url}
                          onClick={(e) => { e.preventDefault(); toast.info(`Downloading handout: ${res.title}`); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-500" /> {res.title} ({res.size || 'Download'})
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Playlist */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Course Modules ({activeProgram.videos.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeProgram.videos.map((vid) => {
                    const isDone = completedVideos[`${activeProgram.id}_${vid.id}`];
                    return (
                      <button
                        key={vid.id}
                        onClick={() => setActiveVideo(vid)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          activeVideo.id === vid.id
                            ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-600 text-brand-900 dark:text-brand-200 font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                              activeVideo.id === vid.id ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            }`}>
                              {vid.order}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium">{vid.title}</p>
                            <p className="text-[11px] text-slate-400">{vid.duration}</p>
                          </div>
                        </div>
                        <Play className="w-4 h-4 text-brand-600" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageWrapper>
  );
};

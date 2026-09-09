import React, { useState } from 'react';
import {
  Video, Play, Plus, Search, Filter, Eye, Edit3, Trash2, CheckCircle2,
  Users, GraduationCap, Building2, Building, BookOpen, Layers, Clock,
  FileText, ExternalLink, Globe, Sparkles, X, Upload, Check, AlertCircle
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Button, Card, Badge, Input, Select, Modal, Tabs, Avatar } from '../../components/ui';
import { useProgramStore } from '../../store/programStore';
import type { Program, ProgramVideo, TargetAudience } from '../../types';
import { toast } from 'sonner';

export const SuperAdminProgramsPage: React.FC = () => {
  const { programs, addProgram, updateProgram, deleteProgram, togglePublishStatus } = useProgramStore();
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [previewProgram, setPreviewProgram] = useState<Program | null>(null);
  const [activeVideo, setActiveVideo] = useState<ProgramVideo | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Placement Training');
  const [formAudience, setFormAudience] = useState<TargetAudience[]>(['STUDENT']);
  const [formInstructorName, setFormInstructorName] = useState('Super Admin Team');
  const [formInstructorTitle, setFormInstructorTitle] = useState('PlacementOS Learning Director');
  const [formThumbnail, setFormThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80');

  // Video Form items
  const [formVideos, setFormVideos] = useState<Omit<ProgramVideo, 'id'>[]>([
    {
      order: 1,
      title: 'Module 1: Orientation & High-Level Overview',
      description: 'Introduction to key concepts, objectives, and prerequisites.',
      duration: '30:00',
      videoUrl: 'https://www.youtube.com/embed/1uF7oP33-9w'
    }
  ]);

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormCategory('Placement Training');
    setFormAudience(['STUDENT']);
    setFormInstructorName('Super Admin Team');
    setFormInstructorTitle('PlacementOS Learning Director');
    setFormThumbnail('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80');
    setFormVideos([
      {
        order: 1,
        title: 'Module 1: Orientation & High-Level Overview',
        description: 'Introduction to key concepts, objectives, and prerequisites.',
        duration: '30:00',
        videoUrl: 'https://www.youtube.com/embed/1uF7oP33-9w'
      }
    ]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (program: Program) => {
    setEditingProgram(program);
    setFormTitle(program.title);
    setFormSubtitle(program.subtitle);
    setFormDescription(program.description);
    setFormCategory(program.category);
    setFormAudience(program.targetAudience);
    setFormInstructorName(program.instructorName);
    setFormInstructorTitle(program.instructorTitle);
    setFormThumbnail(program.thumbnailUrl);
    setFormVideos(program.videos.map(v => ({
      order: v.order,
      title: v.title,
      description: v.description,
      duration: v.duration,
      videoUrl: v.videoUrl,
      resources: v.resources
    })));
    setIsCreateModalOpen(true);
  };

  const handleAudienceCheckbox = (aud: TargetAudience) => {
    if (formAudience.includes(aud)) {
      if (formAudience.length === 1) return; // keep at least one
      setFormAudience(formAudience.filter(a => a !== aud));
    } else {
      setFormAudience([...formAudience, aud]);
    }
  };

  const handleAddVideoField = () => {
    setFormVideos([
      ...formVideos,
      {
        order: formVideos.length + 1,
        title: `Module ${formVideos.length + 1}: Next Lesson`,
        description: 'Detailed practical walk-through and scenario breakdown.',
        duration: '25:00',
        videoUrl: 'https://www.youtube.com/embed/bUHFg8CZFuc'
      }
    ]);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a program title');
      return;
    }

    const compiledVideos: ProgramVideo[] = formVideos.map((v, i) => ({
      id: `vid-${Date.now()}-${i}`,
      order: i + 1,
      title: v.title,
      description: v.description,
      duration: v.duration,
      videoUrl: v.videoUrl,
      resources: v.resources
    }));

    if (editingProgram) {
      updateProgram(editingProgram.id, {
        title: formTitle,
        subtitle: formSubtitle,
        description: formDescription,
        category: formCategory,
        targetAudience: formAudience,
        instructorName: formInstructorName,
        instructorTitle: formInstructorTitle,
        thumbnailUrl: formThumbnail,
        videosCount: compiledVideos.length,
        videos: compiledVideos
      });
      toast.success('Program updated successfully!');
    } else {
      addProgram({
        title: formTitle,
        subtitle: formSubtitle,
        description: formDescription,
        category: formCategory,
        targetAudience: formAudience,
        instructorName: formInstructorName,
        instructorTitle: formInstructorTitle,
        thumbnailUrl: formThumbnail,
        isPublished: true,
        totalDuration: `${compiledVideos.length * 40} mins`,
        videosCount: compiledVideos.length,
        videos: compiledVideos,
        enrolledCount: 0,
        rating: 5.0,
        tags: [formCategory]
      });
      toast.success('New Program published & distributed!');
    }
    setIsCreateModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProgram(id);
      toast.success('Program removed');
    }
  };

  // Filter programs
  const filteredPrograms = programs.filter(p => {
    const matchesAudience =
      selectedAudience === 'ALL' ||
      p.targetAudience.includes('ALL') ||
      p.targetAudience.includes(selectedAudience as TargetAudience);

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'ALL' || p.category === activeCategory;

    return matchesAudience && matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalPrograms = programs.length;
  const publishedCount = programs.filter(p => p.isPublished).length;
  const studentProgramsCount = programs.filter(p => p.targetAudience.includes('STUDENT')).length;
  const tpoProgramsCount = programs.filter(p => p.targetAudience.includes('COLLEGE_ADMIN') || p.targetAudience.includes('TPO')).length;
  const recruiterProgramsCount = programs.filter(p => p.targetAudience.includes('RECRUITER')).length;

  return (
    <PageWrapper
      title="Video Programs & Distribution Hub"
      subtitle="Super Admin Hub to publish videos for Direct Students, College Placement Officers, and Companies"
      actions={
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create New Video Program
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-[#121212] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-50 dark:bg-brand-900/40 text-brand-600 rounded-xl">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Video Programs</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalPrograms}</span>
                  <span className="text-xs text-emerald-600 font-medium">({publishedCount} Published)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">For Direct Students</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{studentProgramsCount}</span>
                  <span className="text-xs text-slate-400">Placement Prep</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/40 text-purple-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">For TPOs / Colleges</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{tpoProgramsCount}</span>
                  <span className="text-xs text-slate-400">Drive Management</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">For Companies</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{recruiterProgramsCount}</span>
                  <span className="text-xs text-slate-400">Recruiter Onboarding</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Audience Target Filters & Controls */}
        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Target Audience Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Audience:
              </span>
              {[
                { id: 'ALL', label: 'All Audiences', icon: <Layers className="w-3.5 h-3.5" /> },
                { id: 'STUDENT', label: 'Direct Students', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                { id: 'TPO', label: 'College Placement Officers', icon: <Building2 className="w-3.5 h-3.5" /> },
                { id: 'RECRUITER', label: 'Companies (Recruiters)', icon: <Building className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedAudience(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    selectedAudience === tab.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-64">
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>
        </Card>

        {/* Program Cards Grid */}
        {filteredPrograms.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-800">
            <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No programs found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              There are no video programs matching the selected audience target or search query.
            </p>
            <Button onClick={handleOpenCreate} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Create Video Program
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={program.thumbnailUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Play Button Trigger */}
                  <button
                    onClick={() => {
                      setPreviewProgram(program);
                      setActiveVideo(program.videos[0] || null);
                    }}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-brand-600 transition-all group-hover:opacity-100 opacity-90"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>

                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {program.totalDuration}
                  </span>

                  {/* Publish Status Badge */}
                  <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    program.isPublished
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {program.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Audience Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {program.targetAudience.map((aud) => {
                        if (aud === 'STUDENT') return <Badge key={aud} variant="blue" className="text-[10px]">Direct Students</Badge>;
                        if (aud === 'COLLEGE_ADMIN' || aud === 'TPO') return <Badge key={aud} variant="purple" className="text-[10px]">College TPOs</Badge>;
                        if (aud === 'RECRUITER') return <Badge key={aud} variant="amber" className="text-[10px]">Companies</Badge>;
                        return <Badge key={aud} variant="indigo" className="text-[10px]">All Roles</Badge>;
                      })}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {program.description}
                    </p>
                  </div>

                  {/* Program Metadata */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={program.instructorName} size="xs" src={program.instructorAvatar} />
                        <span className="truncate max-w-[120px] font-medium text-slate-700 dark:text-slate-300">
                          {program.instructorName}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <Video className="w-3.5 h-3.5 text-brand-500" /> {program.videosCount} Videos
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => {
                          setPreviewProgram(program);
                          setActiveVideo(program.videos[0] || null);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Preview
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleOpenEdit(program)}
                        title="Edit Program"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs ${program.isPublished ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                        onClick={() => {
                          togglePublishStatus(program.id);
                          toast.success(program.isPublished ? 'Status changed to Draft' : 'Program Published!');
                        }}
                        title={program.isPublished ? 'Unpublish to Draft' : 'Publish Program'}
                      >
                        {program.isPublished ? 'Draft' : 'Publish'}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleDelete(program.id, program.title)}
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Video Preview Player Modal ─────────────────────────────────────── */}
        {previewProgram && activeVideo && (
          <Modal
            isOpen={!!previewProgram}
            onClose={() => setPreviewProgram(null)}
            title={previewProgram.title}
            size="xl"
          >
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-slate-800">
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Active Video Title & Description */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeVideo.order}. {activeVideo.title}
                  </h4>
                  <Badge variant="blue" className="text-xs">{activeVideo.duration}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {activeVideo.description}
                </p>

                {/* Downloadable Resources if present */}
                {activeVideo.resources && activeVideo.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-500" /> Attached Learning Handouts:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeVideo.resources.map((res) => (
                        <a
                          key={res.id}
                          href={res.url}
                          onClick={(e) => { e.preventDefault(); toast.info(`Downloading resource: ${res.title}`); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-all shadow-sm"
                        >
                          <span>📄</span> {res.title} ({res.size || 'PDF'})
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modules Playlist */}
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Program Course Modules ({previewProgram.videos.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {previewProgram.videos.map((vid) => (
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
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          activeVideo.id === vid.id ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {vid.order}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{vid.title}</p>
                          <p className="text-[11px] text-slate-400">{vid.duration}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-brand-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── Create / Edit Program Modal ────────────────────────────────────── */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingProgram ? 'Edit Video Program' : 'Create & Broadcast New Video Program'}
          size="xl"
        >
          <form onSubmit={handleSaveProgram} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Masterclass on Campus Recruitment & Interviewing"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle / Summary
                </label>
                <Input
                  placeholder="Short tagline explaining what viewers will learn"
                  value={formSubtitle}
                  onChange={e => setFormSubtitle(e.target.value)}
                />
              </div>

              {/* Target Audience Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audience Distribution (Who receives these videos?) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAudienceCheckbox('STUDENT')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formAudience.includes('STUDENT')
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" /> Direct Students
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAudienceCheckbox('TPO')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formAudience.includes('TPO') || formAudience.includes('COLLEGE_ADMIN')
                        ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-400 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Placement Officers
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAudienceCheckbox('RECRUITER')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formAudience.includes('RECRUITER')
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building className="w-4 h-4" /> Companies
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <Select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  options={[
                    { value: 'Placement Training', label: 'Placement Training' },
                    { value: 'TPO Orientation', label: 'TPO Orientation' },
                    { value: 'Corporate Hiring', label: 'Corporate Hiring' },
                    { value: 'Career Advice', label: 'Career Advice' },
                    { value: 'Policy & Compliance', label: 'Policy & Compliance' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor Name
                  </label>
                  <Input
                    value={formInstructorName}
                    onChange={e => setFormInstructorName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thumbnail Image URL
                  </label>
                  <Input
                    value={formThumbnail}
                    onChange={e => setFormThumbnail(e.target.value)}
                  />
                </div>
              </div>

              {/* Video Lessons Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Video Modules & Lessons ({formVideos.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVideoField}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Module
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  {formVideos.map((vid, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Lesson #{idx + 1}
                        </span>
                        {formVideos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormVideos(formVideos.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Lesson Title"
                          value={vid.title}
                          onChange={e => {
                            const updated = [...formVideos];
                            updated[idx].title = e.target.value;
                            setFormVideos(updated);
                          }}
                        />
                        <Input
                          placeholder="Video Embed URL (YouTube/Vimeo)"
                          value={vid.videoUrl}
                          onChange={e => {
                            const updated = [...formVideos];
                            updated[idx].videoUrl = e.target.value;
                            setFormVideos(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProgram ? 'Save Changes' : 'Publish & Distribute Program'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
};

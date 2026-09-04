import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, Globe, Download, Bot, Award } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Avatar, Progress, ProgressRing, Tabs, AIBadge, Timeline } from '../../components/ui';
import { studentService, aiService } from '../../services';
import { getMatchScoreRingColor, formatDate, cn } from '../../utils';
import { toast } from 'sonner';
import type { Student } from '../../types';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [readiness, setReadiness] = useState<Awaited<ReturnType<typeof aiService.getPlacementReadiness>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      studentService.getById(id),
      aiService.getPlacementReadiness(id),
    ]).then(([s, r]) => { setStudent(s); setReadiness(r); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageWrapper title="Loading..." breadcrumbs={[{ label: 'College' }, { label: 'Students', to: '/college/students' }, { label: '...' }]}>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (!student) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'applications', label: 'Applications' },
    { id: 'ai', label: '✨ AI Analysis' },
  ];

  return (
    <PageWrapper
      title={student.name}
      subtitle={`${student.department} · ${student.batch}`}
      breadcrumbs={[{ label: 'College' }, { label: 'Students', to: '/college/students' }, { label: student.name }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.success('Downloading resume...')}>
            Resume
          </Button>
          <Button size="sm" leftIcon={<Mail className="w-4 h-4" />} onClick={() => toast.success(`Email sent to ${student.name}`)}>
            Notify
          </Button>
        </div>
      }
    >
      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative">
            <Avatar name={student.name} size="xl" />
            {student.placementStatus === 'placed' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">{student.studentId} · {student.degree} in {student.department}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={student.placementStatus === 'placed' ? 'green' : student.isEligible ? 'amber' : 'red'}>
                    {student.placementStatus === 'placed' ? '🏆 Placed' : student.isEligible ? 'Seeking' : 'Not Eligible'}
                  </Badge>
                  <Badge variant="slate">Batch {student.batch}</Badge>
                  <Badge variant={student.cgpa >= 8 ? 'green' : student.cgpa >= 7 ? 'indigo' : 'amber'}>
                    CGPA: {student.cgpa}
                  </Badge>
                  {student.backlogs === 0 && <Badge variant="green">No Backlogs</Badge>}
                </div>
              </div>

              {/* Scores */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <ProgressRing
                    value={student.profileCompletion}
                    size={72}
                    color={student.profileCompletion >= 80 ? '#10b981' : '#f59e0b'}
                    label={`${student.profileCompletion}%`}
                    sublabel="Profile"
                  />
                </div>
                <div className="text-center">
                  <ProgressRing
                    value={readiness?.overallScore || 0}
                    size={72}
                    color={getMatchScoreRingColor(readiness?.overallScore || 0)}
                    label={`${readiness?.overallScore || 0}`}
                    sublabel="Readiness"
                  />
                </div>
              </div>
            </div>

            {/* Contact Links */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
              <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                <Mail className="w-3.5 h-3.5" />{student.email}
              </a>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{student.phone}</span>
              {student.linkedIn && (
                <a href={student.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  LinkedIn
                </a>
              )}
              {student.github && (
                <a href={student.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Skills */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {student.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-xl text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            {/* Projects */}
            {student.projects.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Projects</h3>
                <div className="space-y-4">
                  {student.projects.map(p => (
                    <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{p.title}</h4>
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                            
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.technologies.map(t => <Badge key={t} variant="slate">{t}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Placement Readiness */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Placement Readiness</h3>
                <AIBadge label="AI" />
              </div>
              {readiness && (
                <div className="space-y-3">
                  {Object.entries(readiness.breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{val}%</span>
                      </div>
                      <Progress value={val} size="sm" color={val >= 75 ? 'green' : val >= 50 ? 'brand' : 'amber'} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Certifications */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Certifications</h3>
              {student.certifications.length > 0 ? (
                <div className="space-y-2">
                  {student.certifications.map(cert => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{cert.name}</p>
                        <p className="text-xs text-slate-500">{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No certifications added</p>
              )}
            </Card>

            {/* Preferred */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Preferences</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Preferred Locations</p>
                  <div className="flex flex-wrap gap-1">
                    {student.preferredLocations.map(loc => <Badge key={loc} variant="blue">{loc}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Preferred Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {student.preferredRoles.map(r => <Badge key={r} variant="indigo">{r}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Expected Salary</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">₹{student.expectedSalary} LPA</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card className="p-6 border-ai-200 dark:border-ai-900/50">
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-5 h-5 text-ai-600" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI Placement Analysis</h3>
              <AIBadge />
            </div>
            {readiness && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">✅ Strengths</h4>
                  <ul className="space-y-2">
                    {readiness.strengths.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ Areas to Improve</h4>
                  <ul className="space-y-2">
                    {readiness.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>

          {readiness && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Improvement Timeline</h3>
              <Timeline items={readiness.improvementTimeline.map(item => ({
                label: `Week ${item.week}: ${item.action}`,
                status: 'pending' as const,
                description: `Expected score gain: +${item.expectedGain} points`,
              }))} />
            </Card>
          )}
        </div>
      )}

      {activeTab === 'education' && (
        <div className="space-y-4">
          {student.education.map(edu => (
            <Card key={edu.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{edu.degree}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{edu.institution}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{edu.location} · {edu.yearOfPassing}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-brand-600">{edu.score} {edu.scoreType === 'cgpa' ? 'CGPA' : '%'}</p>
                  <Badge variant="slate" className="mt-1">{edu.level.toUpperCase()}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

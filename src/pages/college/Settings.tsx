import React, { useEffect, useState } from 'react';
import { Building2, Bell, Shield, Save, GraduationCap, MapPin, Phone, Mail, Globe, UserRound } from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Skeleton } from '../../components/ui';
import { authService, collegeService } from '../../services';
import { useAuthStore } from '../../store';
import type { College } from '../../types';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'placement' | 'notifications' | 'security';

const defaultSettings = {
  minCgpa: 6,
  maxBacklogs: 0,
  driveAlerts: true,
  applicationAlerts: true,
  interviewReminders: true,
};

export const CollegeSettingsPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [college, setCollege] = useState<College | null>(null);
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    website: '',
    phone: '',
    email: '',
    affiliation: '',
    establishedYear: '',
    tpoName: '',
    tpoEmail: '',
    tpoPhone: '',
    settings: defaultSettings,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const collegeId = user?.tenantId;
    if (!collegeId) {
      setLoading(false);
      return;
    }
    collegeService.getById(collegeId)
      .then(data => {
        setCollege(data);
        setForm({
          name: data.name || '',
          city: data.city || '',
          state: data.state || '',
          website: data.website || '',
          phone: data.phone || '',
          email: data.email || '',
          affiliation: data.affiliation || '',
          establishedYear: data.establishedYear ? String(data.establishedYear) : '',
          tpoName: data.tpoName || '',
          tpoEmail: data.tpoEmail || '',
          tpoPhone: data.tpoPhone || '',
          settings: { ...defaultSettings, ...data.settings },
        });
      })
      .catch(err => {
        toast.error(err instanceof Error ? err.message : 'Could not load college settings');
      })
      .finally(() => setLoading(false));
  }, [user?.tenantId]);

  const saveCollege = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!college) return;
    setSaving(true);
    try {
      const updated = await collegeService.update(college.id, {
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        website: form.website.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        affiliation: form.affiliation.trim(),
        establishedYear: Number(form.establishedYear) || college.establishedYear,
        tpoName: form.tpoName.trim(),
        tpoEmail: form.tpoEmail.trim(),
        tpoPhone: form.tpoPhone.trim(),
        settings: form.settings,
      });
      setCollege(updated);
      toast.success('College settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Campus profile', icon: <Building2 className="w-4 h-4" /> },
    { id: 'placement', label: 'Placement rules', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Password', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <PageWrapper
      title="Settings"
      breadcrumbs={[{ label: 'College' }, { label: 'Settings' }]}
    >
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit">
          {tabs.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                tab === item.id
                  ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Card className="overflow-hidden">
            <Skeleton className="h-28 w-full rounded-none" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </Card>
        ) : !college ? (
          <Card className="p-8 text-center text-sm text-slate-500">This account is not linked to a college.</Card>
        ) : tab === 'security' ? (
          <form onSubmit={changePassword} className="space-y-4">
            <Card className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Account password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Signed in as {user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Current password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <Input label="Confirm new password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </Card>
            <div className="flex justify-end">
              <Button type="submit" loading={changingPassword} leftIcon={<Save className="w-4 h-4" />}>Update password</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={saveCollege} className="space-y-4">
            {tab === 'profile' && (
              <>
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
                  <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-ai-600 px-6 py-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-black tracking-tight">
                        {college.code.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{college.code}</p>
                        <h2 className="text-xl font-bold leading-tight truncate">{form.name || college.name}</h2>
                        <p className="text-sm text-white/80 mt-1 flex flex-wrap items-center gap-x-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{form.city || 'City'}, {form.state || 'State'}</span>
                          <span className="text-white/40">·</span>
                          <span>Est. {form.establishedYear || '—'}</span>
                          {form.affiliation && (
                            <>
                              <span className="text-white/40">·</span>
                              <span>{form.affiliation}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="College name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    <Input label="Affiliation" value={form.affiliation} onChange={e => setForm({ ...form, affiliation: e.target.value })} placeholder="VTU" />
                    <Input label="City" leftIcon={<MapPin className="w-4 h-4" />} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                    <Input label="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                    <Input label="Phone" leftIcon={<Phone className="w-4 h-4" />} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                    <Input label="Email" type="email" leftIcon={<Mail className="w-4 h-4" />} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <Input label="Website" leftIcon={<Globe className="w-4 h-4" />} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" />
                    <Input label="Established year" type="number" value={form.establishedYear} onChange={e => setForm({ ...form, establishedYear: e.target.value })} />
                  </div>
                </Card>

                <Card className="p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Placement office</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Officer name" value={form.tpoName} onChange={e => setForm({ ...form, tpoName: e.target.value })} placeholder="Placement officer" />
                    <Input label="Officer email" type="email" value={form.tpoEmail} onChange={e => setForm({ ...form, tpoEmail: e.target.value })} placeholder="tpo@college.edu" />
                    <Input label="Officer phone" value={form.tpoPhone} onChange={e => setForm({ ...form, tpoPhone: e.target.value })} placeholder="Optional" />
                  </div>
                </Card>
              </>
            )}

            {tab === 'placement' && (
              <Card className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Default eligibility</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Campus baseline used when a new placement drive is created.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/40">
                    <Input
                      label="Minimum CGPA"
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={form.settings.minCgpa}
                      onChange={e => setForm({ ...form, settings: { ...form.settings, minCgpa: Number(e.target.value) } })}
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/40">
                    <Input
                      label="Maximum backlogs"
                      type="number"
                      min={0}
                      value={form.settings.maxBacklogs}
                      onChange={e => setForm({ ...form, settings: { ...form.settings, maxBacklogs: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </Card>
            )}

            {tab === 'notifications' && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus alerts</h3>
                </div>
                {[
                  { key: 'driveAlerts' as const, label: 'Drive updates', detail: 'Email the placement office when a drive is posted or changed' },
                  { key: 'applicationAlerts' as const, label: 'New applications', detail: 'Alert when a student registers for a campus drive' },
                  { key: 'interviewReminders' as const, label: 'Interview reminders', detail: 'Remind officers before scheduled interview slots' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.detail}</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.settings[item.key]}
                      onClick={() => setForm({ ...form, settings: { ...form.settings, [item.key]: !form.settings[item.key] } })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.settings[item.key] ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.settings[item.key] ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </Card>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <p className="text-xs text-slate-400 mr-auto hidden sm:block">Changes apply to {college.code}</p>
              <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4" />}>Save settings</Button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
};

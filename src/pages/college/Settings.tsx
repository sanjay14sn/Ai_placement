import React, { useEffect, useState } from 'react';
import {
  Building2, Bell, Shield, Save, GraduationCap, MapPin, Phone, Mail, Globe, UserRound, Lock, Info, CheckCircle2, ShieldCheck, Award
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Skeleton, Badge } from '../../components/ui';
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
        phone: college.phone || form.phone.trim(), // Keep locked original
        email: college.email || form.email.trim(), // Keep locked original
        affiliation: form.affiliation.trim(),
        establishedYear: Number(form.establishedYear) || college.establishedYear,
        tpoName: form.tpoName.trim(),
        tpoEmail: college.tpoEmail || form.tpoEmail.trim(), // Keep locked original
        tpoPhone: college.tpoPhone || form.tpoPhone.trim(), // Keep locked original
        settings: form.settings,
      });
      setCollege(updated);
      toast.success('College settings saved successfully');
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
      toast.success('Password updated successfully');
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
      subtitle="Manage your college profile, placement eligibility rules, alert preferences, and account security"
      breadcrumbs={[{ label: 'College' }, { label: 'Settings' }]}
    >
      <div className="w-full space-y-6">
        {/* Full-width Tabs Bar */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  tab === item.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {college && (
            <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {college.code}
              </span>
              <span className="hidden md:inline">·</span>
              <span className="hidden md:inline text-emerald-600 dark:text-emerald-400 font-medium">Verified Campus</span>
            </div>
          )}
        </div>

        {loading ? (
          <Card className="overflow-hidden w-full">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </Card>
        ) : !college ? (
          <Card className="p-12 text-center text-sm text-slate-500 w-full">This account is not linked to an active college profile.</Card>
        ) : tab === 'security' ? (
          <form onSubmit={changePassword} className="space-y-6 w-full">
            <Card className="p-6 sm:p-8 space-y-6 w-full border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Password</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Update the credentials used to log in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="md:col-span-2 lg:col-span-3">
                  <Input label="Current password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} hint="Minimum 6 characters" required />
                <Input label="Confirm new password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} hint="Must match new password" required />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" loading={changingPassword} leftIcon={<Save className="w-4 h-4" />}>Update password</Button>
              </div>
            </Card>
          </form>
        ) : (
          <form onSubmit={saveCollege} className="space-y-6 w-full">
            {tab === 'profile' && (
              <div className="space-y-6 w-full">
                {/* Full-width Hero Banner */}
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 w-full" padding={false}>
                  <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-950 p-6 sm:p-8 text-white relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black tracking-tight text-white shadow-inner">
                          {college.code ? college.code.slice(0, 3) : 'CLG'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded border border-brand-400/30">
                              {college.code}
                            </span>
                            <span className="text-[11px] font-medium text-white/70">
                              {college.establishedYear ? `Est. ${college.establishedYear}` : 'Registered Campus'}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold leading-tight truncate text-white">{form.name || college.name}</h2>
                          <p className="text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                            <span>{form.city || 'City'}, {form.state || 'State'}</span>
                            {form.affiliation && (
                              <>
                                <span className="text-white/30">·</span>
                                <span className="text-white/80">{form.affiliation}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Active Account
                        </span>
                        <span className="text-[11px] text-slate-400">Tenant ID: {college.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Main End-to-End Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                  {/* Left Column (2 Cols on Desktop) */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Campus details */}
                    <Card className="p-6 sm:p-7 space-y-5 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Details</h3>
                            <p className="text-xs text-slate-500">Institutional records and verified identifiers</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                        <Input
                          label="College name *"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                        />
                        <Input
                          label="Affiliation"
                          value={form.affiliation}
                          onChange={e => setForm({ ...form, affiliation: e.target.value })}
                          placeholder="e.g. VTU, Anna University"
                        />
                        <Input
                          label="City *"
                          leftIcon={<MapPin className="w-4 h-4" />}
                          value={form.city}
                          onChange={e => setForm({ ...form, city: e.target.value })}
                          required
                        />
                        <Input
                          label="State *"
                          value={form.state}
                          onChange={e => setForm({ ...form, state: e.target.value })}
                          required
                        />
                        <Input
                          label="Website"
                          leftIcon={<Globe className="w-4 h-4" />}
                          value={form.website}
                          onChange={e => setForm({ ...form, website: e.target.value })}
                          placeholder="https://yourcollege.edu"
                        />
                        <Input
                          label="Established year"
                          type="number"
                          value={form.establishedYear}
                          onChange={e => setForm({ ...form, establishedYear: e.target.value })}
                          placeholder="e.g. 1995"
                        />
                      </div>

                      {/* Locked Institutional Credentials */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 mb-4 flex items-start gap-2.5">
                          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                            <strong>Protected Credentials:</strong> Official College Email and Phone are locked to ensure institutional account integrity. To modify these details, submit an administrative verification ticket.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                          <Input
                            label="College Phone (Locked)"
                            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                            rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
                            value={form.phone}
                            disabled
                            hint="Official registered phone number"
                            className="bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed opacity-80 select-none text-slate-600 dark:text-slate-400"
                          />
                          <Input
                            label="College Email (Locked)"
                            type="email"
                            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                            rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
                            value={form.email}
                            disabled
                            hint="Primary registered email used for account authentication"
                            className="bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed opacity-80 select-none text-slate-600 dark:text-slate-400"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Placement office */}
                    <Card className="p-6 sm:p-7 space-y-5 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-ai-50 dark:bg-ai-950/40 text-ai-600 flex items-center justify-center">
                            <UserRound className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Placement & Career Office</h3>
                            <p className="text-xs text-slate-500">Key placement officer contact details</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                        <Input
                          label="Officer name"
                          value={form.tpoName}
                          onChange={e => setForm({ ...form, tpoName: e.target.value })}
                          placeholder="Placement officer full name"
                        />
                        <Input
                          label="Officer Email (Locked)"
                          type="email"
                          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                          rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
                          value={form.tpoEmail}
                          disabled
                          hint="TPO login authentication email"
                          className="bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed opacity-80 select-none text-slate-600 dark:text-slate-400"
                        />
                        <Input
                          label="Officer Phone (Locked)"
                          leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                          rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
                          value={form.tpoPhone}
                          disabled
                          hint="Official officer mobile contact"
                          className="bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed opacity-80 select-none text-slate-600 dark:text-slate-400"
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Right Sidebar (1 Col on Desktop) */}
                  <div className="space-y-6">
                    {/* Security & Verification Card */}
                    <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                        Campus Verification
                      </div>
                      <div className="space-y-3 pt-1 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500">College Code</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{college.code}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500">Campus Status</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500">Plan Tier</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{college.subscription?.plan || 'Enterprise'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-slate-500">Signed In As</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{user?.email}</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
                          <Info className="w-3.5 h-3.5 text-brand-500" />
                          Need credential updates?
                        </div>
                        Official email & phone changes require Super Admin approval. Contact <a href="mailto:support@aicampusintelligent.com" className="text-brand-600 dark:text-brand-400 hover:underline">support@aicampusintelligent.com</a>.
                      </div>
                    </Card>

                    {/* Quick Action Card */}
                    <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Save Changes</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Modifications made to institution name, location, and affiliation take effect immediately across all drives and student profiles.
                      </p>
                      <Button
                        type="submit"
                        loading={saving}
                        variant="primary"
                        leftIcon={<Save className="w-4 h-4" />}
                        className="w-full justify-center"
                      >
                        Save Settings
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {tab === 'placement' && (
              <Card className="p-6 sm:p-8 space-y-6 w-full border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Default Placement Eligibility</h3>
                    <p className="text-xs text-slate-500 mt-1">Campus baseline rules automatically applied when scheduling new placement drives.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/70 dark:bg-slate-900/40">
                    <Input
                      label="Minimum CGPA Criterion"
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={form.settings.minCgpa}
                      onChange={e => setForm({ ...form, settings: { ...form.settings, minCgpa: Number(e.target.value) } })}
                      hint="Students with CGPA below this threshold will be flagged as ineligible by default."
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/70 dark:bg-slate-900/40">
                    <Input
                      label="Maximum Allowed Active Backlogs"
                      type="number"
                      min={0}
                      value={form.settings.maxBacklogs}
                      onChange={e => setForm({ ...form, settings: { ...form.settings, maxBacklogs: Number(e.target.value) } })}
                      hint="Maximum number of active backlogs permitted for campus placement drives."
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4" />}>Save placement rules</Button>
                </div>
              </Card>
            )}

            {tab === 'notifications' && (
              <Card className="p-6 sm:p-8 space-y-6 w-full border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Alert Preferences</h3>
                    <p className="text-xs text-slate-500">Configure email and real-time notifications for placement activities</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'driveAlerts' as const, label: 'Drive Activity Updates', detail: 'Receive email alerts whenever a campus drive is scheduled, modified, or completed' },
                    { key: 'applicationAlerts' as const, label: 'New Student Applications', detail: 'Instant notification whenever a registered student submits an application for a drive' },
                    { key: 'interviewReminders' as const, label: 'Interview Session Reminders', detail: 'Send reminder notifications to officers before scheduled technical and HR interview rounds' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">{item.label}</span>
                        <span className="text-xs text-slate-500 mt-0.5 block">{item.detail}</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.settings[item.key]}
                        onClick={() => setForm({ ...form, settings: { ...form.settings, [item.key]: !form.settings[item.key] } })}
                        className={`relative w-12 h-6.5 rounded-full transition-colors shrink-0 ${form.settings[item.key] ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${form.settings[item.key] ? 'translate-x-5.5' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4" />}>Save alert preferences</Button>
                </div>
              </Card>
            )}

            {tab === 'profile' && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">Settings linked to institutional code <strong className="text-slate-600 dark:text-slate-300">{college.code}</strong></p>
                <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4" />}>Save settings</Button>
              </div>
            )}
          </form>
        )}
      </div>
    </PageWrapper>
  );
};

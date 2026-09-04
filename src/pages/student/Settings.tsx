import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Lock, User, Globe, ShieldCheck, Eye, EyeOff,
  CheckCircle2, RefreshCw, Plus, Trash2, Key, Mail, Bell, Sparkles,
  ExternalLink, Briefcase, Building2, Save, Check, X, ShieldAlert, Edit3
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Badge, Input, Select, Modal, AIBadge } from '../../components/ui';
import { toast } from 'sonner';

interface PlatformAccount {
  id: string;
  name: string;
  category: string;
  logoColor: string;
  iconLetter: string;
  username: string;
  password?: string;
  isConnected: boolean;
  lastSynced?: string;
  autoApply: boolean;
}

const INITIAL_PLATFORMS: PlatformAccount[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'Professional Network',
    logoColor: 'from-blue-600 to-indigo-700',
    iconLetter: 'in',
    username: 'arjun.sharma@rvce.edu.in',
    password: '••••••••••••',
    isConnected: true,
    lastSynced: 'Today at 02:15 PM',
    autoApply: true,
  },
  {
    id: 'indeed',
    name: 'Indeed',
    category: 'Job Portal',
    logoColor: 'from-blue-500 to-sky-600',
    iconLetter: 'I',
    username: 'arjun.sharma@gmail.com',
    password: '••••••••••••',
    isConnected: true,
    lastSynced: 'Yesterday at 06:40 PM',
    autoApply: true,
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    category: 'Company Reviews & Jobs',
    logoColor: 'from-emerald-500 to-teal-600',
    iconLetter: 'G',
    username: 'arjun_sharma_rv',
    password: '••••••••••••',
    isConnected: true,
    lastSynced: '3 days ago',
    autoApply: false,
  },
  {
    id: 'naukri',
    name: 'Naukri.com',
    category: 'Indian Job Portal',
    logoColor: 'from-blue-700 to-indigo-900',
    iconLetter: 'N',
    username: 'arjun.sharma@rvce.edu.in',
    password: '••••••••••••',
    isConnected: true,
    lastSynced: 'Today at 10:00 AM',
    autoApply: true,
  },
  {
    id: 'unstop',
    name: 'Unstop (formerly Dare2Compete)',
    category: 'Hackathons & Drives',
    logoColor: 'from-purple-600 to-ai-600',
    iconLetter: 'U',
    username: 'arjun_sharma_2025',
    password: '••••••••••••',
    isConnected: false,
    autoApply: false,
  },
  {
    id: 'wellfound',
    name: 'Wellfound (AngelList)',
    category: 'Startup Jobs',
    logoColor: 'from-amber-500 to-orange-600',
    iconLetter: 'W',
    username: '',
    password: '',
    isConnected: false,
    autoApply: false,
  },
];

export const StudentSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'platforms' | 'security' | 'notifications'>('platforms');
  const [platforms, setPlatforms] = useState<PlatformAccount[]>(INITIAL_PLATFORMS);
  
  // Modal for editing platform credentials
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformAccount | null>(null);
  const [modalUsername, setModalUsername] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalAutoApply, setModalAutoApply] = useState(true);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    driveInvites: true,
    interviewAlerts: true,
    aiJobMatches: true,
    emailDigest: true,
    smsReminders: false,
  });

  const handleOpenConnectModal = (platform: PlatformAccount) => {
    setSelectedPlatform(platform);
    setModalUsername(platform.username);
    setModalPassword(platform.password || '');
    setModalAutoApply(platform.autoApply);
    setShowPassword(false);
  };

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform) return;

    setPlatforms(prev => prev.map(p => {
      if (p.id === selectedPlatform.id) {
        return {
          ...p,
          username: modalUsername,
          password: modalPassword,
          isConnected: true,
          lastSynced: 'Just now',
          autoApply: modalAutoApply,
        };
      }
      return p;
    }));

    toast.success(`Successfully connected ${selectedPlatform.name} account!`);
    setSelectedPlatform(null);
  };

  const handleDisconnectPlatform = (id: string, name: string) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, username: '', password: '', isConnected: false, lastSynced: undefined, autoApply: false };
      }
      return p;
    }));
    toast.success(`Disconnected ${name} account`);
  };

  const handleSyncPlatform = (name: string) => {
    toast.success(`Syncing profile data & applications with ${name}...`);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Account password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <PageWrapper
      title="Account & Platform Settings"
      subtitle="Manage connected job portals (LinkedIn, Indeed, Glassdoor), credentials, and security."
      breadcrumbs={[{ label: 'Student' }, { label: 'Settings' }]}
    >
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-2 overflow-x-auto">
        {[
          { id: 'platforms', label: 'Connected Job Portals', icon: <Globe className="w-4 h-4" /> },
          { id: 'security', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notification Preferences', icon: <Bell className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CONNECTED JOB PORTALS */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-brand-50/50 to-ai-50/50 dark:from-brand-950/20 dark:to-ai-950/20 border-brand-200 dark:border-brand-900/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Multi-Portal Auto Sync</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connect your LinkedIn, Indeed, and Glassdoor accounts to auto-sync resumes and job applications.
                  </p>
                </div>
              </div>
              <AIBadge label="Auto-Apply Active" />
            </div>
          </Card>

          {/* Job Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map(platform => (
              <Card key={platform.id} className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${platform.logoColor} text-white font-extrabold text-sm flex items-center justify-center shadow-md flex-shrink-0`}>
                        {platform.iconLetter}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{platform.name}</h4>
                        <p className="text-xs text-slate-400">{platform.category}</p>
                      </div>
                    </div>

                    <Badge variant={platform.isConnected ? 'green' : 'slate'} dot>
                      {platform.isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>

                  {platform.isConnected ? (
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">User ID / Email</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{platform.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Saved Password</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">••••••••••••</span>
                      </div>
                      {platform.lastSynced && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                          <span className="text-slate-400">Last Synced</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{platform.lastSynced}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      Connect your {platform.name} ID & Password to enable 1-click campus job applications and resume synchronization.
                    </p>
                  )}
                </div>

                {/* Platform Card Footer Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {platform.isConnected ? (
                    <>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenConnectModal(platform)}
                        >
                          Edit ID / Pass
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-500 hover:text-slate-800"
                          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                          onClick={() => handleSyncPlatform(platform.name)}
                        >
                          Sync Now
                        </Button>
                      </div>
                      <button
                        onClick={() => handleDisconnectPlatform(platform.id, platform.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Disconnect Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      leftIcon={<Key className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenConnectModal(platform)}
                    >
                      Connect {platform.name} Account
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Change Account Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">New Password</label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Password Encryption
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All connected job portal credentials (LinkedIn, Indeed, Glassdoor) are stored using <strong>AES-256 Bit Encryption</strong> and are strictly used for campus recruitment drive syncs.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATION PREFERENCES */}
      {activeTab === 'notifications' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Placement Notification Preferences
          </h3>

          <div className="space-y-4">
            {[
              { key: 'driveInvites', title: 'Campus Drive Invitations', desc: 'Receive instant notifications when a company opens applications for your department.' },
              { key: 'interviewAlerts', title: 'Interview Schedule Reminders', desc: 'Alerts 1 hour prior to scheduled technical or HR interview rounds.' },
              { key: 'aiJobMatches', title: 'AI High-Match Job Alerts', desc: 'Get notified when an active job matches over 90% with your skill profile.' },
              { key: 'emailDigest', title: 'Daily Placement Email Digest', desc: 'Summary of new jobs, applications, and campus drive updates.' },
              { key: 'smsReminders', title: 'SMS / WhatsApp Alerts', desc: 'Receive urgent interview room changes and drive announcements via SMS.' },
            ].map(setting => {
              const checked = notifications[setting.key as keyof typeof notifications];
              return (
                <div key={setting.key} className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{setting.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{setting.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      setNotifications({ ...notifications, [setting.key]: !checked });
                      toast.success(`Updated ${setting.title} preference`);
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      checked ? 'bg-brand-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* CONNECT PLATFORM MODAL WITH USERNAME & PASSWORD */}
      <Modal
        isOpen={Boolean(selectedPlatform)}
        onClose={() => setSelectedPlatform(null)}
        title={selectedPlatform ? `Connect ${selectedPlatform.name} Account` : 'Connect Account'}
      >
        {selectedPlatform && (
          <form onSubmit={handleSavePlatform} className="space-y-4">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/30 rounded-xl border border-brand-200 dark:border-brand-900/40 flex items-center gap-3 text-xs text-brand-800 dark:text-brand-300">
              <Key className="w-4 h-4 flex-shrink-0" />
              <span>Enter your <strong>{selectedPlatform.name}</strong> login credentials to enable automated application sync.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {selectedPlatform.name} Email / Username / ID
              </label>
              <Input
                type="text"
                placeholder={`e.g. your_name@${selectedPlatform.id}.com`}
                value={modalUsername}
                onChange={e => setModalUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {selectedPlatform.name} Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={modalPassword}
                  onChange={e => setModalPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Auto-Sync Applications</p>
                <p className="text-[11px] text-slate-400">Automatically sync job applications with PlacementOS</p>
              </div>
              <button
                type="button"
                onClick={() => setModalAutoApply(!modalAutoApply)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  modalAutoApply ? 'bg-brand-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setSelectedPlatform(null)}>
                Cancel
              </Button>
              <Button type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Save Credentials & Connect
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
};

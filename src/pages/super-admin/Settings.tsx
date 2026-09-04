import React, { useEffect, useState } from 'react';
import {
  Settings, Bot, Shield, Mail, CreditCard, Database, Save, CheckCircle,
  AlertTriangle, RefreshCw, Server, Zap, Globe, Key, Lock, Cpu, Bell
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Select, Tabs, Modal, Alert, Badge, AIBadge } from '../../components/ui';
import { superAdminSettingsService } from '../../services';

export const SuperAdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backupResult, setBackupResult] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await superAdminSettingsService.getSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSection = async (sectionKey: string) => {
    if (!settings) return;
    setSaving(true);
    try {
      await superAdminSettingsService.updateSettings(sectionKey as any, settings[sectionKey]);
      showToast(`Platform ${sectionKey.toUpperCase()} settings saved successfully!`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await superAdminSettingsService.triggerDatabaseBackup();
      setBackupResult(res);
      showToast(`Database backup created successfully (${res.size})!`);
    } catch (e) {
      console.error(e);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFlushCache = async () => {
    setCacheLoading(true);
    try {
      const res = await superAdminSettingsService.flushCache();
      showToast(`Redis cache flushed: ${res.keysCleared} keys cleared (${res.freedMemoryMB} MB memory freed).`);
    } catch (e) {
      console.error(e);
    } finally {
      setCacheLoading(false);
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading || !settings) {
    return (
      <PageWrapper title="Global System Settings" subtitle="Platform configuration & AI engines">
        <div className="p-8 text-center text-slate-500">Loading system settings...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Global System Settings"
      subtitle="Configure SaaS platform preferences, AI model parameters, security rules, SMTP, and maintenance"
      breadcrumbs={[{ label: 'Super Admin' }, { label: 'Settings' }]}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Tabs Navigation */}
      <Card className="mb-6" padding={false}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Tabs
            tabs={[
              { id: 'general', label: 'General & Branding', icon: <Globe className="w-4 h-4" /> },
              { id: 'aiEngine', label: 'AI Engine & Models', icon: <Bot className="w-4 h-4" /> },
              { id: 'security', label: 'Security & Auth', icon: <Shield className="w-4 h-4" /> },
              { id: 'email', label: 'Email & SMTP', icon: <Mail className="w-4 h-4" /> },
              { id: 'billing', label: 'Billing & Gateways', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'maintenance', label: 'Backup & Health', icon: <Database className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Platform Branding & General Config</h3>
                <p className="text-xs text-slate-400">Basic information displayed across tenant dashboards</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Platform Name"
                  value={settings.general.platformName}
                  onChange={(e) => updateField('general', 'platformName', e.target.value)}
                />

                <Input
                  label="Support Email Address"
                  value={settings.general.supportEmail}
                  onChange={(e) => updateField('general', 'supportEmail', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  value={settings.general.contactPhone}
                  onChange={(e) => updateField('general', 'contactPhone', e.target.value)}
                />

                <Select
                  label="Primary Currency"
                  options={[
                    { value: 'INR (₹)', label: 'Indian Rupee - INR (₹)' },
                    { value: 'USD ($)', label: 'US Dollar - USD ($)' },
                    { value: 'EUR (€)', label: 'Euro - EUR (€)' },
                  ]}
                  value={settings.general.primaryCurrency}
                  onChange={(e) => updateField('general', 'primaryCurrency', e.target.value)}
                />
              </div>

              <Input
                label="Global Platform Announcement Banner"
                value={settings.general.announcementBanner}
                onChange={(e) => updateField('general', 'announcementBanner', e.target.value)}
                hint="Displayed at the top of all user dashboards when populated"
              />

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">Maintenance Mode</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Restricts tenant login access during system upgrades</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => updateField('general', 'maintenanceMode', e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" loading={saving} onClick={() => handleSaveSection('general')} leftIcon={<Save className="w-4 h-4" />}>
                  Save General Settings
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: AI Engine & Model Settings */}
          {activeTab === 'aiEngine' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    AI Engine & Multi-Model Config
                    <AIBadge />
                  </h3>
                  <p className="text-xs text-slate-400">Configure LLM providers, temperature, rate limits, and features</p>
                </div>
                <Badge variant="purple">PlacementOS Neural Engine</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Primary LLM Model Provider"
                  options={[
                    { value: 'Gemini 1.5 Pro', label: 'Google Gemini 1.5 Pro (Recommended)' },
                    { value: 'Claude 3.5 Sonnet', label: 'Anthropic Claude 3.5 Sonnet' },
                    { value: 'GPT-4o Enterprise', label: 'OpenAI GPT-4o Enterprise' },
                  ]}
                  value={settings.aiEngine.primaryProvider}
                  onChange={(e) => updateField('aiEngine', 'primaryProvider', e.target.value)}
                />

                <Select
                  label="Fallback LLM Provider"
                  options={[
                    { value: 'Claude 3.5 Sonnet', label: 'Anthropic Claude 3.5 Sonnet' },
                    { value: 'Gemini 1.5 Flash', label: 'Google Gemini 1.5 Flash' },
                    { value: 'GPT-4o mini', label: 'OpenAI GPT-4o mini' },
                  ]}
                  value={settings.aiEngine.fallbackProvider}
                  onChange={(e) => updateField('aiEngine', 'fallbackProvider', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Token Rate Limit / Min (Per Tenant)"
                  type="number"
                  value={settings.aiEngine.tokenRateLimitPerMin}
                  onChange={(e) => updateField('aiEngine', 'tokenRateLimitPerMin', Number(e.target.value))}
                />

                <Input
                  label="Max Output Tokens / Response"
                  type="number"
                  value={settings.aiEngine.maxTokensPerReq}
                  onChange={(e) => updateField('aiEngine', 'maxTokensPerReq', Number(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">AI Placement Officer Chatbot</p>
                    <p className="text-xs text-slate-500">Enable interactive AI Assistant for TPOs, Students, and Recruiters</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.aiEngine.enableAIPlacementOfficer}
                    onChange={(e) => updateField('aiEngine', 'enableAIPlacementOfficer', e.target.checked)}
                    className="w-5 h-5 text-brand-600 rounded"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">AI Mock Interview Coach</p>
                    <p className="text-xs text-slate-500">Automated interactive technical and HR mock interview sessions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.aiEngine.enableMockInterviewCoach}
                    onChange={(e) => updateField('aiEngine', 'enableMockInterviewCoach', e.target.checked)}
                    className="w-5 h-5 text-brand-600 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="ai" loading={saving} onClick={() => handleSaveSection('aiEngine')} leftIcon={<Save className="w-4 h-4" />}>
                  Save AI Engine Settings
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Auth Control */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Security & Access Policy</h3>
                <p className="text-xs text-slate-400">Authentication rules, password requirements, and IP restrictions</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Session Timeout (Minutes)"
                  type="number"
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={(e) => updateField('security', 'sessionTimeoutMinutes', Number(e.target.value))}
                />

                <Input
                  label="Max Failed Login Attempts"
                  type="number"
                  value={settings.security.maxFailedLoginAttempts}
                  onChange={(e) => updateField('security', 'maxFailedLoginAttempts', Number(e.target.value))}
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Enforce Multi-Factor Authentication (2FA)</p>
                  <p className="text-xs text-slate-500">Require 2FA verification for all Super Admin & TPO accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.enforce2FAForAdmins}
                  onChange={(e) => updateField('security', 'enforce2FAForAdmins', e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded"
                />
              </div>

              <Input
                label="Whitelisted Admin IP Addresses"
                value={settings.security.whitelistedIPs}
                onChange={(e) => updateField('security', 'whitelistedIPs', e.target.value)}
                hint="Comma separated IPv4 / IPv6 addresses permitted for admin login"
              />

              <div className="flex justify-end pt-4">
                <Button variant="primary" loading={saving} onClick={() => handleSaveSection('security')} leftIcon={<Save className="w-4 h-4" />}>
                  Save Security Policy
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: Email & SMTP */}
          {activeTab === 'email' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Email Delivery & SMTP API</h3>
                <p className="text-xs text-slate-400">Configure transactional email providers for notifications and reports</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Email Delivery Provider"
                  options={[
                    { value: 'SendGrid API', label: 'SendGrid API' },
                    { value: 'AWS SES', label: 'Amazon SES' },
                    { value: 'Mailgun', label: 'Mailgun' },
                  ]}
                  value={settings.email.provider}
                  onChange={(e) => updateField('email', 'provider', e.target.value)}
                />

                <Input
                  label="Sender Name"
                  value={settings.email.senderName}
                  onChange={(e) => updateField('email', 'senderName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Sender Email Address"
                  value={settings.email.senderEmail}
                  onChange={(e) => updateField('email', 'senderEmail', e.target.value)}
                />

                <Input
                  label="SMTP Host"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateField('email', 'smtpHost', e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" loading={saving} onClick={() => handleSaveSection('email')} leftIcon={<Save className="w-4 h-4" />}>
                  Save Email Gateway
                </Button>
              </div>
            </div>
          )}

          {/* TAB 5: Billing & Tax Integration */}
          {activeTab === 'billing' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Billing & Payment Gateway</h3>
                <p className="text-xs text-slate-400">Configure tax rates, payment gateway webhooks, and grace periods</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="GST / Tax Rate (%)"
                  type="number"
                  value={settings.billing.taxRatePercent}
                  onChange={(e) => updateField('billing', 'taxRatePercent', Number(e.target.value))}
                />

                <Input
                  label="Payment Grace Period (Days)"
                  type="number"
                  value={settings.billing.gracePeriodDays}
                  onChange={(e) => updateField('billing', 'gracePeriodDays', Number(e.target.value))}
                />
              </div>

              <Input
                label="Payment Gateway Endpoint"
                value={settings.billing.paymentGateway}
                onChange={(e) => updateField('billing', 'paymentGateway', e.target.value)}
              />

              <Input
                label="Razorpay Webhook Endpoint URL"
                value={settings.billing.webhookEndpoint}
                onChange={(e) => updateField('billing', 'webhookEndpoint', e.target.value)}
              />

              <div className="flex justify-end pt-4">
                <Button variant="primary" loading={saving} onClick={() => handleSaveSection('billing')} leftIcon={<Save className="w-4 h-4" />}>
                  Save Billing Settings
                </Button>
              </div>
            </div>
          )}

          {/* TAB 6: Maintenance & System Health */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Backup & Infrastructure Health</h3>
                <p className="text-xs text-slate-400">Trigger manual database backups and flush server cache</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Database Snapshot Backup</h4>
                      <p className="text-xs text-slate-400">Generate full Postgres cluster dump to S3 bucket</p>
                    </div>
                  </div>

                  {backupResult && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs space-y-1">
                      <p className="font-semibold">Last Backup Completed!</p>
                      <p>Size: {backupResult.size} • Time: {backupResult.timestamp}</p>
                      <p className="font-mono text-[10px] truncate">{backupResult.location}</p>
                    </div>
                  )}

                  <Button variant="primary" loading={backupLoading} onClick={handleTriggerBackup} className="w-full" leftIcon={<Database className="w-4 h-4" />}>
                    Trigger Database Backup Now
                  </Button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Flush Memory & Redis Cache</h4>
                      <p className="text-xs text-slate-400">Clear cached query results, AI session tokens, and temporary files</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">Safely purges stale session memory without disconnecting active users.</p>

                  <Button variant="secondary" loading={cacheLoading} onClick={handleFlushCache} className="w-full" leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Purge Redis Cache
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </PageWrapper>
  );
};

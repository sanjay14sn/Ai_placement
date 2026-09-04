import React, { useState } from 'react';
import { 
  Building2, Bell, Shield, Mail, Users, Save, CheckCircle2 
} from 'lucide-react';
import { PageWrapper } from '../../layouts';
import { Card, Button, Input, Select, Badge } from '../../components/ui';
import { toast } from 'sonner';

export const RecruiterSettingsPage: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [templateSubject, setTemplateSubject] = useState('Invitation to Technical Interview - PlacementOS Campus Drive');
  const [templateBody, setTemplateBody] = useState('Dear {Candidate_Name},\n\nWe are pleased to invite you for a Technical Interview for the position of {Job_Title} at {Company_Name}.\n\nPlease join using the meeting link provided in your candidate portal.\n\nBest regards,\nRecruitment Team');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('🎉 Recruiter settings and email templates updated successfully!');
  };

  return (
    <PageWrapper
      title="Recruiter Portal Settings"
      subtitle="Manage account preferences, automated notifications, and candidate email templates"
      breadcrumbs={[{ label: 'Recruiter' }, { label: 'Settings' }]}
    >
      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
        {/* NOTIFICATION PREFERENCES */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            Automated Alerts & Notifications
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Instant Application Alerts</span>
                <span className="text-xs text-slate-500">Receive email notification when a new candidate applies</span>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Interview Reminder SMS & Email</span>
                <span className="text-xs text-slate-500">Send automatic reminders 1 hour before scheduled slots</span>
              </div>
              <input 
                type="checkbox" 
                checked={interviewReminders} 
                onChange={e => setInterviewReminders(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Daily Hiring Digest</span>
                <span className="text-xs text-slate-500">Receive a daily summary of campus drive metrics</span>
              </div>
              <input 
                type="checkbox" 
                checked={dailyDigest} 
                onChange={e => setDailyDigest(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </label>
          </div>
        </Card>

        {/* CANDIDATE OUTREACH TEMPLATES */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-600" />
            Candidate Outreach Email Templates
          </h3>

          <div className="space-y-4">
            <Input
              label="Email Subject Template"
              value={templateSubject}
              onChange={e => setTemplateSubject(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Message Body
              </label>
              <textarea
                rows={5}
                value={templateBody}
                onChange={e => setTemplateBody(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Available variables: {'{Candidate_Name}'}, {'{Job_Title}'}, {'{Company_Name}'}</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" leftIcon={<Save className="w-4 h-4" />}>
            Save Preferences
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
};

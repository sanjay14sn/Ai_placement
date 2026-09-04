import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout, DashboardLayout } from '../layouts';

// Auth / Public
import { LandingPage } from '../pages/auth/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Super Admin
import { SuperAdminOverview } from '../pages/super-admin/Overview';
import { SuperAdminCollegesPage } from '../pages/super-admin/Colleges';
import { SuperAdminCompaniesPage } from '../pages/super-admin/Companies';
import { SuperAdminUsersPage } from '../pages/super-admin/Users';
import { SuperAdminSubscriptionsPage } from '../pages/super-admin/Subscriptions';
import { SuperAdminPlansPage } from '../pages/super-admin/Plans';
import { SuperAdminUsagePage } from '../pages/super-admin/Usage';
import { SuperAdminAnalyticsPage } from '../pages/super-admin/Analytics';
import { SuperAdminAuditLogsPage } from '../pages/super-admin/AuditLogs';
import { SuperAdminSettingsPage } from '../pages/super-admin/Settings';

// College
import { CollegeDashboard } from '../pages/college/Dashboard';
import { StudentsPage } from '../pages/college/Students';
import { StudentDetailPage } from '../pages/college/StudentDetail';
import { CollegeDepartmentsPage } from '../pages/college/Departments';
import { CollegeCompaniesPage } from '../pages/college/Companies';
import { CollegeJobsPage } from '../pages/college/Jobs';
import { CollegeDrivesPage } from '../pages/college/Drives';
import { CollegeApplicationsPage } from '../pages/college/Applications';
import { CollegeInterviewsPage } from '../pages/college/Interviews';
import { CollegeCalendarPage } from '../pages/college/Calendar';
import { CollegeNotificationsPage } from '../pages/college/Notifications';
import { CollegeAnalyticsPage } from '../pages/college/Analytics';
import { CollegeReportsPage } from '../pages/college/Reports';
import { CollegeSettingsPage } from '../pages/college/Settings';
import { AIAssistantPage } from '../pages/shared/AIAssistant';

// Student
import { StudentDashboard } from '../pages/student/Dashboard';
import { StudentProfilePage } from '../pages/student/Profile';
import { StudentResumePage } from '../pages/student/Resume';
import { StudentATSCheckerPage } from '../pages/student/ATSChecker';
import { StudentJobsPage } from '../pages/student/Jobs';
import { StudentApplicationsPage } from '../pages/student/Applications';
import { StudentInterviewsPage } from '../pages/student/Interviews';
import { StudentCalendarPage } from '../pages/student/Calendar';
import { StudentReadinessPage } from '../pages/student/Readiness';
import { StudentInterviewPrepPage } from '../pages/student/InterviewPrep';
import { StudentNotificationsPage } from '../pages/student/Notifications';
import { StudentSettingsPage } from '../pages/student/Settings';

// Recruiter
import { RecruiterDashboard } from '../pages/recruiter/Dashboard';
import { RecruiterCompanyPage } from '../pages/recruiter/Company';
import { RecruiterJobsPage } from '../pages/recruiter/Jobs';
import { RecruiterCandidatesPage } from '../pages/recruiter/Candidates';
import { RecruiterShortlistsPage } from '../pages/recruiter/Shortlists';
import { RecruiterDrivesPage } from '../pages/recruiter/Drives';
import { RecruiterInterviewsPage } from '../pages/recruiter/Interviews';
import { RecruiterCalendarPage } from '../pages/recruiter/Calendar';
import { RecruiterAnalyticsPage } from '../pages/recruiter/Analytics';
import { RecruiterSettingsPage } from '../pages/recruiter/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

export const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<DashboardLayout allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/super-admin" element={<Navigate to="/super-admin/overview" replace />} />
            <Route path="/super-admin/overview" element={<SuperAdminOverview />} />
            <Route path="/super-admin/colleges" element={<SuperAdminCollegesPage />} />
            <Route path="/super-admin/companies" element={<SuperAdminCompaniesPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
            <Route path="/super-admin/subscriptions" element={<SuperAdminSubscriptionsPage />} />
            <Route path="/super-admin/plans" element={<SuperAdminPlansPage />} />
            <Route path="/super-admin/usage" element={<SuperAdminUsagePage />} />
            <Route path="/super-admin/analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="/super-admin/audit-logs" element={<SuperAdminAuditLogsPage />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />
          </Route>

          {/* College Admin / TPO Routes */}
          <Route element={<DashboardLayout allowedRoles={['COLLEGE_ADMIN', 'TPO']} />}>
            <Route path="/college" element={<Navigate to="/college/dashboard" replace />} />
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/students" element={<StudentsPage />} />
            <Route path="/college/students/:id" element={<StudentDetailPage />} />
            <Route path="/college/departments" element={<CollegeDepartmentsPage />} />
            <Route path="/college/companies" element={<CollegeCompaniesPage />} />
            <Route path="/college/jobs" element={<CollegeJobsPage />} />
            <Route path="/college/drives" element={<CollegeDrivesPage />} />
            <Route path="/college/applications" element={<CollegeApplicationsPage />} />
            <Route path="/college/interviews" element={<CollegeInterviewsPage />} />
            <Route path="/college/calendar" element={<CollegeCalendarPage />} />
            <Route path="/college/notifications" element={<CollegeNotificationsPage />} />
            <Route path="/college/analytics" element={<CollegeAnalyticsPage />} />
            <Route path="/college/reports" element={<CollegeReportsPage />} />
            <Route path="/college/settings" element={<CollegeSettingsPage />} />
            <Route path="/college/ai-assistant" element={<AIAssistantPage mode="college" />} />
          </Route>

          {/* Student Routes */}
          <Route element={<DashboardLayout allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/resume" element={<StudentResumePage />} />
            <Route path="/student/ats-checker" element={<StudentATSCheckerPage />} />
            <Route path="/student/jobs" element={<StudentJobsPage />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/student/interviews" element={<StudentInterviewsPage />} />
            <Route path="/student/calendar" element={<StudentCalendarPage />} />
            <Route path="/student/readiness" element={<StudentReadinessPage />} />
            <Route path="/student/interview-prep" element={<StudentInterviewPrepPage />} />
            <Route path="/student/ai-assistant" element={<AIAssistantPage mode="student" />} />
            <Route path="/student/notifications" element={<StudentNotificationsPage />} />
            <Route path="/student/settings" element={<StudentSettingsPage />} />
          </Route>

          {/* Recruiter Routes */}
          <Route element={<DashboardLayout allowedRoles={['RECRUITER']} />}>
            <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/company" element={<RecruiterCompanyPage />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
            <Route path="/recruiter/candidates" element={<RecruiterCandidatesPage />} />
            <Route path="/recruiter/shortlists" element={<RecruiterShortlistsPage />} />
            <Route path="/recruiter/drives" element={<RecruiterDrivesPage />} />
            <Route path="/recruiter/interviews" element={<RecruiterInterviewsPage />} />
            <Route path="/recruiter/calendar" element={<RecruiterCalendarPage />} />
            <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
            <Route path="/recruiter/ai-assistant" element={<AIAssistantPage mode="recruiter" />} />
            <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

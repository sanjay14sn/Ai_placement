import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout, DashboardLayout } from '../layouts';

// Auth / Public
import { LandingPage } from '../pages/auth/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { InstitutionsPage } from '../pages/public/InstitutionsPage';
import { RecruitersPage } from '../pages/public/RecruitersPage';
import { CandidatesPage } from '../pages/public/CandidatesPage';
import { SolutionsPage } from '../pages/public/SolutionsPage';

// Super Admin
import { SuperAdminOverview } from '../pages/super-admin/Overview';
import { SuperAdminCollegesPage } from '../pages/super-admin/Colleges';
import { SuperAdminCollegeDetailsPage } from '../pages/super-admin/CollegeDetails';
import { SuperAdminCompaniesPage } from '../pages/super-admin/Companies';
import { SuperAdminUsersPage } from '../pages/super-admin/Users';
import { SuperAdminSubscriptionsPage } from '../pages/super-admin/Subscriptions';
import { SuperAdminPlansPage } from '../pages/super-admin/Plans';
import { SuperAdminUsagePage } from '../pages/super-admin/Usage';
import { SuperAdminAnalyticsPage } from '../pages/super-admin/Analytics';
import { SuperAdminSettingsPage } from '../pages/super-admin/Settings';
import { SuperAdminProgramsPage } from '../pages/super-admin/Programs';
import { SuperAdminNewsroomPage } from '../pages/super-admin/Newsroom';
import { SuperAdminCampusConnectPage } from '../pages/super-admin/CampusConnect';

// College
import { CollegeDashboard } from '../pages/college/Dashboard';
import { StudentsPage } from '../pages/college/Students';
import { StudentDetailPage } from '../pages/college/StudentDetail';
import { CollegeDepartmentsPage } from '../pages/college/Departments';
import { DepartmentDetail } from '../pages/college/DepartmentDetail';
import { CollegeCompaniesPage } from '../pages/college/Companies';
import { CollegeJobsPage } from '../pages/college/Jobs';
import { CollegeDrivesPage } from '../pages/college/Drives';
import { CollegeDriveCandidatesPage } from '../pages/college/DriveCandidates';
import { CollegeApplicationsPage } from '../pages/college/Applications';
import { CollegeInterviewsPage } from '../pages/college/Interviews';
import { CollegeCalendarPage } from '../pages/college/Calendar';
import { CollegeNotificationsPage } from '../pages/college/Notifications';
import { CollegeReportsPage } from '../pages/college/Reports';
import { CollegeSettingsPage } from '../pages/college/Settings';
import { CollegeProgramsPage } from '../pages/college/Programs';
import { CollegeEventsPage } from '../pages/college/Events';
import { AIAssistantPage } from '../pages/shared/AIAssistant';

// Student
import { StudentDashboard } from '../pages/student/Dashboard';
import { StudentProfilePage } from '../pages/student/Profile';
import { StudentResumePage } from '../pages/student/Resume';
import { StudentATSCheckerPage } from '../pages/student/ATSChecker';
import { StudentApplicationsPage } from '../pages/student/Applications';
import { StudentInterviewsPage } from '../pages/student/Interviews';
import { StudentCalendarPage } from '../pages/student/Calendar';
import { StudentInterviewPrepPage } from '../pages/student/InterviewPrep';
import { StudentNotificationsPage } from '../pages/student/Notifications';
import { StudentProgramsPage } from '../pages/student/Programs';
import { StudentNewsroomPage } from '../pages/student/Newsroom';
import { StudentCampusDrivesPage } from '../pages/student/CampusDrives';
import { CommunityFeedPage } from '../pages/student/CommunityFeed';
import { ExploreStudentsPage } from '../pages/student/ExploreStudents';
import { StudentDetailViewPage } from '../pages/student/StudentDetailView';
import { ConnectionsPage } from '../pages/student/Connections';
import { MessagesPage } from '../pages/student/Messages';
import { CommunitiesPage } from '../pages/student/Communities';
import { CommunityDetailPage } from '../pages/student/CommunityDetail';
import { EventsPage } from '../pages/student/Events';
import { MentorshipPage } from '../pages/student/Mentorship';
import { AINetworkingPage } from '../pages/student/AINetworking';

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
import { RecruiterProgramsPage } from '../pages/recruiter/Programs';

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
            <Route path="/institutions" element={<InstitutionsPage />} />
            <Route path="/recruiters" element={<Navigate to="/solutions" replace />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<DashboardLayout allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/super-admin" element={<Navigate to="/super-admin/overview" replace />} />
            <Route path="/super-admin/overview" element={<SuperAdminOverview />} />
            <Route path="/super-admin/newsroom" element={<SuperAdminNewsroomPage />} />
            <Route path="/super-admin/campus-connect" element={<SuperAdminCampusConnectPage />} />
            <Route path="/super-admin/programs" element={<SuperAdminProgramsPage />} />
            <Route path="/super-admin/colleges" element={<SuperAdminCollegesPage />} />
            <Route path="/super-admin/colleges/:id" element={<SuperAdminCollegeDetailsPage />} />
            <Route path="/super-admin/companies" element={<SuperAdminCompaniesPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
            <Route path="/super-admin/subscriptions" element={<SuperAdminSubscriptionsPage />} />
            <Route path="/super-admin/plans" element={<SuperAdminPlansPage />} />
            <Route path="/super-admin/usage" element={<SuperAdminUsagePage />} />
            <Route path="/super-admin/analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />
          </Route>

          {/* College Admin / TPO Routes */}
          <Route element={<DashboardLayout allowedRoles={['COLLEGE_ADMIN', 'TPO']} />}>
            <Route path="/college" element={<Navigate to="/college/dashboard" replace />} />
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/programs" element={<CollegeProgramsPage />} />
            <Route path="/college/students" element={<StudentsPage />} />
            <Route path="/college/students/:id" element={<StudentDetailPage />} />
            <Route path="/college/departments" element={<CollegeDepartmentsPage />} />
            <Route path="/college/departments/:id" element={<DepartmentDetail />} />
            <Route path="/college/companies" element={<CollegeCompaniesPage />} />
            <Route path="/college/jobs" element={<CollegeJobsPage />} />
            <Route path="/college/drives" element={<CollegeDrivesPage />} />
            <Route path="/college/drives/:id/candidates" element={<CollegeDriveCandidatesPage />} />
            <Route path="/college/applications" element={<CollegeApplicationsPage />} />
            <Route path="/college/interviews" element={<CollegeInterviewsPage />} />
            <Route path="/college/calendar" element={<CollegeCalendarPage />} />
            <Route path="/college/events" element={<CollegeEventsPage />} />
            <Route path="/college/notifications" element={<CollegeNotificationsPage />} />
            <Route path="/college/reports" element={<CollegeReportsPage />} />
            <Route path="/college/settings" element={<CollegeSettingsPage />} />
          </Route>

          {/* Student Routes */}
          <Route element={<DashboardLayout allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/newsroom" element={<StudentNewsroomPage />} />
            <Route path="/student/programs" element={<StudentProgramsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/resume" element={<StudentResumePage />} />
            <Route path="/student/ats-checker" element={<StudentATSCheckerPage />} />
            <Route path="/student/drives" element={<StudentCampusDrivesPage />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/student/interviews" element={<StudentInterviewsPage />} />
            <Route path="/student/calendar" element={<StudentCalendarPage />} />
            <Route path="/student/readiness" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/interview-prep" element={<StudentInterviewPrepPage />} />
            <Route path="/student/ai-assistant" element={<AIAssistantPage mode="student" />} />
            <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          </Route>

          {/* CampusConnect Routes (Student & Super Admin Moderation) */}
          <Route element={<DashboardLayout allowedRoles={['STUDENT', 'SUPER_ADMIN']} />}>
            <Route path="/student/community" element={<CommunityFeedPage />} />
            <Route path="/student/explore-students" element={<ExploreStudentsPage />} />
            <Route path="/student/explore-students/:id" element={<StudentDetailViewPage />} />
            <Route path="/student/connections" element={<ConnectionsPage />} />
            <Route path="/student/messages" element={<MessagesPage />} />
            <Route path="/student/communities" element={<CommunitiesPage />} />
            <Route path="/student/communities/:id" element={<CommunityDetailPage />} />
            <Route path="/student/events" element={<EventsPage />} />
            <Route path="/student/mentorship" element={<MentorshipPage />} />
            <Route path="/student/ai-networking" element={<AINetworkingPage />} />
          </Route>

          {/* Recruiter Routes */}
          <Route element={<DashboardLayout allowedRoles={['RECRUITER']} />}>
            <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/programs" element={<RecruiterProgramsPage />} />
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

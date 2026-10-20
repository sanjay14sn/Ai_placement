import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar, Topbar, CommandPalette } from '../components/layout';
import { useAuthStore, useUIStore } from '../store';
import { cn } from '../utils';
import type { Role } from '../types';

// ─── Public Layout ────────────────────────────────────────────────────────────

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Toaster position="top-right" expand richColors />
      <Outlet />
    </div>
  );
};

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  allowedRoles: Role[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarCollapsed, mobileNavOpen, setMobileNavOpen, theme } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      navigate('/login');
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      <Sidebar />
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <CommandPalette />
      <Toaster position="top-right" expand richColors />

      <div className={cn(
        'min-w-0 transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[260px]'
      )}>
        <main className="pt-14 sm:pt-16 min-h-screen min-w-0">
          <div className="page-content p-3 sm:p-4 lg:p-6 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title, subtitle, breadcrumbs, actions, children
}) => {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} actions={actions} />
      <div className="animate-fade-in min-w-0">
        {children}
      </div>
    </>
  );
};

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
  const { sidebarCollapsed, theme } = useUIStore();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <CommandPalette />
      <Toaster position="top-right" expand richColors />

      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-[260px]'
      )}>
        <main className="pt-16 min-h-screen">
          <div className="p-6">
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
      <div className="animate-fade-in">
        {children}
      </div>
    </>
  );
};

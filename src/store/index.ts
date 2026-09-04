import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIStore {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

// ─── Notification Store ───────────────────────────────────────────────────────

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  unreadCount: 3,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));

// ─── Tenant Store ─────────────────────────────────────────────────────────────

interface TenantStore {
  tenantId: string | null;
  tenantName: string | null;
  setTenant: (id: string, name: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      tenantId: 'college-1',
      tenantName: 'RV College of Engineering',
      setTenant: (id, name) => set({ tenantId: id, tenantName: name }),
      clearTenant: () => set({ tenantId: null, tenantName: null }),
    }),
    { name: 'tenant-storage' }
  )
);

// ─── Demo Users ────────────────────────────────────────────────────────────────

export const DEMO_USERS: Record<Role, User> = {
  SUPER_ADMIN: {
    id: 'user-super-1',
    email: 'admin@placementos.ai',
    name: 'Rajesh Kumar',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString(),
  },
  COLLEGE_ADMIN: {
    id: 'user-college-1',
    email: 'tpo@rvce.edu.in',
    name: 'Dr. Priya Sharma',
    role: 'COLLEGE_ADMIN',
    tenantId: 'college-1',
    isActive: true,
    createdAt: '2024-06-01',
    lastLogin: new Date().toISOString(),
  },
  TPO: {
    id: 'user-tpo-1',
    email: 'tpo2@rvce.edu.in',
    name: 'Suresh Naik',
    role: 'TPO',
    tenantId: 'college-1',
    isActive: true,
    createdAt: '2024-06-01',
    lastLogin: new Date().toISOString(),
  },
  RECRUITER: {
    id: 'user-recruiter-1',
    email: 'hr@infosys.com',
    name: 'Anitha Rao',
    role: 'RECRUITER',
    isActive: true,
    createdAt: '2024-09-01',
    lastLogin: new Date().toISOString(),
  },
  STUDENT: {
    id: 'user-student-1',
    email: 'arjun.sharma@rvce.edu.in',
    name: 'Arjun Sharma',
    role: 'STUDENT',
    tenantId: 'college-1',
    isActive: true,
    createdAt: '2024-08-01',
    lastLogin: new Date().toISOString(),
  },
};

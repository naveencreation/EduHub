import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  isAdminAuthenticated: boolean;
  adminProfile: AdminProfile | null;
  setAuthenticated: (status: boolean, profile?: AdminProfile | null) => void;
  logoutAction: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      adminProfile: null,
      setAuthenticated: (status, profile = null) => 
        set({ isAdminAuthenticated: status, adminProfile: profile }),
      logoutAction: () => set({ isAdminAuthenticated: false, adminProfile: null }),
    }),
    {
      name: 'eduhub-admin-auth', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Persist auth state across reloads
    }
  )
);

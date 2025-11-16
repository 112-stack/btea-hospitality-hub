import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // User State
        user: null,
        selectedProperty: null,
        availableProperties: [],
        role: null,
        permissions: [],

        // Session State
        isAuthenticated: false,
        sessionExpiresAt: null,
        lastActivity: Date.now(),

        // UI State
        showSessionWarning: false,
        sessionWarningTime: 300, // 5 minutes in seconds

        // Actions
        setUser: (user) => {
          set({
            user,
            isAuthenticated: true,
            lastActivity: Date.now()
          });
        },

        setSelectedProperty: (property) => {
          set({ selectedProperty: property });
        },

        setAvailableProperties: (properties) => {
          set({ availableProperties: properties });
        },

        switchProperty: (propertyId) => {
          const property = get().availableProperties.find(p => p.id === propertyId);
          if (property) {
            set({ selectedProperty: property });
            // Here you would typically call an API to switch context
          }
        },

        setRole: (role) => {
          set({ role });
        },

        setPermissions: (permissions) => {
          set({ permissions });
        },

        hasPermission: (permission) => {
          return get().permissions.includes(permission);
        },

        updateLastActivity: () => {
          set({ lastActivity: Date.now() });
        },

        setSessionExpiry: (expiresAt) => {
          set({ sessionExpiresAt: expiresAt });
        },

        showSessionWarning: (show) => {
          set({ showSessionWarning: show });
        },

        extendSession: async () => {
          try {
            // Call API to extend session
            // const response = await fetch('/Main/KeepSessionAlive', { method: 'POST' });
            const newExpiry = Date.now() + (30 * 60 * 1000); // 30 minutes
            set({
              sessionExpiresAt: newExpiry,
              showSessionWarning: false,
              lastActivity: Date.now()
            });
            return true;
          } catch (error) {
            console.error('Failed to extend session:', error);
            return false;
          }
        },

        logout: () => {
          set({
            user: null,
            selectedProperty: null,
            availableProperties: [],
            role: null,
            permissions: [],
            isAuthenticated: false,
            sessionExpiresAt: null,
            showSessionWarning: false,
          });
          // Redirect to login
          window.location.href = '/Login/signout';
        },

        // Reset store
        reset: () => {
          get().logout();
        },
      }),
      {
        name: 'btea-auth-storage',
        partialize: (state) => ({
          user: state.user,
          selectedProperty: state.selectedProperty,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'BTEA Auth Store' }
  )
);

// Session monitoring
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.sessionExpiresAt) {
      const timeUntilExpiry = state.sessionExpiresAt - Date.now();
      const warningThreshold = state.sessionWarningTime * 1000;

      if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
        state.showSessionWarning(true);
      } else if (timeUntilExpiry <= 0) {
        state.logout();
      }
    }
  }, 1000); // Check every second
}

export default useAuthStore;

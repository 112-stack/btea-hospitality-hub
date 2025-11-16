import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'light',
      sidebarExpanded: true,
      compactMode: false,
      animations: true,

      // Actions
      setTheme: (theme) => {
        set({ theme });
        // Update document class for Tailwind dark mode
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // Update data-theme for daisyUI
        document.documentElement.setAttribute('data-theme', theme);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      setSystemTheme: () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        get().setTheme(prefersDark ? 'dark' : 'light');
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded }));
      },

      setSidebarExpanded: (expanded) => {
        set({ sidebarExpanded: expanded });
      },

      setCompactMode: (compact) => {
        set({ compactMode: compact });
      },

      setAnimations: (enabled) => {
        set({ animations: enabled });
        if (!enabled) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
      },
    }),
    {
      name: 'btea-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Initialize theme on page load
        if (state) {
          const theme = state.theme;
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }
  )
);

// Listen to system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const autoTheme = useThemeStore.getState().autoTheme;
    if (autoTheme) {
      useThemeStore.getState().setSystemTheme();
    }
  });
}

export default useThemeStore;

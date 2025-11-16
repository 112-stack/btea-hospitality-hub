import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useDashboardStore = create(
  devtools(
    (set, get) => ({
      // Dashboard Data
      propertyInfo: null,
      stats: {
        levy: 0,
        renewals: 0,
        applications: 0,
      },
      recentPayments: [],
      applicationsInProgress: [],
      revenueData: [],

      // UI State
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Filters
      dateRange: 'month', // 'week', 'month', 'quarter', 'year'
      applicationFilter: 'all',

      // Real-time updates
      liveUpdatesEnabled: true,
      unreadNotifications: 0,

      // Actions
      setPropertyInfo: (info) => {
        set({ propertyInfo: info, lastUpdated: new Date() });
      },

      setStats: (stats) => {
        set({ stats, lastUpdated: new Date() });
      },

      updateStat: (key, value) => {
        set((state) => ({
          stats: { ...state.stats, [key]: value },
          lastUpdated: new Date(),
        }));
      },

      setRecentPayments: (payments) => {
        set({ recentPayments: payments, lastUpdated: new Date() });
      },

      addPayment: (payment) => {
        set((state) => ({
          recentPayments: [payment, ...state.recentPayments].slice(0, 10),
          unreadNotifications: state.unreadNotifications + 1,
          lastUpdated: new Date(),
        }));
      },

      setApplicationsInProgress: (applications) => {
        set({ applicationsInProgress: applications, lastUpdated: new Date() });
      },

      updateApplicationStatus: (applicationId, newStatus) => {
        set((state) => ({
          applicationsInProgress: state.applicationsInProgress.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          ),
          unreadNotifications: state.unreadNotifications + 1,
          lastUpdated: new Date(),
        }));
      },

      setRevenueData: (data) => {
        set({ revenueData: data, lastUpdated: new Date() });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      setDateRange: (range) => {
        set({ dateRange: range });
      },

      setApplicationFilter: (filter) => {
        set({ applicationFilter: filter });
      },

      toggleLiveUpdates: () => {
        set((state) => ({ liveUpdatesEnabled: !state.liveUpdatesEnabled }));
      },

      clearNotifications: () => {
        set({ unreadNotifications: 0 });
      },

      // Refresh all dashboard data
      refreshDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          // This would be replaced with actual API calls
          // For now, just clear the loading state
          set({ isLoading: false, lastUpdated: new Date() });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Reset store
      reset: () => {
        set({
          propertyInfo: null,
          stats: { levy: 0, renewals: 0, applications: 0 },
          recentPayments: [],
          applicationsInProgress: [],
          revenueData: [],
          isLoading: false,
          error: null,
          lastUpdated: null,
          dateRange: 'month',
          applicationFilter: 'all',
          unreadNotifications: 0,
        });
      },
    }),
    { name: 'BTEA Dashboard Store' }
  )
);

export default useDashboardStore;

/**
 * Admin & Governance Store
 * Manages branding settings, audit logs, and admin configuration
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createAuditLog,
  DEFAULT_BRANDING,
  AUDIT_ACTIONS,
} from '../models/emailTemplateModels';

const useAdminStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        branding: { ...DEFAULT_BRANDING },
        auditLogs: [],
        settings: {
          defaultFromEmail: 'marketing@btea.bh',
          defaultFromName: 'BTEA Marketing',
          defaultReplyTo: 'marketing@btea.bh',
          requireApprovalForLargeAudience: true,
          largeAudienceThreshold: 100,
          dataRetentionDays: 365,
          enableUnsubscribe: true,
          enableClickTracking: true,
          enableOpenTracking: true,
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpSecure: true,
        },
        loading: false,
        error: null,

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Branding Management
        updateBranding: (updates) => {
          set(state => ({
            branding: { ...state.branding, ...updates },
          }));

          // Log the action
          get().logAction(AUDIT_ACTIONS.BRANDING_UPDATED, 'branding', null, updates);
        },

        resetBranding: () => {
          set({ branding: { ...DEFAULT_BRANDING } });
          get().logAction(AUDIT_ACTIONS.BRANDING_UPDATED, 'branding', null, { reset: true });
        },

        // Settings Management
        updateSettings: (updates) => {
          set(state => ({
            settings: { ...state.settings, ...updates },
          }));

          get().logAction(AUDIT_ACTIONS.SETTINGS_UPDATED, 'settings', null, updates);
        },

        getSetting: (key) => get().settings[key],

        // Audit Logging
        logAction: (action, entityType, entityId, details = {}, userId = null, userName = '') => {
          const log = createAuditLog({
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action,
            entityType,
            entityId,
            details,
            userId,
            userName,
            ipAddress: '', // Would be set by server in production
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          });

          set(state => ({
            auditLogs: [log, ...state.auditLogs].slice(0, 1000), // Keep last 1000 logs
          }));

          return log;
        },

        // Get audit logs with filters
        getAuditLogs: (filters = {}) => {
          let logs = [...get().auditLogs];

          if (filters.action) {
            logs = logs.filter(l => l.action === filters.action);
          }

          if (filters.entityType) {
            logs = logs.filter(l => l.entityType === filters.entityType);
          }

          if (filters.entityId) {
            logs = logs.filter(l => l.entityId === filters.entityId);
          }

          if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
          }

          if (filters.from) {
            logs = logs.filter(l => new Date(l.createdAt) >= new Date(filters.from));
          }

          if (filters.to) {
            logs = logs.filter(l => new Date(l.createdAt) <= new Date(filters.to));
          }

          return logs;
        },

        // Get logs for a specific entity
        getEntityLogs: (entityType, entityId) => {
          return get().auditLogs.filter(
            l => l.entityType === entityType && l.entityId === entityId
          );
        },

        // Get recent activity
        getRecentActivity: (limit = 20) => {
          return get().auditLogs.slice(0, limit);
        },

        // Format action for display
        formatAction: (action) => {
          const actionLabels = {
            [AUDIT_ACTIONS.TEMPLATE_CREATED]: 'Created template',
            [AUDIT_ACTIONS.TEMPLATE_UPDATED]: 'Updated template',
            [AUDIT_ACTIONS.TEMPLATE_DELETED]: 'Deleted template',
            [AUDIT_ACTIONS.TEMPLATE_SUBMITTED_FOR_REVIEW]: 'Submitted template for review',
            [AUDIT_ACTIONS.TEMPLATE_APPROVED]: 'Approved template',
            [AUDIT_ACTIONS.TEMPLATE_REJECTED]: 'Rejected template',
            [AUDIT_ACTIONS.TEMPLATE_ARCHIVED]: 'Archived template',
            [AUDIT_ACTIONS.TEMPLATE_RESTORED]: 'Restored template',
            [AUDIT_ACTIONS.TEAM_CREATED]: 'Created team',
            [AUDIT_ACTIONS.TEAM_UPDATED]: 'Updated team',
            [AUDIT_ACTIONS.TEAM_DELETED]: 'Deleted team',
            [AUDIT_ACTIONS.TEAM_MEMBER_ADDED]: 'Added team member',
            [AUDIT_ACTIONS.TEAM_MEMBER_REMOVED]: 'Removed team member',
            [AUDIT_ACTIONS.TEAM_MEMBER_EXCLUDED]: 'Excluded team member',
            [AUDIT_ACTIONS.TEAM_MEMBER_INCLUDED]: 'Included team member',
            [AUDIT_ACTIONS.CAMPAIGN_CREATED]: 'Created campaign',
            [AUDIT_ACTIONS.CAMPAIGN_UPDATED]: 'Updated campaign',
            [AUDIT_ACTIONS.CAMPAIGN_SENT]: 'Sent campaign',
            [AUDIT_ACTIONS.CAMPAIGN_SCHEDULED]: 'Scheduled campaign',
            [AUDIT_ACTIONS.CAMPAIGN_CANCELLED]: 'Cancelled campaign',
            [AUDIT_ACTIONS.CAMPAIGN_PAUSED]: 'Paused campaign',
            [AUDIT_ACTIONS.CAMPAIGN_RESUMED]: 'Resumed campaign',
            [AUDIT_ACTIONS.MEDIA_UPLOADED]: 'Uploaded media',
            [AUDIT_ACTIONS.MEDIA_DELETED]: 'Deleted media',
            [AUDIT_ACTIONS.USER_ROLE_CHANGED]: 'Changed user role',
            [AUDIT_ACTIONS.BRANDING_UPDATED]: 'Updated branding',
            [AUDIT_ACTIONS.SETTINGS_UPDATED]: 'Updated settings',
          };

          return actionLabels[action] || action;
        },

        // Get action icon color
        getActionColor: (action) => {
          const createActions = [
            AUDIT_ACTIONS.TEMPLATE_CREATED,
            AUDIT_ACTIONS.TEAM_CREATED,
            AUDIT_ACTIONS.CAMPAIGN_CREATED,
            AUDIT_ACTIONS.MEDIA_UPLOADED,
            AUDIT_ACTIONS.TEAM_MEMBER_ADDED,
            AUDIT_ACTIONS.TEMPLATE_APPROVED,
          ];

          const deleteActions = [
            AUDIT_ACTIONS.TEMPLATE_DELETED,
            AUDIT_ACTIONS.TEAM_DELETED,
            AUDIT_ACTIONS.TEAM_MEMBER_REMOVED,
            AUDIT_ACTIONS.MEDIA_DELETED,
            AUDIT_ACTIONS.CAMPAIGN_CANCELLED,
            AUDIT_ACTIONS.TEMPLATE_REJECTED,
          ];

          const warningActions = [
            AUDIT_ACTIONS.TEMPLATE_ARCHIVED,
            AUDIT_ACTIONS.TEAM_MEMBER_EXCLUDED,
            AUDIT_ACTIONS.CAMPAIGN_PAUSED,
          ];

          const successActions = [
            AUDIT_ACTIONS.CAMPAIGN_SENT,
            AUDIT_ACTIONS.TEMPLATE_RESTORED,
            AUDIT_ACTIONS.TEAM_MEMBER_INCLUDED,
            AUDIT_ACTIONS.CAMPAIGN_RESUMED,
          ];

          if (createActions.includes(action)) return 'success';
          if (deleteActions.includes(action)) return 'error';
          if (warningActions.includes(action)) return 'warning';
          if (successActions.includes(action)) return 'success';
          return 'info';
        },

        // Clear old audit logs (based on retention settings)
        clearOldAuditLogs: () => {
          const retentionDays = get().settings.dataRetentionDays;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

          set(state => ({
            auditLogs: state.auditLogs.filter(
              l => new Date(l.createdAt) >= cutoffDate
            ),
          }));
        },

        // Export audit logs
        exportAuditLogs: (format = 'json') => {
          const logs = get().auditLogs;

          if (format === 'json') {
            return JSON.stringify(logs, null, 2);
          }

          if (format === 'csv') {
            const headers = ['ID', 'Action', 'Entity Type', 'Entity ID', 'User', 'Details', 'Timestamp'];
            const rows = logs.map(l => [
              l.id,
              l.action,
              l.entityType,
              l.entityId || '',
              l.userName || l.userId || '',
              JSON.stringify(l.details),
              l.createdAt,
            ]);

            return [headers, ...rows].map(row => row.join(',')).join('\n');
          }

          return null;
        },

        // Statistics
        getAuditStats: () => {
          const logs = get().auditLogs;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const thisWeek = new Date();
          thisWeek.setDate(thisWeek.getDate() - 7);

          return {
            total: logs.length,
            today: logs.filter(l => new Date(l.createdAt) >= today).length,
            thisWeek: logs.filter(l => new Date(l.createdAt) >= thisWeek).length,
            byAction: logs.reduce((acc, l) => {
              acc[l.action] = (acc[l.action] || 0) + 1;
              return acc;
            }, {}),
            byEntityType: logs.reduce((acc, l) => {
              acc[l.entityType] = (acc[l.entityType] || 0) + 1;
              return acc;
            }, {}),
          };
        },

        // Reset store
        reset: () => set({
          branding: { ...DEFAULT_BRANDING },
          auditLogs: [],
          settings: {
            defaultFromEmail: 'marketing@btea.bh',
            defaultFromName: 'BTEA Marketing',
            defaultReplyTo: 'marketing@btea.bh',
            requireApprovalForLargeAudience: true,
            largeAudienceThreshold: 100,
            dataRetentionDays: 365,
            enableUnsubscribe: true,
            enableClickTracking: true,
            enableOpenTracking: true,
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
            smtpSecure: true,
          },
          loading: false,
          error: null,
        }),
      }),
      {
        name: 'btea-admin-storage',
        partialize: (state) => ({
          branding: state.branding,
          settings: state.settings,
          auditLogs: state.auditLogs.slice(0, 100), // Only persist last 100 logs
        }),
      }
    ),
    { name: 'AdminStore' }
  )
);

export default useAdminStore;

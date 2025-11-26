/**
 * Email Campaign Management Store
 * Manages email campaigns, scheduling, and statistics
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createEmailCampaign,
  CAMPAIGN_STATUS,
} from '../models/emailTemplateModels';

const useCampaignStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        campaigns: [],
        selectedCampaign: null,
        previewHtml: null,
        previewMode: 'desktop', // 'desktop' | 'mobile'
        sending: false,
        loading: false,
        error: null,
        filters: {
          status: null,
          searchQuery: '',
          dateRange: { from: null, to: null },
        },

        // Computed-like getters
        getCampaignById: (id) => get().campaigns.find(c => c.id === id),

        getCampaignsByStatus: (status) =>
          get().campaigns.filter(c => c.status === status),

        getDraftCampaigns: () =>
          get().campaigns.filter(c => c.status === CAMPAIGN_STATUS.DRAFT),

        getScheduledCampaigns: () =>
          get().campaigns.filter(c => c.status === CAMPAIGN_STATUS.SCHEDULED),

        getSentCampaigns: () =>
          get().campaigns.filter(c => c.status === CAMPAIGN_STATUS.SENT),

        getRecentCampaigns: (limit = 5) => {
          return [...get().campaigns]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
        },

        // Aggregate Statistics
        getOverallStats: () => {
          const sentCampaigns = get().getSentCampaigns();

          const totals = sentCampaigns.reduce(
            (acc, campaign) => ({
              totalSent: acc.totalSent + (campaign.stats?.sent || 0),
              totalDelivered: acc.totalDelivered + (campaign.stats?.delivered || 0),
              totalOpened: acc.totalOpened + (campaign.stats?.opened || 0),
              totalClicked: acc.totalClicked + (campaign.stats?.clicked || 0),
              totalBounced: acc.totalBounced + (campaign.stats?.bounced || 0),
              totalUnsubscribed: acc.totalUnsubscribed + (campaign.stats?.unsubscribed || 0),
            }),
            {
              totalSent: 0,
              totalDelivered: 0,
              totalOpened: 0,
              totalClicked: 0,
              totalBounced: 0,
              totalUnsubscribed: 0,
            }
          );

          return {
            ...totals,
            campaignCount: sentCampaigns.length,
            deliveryRate: totals.totalSent > 0
              ? ((totals.totalDelivered / totals.totalSent) * 100).toFixed(1)
              : 0,
            openRate: totals.totalDelivered > 0
              ? ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1)
              : 0,
            clickRate: totals.totalOpened > 0
              ? ((totals.totalClicked / totals.totalOpened) * 100).toFixed(1)
              : 0,
            bounceRate: totals.totalSent > 0
              ? ((totals.totalBounced / totals.totalSent) * 100).toFixed(1)
              : 0,
          };
        },

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        setFilters: (filters) => set(state => ({
          filters: { ...state.filters, ...filters },
        })),

        clearFilters: () => set({
          filters: { status: null, searchQuery: '', dateRange: { from: null, to: null } },
        }),

        // Campaign CRUD
        createCampaign: (campaignData) => {
          const newCampaign = createEmailCampaign({
            ...campaignData,
            id: `campaign_${Date.now()}`,
          });

          set(state => ({
            campaigns: [...state.campaigns, newCampaign],
          }));

          return newCampaign;
        },

        updateCampaign: (id, updates) => {
          set(state => {
            const campaign = state.campaigns.find(c => c.id === id);
            if (!campaign) return state;

            const updatedCampaign = {
              ...campaign,
              ...updates,
              updatedAt: new Date().toISOString(),
            };

            return {
              campaigns: state.campaigns.map(c => c.id === id ? updatedCampaign : c),
              selectedCampaign: state.selectedCampaign?.id === id
                ? updatedCampaign
                : state.selectedCampaign,
            };
          });
        },

        deleteCampaign: (id) => {
          const campaign = get().getCampaignById(id);
          // Only allow deletion of draft campaigns
          if (campaign && campaign.status !== CAMPAIGN_STATUS.DRAFT) {
            set({ error: 'Only draft campaigns can be deleted' });
            return false;
          }

          set(state => ({
            campaigns: state.campaigns.filter(c => c.id !== id),
            selectedCampaign: state.selectedCampaign?.id === id ? null : state.selectedCampaign,
          }));

          return true;
        },

        duplicateCampaign: (id) => {
          const campaign = get().getCampaignById(id);
          if (!campaign) return null;

          const duplicated = createEmailCampaign({
            ...campaign,
            id: `campaign_${Date.now()}`,
            name: `${campaign.name} (Copy)`,
            status: CAMPAIGN_STATUS.DRAFT,
            scheduledAt: null,
            sentAt: null,
            stats: {
              totalRecipients: campaign.stats.totalRecipients,
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              bounced: 0,
              unsubscribed: 0,
              complained: 0,
            },
            approvedBy: null,
          });

          set(state => ({
            campaigns: [...state.campaigns, duplicated],
          }));

          return duplicated;
        },

        selectCampaign: (campaign) => set({ selectedCampaign: campaign }),
        clearSelectedCampaign: () => set({ selectedCampaign: null, previewHtml: null }),

        // Preview
        setPreviewMode: (mode) => set({ previewMode: mode }),

        generatePreview: (templateHtml, recipientData = {}) => {
          // Replace merge fields with sample data
          let preview = templateHtml;

          const sampleData = {
            '{{recipient_name}}': recipientData.name || 'John Doe',
            '{{recipient_email}}': recipientData.email || 'john.doe@example.com',
            '{{recipient_first_name}}': recipientData.firstName || 'John',
            '{{recipient_last_name}}': recipientData.lastName || 'Doe',
            '{{event_date}}': recipientData.eventDate || new Date().toLocaleDateString(),
            '{{event_time}}': recipientData.eventTime || '10:00 AM',
            '{{event_location}}': recipientData.eventLocation || 'Bahrain Exhibition Centre',
            '{{company_name}}': recipientData.companyName || 'BTEA',
            '{{current_date}}': new Date().toLocaleDateString(),
            '{{unsubscribe_link}}': '#unsubscribe',
          };

          Object.entries(sampleData).forEach(([key, value]) => {
            preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
          });

          set({ previewHtml: preview });
          return preview;
        },

        clearPreview: () => set({ previewHtml: null }),

        // Campaign Workflow Actions
        scheduleCampaign: (id, scheduledAt) => {
          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === id
                ? {
                    ...c,
                    status: CAMPAIGN_STATUS.SCHEDULED,
                    scheduledAt,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        },

        unscheduleCampaign: (id) => {
          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === id
                ? {
                    ...c,
                    status: CAMPAIGN_STATUS.DRAFT,
                    scheduledAt: null,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        },

        pauseCampaign: (id) => {
          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === id
                ? {
                    ...c,
                    status: CAMPAIGN_STATUS.PAUSED,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        },

        resumeCampaign: (id) => {
          const campaign = get().getCampaignById(id);
          if (!campaign) return;

          const newStatus = campaign.scheduledAt
            ? CAMPAIGN_STATUS.SCHEDULED
            : CAMPAIGN_STATUS.DRAFT;

          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === id
                ? {
                    ...c,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        },

        cancelCampaign: (id) => {
          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === id
                ? {
                    ...c,
                    status: CAMPAIGN_STATUS.CANCELLED,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        },

        // Send Campaign (Simulation)
        sendCampaign: async (id, recipientCount) => {
          set({ sending: true, error: null });

          try {
            // Update status to sending
            set(state => ({
              campaigns: state.campaigns.map(c =>
                c.id === id
                  ? { ...c, status: CAMPAIGN_STATUS.SENDING }
                  : c
              ),
            }));

            // Simulate sending delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate statistics (in production, these would come from the email provider)
            const stats = {
              totalRecipients: recipientCount,
              sent: recipientCount,
              delivered: Math.floor(recipientCount * 0.95),
              opened: Math.floor(recipientCount * 0.35),
              clicked: Math.floor(recipientCount * 0.12),
              bounced: Math.floor(recipientCount * 0.05),
              unsubscribed: Math.floor(recipientCount * 0.01),
              complained: 0,
            };

            // Update campaign to sent
            set(state => ({
              campaigns: state.campaigns.map(c =>
                c.id === id
                  ? {
                      ...c,
                      status: CAMPAIGN_STATUS.SENT,
                      sentAt: new Date().toISOString(),
                      stats,
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
              sending: false,
            }));

            return true;
          } catch (error) {
            set(state => ({
              campaigns: state.campaigns.map(c =>
                c.id === id
                  ? { ...c, status: CAMPAIGN_STATUS.FAILED }
                  : c
              ),
              sending: false,
              error: 'Failed to send campaign. Please try again.',
            }));

            return false;
          }
        },

        // Send Test Email
        sendTestEmail: async (campaignId, testEmail) => {
          set({ sending: true, error: null });

          try {
            // Simulate sending test email
            await new Promise(resolve => setTimeout(resolve, 1500));
            set({ sending: false });
            return { success: true, message: `Test email sent to ${testEmail}` };
          } catch (error) {
            set({ sending: false, error: 'Failed to send test email' });
            return { success: false, message: 'Failed to send test email' };
          }
        },

        // Update campaign statistics (for simulating real-time updates)
        updateCampaignStats: (id, statsUpdate) => {
          set(state => ({
            campaigns: state.campaigns.map(c =>
              c.id === id
                ? {
                    ...c,
                    stats: { ...c.stats, ...statsUpdate },
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        },

        // Get filtered campaigns
        getFilteredCampaigns: () => {
          const { campaigns, filters } = get();
          let filtered = [...campaigns];

          if (filters.status) {
            filtered = filtered.filter(c => c.status === filters.status);
          }

          if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
              c.name.toLowerCase().includes(query) ||
              c.subject.toLowerCase().includes(query)
            );
          }

          if (filters.dateRange.from) {
            filtered = filtered.filter(c =>
              new Date(c.createdAt) >= new Date(filters.dateRange.from)
            );
          }

          if (filters.dateRange.to) {
            filtered = filtered.filter(c =>
              new Date(c.createdAt) <= new Date(filters.dateRange.to)
            );
          }

          return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        },

        // Get campaign performance metrics for charts
        getCampaignMetrics: (id) => {
          const campaign = get().getCampaignById(id);
          if (!campaign || !campaign.stats) return null;

          const { stats } = campaign;

          return {
            deliveryRate: stats.sent > 0
              ? ((stats.delivered / stats.sent) * 100).toFixed(1)
              : 0,
            openRate: stats.delivered > 0
              ? ((stats.opened / stats.delivered) * 100).toFixed(1)
              : 0,
            clickRate: stats.opened > 0
              ? ((stats.clicked / stats.opened) * 100).toFixed(1)
              : 0,
            clickToOpenRate: stats.opened > 0
              ? ((stats.clicked / stats.opened) * 100).toFixed(1)
              : 0,
            bounceRate: stats.sent > 0
              ? ((stats.bounced / stats.sent) * 100).toFixed(1)
              : 0,
            unsubscribeRate: stats.delivered > 0
              ? ((stats.unsubscribed / stats.delivered) * 100).toFixed(1)
              : 0,
          };
        },

        // Reset store
        reset: () => set({
          campaigns: [],
          selectedCampaign: null,
          previewHtml: null,
          previewMode: 'desktop',
          sending: false,
          loading: false,
          error: null,
          filters: {
            status: null,
            searchQuery: '',
            dateRange: { from: null, to: null },
          },
        }),
      }),
      {
        name: 'btea-campaign-storage',
        partialize: (state) => ({
          campaigns: state.campaigns,
        }),
      }
    ),
    { name: 'CampaignStore' }
  )
);

export default useCampaignStore;

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Campaign statuses for workflow
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  READY: 'ready',
  REJECTED: 'rejected',
};

// Primary channels
export const CAMPAIGN_CHANNELS = {
  EMAIL: 'email',
  NEWSLETTER: 'newsletter',
  PORTAL_BANNER: 'portal_banner',
  SMS: 'sms',
  SOCIAL_MEDIA: 'social_media',
};

// Status transitions based on roles
export const STATUS_TRANSITIONS = {
  [CAMPAIGN_STATUS.DRAFT]: [CAMPAIGN_STATUS.IN_REVIEW],
  [CAMPAIGN_STATUS.IN_REVIEW]: [CAMPAIGN_STATUS.APPROVED, CAMPAIGN_STATUS.REJECTED, CAMPAIGN_STATUS.DRAFT],
  [CAMPAIGN_STATUS.APPROVED]: [CAMPAIGN_STATUS.READY, CAMPAIGN_STATUS.IN_REVIEW],
  [CAMPAIGN_STATUS.READY]: [CAMPAIGN_STATUS.APPROVED],
  [CAMPAIGN_STATUS.REJECTED]: [CAMPAIGN_STATUS.DRAFT],
};

const useCampaignStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Campaigns list
        campaigns: [],
        currentCampaign: null,

        // UI State
        isLoading: false,
        error: null,

        // Filters
        statusFilter: 'all',
        channelFilter: 'all',
        searchQuery: '',

        // Actions
        setCampaigns: (campaigns) => {
          set({ campaigns, isLoading: false });
        },

        setCurrentCampaign: (campaign) => {
          set({ currentCampaign: campaign });
        },

        createCampaign: (campaignData) => {
          const newCampaign = {
            id: `campaign-${Date.now()}`,
            name: campaignData.name || 'Untitled Campaign',
            objective: campaignData.objective || '',
            description: campaignData.description || '',
            primary_channel: campaignData.primary_channel || CAMPAIGN_CHANNELS.EMAIL,
            status: CAMPAIGN_STATUS.DRAFT,
            template_id: campaignData.template_id || null,
            template_content: campaignData.template_content || null,
            tags: campaignData.tags || [],
            scheduled_date: campaignData.scheduled_date || null,
            created_by: campaignData.created_by || 'current_user',
            updated_by: campaignData.created_by || 'current_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            comments: [],
            audit_log: [{
              action: 'created',
              status: CAMPAIGN_STATUS.DRAFT,
              user: campaignData.created_by || 'current_user',
              timestamp: new Date().toISOString(),
              notes: 'Campaign created',
            }],
          };

          set((state) => ({
            campaigns: [...state.campaigns, newCampaign],
            currentCampaign: newCampaign,
          }));

          return newCampaign;
        },

        updateCampaign: (campaignId, updates) => {
          set((state) => {
            const updatedCampaigns = state.campaigns.map((campaign) =>
              campaign.id === campaignId
                ? {
                    ...campaign,
                    ...updates,
                    updated_at: new Date().toISOString(),
                  }
                : campaign
            );

            const updatedCurrent = state.currentCampaign?.id === campaignId
              ? { ...state.currentCampaign, ...updates, updated_at: new Date().toISOString() }
              : state.currentCampaign;

            return {
              campaigns: updatedCampaigns,
              currentCampaign: updatedCurrent,
            };
          });
        },

        updateCampaignStatus: (campaignId, newStatus, user, notes = '') => {
          const campaign = get().campaigns.find((c) => c.id === campaignId);
          if (!campaign) return false;

          // Check if transition is valid
          const allowedTransitions = STATUS_TRANSITIONS[campaign.status] || [];
          if (!allowedTransitions.includes(newStatus)) {
            set({ error: `Cannot transition from ${campaign.status} to ${newStatus}` });
            return false;
          }

          const auditEntry = {
            action: 'status_change',
            from_status: campaign.status,
            to_status: newStatus,
            user,
            timestamp: new Date().toISOString(),
            notes,
          };

          set((state) => {
            const updatedCampaigns = state.campaigns.map((c) =>
              c.id === campaignId
                ? {
                    ...c,
                    status: newStatus,
                    updated_by: user,
                    updated_at: new Date().toISOString(),
                    audit_log: [...c.audit_log, auditEntry],
                  }
                : c
            );

            const updatedCurrent = state.currentCampaign?.id === campaignId
              ? {
                  ...state.currentCampaign,
                  status: newStatus,
                  updated_by: user,
                  updated_at: new Date().toISOString(),
                  audit_log: [...state.currentCampaign.audit_log, auditEntry],
                }
              : state.currentCampaign;

            return {
              campaigns: updatedCampaigns,
              currentCampaign: updatedCurrent,
            };
          });

          return true;
        },

        addComment: (campaignId, comment) => {
          const newComment = {
            id: `comment-${Date.now()}`,
            text: comment.text,
            user: comment.user,
            timestamp: new Date().toISOString(),
            resolved: false,
          };

          set((state) => {
            const updatedCampaigns = state.campaigns.map((c) =>
              c.id === campaignId
                ? { ...c, comments: [...c.comments, newComment] }
                : c
            );

            const updatedCurrent = state.currentCampaign?.id === campaignId
              ? { ...state.currentCampaign, comments: [...state.currentCampaign.comments, newComment] }
              : state.currentCampaign;

            return {
              campaigns: updatedCampaigns,
              currentCampaign: updatedCurrent,
            };
          });
        },

        resolveComment: (campaignId, commentId) => {
          set((state) => {
            const updatedCampaigns = state.campaigns.map((c) =>
              c.id === campaignId
                ? {
                    ...c,
                    comments: c.comments.map((comment) =>
                      comment.id === commentId ? { ...comment, resolved: true } : comment
                    ),
                  }
                : c
            );

            const updatedCurrent = state.currentCampaign?.id === campaignId
              ? {
                  ...state.currentCampaign,
                  comments: state.currentCampaign.comments.map((comment) =>
                    comment.id === commentId ? { ...comment, resolved: true } : comment
                  ),
                }
              : state.currentCampaign;

            return {
              campaigns: updatedCampaigns,
              currentCampaign: updatedCurrent,
            };
          });
        },

        deleteCampaign: (campaignId) => {
          set((state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== campaignId),
            currentCampaign: state.currentCampaign?.id === campaignId ? null : state.currentCampaign,
          }));
        },

        duplicateCampaign: (campaignId) => {
          const campaign = get().campaigns.find((c) => c.id === campaignId);
          if (!campaign) return null;

          const duplicated = {
            ...campaign,
            id: `campaign-${Date.now()}`,
            name: `${campaign.name} (Copy)`,
            status: CAMPAIGN_STATUS.DRAFT,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            comments: [],
            audit_log: [{
              action: 'created',
              status: CAMPAIGN_STATUS.DRAFT,
              user: 'current_user',
              timestamp: new Date().toISOString(),
              notes: `Duplicated from campaign: ${campaign.name}`,
            }],
          };

          set((state) => ({
            campaigns: [...state.campaigns, duplicated],
          }));

          return duplicated;
        },

        // Filters
        setStatusFilter: (status) => {
          set({ statusFilter: status });
        },

        setChannelFilter: (channel) => {
          set({ channelFilter: channel });
        },

        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },

        getFilteredCampaigns: () => {
          const { campaigns, statusFilter, channelFilter, searchQuery } = get();

          return campaigns.filter((campaign) => {
            const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
            const matchesChannel = channelFilter === 'all' || campaign.primary_channel === channelFilter;
            const matchesSearch = !searchQuery ||
              campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              campaign.description.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesChannel && matchesSearch;
          });
        },

        // Loading states
        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setError: (error) => {
          set({ error, isLoading: false });
        },

        clearError: () => {
          set({ error: null });
        },

        // Reset store
        reset: () => {
          set({
            campaigns: [],
            currentCampaign: null,
            isLoading: false,
            error: null,
            statusFilter: 'all',
            channelFilter: 'all',
            searchQuery: '',
          });
        },
      }),
      {
        name: 'btea-campaign-storage',
        partialize: (state) => ({
          campaigns: state.campaigns,
        }),
      }
    ),
    { name: 'BTEA Campaign Store' }
  )
);

export default useCampaignStore;

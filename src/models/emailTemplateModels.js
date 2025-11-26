/**
 * Email Template Management System - Data Models
 * Ministry-level Email Template Management for Marketing Department
 */

// User Roles
export const USER_ROLES = {
  SYSTEM_ADMIN: 'SystemAdmin',
  MARKETING_ADMIN: 'MarketingAdmin',
  TEMPLATE_EDITOR: 'TemplateEditor',
  VIEWER: 'Viewer',
};

export const ROLE_LABELS = {
  [USER_ROLES.SYSTEM_ADMIN]: 'System Administrator',
  [USER_ROLES.MARKETING_ADMIN]: 'Marketing Administrator',
  [USER_ROLES.TEMPLATE_EDITOR]: 'Template Editor',
  [USER_ROLES.VIEWER]: 'Viewer',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SYSTEM_ADMIN]: {
    canManageUsers: true,
    canManageBranding: true,
    canApproveTemplates: true,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canManageTeams: true,
    canSendCampaigns: true,
    canViewAnalytics: true,
    canManageMedia: true,
    canAccessAdmin: true,
  },
  [USER_ROLES.MARKETING_ADMIN]: {
    canManageUsers: false,
    canManageBranding: true,
    canApproveTemplates: true,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canManageTeams: true,
    canSendCampaigns: true,
    canViewAnalytics: true,
    canManageMedia: true,
    canAccessAdmin: true,
  },
  [USER_ROLES.TEMPLATE_EDITOR]: {
    canManageUsers: false,
    canManageBranding: false,
    canApproveTemplates: false,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: false,
    canManageTeams: false,
    canSendCampaigns: false,
    canViewAnalytics: false,
    canManageMedia: true,
    canAccessAdmin: false,
  },
  [USER_ROLES.VIEWER]: {
    canManageUsers: false,
    canManageBranding: false,
    canApproveTemplates: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canManageTeams: false,
    canSendCampaigns: false,
    canViewAnalytics: true,
    canManageMedia: false,
    canAccessAdmin: false,
  },
};

// Template Categories
export const TEMPLATE_CATEGORIES = {
  LOWKEY: 'lowkey',
  PROFESSIONAL: 'professional',
  NEWSLETTER: 'newsletter',
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
  PROMOTIONAL: 'promotional',
};

export const TEMPLATE_CATEGORY_LABELS = {
  [TEMPLATE_CATEGORIES.LOWKEY]: 'Low-key / Simple',
  [TEMPLATE_CATEGORIES.PROFESSIONAL]: 'Professional / Ministry-branded',
  [TEMPLATE_CATEGORIES.NEWSLETTER]: 'Newsletter',
  [TEMPLATE_CATEGORIES.ANNOUNCEMENT]: 'Announcement',
  [TEMPLATE_CATEGORIES.EVENT]: 'Event Invitation',
  [TEMPLATE_CATEGORIES.PROMOTIONAL]: 'Promotional',
};

// Template Status
export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
};

export const TEMPLATE_STATUS_LABELS = {
  [TEMPLATE_STATUS.DRAFT]: 'Draft',
  [TEMPLATE_STATUS.PENDING_REVIEW]: 'Pending Review',
  [TEMPLATE_STATUS.APPROVED]: 'Approved',
  [TEMPLATE_STATUS.ARCHIVED]: 'Archived',
};

export const TEMPLATE_STATUS_COLORS = {
  [TEMPLATE_STATUS.DRAFT]: 'warning',
  [TEMPLATE_STATUS.PENDING_REVIEW]: 'info',
  [TEMPLATE_STATUS.APPROVED]: 'success',
  [TEMPLATE_STATUS.ARCHIVED]: 'neutral',
};

// Campaign Status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  PAUSED: 'paused',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const CAMPAIGN_STATUS_LABELS = {
  [CAMPAIGN_STATUS.DRAFT]: 'Draft',
  [CAMPAIGN_STATUS.SCHEDULED]: 'Scheduled',
  [CAMPAIGN_STATUS.SENDING]: 'Sending',
  [CAMPAIGN_STATUS.SENT]: 'Sent',
  [CAMPAIGN_STATUS.PAUSED]: 'Paused',
  [CAMPAIGN_STATUS.FAILED]: 'Failed',
  [CAMPAIGN_STATUS.CANCELLED]: 'Cancelled',
};

export const CAMPAIGN_STATUS_COLORS = {
  [CAMPAIGN_STATUS.DRAFT]: 'warning',
  [CAMPAIGN_STATUS.SCHEDULED]: 'info',
  [CAMPAIGN_STATUS.SENDING]: 'primary',
  [CAMPAIGN_STATUS.SENT]: 'success',
  [CAMPAIGN_STATUS.PAUSED]: 'neutral',
  [CAMPAIGN_STATUS.FAILED]: 'error',
  [CAMPAIGN_STATUS.CANCELLED]: 'neutral',
};

// Media Types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// Editor Block Types
export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  BUTTON: 'button',
  IMAGE: 'image',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  COLUMNS: 'columns',
  VIDEO: 'video',
  SOCIAL: 'social',
};

export const BLOCK_TYPE_LABELS = {
  [BLOCK_TYPES.TEXT]: 'Text Block',
  [BLOCK_TYPES.HEADING]: 'Heading',
  [BLOCK_TYPES.BUTTON]: 'Button',
  [BLOCK_TYPES.IMAGE]: 'Image',
  [BLOCK_TYPES.DIVIDER]: 'Divider',
  [BLOCK_TYPES.SPACER]: 'Spacer',
  [BLOCK_TYPES.COLUMNS]: 'Columns',
  [BLOCK_TYPES.VIDEO]: 'Video',
  [BLOCK_TYPES.SOCIAL]: 'Social Links',
};

// Merge Fields / Variables
export const MERGE_FIELDS = [
  { key: '{{recipient_name}}', label: 'Recipient Name', description: 'Full name of the recipient' },
  { key: '{{recipient_email}}', label: 'Recipient Email', description: 'Email address of the recipient' },
  { key: '{{recipient_first_name}}', label: 'First Name', description: 'First name of the recipient' },
  { key: '{{recipient_last_name}}', label: 'Last Name', description: 'Last name of the recipient' },
  { key: '{{event_date}}', label: 'Event Date', description: 'Date of the event' },
  { key: '{{event_time}}', label: 'Event Time', description: 'Time of the event' },
  { key: '{{event_location}}', label: 'Event Location', description: 'Location/venue of the event' },
  { key: '{{company_name}}', label: 'Company Name', description: 'Name of the company/organization' },
  { key: '{{current_date}}', label: 'Current Date', description: 'Today\'s date' },
  { key: '{{unsubscribe_link}}', label: 'Unsubscribe Link', description: 'Link to opt-out from emails' },
];

// Audit Action Types
export const AUDIT_ACTIONS = {
  // Template actions
  TEMPLATE_CREATED: 'template_created',
  TEMPLATE_UPDATED: 'template_updated',
  TEMPLATE_DELETED: 'template_deleted',
  TEMPLATE_SUBMITTED_FOR_REVIEW: 'template_submitted_for_review',
  TEMPLATE_APPROVED: 'template_approved',
  TEMPLATE_REJECTED: 'template_rejected',
  TEMPLATE_ARCHIVED: 'template_archived',
  TEMPLATE_RESTORED: 'template_restored',

  // Team actions
  TEAM_CREATED: 'team_created',
  TEAM_UPDATED: 'team_updated',
  TEAM_DELETED: 'team_deleted',
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',
  TEAM_MEMBER_EXCLUDED: 'team_member_excluded',
  TEAM_MEMBER_INCLUDED: 'team_member_included',

  // Campaign actions
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_UPDATED: 'campaign_updated',
  CAMPAIGN_SENT: 'campaign_sent',
  CAMPAIGN_SCHEDULED: 'campaign_scheduled',
  CAMPAIGN_CANCELLED: 'campaign_cancelled',
  CAMPAIGN_PAUSED: 'campaign_paused',
  CAMPAIGN_RESUMED: 'campaign_resumed',

  // Media actions
  MEDIA_UPLOADED: 'media_uploaded',
  MEDIA_DELETED: 'media_deleted',

  // Admin actions
  USER_ROLE_CHANGED: 'user_role_changed',
  BRANDING_UPDATED: 'branding_updated',
  SETTINGS_UPDATED: 'settings_updated',
};

// Default Branding Settings
export const DEFAULT_BRANDING = {
  logoUrl: '/Content/images/btea-logo.png',
  primaryColor: '#815374',
  secondaryColor: '#f0bc74',
  accentColor: '#55d6be',
  headerHtml: `
    <div style="background-color: #815374; padding: 20px; text-align: center;">
      <img src="/Content/images/btea-logo.png" alt="BTEA" style="max-height: 60px;" />
    </div>
  `,
  footerHtml: `
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p>Bahrain Tourism and Exhibitions Authority</p>
      <p>Kingdom of Bahrain</p>
      <p><a href="{{unsubscribe_link}}" style="color: #815374;">Unsubscribe</a></p>
    </div>
  `,
  legalDisclaimer: 'This email was sent by the Bahrain Tourism and Exhibitions Authority. If you received this email in error, please disregard and delete it.',
};

/**
 * Factory functions to create model instances with defaults
 */

export const createTeam = (overrides = {}) => ({
  id: null,
  name: '',
  description: '',
  ownerId: null,
  memberCount: 0,
  excludedCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createTeamMember = (overrides = {}) => ({
  id: null,
  teamId: null,
  userId: null,
  email: '',
  name: '',
  firstName: '',
  lastName: '',
  role: 'member',
  isExcluded: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createEmailTemplate = (overrides = {}) => ({
  id: null,
  name: '',
  description: '',
  category: TEMPLATE_CATEGORIES.LOWKEY,
  status: TEMPLATE_STATUS.DRAFT,
  contentHtml: '',
  contentJson: { blocks: [] },
  previewText: '',
  version: 1,
  previousVersions: [],
  createdBy: null,
  approvedBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMediaAsset = (overrides = {}) => ({
  id: null,
  fileName: '',
  originalName: '',
  url: '',
  type: MEDIA_TYPES.IMAGE,
  mimeType: '',
  size: 0,
  width: null,
  height: null,
  tags: [],
  uploadedBy: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createEmailCampaign = (overrides = {}) => ({
  id: null,
  name: '',
  templateId: null,
  teamId: null,
  subject: '',
  previewText: '',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  scheduledAt: null,
  sentAt: null,
  status: CAMPAIGN_STATUS.DRAFT,
  stats: {
    totalRecipients: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    complained: 0,
  },
  approvedBy: null,
  createdBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createAuditLog = (overrides = {}) => ({
  id: null,
  action: '',
  entityType: '',
  entityId: null,
  userId: null,
  userName: '',
  details: {},
  ipAddress: '',
  userAgent: '',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createEditorBlock = (type, overrides = {}) => {
  const baseBlock = {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    createdAt: new Date().toISOString(),
  };

  const blockDefaults = {
    [BLOCK_TYPES.TEXT]: {
      content: '<p>Enter your text here...</p>',
      alignment: 'left',
      padding: { top: 10, right: 20, bottom: 10, left: 20 },
    },
    [BLOCK_TYPES.HEADING]: {
      content: 'Heading',
      level: 2, // h1, h2, h3, etc.
      alignment: 'left',
      padding: { top: 20, right: 20, bottom: 10, left: 20 },
    },
    [BLOCK_TYPES.BUTTON]: {
      text: 'Click Here',
      url: '#',
      alignment: 'center',
      backgroundColor: '#815374',
      textColor: '#ffffff',
      borderRadius: 4,
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
    },
    [BLOCK_TYPES.IMAGE]: {
      src: '',
      alt: '',
      width: '100%',
      alignment: 'center',
      linkUrl: '',
      padding: { top: 10, right: 20, bottom: 10, left: 20 },
    },
    [BLOCK_TYPES.DIVIDER]: {
      style: 'solid', // solid, dashed, dotted
      color: '#e0e0e0',
      thickness: 1,
      width: '100%',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    },
    [BLOCK_TYPES.SPACER]: {
      height: 40,
    },
    [BLOCK_TYPES.COLUMNS]: {
      columns: 2,
      gap: 20,
      content: [[], []],
      padding: { top: 10, right: 20, bottom: 10, left: 20 },
    },
    [BLOCK_TYPES.SOCIAL]: {
      alignment: 'center',
      iconSize: 32,
      links: [
        { platform: 'facebook', url: '' },
        { platform: 'twitter', url: '' },
        { platform: 'instagram', url: '' },
        { platform: 'linkedin', url: '' },
      ],
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    },
  };

  return {
    ...baseBlock,
    ...blockDefaults[type],
    ...overrides,
  };
};

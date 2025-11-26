/**
 * Seed Data for Email Template Management System
 * Sample data to demonstrate the system's capabilities
 */

import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUS,
  CAMPAIGN_STATUS,
  BLOCK_TYPES,
} from '../models/emailTemplateModels';

// Sample Teams
export const sampleTeams = [
  {
    id: 'team_1',
    name: 'Marketing Team',
    description: 'Internal marketing department members',
    ownerId: 'user_1',
    memberCount: 5,
    excludedCount: 0,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
  },
  {
    id: 'team_2',
    name: 'VIP Customers',
    description: 'High-value customers and partners',
    ownerId: 'user_1',
    memberCount: 25,
    excludedCount: 2,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-11-18T11:00:00Z',
  },
  {
    id: 'team_3',
    name: 'Hotel Partners',
    description: 'All registered hotel partners in Bahrain',
    ownerId: 'user_1',
    memberCount: 150,
    excludedCount: 5,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-11-22T16:45:00Z',
  },
  {
    id: 'team_4',
    name: 'Tourism Stakeholders',
    description: 'Tourism industry stakeholders and government contacts',
    ownerId: 'user_1',
    memberCount: 75,
    excludedCount: 3,
    createdAt: '2024-04-05T10:30:00Z',
    updatedAt: '2024-11-15T09:20:00Z',
  },
];

// Sample Team Members
export const sampleTeamMembers = {
  team_1: [
    { id: 'member_1_1', teamId: 'team_1', email: 'ahmed@btea.bh', name: 'Ahmed Ali', isExcluded: false, createdAt: '2024-01-15T10:00:00Z' },
    { id: 'member_1_2', teamId: 'team_1', email: 'fatima@btea.bh', name: 'Fatima Hassan', isExcluded: false, createdAt: '2024-01-15T10:00:00Z' },
    { id: 'member_1_3', teamId: 'team_1', email: 'khalid@btea.bh', name: 'Khalid Mohammed', isExcluded: false, createdAt: '2024-01-15T10:00:00Z' },
    { id: 'member_1_4', teamId: 'team_1', email: 'noor@btea.bh', name: 'Noor Ahmed', isExcluded: false, createdAt: '2024-01-15T10:00:00Z' },
    { id: 'member_1_5', teamId: 'team_1', email: 'omar@btea.bh', name: 'Omar Saleh', isExcluded: false, createdAt: '2024-01-15T10:00:00Z' },
  ],
  team_2: [
    { id: 'member_2_1', teamId: 'team_2', email: 'vip1@example.com', name: 'VIP Customer 1', isExcluded: false, createdAt: '2024-02-20T09:00:00Z' },
    { id: 'member_2_2', teamId: 'team_2', email: 'vip2@example.com', name: 'VIP Customer 2', isExcluded: false, createdAt: '2024-02-20T09:00:00Z' },
    { id: 'member_2_3', teamId: 'team_2', email: 'vip3@example.com', name: 'VIP Customer 3', isExcluded: true, createdAt: '2024-02-20T09:00:00Z' },
    { id: 'member_2_4', teamId: 'team_2', email: 'vip4@example.com', name: 'VIP Customer 4', isExcluded: true, createdAt: '2024-02-20T09:00:00Z' },
  ],
  team_3: [],
  team_4: [],
};

// Sample Templates
export const sampleTemplates = [
  {
    id: 'template_1',
    name: 'Monthly Newsletter',
    description: 'Standard monthly newsletter template for stakeholders',
    category: TEMPLATE_CATEGORIES.NEWSLETTER,
    status: TEMPLATE_STATUS.APPROVED,
    previewText: 'Your monthly update from BTEA',
    version: 3,
    previousVersions: [],
    createdBy: 'user_1',
    approvedBy: 'user_2',
    contentJson: {
      blocks: [
        {
          id: 'block_1',
          type: BLOCK_TYPES.HEADING,
          content: 'Monthly Newsletter',
          level: 1,
          alignment: 'center',
          padding: { top: 20, right: 20, bottom: 10, left: 20 },
        },
        {
          id: 'block_2',
          type: BLOCK_TYPES.TEXT,
          content: '<p>Dear {{recipient_name}},</p><p>Welcome to our monthly newsletter. Here are the latest updates from BTEA.</p>',
          alignment: 'left',
          padding: { top: 10, right: 20, bottom: 10, left: 20 },
        },
        {
          id: 'block_3',
          type: BLOCK_TYPES.DIVIDER,
          style: 'solid',
          color: '#e0e0e0',
          thickness: 1,
          width: '100%',
          padding: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        {
          id: 'block_4',
          type: BLOCK_TYPES.BUTTON,
          text: 'Read More',
          url: 'https://btea.bh',
          alignment: 'center',
          backgroundColor: '#815374',
          textColor: '#ffffff',
          borderRadius: 4,
          padding: { top: 12, right: 24, bottom: 12, left: 24 },
        },
      ],
    },
    contentHtml: '',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z',
  },
  {
    id: 'template_2',
    name: 'Event Invitation',
    description: 'Professional event invitation template',
    category: TEMPLATE_CATEGORIES.EVENT,
    status: TEMPLATE_STATUS.APPROVED,
    previewText: 'You are invited to our upcoming event',
    version: 2,
    previousVersions: [],
    createdBy: 'user_1',
    approvedBy: 'user_2',
    contentJson: {
      blocks: [
        {
          id: 'block_1',
          type: BLOCK_TYPES.HEADING,
          content: 'You\'re Invited!',
          level: 1,
          alignment: 'center',
          padding: { top: 30, right: 20, bottom: 10, left: 20 },
        },
        {
          id: 'block_2',
          type: BLOCK_TYPES.TEXT,
          content: '<p>Dear {{recipient_name}},</p><p>We are pleased to invite you to our upcoming event.</p>',
          alignment: 'center',
          padding: { top: 10, right: 20, bottom: 20, left: 20 },
        },
        {
          id: 'block_3',
          type: BLOCK_TYPES.TEXT,
          content: '<p><strong>Date:</strong> {{event_date}}</p><p><strong>Time:</strong> {{event_time}}</p><p><strong>Location:</strong> {{event_location}}</p>',
          alignment: 'center',
          padding: { top: 10, right: 20, bottom: 20, left: 20 },
        },
        {
          id: 'block_4',
          type: BLOCK_TYPES.BUTTON,
          text: 'RSVP Now',
          url: '#rsvp',
          alignment: 'center',
          backgroundColor: '#815374',
          textColor: '#ffffff',
          borderRadius: 4,
          padding: { top: 12, right: 24, bottom: 12, left: 24 },
        },
      ],
    },
    contentHtml: '',
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-10-20T09:15:00Z',
  },
  {
    id: 'template_3',
    name: 'Quick Update',
    description: 'Simple template for quick internal updates',
    category: TEMPLATE_CATEGORIES.LOWKEY,
    status: TEMPLATE_STATUS.DRAFT,
    previewText: 'Quick update from the team',
    version: 1,
    previousVersions: [],
    createdBy: 'user_1',
    approvedBy: null,
    contentJson: {
      blocks: [
        {
          id: 'block_1',
          type: BLOCK_TYPES.TEXT,
          content: '<p>Hi {{recipient_first_name}},</p><p>Just a quick update...</p>',
          alignment: 'left',
          padding: { top: 10, right: 20, bottom: 10, left: 20 },
        },
      ],
    },
    contentHtml: '',
    createdAt: '2024-11-10T08:00:00Z',
    updatedAt: '2024-11-10T08:00:00Z',
  },
  {
    id: 'template_4',
    name: 'Promotional Offer',
    description: 'Template for promotional campaigns',
    category: TEMPLATE_CATEGORIES.PROMOTIONAL,
    status: TEMPLATE_STATUS.PENDING_REVIEW,
    previewText: 'Special offer just for you!',
    version: 1,
    previousVersions: [],
    createdBy: 'user_1',
    approvedBy: null,
    contentJson: {
      blocks: [
        {
          id: 'block_1',
          type: BLOCK_TYPES.HEADING,
          content: 'Special Offer!',
          level: 1,
          alignment: 'center',
          padding: { top: 20, right: 20, bottom: 10, left: 20 },
        },
        {
          id: 'block_2',
          type: BLOCK_TYPES.TEXT,
          content: '<p>Don\'t miss out on this exclusive offer available only for a limited time.</p>',
          alignment: 'center',
          padding: { top: 10, right: 20, bottom: 20, left: 20 },
        },
      ],
    },
    contentHtml: '',
    createdAt: '2024-11-18T10:00:00Z',
    updatedAt: '2024-11-18T10:00:00Z',
  },
];

// Sample Campaigns
export const sampleCampaigns = [
  {
    id: 'campaign_1',
    name: 'November Newsletter 2024',
    templateId: 'template_1',
    teamId: 'team_3',
    subject: 'BTEA November Newsletter - Tourism Updates',
    previewText: 'Latest updates from Bahrain Tourism',
    fromName: 'BTEA Marketing',
    fromEmail: 'marketing@btea.bh',
    replyTo: 'marketing@btea.bh',
    scheduledAt: null,
    sentAt: '2024-11-01T09:00:00Z',
    status: CAMPAIGN_STATUS.SENT,
    stats: {
      totalRecipients: 145,
      sent: 145,
      delivered: 140,
      opened: 52,
      clicked: 18,
      bounced: 5,
      unsubscribed: 1,
      complained: 0,
    },
    approvedBy: 'user_2',
    createdBy: 'user_1',
    createdAt: '2024-10-28T10:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'campaign_2',
    name: 'Tourism Summit 2024 Invitation',
    templateId: 'template_2',
    teamId: 'team_4',
    subject: 'You\'re Invited: Bahrain Tourism Summit 2024',
    previewText: 'Join us for the annual tourism summit',
    fromName: 'BTEA Events',
    fromEmail: 'events@btea.bh',
    replyTo: 'events@btea.bh',
    scheduledAt: '2024-12-01T08:00:00Z',
    sentAt: null,
    status: CAMPAIGN_STATUS.SCHEDULED,
    stats: {
      totalRecipients: 72,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      complained: 0,
    },
    approvedBy: 'user_2',
    createdBy: 'user_1',
    createdAt: '2024-11-20T14:00:00Z',
    updatedAt: '2024-11-20T14:00:00Z',
  },
  {
    id: 'campaign_3',
    name: 'Holiday Season Greetings',
    templateId: null,
    teamId: null,
    subject: 'Season\'s Greetings from BTEA',
    previewText: '',
    fromName: 'BTEA',
    fromEmail: 'info@btea.bh',
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
    createdBy: 'user_1',
    createdAt: '2024-11-22T11:00:00Z',
    updatedAt: '2024-11-22T11:00:00Z',
  },
  {
    id: 'campaign_4',
    name: 'October Newsletter 2024',
    templateId: 'template_1',
    teamId: 'team_3',
    subject: 'BTEA October Newsletter - Tourism Updates',
    previewText: 'Latest updates from Bahrain Tourism',
    fromName: 'BTEA Marketing',
    fromEmail: 'marketing@btea.bh',
    replyTo: 'marketing@btea.bh',
    scheduledAt: null,
    sentAt: '2024-10-01T09:00:00Z',
    status: CAMPAIGN_STATUS.SENT,
    stats: {
      totalRecipients: 142,
      sent: 142,
      delivered: 138,
      opened: 48,
      clicked: 15,
      bounced: 4,
      unsubscribed: 2,
      complained: 0,
    },
    approvedBy: 'user_2',
    createdBy: 'user_1',
    createdAt: '2024-09-25T10:00:00Z',
    updatedAt: '2024-10-01T09:00:00Z',
  },
];

// Sample Audit Logs
export const sampleAuditLogs = [
  {
    id: 'audit_1',
    action: 'campaign_sent',
    entityType: 'campaign',
    entityId: 'campaign_1',
    userId: 'user_1',
    userName: 'Ahmed Ali',
    details: { recipientCount: 145 },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    createdAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'audit_2',
    action: 'template_approved',
    entityType: 'template',
    entityId: 'template_1',
    userId: 'user_2',
    userName: 'Fatima Hassan',
    details: {},
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0',
    createdAt: '2024-11-15T14:30:00Z',
  },
  {
    id: 'audit_3',
    action: 'team_member_added',
    entityType: 'team',
    entityId: 'team_2',
    userId: 'user_1',
    userName: 'Ahmed Ali',
    details: { memberEmail: 'vip5@example.com' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    createdAt: '2024-11-18T11:00:00Z',
  },
  {
    id: 'audit_4',
    action: 'campaign_scheduled',
    entityType: 'campaign',
    entityId: 'campaign_2',
    userId: 'user_1',
    userName: 'Ahmed Ali',
    details: { scheduledAt: '2024-12-01T08:00:00Z' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    createdAt: '2024-11-20T14:00:00Z',
  },
  {
    id: 'audit_5',
    action: 'template_created',
    entityType: 'template',
    entityId: 'template_4',
    userId: 'user_1',
    userName: 'Ahmed Ali',
    details: { templateName: 'Promotional Offer' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    createdAt: '2024-11-18T10:00:00Z',
  },
];

/**
 * Initialize stores with sample data
 * Call this function to populate the stores with demo data
 */
export const initializeSampleData = (stores) => {
  const { teamStore, templateStore, campaignStore, adminStore } = stores;

  // Initialize teams
  if (teamStore && sampleTeams.length > 0) {
    sampleTeams.forEach(team => {
      teamStore.getState().teams.push(team);
    });

    Object.entries(sampleTeamMembers).forEach(([teamId, members]) => {
      teamStore.getState().teamMembers[teamId] = members;
    });
  }

  // Initialize templates
  if (templateStore && sampleTemplates.length > 0) {
    sampleTemplates.forEach(template => {
      templateStore.getState().templates.push(template);
    });
  }

  // Initialize campaigns
  if (campaignStore && sampleCampaigns.length > 0) {
    sampleCampaigns.forEach(campaign => {
      campaignStore.getState().campaigns.push(campaign);
    });
  }

  // Initialize audit logs
  if (adminStore && sampleAuditLogs.length > 0) {
    sampleAuditLogs.forEach(log => {
      adminStore.getState().auditLogs.push(log);
    });
  }
};

export default {
  sampleTeams,
  sampleTeamMembers,
  sampleTemplates,
  sampleCampaigns,
  sampleAuditLogs,
  initializeSampleData,
};

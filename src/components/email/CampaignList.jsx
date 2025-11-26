/**
 * Campaign List Component
 * Displays and manages email campaigns
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiMoreVertical,
  FiSend,
  FiClock,
  FiPause,
  FiPlay,
  FiX,
  FiBarChart2,
  FiUsers,
  FiCheckCircle,
} from 'react-icons/fi';
import useCampaignStore from '../../stores/campaignStore';
import useTeamStore from '../../stores/teamStore';
import useTemplateStore from '../../stores/templateStore';
import {
  CAMPAIGN_STATUS,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
} from '../../models/emailTemplateModels';
import { format } from 'date-fns';

const CampaignList = ({ onEdit, onPreview, onViewStats }) => {
  const {
    filters,
    setFilters,
    clearFilters,
    getFilteredCampaigns,
    deleteCampaign,
    duplicateCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    getOverallStats,
  } = useCampaignStore();

  const { getTeamById, getTeamStats } = useTeamStore();
  const { getTemplateById } = useTemplateStore();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const campaigns = getFilteredCampaigns();
  const overallStats = getOverallStats();

  const handleSearchChange = (e) => {
    setFilters({ searchQuery: e.target.value });
  };

  const handleStatusFilter = (status) => {
    setFilters({ status: filters.status === status ? null : status });
  };

  const handleDuplicate = (campaign) => {
    duplicateCampaign(campaign.id);
    setOpenDropdown(null);
  };

  const handleDelete = (campaign) => {
    if (window.confirm(`Delete "${campaign.name}"? This cannot be undone.`)) {
      const result = deleteCampaign(campaign.id);
      if (!result) {
        alert('Only draft campaigns can be deleted.');
      }
    }
    setOpenDropdown(null);
  };

  const handlePause = (campaign) => {
    pauseCampaign(campaign.id);
    setOpenDropdown(null);
  };

  const handleResume = (campaign) => {
    resumeCampaign(campaign.id);
    setOpenDropdown(null);
  };

  const handleCancel = (campaign) => {
    if (window.confirm(`Cancel "${campaign.name}"? This action cannot be undone.`)) {
      cancelCampaign(campaign.id);
    }
    setOpenDropdown(null);
  };

  const getStatusBadgeClass = (status) => {
    const colorMap = {
      [CAMPAIGN_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      [CAMPAIGN_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      [CAMPAIGN_STATUS.SENDING]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      [CAMPAIGN_STATUS.SENT]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      [CAMPAIGN_STATUS.PAUSED]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      [CAMPAIGN_STATUS.FAILED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      [CAMPAIGN_STATUS.CANCELLED]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    return colorMap[status] || colorMap[CAMPAIGN_STATUS.DRAFT];
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiMail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.campaignCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Campaigns Sent</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.deliveryRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiEye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.openRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Open Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FiBarChart2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.clickRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage email campaigns
          </p>
        </div>
        <button
          onClick={() => onEdit(null)}
          className="btn-btea flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              showFilters || filters.status
                ? 'border-btea-primary bg-btea-primary/10 text-btea-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {filters.status && (
              <span className="w-5 h-5 bg-btea-primary text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CAMPAIGN_STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.status === key
                          ? 'bg-btea-primary text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {filters.status && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-sm text-btea-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FiMail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filters.searchQuery || filters.status
              ? 'No campaigns found'
              : 'No campaigns yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filters.searchQuery || filters.status
              ? 'Try adjusting your filters'
              : 'Create your first email campaign'}
          </p>
          {!filters.searchQuery && !filters.status && (
            <button onClick={() => onEdit(null)} className="btn-btea-outline">
              <FiPlus className="w-4 h-4 mr-2" />
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Campaign
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Recipients
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Performance
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Date
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign) => {
                  const template = getTemplateById(campaign.templateId);
                  const team = getTeamById(campaign.teamId);
                  const teamStats = campaign.teamId ? getTeamStats(campaign.teamId) : null;

                  return (
                    <tr
                      key={campaign.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {campaign.subject}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            campaign.status
                          )}`}
                        >
                          {campaign.status === CAMPAIGN_STATUS.SENDING && (
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                          )}
                          {CAMPAIGN_STATUS_LABELS[campaign.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FiUsers className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {campaign.stats?.totalRecipients ||
                              teamStats?.active ||
                              '—'}
                          </span>
                        </div>
                        {team && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            {team.name}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {campaign.status === CAMPAIGN_STATUS.SENT &&
                        campaign.stats ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-green-600">
                                {(
                                  (campaign.stats.opened /
                                    campaign.stats.delivered) *
                                  100
                                ).toFixed(1)}
                                % opened
                              </span>
                              <span className="text-blue-600">
                                {(
                                  (campaign.stats.clicked /
                                    campaign.stats.delivered) *
                                  100
                                ).toFixed(1)}
                                % clicked
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {campaign.sentAt ? (
                            <>
                              <p>Sent</p>
                              <p className="text-xs text-gray-500">
                                {format(
                                  new Date(campaign.sentAt),
                                  'MMM d, yyyy HH:mm'
                                )}
                              </p>
                            </>
                          ) : campaign.scheduledAt ? (
                            <>
                              <p className="flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                Scheduled
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(
                                  new Date(campaign.scheduledAt),
                                  'MMM d, yyyy HH:mm'
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs">
                              {format(
                                new Date(campaign.updatedAt),
                                'MMM d, yyyy'
                              )}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === campaign.id
                                  ? null
                                  : campaign.id
                              )
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          >
                            <FiMoreVertical className="w-4 h-4 text-gray-500" />
                          </button>

                          <AnimatePresence>
                            {openDropdown === campaign.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10"
                              >
                                {campaign.status === CAMPAIGN_STATUS.SENT && (
                                  <button
                                    onClick={() => {
                                      onViewStats(campaign);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                  >
                                    <FiBarChart2 className="w-4 h-4" />
                                    View Stats
                                  </button>
                                )}

                                {campaign.status === CAMPAIGN_STATUS.DRAFT && (
                                  <button
                                    onClick={() => {
                                      onEdit(campaign);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                    Edit
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    onPreview(campaign);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                  <FiEye className="w-4 h-4" />
                                  Preview
                                </button>

                                <button
                                  onClick={() => handleDuplicate(campaign)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                  <FiCopy className="w-4 h-4" />
                                  Duplicate
                                </button>

                                {campaign.status === CAMPAIGN_STATUS.SCHEDULED && (
                                  <>
                                    <button
                                      onClick={() => handlePause(campaign)}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                    >
                                      <FiPause className="w-4 h-4" />
                                      Pause
                                    </button>
                                    <button
                                      onClick={() => handleCancel(campaign)}
                                      className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"
                                    >
                                      <FiX className="w-4 h-4" />
                                      Cancel
                                    </button>
                                  </>
                                )}

                                {campaign.status === CAMPAIGN_STATUS.PAUSED && (
                                  <button
                                    onClick={() => handleResume(campaign)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                  >
                                    <FiPlay className="w-4 h-4" />
                                    Resume
                                  </button>
                                )}

                                {campaign.status === CAMPAIGN_STATUS.DRAFT && (
                                  <>
                                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                                    <button
                                      onClick={() => handleDelete(campaign)}
                                      className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;

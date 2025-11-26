/**
 * Template List Component
 * Displays and manages email templates
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiArchive,
  FiMoreVertical,
  FiFilter,
  FiEye,
  FiSend,
  FiCheck,
  FiClock,
} from 'react-icons/fi';
import useTemplateStore from '../../stores/templateStore';
import {
  TEMPLATE_STATUS,
  TEMPLATE_STATUS_LABELS,
  TEMPLATE_STATUS_COLORS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
} from '../../models/emailTemplateModels';
import { format } from 'date-fns';

const TemplateList = ({ onEdit, onPreview, onCreateCampaign }) => {
  const {
    filters,
    setFilters,
    clearFilters,
    getFilteredTemplates,
    deleteTemplate,
    duplicateTemplate,
    archiveTemplate,
    restoreTemplate,
    submitForReview,
  } = useTemplateStore();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const templates = getFilteredTemplates();

  const handleSearchChange = (e) => {
    setFilters({ searchQuery: e.target.value });
  };

  const handleStatusFilter = (status) => {
    setFilters({ status: filters.status === status ? null : status });
  };

  const handleCategoryFilter = (category) => {
    setFilters({ category: filters.category === category ? null : category });
  };

  const handleDuplicate = (template) => {
    duplicateTemplate(template.id);
    setOpenDropdown(null);
  };

  const handleDelete = (template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplate(template.id);
    }
    setOpenDropdown(null);
  };

  const handleArchive = (template) => {
    archiveTemplate(template.id);
    setOpenDropdown(null);
  };

  const handleRestore = (template) => {
    restoreTemplate(template.id);
    setOpenDropdown(null);
  };

  const handleSubmitForReview = (template) => {
    submitForReview(template.id);
    setOpenDropdown(null);
  };

  const getStatusBadgeClass = (status) => {
    const colorMap = {
      [TEMPLATE_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      [TEMPLATE_STATUS.PENDING_REVIEW]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      [TEMPLATE_STATUS.APPROVED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      [TEMPLATE_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    return colorMap[status] || colorMap[TEMPLATE_STATUS.DRAFT];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your email templates
          </p>
        </div>
        <button
          onClick={() => onEdit(null)}
          className="btn-btea flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-btea-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              showFilters || filters.status || filters.category
                ? 'border-btea-primary bg-btea-primary/10 text-btea-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {(filters.status || filters.category) && (
              <span className="w-5 h-5 bg-btea-primary text-white text-xs rounded-full flex items-center justify-center">
                {(filters.status ? 1 : 0) + (filters.category ? 1 : 0)}
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
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TEMPLATE_STATUS_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusFilter(key)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.status === key
                            ? 'bg-btea-primary text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleCategoryFilter(key)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.category === key
                            ? 'bg-btea-primary text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {(filters.status || filters.category) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-btea-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FiFileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filters.searchQuery || filters.status || filters.category
              ? 'No templates found'
              : 'No templates yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filters.searchQuery || filters.status || filters.category
              ? 'Try adjusting your filters'
              : 'Create your first email template to get started'}
          </p>
          {!filters.searchQuery && !filters.status && !filters.category && (
            <button onClick={() => onEdit(null)} className="btn-btea-outline">
              <FiPlus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-elevated bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
              >
                {/* Template Preview Header */}
                <div className="h-32 bg-gradient-to-br from-btea-primary/20 to-btea-secondary/20 dark:from-btea-primary/10 dark:to-btea-secondary/10 p-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <FiFileText className="w-16 h-16 text-gray-400" />
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      template.status
                    )}`}
                  >
                    {TEMPLATE_STATUS_LABELS[template.status]}
                  </span>

                  {/* Actions Dropdown */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === template.id ? null : template.id)
                      }
                      className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <AnimatePresence>
                      {openDropdown === template.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10"
                        >
                          <button
                            onClick={() => {
                              onEdit(template);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onPreview(template);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                          >
                            <FiEye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleDuplicate(template)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                          >
                            <FiCopy className="w-4 h-4" />
                            Duplicate
                          </button>

                          {template.status === TEMPLATE_STATUS.DRAFT && (
                            <button
                              onClick={() => handleSubmitForReview(template)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                            >
                              <FiSend className="w-4 h-4" />
                              Submit for Review
                            </button>
                          )}

                          {template.status === TEMPLATE_STATUS.APPROVED && (
                            <button
                              onClick={() => {
                                onCreateCampaign(template);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-btea-primary"
                            >
                              <FiSend className="w-4 h-4" />
                              Create Campaign
                            </button>
                          )}

                          <hr className="my-1 border-gray-200 dark:border-gray-600" />

                          {template.status === TEMPLATE_STATUS.ARCHIVED ? (
                            <button
                              onClick={() => handleRestore(template)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                            >
                              <FiCheck className="w-4 h-4" />
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchive(template)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                            >
                              <FiArchive className="w-4 h-4" />
                              Archive
                            </button>
                          )}

                          {template.status === TEMPLATE_STATUS.DRAFT && (
                            <button
                              onClick={() => handleDelete(template)}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
                    {template.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {TEMPLATE_CATEGORY_LABELS[template.category]}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TemplateList;

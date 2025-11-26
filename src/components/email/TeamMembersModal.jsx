/**
 * Team Members Modal Component
 * Modal for managing team members - add, remove, exclude/include
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiUserX,
  FiUserCheck,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import useTeamStore from '../../stores/teamStore';

const TeamMembersModal = ({ isOpen, onClose, team }) => {
  const {
    getTeamMembers,
    getTeamStats,
    addTeamMember,
    addBulkMembers,
    removeTeamMember,
    toggleMemberExclusion,
    excludeAllMembers,
    includeAllMembers,
  } = useTeamStore();

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'add' | 'bulk'
  const [searchQuery, setSearchQuery] = useState('');
  const [newMember, setNewMember] = useState({ email: '', name: '' });
  const [bulkEmails, setBulkEmails] = useState('');
  const [errors, setErrors] = useState({});
  const [bulkResults, setBulkResults] = useState(null);

  const members = team ? getTeamMembers(team.id) : [];
  const stats = team ? getTeamStats(team.id) : { total: 0, active: 0, excluded: 0 };

  const filteredMembers = members.filter(
    (m) =>
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    setErrors({});

    if (!newMember.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(newMember.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    const result = addTeamMember(team.id, {
      email: newMember.email.trim().toLowerCase(),
      name: newMember.name.trim() || newMember.email.split('@')[0],
    });

    if (result) {
      setNewMember({ email: '', name: '' });
      setActiveTab('members');
    }
  };

  const handleBulkAdd = () => {
    setErrors({});
    setBulkResults(null);

    if (!bulkEmails.trim()) {
      setErrors({ bulk: 'Please enter at least one email address' });
      return;
    }

    // Split by newlines, commas, or semicolons
    const emails = bulkEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e);

    if (emails.length === 0) {
      setErrors({ bulk: 'No valid emails found' });
      return;
    }

    const results = addBulkMembers(team.id, emails);
    setBulkResults(results);

    if (results.added > 0) {
      setBulkEmails('');
    }
  };

  const handleRemoveMember = (memberId, memberEmail) => {
    if (window.confirm(`Remove ${memberEmail} from the team?`)) {
      removeTeamMember(team.id, memberId);
    }
  };

  const handleExcludeAll = () => {
    if (window.confirm('Exclude all members from receiving emails?')) {
      excludeAllMembers(team.id);
    }
  };

  const handleIncludeAll = () => {
    includeAllMembers(team.id);
  };

  if (!isOpen || !team) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-btea-primary/10 rounded-lg">
                <FiUsers className="w-5 h-5 text-btea-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage team members
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Recipients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.excluded}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Excluded</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'members'
                  ? 'text-btea-primary border-b-2 border-btea-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FiUsers className="w-4 h-4 inline-block mr-2" />
              Members ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'add'
                  ? 'text-btea-primary border-b-2 border-btea-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FiUserPlus className="w-4 h-4 inline-block mr-2" />
              Add Member
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'bulk'
                  ? 'text-btea-primary border-b-2 border-btea-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FiUpload className="w-4 h-4 inline-block mr-2" />
              Bulk Add
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  {stats.total > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleIncludeAll}
                        className="px-3 py-2 text-sm bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg flex items-center gap-1"
                      >
                        <FiUserCheck className="w-4 h-4" />
                        Include All
                      </button>
                      <button
                        onClick={handleExcludeAll}
                        className="px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg flex items-center gap-1"
                      >
                        <FiUserX className="w-4 h-4" />
                        Exclude All
                      </button>
                    </div>
                  )}
                </div>

                {/* Members List */}
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <FiUsers className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No members found' : 'No members in this team'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          member.isExcluded
                            ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              member.isExcluded ? 'bg-red-400' : 'bg-btea-primary'
                            }`}
                          >
                            {(member.name || member.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {member.name || member.email.split('@')[0]}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {member.email}
                            </p>
                          </div>
                          {member.isExcluded && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 rounded-full">
                              Excluded
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMemberExclusion(team.id, member.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              member.isExcluded
                                ? 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600'
                                : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500'
                            }`}
                            title={member.isExcluded ? 'Include member' : 'Exclude member'}
                          >
                            {member.isExcluded ? (
                              <FiUserCheck className="w-4 h-4" />
                            ) : (
                              <FiUserX className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.email)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                            title="Remove member"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Member Tab */}
            {activeTab === 'add' && (
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.email
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    autoFocus
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button type="submit" className="w-full btn-btea flex items-center justify-center gap-2">
                  <FiUserPlus className="w-4 h-4" />
                  Add Member
                </button>
              </form>
            )}

            {/* Bulk Add Tab */}
            {activeTab === 'bulk' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Addresses
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Enter multiple email addresses, separated by commas, semicolons, or new lines
                  </p>
                  <textarea
                    value={bulkEmails}
                    onChange={(e) => {
                      setBulkEmails(e.target.value);
                      setBulkResults(null);
                    }}
                    placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                    rows={8}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.bulk
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm`}
                  />
                  {errors.bulk && (
                    <p className="mt-1 text-sm text-red-500">{errors.bulk}</p>
                  )}
                </div>

                {bulkResults && (
                  <div
                    className={`p-4 rounded-lg ${
                      bulkResults.added > 0
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {bulkResults.added > 0 ? (
                        <FiCheck className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bulkResults.added > 0 ? 'Import Complete' : 'No New Members Added'}
                        </p>
                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                          <li>
                            <span className="text-green-600">{bulkResults.added}</span> members added
                          </li>
                          {bulkResults.duplicates > 0 && (
                            <li>
                              <span className="text-yellow-600">{bulkResults.duplicates}</span> duplicates
                              skipped
                            </li>
                          )}
                          {bulkResults.invalid > 0 && (
                            <li>
                              <span className="text-red-500">{bulkResults.invalid}</span> invalid emails
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBulkAdd}
                  className="w-full btn-btea flex items-center justify-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  Import Emails
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamMembersModal;

/**
 * Team List Component
 * Displays and manages email recipient teams
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiSearch, FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiMoreVertical } from 'react-icons/fi';
import useTeamStore from '../../stores/teamStore';
import TeamModal from './TeamModal';
import TeamMembersModal from './TeamMembersModal';
import { format } from 'date-fns';

const TeamList = () => {
  const {
    teams,
    searchQuery,
    setSearchQuery,
    getFilteredTeams,
    deleteTeam,
    getTeamStats,
  } = useTeamStore();

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const filteredTeams = getFilteredTeams();

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
    setOpenDropdown(null);
  };

  const handleManageMembers = (team) => {
    setSelectedTeam(team);
    setIsMembersModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDeleteTeam = (team) => {
    if (window.confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      deleteTeam(team.id);
    }
    setOpenDropdown(null);
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setIsTeamModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your email recipient teams
          </p>
        </div>
        <button
          onClick={handleCreateTeam}
          className="btn-btea flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Team
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-btea-primary focus:border-transparent"
        />
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FiUsers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No teams found' : 'No teams yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first team to start managing recipients'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateTeam}
              className="btn-btea-outline"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTeams.map((team) => {
              const stats = getTeamStats(team.id);

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-elevated bg-white dark:bg-gray-800 p-5 rounded-xl relative"
                >
                  {/* Dropdown Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === team.id ? null : team.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {openDropdown === team.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10"
                        >
                          <button
                            onClick={() => handleManageMembers(team)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                          >
                            <FiUsers className="w-4 h-4" />
                            Manage Members
                          </button>
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            Edit Team
                          </button>
                          <hr className="my-1 border-gray-200 dark:border-gray-600" />
                          <button
                            onClick={() => handleDeleteTeam(team)}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete Team
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Team Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-btea-primary/10 rounded-lg">
                      <FiUsers className="w-6 h-6 text-btea-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-8">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {team.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.total}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1">
                        <FiUserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">{stats.active}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1">
                        <FiUserX className="w-4 h-4 text-red-500" />
                        <span className="text-lg font-bold text-red-500">{stats.excluded}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Excluded</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {format(new Date(team.updatedAt), 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={() => handleManageMembers(team)}
                      className="text-btea-primary hover:text-btea-primary-dark text-sm font-medium flex items-center gap-1"
                    >
                      <FiUsers className="w-4 h-4" />
                      View Members
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
      />

      <TeamMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
      />
    </div>
  );
};

export default TeamList;

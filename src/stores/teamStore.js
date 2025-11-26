/**
 * Team & Recipient Management Store
 * Manages teams and their members for email campaigns
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createTeam, createTeamMember } from '../models/emailTemplateModels';

const useTeamStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        teams: [],
        selectedTeam: null,
        teamMembers: {}, // { teamId: [members] }
        loading: false,
        error: null,
        searchQuery: '',

        // Computed-like getters
        getTeamById: (id) => get().teams.find(t => t.id === id),

        getTeamMembers: (teamId) => get().teamMembers[teamId] || [],

        getActiveRecipients: (teamId) => {
          const members = get().teamMembers[teamId] || [];
          return members.filter(m => !m.isExcluded);
        },

        getExcludedMembers: (teamId) => {
          const members = get().teamMembers[teamId] || [];
          return members.filter(m => m.isExcluded);
        },

        getTeamStats: (teamId) => {
          const members = get().teamMembers[teamId] || [];
          const total = members.length;
          const excluded = members.filter(m => m.isExcluded).length;
          const active = total - excluded;
          return { total, excluded, active };
        },

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        setSearchQuery: (query) => set({ searchQuery: query }),

        // Team CRUD
        addTeam: (teamData) => {
          const newTeam = createTeam({
            ...teamData,
            id: `team_${Date.now()}`,
          });
          set(state => ({
            teams: [...state.teams, newTeam],
            teamMembers: { ...state.teamMembers, [newTeam.id]: [] },
          }));
          return newTeam;
        },

        updateTeam: (id, updates) => {
          set(state => ({
            teams: state.teams.map(team =>
              team.id === id
                ? { ...team, ...updates, updatedAt: new Date().toISOString() }
                : team
            ),
            selectedTeam: state.selectedTeam?.id === id
              ? { ...state.selectedTeam, ...updates, updatedAt: new Date().toISOString() }
              : state.selectedTeam,
          }));
        },

        deleteTeam: (id) => {
          set(state => {
            const newTeamMembers = { ...state.teamMembers };
            delete newTeamMembers[id];
            return {
              teams: state.teams.filter(t => t.id !== id),
              teamMembers: newTeamMembers,
              selectedTeam: state.selectedTeam?.id === id ? null : state.selectedTeam,
            };
          });
        },

        selectTeam: (team) => set({ selectedTeam: team }),
        clearSelectedTeam: () => set({ selectedTeam: null }),

        // Team Members CRUD
        addTeamMember: (teamId, memberData) => {
          const newMember = createTeamMember({
            ...memberData,
            id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            teamId,
          });

          set(state => {
            const existingMembers = state.teamMembers[teamId] || [];

            // Check for duplicate email
            if (existingMembers.some(m => m.email.toLowerCase() === newMember.email.toLowerCase())) {
              return { error: 'A member with this email already exists in the team' };
            }

            const updatedMembers = [...existingMembers, newMember];

            // Update team member count
            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    memberCount: updatedMembers.length,
                    excludedCount: updatedMembers.filter(m => m.isExcluded).length,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: updatedMembers },
              teams: updatedTeams,
              error: null,
            };
          });

          return newMember;
        },

        addBulkMembers: (teamId, emails) => {
          const results = { added: 0, duplicates: 0, invalid: 0 };
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          set(state => {
            const existingMembers = state.teamMembers[teamId] || [];
            const existingEmails = new Set(existingMembers.map(m => m.email.toLowerCase()));
            const newMembers = [...existingMembers];

            emails.forEach(email => {
              const trimmedEmail = email.trim().toLowerCase();

              if (!emailRegex.test(trimmedEmail)) {
                results.invalid++;
                return;
              }

              if (existingEmails.has(trimmedEmail)) {
                results.duplicates++;
                return;
              }

              const newMember = createTeamMember({
                id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                teamId,
                email: trimmedEmail,
                name: trimmedEmail.split('@')[0],
              });

              newMembers.push(newMember);
              existingEmails.add(trimmedEmail);
              results.added++;
            });

            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    memberCount: newMembers.length,
                    excludedCount: newMembers.filter(m => m.isExcluded).length,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: newMembers },
              teams: updatedTeams,
            };
          });

          return results;
        },

        updateTeamMember: (teamId, memberId, updates) => {
          set(state => {
            const members = state.teamMembers[teamId] || [];
            const updatedMembers = members.map(m =>
              m.id === memberId
                ? { ...m, ...updates, updatedAt: new Date().toISOString() }
                : m
            );

            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    excludedCount: updatedMembers.filter(m => m.isExcluded).length,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: updatedMembers },
              teams: updatedTeams,
            };
          });
        },

        removeTeamMember: (teamId, memberId) => {
          set(state => {
            const members = state.teamMembers[teamId] || [];
            const updatedMembers = members.filter(m => m.id !== memberId);

            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    memberCount: updatedMembers.length,
                    excludedCount: updatedMembers.filter(m => m.isExcluded).length,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: updatedMembers },
              teams: updatedTeams,
            };
          });
        },

        toggleMemberExclusion: (teamId, memberId) => {
          set(state => {
            const members = state.teamMembers[teamId] || [];
            const updatedMembers = members.map(m =>
              m.id === memberId
                ? { ...m, isExcluded: !m.isExcluded, updatedAt: new Date().toISOString() }
                : m
            );

            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    excludedCount: updatedMembers.filter(m => m.isExcluded).length,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: updatedMembers },
              teams: updatedTeams,
            };
          });
        },

        excludeAllMembers: (teamId) => {
          set(state => {
            const members = state.teamMembers[teamId] || [];
            const updatedMembers = members.map(m => ({
              ...m,
              isExcluded: true,
              updatedAt: new Date().toISOString(),
            }));

            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    excludedCount: updatedMembers.length,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: updatedMembers },
              teams: updatedTeams,
            };
          });
        },

        includeAllMembers: (teamId) => {
          set(state => {
            const members = state.teamMembers[teamId] || [];
            const updatedMembers = members.map(m => ({
              ...m,
              isExcluded: false,
              updatedAt: new Date().toISOString(),
            }));

            const updatedTeams = state.teams.map(team =>
              team.id === teamId
                ? {
                    ...team,
                    excludedCount: 0,
                    updatedAt: new Date().toISOString(),
                  }
                : team
            );

            return {
              teamMembers: { ...state.teamMembers, [teamId]: updatedMembers },
              teams: updatedTeams,
            };
          });
        },

        // Filtered teams based on search
        getFilteredTeams: () => {
          const { teams, searchQuery } = get();
          if (!searchQuery.trim()) return teams;

          const query = searchQuery.toLowerCase();
          return teams.filter(team =>
            team.name.toLowerCase().includes(query) ||
            team.description.toLowerCase().includes(query)
          );
        },

        // Reset store
        reset: () => set({
          teams: [],
          selectedTeam: null,
          teamMembers: {},
          loading: false,
          error: null,
          searchQuery: '',
        }),
      }),
      {
        name: 'btea-team-storage',
        partialize: (state) => ({
          teams: state.teams,
          teamMembers: state.teamMembers,
        }),
      }
    ),
    { name: 'TeamStore' }
  )
);

export default useTeamStore;

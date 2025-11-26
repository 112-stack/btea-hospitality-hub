/**
 * Email Template Management Store
 * Manages email templates with versioning and approval workflow
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createEmailTemplate,
  createEditorBlock,
  TEMPLATE_STATUS,
  TEMPLATE_CATEGORIES,
  BLOCK_TYPES,
} from '../models/emailTemplateModels';

const useTemplateStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        templates: [],
        selectedTemplate: null,
        editorState: {
          blocks: [],
          activeBlockId: null,
          isDirty: false,
          history: [],
          historyIndex: -1,
        },
        loading: false,
        error: null,
        filters: {
          status: null,
          category: null,
          searchQuery: '',
        },

        // Computed-like getters
        getTemplateById: (id) => get().templates.find(t => t.id === id),

        getTemplatesByStatus: (status) =>
          get().templates.filter(t => t.status === status),

        getTemplatesByCategory: (category) =>
          get().templates.filter(t => t.category === category),

        getApprovedTemplates: () =>
          get().templates.filter(t => t.status === TEMPLATE_STATUS.APPROVED),

        getDraftTemplates: () =>
          get().templates.filter(t => t.status === TEMPLATE_STATUS.DRAFT),

        getPendingReviewTemplates: () =>
          get().templates.filter(t => t.status === TEMPLATE_STATUS.PENDING_REVIEW),

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        setFilters: (filters) => set(state => ({
          filters: { ...state.filters, ...filters },
        })),

        clearFilters: () => set({
          filters: { status: null, category: null, searchQuery: '' },
        }),

        // Template CRUD
        createTemplate: (templateData) => {
          const newTemplate = createEmailTemplate({
            ...templateData,
            id: `template_${Date.now()}`,
            contentJson: { blocks: [] },
          });
          set(state => ({
            templates: [...state.templates, newTemplate],
          }));
          return newTemplate;
        },

        updateTemplate: (id, updates) => {
          set(state => {
            const template = state.templates.find(t => t.id === id);
            if (!template) return state;

            const updatedTemplate = {
              ...template,
              ...updates,
              updatedAt: new Date().toISOString(),
            };

            return {
              templates: state.templates.map(t => t.id === id ? updatedTemplate : t),
              selectedTemplate: state.selectedTemplate?.id === id
                ? updatedTemplate
                : state.selectedTemplate,
            };
          });
        },

        deleteTemplate: (id) => {
          set(state => ({
            templates: state.templates.filter(t => t.id !== id),
            selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
          }));
        },

        duplicateTemplate: (id) => {
          const template = get().getTemplateById(id);
          if (!template) return null;

          const duplicated = createEmailTemplate({
            ...template,
            id: `template_${Date.now()}`,
            name: `${template.name} (Copy)`,
            status: TEMPLATE_STATUS.DRAFT,
            version: 1,
            previousVersions: [],
            approvedBy: null,
          });

          set(state => ({
            templates: [...state.templates, duplicated],
          }));

          return duplicated;
        },

        selectTemplate: (template) => {
          set({
            selectedTemplate: template,
            editorState: {
              blocks: template?.contentJson?.blocks || [],
              activeBlockId: null,
              isDirty: false,
              history: [template?.contentJson?.blocks || []],
              historyIndex: 0,
            },
          });
        },

        clearSelectedTemplate: () => set({
          selectedTemplate: null,
          editorState: {
            blocks: [],
            activeBlockId: null,
            isDirty: false,
            history: [],
            historyIndex: -1,
          },
        }),

        // Template Workflow Actions
        submitForReview: (id) => {
          set(state => ({
            templates: state.templates.map(t =>
              t.id === id
                ? {
                    ...t,
                    status: TEMPLATE_STATUS.PENDING_REVIEW,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          }));
        },

        approveTemplate: (id, approverId) => {
          set(state => ({
            templates: state.templates.map(t =>
              t.id === id
                ? {
                    ...t,
                    status: TEMPLATE_STATUS.APPROVED,
                    approvedBy: approverId,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          }));
        },

        rejectTemplate: (id, reason) => {
          set(state => ({
            templates: state.templates.map(t =>
              t.id === id
                ? {
                    ...t,
                    status: TEMPLATE_STATUS.DRAFT,
                    rejectionReason: reason,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          }));
        },

        archiveTemplate: (id) => {
          set(state => ({
            templates: state.templates.map(t =>
              t.id === id
                ? {
                    ...t,
                    status: TEMPLATE_STATUS.ARCHIVED,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          }));
        },

        restoreTemplate: (id) => {
          set(state => ({
            templates: state.templates.map(t =>
              t.id === id
                ? {
                    ...t,
                    status: TEMPLATE_STATUS.DRAFT,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          }));
        },

        // Version Control
        saveNewVersion: (id) => {
          set(state => {
            const template = state.templates.find(t => t.id === id);
            if (!template) return state;

            const previousVersion = {
              version: template.version,
              contentJson: template.contentJson,
              contentHtml: template.contentHtml,
              savedAt: new Date().toISOString(),
            };

            const updatedTemplate = {
              ...template,
              version: template.version + 1,
              previousVersions: [...template.previousVersions, previousVersion],
              updatedAt: new Date().toISOString(),
            };

            return {
              templates: state.templates.map(t => t.id === id ? updatedTemplate : t),
              selectedTemplate: state.selectedTemplate?.id === id
                ? updatedTemplate
                : state.selectedTemplate,
            };
          });
        },

        restoreVersion: (id, versionIndex) => {
          set(state => {
            const template = state.templates.find(t => t.id === id);
            if (!template || !template.previousVersions[versionIndex]) return state;

            const versionToRestore = template.previousVersions[versionIndex];

            const updatedTemplate = {
              ...template,
              contentJson: versionToRestore.contentJson,
              contentHtml: versionToRestore.contentHtml,
              updatedAt: new Date().toISOString(),
            };

            return {
              templates: state.templates.map(t => t.id === id ? updatedTemplate : t),
              selectedTemplate: state.selectedTemplate?.id === id
                ? updatedTemplate
                : state.selectedTemplate,
              editorState: {
                ...state.editorState,
                blocks: versionToRestore.contentJson.blocks || [],
                isDirty: true,
              },
            };
          });
        },

        // Editor Actions
        addBlock: (type, position = null) => {
          const newBlock = createEditorBlock(type);

          set(state => {
            let newBlocks;
            if (position !== null) {
              newBlocks = [
                ...state.editorState.blocks.slice(0, position),
                newBlock,
                ...state.editorState.blocks.slice(position),
              ];
            } else {
              newBlocks = [...state.editorState.blocks, newBlock];
            }

            const newHistory = [
              ...state.editorState.history.slice(0, state.editorState.historyIndex + 1),
              newBlocks,
            ];

            return {
              editorState: {
                ...state.editorState,
                blocks: newBlocks,
                activeBlockId: newBlock.id,
                isDirty: true,
                history: newHistory,
                historyIndex: newHistory.length - 1,
              },
            };
          });

          return newBlock;
        },

        updateBlock: (blockId, updates) => {
          set(state => {
            const newBlocks = state.editorState.blocks.map(block =>
              block.id === blockId ? { ...block, ...updates } : block
            );

            const newHistory = [
              ...state.editorState.history.slice(0, state.editorState.historyIndex + 1),
              newBlocks,
            ];

            return {
              editorState: {
                ...state.editorState,
                blocks: newBlocks,
                isDirty: true,
                history: newHistory,
                historyIndex: newHistory.length - 1,
              },
            };
          });
        },

        deleteBlock: (blockId) => {
          set(state => {
            const newBlocks = state.editorState.blocks.filter(b => b.id !== blockId);

            const newHistory = [
              ...state.editorState.history.slice(0, state.editorState.historyIndex + 1),
              newBlocks,
            ];

            return {
              editorState: {
                ...state.editorState,
                blocks: newBlocks,
                activeBlockId: state.editorState.activeBlockId === blockId
                  ? null
                  : state.editorState.activeBlockId,
                isDirty: true,
                history: newHistory,
                historyIndex: newHistory.length - 1,
              },
            };
          });
        },

        moveBlock: (blockId, direction) => {
          set(state => {
            const blocks = [...state.editorState.blocks];
            const index = blocks.findIndex(b => b.id === blockId);

            if (index === -1) return state;
            if (direction === 'up' && index === 0) return state;
            if (direction === 'down' && index === blocks.length - 1) return state;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

            const newHistory = [
              ...state.editorState.history.slice(0, state.editorState.historyIndex + 1),
              blocks,
            ];

            return {
              editorState: {
                ...state.editorState,
                blocks,
                isDirty: true,
                history: newHistory,
                historyIndex: newHistory.length - 1,
              },
            };
          });
        },

        duplicateBlock: (blockId) => {
          set(state => {
            const blockIndex = state.editorState.blocks.findIndex(b => b.id === blockId);
            if (blockIndex === -1) return state;

            const blockToDuplicate = state.editorState.blocks[blockIndex];
            const duplicatedBlock = {
              ...blockToDuplicate,
              id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            };

            const newBlocks = [
              ...state.editorState.blocks.slice(0, blockIndex + 1),
              duplicatedBlock,
              ...state.editorState.blocks.slice(blockIndex + 1),
            ];

            const newHistory = [
              ...state.editorState.history.slice(0, state.editorState.historyIndex + 1),
              newBlocks,
            ];

            return {
              editorState: {
                ...state.editorState,
                blocks: newBlocks,
                activeBlockId: duplicatedBlock.id,
                isDirty: true,
                history: newHistory,
                historyIndex: newHistory.length - 1,
              },
            };
          });
        },

        setActiveBlock: (blockId) => {
          set(state => ({
            editorState: {
              ...state.editorState,
              activeBlockId: blockId,
            },
          }));
        },

        clearActiveBlock: () => {
          set(state => ({
            editorState: {
              ...state.editorState,
              activeBlockId: null,
            },
          }));
        },

        // Undo/Redo
        undo: () => {
          set(state => {
            if (state.editorState.historyIndex <= 0) return state;

            const newIndex = state.editorState.historyIndex - 1;

            return {
              editorState: {
                ...state.editorState,
                blocks: state.editorState.history[newIndex],
                historyIndex: newIndex,
                isDirty: true,
              },
            };
          });
        },

        redo: () => {
          set(state => {
            if (state.editorState.historyIndex >= state.editorState.history.length - 1) {
              return state;
            }

            const newIndex = state.editorState.historyIndex + 1;

            return {
              editorState: {
                ...state.editorState,
                blocks: state.editorState.history[newIndex],
                historyIndex: newIndex,
                isDirty: true,
              },
            };
          });
        },

        canUndo: () => get().editorState.historyIndex > 0,
        canRedo: () => get().editorState.historyIndex < get().editorState.history.length - 1,

        // Save editor content to template
        saveEditorContent: () => {
          const { selectedTemplate, editorState } = get();
          if (!selectedTemplate) return;

          // Generate HTML from blocks
          const contentHtml = get().generateHtmlFromBlocks(editorState.blocks);

          set(state => ({
            templates: state.templates.map(t =>
              t.id === selectedTemplate.id
                ? {
                    ...t,
                    contentJson: { blocks: editorState.blocks },
                    contentHtml,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
            selectedTemplate: {
              ...state.selectedTemplate,
              contentJson: { blocks: editorState.blocks },
              contentHtml,
              updatedAt: new Date().toISOString(),
            },
            editorState: {
              ...state.editorState,
              isDirty: false,
            },
          }));
        },

        // HTML Generation from blocks
        generateHtmlFromBlocks: (blocks) => {
          return blocks.map(block => {
            const padding = block.padding
              ? `padding: ${block.padding.top}px ${block.padding.right}px ${block.padding.bottom}px ${block.padding.left}px;`
              : '';

            switch (block.type) {
              case BLOCK_TYPES.TEXT:
                return `<div style="${padding} text-align: ${block.alignment};">${block.content}</div>`;

              case BLOCK_TYPES.HEADING:
                return `<h${block.level} style="${padding} text-align: ${block.alignment};">${block.content}</h${block.level}>`;

              case BLOCK_TYPES.BUTTON:
                return `
                  <div style="${padding} text-align: ${block.alignment};">
                    <a href="${block.url}" style="
                      display: inline-block;
                      background-color: ${block.backgroundColor};
                      color: ${block.textColor};
                      padding: ${block.padding?.top || 12}px ${block.padding?.right || 24}px;
                      border-radius: ${block.borderRadius}px;
                      text-decoration: none;
                      font-weight: bold;
                    ">${block.text}</a>
                  </div>
                `;

              case BLOCK_TYPES.IMAGE:
                const imgTag = `<img src="${block.src}" alt="${block.alt}" style="max-width: ${block.width}; display: block;" />`;
                const wrappedImg = block.linkUrl
                  ? `<a href="${block.linkUrl}">${imgTag}</a>`
                  : imgTag;
                return `<div style="${padding} text-align: ${block.alignment};">${wrappedImg}</div>`;

              case BLOCK_TYPES.DIVIDER:
                return `
                  <div style="${padding}">
                    <hr style="
                      border: none;
                      border-top: ${block.thickness}px ${block.style} ${block.color};
                      width: ${block.width};
                      margin: 0 auto;
                    " />
                  </div>
                `;

              case BLOCK_TYPES.SPACER:
                return `<div style="height: ${block.height}px;"></div>`;

              case BLOCK_TYPES.SOCIAL:
                const socialLinks = block.links
                  .filter(link => link.url)
                  .map(link => `
                    <a href="${link.url}" style="margin: 0 8px; display: inline-block;">
                      <img src="/Content/images/social/${link.platform}.png" alt="${link.platform}" style="width: ${block.iconSize}px; height: ${block.iconSize}px;" />
                    </a>
                  `).join('');
                return `<div style="${padding} text-align: ${block.alignment};">${socialLinks}</div>`;

              default:
                return '';
            }
          }).join('\n');
        },

        // Get filtered templates
        getFilteredTemplates: () => {
          const { templates, filters } = get();
          let filtered = [...templates];

          if (filters.status) {
            filtered = filtered.filter(t => t.status === filters.status);
          }

          if (filters.category) {
            filtered = filtered.filter(t => t.category === filters.category);
          }

          if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
              t.name.toLowerCase().includes(query) ||
              t.description?.toLowerCase().includes(query)
            );
          }

          return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        },

        // Reset store
        reset: () => set({
          templates: [],
          selectedTemplate: null,
          editorState: {
            blocks: [],
            activeBlockId: null,
            isDirty: false,
            history: [],
            historyIndex: -1,
          },
          loading: false,
          error: null,
          filters: {
            status: null,
            category: null,
            searchQuery: '',
          },
        }),
      }),
      {
        name: 'btea-template-storage',
        partialize: (state) => ({
          templates: state.templates,
        }),
      }
    ),
    { name: 'TemplateStore' }
  )
);

export default useTemplateStore;

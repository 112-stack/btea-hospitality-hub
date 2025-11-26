import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Block types available in the editor
export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  IMAGE: 'image',
  BUTTON: 'button',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  SECTION: 'section',
  COLUMNS: 'columns',
  SOCIAL: 'social',
  VIDEO: 'video',
  HTML: 'html',
};

// Template categories
export const TEMPLATE_CATEGORIES = {
  EVENTS: 'Events',
  INTERNAL_NEWS: 'Internal News',
  PUBLIC_CAMPAIGN: 'Public Campaign',
  HOLIDAY: 'Holiday',
  NEWSLETTER: 'Newsletter',
  WELCOME: 'Welcome',
  PROMOTIONAL: 'Promotional',
  ANNOUNCEMENT: 'Announcement',
  INVITATION: 'Invitation',
  SEASONAL: 'Seasonal',
  CORPORATE: 'Corporate',
  SOCIAL: 'Social Media',
};

// Default block styles
export const DEFAULT_STYLES = {
  text: {
    fontSize: '16px',
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#333333',
    lineHeight: '1.5',
    padding: '10px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    padding: '10px',
  },
  paragraph: {
    fontSize: '14px',
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#666666',
    lineHeight: '1.6',
    padding: '10px',
  },
  image: {
    width: '100%',
    maxWidth: '600px',
    alignment: 'center',
    padding: '10px',
    borderRadius: '0px',
  },
  button: {
    backgroundColor: '#815374',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px 24px',
    borderRadius: '4px',
    textAlign: 'center',
    alignment: 'center',
  },
  divider: {
    borderColor: '#e0e0e0',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '10px 0',
  },
  spacer: {
    height: '20px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '0px',
  },
  columns: {
    columns: 2,
    gap: '20px',
    padding: '10px',
  },
};

// Create a new block
export const createBlock = (type, customProps = {}) => {
  const baseBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    styles: { ...DEFAULT_STYLES[type] },
    locked: false,
  };

  switch (type) {
    case BLOCK_TYPES.TEXT:
    case BLOCK_TYPES.PARAGRAPH:
      return { ...baseBlock, content: customProps.content || 'Enter your text here...', ...customProps };
    case BLOCK_TYPES.HEADING:
      return { ...baseBlock, content: customProps.content || 'Heading', level: customProps.level || 2, ...customProps };
    case BLOCK_TYPES.IMAGE:
      return { ...baseBlock, src: customProps.src || '', alt: customProps.alt || 'Image', link: customProps.link || '', ...customProps };
    case BLOCK_TYPES.BUTTON:
      return { ...baseBlock, text: customProps.text || 'Click Here', link: customProps.link || '#', ...customProps };
    case BLOCK_TYPES.DIVIDER:
      return { ...baseBlock, ...customProps };
    case BLOCK_TYPES.SPACER:
      return { ...baseBlock, ...customProps };
    case BLOCK_TYPES.SECTION:
      return { ...baseBlock, children: customProps.children || [], ...customProps };
    case BLOCK_TYPES.COLUMNS:
      return {
        ...baseBlock,
        columns: customProps.columns || [
          { id: `col-${Date.now()}-1`, blocks: [] },
          { id: `col-${Date.now()}-2`, blocks: [] },
        ],
        ...customProps,
      };
    case BLOCK_TYPES.SOCIAL:
      return {
        ...baseBlock,
        platforms: customProps.platforms || [
          { type: 'facebook', url: '', icon: 'facebook' },
          { type: 'twitter', url: '', icon: 'twitter' },
          { type: 'instagram', url: '', icon: 'instagram' },
        ],
        ...customProps,
      };
    case BLOCK_TYPES.VIDEO:
      return { ...baseBlock, videoUrl: customProps.videoUrl || '', thumbnail: customProps.thumbnail || '', ...customProps };
    case BLOCK_TYPES.HTML:
      return { ...baseBlock, htmlContent: customProps.htmlContent || '', ...customProps };
    default:
      return baseBlock;
  }
};

const useTemplateStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Current template being edited
        currentTemplate: null,
        blocks: [],
        selectedBlockId: null,

        // Template library
        templateLibrary: [],
        customTemplates: [],

        // Global template settings
        templateSettings: {
          width: '600px',
          backgroundColor: '#f4f4f4',
          contentBackgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          preheaderText: '',
        },

        // Editor state
        isDragging: false,
        draggedBlock: null,
        isPreviewMode: false,
        previewDevice: 'desktop', // 'desktop' | 'mobile'

        // Undo/Redo history
        history: [],
        historyIndex: -1,
        maxHistoryLength: 50,

        // Brand presets
        brandPresets: {
          primary: '#815374',
          secondary: '#f0bc74',
          accent: '#55d6be',
          text: '#333333',
          lightText: '#666666',
          background: '#ffffff',
          lightBackground: '#f4f4f4',
        },

        // Actions
        setCurrentTemplate: (template) => {
          set({
            currentTemplate: template,
            blocks: template?.blocks || [],
            templateSettings: template?.settings || get().templateSettings,
          });
          get().saveToHistory();
        },

        setBlocks: (blocks) => {
          set({ blocks });
          get().saveToHistory();
        },

        addBlock: (block, index = -1) => {
          set((state) => {
            const newBlocks = [...state.blocks];
            if (index === -1) {
              newBlocks.push(block);
            } else {
              newBlocks.splice(index, 0, block);
            }
            return { blocks: newBlocks };
          });
          get().saveToHistory();
        },

        removeBlock: (blockId) => {
          set((state) => ({
            blocks: state.blocks.filter((b) => b.id !== blockId),
            selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
          }));
          get().saveToHistory();
        },

        updateBlock: (blockId, updates) => {
          set((state) => ({
            blocks: state.blocks.map((block) =>
              block.id === blockId ? { ...block, ...updates } : block
            ),
          }));
          get().saveToHistory();
        },

        updateBlockStyles: (blockId, styles) => {
          set((state) => ({
            blocks: state.blocks.map((block) =>
              block.id === blockId
                ? { ...block, styles: { ...block.styles, ...styles } }
                : block
            ),
          }));
          get().saveToHistory();
        },

        moveBlock: (fromIndex, toIndex) => {
          set((state) => {
            const newBlocks = [...state.blocks];
            const [removed] = newBlocks.splice(fromIndex, 1);
            newBlocks.splice(toIndex, 0, removed);
            return { blocks: newBlocks };
          });
          get().saveToHistory();
        },

        duplicateBlock: (blockId) => {
          const block = get().blocks.find((b) => b.id === blockId);
          if (!block) return;

          const duplicated = {
            ...JSON.parse(JSON.stringify(block)),
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          const index = get().blocks.findIndex((b) => b.id === blockId);
          get().addBlock(duplicated, index + 1);
        },

        selectBlock: (blockId) => {
          set({ selectedBlockId: blockId });
        },

        clearSelection: () => {
          set({ selectedBlockId: null });
        },

        // Column management
        addBlockToColumn: (columnsBlockId, columnIndex, block) => {
          set((state) => ({
            blocks: state.blocks.map((b) => {
              if (b.id === columnsBlockId && b.type === BLOCK_TYPES.COLUMNS) {
                const newColumns = [...b.columns];
                newColumns[columnIndex] = {
                  ...newColumns[columnIndex],
                  blocks: [...newColumns[columnIndex].blocks, block],
                };
                return { ...b, columns: newColumns };
              }
              return b;
            }),
          }));
          get().saveToHistory();
        },

        removeBlockFromColumn: (columnsBlockId, columnIndex, blockId) => {
          set((state) => ({
            blocks: state.blocks.map((b) => {
              if (b.id === columnsBlockId && b.type === BLOCK_TYPES.COLUMNS) {
                const newColumns = [...b.columns];
                newColumns[columnIndex] = {
                  ...newColumns[columnIndex],
                  blocks: newColumns[columnIndex].blocks.filter((cb) => cb.id !== blockId),
                };
                return { ...b, columns: newColumns };
              }
              return b;
            }),
          }));
          get().saveToHistory();
        },

        // Template settings
        updateTemplateSettings: (settings) => {
          set((state) => ({
            templateSettings: { ...state.templateSettings, ...settings },
          }));
          get().saveToHistory();
        },

        // Preview mode
        setPreviewMode: (isPreview) => {
          set({ isPreviewMode: isPreview });
        },

        setPreviewDevice: (device) => {
          set({ previewDevice: device });
        },

        // Drag and drop
        setDragging: (isDragging, block = null) => {
          set({ isDragging, draggedBlock: block });
        },

        // History management (undo/redo)
        saveToHistory: () => {
          set((state) => {
            const snapshot = {
              blocks: JSON.parse(JSON.stringify(state.blocks)),
              templateSettings: JSON.parse(JSON.stringify(state.templateSettings)),
            };

            // Remove any future history if we're not at the end
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(snapshot);

            // Limit history length
            if (newHistory.length > state.maxHistoryLength) {
              newHistory.shift();
            }

            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          });
        },

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            const previousState = history[historyIndex - 1];
            set({
              blocks: previousState.blocks,
              templateSettings: previousState.templateSettings,
              historyIndex: historyIndex - 1,
            });
          }
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            set({
              blocks: nextState.blocks,
              templateSettings: nextState.templateSettings,
              historyIndex: historyIndex + 1,
            });
          }
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        // Template library management
        setTemplateLibrary: (templates) => {
          set({ templateLibrary: templates });
        },

        addCustomTemplate: (template) => {
          const newTemplate = {
            ...template,
            id: `custom-template-${Date.now()}`,
            isCustom: true,
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            customTemplates: [...state.customTemplates, newTemplate],
          }));
          return newTemplate;
        },

        deleteCustomTemplate: (templateId) => {
          set((state) => ({
            customTemplates: state.customTemplates.filter((t) => t.id !== templateId),
          }));
        },

        // Save current work as template
        saveAsTemplate: (name, category, description = '') => {
          const { blocks, templateSettings } = get();
          const template = {
            id: `custom-template-${Date.now()}`,
            name,
            category,
            description,
            blocks: JSON.parse(JSON.stringify(blocks)),
            settings: JSON.parse(JSON.stringify(templateSettings)),
            isCustom: true,
            createdAt: new Date().toISOString(),
            thumbnail: null,
          };

          set((state) => ({
            customTemplates: [...state.customTemplates, template],
          }));

          return template;
        },

        // Load template into editor
        loadTemplate: (template) => {
          set({
            currentTemplate: template,
            blocks: JSON.parse(JSON.stringify(template.blocks || [])),
            templateSettings: { ...get().templateSettings, ...template.settings },
            selectedBlockId: null,
            history: [],
            historyIndex: -1,
          });
          get().saveToHistory();
        },

        // Update brand presets
        updateBrandPresets: (presets) => {
          set((state) => ({
            brandPresets: { ...state.brandPresets, ...presets },
          }));
        },

        // Get template as JSON
        getTemplateJson: () => {
          const { blocks, templateSettings, currentTemplate } = get();
          return {
            id: currentTemplate?.id || `template-${Date.now()}`,
            name: currentTemplate?.name || 'Untitled Template',
            blocks,
            settings: templateSettings,
            exportedAt: new Date().toISOString(),
          };
        },

        // Clear editor
        clearEditor: () => {
          set({
            currentTemplate: null,
            blocks: [],
            selectedBlockId: null,
            history: [],
            historyIndex: -1,
          });
        },

        // Reset store
        reset: () => {
          set({
            currentTemplate: null,
            blocks: [],
            selectedBlockId: null,
            templateLibrary: [],
            templateSettings: {
              width: '600px',
              backgroundColor: '#f4f4f4',
              contentBackgroundColor: '#ffffff',
              fontFamily: 'Arial, sans-serif',
              preheaderText: '',
            },
            isDragging: false,
            draggedBlock: null,
            isPreviewMode: false,
            previewDevice: 'desktop',
            history: [],
            historyIndex: -1,
          });
        },
      }),
      {
        name: 'btea-template-storage',
        partialize: (state) => ({
          customTemplates: state.customTemplates,
          brandPresets: state.brandPresets,
        }),
      }
    ),
    { name: 'BTEA Template Store' }
  )
);

export default useTemplateStore;

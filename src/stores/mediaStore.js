/**
 * Media Library Store
 * Manages media assets (images) for email templates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createMediaAsset,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MEDIA_TYPES,
} from '../models/emailTemplateModels';

const useMediaStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        assets: [],
        selectedAsset: null,
        uploading: false,
        uploadProgress: 0,
        loading: false,
        error: null,
        filters: {
          type: null,
          searchQuery: '',
          tags: [],
        },
        isLibraryOpen: false,
        selectionCallback: null, // Callback when image is selected for insertion

        // Computed-like getters
        getAssetById: (id) => get().assets.find(a => a.id === id),

        getAssetsByType: (type) => get().assets.filter(a => a.type === type),

        getImages: () => get().assets.filter(a => a.type === MEDIA_TYPES.IMAGE),

        getRecentAssets: (limit = 10) => {
          return [...get().assets]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
        },

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        setFilters: (filters) => set(state => ({
          filters: { ...state.filters, ...filters },
        })),

        clearFilters: () => set({
          filters: { type: null, searchQuery: '', tags: [] },
        }),

        // Media Library Modal
        openLibrary: (callback = null) => set({
          isLibraryOpen: true,
          selectionCallback: callback,
        }),

        closeLibrary: () => set({
          isLibraryOpen: false,
          selectionCallback: null,
          selectedAsset: null,
        }),

        selectAsset: (asset) => set({ selectedAsset: asset }),

        confirmSelection: () => {
          const { selectedAsset, selectionCallback } = get();
          if (selectedAsset && selectionCallback) {
            selectionCallback(selectedAsset);
          }
          set({
            isLibraryOpen: false,
            selectionCallback: null,
            selectedAsset: null,
          });
        },

        // File Validation
        validateFile: (file) => {
          const errors = [];

          if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            errors.push(`Invalid file type. Allowed types: JPEG, PNG, GIF, WebP`);
          }

          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            errors.push(`File size exceeds maximum of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`);
          }

          return {
            isValid: errors.length === 0,
            errors,
          };
        },

        // Upload Simulation (in real app, this would call an API)
        uploadFile: async (file, tags = []) => {
          const validation = get().validateFile(file);
          if (!validation.isValid) {
            set({ error: validation.errors.join(', ') });
            return null;
          }

          set({ uploading: true, uploadProgress: 0, error: null });

          try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
              await new Promise(resolve => setTimeout(resolve, 100));
              set({ uploadProgress: i });
            }

            // Create a local URL for the file (in production, this would be a server URL)
            const url = URL.createObjectURL(file);

            // Get image dimensions
            let width = null;
            let height = null;

            if (file.type.startsWith('image/')) {
              const dimensions = await get().getImageDimensions(file);
              width = dimensions.width;
              height = dimensions.height;
            }

            const newAsset = createMediaAsset({
              id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              fileName: `${Date.now()}_${file.name}`,
              originalName: file.name,
              url,
              type: file.type.startsWith('image/') ? MEDIA_TYPES.IMAGE : MEDIA_TYPES.DOCUMENT,
              mimeType: file.type,
              size: file.size,
              width,
              height,
              tags,
            });

            set(state => ({
              assets: [newAsset, ...state.assets],
              uploading: false,
              uploadProgress: 0,
            }));

            return newAsset;
          } catch (error) {
            set({
              error: 'Failed to upload file. Please try again.',
              uploading: false,
              uploadProgress: 0,
            });
            return null;
          }
        },

        // Upload multiple files
        uploadMultipleFiles: async (files, tags = []) => {
          const results = [];

          for (const file of files) {
            const result = await get().uploadFile(file, tags);
            if (result) {
              results.push(result);
            }
          }

          return results;
        },

        // Get image dimensions
        getImageDimensions: (file) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
              URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
              resolve({ width: null, height: null });
              URL.revokeObjectURL(img.src);
            };
            img.src = URL.createObjectURL(file);
          });
        },

        // Update asset metadata
        updateAsset: (id, updates) => {
          set(state => ({
            assets: state.assets.map(asset =>
              asset.id === id
                ? { ...asset, ...updates }
                : asset
            ),
            selectedAsset: state.selectedAsset?.id === id
              ? { ...state.selectedAsset, ...updates }
              : state.selectedAsset,
          }));
        },

        // Add tags to asset
        addTags: (id, newTags) => {
          set(state => ({
            assets: state.assets.map(asset =>
              asset.id === id
                ? { ...asset, tags: [...new Set([...asset.tags, ...newTags])] }
                : asset
            ),
          }));
        },

        // Remove tag from asset
        removeTag: (id, tagToRemove) => {
          set(state => ({
            assets: state.assets.map(asset =>
              asset.id === id
                ? { ...asset, tags: asset.tags.filter(t => t !== tagToRemove) }
                : asset
            ),
          }));
        },

        // Delete asset
        deleteAsset: (id) => {
          const asset = get().getAssetById(id);
          if (asset?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(asset.url);
          }

          set(state => ({
            assets: state.assets.filter(a => a.id !== id),
            selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
          }));
        },

        // Bulk delete assets
        deleteAssets: (ids) => {
          const assets = get().assets.filter(a => ids.includes(a.id));
          assets.forEach(asset => {
            if (asset.url?.startsWith('blob:')) {
              URL.revokeObjectURL(asset.url);
            }
          });

          set(state => ({
            assets: state.assets.filter(a => !ids.includes(a.id)),
            selectedAsset: ids.includes(state.selectedAsset?.id) ? null : state.selectedAsset,
          }));
        },

        // Get all unique tags
        getAllTags: () => {
          const allTags = get().assets.flatMap(a => a.tags);
          return [...new Set(allTags)].sort();
        },

        // Get filtered assets
        getFilteredAssets: () => {
          const { assets, filters } = get();
          let filtered = [...assets];

          if (filters.type) {
            filtered = filtered.filter(a => a.type === filters.type);
          }

          if (filters.tags.length > 0) {
            filtered = filtered.filter(a =>
              filters.tags.some(tag => a.tags.includes(tag))
            );
          }

          if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
              a.originalName.toLowerCase().includes(query) ||
              a.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }

          return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        // Format file size for display
        formatFileSize: (bytes) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        // Reset store
        reset: () => {
          // Revoke all blob URLs
          get().assets.forEach(asset => {
            if (asset.url?.startsWith('blob:')) {
              URL.revokeObjectURL(asset.url);
            }
          });

          set({
            assets: [],
            selectedAsset: null,
            uploading: false,
            uploadProgress: 0,
            loading: false,
            error: null,
            filters: {
              type: null,
              searchQuery: '',
              tags: [],
            },
            isLibraryOpen: false,
            selectionCallback: null,
          });
        },
      }),
      {
        name: 'btea-media-storage',
        partialize: (state) => ({
          // Note: In a real app, we wouldn't store blob URLs
          // This is just for demo purposes
          assets: state.assets.map(a => ({
            ...a,
            // Don't persist blob URLs
            url: a.url?.startsWith('blob:') ? '' : a.url,
          })),
        }),
      }
    ),
    { name: 'MediaStore' }
  )
);

export default useMediaStore;

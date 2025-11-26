/**
 * Media Library Component
 * Upload and manage media assets for email templates
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiImage,
  FiUpload,
  FiSearch,
  FiGrid,
  FiList,
  FiTrash2,
  FiTag,
  FiX,
  FiCheck,
  FiZoomIn,
  FiDownload,
  FiPlus,
} from 'react-icons/fi';
import useMediaStore from '../../stores/mediaStore';
import { format } from 'date-fns';

// Main Media Library Page Component
const MediaLibraryPage = () => {
  const {
    getFilteredAssets,
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    deleteAsset,
    filters,
    setFilters,
    clearFilters,
    getAllTags,
    formatFileSize,
  } = useMediaStore();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [previewAsset, setPreviewAsset] = useState(null);
  const fileInputRef = useRef(null);

  const assets = getFilteredAssets();
  const allTags = getAllTags();

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadMultipleFiles(files);
    }
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length > 0) {
      await uploadMultipleFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const toggleAssetSelection = (assetId) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleDeleteSelected = () => {
    if (
      window.confirm(`Delete ${selectedAssets.length} selected assets? This cannot be undone.`)
    ) {
      selectedAssets.forEach((id) => deleteAsset(id));
      setSelectedAssets([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload and manage images for your email templates
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-btea flex items-center gap-2"
        >
          <FiUpload className="w-5 h-5" />
          Upload Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          uploading
            ? 'border-btea-primary bg-btea-primary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-btea-primary hover:bg-btea-primary/5'
        }`}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-btea-primary/30 border-t-btea-primary rounded-full animate-spin" />
            <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-btea-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <>
            <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop images here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-btea-primary hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports: JPEG, PNG, GIF, WebP (Max 5MB)
            </p>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename or tags..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {allTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setFilters({
                    tags: filters.tags.includes(tag)
                      ? filters.tags.filter((t) => t !== tag)
                      : [...filters.tags, tag],
                  })
                }
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filters.tags.includes(tag)
                    ? 'bg-btea-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiTag className="w-3 h-3 inline-block mr-1" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-btea-primary/10 rounded-lg">
          <span className="text-sm font-medium text-btea-primary">
            {selectedAssets.length} selected
          </span>
          <button
            onClick={() => setSelectedAssets([])}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear selection
          </button>
          <button
            onClick={handleDeleteSelected}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete selected
          </button>
        </div>
      )}

      {/* Assets Grid/List */}
      {assets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FiImage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filters.searchQuery || filters.tags.length > 0
              ? 'No images found'
              : 'No images uploaded yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filters.searchQuery || filters.tags.length > 0
              ? 'Try adjusting your search or filters'
              : 'Upload some images to get started'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square cursor-pointer ${
                selectedAssets.includes(asset.id)
                  ? 'ring-2 ring-btea-primary'
                  : ''
              }`}
              onClick={() => toggleAssetSelection(asset.id)}
              onDoubleClick={() => setPreviewAsset(asset)}
            >
              <img
                src={asset.url}
                alt={asset.originalName}
                className="w-full h-full object-cover"
              />

              {/* Selection Checkbox */}
              <div
                className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-colors ${
                  selectedAssets.includes(asset.id)
                    ? 'bg-btea-primary border-btea-primary'
                    : 'border-white/80 group-hover:border-btea-primary bg-black/20'
                }`}
              >
                {selectedAssets.includes(asset.id) && (
                  <FiCheck className="w-full h-full p-1 text-white" />
                )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewAsset(asset);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                >
                  <FiZoomIn className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this image?')) {
                      deleteAsset(asset.id);
                    }
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-red-50"
                >
                  <FiTrash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
                <p className="text-white text-xs truncate">{asset.originalName}</p>
                <p className="text-white/70 text-xs">{formatFileSize(asset.size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === assets.length}
                    onChange={(e) =>
                      setSelectedAssets(e.target.checked ? assets.map((a) => a.id) : [])
                    }
                    className="rounded"
                  />
                </th>
                <th className="w-16 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Dimensions
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Uploaded
                </th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => toggleAssetSelection(asset.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={asset.url}
                      alt={asset.originalName}
                      className="w-10 h-10 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {asset.originalName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(asset.size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {asset.width && asset.height
                      ? `${asset.width} × ${asset.height}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(asset.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <FiZoomIn className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this image?')) {
                            deleteAsset(asset.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewAsset(null)}
          >
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg"
            >
              <FiX className="w-6 h-6 text-white" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewAsset.url}
                alt={previewAsset.originalName}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center text-white">
                <p className="font-medium">{previewAsset.originalName}</p>
                <p className="text-sm text-gray-400">
                  {previewAsset.width && previewAsset.height
                    ? `${previewAsset.width} × ${previewAsset.height} • `
                    : ''}
                  {formatFileSize(previewAsset.size)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Media Library Modal (for selecting images in the editor)
export const MediaLibraryModal = ({ isOpen, onClose, onSelect }) => {
  const {
    getFilteredAssets,
    uploading,
    uploadProgress,
    uploadFile,
    selectedAsset,
    selectAsset,
    confirmSelection,
    filters,
    setFilters,
    formatFileSize,
  } = useMediaStore();

  const fileInputRef = useRef(null);
  const assets = getFilteredAssets();

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const uploaded = await uploadFile(files[0]);
      if (uploaded) {
        selectAsset(uploaded);
      }
    }
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Image
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Upload & Search */}
          <div className="flex gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-btea-outline flex items-center gap-2"
            >
              <FiUpload className="w-4 h-4" />
              Upload New
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Images Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {uploading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto border-4 border-btea-primary/30 border-t-btea-primary rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Uploading... {uploadProgress}%</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <FiImage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {filters.searchQuery ? 'No images found' : 'No images uploaded yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => selectAsset(asset)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                      selectedAsset?.id === asset.id
                        ? 'ring-2 ring-btea-primary'
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt={asset.originalName}
                      className="w-full h-full object-cover"
                    />
                    {selectedAsset?.id === asset.id && (
                      <div className="absolute inset-0 bg-btea-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-btea-primary rounded-full flex items-center justify-center">
                          <FiCheck className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            {selectedAsset ? (
              <div className="flex items-center gap-3">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.originalName}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedAsset.originalName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatFileSize(selectedAsset.size)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select an image to insert
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedAsset}
                className="btn-btea disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Image
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaLibraryPage;

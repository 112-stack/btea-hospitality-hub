/**
 * Template Editor Component
 * WYSIWYG block-based email template editor
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiUndo,
  FiRedo,
  FiPlus,
  FiType,
  FiImage,
  FiMinus,
  FiSquare,
  FiLink,
  FiColumns,
  FiShare2,
  FiTrash2,
  FiCopy,
  FiChevronUp,
  FiChevronDown,
  FiSettings,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiX,
} from 'react-icons/fi';
import useTemplateStore from '../../stores/templateStore';
import useMediaStore from '../../stores/mediaStore';
import {
  BLOCK_TYPES,
  BLOCK_TYPE_LABELS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
  MERGE_FIELDS,
} from '../../models/emailTemplateModels';

const TemplateEditor = ({ template, onClose, onPreview }) => {
  const {
    createTemplate,
    updateTemplate,
    selectTemplate,
    editorState,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    setActiveBlock,
    clearActiveBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    saveEditorContent,
  } = useTemplateStore();

  const { openLibrary } = useMediaStore();

  const isEditing = !!template;
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [templateInfo, setTemplateInfo] = useState({
    name: '',
    description: '',
    category: TEMPLATE_CATEGORIES.LOWKEY,
    previewText: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (template) {
      setTemplateInfo({
        name: template.name,
        description: template.description || '',
        category: template.category,
        previewText: template.previewText || '',
      });
      selectTemplate(template);
    }
  }, [template]);

  useEffect(() => {
    setHasChanges(editorState.isDirty || !isEditing);
  }, [editorState.isDirty, isEditing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSave = async () => {
    if (!templateInfo.name.trim()) {
      setShowSettings(true);
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing) {
        updateTemplate(template.id, {
          ...templateInfo,
          contentJson: { blocks: editorState.blocks },
        });
        saveEditorContent();
      } else {
        const newTemplate = createTemplate({
          ...templateInfo,
          contentJson: { blocks: editorState.blocks },
        });
        selectTemplate(newTemplate);
      }
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = (type) => {
    addBlock(type);
    setShowBlockPicker(false);
  };

  const handleImageSelect = (blockId) => {
    openLibrary((asset) => {
      updateBlock(blockId, { src: asset.url, alt: asset.originalName });
    });
  };

  const insertMergeField = (blockId, field) => {
    const block = editorState.blocks.find((b) => b.id === blockId);
    if (block && block.type === BLOCK_TYPES.TEXT) {
      updateBlock(blockId, { content: block.content + field.key });
    }
  };

  const blockIcons = {
    [BLOCK_TYPES.TEXT]: FiType,
    [BLOCK_TYPES.HEADING]: FiType,
    [BLOCK_TYPES.BUTTON]: FiSquare,
    [BLOCK_TYPES.IMAGE]: FiImage,
    [BLOCK_TYPES.DIVIDER]: FiMinus,
    [BLOCK_TYPES.SPACER]: FiSquare,
    [BLOCK_TYPES.COLUMNS]: FiColumns,
    [BLOCK_TYPES.SOCIAL]: FiShare2,
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (hasChanges && !window.confirm('You have unsaved changes. Leave anyway?')) {
                  return;
                }
                onClose();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                {templateInfo.name || 'Untitled Template'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing ? 'Editing template' : 'Creating new template'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <FiUndo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <FiRedo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Template Settings"
            >
              <FiSettings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={() => onPreview(template)}
              className="btn-btea-outline flex items-center gap-2"
            >
              <FiEye className="w-4 h-4" />
              Preview
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-btea flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette (Sidebar) */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto hidden lg:block">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Add Blocks</h3>
          <div className="space-y-2">
            {Object.entries(BLOCK_TYPE_LABELS).map(([type, label]) => {
              const Icon = blockIcons[type] || FiSquare;
              return (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors group"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-btea-primary/10 transition-colors">
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-btea-primary" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Merge Fields</h3>
            <div className="space-y-1 text-xs">
              {MERGE_FIELDS.slice(0, 6).map((field) => (
                <div
                  key={field.key}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded font-mono text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  title={field.description}
                  onClick={() => {
                    navigator.clipboard.writeText(field.key);
                  }}
                >
                  {field.key}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Email Preview Frame */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Email Header Preview */}
              <div className="bg-btea-primary p-4 text-center">
                <img
                  src="/Content/images/btea-logo.png"
                  alt="BTEA Logo"
                  className="h-12 mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16">BTEA</text></svg>';
                  }}
                />
              </div>

              {/* Blocks Container */}
              <div className="p-6 min-h-[400px]">
                {editorState.blocks.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-btea-primary hover:bg-btea-primary/5 transition-colors"
                    onClick={() => setShowBlockPicker(true)}
                  >
                    <FiPlus className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Click to add your first block
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editorState.blocks.map((block, index) => (
                      <BlockEditor
                        key={block.id}
                        block={block}
                        isActive={editorState.activeBlockId === block.id}
                        onSelect={() => setActiveBlock(block.id)}
                        onUpdate={(updates) => updateBlock(block.id, updates)}
                        onDelete={() => deleteBlock(block.id)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onMoveUp={() => moveBlock(block.id, 'up')}
                        onMoveDown={() => moveBlock(block.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < editorState.blocks.length - 1}
                        onImageSelect={() => handleImageSelect(block.id)}
                      />
                    ))}

                    {/* Add Block Button */}
                    <button
                      onClick={() => setShowBlockPicker(true)}
                      className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-btea-primary hover:text-btea-primary hover:bg-btea-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-5 h-5" />
                      Add Block
                    </button>
                  </div>
                )}
              </div>

              {/* Email Footer Preview */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>Bahrain Tourism and Exhibitions Authority</p>
                <p className="mt-1">Kingdom of Bahrain</p>
                <p className="mt-2">
                  <a href="#" className="text-btea-primary hover:underline">
                    Unsubscribe
                  </a>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Block Properties Panel */}
        {editorState.activeBlockId && (
          <aside className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto hidden xl:block">
            <BlockProperties
              block={editorState.blocks.find((b) => b.id === editorState.activeBlockId)}
              onUpdate={(updates) => updateBlock(editorState.activeBlockId, updates)}
              onClose={clearActiveBlock}
              onImageSelect={() => handleImageSelect(editorState.activeBlockId)}
            />
          </aside>
        )}
      </div>

      {/* Block Picker Modal */}
      <AnimatePresence>
        {showBlockPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Block
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(BLOCK_TYPE_LABELS).map(([type, label]) => {
                  const Icon = blockIcons[type] || FiSquare;
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddBlock(type)}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-btea-primary hover:bg-btea-primary/5 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-btea-primary" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Template Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateInfo.name}
                    onChange={(e) =>
                      setTemplateInfo({ ...templateInfo, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    placeholder="e.g., Monthly Newsletter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={templateInfo.description}
                    onChange={(e) =>
                      setTemplateInfo({ ...templateInfo, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none"
                    placeholder="Brief description of this template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={templateInfo.category}
                    onChange={(e) =>
                      setTemplateInfo({ ...templateInfo, category: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preview Text
                  </label>
                  <input
                    type="text"
                    value={templateInfo.previewText}
                    onChange={(e) =>
                      setTemplateInfo({ ...templateInfo, previewText: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    placeholder="Text shown in email preview"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This text appears in email clients next to the subject line
                  </p>
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full btn-btea"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Block Editor Component
const BlockEditor = ({
  block,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onImageSelect,
}) => {
  const renderBlockContent = () => {
    switch (block.type) {
      case BLOCK_TYPES.TEXT:
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ content: e.target.innerHTML })}
            className="prose prose-sm max-w-none dark:prose-invert outline-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
            style={{ textAlign: block.alignment }}
          />
        );

      case BLOCK_TYPES.HEADING:
        const HeadingTag = `h${block.level}`;
        return (
          <HeadingTag
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ content: e.target.textContent })}
            className="outline-none font-bold"
            style={{ textAlign: block.alignment }}
          >
            {block.content}
          </HeadingTag>
        );

      case BLOCK_TYPES.BUTTON:
        return (
          <div style={{ textAlign: block.alignment }}>
            <span
              className="inline-block px-6 py-3 rounded font-medium cursor-pointer"
              style={{
                backgroundColor: block.backgroundColor,
                color: block.textColor,
                borderRadius: `${block.borderRadius}px`,
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate({ text: e.target.textContent })}
            >
              {block.text}
            </span>
          </div>
        );

      case BLOCK_TYPES.IMAGE:
        return (
          <div style={{ textAlign: block.alignment }}>
            {block.src ? (
              <img
                src={block.src}
                alt={block.alt}
                className="max-w-full inline-block cursor-pointer"
                style={{ width: block.width }}
                onClick={onImageSelect}
              />
            ) : (
              <button
                onClick={onImageSelect}
                className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-btea-primary transition-colors"
              >
                <FiImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to add image</span>
              </button>
            )}
          </div>
        );

      case BLOCK_TYPES.DIVIDER:
        return (
          <hr
            style={{
              border: 'none',
              borderTop: `${block.thickness}px ${block.style} ${block.color}`,
              width: block.width,
              margin: '0 auto',
            }}
          />
        );

      case BLOCK_TYPES.SPACER:
        return <div style={{ height: `${block.height}px` }} className="bg-gray-50 dark:bg-gray-700/30" />;

      case BLOCK_TYPES.SOCIAL:
        return (
          <div style={{ textAlign: block.alignment }} className="flex gap-2 justify-center">
            {block.links.map((link, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center"
              >
                <FiShare2 className="w-4 h-4 text-gray-500" />
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-gray-400">Unknown block type</div>;
    }
  };

  return (
    <div
      className={`relative group rounded-lg transition-all ${
        isActive
          ? 'ring-2 ring-btea-primary'
          : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div
        className={`absolute -top-10 left-0 right-0 flex items-center justify-between bg-gray-800 text-white text-xs rounded-t-lg px-2 py-1 transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <span className="font-medium">{BLOCK_TYPE_LABELS[block.type]}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
          >
            <FiChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
          >
            <FiChevronDown className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <FiCopy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-600 rounded"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div
        className="p-4"
        style={{
          paddingTop: block.padding?.top || 10,
          paddingRight: block.padding?.right || 20,
          paddingBottom: block.padding?.bottom || 10,
          paddingLeft: block.padding?.left || 20,
        }}
      >
        {renderBlockContent()}
      </div>
    </div>
  );
};

// Block Properties Panel Component
const BlockProperties = ({ block, onUpdate, onClose, onImageSelect }) => {
  if (!block) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {BLOCK_TYPE_LABELS[block.type]} Properties
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Alignment */}
      {block.alignment !== undefined && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Alignment
          </label>
          <div className="flex gap-1">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => onUpdate({ alignment: align })}
                className={`flex-1 p-2 rounded ${
                  block.alignment === align
                    ? 'bg-btea-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {align === 'left' && <FiAlignLeft className="w-4 h-4 mx-auto" />}
                {align === 'center' && <FiAlignCenter className="w-4 h-4 mx-auto" />}
                {align === 'right' && <FiAlignRight className="w-4 h-4 mx-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Heading Level */}
      {block.type === BLOCK_TYPES.HEADING && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Heading Level
          </label>
          <select
            value={block.level}
            onChange={(e) => onUpdate({ level: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={level} value={level}>
                Heading {level}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Button Properties */}
      {block.type === BLOCK_TYPES.BUTTON && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Button URL
            </label>
            <input
              type="url"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={block.backgroundColor}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 rounded border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Text Color
            </label>
            <input
              type="color"
              value={block.textColor}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              className="w-full h-10 rounded border border-gray-200 dark:border-gray-600"
            />
          </div>
        </>
      )}

      {/* Image Properties */}
      {block.type === BLOCK_TYPES.IMAGE && (
        <>
          <button
            onClick={onImageSelect}
            className="w-full btn-btea-outline text-sm"
          >
            <FiImage className="w-4 h-4 mr-2" />
            {block.src ? 'Change Image' : 'Select Image'}
          </button>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={block.alt}
              onChange={(e) => onUpdate({ alt: e.target.value })}
              className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              placeholder="Image description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Link URL (optional)
            </label>
            <input
              type="url"
              value={block.linkUrl}
              onChange={(e) => onUpdate({ linkUrl: e.target.value })}
              className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {/* Spacer Height */}
      {block.type === BLOCK_TYPES.SPACER && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Height: {block.height}px
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={block.height}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      {/* Divider Properties */}
      {block.type === BLOCK_TYPES.DIVIDER && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Style
            </label>
            <select
              value={block.style}
              onChange={(e) => onUpdate({ style: e.target.value })}
              className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Color
            </label>
            <input
              type="color"
              value={block.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-10 rounded border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Thickness: {block.thickness}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={block.thickness}
              onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateEditor;

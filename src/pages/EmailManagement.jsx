/**
 * Email Management Page
 * Main page for the Email Template Management System
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail,
  FiFileText,
  FiUsers,
  FiImage,
  FiSettings,
  FiSend,
  FiMenu,
  FiX,
  FiHome,
  FiChevronLeft,
} from 'react-icons/fi';

// Components
import TeamList from '../components/email/TeamList';
import TemplateList from '../components/email/TemplateList';
import TemplateEditor from '../components/email/TemplateEditor';
import MediaLibraryPage, { MediaLibraryModal } from '../components/email/MediaLibrary';
import CampaignList from '../components/email/CampaignList';
import CampaignEditor from '../components/email/CampaignEditor';
import AdminPanel from '../components/email/AdminPanel';

// Stores
import useMediaStore from '../stores/mediaStore';

const EmailManagement = () => {
  // Navigation state
  const [activeSection, setActiveSection] = useState('campaigns');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Editor states
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Media library modal
  const { isLibraryOpen, closeLibrary, confirmSelection } = useMediaStore();

  const navItems = [
    { id: 'campaigns', label: 'Campaigns', icon: FiSend },
    { id: 'templates', label: 'Templates', icon: FiFileText },
    { id: 'teams', label: 'Teams', icon: FiUsers },
    { id: 'media', label: 'Media Library', icon: FiImage },
    { id: 'admin', label: 'Settings', icon: FiSettings },
  ];

  // Template handlers
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsEditingTemplate(true);
  };

  const handlePreviewTemplate = (template) => {
    // Could open a preview modal
    console.log('Preview template:', template);
  };

  const handleCreateCampaignFromTemplate = (template) => {
    setSelectedCampaign(null);
    setSelectedTemplate(template);
    setActiveSection('campaigns');
    setIsEditingCampaign(true);
  };

  // Campaign handlers
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditingCampaign(true);
  };

  const handlePreviewCampaign = (campaign) => {
    console.log('Preview campaign:', campaign);
  };

  const handleViewCampaignStats = (campaign) => {
    console.log('View stats:', campaign);
  };

  // If editing template, show full-screen editor
  if (isEditingTemplate) {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onClose={() => {
          setIsEditingTemplate(false);
          setSelectedTemplate(null);
        }}
        onPreview={handlePreviewTemplate}
      />
    );
  }

  // If editing campaign, show full-screen editor
  if (isEditingCampaign) {
    return (
      <CampaignEditor
        campaign={selectedCampaign}
        onClose={() => {
          setIsEditingCampaign(false);
          setSelectedCampaign(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <FiMail className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-white">Email Hub</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Template Management</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-btea-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <a
              href="/"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-btea-primary rounded-lg transition-colors"
            >
              <FiHome className="w-5 h-5" />
              {sidebarOpen && <span>Back to Dashboard</span>}
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
              >
                {sidebarOpen ? (
                  <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <FiMenu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiChevronLeft
                  className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
                    sidebarOpen ? '' : 'rotate-180'
                  }`}
                />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {activeSection === 'admin' ? 'Settings' : activeSection}
                </h2>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'campaigns' && (
                <CampaignList
                  onEdit={handleEditCampaign}
                  onPreview={handlePreviewCampaign}
                  onViewStats={handleViewCampaignStats}
                />
              )}

              {activeSection === 'templates' && (
                <TemplateList
                  onEdit={handleEditTemplate}
                  onPreview={handlePreviewTemplate}
                  onCreateCampaign={handleCreateCampaignFromTemplate}
                />
              )}

              {activeSection === 'teams' && <TeamList />}

              {activeSection === 'media' && <MediaLibraryPage />}

              {activeSection === 'admin' && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Media Library Modal (for editor integration) */}
      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={closeLibrary}
        onSelect={confirmSelection}
      />
    </div>
  );
};

export default EmailManagement;

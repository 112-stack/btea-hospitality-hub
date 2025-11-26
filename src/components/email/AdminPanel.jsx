/**
 * Admin Panel Component
 * Settings, branding, and audit logs for the email system
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSettings,
  FiImage,
  FiClipboard,
  FiShield,
  FiMail,
  FiSave,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiClock,
  FiUser,
  FiActivity,
  FiAlertCircle,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import useAdminStore from '../../stores/adminStore';
import { format } from 'date-fns';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'settings' | 'audit'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure branding, settings, and view audit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'branding'
              ? 'border-btea-primary text-btea-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiImage className="w-4 h-4 inline-block mr-2" />
          Branding
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-btea-primary text-btea-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiSettings className="w-4 h-4 inline-block mr-2" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-btea-primary text-btea-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiClipboard className="w-4 h-4 inline-block mr-2" />
          Audit Log
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'branding' && <BrandingSettings />}
      {activeTab === 'settings' && <EmailSettings />}
      {activeTab === 'audit' && <AuditLog />}
    </div>
  );
};

// Branding Settings Component
const BrandingSettings = () => {
  const { branding, updateBranding, resetBranding } = useAdminStore();
  const [localBranding, setLocalBranding] = useState({ ...branding });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setLocalBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateBranding(localBranding);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset branding to defaults? This cannot be undone.')) {
      resetBranding();
      setLocalBranding({ ...branding });
    }
  };

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Brand Colors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={localBranding.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={localBranding.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={localBranding.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={localBranding.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={localBranding.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={localBranding.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Logo
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo URL
          </label>
          <input
            type="text"
            value={localBranding.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            placeholder="/Content/images/logo.png"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
          {localBranding.logoUrl && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img
                src={localBranding.logoUrl}
                alt="Logo preview"
                className="max-h-16"
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23815374" font-size="14">Logo</text></svg>';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Header HTML */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Header HTML
        </h3>
        <textarea
          value={localBranding.headerHtml}
          onChange={(e) => handleChange('headerHtml', e.target.value)}
          rows={6}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">
          This HTML will be included at the top of all professional templates
        </p>
      </div>

      {/* Footer HTML */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Footer HTML
        </h3>
        <textarea
          value={localBranding.footerHtml}
          onChange={(e) => handleChange('footerHtml', e.target.value)}
          rows={6}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">
          This HTML will be included at the bottom of all emails. Include {'{{unsubscribe_link}}'} for
          the unsubscribe link.
        </p>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Legal Disclaimer
        </h3>
        <textarea
          value={localBranding.legalDisclaimer}
          onChange={(e) => handleChange('legalDisclaimer', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Reset to Defaults
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
          ) : saved ? (
            <>
              <FiCheck className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Email Settings Component
const EmailSettings = () => {
  const { settings, updateSettings } = useAdminStore();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateSettings(localSettings);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Default Sender */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <FiMail className="w-5 h-5 inline-block mr-2" />
          Default Sender
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default From Name
            </label>
            <input
              type="text"
              value={localSettings.defaultFromName}
              onChange={(e) => handleChange('defaultFromName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default From Email
            </label>
            <input
              type="email"
              value={localSettings.defaultFromEmail}
              onChange={(e) => handleChange('defaultFromEmail', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Reply-To Email
            </label>
            <input
              type="email"
              value={localSettings.defaultReplyTo}
              onChange={(e) => handleChange('defaultReplyTo', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Governance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <FiShield className="w-5 h-5 inline-block mr-2" />
          Governance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Require Approval for Large Audiences
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Show confirmation before sending to large recipient lists
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.requireApprovalForLargeAudience}
                onChange={(e) =>
                  handleChange('requireApprovalForLargeAudience', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-btea-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-btea-primary"></div>
            </label>
          </div>

          {localSettings.requireApprovalForLargeAudience && (
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Large Audience Threshold
              </label>
              <input
                type="number"
                min="1"
                value={localSettings.largeAudienceThreshold}
                onChange={(e) =>
                  handleChange('largeAudienceThreshold', parseInt(e.target.value))
                }
                className="w-32 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Show approval prompt when sending to more than this number of recipients
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              min="30"
              value={localSettings.dataRetentionDays}
              onChange={(e) =>
                handleChange('dataRetentionDays', parseInt(e.target.value))
              }
              className="w-32 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Audit logs older than this will be automatically deleted
            </p>
          </div>
        </div>
      </div>

      {/* Tracking */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <FiActivity className="w-5 h-5 inline-block mr-2" />
          Tracking & Analytics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Unsubscribe Link</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Include unsubscribe option in email footer
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enableUnsubscribe}
                onChange={(e) => handleChange('enableUnsubscribe', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-btea-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-btea-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Open Tracking</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track when recipients open emails
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enableOpenTracking}
                onChange={(e) => handleChange('enableOpenTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-btea-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-btea-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Click Tracking</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track when recipients click links
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enableClickTracking}
                onChange={(e) => handleChange('enableClickTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-btea-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-btea-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
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
          ) : saved ? (
            <>
              <FiCheck className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Audit Log Component
const AuditLog = () => {
  const { auditLogs, formatAction, getActionColor, exportAuditLogs, getAuditStats } =
    useAdminStore();

  const [filter, setFilter] = useState('');
  const stats = getAuditStats();

  const filteredLogs = filter
    ? auditLogs.filter(
        (log) =>
          log.action.toLowerCase().includes(filter.toLowerCase()) ||
          log.entityType.toLowerCase().includes(filter.toLowerCase()) ||
          log.userName?.toLowerCase().includes(filter.toLowerCase())
      )
    : auditLogs;

  const handleExport = (format) => {
    const data = exportAuditLogs(format);
    const blob = new Blob([data], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadgeClass = (action) => {
    const color = getActionColor(action);
    const colorMap = {
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colorMap[color] || colorMap.info;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisWeek}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <FiDownload className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Log List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FiClipboard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter ? 'No logs match your filter' : 'No audit logs yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.slice(0, 50).map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        getActionColor(log.action) === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : getActionColor(log.action) === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : getActionColor(log.action) === 'warning'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}
                    >
                      <FiActivity
                        className={`w-4 h-4 ${
                          getActionColor(log.action) === 'success'
                            ? 'text-green-600'
                            : getActionColor(log.action) === 'error'
                            ? 'text-red-600'
                            : getActionColor(log.action) === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatAction(log.action)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {log.entityType}
                        {log.entityId && ` • ${log.entityId}`}
                      </p>
                      {log.userName && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <FiUser className="w-3 h-3" />
                          {log.userName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(log.createdAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredLogs.length > 50 && (
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-700">
              Showing 50 of {filteredLogs.length} entries
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

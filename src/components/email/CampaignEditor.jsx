/**
 * Campaign Editor Component
 * Create and edit email campaigns
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiSend,
  FiClock,
  FiEye,
  FiUsers,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiSmartphone,
  FiMonitor,
  FiMail,
} from 'react-icons/fi';
import useCampaignStore from '../../stores/campaignStore';
import useTeamStore from '../../stores/teamStore';
import useTemplateStore from '../../stores/templateStore';
import useAdminStore from '../../stores/adminStore';
import {
  CAMPAIGN_STATUS,
  TEMPLATE_STATUS,
} from '../../models/emailTemplateModels';
import { format } from 'date-fns';

const CampaignEditor = ({ campaign, onClose }) => {
  const {
    createCampaign,
    updateCampaign,
    scheduleCampaign,
    sendCampaign,
    sendTestEmail,
    generatePreview,
    previewHtml,
    previewMode,
    setPreviewMode,
    sending,
  } = useCampaignStore();

  const { teams, getTeamStats } = useTeamStore();
  const { getApprovedTemplates, getTemplateById, generateHtmlFromBlocks } = useTemplateStore();
  const { settings, branding } = useAdminStore();

  const isEditing = !!campaign;
  const approvedTemplates = getApprovedTemplates();

  const [step, setStep] = useState(1); // 1: Details, 2: Recipients, 3: Review
  const [showPreview, setShowPreview] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    previewText: '',
    fromName: settings.defaultFromName || '',
    fromEmail: settings.defaultFromEmail || '',
    replyTo: settings.defaultReplyTo || '',
    templateId: null,
    teamId: null,
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        subject: campaign.subject,
        previewText: campaign.previewText || '',
        fromName: campaign.fromName,
        fromEmail: campaign.fromEmail,
        replyTo: campaign.replyTo || '',
        templateId: campaign.templateId,
        teamId: campaign.teamId,
      });
    }
  }, [campaign]);

  const selectedTemplate = formData.templateId
    ? getTemplateById(formData.templateId)
    : null;
  const selectedTeam = formData.teamId
    ? teams.find((t) => t.id === formData.teamId)
    : null;
  const teamStats = selectedTeam ? getTeamStats(selectedTeam.id) : null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject line is required';
    }

    if (!formData.fromName.trim()) {
      newErrors.fromName = 'From name is required';
    }

    if (!formData.fromEmail.trim()) {
      newErrors.fromEmail = 'From email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      newErrors.fromEmail = 'Invalid email format';
    }

    if (!formData.templateId) {
      newErrors.templateId = 'Please select a template';
    }

    if (!formData.teamId) {
      newErrors.teamId = 'Please select a recipient team';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isEditing) {
      updateCampaign(campaign.id, formData);
    } else {
      createCampaign({
        ...formData,
        stats: {
          totalRecipients: teamStats?.active || 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
          complained: 0,
        },
      });
    }
    onClose();
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) return;

    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();

    if (isEditing) {
      updateCampaign(campaign.id, formData);
      scheduleCampaign(campaign.id, scheduledAt);
    } else {
      const newCampaign = createCampaign({
        ...formData,
        stats: { totalRecipients: teamStats?.active || 0 },
      });
      scheduleCampaign(newCampaign.id, scheduledAt);
    }

    setShowScheduleModal(false);
    onClose();
  };

  const handleSendNow = async () => {
    if (!validate()) return;

    if (
      settings.requireApprovalForLargeAudience &&
      teamStats?.active > settings.largeAudienceThreshold
    ) {
      if (
        !window.confirm(
          `This campaign will be sent to ${teamStats.active} recipients. Are you sure you want to proceed?`
        )
      ) {
        return;
      }
    }

    let campaignId = campaign?.id;

    if (!isEditing) {
      const newCampaign = createCampaign({
        ...formData,
        stats: { totalRecipients: teamStats?.active || 0 },
      });
      campaignId = newCampaign.id;
    } else {
      updateCampaign(campaign.id, formData);
    }

    const success = await sendCampaign(campaignId, teamStats?.active || 0);
    if (success) {
      onClose();
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return;
    }

    const result = await sendTestEmail(campaign?.id, testEmail);
    if (result.success) {
      setTestEmailSent(true);
      setTimeout(() => {
        setTestEmailSent(false);
        setShowTestEmailModal(false);
      }, 2000);
    }
  };

  const handlePreview = () => {
    if (selectedTemplate) {
      const templateHtml = selectedTemplate.contentHtml ||
        generateHtmlFromBlocks(selectedTemplate.contentJson?.blocks || []);
      const fullHtml = `
        ${branding.headerHtml}
        <div style="padding: 20px;">
          ${templateHtml}
        </div>
        ${branding.footerHtml}
      `;
      generatePreview(fullHtml);
      setShowPreview(true);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.subject && formData.fromEmail && formData.templateId;
      case 2:
        return formData.teamId;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Campaign' : 'Create Campaign'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.name || 'Untitled campaign'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              disabled={!selectedTemplate}
              className="btn-btea-outline flex items-center gap-2 disabled:opacity-50"
            >
              <FiEye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="btn-btea-ghost flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              Save Draft
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mt-4">
          {[
            { num: 1, label: 'Details', icon: FiFileText },
            { num: 2, label: 'Recipients', icon: FiUsers },
            { num: 3, label: 'Review & Send', icon: FiSend },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  step === s.num
                    ? 'bg-btea-primary text-white'
                    : step > s.num
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                }`}
              >
                {step > s.num ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{s.label}</span>
              </button>
              {i < 2 && (
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Campaign Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., November Newsletter"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    } bg-white dark:bg-gray-700`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Your November update from BTEA"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.subject ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    } bg-white dark:bg-gray-700`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preview Text
                  </label>
                  <input
                    type="text"
                    name="previewText"
                    value={formData.previewText}
                    onChange={handleChange}
                    placeholder="Text shown after subject in inbox"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This text appears next to the subject line in most email clients
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sender Information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Name *
                    </label>
                    <input
                      type="text"
                      name="fromName"
                      value={formData.fromName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.fromName ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      } bg-white dark:bg-gray-700`}
                    />
                    {errors.fromName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fromName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Email *
                    </label>
                    <input
                      type="email"
                      name="fromEmail"
                      value={formData.fromEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.fromEmail ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      } bg-white dark:bg-gray-700`}
                    />
                    {errors.fromEmail && (
                      <p className="mt-1 text-sm text-red-500">{errors.fromEmail}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    name="replyTo"
                    value={formData.replyTo}
                    onChange={handleChange}
                    placeholder="Leave empty to use From email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Template *
                </h2>

                {errors.templateId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.templateId}
                  </p>
                )}

                {approvedTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiFileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No approved templates available</p>
                    <p className="text-sm">Create and approve a template first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {approvedTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            templateId: template.id,
                          }))
                        }
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          formData.templateId === template.id
                            ? 'border-btea-primary bg-btea-primary/5'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {template.description || 'No description'}
                            </p>
                          </div>
                          {formData.templateId === template.id && (
                            <FiCheck className="w-5 h-5 text-btea-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Recipients */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Recipients *
                </h2>

                {errors.teamId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.teamId}
                  </p>
                )}

                {teams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiUsers className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No teams available</p>
                    <p className="text-sm">Create a team with recipients first</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => {
                      const stats = getTeamStats(team.id);
                      return (
                        <button
                          key={team.id}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, teamId: team.id }))
                          }
                          className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                            formData.teamId === team.id
                              ? 'border-btea-primary bg-btea-primary/5'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {team.name}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {stats.active} active recipient{stats.active !== 1 ? 's' : ''}
                                {stats.excluded > 0 && (
                                  <span className="text-red-500 ml-2">
                                    ({stats.excluded} excluded)
                                  </span>
                                )}
                              </p>
                            </div>
                            {formData.teamId === team.id && (
                              <FiCheck className="w-5 h-5 text-btea-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedTeam && teamStats && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FiUsers className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        Recipient Summary
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        This campaign will be sent to <strong>{teamStats.active}</strong>{' '}
                        recipient{teamStats.active !== 1 ? 's' : ''} in "{selectedTeam.name}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Review & Send */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Campaign Summary
                </h2>

                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Campaign Name</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {formData.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Subject</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {formData.subject}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">From</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {formData.fromName} &lt;{formData.fromEmail}&gt;
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Template</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {selectedTemplate?.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Recipients</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {teamStats?.active || 0} ({selectedTeam?.name})
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowTestEmailModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-btea-primary hover:bg-btea-primary/5 transition-colors text-center"
                >
                  <FiMail className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">Send Test</p>
                  <p className="text-xs text-gray-500 mt-1">Preview in your inbox</p>
                </button>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-btea-primary hover:bg-btea-primary/5 transition-colors text-center"
                >
                  <FiClock className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">Schedule</p>
                  <p className="text-xs text-gray-500 mt-1">Send at specific time</p>
                </button>

                <button
                  onClick={handleSendNow}
                  disabled={sending}
                  className="p-4 rounded-xl bg-btea-primary text-white hover:bg-btea-primary-dark transition-colors text-center disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="w-6 h-6 mx-auto mb-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <p className="font-medium">Sending...</p>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">Send Now</p>
                      <p className="text-xs text-white/70 mt-1">
                        To {teamStats?.active || 0} recipients
                      </p>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50"
          >
            Back
          </button>
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-btea disabled:opacity-50"
            >
              Continue
            </button>
          )}
        </div>
      </footer>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-100 dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Email Preview</h3>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded ${
                        previewMode === 'desktop'
                          ? 'bg-white dark:bg-gray-600 shadow'
                          : ''
                      }`}
                    >
                      <FiMonitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded ${
                        previewMode === 'mobile'
                          ? 'bg-white dark:bg-gray-600 shadow'
                          : ''
                      }`}
                    >
                      <FiSmartphone className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 flex justify-center">
                <div
                  className={`bg-white shadow-lg transition-all ${
                    previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[600px]'
                  }`}
                >
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Email Modal */}
      <AnimatePresence>
        {showTestEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTestEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {testEmailSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FiCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Test email sent!</p>
                  <p className="text-sm text-gray-500 mt-1">Check your inbox</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Send Test Email
                  </h3>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowTestEmailModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendTestEmail}
                      disabled={sending}
                      className="flex-1 btn-btea"
                    >
                      {sending ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Schedule Campaign
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 btn-btea disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignEditor;

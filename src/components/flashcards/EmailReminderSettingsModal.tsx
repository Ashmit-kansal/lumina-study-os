import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { EmailReminderService } from '../../services/emailReminderService';
import {
  Mail,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
} from 'lucide-react';

interface EmailReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailReminderSettingsModal: React.FC<EmailReminderSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { emailConfig, updateEmailConfig, flashcards, subjects, studyStreakDays } = useApp();

  const [email, setEmail] = useState(emailConfig.email);
  const [enabled, setEnabled] = useState(emailConfig.enabled);
  const [scheduledTime, setScheduledTime] = useState(emailConfig.scheduledTime);
  const [digestFrequency, setDigestFrequency] = useState(emailConfig.digestFrequency);
  const [minDueCards, setMinDueCards] = useState(emailConfig.minDueCards);

  const [showPreview, setShowPreview] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const digestPayload = EmailReminderService.generateDigest(
    { ...emailConfig, email, scheduledTime, digestFrequency, minDueCards },
    flashcards,
    subjects,
    studyStreakDays
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailConfig({
      email: email.trim(),
      enabled,
      scheduledTime,
      digestFrequency,
      minDueCards: Number(minDueCards) || 1,
    });
    setTestResult({ success: true, message: 'Email reminder preferences saved successfully!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await EmailReminderService.sendDigestNotification(digestPayload);
      setTestResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send test email.';
      setTestResult({ success: false, message: msg });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Spaced Repetition Email Reminders"
      subtitle="Receive daily automated email digests when flashcards are due for review"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Enable Toggle */}
        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Automated Revision Reminders
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Sends an email with all concepts due for SM-2 review
            </div>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
          />
        </label>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Your Email Address *</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Scheduled Digest Time</label>
            <div className="relative">
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Frequency</label>
            <select
              value={digestFrequency}
              onChange={(e) => setDigestFrequency(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="daily">Daily Morning Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="when_due">Only when cards exceed threshold</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Min Due Cards to Trigger</label>
            <input
              type="number"
              min="1"
              max="50"
              value={minDueCards}
              onChange={(e) => setMinDueCards(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Live Template Preview Toggle */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Digest Preview
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Hide Preview' : 'Show HTML Template Preview'}
            </button>
          </div>

          {showPreview && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-60 overflow-y-auto">
              <div className="text-xs font-bold text-slate-300 mb-2">Subject: {digestPayload.subject}</div>
              <div
                className="bg-slate-900 p-4 rounded-xl text-slate-200 text-xs shadow-inner"
                dangerouslySetInnerHTML={{ __html: digestPayload.htmlContent }}
              />
            </div>
          )}
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-800/50 text-red-300'
            }`}
          >
            {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingTest ? 'Sending Test...' : 'Send Test Notification'}
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20 text-center"
          >
            Save Reminder Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
};

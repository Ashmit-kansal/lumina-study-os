import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  Folder as FolderIcon,
  Sparkles,
  Check,
  Plus,
  BookOpen,
  Bell,
  Send,
} from 'lucide-react';

interface SetRevisionScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'file' | 'folder';
  defaultTargetId?: string;
}

export const SetRevisionScheduleModal: React.FC<SetRevisionScheduleModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'file',
  defaultTargetId,
}) => {
  const { notes, folders, subjects, scheduleRevision } = useApp();

  const [targetType, setTargetType] = useState<'file' | 'folder'>(defaultType);
  const [selectedFileId, setSelectedFileId] = useState<string>(
    defaultTargetId && defaultType === 'file' ? defaultTargetId : notes[0]?.id || ''
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultTargetId && defaultType === 'folder' ? defaultTargetId : folders[0]?.id || ''
  );

  // Interval presets in days
  const [intervalDays, setIntervalDays] = useState<number>(1);
  const [customDate, setCustomDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00 AM');
  const [emailReminder, setEmailReminder] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('student@university.edu');

  const selectedFile = notes.find((n) => n.id === selectedFileId);
  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  // Calculate target date based on intervalDays
  const getTargetDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetId = '';
    let title = '';
    let subjectId = '';
    let subjectName = '';
    let folderName: string | undefined = undefined;

    if (targetType === 'file' && selectedFile) {
      targetId = selectedFile.id;
      title = selectedFile.title || 'Untitled.txt';
      subjectId = selectedFile.subjectId || subjects[0]?.id || 'sub_default';
      const sub = subjects.find((s) => s.id === subjectId);
      subjectName = sub?.name || 'General';
      const parentFolder = folders.find((f) => f.id === selectedFile.folderId);
      folderName = parentFolder?.name;
    } else if (targetType === 'folder' && selectedFolder) {
      targetId = selectedFolder.id;
      title = `${selectedFolder.name} (Folder)`;
      subjectId = selectedFolder.subjectId || subjects[0]?.id || 'sub_default';
      const sub = subjects.find((s) => s.id === subjectId);
      subjectName = sub?.name || 'General';
      folderName = selectedFolder.name;
    } else {
      return;
    }

    const scheduledDateStr = customDate || getTargetDateStr(intervalDays);

    scheduleRevision({
      targetType,
      targetId,
      title,
      subjectId,
      subjectName,
      folderName,
      scheduledDate: scheduledDateStr,
      scheduledTime,
      intervalDays,
      emailReminder,
      userEmail: emailReminder ? userEmail : undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Revision Schedule for Folder or File"
      subtitle="Schedule timely recall sessions and receive automated email timer reminders"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Target Type Switcher */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            What do you want to revise?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('file')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                targetType === 'file'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Specific Text File</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('folder')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                targetType === 'folder'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderIcon className="w-4 h-4" />
              <span>Entire Folder</span>
            </button>
          </div>
        </div>

        {/* Step 2: Item Dropdown */}
        {targetType === 'file' ? (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Document / File *
            </label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {notes.map((n) => {
                const sub = subjects.find((s) => s.id === n.subjectId);
                return (
                  <option key={n.id} value={n.id}>
                    📄 {n.title || 'Untitled.txt'} ({sub?.name || 'General'})
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Study Folder *
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {folders.map((f) => {
                const sub = subjects.find((s) => s.id === f.subjectId);
                return (
                  <option key={f.id} value={f.id}>
                    📁 {f.name} ({sub?.name || 'General'})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Step 3: Revision Timer / Interval Preset Pills */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              When should this be revised? (Timer Interval)
            </label>
            <span className="text-[11px] text-indigo-400 font-mono">
              Date: {customDate || getTargetDateStr(intervalDays)}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {[
              { label: 'Today', days: 0 },
              { label: '1 Day', days: 1 },
              { label: '3 Days', days: 3 },
              { label: '1 Week', days: 7 },
              { label: '2 Weeks', days: 14 },
              { label: '1 Month', days: 30 },
            ].map((p) => {
              const isSelected = intervalDays === p.days && !customDate;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setIntervalDays(p.days);
                    setCustomDate('');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Email Reminder Settings */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-200">
              <input
                type="checkbox"
                checked={emailReminder}
                onChange={(e) => setEmailReminder(e.target.checked)}
                className="accent-indigo-500 rounded"
              />
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Send Email Timer Alert</span>
              </span>
            </label>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Simulated UI
            </span>
          </div>

          {emailReminder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">
                  Your Notification Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">
                  Daily Delivery Time
                </label>
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Revision</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

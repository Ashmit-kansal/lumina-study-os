import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { RevisionScheduleItem } from '../../types';
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
  Zap,
  Brain,
  Wand2,
} from 'lucide-react';

interface SetRevisionScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'file' | 'folder' | 'subject';
  defaultTargetId?: string;
  defaultSubjectId?: string;
  onStartActiveRecall?: (item: RevisionScheduleItem) => void;
  onOpenAIGenerator?: (subjectId?: string, noteId?: string) => void;
}

export const SetRevisionScheduleModal: React.FC<SetRevisionScheduleModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'file',
  defaultTargetId,
  defaultSubjectId,
  onStartActiveRecall,
  onOpenAIGenerator,
}) => {
  const { notes, folders, subjects, scheduleRevision } = useApp();
  const { user } = useAuth();

  const [targetType, setTargetType] = useState<'file' | 'folder' | 'subject'>('file');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Interval presets in days
  const [intervalDays, setIntervalDays] = useState<number>(1);
  const [customDate, setCustomDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00 AM');
  const [emailReminder, setEmailReminder] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>(user?.email || 'student@university.edu');

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user?.email) {
        setUserEmail(user.email);
      }
      if (defaultType === 'folder') {
        setTargetType('folder');
        setSelectedFolderId(defaultTargetId || folders[0]?.id || '');
      } else if (defaultType === 'subject') {
        setTargetType('subject');
        setSelectedSubjectId(defaultTargetId || subjects[0]?.id || '');
      } else {
        setTargetType('file');
        setSelectedFileId(defaultTargetId || notes[0]?.id || '');
      }

      if (defaultSubjectId) {
        setSelectedSubjectId(defaultSubjectId);
      }
      setIntervalDays(1);
      setCustomDate('');
    }
  }, [isOpen, defaultType, defaultTargetId, defaultSubjectId, notes, folders, subjects]);

  const selectedFile = notes.find((n) => n.id === selectedFileId);
  const selectedFolder = folders.find((f) => f.id === selectedFolderId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Calculate target date based on intervalDays
  const getTargetDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const constructScheduleItem = (): RevisionScheduleItem | null => {
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
    } else if (targetType === 'subject' && selectedSubject) {
      targetId = selectedSubject.id;
      title = `${selectedSubject.name} (Course)`;
      subjectId = selectedSubject.id;
      subjectName = selectedSubject.name;
    } else {
      return null;
    }

    const scheduledDateStr = customDate || getTargetDateStr(intervalDays);

    return {
      id: 'rev_' + Date.now(),
      targetType: targetType === 'subject' ? 'folder' : targetType,
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
      revisionCount: 0,
      status: 'scheduled',
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = constructScheduleItem();
    if (!item) return;

    scheduleRevision({
      targetType: item.targetType,
      targetId: item.targetId,
      title: item.title,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      folderName: item.folderName,
      scheduledDate: item.scheduledDate,
      scheduledTime: item.scheduledTime,
      intervalDays: item.intervalDays,
      emailReminder: item.emailReminder,
      userEmail: item.userEmail,
    });

    onClose();
  };

  const handleInstantActiveRecall = () => {
    const item = constructScheduleItem();
    if (!item) return;

    const scheduled = scheduleRevision({
      targetType: item.targetType,
      targetId: item.targetId,
      title: item.title,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      folderName: item.folderName,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: 'Now',
      intervalDays: 1,
      emailReminder: false,
    });

    onClose();
    if (onStartActiveRecall) {
      onStartActiveRecall(scheduled);
    }
  };

  const handleTriggerAIFlashcards = () => {
    onClose();
    if (onOpenAIGenerator) {
      const subId = targetType === 'file' ? selectedFile?.subjectId : targetType === 'folder' ? selectedFolder?.subjectId : selectedSubject?.id;
      const nId = targetType === 'file' ? selectedFile?.id : undefined;
      onOpenAIGenerator(subId, nId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Revision & Spaced Repetition"
      subtitle="Set custom active recall intervals, schedule automated reminders, or launch revision cards"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Target Type Switcher */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            What do you want to revise?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('file')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                targetType === 'file'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Note / File</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('folder')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                targetType === 'folder'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderIcon className="w-3.5 h-3.5" />
              <span>Study Folder</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('subject')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                targetType === 'subject'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Whole Subject</span>
            </button>
          </div>
        </div>

        {/* Step 2: Item Dropdown */}
        {targetType === 'file' ? (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Document / Note *
            </label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {notes.map((n) => {
                const sub = subjects.find((s) => s.id === n.subjectId);
                return (
                  <option key={n.id} value={n.id} className="bg-slate-900 text-slate-100 py-1">
                    📄 {n.title || 'Untitled.txt'} ({sub?.name || 'General'})
                  </option>
                );
              })}
            </select>
          </div>
        ) : targetType === 'folder' ? (
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
                  <option key={f.id} value={f.id} className="bg-slate-900 text-slate-100 py-1">
                    📁 {f.name} ({sub?.name || 'General'})
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Subject (Course) *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100 py-1">
                  📘 {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 3: Spaced Repetition Interval Preset Pills + Custom Date */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Spaced Repetition Schedule
            </label>
            <span className="text-[11px] text-indigo-400 font-mono font-semibold">
              📅 Next Review: {customDate || getTargetDateStr(intervalDays)}
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
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Input */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Or pick custom date:</span>
            <input
              type="date"
              value={customDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setCustomDate(e.target.value);
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
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
                <span>Send Email Spaced Repetition Reminder</span>
              </span>
            </label>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Active Recall
            </span>
          </div>

          {emailReminder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">
                  Notification Email
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
                  Delivery Time
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

        {/* Quick Flashcards & Immediate Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            {onOpenAIGenerator && (
              <button
                type="button"
                onClick={handleTriggerAIFlashcards}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 text-purple-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                title="Generate AI Flashcards for this note"
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Flashcards</span>
              </button>
            )}

            {onStartActiveRecall && (
              <button
                type="button"
                onClick={handleInstantActiveRecall}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                title="Launch active revision session right now"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Revise Now</span>
              </button>
            )}
          </div>

          {/* Form Submit & Cancel */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

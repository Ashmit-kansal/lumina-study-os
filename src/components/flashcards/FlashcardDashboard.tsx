import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RevisionScheduleItem } from '../../types';
import { SetRevisionScheduleModal } from './SetRevisionScheduleModal';
import { ActiveRevisionModal } from './ActiveRevisionModal';
import { EmailReminderSettingsModal } from './EmailReminderSettingsModal';
import { useRouter } from '../../context/RouterContext';
import {
  Brain,
  Sparkles,
  Calendar,
  Layers,
  Mail,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trash2,
  BookOpen,
  Plus,
  Wand2,
  Play,
  RotateCcw,
  Search,
  FileText,
  Folder as FolderIcon,
  Bell,
  Award,
  Zap,
  Check,
  ExternalLink,
} from 'lucide-react';

export const FlashcardDashboard: React.FC = () => {
  const { revisionItems, deleteRevisionItem, completeRevision, subjects, emailConfig } = useApp();
  const { navigate } = useRouter();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activeRevisionItem, setActiveRevisionItem] = useState<RevisionScheduleItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | undefined>(undefined);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter items
  const dueItems = revisionItems.filter((item) => item.status === 'due' || item.scheduledDate <= todayStr);
  const upcomingItems = revisionItems.filter((item) => item.status !== 'due' && item.scheduledDate > todayStr);
  const completedCount = revisionItems.reduce((acc, item) => acc + item.revisionCount, 0);

  // Calculate average quiz score
  const itemsWithScores = revisionItems.filter((item) => item.lastQuizScore !== undefined);
  const avgQuizScore =
    itemsWithScores.length > 0
      ? Math.round(itemsWithScores.reduce((sum, item) => sum + (item.lastQuizScore || 0), 0) / itemsWithScores.length)
      : 85;

  const filteredUpcoming = upcomingItems.filter((item) => {
    if (selectedSubjectFilter && item.subjectId !== selectedSubjectFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.subjectName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMarkComplete = (item: RevisionScheduleItem) => {
    const nextDays = item.intervalDays ? Math.max(1, Math.round(item.intervalDays * 2)) : 3;
    completeRevision(item.id, nextDays);
    showToast(`Marked "${item.title}" complete! Next review in ${nextDays} days.`);
  };

  const handleGoToNoteOrFolder = (item: RevisionScheduleItem) => {
    if (item.targetType === 'file') {
      navigate(`/notes?note=${item.targetId}`);
    } else if (item.targetType === 'folder') {
      const subQuery = item.subjectId ? `&subject=${item.subjectId}` : '';
      navigate(`/notes?folder=${item.targetId}${subQuery}`);
    } else if (item.targetType === 'subject') {
      navigate(`/notes?subject=${item.subjectId}`);
    } else {
      navigate('/notes');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 relative">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-emerald-400 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Top Banner & Main Actions */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden shadow-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <Brain className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Spaced Revision Engine
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-400" /> Email Timer Alerts Active
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Smart Revision &amp; Active Recall Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Schedule revision timers for your study folders and text files. When due, revise with <strong>AI-generated flashcards</strong> or <strong>follow your notes directly</strong>, then evaluate your retention with <strong>adaptive AI quizzes</strong>!
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Set Revision for Folder/File</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl text-xs font-semibold flex items-center justify-center transition-colors shadow-md"
              title="Email Reminder Digest Settings"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Due for Revision</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">{dueItems.length}</div>
          <p className="text-[11px] text-slate-400">Ready to revise right now</p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Scheduled Upcoming</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400">{upcomingItems.length}</div>
          <p className="text-[11px] text-slate-400">Timers actively tracking</p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Revisions Done</span>
            <RotateCcw className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">{completedCount}</div>
          <p className="text-[11px] text-slate-400">Cumulative study passes</p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg AI Quiz Retention</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-400">{avgQuizScore}%</div>
          <p className="text-[11px] text-slate-400">Adaptive recall mastery</p>
        </div>
      </div>

      {/* SECTION 1: Due Revisions Today (Urgent Queue) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Ready for Revision Today ({dueItems.length})</span>
          </h3>
          <span className="text-xs text-amber-400 font-medium">Timer due • Ready for AI Flashcards / Quiz</span>
        </div>

        {dueItems.length === 0 ? (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
            🎉 All scheduled revisions for today are complete! Schedule another folder or file anytime.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ⚡ DUE TODAY
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteRevisionItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.targetType === 'file' ? (
                      <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    ) : (
                      <FolderIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    )}
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5 text-indigo-300">
                      <BookOpen className="w-3 h-3" /> {item.subjectName}
                    </p>
                    {item.folderName && (
                      <p className="text-[11px] text-slate-400">📁 Folder: {item.folderName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Revision #{item.revisionCount + 1}</span>
                    {item.lastQuizScore !== undefined && (
                      <span className="text-emerald-400 font-bold">Last Quiz: {item.lastQuizScore}%</span>
                    )}
                  </div>

                  {/* Actions: Start Revision + Mark Complete + Go to Notes */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveRevisionItem(item)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Revision</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkComplete(item)}
                      className="p-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                      title="Mark revision as complete"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Complete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoToNoteOrFolder(item)}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                      title="Open note or folder directly in Notes Workspace"
                    >
                      <ExternalLink className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Scheduled Upcoming Revisions */}
      <div className="space-y-3.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Upcoming Revision Schedule ({upcomingItems.length})</span>
          </h3>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedSubjectFilter || ''}
              onChange={(e) => setSelectedSubjectFilter(e.target.value || undefined)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        {filteredUpcoming.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
            <p>No upcoming schedules found for the selected filter.</p>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
            >
              + Schedule a Folder or File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredUpcoming.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      📅 Due: {item.scheduledDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteRevisionItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.targetType === 'file' ? (
                      <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    ) : (
                      <FolderIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    )}
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5 text-indigo-300">
                      <BookOpen className="w-3 h-3" /> {item.subjectName}
                    </p>
                    {item.folderName && (
                      <p className="text-[11px] text-slate-400">📁 Folder: {item.folderName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Interval: {item.intervalDays} days</span>
                    {item.emailReminder && (
                      <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                        <Mail className="w-3 h-3" /> Email Alert
                      </span>
                    )}
                  </div>

                  {/* Actions: Revise Early + Mark Complete + Go to Notes */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveRevisionItem(item)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Revise Early</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkComplete(item)}
                      className="px-2.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      title="Mark revision as complete"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Complete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoToNoteOrFolder(item)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
                      title="Open in Notes Workspace"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SetRevisionScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <ActiveRevisionModal
        isOpen={!!activeRevisionItem}
        onClose={() => setActiveRevisionItem(null)}
        revisionItem={activeRevisionItem}
      />

      <EmailReminderSettingsModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTimer } from '../../context/TimerContext';
import { SubjectManagerModal } from './SubjectManagerModal';
import { BookOpen, Settings2, ChevronDown, Check, Sparkles } from 'lucide-react';

export const SubjectSelector: React.FC = () => {
  const { subjects } = useApp();
  const { activeSubjectId, setActiveSubjectId, isRunning } = useTimer();
  const [isOpen, setIsOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Active Subject Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 transition-all shadow-md group backdrop-blur-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${activeSubject?.color || 'from-indigo-500 to-purple-600'} shadow-sm flex-shrink-0`} />
            <div className="text-left truncate">
              <span className="text-xs text-slate-400 block font-medium">Tracking Subject</span>
              <span className="text-sm font-semibold text-slate-100 truncate block">
                {activeSubject?.name || 'Select Subject'}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setIsManagerOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-indigo-500/50 hover:text-indigo-300 text-slate-400 transition-colors shadow-md backdrop-blur-md"
          title="Manage Subjects"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1 backdrop-blur-xl animate-scale-up">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
              <span>Your Study Subjects</span>
              <span className="text-indigo-400">{subjects.length} total</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1">
              {subjects.map((sub) => {
                const isSelected = sub.id === activeSubjectId;
                const hours = (sub.totalSecondsStudied / 3600).toFixed(1);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setActiveSubjectId(sub.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-100'
                        : 'hover:bg-slate-800/70 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${sub.color} flex-shrink-0`} />
                      <div className="truncate">
                        <div className="text-sm font-medium truncate">{sub.name}</div>
                        <div className="text-xs text-slate-400">{hours}h recorded</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsManagerOpen(true);
              }}
              className="w-full mt-1 pt-2 border-t border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1.5 flex items-center justify-center gap-1.5 hover:bg-indigo-950/20 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> + Create or Edit Subjects
            </button>
          </div>
        </>
      )}

      {/* Subject Manager Modal */}
      <SubjectManagerModal isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} />
    </div>
  );
};

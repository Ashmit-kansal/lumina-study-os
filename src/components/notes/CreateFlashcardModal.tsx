import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  Sparkles,
  RotateCw,
  Plus,
  Check,
  HelpCircle,
  FileText,
  ListPlus,
  BookOpen,
} from 'lucide-react';

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string | null;
  defaultFolderId?: string | null;
}

export const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultFolderId,
}) => {
  const { subjects, folders, addCustomFlashcard, createFlashcardsBatch } = useApp();

  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    defaultSubjectId || subjects[0]?.id || ''
  );
  const [selectedFolderId, setSelectedFolderId] = useState(defaultFolderId || '');

  // 3D Card Preview flip state
  const [isFlipped, setIsFlipped] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  // Batch Mode Textarea
  const [batchText, setBatchText] = useState(
    `What is Raft Consensus? :: A leader-based consensus algorithm designed for understandability.\nWhat is Dijkstra's limitation? :: Cannot handle negative edge weights.\nWhat is Spaced Repetition (SM-2)? :: An algorithm calculating optimal recall intervals.`
  );

  const handleAddSingle = (keepOpen: boolean = false) => {
    if (!front.trim() || !back.trim()) return;

    addCustomFlashcard({
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim() || undefined,
      subjectId: selectedSubjectId || subjects[0]?.id || 'sub_default',
    });

    setCreatedCount((prev) => prev + 1);
    setFront('');
    setBack('');
    setHint('');
    setIsFlipped(false);

    if (!keepOpen) {
      onClose();
    }
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchText.split('\n');
    const parsedCards: Array<{ front: string; back: string; subjectId: string; hint?: string }> = [];

    lines.forEach((line) => {
      if (line.includes('::')) {
        const parts = line.split('::');
        if (parts.length >= 2) {
          const f = parts[0].replace(/^[-*#\s]+/, '').trim();
          const b = parts.slice(1).join('::').trim();
          if (f && b) {
            parsedCards.push({
              front: f,
              back: b,
              subjectId: selectedSubjectId || subjects[0]?.id || 'sub_default',
            });
          }
        }
      }
    });

    if (parsedCards.length > 0) {
      createFlashcardsBatch(parsedCards);
      setCreatedCount((prev) => prev + parsedCards.length);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Spaced Repetition Flashcards"
      subtitle="Master concepts faster with SuperMemo SM-2 active recall scheduling"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'single'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Interactive 3D Card Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'batch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Bulk RemNote `::` Generator</span>
          </button>
        </div>

        {/* Subject and Folder Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Subject *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Folder (Optional)
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">General Subject Deck</option>
              {folders
                .filter((f) => !selectedSubjectId || f.subjectId === selectedSubjectId)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Mode 1: Single Interactive 3D Card Builder */}
        {mode === 'single' ? (
          <div className="space-y-4">
            {/* Live 3D Flip Card Preview */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Live Interactive Preview
                </span>
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Show Front' : 'Show Back (Flip)'}</span>
                </button>
              </div>

              {/* 3D Preview Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full min-h-[140px] p-5 rounded-2xl border cursor-pointer transition-all duration-500 shadow-xl flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border-purple-500/50 shadow-purple-500/10'
                    : 'bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border-indigo-500/40 shadow-indigo-500/10'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      isFlipped
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION / PROMPT)'}
                  </span>
                  <span className="text-slate-500 text-[10px]">Tap to flip 🔄</span>
                </div>

                <div className="my-3 text-center">
                  <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                    {isFlipped
                      ? back.trim() || 'Your answer will appear here...'
                      : front.trim() || 'Type your prompt / question below...'}
                  </p>
                  {hint.trim() && !isFlipped && (
                    <p className="text-xs text-amber-400 mt-2 italic">💡 Hint: {hint.trim()}</p>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 text-right">
                  SM-2 Repetition: 0 days (New)
                </div>
              </div>
            </div>

            {/* Inputs: Front, Back, Hint */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Card Front (Question / Concept / Term) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. What is the CAP Theorem?"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Card Back (Answer / Definition / Solution) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. A distributed system can only provide two of Consistency, Availability, and Partition Tolerance."
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Hint / Memory Hook (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Think of Eric Brewer's 2000 conjecture"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Session Added Badge */}
            {createdCount > 0 && (
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>🎉 {createdCount} card(s) added in this session!</span>
                <span className="text-[10px] text-emerald-400">Scheduled in SM-2 deck</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {createdCount > 0 ? 'Done' : 'Cancel'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!front.trim() || !back.trim()}
                  onClick={() => handleAddSingle(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all active:scale-95"
                >
                  + Add &amp; Create Another
                </button>
                <button
                  type="button"
                  disabled={!front.trim() || !back.trim()}
                  onClick={() => handleAddSingle(false)}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save Flashcard
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Mode 2: Bulk RemNote Batch Syntax Generator */
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Paste Multiple Cards with `::` Syntax
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {batchText.split('\n').filter((l) => l.includes('::')).length} cards detected
                </span>
              </div>
              <textarea
                rows={7}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Question 1 :: Answer 1&#10;Question 2 :: Answer 2&#10;Term 3 :: Definition 3"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Paste study guides, glossary tables, or lecture notes separated by <code className="text-indigo-300">::</code>.
              </p>
            </div>

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
                disabled={!batchText.includes('::')}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Generate Batch Cards
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

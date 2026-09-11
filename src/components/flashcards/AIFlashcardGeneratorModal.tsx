import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { NoteDocument } from '../../types';
import {
  Sparkles,
  Brain,
  FileText,
  Zap,
  Check,
  RotateCw,
  Plus,
  Sliders,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Layers,
  Wand2,
} from 'lucide-react';

interface AIFlashcardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultNoteId?: string;
}

interface GeneratedCardCandidate {
  id: string;
  front: string;
  back: string;
  hint?: string;
  selected: boolean;
}

export const AIFlashcardGeneratorModal: React.FC<AIFlashcardGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultNoteId,
}) => {
  const { notes, subjects, createFlashcardsBatch, addCustomFlashcard } = useApp();

  const [mode, setMode] = useState<'from_note' | 'from_topic' | 'manual'>('from_note');
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(defaultNoteId || notes[0]?.id || '');
  const [topicPrompt, setTopicPrompt] = useState('Distributed Consensus & Raft Protocol');
  const [cardCount, setCardCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'foundational' | 'intermediate' | 'exam_ready'>('exam_ready');

  // AI Loading & Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedCandidates, setGeneratedCandidates] = useState<GeneratedCardCandidate[]>([]);
  const [isDone, setIsDone] = useState(false);

  // Manual Card inputs
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [manualHint, setManualHint] = useState('');
  const [isManualFlipped, setIsManualFlipped] = useState(false);

  // Sync state on open
  React.useEffect(() => {
    if (isOpen) {
      if (defaultSubjectId) setSelectedSubjectId(defaultSubjectId);
      if (defaultNoteId) {
        setSelectedNoteId(defaultNoteId);
        setMode('from_note');
        const n = notes.find((item) => item.id === defaultNoteId);
        if (n && n.subjectId) setSelectedSubjectId(n.subjectId);
      }
      setIsDone(false);
      setIsGenerating(false);
      setGeneratedCandidates([]);
    }
  }, [isOpen, defaultSubjectId, defaultNoteId, notes]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleGenerateFromAI = () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing semantic structures and key concepts...');

    setTimeout(() => {
      setGenerationStep('Formulating active recall questions & answers...');
    }, 900);

    setTimeout(() => {
      setGenerationStep('Optimizing SuperMemo SM-2 difficulty ratings...');
    }, 1800);

    setTimeout(() => {
      let results: GeneratedCardCandidate[] = [];

      if (mode === 'from_note' && selectedNote) {
        // Extract concepts from note
        const noteLines = selectedNote.content.split('\n').filter((l) => l.trim().length > 5);
        const candidates: GeneratedCardCandidate[] = [];

        // Smart simulated AI parsing of note
        if (selectedNote.content.toLowerCase().includes('raft') || selectedNote.title.toLowerCase().includes('consensus')) {
          candidates.push(
            {
              id: 'gen_1',
              front: 'What are the three node states in the Raft Consensus algorithm?',
              back: 'Leader, Follower, and Candidate.',
              hint: 'Transitions occur via heartbeat timeouts and election votes.',
              selected: true,
            },
            {
              id: 'gen_2',
              front: 'How does Raft handle split votes during an election?',
              back: 'Randomized election timeouts ensure one candidate initiates an election and wins before others.',
              hint: 'Prevents indefinite ties between candidates.',
              selected: true,
            },
            {
              id: 'gen_3',
              front: 'What is Log Replication in Raft?',
              back: 'The Leader receives client commands, appends them to its log, and sends AppendEntries RPCs to Followers until a majority commit.',
              hint: 'Requires a quorum (N/2 + 1) consensus.',
              selected: true,
            },
            {
              id: 'gen_4',
              front: 'What is the primary difference between Raft and Multi-Paxos?',
              back: 'Raft is decomposed into distinct leader election and log replication stages for greater understandability.',
              hint: 'Designed by Ongaro and Ousterhout at Stanford.',
              selected: true,
            }
          );
        } else {
          // Dynamic generation from any user note
          const title = selectedNote.title || 'Key Concept';
          candidates.push(
            {
              id: 'gen_d1',
              front: `What is the core definition of ${title}?`,
              back: noteLines[1]?.replace(/^[-*#\s]+/, '') || `Fundamental principles and theoretical mechanics of ${title}.`,
              hint: 'Refer to core chapter introduction.',
              selected: true,
            },
            {
              id: 'gen_d2',
              front: `What is a primary constraint or limitation associated with ${title}?`,
              back: noteLines[2]?.replace(/^[-*#\s]+/, '') || `Edge cases occur under high concurrency or partitioning conditions.`,
              hint: 'Look for boundary conditions.',
              selected: true,
            },
            {
              id: 'gen_d3',
              front: `How does ${title} optimize runtime efficiency and data consistency?`,
              back: noteLines[3]?.replace(/^[-*#\s]+/, '') || `By minimizing round trips and applying deterministic state machines.`,
              hint: 'Consider algorithmic complexity.',
              selected: true,
            }
          );
        }

        results = candidates.slice(0, cardCount);
      } else {
        // Generate from Topic Prompt
        const prompt = topicPrompt.trim() || 'Core Subject Concepts';
        results = [
          {
            id: 'gen_t1',
            front: `What is the fundamental mechanism of ${prompt}?`,
            back: `A foundational approach designed to ensure high fidelity, fault tolerance, and predictable system behavior.`,
            hint: `Think of the core definition and problem it solves.`,
            selected: true,
          },
          {
            id: 'gen_t2',
            front: `What are the key trade-offs and performance characteristics of ${prompt}?`,
            back: `Balances computational overhead against latency and state guarantees.`,
            hint: `Consider time complexity and memory overhead.`,
            selected: true,
          },
          {
            id: 'gen_t3',
            front: `How does ${prompt} handle edge cases and failure modes?`,
            back: `Applies fallback strategies, validation heuristics, and timeout recoveries.`,
            hint: `Look at error recovery models.`,
            selected: true,
          },
          {
            id: 'gen_t4',
            front: `Why is ${prompt} critical for modern systems architecture?`,
            back: `Enables scalability, deterministic reproducibility, and robust invariant preservation.`,
            hint: `High-yield exam application scenario.`,
            selected: true,
          },
        ].slice(0, cardCount);
      }

      setGeneratedCandidates(results);
      setIsGenerating(false);
    }, 2600);
  };

  const handleToggleSelect = (id: string) => {
    setGeneratedCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSaveSelectedCards = () => {
    const toSave = generatedCandidates.filter((c) => c.selected);
    if (toSave.length === 0) return;

    createFlashcardsBatch(
      toSave.map((c) => ({
        front: c.front,
        back: c.back,
        hint: c.hint,
        subjectId: selectedSubjectId || subjects[0]?.id || 'sub_default',
        noteId: mode === 'from_note' ? selectedNoteId : undefined,
      }))
    );

    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      setGeneratedCandidates([]);
      onClose();
    }, 1200);
  };

  const handleAddManualCard = () => {
    if (!manualFront.trim() || !manualBack.trim()) return;

    addCustomFlashcard({
      front: manualFront.trim(),
      back: manualBack.trim(),
      hint: manualHint.trim() || undefined,
      subjectId: selectedSubjectId || subjects[0]?.id || 'sub_default',
    });

    setManualFront('');
    setManualBack('');
    setManualHint('');
    setIsManualFlipped(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Flashcard Generator & Revision Builder"
      subtitle="Instantly turn lecture notes, textbooks, and topics into active recall flashcards"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('from_note');
              setGeneratedCandidates([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'from_note'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>From Note Document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('from_topic');
              setGeneratedCandidates([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'from_topic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>From Topic / Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('manual');
              setGeneratedCandidates([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Card</span>
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Target Subject
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

          {mode === 'from_note' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Select Note Document
              </label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>
                    📄 {n.title || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'from_topic' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Card Generation Count
              </label>
              <div className="flex gap-2">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setCardCount(cnt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      cardCount === cnt
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cnt} Cards
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mode 1: From Note */}
        {mode === 'from_note' && (
          <div className="space-y-4">
            {selectedNote && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Source Document: {selectedNote.title}
                </span>
                <p className="text-slate-400 text-[11px] line-clamp-2 italic">
                  {selectedNote.content.slice(0, 160)}...
                </p>
              </div>
            )}

            {generatedCandidates.length === 0 && !isGenerating && (
              <button
                type="button"
                onClick={handleGenerateFromAI}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Wand2 className="w-4 h-4" />
                <span>AI Extract Flashcards from this Document</span>
              </button>
            )}
          </div>
        )}

        {/* Mode 2: From Topic */}
        {mode === 'from_topic' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Enter Topic, Chapter or Study Prompt
              </label>
              <input
                type="text"
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="e.g. Distributed Systems Raft Consensus, Operating Systems Virtual Memory..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {generatedCandidates.length === 0 && !isGenerating && (
              <button
                type="button"
                onClick={handleGenerateFromAI}
                disabled={!topicPrompt.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Wand2 className="w-4 h-4" />
                <span>AI Generate {cardCount} High-Yield Flashcards</span>
              </button>
            )}
          </div>
        )}

        {/* Mode 3: Manual Custom Card */}
        {mode === 'manual' && (
          <div className="space-y-4">
            {/* 3D Preview Card */}
            <div
              onClick={() => setIsManualFlipped(!isManualFlipped)}
              className={`w-full min-h-[130px] p-4 rounded-2xl border cursor-pointer transition-all duration-500 shadow-xl flex flex-col justify-between ${
                isManualFlipped
                  ? 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border-purple-500/50 shadow-purple-500/10'
                  : 'bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border-indigo-500/40 shadow-indigo-500/10'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    isManualFlipped
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {isManualFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION / PROMPT)'}
                </span>
                <span className="text-slate-500 text-[10px]">Tap to flip 🔄</span>
              </div>

              <div className="my-2 text-center">
                <p className="text-sm font-semibold text-slate-100">
                  {isManualFlipped
                    ? manualBack.trim() || 'Type answer below...'
                    : manualFront.trim() || 'Type question below...'}
                </p>
                {manualHint.trim() && !isManualFlipped && (
                  <p className="text-xs text-amber-400 mt-1 italic">💡 Hint: {manualHint.trim()}</p>
                )}
              </div>

              <div className="text-[10px] text-slate-500 text-right">
                SuperMemo SM-2 Revision Stage
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Card Front (Question / Concept) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. What is the CAP Theorem?"
                  value={manualFront}
                  onChange={(e) => setManualFront(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Card Back (Answer / Solution) *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. A distributed system can only provide two of Consistency, Availability, and Partition Tolerance."
                  value={manualBack}
                  onChange={(e) => setManualBack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Memory Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eric Brewer conjecture"
                  value={manualHint}
                  onChange={(e) => setManualHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!manualFront.trim() || !manualBack.trim()}
                onClick={handleAddManualCard}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Save Flashcard
              </button>
            </div>
          </div>
        )}

        {/* AI Generating Animation */}
        {isGenerating && (
          <div className="p-8 rounded-2xl bg-slate-950 border border-indigo-500/40 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">AI Engine Formulating Recall Flashcards...</h4>
              <p className="text-xs text-indigo-300 font-mono mt-1">{generationStep}</p>
            </div>
            <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        )}

        {/* AI Generated Result Cards Review */}
        {generatedCandidates.length > 0 && !isGenerating && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Generated {generatedCandidates.length} Flashcard Candidates:
              </span>
              <span className="text-slate-400">
                {generatedCandidates.filter((c) => c.selected).length} selected to add
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {generatedCandidates.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleToggleSelect(card.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    card.selected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={card.selected}
                      onChange={() => handleToggleSelect(card.id)}
                      className="mt-0.5 accent-indigo-500 rounded"
                    />
                    <div className="space-y-1 text-xs min-w-0 flex-1">
                      <p className="font-bold text-slate-100">{card.front}</p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{card.back}</p>
                      {card.hint && (
                        <p className="text-amber-400 text-[10px] italic">💡 {card.hint}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isDone ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Added to Revision Deck!
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGeneratedCandidates([])}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleSaveSelectedCards}
                  disabled={generatedCandidates.filter((c) => c.selected).length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" /> Add {generatedCandidates.filter((c) => c.selected).length} Cards to Deck
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

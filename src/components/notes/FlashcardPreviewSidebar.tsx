import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Brain, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

interface FlashcardPreviewSidebarProps {
  noteId: string;
  onOpenReviewModal: () => void;
}

export const FlashcardPreviewSidebar: React.FC<FlashcardPreviewSidebarProps> = ({
  noteId,
  onOpenReviewModal,
}) => {
  const { flashcards } = useApp();

  const noteCards = flashcards.filter((c) => c.noteId === noteId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-400" /> Auto Flashcards ({noteCards.length})
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">Parsed via `Concept :: Definition`</p>
        </div>

        {noteCards.length > 0 && (
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            <span>Review</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Cards List */}
      {noteCards.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-indigo-400 mx-auto opacity-70" />
          <p className="text-xs text-slate-300 font-medium">No Flashcards in this doc yet</p>
          <p className="text-[11px] text-slate-500">
            Write <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">Question :: Answer</code> on any line to automatically create spaced repetition cards.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {noteCards.map((card) => {
            const isMastered = card.status === 'mastered';
            const isNew = card.status === 'new';

            return (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 text-xs"
              >
                {/* Front (Question) */}
                <div className="font-semibold text-slate-200 line-clamp-2">
                  Q: {card.front}
                </div>

                {/* Back (Answer) */}
                <div className="text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20 line-clamp-3 text-[11px]">
                  A: {card.back}
                </div>

                {/* Meta / SM-2 Info */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                      isMastered
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : isNew
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {card.status}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due: {card.nextReviewDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

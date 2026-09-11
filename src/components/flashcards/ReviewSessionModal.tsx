import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Flashcard } from '../../types';
import { isCardDue, getIntervalPreview, ReviewRating } from '../../services/sm2Service';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Keyboard,
} from 'lucide-react';

interface ReviewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterSubjectId?: string;
}

export const ReviewSessionModal: React.FC<ReviewSessionModalProps> = ({
  isOpen,
  onClose,
  filterSubjectId,
}) => {
  const { flashcards, reviewFlashcard, subjects } = useApp();

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Filter cards to review (Due cards prioritized, or filter by subject)
  const sessionCards = React.useMemo(() => {
    let cards = [...flashcards];
    if (filterSubjectId) {
      cards = cards.filter((c) => c.subjectId === filterSubjectId);
    }
    // Sort due cards first
    return cards.sort((a, b) => {
      const aDue = isCardDue(a) ? 1 : 0;
      const bDue = isCardDue(b) ? 1 : 0;
      return bDue - aDue;
    });
  }, [flashcards, filterSubjectId, isOpen]);

  const currentCard: Flashcard | undefined = sessionCards[currentIndex];

  // Reset session when opening
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
      setCurrentIndex(0);
      setReviewedCount(0);
      setIsComplete(false);
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isComplete || !currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipped, currentIndex, isComplete, currentCard]);

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return;

    reviewFlashcard(currentCard.id, rating);
    setReviewedCount((prev) => prev + 1);

    if (currentIndex + 1 < sessionCards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b'],
        });
      } catch {}
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Spaced Repetition Review (SM-2)"
      subtitle={`Reviewing ${sessionCards.length} concept cards to strengthen long-term memory`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 sm:space-y-6">
        {isComplete ? (
          /* Completion Screen */
          <div className="py-6 sm:py-8 text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Review Session Complete! 🎉</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                You reviewed <strong>{reviewedCount}</strong> flashcards today. Your SuperMemo intervals have been updated!
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : sessionCards.length === 0 ? (
          /* No Cards Available */
          <div className="py-8 sm:py-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base sm:text-lg font-bold text-slate-100">All Caught Up!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have zero cards scheduled for review right now. Keep writing notes with <code className="text-indigo-300">Front :: Back</code> to generate new cards!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          /* Active Card Review Interface */
          <div className="space-y-4 sm:space-y-5">
            {/* Progress & Card Position */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-xs">
                  {currentCard?.subjectName}
                </span>
                <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[200px] text-[11px] sm:text-xs">
                  Doc: {currentCard?.noteTitle}
                </span>
              </div>
              <span className="font-mono text-slate-400 font-semibold text-[11px] sm:text-xs">
                Card <strong className="text-indigo-400">{currentIndex + 1}</strong> of {sessionCards.length}
              </span>
            </div>

            {/* 3D Flip Flashcard */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[170px] sm:min-h-[210px] p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/80 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition-all select-none relative group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-400 text-[11px] sm:text-xs">
                  {isFlipped ? '💡 ANSWER' : '❓ QUESTION'}
                </span>
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 group-hover:text-indigo-300 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" /> Tap or Space to Flip
                </span>
              </div>

              {/* Card Text */}
              <div className="my-auto text-center px-2 sm:px-4 py-3">
                <p className="text-base sm:text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
                  {isFlipped ? currentCard?.back : currentCard?.front}
                </p>
              </div>

              {/* Bottom Meta */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-2.5 border-t border-slate-800">
                <span>Repetitions: {currentCard?.repetitions}</span>
                <span>Ease Factor: {currentCard?.easeFactor}</span>
              </div>
            </div>

            {/* Rating Buttons (Shown after card flip) */}
            {isFlipped ? (
              <div className="space-y-2">
                <div className="text-[11px] sm:text-xs text-slate-400 text-center font-medium">
                  How well did you recall this concept?
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {/* Rating 1: Again */}
                  <button
                    type="button"
                    onClick={() => handleRate(1)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-200 text-xs font-semibold flex flex-col items-center gap-0.5 sm:gap-1 transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-red-400 font-bold">1. Again</span>
                    <span className="text-[10px] text-red-300/80 font-mono">
                      {currentCard && getIntervalPreview(currentCard, 1)}
                    </span>
                  </button>

                  {/* Rating 2: Hard */}
                  <button
                    type="button"
                    onClick={() => handleRate(2)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-200 text-xs font-semibold flex flex-col items-center gap-0.5 sm:gap-1 transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-amber-400 font-bold">2. Hard</span>
                    <span className="text-[10px] text-amber-300/80 font-mono">
                      {currentCard && getIntervalPreview(currentCard, 2)}
                    </span>
                  </button>

                  {/* Rating 3: Good */}
                  <button
                    type="button"
                    onClick={() => handleRate(3)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/60 text-indigo-200 text-xs font-semibold flex flex-col items-center gap-0.5 sm:gap-1 transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-indigo-400 font-bold">3. Good</span>
                    <span className="text-[10px] text-indigo-300/80 font-mono">
                      {currentCard && getIntervalPreview(currentCard, 3)}
                    </span>
                  </button>

                  {/* Rating 4: Easy */}
                  <button
                    type="button"
                    onClick={() => handleRate(4)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-200 text-xs font-semibold flex flex-col items-center gap-0.5 sm:gap-1 transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-emerald-400 font-bold">4. Easy</span>
                    <span className="text-[10px] text-emerald-300/80 font-mono">
                      {currentCard && getIntervalPreview(currentCard, 4)}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <RotateCw className="w-4 h-4" /> Show Answer (Space)
                </button>
              </div>
            )}

            {/* Keyboard Shortcuts Helper (Hidden on mobile) */}
            <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
              <span className="flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-slate-400" /> Space: Flip
              </span>
              <span>1: Again</span>
              <span>2: Hard</span>
              <span>3: Good</span>
              <span>4: Easy</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

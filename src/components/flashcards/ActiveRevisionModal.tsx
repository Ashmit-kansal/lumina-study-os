import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { RevisionScheduleItem, Flashcard } from '../../types';
import { ReviewRating } from '../../services/sm2Service';
import {
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle2,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Calendar,
  Check,
  Award,
  Zap,
  Layers,
} from 'lucide-react';

interface ActiveRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionItem: RevisionScheduleItem | null;
  onOpenAIGenerator?: (subjectId?: string, noteId?: string) => void;
}

interface AIQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ActiveRevisionModal: React.FC<ActiveRevisionModalProps> = ({
  isOpen,
  onClose,
  revisionItem,
  onOpenAIGenerator,
}) => {
  const { flashcards, reviewFlashcard, completeRevision } = useApp();

  // Workflow stages: 'study' -> 'decision' -> 'quiz' | 'manual_interval' -> 'completed'
  const [stage, setStage] = useState<'study' | 'decision' | 'quiz' | 'manual_interval' | 'completed'>('study');
  const [studyMode, setStudyMode] = useState<'ai_cards' | 'custom_cards'>('ai_cards');

  // AI Flashcards state
  const [currentAICardIndex, setCurrentAICardIndex] = useState(0);
  const [isAICardFlipped, setIsAICardFlipped] = useState(false);

  // Custom Deck state
  const [currentCustomCardIndex, setCurrentCustomCardIndex] = useState(0);
  const [isCustomCardFlipped, setIsCustomCardFlipped] = useState(false);
  const [reviewedCustomCount, setReviewedCustomCount] = useState(0);

  // AI Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [manualNextDays, setManualNextDays] = useState<number>(7);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setStage('study');
      setStudyMode('ai_cards');
      setCurrentAICardIndex(0);
      setIsAICardFlipped(false);
      setCurrentCustomCardIndex(0);
      setIsCustomCardFlipped(false);
      setReviewedCustomCount(0);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
    }
  }, [isOpen, revisionItem?.id]);

  if (!revisionItem) return null;

  // Retrieve custom flashcards linked to this note or subject
  const linkedCustomCards: Flashcard[] = flashcards.filter((c) => {
    if (revisionItem.targetType === 'file') {
      return c.noteId === revisionItem.targetId || (c.subjectId === revisionItem.subjectId && !c.noteId);
    }
    return c.subjectId === revisionItem.subjectId;
  });

  // Generate simulated AI Flashcards for this item
  const aiSampleCards = [
    {
      id: 'ai_1',
      front: `What is the core principle of ${revisionItem.title.replace(/\.[^/.]+$/, '')}?`,
      back: 'Guarantees state consistency, active recall retention, and fault tolerance through quorum consensus and structured invariants.',
      hint: 'Think about foundational axioms, active replicas, and consensus state machines.',
    },
    {
      id: 'ai_2',
      front: `What are the primary failure recovery and edge case behaviors in ${revisionItem.title.replace(/\.[^/.]+$/, '')}?`,
      back: 'Heartbeat timeouts trigger leader election cycles while uncommitted log entries are cleanly overwritten to prevent split-brain states.',
      hint: 'Refer to election timeouts, log matching properties, and term synchronization.',
    },
    {
      id: 'ai_3',
      front: 'What trade-offs exist between latency, throughput, and consistency?',
      back: 'Requires majority (N/2 + 1) node confirmations before acknowledging client transactions to preserve linearizability.',
      hint: 'Quorum verification and CAP theorem trade-offs.',
    },
    {
      id: 'ai_4',
      front: 'How can active recall and spaced repetition strengthen long-term retention of this topic?',
      back: 'Retrieval practice interrupts the Ebbinghaus forgetting curve, increasing synapse strength and neural pathway consolidation.',
      hint: 'SuperMemo SM-2 interval expansion algorithm.',
    },
  ];

  // Generate AI Quiz Questions
  const quizQuestions: AIQuizQuestion[] = [
    {
      id: 'q1',
      question: `In ${revisionItem.title.replace(/\.[^/.]+$/, '')}, how is consistency maintained across replicas?`,
      options: [
        'By allowing arbitrary asynchronous writes without quorum',
        'By requiring majority (N/2 + 1) confirmation on log replication',
        'By disabling partitioning guarantees completely',
        'By relying exclusively on client-side timestamp clocks',
      ],
      correctIndex: 1,
      explanation: 'Majority quorum (N/2 + 1) ensures at least one overlapping node contains the latest committed state.',
    },
    {
      id: 'q2',
      question: 'What occurs when an active heartbeat timeout is reached in distributed systems?',
      options: [
        'All cluster nodes shut down safely',
        'Follower transitions to Candidate state and increments term counter',
        'Client requests are permanently dropped',
        'The previous leader is immediately re-elected with zero votes',
      ],
      correctIndex: 1,
      explanation: 'Heartbeat timeouts initiate an election cycle to elect a new authoritative leader.',
    },
    {
      id: 'q3',
      question: 'Why are randomized election timeouts critical for cluster stability?',
      options: [
        'To reduce network bandwidth consumption',
        'To prevent split votes and multiple candidates competing indefinitely',
        'To speed up CPU clock cycles',
        'To compress disk storage logs',
      ],
      correctIndex: 1,
      explanation: 'Randomization breaks symmetry so one candidate times out first and captures majority votes.',
    },
  ];

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });
    return correct;
  };

  const getRecommendedInterval = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 90) return { days: 14, label: '14 Days (Excellent Mastery)' };
    if (pct >= 60) return { days: 7, label: '7 Days (Good Retention)' };
    return { days: 2, label: '2 Days (Needs Reinforcement)' };
  };

  const handleFinishWithQuizScore = () => {
    const score = calculateScore();
    const pct = Math.round((score / quizQuestions.length) * 100);
    const rec = getRecommendedInterval(score, quizQuestions.length);
    completeRevision(revisionItem.id, rec.days, pct);
    setStage('completed');
  };

  const handleFinishWithManualInterval = () => {
    completeRevision(revisionItem.id, manualNextDays);
    setStage('completed');
  };

  const handleRateCustomCard = (rating: ReviewRating) => {
    if (!linkedCustomCards[currentCustomCardIndex]) return;
    reviewFlashcard(linkedCustomCards[currentCustomCardIndex].id, rating);
    setReviewedCustomCount((prev) => prev + 1);

    if (currentCustomCardIndex < linkedCustomCards.length - 1) {
      setCurrentCustomCardIndex((prev) => prev + 1);
      setIsCustomCardFlipped(false);
    } else {
      setIsCustomCardFlipped(false);
    }
  };

  const currentAICard = aiSampleCards[currentAICardIndex];
  const currentCustomCard = linkedCustomCards[currentCustomCardIndex];

  const handleQuickMarkComplete = () => {
    const nextDays = revisionItem.intervalDays ? Math.max(1, Math.round(revisionItem.intervalDays * 2)) : 3;
    completeRevision(revisionItem.id, nextDays);
    setStage('completed');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Active Revision: ${revisionItem.title}`}
      subtitle={`Revision #${revisionItem.revisionCount + 1} • Subject: ${revisionItem.subjectName}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* STAGE 1: STUDY SESSION (2 Intuitive Recall Modes)                         */}
        {/* ========================================================================= */}
        {stage === 'study' && (
          <div className="space-y-4">
            {/* Mode Switcher Tabs: AI Cards vs Custom Deck */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setStudyMode('ai_cards')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  studyMode === 'ai_cards'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                <span>AI Recall Cards ({aiSampleCards.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode('custom_cards')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  studyMode === 'custom_cards'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>My Custom Deck ({linkedCustomCards.length})</span>
              </button>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* OPTION 1: AI ACTIVE RECALL CARDS                                      */}
            {/* --------------------------------------------------------------------- */}
            {studyMode === 'ai_cards' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">
                    AI Concept {currentAICardIndex + 1} of {aiSampleCards.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAICardFlipped(!isAICardFlipped)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip Card (Space)</span>
                  </button>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsAICardFlipped(!isAICardFlipped)}
                  className={`w-full min-h-[190px] p-6 rounded-3xl border cursor-pointer transition-all duration-500 shadow-2xl flex flex-col justify-between select-none ${
                    isAICardFlipped
                      ? 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border-purple-500/50 shadow-purple-500/10'
                      : 'bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border-indigo-500/40 shadow-indigo-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${
                        isAICardFlipped
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isAICardFlipped ? 'ANSWER / SYNTHESIS' : 'AI ACTIVE RECALL PROMPT'}
                    </span>
                    <span className="text-slate-500 text-[10px]">Click anywhere to flip 🔄</span>
                  </div>

                  <div className="my-4 text-center">
                    <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                      {isAICardFlipped ? currentAICard.back : currentAICard.front}
                    </p>
                    {currentAICard.hint && !isAICardFlipped && (
                      <p className="text-xs text-amber-400 mt-2 italic">💡 Hint: {currentAICard.hint}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Topic: {revisionItem.title}</span>
                    <span>AI Spaced Repetition Engine</span>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentAICardIndex === 0}
                    onClick={() => {
                      setCurrentAICardIndex((prev) => Math.max(0, prev - 1));
                      setIsAICardFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {aiSampleCards.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentAICardIndex ? 'bg-indigo-400 w-4' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentAICardIndex === aiSampleCards.length - 1}
                    onClick={() => {
                      setCurrentAICardIndex((prev) => Math.min(aiSampleCards.length - 1, prev + 1));
                      setIsAICardFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    Next Card <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* OPTION 2: MY CUSTOM FLASHCARD DECK (SM-2 Rating Support)              */}
            {/* --------------------------------------------------------------------- */}
            {studyMode === 'custom_cards' && (
              <div className="space-y-4">
                {linkedCustomCards.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">No custom flashcards created for this note yet</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        You can generate instant AI flashcards, or create cards directly from your notes using <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">Question :: Answer</code> syntax.
                      </p>
                    </div>
                    {onOpenAIGenerator && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAIGenerator(revisionItem.subjectId, revisionItem.targetType === 'file' ? revisionItem.targetId : undefined);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" /> Generate AI Cards Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>Card {currentCustomCardIndex + 1} of {linkedCustomCards.length}</span>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        Reviewed: {reviewedCustomCount}/{linkedCustomCards.length}
                      </span>
                    </div>

                    {/* Custom 3D Flip Card */}
                    <div
                      onClick={() => setIsCustomCardFlipped(!isCustomCardFlipped)}
                      className={`w-full min-h-[190px] p-6 rounded-3xl border cursor-pointer transition-all duration-500 shadow-2xl flex flex-col justify-between select-none ${
                        isCustomCardFlipped
                          ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 border-emerald-500/50 shadow-emerald-500/10'
                          : 'bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border-indigo-500/40 shadow-indigo-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full ${
                            isCustomCardFlipped
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {isCustomCardFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}
                        </span>
                        <span className="text-slate-500 text-[10px]">Click to flip 🔄</span>
                      </div>

                      <div className="my-4 text-center">
                        <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                          {isCustomCardFlipped ? currentCustomCard.back : currentCustomCard.front}
                        </p>
                        {currentCustomCard.hint && !isCustomCardFlipped && (
                          <p className="text-xs text-amber-400 mt-2 italic">💡 Hint: {currentCustomCard.hint}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Status: <strong className="text-slate-300 capitalize">{currentCustomCard.status}</strong></span>
                        <span>Due: {currentCustomCard.nextReviewDate}</span>
                      </div>
                    </div>

                    {/* SM-2 Recall Rating Feedback Buttons (Visible when flipped) */}
                    {isCustomCardFlipped ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] text-slate-400 text-center font-semibold">
                          How well did you remember this? (SM-2 Recall Rating):
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { rating: 0 as ReviewRating, label: 'Again', desc: '< 1d', color: 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-800' },
                            { rating: 3 as ReviewRating, label: 'Hard', desc: '1-2d', color: 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-800' },
                            { rating: 4 as ReviewRating, label: 'Good', desc: '4-7d', color: 'bg-blue-950/80 hover:bg-blue-900 text-blue-300 border-blue-800' },
                            { rating: 5 as ReviewRating, label: 'Easy', desc: '14d+', color: 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800' },
                          ].map((btn) => (
                            <button
                              key={btn.label}
                              type="button"
                              onClick={() => handleRateCustomCard(btn.rating)}
                              className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${btn.color}`}
                            >
                              <div>{btn.label}</div>
                              <div className="text-[10px] opacity-75 font-normal">{btn.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={currentCustomCardIndex === 0}
                          onClick={() => {
                            setCurrentCustomCardIndex((prev) => Math.max(0, prev - 1));
                            setIsCustomCardFlipped(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomCardFlipped(true)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                        >
                          Show Answer
                        </button>
                        <button
                          type="button"
                          disabled={currentCustomCardIndex === linkedCustomCards.length - 1}
                          onClick={() => {
                            setCurrentCustomCardIndex((prev) => Math.min(linkedCustomCards.length - 1, prev + 1));
                            setIsCustomCardFlipped(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                        >
                          Next <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Completion Trigger Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Exit
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickMarkComplete}
                  className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  title="Mark this revision as complete and advance the spaced repetition interval"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mark as Complete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStage('decision')}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Test Recall / Finish</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: DECISION PROMPT (AI Quiz vs Manual Interval)                     */}
        {/* ========================================================================= */}
        {stage === 'decision' && (
          <div className="space-y-5 p-2 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">How would you like to set the next revision interval?</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Test your retention with a quick AI Quiz to dynamically adapt your spaced repetition schedule, or set your next interval manually.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
              {/* Option A: Take AI Quiz */}
              <div
                onClick={() => setStage('quiz')}
                className="glass-panel p-5 rounded-2xl border border-indigo-500/40 hover:border-indigo-400 cursor-pointer transition-all hover:scale-[1.02] space-y-3 text-left group bg-gradient-to-br from-indigo-950/40 to-slate-900"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 group-hover:text-indigo-300 text-sm">
                    Take 3-Question AI Quiz
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    AI tests your recall and calculates the scientifically optimal next revision date based on your score.
                  </p>
                </div>
              </div>

              {/* Option B: Set Interval Manually */}
              <div
                onClick={() => setStage('manual_interval')}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-600 cursor-pointer transition-all hover:scale-[1.02] space-y-3 text-left group bg-slate-900/60"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 group-hover:text-white text-sm">
                    Set Custom Interval Manually
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose your own next review date (e.g. 3 days, 1 week, 2 weeks) without taking a quiz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3A: AI QUIZ ASSESSMENT                                              */}
        {/* ========================================================================= */}
        {stage === 'quiz' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </span>
              <span>AI Active Recall Test</span>
            </div>

            {/* Question Card */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-indigo-500/30 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-slate-100 leading-relaxed">
                {quizQuestions[currentQuestionIndex].question}
              </h4>

              <div className="space-y-2">
                {quizQuestions[currentQuestionIndex].options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;
                  const isCorrect = oIdx === quizQuestions[currentQuestionIndex].correctIndex;
                  let optStyle = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80';

                  if (isQuizSubmitted) {
                    if (isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold';
                    } else if (isSelected) {
                      optStyle = 'border-red-500 bg-red-950/50 text-red-200';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-semibold';
                  }

                  return (
                    <div
                      key={oIdx}
                      onClick={() => {
                        if (!isQuizSubmitted) {
                          setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: oIdx }));
                        }
                      }}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isQuizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation after submit */}
              {isQuizSubmitted && (
                <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Explanation:
                  </span>
                  <p>{quizQuestions[currentQuestionIndex].explanation}</p>
                </div>
              )}
            </div>

            {/* Quiz Nav Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : !isQuizSubmitted ? (
                <button
                  type="button"
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  onClick={() => setIsQuizSubmitted(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> Submit Quiz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWithQuizScore}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Score & Next Schedule
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3B: MANUAL NEXT INTERVAL                                            */}
        {/* ========================================================================= */}
        {stage === 'manual_interval' && (
          <div className="space-y-4 animate-fade-in text-center p-2 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-white">Select next revision interval:</h4>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '3 Days', days: 3 },
                { label: '7 Days (1 Week)', days: 7 },
                { label: '14 Days (2 Weeks)', days: 14 },
                { label: '30 Days (1 Month)', days: 30 },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setManualNextDays(item.days)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                    manualNextDays === item.days
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFinishWithManualInterval}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
            >
              <Check className="w-4 h-4" />
              <span>Confirm {manualNextDays}-Day Interval</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: COMPLETED SUMMARY                                                */}
        {/* ========================================================================= */}
        {stage === 'completed' && (
          <div className="space-y-4 text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Revision Successfully Completed!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your spaced repetition schedule and SM-2 memory parameters have been updated for <strong>{revisionItem.title}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              Back to Workspace
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { RevisionScheduleItem, Flashcard } from '../../types';
import {
  Brain,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Calendar,
  Check,
  Award,
  Zap,
} from 'lucide-react';
import { markdownToFormattedHtml } from '../../utils/textFormatter';

interface ActiveRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionItem: RevisionScheduleItem | null;
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
}) => {
  const { notes, folders, subjects, completeRevision } = useApp();

  // Workflow stages: 'study' -> 'decision' -> 'quiz' | 'manual_interval' -> 'completed'
  const [stage, setStage] = useState<'study' | 'decision' | 'quiz' | 'manual_interval' | 'completed'>('study');
  const [studyMode, setStudyMode] = useState<'ai_cards' | 'manual_reader'>('ai_cards');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // AI Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [manualNextDays, setManualNextDays] = useState<number>(7);

  if (!revisionItem) return null;

  // Retrieve target text content
  let targetContent = '';
  if (revisionItem.targetType === 'file') {
    const file = notes.find((n) => n.id === revisionItem.targetId);
    targetContent = file?.content || '';
  } else {
    // Combine notes in the folder
    const folderDocs = notes.filter((n) => n.folderId === revisionItem.targetId);
    targetContent = folderDocs.map((d) => d.content).join('\n\n');
  }

  // Generate simulated AI Flashcards for this item
  const sampleCards = [
    {
      id: 'c1',
      front: `What is the core principle of ${revisionItem.title.replace(/\.[^/.]+$/, '')}?`,
      back: 'Guarantees state consistency and high availability through deterministic quorum consensus.',
      hint: 'Think about active replicas and consensus protocols.',
    },
    {
      id: 'c2',
      front: 'What are the main edge cases and failure recovery mechanisms?',
      back: 'Heartbeat timeouts trigger leader reelection while uncommitted log entries are cleanly overwritten.',
      hint: 'Refer to election timeouts and log matching invariants.',
    },
    {
      id: 'c3',
      front: 'What trade-offs are made between latency and data consistency?',
      back: 'Requires majority (N/2 + 1) node confirmations before confirming writes to clients.',
      hint: 'Quorum write verification model.',
    },
  ];

  // Generate 3 AI Quiz Questions
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
      question: 'What occurs when an active heartbeat timeout is reached?',
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
      question: 'Why are randomized election timeouts critical for stability?',
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

  // Calculate Quiz Score
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

  const currentCard = sampleCards[currentCardIndex];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Active Revision: ${revisionItem.title}`}
      subtitle={`Revision #${revisionItem.revisionCount + 1} • Subject: ${revisionItem.subjectName}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* STAGE 1: STUDY SESSION (AI Flashcards or Manual Reader) */}
        {stage === 'study' && (
          <div className="space-y-4">
            {/* Mode Switcher Pill */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setStudyMode('ai_cards')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  studyMode === 'ai_cards'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI-Generated Flashcards Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode('manual_reader')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  studyMode === 'manual_reader'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Manual Document Reader</span>
              </button>
            </div>

            {/* Option 1: AI Flashcards */}
            {studyMode === 'ai_cards' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Card {currentCardIndex + 1} of {sampleCards.length}</span>
                  <button
                    type="button"
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip Card</span>
                  </button>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className={`w-full min-h-[180px] p-6 rounded-3xl border cursor-pointer transition-all duration-500 shadow-2xl flex flex-col justify-between ${
                    isCardFlipped
                      ? 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border-purple-500/50 shadow-purple-500/10'
                      : 'bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border-indigo-500/40 shadow-indigo-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${
                        isCardFlipped
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isCardFlipped ? 'ANSWER / CONCEPT' : 'QUESTION / PROMPT'}
                    </span>
                    <span className="text-slate-500 text-[10px]">Click anywhere to flip 🔄</span>
                  </div>

                  <div className="my-4 text-center">
                    <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                      {isCardFlipped ? currentCard.back : currentCard.front}
                    </p>
                    {currentCard.hint && !isCardFlipped && (
                      <p className="text-xs text-amber-400 mt-2 italic">💡 Hint: {currentCard.hint}</p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 text-right">
                    Active Recall Revision
                  </div>
                </div>

                {/* Card Nav Controls */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                      setIsCardFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <button
                    type="button"
                    disabled={currentCardIndex === sampleCards.length - 1}
                    onClick={() => {
                      setCurrentCardIndex((prev) => Math.min(sampleCards.length - 1, prev + 1));
                      setIsCardFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    Next Card <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Option 2: Manual Reader */}
            {studyMode === 'manual_reader' && (
              <div className="space-y-3">
                <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 max-h-[300px] overflow-y-auto space-y-3 text-slate-100 text-sm leading-relaxed prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: markdownToFormattedHtml(targetContent),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Completion Trigger */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Exit
              </button>

              <button
                type="button"
                onClick={() => setStage('decision')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>I Have Revised This</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: DECISION PROMPT (AI Quiz vs Manual Interval) */}
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
                <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                  Start AI Quiz →
                </span>
              </div>

              {/* Option B: Manual Next Interval */}
              <div
                onClick={() => setStage('manual_interval')}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.02] space-y-3 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 group-hover:text-slate-300 text-sm">
                    Set Schedule Manually
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose when you want to revise next without taking an evaluation quiz.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  Choose Date →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3A: AI QUIZ */}
        {stage === 'quiz' && (
          <div className="space-y-4 animate-fade-in">
            {!isQuizSubmitted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-indigo-300">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span>AI Retention Quiz</span>
                </div>

                {/* Current Question */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {quizQuestions[currentQuestionIndex].question}
                  </h4>

                  <div className="space-y-2 pt-1">
                    {quizQuestions[currentQuestionIndex].options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [currentQuestionIndex]: optIdx,
                            }))
                          }
                          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nav & Submit */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold"
                  >
                    Previous Question
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      type="button"
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      Next Question <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                      onClick={() => setIsQuizSubmitted(true)}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg"
                    >
                      Submit &amp; Calculate Next Interval
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Score & AI Interval Calculation Result */
              <div className="p-6 rounded-3xl bg-slate-950 border border-indigo-500/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                  <Award className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Quiz Evaluation Complete
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200 max-w-md mx-auto space-y-1">
                  <p className="font-bold text-indigo-300">
                    🧠 AI Spaced Repetition Recommendation:
                  </p>
                  <p>
                    {getRecommendedInterval(calculateScore(), quizQuestions.length).label}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Timer &amp; Email reminder will be scheduled for this new date.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFinishWithQuizScore}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                >
                  Accept AI Interval &amp; Save Schedule
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3B: MANUAL NEXT INTERVAL */}
        {stage === 'manual_interval' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">Choose Next Revision Timer</h4>
              <p className="text-xs text-slate-400">
                Pick how many days until this folder/file is due for review again.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-lg mx-auto pt-2">
              {[
                { label: '1 Day', days: 1 },
                { label: '3 Days', days: 3 },
                { label: '7 Days (1 Wk)', days: 7 },
                { label: '14 Days (2 Wk)', days: 14 },
                { label: '30 Days (1 Mo)', days: 30 },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setManualNextDays(item.days)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    manualNextDays === item.days
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStage('decision')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinishWithManualInterval}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Save {manualNextDays}-Day Interval
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: COMPLETED CONFIRMATION */}
        {stage === 'completed' && (
          <div className="p-8 rounded-3xl bg-slate-950 border border-emerald-500/40 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Revision Recorded Successfully!</h3>
              <p className="text-xs text-slate-300">
                Your schedule for <strong>{revisionItem.title}</strong> has been updated. An email alert will be sent when the timer expires.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Done &amp; Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

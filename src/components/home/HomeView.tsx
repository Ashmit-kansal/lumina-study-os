import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTimer } from '../../context/TimerContext';
import { useRoom } from '../../context/RoomContext';
import { useAudio } from '../../context/AudioContext';
import { isCardDue } from '../../services/sm2Service';
import {
  Timer,
  Users,
  FileText,
  Brain,
  BarChart3,
  Flame,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Cloud,
  Headphones,
  Mail,
  Zap,
  BookOpen,
  Coffee,
  ShieldCheck,
  HardDrive,
  Layers,
  Repeat,
  Trophy,
  RotateCw,
  LogIn,
  Check,
  Globe,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

interface HomeViewProps {
  onNavigate?: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate: propOnNavigate }) => {
  const router = useRouter();
  const onNavigate = propOnNavigate || router.navigateToTab;
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { flashcards, subjects, studyStreakDays, dailyLogs, r2Config, emailConfig } = useApp();
  const { isRunning, formattedTime, mode, startTimer } = useTimer();
  const { peers } = useRoom();
  const { isPlayingLofi, toggleLofi, currentTrack } = useAudio();

  // Interactive Demo Flashcard state for visitors
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeDemoCardIndex, setActiveDemoCardIndex] = useState(0);

  const DEMO_CARDS = [
    {
      topic: 'Distributed Systems',
      front: 'What is the CAP Theorem trade-off in distributed databases?',
      back: 'A distributed system can guarantee at most TWO out of three properties: Consistency, Availability, and Partition Tolerance.',
    },
    {
      topic: 'Cognitive Science',
      front: 'How does the SuperMemo SM-2 algorithm calculate review intervals?',
      back: 'Intervals expand exponentially based on repetition count (I₁=1d, I₂=6d, Iₙ=Iₙ₋₁×EF) and ease factor (EF >= 1.3).',
    },
    {
      topic: 'Neural Networks',
      front: 'Why is Backpropagation combined with Gradient Descent?',
      back: 'Backpropagation computes the loss gradients with respect to weights using the chain rule, enabling gradient descent to minimize error.',
    },
  ];

  const currentDemoCard = DEMO_CARDS[activeDemoCardIndex];

  const handleNextDemoCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setActiveDemoCardIndex((prev) => (prev + 1) % DEMO_CARDS.length);
  };

  const dueCards = flashcards.filter(isCardDue);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find((l) => l.date === todayStr);
  const todayMinutes = todayLog?.totalMinutes || 0;
  const todayHours = (todayMinutes / 60).toFixed(1);

  return (
    <div className="space-y-14 max-w-6xl mx-auto pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-6 pb-2 text-center md:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text (col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill Badge with Status / User Greeting */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isAuthenticated && user
                  ? `Welcome back, ${user.name} ${user.countryFlag || '⚡'}`
                  : '⚡ Lumina Study OS • All-in-One Deep Work & Memory Suite'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Focus Deeper.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Remember Longer.
              </span>{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Study Smarter.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
              Stop juggling separate timer apps, Zoom calls, messy notes, and flashcard tools.
              Lumina unifies <strong>Subject-based Pomodoro</strong>, <strong>Minimalist Peer Study Rooms</strong> with Lo-Fi,
              <strong>RemNote hierarchical outlines</strong>, and <strong>SuperMemo SM-2 Spaced Repetition</strong> in one clean, local-first workspace.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('pomodoro')}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95"
              >
                <Timer className="w-4 h-4" /> Start Focus Session
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('rooms')}
                className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-md"
              >
                <Users className="w-4 h-4 text-emerald-400" /> Join Study Room ({peers.length} online)
              </button>

              <button
                type="button"
                onClick={() => onNavigate('revision')}
                className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-md"
              >
                <Brain className="w-4 h-4 text-pink-400" /> Smart Revision ({dueCards.length} due)
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-3.5 bg-slate-950/80 hover:bg-slate-900 border border-indigo-500/40 text-indigo-300 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Demo
                </button>
              )}
            </div>

            {/* Micro Highlights Banner */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline &amp; Local Storage
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-400" /> Zero Video Camera Pressure
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-purple-400" /> SM-2 Memory Algorithm
              </span>
            </div>
          </div>

          {/* Right Hero Live Interactive Snapshot Card (col-span-5) */}
          <div className="lg:col-span-5">
            <div className="glass-panel-glow p-6 rounded-3xl border border-indigo-500/30 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy className="w-40 h-40 text-indigo-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Your Today Dashboard
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {studyStreakDays} Day Streak
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Today's Focus</div>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">{todayHours}h</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">{todayMinutes} minutes recorded</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Cards Due</div>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">{dueCards.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">SM-2 Spaced Repetition</div>
                </div>
              </div>

              {/* Active Timer Pill */}
              <div className="p-3.5 bg-indigo-950/50 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isRunning ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      {isRunning ? 'Session in Progress' : 'Timer Ready'}
                    </div>
                    <div className="text-[11px] text-indigo-300 font-mono">
                      {formattedTime} • {mode === 'focus' ? 'Focus Session' : 'Break'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('pomodoro')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
                >
                  {isRunning ? 'View Timer' : 'Launch'}
                </button>
              </div>

              {/* Interactive Try-it Flashcard Widget */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="p-3.5 bg-slate-950/70 hover:bg-slate-950 rounded-2xl border border-purple-500/30 cursor-pointer group transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-[11px] text-purple-300 mb-1.5">
                  <span className="flex items-center gap-1 font-semibold">
                    <Brain className="w-3.5 h-3.5 text-pink-400" /> Interactive Sample Card: {currentDemoCard.topic}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDemoCard}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-300 transition-colors p-1"
                    title="Try Next Sample Card"
                  >
                    <RotateCw className="w-3 h-3" /> Next
                  </button>
                </div>

                <div className="text-xs text-slate-200 min-h-[38px] flex items-center">
                  {!isFlipped ? (
                    <span className="italic text-slate-300">"{currentDemoCard.front}"</span>
                  ) : (
                    <span className="font-semibold text-emerald-300">✓ {currentDemoCard.back}</span>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 text-right mt-1 font-mono">
                  {isFlipped ? 'Click to flip back' : 'Click card to reveal answer 🔄'}
                </div>
              </div>

              {/* Quick Audio Bar Preview */}
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 truncate">
                  <Headphones className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-300 truncate text-[11px]">
                    {currentTrack.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleLofi}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold flex-shrink-0"
                >
                  {isPlayingLofi ? 'Pause' : 'Play Lo-Fi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Before vs. After: The Student Problem Solved */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Why We Built Lumina
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Stop Fragmenting Your Learning Workflow
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Studying today is broken by app-switching, camera fatigue, and forgetting concepts right before exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Old Way */}
          <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
              <XCircle className="w-5 h-5" /> The Broken, Fragmented Way
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>5+ open tabs:</strong> Timer on one site, Lo-Fi on YouTube, notes in Docs, flashcards in Anki.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>Video camera anxiety:</strong> Video study rooms cause self-consciousness and battery drain.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>The Forgetting Curve:</strong> Notes sit unread in folders, and formulas fade within 48 hours.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span><strong>Generic Timers:</strong> Kitchen timers don't track effort per course or weekly study targets.</span>
              </li>
            </ul>
          </div>

          {/* The Lumina Way */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" /> The Unified Lumina OS Way
            </div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>1 Integrated Workspace:</strong> Timers, ambient soundscapes, structured notes, and SRS flashcards all in one tab.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Camera-Free Peer Rooms:</strong> Live countdown sync, country flags, and mutual accountability without video clutter.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>SuperMemo SM-2 Spaced Repetition:</strong> Turn notes into cards with <code className="text-indigo-300">Front :: Back</code> and review right before forgetting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Subject-Targeted Analytics:</strong> Log study hours per subject with weekly goals, streaks, and local persistence.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. The 4 Pillars of Lumina (Interactive Feature Showcase) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Platform Capabilities
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            How Lumina Accelerates Your Learning
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Four specialized tools built to work together in harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Subject Pomodoro */}
          <div
            onClick={() => onNavigate('pomodoro')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform">
                <Timer className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Focus Timer →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                1. Subject-Centric Focus &amp; Pomodoro
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tag every focus block to a specific course (e.g. <em>Distributed Systems</em>, <em>Machine Learning</em>) with customizable weekly targets, automatic break cycles, and Web Audio Zen chimes.
              </p>
            </div>

            {/* Interactive Miniature Preview */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <strong>Active Subject:</strong> Distributed Systems
                </span>
                <span className="font-mono text-indigo-400 font-bold">25:00 Focus</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-3/4 rounded-full" />
              </div>
            </div>
          </div>

          {/* Pillar 2: Study Stream & Lo-Fi */}
          <div
            onClick={() => onNavigate('rooms')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Enter Study Rooms →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                2. Minimalist Study Rooms &amp; Lo-Fi Lounge
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Experience real peer accountability without video fatigue: synchronized countdowns, country flags, active study topics, and a relaxing copyright-free Lo-Fi player.
              </p>
            </div>

            {/* Interactive Miniature Preview */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-[10px]">
                  🇸🇪
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Elena (Focusing: 19m left)</div>
                  <div className="text-[10px] text-slate-400">Vibe: Shibuya Rain &amp; Lofi Beats</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Live
              </span>
            </div>
          </div>

          {/* Pillar 3: Structured Study Notes & Vault */}
          <div
            onClick={() => onNavigate('notes')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Notes &amp; Vault →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                3. Hierarchical Notes &amp; 500MB Local Vault
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Organize documents into structured folders. Type formulas, generate flashcards inline with <code className="text-indigo-300">Front :: Back</code>, and store up to 500MB of local PDF lecture slides.
              </p>
            </div>

            {/* Interactive Miniature Preview */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">📁 Distributed Systems</span>
                <span className="text-slate-500 text-[10px]">3 docs • 2 files</span>
              </div>
              <div className="text-emerald-400 text-[10px] font-sans">✓ Saved in persistent local vault</div>
            </div>
          </div>

          {/* Pillar 4: Smart AI Revision & SM-2 SRS */}
          <div
            onClick={() => onNavigate('revision')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Smart Revision →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                4. AI Flashcards &amp; SuperMemo SM-2 Spaced Repetition
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generate high-yield active recall flashcards from your notes or topics. Review cards at scientifically optimized intervals with SM-2 scheduling and automated email reminders.
              </p>
            </div>

            {/* Interactive Miniature Preview */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">AI Flashcard Generator Active</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-pink-400 font-mono">
                {dueCards.length} Due Today
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The 4-Step Learning Loop */}
      <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            The Complete Study Loop
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How You Study with Lumina
          </h2>
          <p className="text-xs text-slate-400">
            From initial deep focus sprint to permanent long-term retention
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative hover:border-indigo-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-100">Focus &amp; Immerse</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your subject, start your 25m Pomodoro, layer Lo-Fi beats with rainfall, and study alongside live global peers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative hover:border-purple-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-100">Capture &amp; Extract</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take hierarchical notes during lecture. Type <code className="text-indigo-300">Front :: Back</code> to automatically turn key formulas into flashcards.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative hover:border-pink-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-pink-600/30 border border-pink-500/40 text-pink-300 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-100">Generate with AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the built-in AI Generator to turn study notes into active recall flashcards with questions, answers, and hints in seconds.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-100">Retain with SM-2</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review flashcards with SuperMemo SM-2 scheduling and receive email reminders right before memory decay occurs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Ready to Begin Action Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 border border-indigo-500/40 text-center space-y-5 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Ready to Start Today's Focus?
          </h3>
          <p className="text-xs md:text-sm text-slate-300">
            Pick a tool below or start your first 25-minute subject focus sprint now.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('pomodoro')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            <Timer className="w-4 h-4" /> Open Pomodoro
          </button>
          <button
            type="button"
            onClick={() => onNavigate('rooms')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" /> Open Study Rooms
          </button>
          <button
            type="button"
            onClick={() => onNavigate('notes')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4 text-purple-400" /> Open Notes &amp; Vault
          </button>
          <button
            type="button"
            onClick={() => onNavigate('revision')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Brain className="w-4 h-4 text-pink-400" /> Review Flashcards
          </button>
        </div>
      </section>
    </div>
  );
};

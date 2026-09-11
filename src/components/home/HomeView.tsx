import React from 'react';
import { useApp } from '../../context/AppContext';
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
  ArrowRight,
  Sparkles,
  CheckCircle2,
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
  Database,
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

interface HomeViewProps {
  onNavigate?: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate: propOnNavigate }) => {
  const router = useRouter();
  const onNavigate = propOnNavigate || router.navigateToTab;
  const { flashcards, subjects, studyStreakDays, dailyLogs, r2Config, emailConfig } = useApp();
  const { isRunning, formattedTime, mode, startTimer } = useTimer();
  const { peers } = useRoom();
  const { isPlayingLofi, toggleLofi, currentTrack } = useAudio();

  const dueCards = flashcards.filter(isCardDue);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find((l) => l.date === todayStr);
  const todayMinutes = todayLog?.totalMinutes || 0;
  const todayHours = (todayMinutes / 60).toFixed(1);

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* 1. Hero Section */}
      <section className="relative pt-6 pb-2 text-center md:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text (col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>All-In-One Modern Study & Deep Work Suite</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Master Any Subject with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Focused Time
              </span>{' '}
              &amp;{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Permanent Memory
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
              Stop switching between separate timer apps, video call rooms, markdown editors, and flashcard tools.
              Lumina unifies <strong>Subject-based Pomodoro</strong>, <strong>Minimalist Study Rooms</strong> with Lo-Fi,
              <strong>RemNote hierarchical notes</strong>, and <strong>SuperMemo SM-2 Spaced Repetition</strong> with persistent local storage.
            </p>

            {/* Quick Action Buttons */}
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
                <Brain className="w-4 h-4 text-indigo-400" /> Smart Revision ({dueCards.length} due)
              </button>
            </div>
          </div>

          {/* Right Hero Live Snapshot Card (col-span-5) */}
          <div className="lg:col-span-5">
            <div className="glass-panel-glow p-6 rounded-3xl border border-indigo-500/30 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy className="w-40 h-40 text-indigo-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Your Today Snapshot
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
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  {isRunning ? 'View Timer' : 'Launch'}
                </button>
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

      {/* 2. The 4 Pillars of Lumina (Interactive Feature Showcase) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            How Lumina Transforms Your Learning
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            A unified system designed to eliminate study friction, boost deep focus, and anchor concepts in long-term memory.
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
                Open Timer →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                1. Subject-Centric Pomodoro Tracking
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generic timers don't tell you where your effort goes. In Lumina, every pomodoro block is tagged to a specific subject (e.g. <em>Distributed Systems</em>, <em>Machine Learning</em>) with weekly hour targets, automatic break cycles, and Web Audio Zen chimes.
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
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Enter Rooms →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                2. Minimalist Study Rooms & Lo-Fi Lounge
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Video study streams create camera anxiety and screen clutter. Lumina gives you genuine peer accountability without video: live synchronized countdowns, active subjects, country flags, and a soothing copyright-free Lo-Fi focus player.
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
                  <div className="text-[10px] text-slate-400">Vibe: Shibuya Rain & Lofi Beats</div>
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
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Notes →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                3. Subject Folders &amp; Rich Document Editor
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Organize your study materials into clean subject folders. Create rich documents with Live Split and Markdown Preview modes, and store up to 500MB of local PDF lecture slides and diagrams.
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
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group space-y-4 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Revision →
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                4. Smart AI Revision &amp; SuperMemo SM-2
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generate high-yield active recall flashcard decks with AI from any note or study topic. Review concepts at scientifically optimal intervals with SM-2 spaced repetition scheduling.
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

      {/* 3. The 3-Step Study Flow */}
      <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            The Complete Learning Loop
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How You Study with Lumina
          </h2>
          <p className="text-xs text-slate-400">
            From initial deep focus to long-term permanent retention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-100">Focus &amp; Immerse</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your subject, start your Pomodoro timer, layer soothing Lo-Fi beats with rainfall, and study alongside peers worldwide.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-100">Capture &amp; Extract</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Write structured hierarchical outlines. Type <code className="text-indigo-300">Front :: Back</code> to automatically turn key formulas and concepts into flashcards.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-100">Retain &amp; Master</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review flashcards with the SuperMemo SM-2 algorithm. Receive daily email reminders to review concepts right before you forget them.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Ready to Jump In CTA */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 border border-indigo-500/40 text-center space-y-5 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Ready to Begin Today's Focus?
          </h3>
          <p className="text-xs md:text-sm text-slate-300">
            Pick a tool below or start your first 25-minute subject focus session now.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('pomodoro')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
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
            <FileText className="w-4 h-4 text-purple-400" /> Open Notes &amp; Files
          </button>
          <button
            type="button"
            onClick={() => onNavigate('flashcards')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Brain className="w-4 h-4 text-pink-400" /> Review Flashcards
          </button>
        </div>
      </section>
    </div>
  );
};

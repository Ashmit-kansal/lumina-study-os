import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTimer } from '../../context/TimerContext';
import { useAudio } from '../../context/AudioContext';
import { useRoom } from '../../context/RoomContext';
import { useRouter } from '../../context/RouterContext';
import { isCardDue } from '../../services/sm2Service';
import { TimerSettingsModal } from '../pomodoro/TimerSettingsModal';
import { R2ConfigModal } from '../notes/R2ConfigModal';
import { EmailReminderSettingsModal } from '../flashcards/EmailReminderSettingsModal';
import {
  Home,
  Timer,
  Users,
  FileText,
  Brain,
  BarChart3,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SlidersHorizontal,
  Cloud,
  Mail,
  MoreVertical,
  HardDrive,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab: propActiveTab,
  onNavigateToTab: propNavigateToTab,
}) => {
  const { studyStreakDays, subjects, r2Config, emailConfig, flashcards, notes } = useApp();
  const { mode, isRunning, formattedTime, activeSubjectId } = useTimer();
  const { isPlayingLofi, toggleLofi, isMuted, toggleMute } = useAudio();
  const { peers } = useRoom();
  const router = useRouter();

  const activeTab = propActiveTab || router.activeTab;
  const onNavigateToTab = propNavigateToTab || router.navigateToTab;

  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const [isR2ModalOpen, setIsR2ModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);
  const dueCardsCount = flashcards.filter(isCardDue).length;

  const NAV_TABS = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'pomodoro', label: 'Focus', icon: Timer, hasActiveState: isRunning, path: '/pomodoro' },
    {
      id: 'rooms',
      label: 'Rooms',
      icon: Users,
      badgeDot: true,
      badgeColor: 'bg-emerald-400',
      tooltip: `${peers.length} Live Studiers`,
      path: '/rooms',
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      tooltip: `${notes.length} Documents`,
      path: '/notes',
    },
    {
      id: 'revision',
      label: 'Revision',
      icon: Brain,
      badgeDot: dueCardsCount > 0,
      badgeColor: 'bg-indigo-400',
      tooltip: `${dueCardsCount} Due for Revision`,
      path: '/revision',
    },
    { id: 'analytics', label: 'Stats', icon: BarChart3, path: '/analytics' },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-3 sm:px-6 py-2.5 backdrop-blur-xl transition-all">
        <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
          {/* Left: Brand & Logo */}
          <div
            onClick={() => onNavigateToTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 group"
            title="Return to Home Dashboard"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
              <span className="text-base sm:text-lg font-black text-white font-mono">⚡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                LUMINA
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                STUDY
              </span>
            </div>
          </div>

          {/* Center: Streamlined Desktop Navigation Tabs (Hidden on mobile, shown on md+) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigateToTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 lg:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                  title={tab.tooltip || tab.label}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>

                  {/* Subtle Dot Indicator */}
                  {tab.badgeDot && !isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${tab.badgeColor} animate-pulse`} />
                  )}

                  {tab.hasActiveState && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Streak, Live Timer Pill, Audio & Unified Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Live Timer Pill (Shown when running or timer active) */}
            {isRunning && (
              <button
                type="button"
                onClick={() => onNavigateToTab('pomodoro')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/70 border border-indigo-500/50 text-indigo-200 text-xs font-bold shadow-md shadow-indigo-500/20 animate-pulse"
                title="Active Pomodoro Timer"
              >
                <Timer className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono">{formattedTime}</span>
              </button>
            )}

            {/* Streak Badge */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold shadow-sm select-none"
              title={`${studyStreakDays} Day Study Streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{studyStreakDays}d</span>
            </div>

            {/* Compact Audio Pill */}
            <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                onClick={toggleLofi}
                className={`p-1.5 rounded-lg transition-all ${
                  isPlayingLofi
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isPlayingLofi ? 'Pause Lo-Fi Music' : 'Play Lo-Fi Music'}
              >
                {isPlayingLofi ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.2" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:inline-block"
                title="Toggle Mute"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Unified Preferences & Storage Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  isDropdownOpen
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title="Preferences & Tools"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-1.5 space-y-1 z-50 backdrop-blur-2xl animate-scale-up">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                    Settings &amp; Tools
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerSettingsOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div className="font-semibold">Timer Durations &amp; Audio</div>
                      <div className="text-[10px] text-slate-400">Pomodoro, chimes, metronome</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsR2ModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Document Vault (500MB)</div>
                      <div className="text-[10px] text-slate-400">
                        {r2Config.enabled ? 'Cloudflare R2 Sync Active' : 'Local IndexedDB Active'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEmailModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-pink-400" />
                    <div>
                      <div className="font-semibold">Email Revision Reminders</div>
                      <div className="text-[10px] text-slate-400">
                        {emailConfig.enabled ? `Scheduled at ${emailConfig.scheduledTime}` : 'Disabled'}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Shown only on mobile < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigateToTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px]">{tab.label}</span>

                {/* Dot Indicator for Mobile */}
                {tab.badgeDot && !isActive && (
                  <span className={`absolute top-0.5 right-2 w-1.5 h-1.5 rounded-full ${tab.badgeColor}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <TimerSettingsModal isOpen={isTimerSettingsOpen} onClose={() => setIsTimerSettingsOpen(false)} />
      <R2ConfigModal isOpen={isR2ModalOpen} onClose={() => setIsR2ModalOpen(false)} />
      <EmailReminderSettingsModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  );
};

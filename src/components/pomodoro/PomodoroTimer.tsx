import React, { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { useApp } from '../../context/AppContext';
import { SubjectSelector } from './SubjectSelector';
import { TimerSettingsModal } from './TimerSettingsModal';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SlidersHorizontal,
  Flame,
  Sparkles,
  Coffee,
  Brain,
  Plus,
  Minus,
} from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const {
    mode,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    switchMode,
    adjustTime,
    formattedTime,
    progressPercent,
    focusSessionCount,
  } = useTimer();

  const { timerSettings } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Styling based on active mode
  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return {
          stroke: '#6366f1',
          gradient: 'from-indigo-500 to-purple-600',
          badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
          shadow: 'rgba(99, 102, 241, 0.25)',
          glowClass: 'shadow-[0_0_50px_-10px_rgba(99,102,241,0.3)]',
        };
      case 'short_break':
        return {
          stroke: '#10b981',
          gradient: 'from-emerald-500 to-teal-600',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          shadow: 'rgba(16, 185, 129, 0.25)',
          glowClass: 'shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]',
        };
      case 'long_break':
        return {
          stroke: '#06b6d4',
          gradient: 'from-cyan-500 to-blue-600',
          badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
          shadow: 'rgba(6, 182, 212, 0.25)',
          glowClass: 'shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)]',
        };
    }
  };

  const modeTheme = getModeColor();
  const circleRadius = 140;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-4 sm:space-y-6 px-2">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-lg w-full sm:w-auto">
        <button
          type="button"
          onClick={() => switchMode('focus')}
          className={`flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${mode === 'focus'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Brain className="w-3.5 h-3.5" />
          Focus ({timerSettings.focusDuration}m)
        </button>

        <button
          type="button"
          onClick={() => switchMode('short_break')}
          className={`flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${mode === 'short_break'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          Break ({timerSettings.shortBreakDuration}m)
        </button>

        <button
          type="button"
          onClick={() => switchMode('long_break')}
          className={`flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${mode === 'long_break'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Long Break ({timerSettings.longBreakDuration}m)
        </button>
      </div>

      {/* Subject Tracking Selector */}
      <SubjectSelector />

      {/* Circular Timer Visual Display */}
      <div className={`relative flex items-center justify-center p-2 sm:p-6 rounded-full ${modeTheme.glowClass} transition-all duration-700`}>
        <svg className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 transform -rotate-90" viewBox="0 0 320 320">
          {/* Background Track Circle */}
          <circle
            cx="160"
            cy="160"
            r={circleRadius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-800/70"
            fill="transparent"
          />

          {/* Animated Progress Ring */}
          <circle
            cx="160"
            cy="160"
            r={circleRadius}
            stroke={modeTheme.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2 border ${modeTheme.badgeBg}`}
          >
            {mode === 'focus' ? '🎯 Focus' : mode === 'short_break' ? '☕ Rest' : '✨ Recharge'}
          </span>

          {/* Time with +/- Adjustment Buttons */}
          <div className="flex items-center justify-center gap-1 sm:gap-2.5 my-0.5">
            <button
              type="button"
              onClick={() => adjustTime(-1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer hover:border-slate-600"
              title="Decrease by 1 minute (-1m)"
              aria-label="Decrease time by 1 minute"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight text-white drop-shadow-md select-none px-1">
              {formattedTime}
            </h2>

            <button
              type="button"
              onClick={() => adjustTime(1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer hover:border-slate-600"
              title="Increase by 1 minute (+1m)"
              aria-label="Increase time by 1 minute"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Quick +/- 5m and +/- 1m Adjustment Pills */}
          <div className="flex items-center justify-center gap-1 mt-1">
            <button
              type="button"
              onClick={() => adjustTime(-5)}
              className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] sm:text-[10px] font-mono transition-colors active:scale-95"
              title="Subtract 5 minutes"
            >
              -5m
            </button>
            <button
              type="button"
              onClick={() => adjustTime(5)}
              className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] sm:text-[10px] font-mono transition-colors active:scale-95"
              title="Add 5 minutes"
            >
              +5m
            </button>
          </div>

          {/* Cycle Indicators */}
          <div className="flex items-center gap-1.5 mt-2">
            {Array.from({ length: timerSettings.longBreakInterval }).map((_, idx) => {
              const filled = idx < (focusSessionCount % timerSettings.longBreakInterval);
              return (
                <div
                  key={idx}
                  className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all ${filled
                      ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] scale-110'
                      : 'bg-slate-800'
                    }`}
                  title={`Session ${idx + 1}`}
                />
              );
            })}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">
            Session {(focusSessionCount % timerSettings.longBreakInterval) + 1} of {timerSettings.longBreakInterval}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
        {/* Reset Button */}
        <button
          type="button"
          onClick={resetTimer}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all shadow-md active:scale-95"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Start / Pause Button */}
        <button
          type="button"
          onClick={isRunning ? pauseTimer : startTimer}
          className={`flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base transition-all transform active:scale-95 shadow-xl ${isRunning
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/60'
              : `bg-gradient-to-r ${modeTheme.gradient} text-white shadow-indigo-500/25 hover:opacity-95 hover:shadow-indigo-500/40`
            }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 sm:w-5 h-4 sm:h-5 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-current ml-0.5" /> Start Focus
            </>
          )}
        </button>

        {/* Skip Button */}
        <button
          type="button"
          onClick={skipSession}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all shadow-md active:scale-95"
          title="Skip to Next Cycle"
        >
          <SkipForward className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-indigo-400 transition-all shadow-md active:scale-95"
          title="Timer Preferences"
        >
          <SlidersHorizontal className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>
      </div>

      {/* Timer Settings Modal */}
      <TimerSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PomodoroMode, Subject } from '../types';
import { useApp } from './AppContext';
import { soundSynthesizer } from '../services/soundSynthesizer';
import confetti from 'canvas-confetti';

interface TimerContextType {
  mode: PomodoroMode;
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  activeSubjectId: string;
  focusSessionCount: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  switchMode: (newMode: PomodoroMode) => void;
  setActiveSubjectId: (id: string) => void;
  adjustTime: (deltaMinutes: number) => void;
  formattedTime: string;
  progressPercent: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { subjects, timerSettings, logCompletedSession } = useApp();

  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    return subjects[0]?.id || 'sub_1';
  });

  const getDurationForMode = (m: PomodoroMode): number => {
    switch (m) {
      case 'focus':
        return timerSettings.focusDuration * 60;
      case 'short_break':
        return timerSettings.shortBreakDuration * 60;
      case 'long_break':
        return timerSettings.longBreakDuration * 60;
      default:
        return 25 * 60;
    }
  };

  const [totalDuration, setTotalDuration] = useState<number>(() => getDurationForMode('focus'));
  const [timeRemaining, setTimeRemaining] = useState<number>(() => getDurationForMode('focus'));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [focusSessionCount, setFocusSessionCount] = useState<number>(0);

  // Update durations when timer settings change and timer is stopped
  useEffect(() => {
    if (!isRunning) {
      const dur = getDurationForMode(mode);
      setTotalDuration(dur);
      setTimeRemaining(dur);
    }
  }, [timerSettings.focusDuration, timerSettings.shortBreakDuration, timerSettings.longBreakDuration, mode]);

  // Keep activeSubjectId valid if subjects change
  useEffect(() => {
    if (subjects.length > 0 && !subjects.some((s: Subject) => s.id === activeSubjectId)) {
      setActiveSubjectId(subjects[0].id);
    }
  }, [subjects, activeSubjectId]);

  // Timer Tick Engine
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeRemaining((prev: number) => {
          if (prev <= 1) {
            handleSessionCompleted();
            return 0;
          }
          if (timerSettings.tickingSound) {
            soundSynthesizer.playTick(timerSettings.soundVolume / 100);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, activeSubjectId, focusSessionCount, timerSettings]);

  const handleSessionCompleted = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      // Play Zen Chime
      soundSynthesizer.playFocusCompleteChime(timerSettings.soundVolume / 100);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981'],
        });
      } catch {}

      const subject = subjects.find((s: Subject) => s.id === activeSubjectId);
      const focusMins = Math.round(totalDuration / 60);

      logCompletedSession({
        subjectId: activeSubjectId,
        subjectName: subject?.name || 'General Focus',
        durationMinutes: focusMins,
        mode: 'focus',
      });

      const nextCount = focusSessionCount + 1;
      setFocusSessionCount(nextCount);

      // Transition to Break
      const isLongBreak = nextCount % timerSettings.longBreakInterval === 0;
      const nextMode: PomodoroMode = isLongBreak ? 'long_break' : 'short_break';
      setMode(nextMode);
      const nextDur = getDurationForMode(nextMode);
      setTotalDuration(nextDur);
      setTimeRemaining(nextDur);

      if (timerSettings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      // Break Completed
      soundSynthesizer.playBreakCompleteChime(timerSettings.soundVolume / 100);
      setMode('focus');
      const focusDur = getDurationForMode('focus');
      setTotalDuration(focusDur);
      setTimeRemaining(focusDur);

      if (timerSettings.autoStartFocus) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    const dur = getDurationForMode(mode);
    setTotalDuration(dur);
    setTimeRemaining(dur);
  };

  const skipSession = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextMode: PomodoroMode = (focusSessionCount + 1) % timerSettings.longBreakInterval === 0 ? 'long_break' : 'short_break';
      switchMode(nextMode);
    } else {
      switchMode('focus');
    }
  };

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    const dur = getDurationForMode(newMode);
    setTotalDuration(dur);
    setTimeRemaining(dur);
  };

  const adjustTime = (deltaMinutes: number) => {
    const deltaSeconds = deltaMinutes * 60;
    setTimeRemaining((prev) => {
      const newRemaining = Math.max(60, Math.min(180 * 60, prev + deltaSeconds));
      setTotalDuration((prevTotal) => {
        if (newRemaining > prevTotal) {
          return newRemaining;
        }
        const diff = newRemaining - prev;
        return Math.max(newRemaining, prevTotal + diff);
      });
      return newRemaining;
    });
  };

  // Format MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  // Sync document title with active timer
  useEffect(() => {
    if (isRunning) {
      const modeLabel = mode === 'focus' ? '🎯 Focus' : '☕ Break';
      document.title = `(${formattedTime}) ${modeLabel} | Lumina`;
    } else {
      document.title = 'Lumina Focus & Study Suite';
    }
  }, [isRunning, formattedTime, mode]);

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeRemaining,
        totalDuration,
        isRunning,
        activeSubjectId,
        focusSessionCount,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
        switchMode,
        setActiveSubjectId,
        adjustTime,
        formattedTime,
        progressPercent,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

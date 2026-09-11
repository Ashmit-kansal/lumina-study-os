import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Volume2, Bell, Clock, Sliders } from 'lucide-react';

interface TimerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({ isOpen, onClose }) => {
  const { timerSettings, updateTimerSettings } = useApp();

  const [focusDuration, setFocusDuration] = useState(timerSettings.focusDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(timerSettings.shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(timerSettings.longBreakDuration);
  const [longBreakInterval, setLongBreakInterval] = useState(timerSettings.longBreakInterval);
  const [autoStartBreaks, setAutoStartBreaks] = useState(timerSettings.autoStartBreaks);
  const [autoStartFocus, setAutoStartFocus] = useState(timerSettings.autoStartFocus);
  const [soundVolume, setSoundVolume] = useState(timerSettings.soundVolume);
  const [tickingSound, setTickingSound] = useState(timerSettings.tickingSound);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTimerSettings({
      focusDuration: Number(focusDuration) || 25,
      shortBreakDuration: Number(shortBreakDuration) || 5,
      longBreakDuration: Number(longBreakDuration) || 15,
      longBreakInterval: Number(longBreakInterval) || 4,
      autoStartBreaks,
      autoStartFocus,
      soundVolume: Number(soundVolume),
      tickingSound,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pomodoro & Audio Preferences"
      subtitle="Customize interval durations, auto-cycles, and audio cues"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Interval Durations */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Time Intervals (Minutes)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Focus</label>
              <input
                type="number"
                min="1"
                max="180"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-center text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Short Break</label>
              <input
                type="number"
                min="1"
                max="60"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-center text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Long Break</label>
              <input
                type="number"
                min="1"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-center text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Long Break Interval */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
          <div>
            <div className="text-sm font-medium text-slate-200">Long Break Interval</div>
            <div className="text-xs text-slate-400">Trigger a long break after every X focus sessions</div>
          </div>
          <input
            type="number"
            min="1"
            max="12"
            value={longBreakInterval}
            onChange={(e) => setLongBreakInterval(Number(e.target.value))}
            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Automation Toggles */}
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="text-sm text-slate-200 font-medium">Auto-start Breaks</span>
            <input
              type="checkbox"
              checked={autoStartBreaks}
              onChange={(e) => setAutoStartBreaks(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="text-sm text-slate-200 font-medium">Auto-start Pomodoros</span>
            <input
              type="checkbox"
              checked={autoStartFocus}
              onChange={(e) => setAutoStartFocus(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Sound & Alert Cues */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-400" /> Sound Chime Volume
            </span>
            <span className="text-xs text-indigo-400 font-semibold">{soundVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={soundVolume}
            onChange={(e) => setSoundVolume(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <div className="text-sm text-slate-200 font-medium">Metronome Focus Ticks</div>
              <div className="text-xs text-slate-400">Plays a gentle wooden click every second during focus</div>
            </div>
            <input
              type="checkbox"
              checked={tickingSound}
              onChange={(e) => setTickingSound(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          Save Timer Preferences
        </button>
      </form>
    </Modal>
  );
};

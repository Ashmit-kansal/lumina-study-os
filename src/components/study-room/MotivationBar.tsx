import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { Flame, Coffee, Sparkles, Brain, ThumbsUp, Heart } from 'lucide-react';

const REACTION_BUTTONS = [
  { emoji: '🔥', label: 'Keep Going!' },
  { emoji: '☕', label: 'Coffee Boost' },
  { emoji: '🧠', label: 'In The Flow' },
  { emoji: '👏', label: 'Great Streak' },
  { emoji: '⚡', label: 'Deep Focus' },
  { emoji: '✨', label: 'You Got This' },
];

export const MotivationBar: React.FC = () => {
  const { reactions, sendReaction } = useRoom();

  return (
    <div className="relative">
      {/* Floating Reaction Animation Burst Area */}
      <div className="absolute -top-16 left-0 right-0 pointer-events-none flex justify-center gap-3 overflow-hidden h-14">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="animate-bounce flex items-center gap-1.5 px-3 py-1 bg-indigo-950/90 border border-indigo-500/50 rounded-full text-xs font-semibold text-indigo-200 shadow-lg shadow-indigo-500/20 backdrop-blur-md"
          >
            <span className="text-base">{r.emoji}</span>
            <span>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Floating Action Pill */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
          Quiet Room Encouragement:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {REACTION_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => sendReaction(btn.emoji, btn.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-indigo-200 transition-all active:scale-95 shadow-sm"
              title={btn.label}
            >
              <span className="text-sm">{btn.emoji}</span>
              <span className="font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

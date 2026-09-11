import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { Target, Send, Heart, Sparkles } from 'lucide-react';

export const RoomPledgeBar: React.FC = () => {
  const { pledges, addPledge, cheerPledge } = useRoom();
  const [pledgeInput, setPledgeInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeInput.trim()) return;
    addPledge(pledgeInput);
    setPledgeInput('');
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Focus Goals & Study Pledges
          </span>
          <p className="text-xs text-slate-400 mt-0.5">Share what you are accomplishing during this session</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. Completing 2 Pomodoros of Machine Learning notes..."
          value={pledgeInput}
          onChange={(e) => setPledgeInput(e.target.value)}
          className="flex-1 bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!pledgeInput.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
        >
          <Send className="w-3.5 h-3.5" /> Post Goal
        </button>
      </form>

      {/* Active Pledges Feed */}
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {pledges.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-indigo-300 flex-shrink-0">{p.authorName}:</span>
              <span className="text-slate-300 truncate">{p.text}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-[10px] text-slate-500">{p.timestamp}</span>
              <button
                type="button"
                onClick={() => cheerPledge(p.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 transition-colors"
                title="Cheer on"
              >
                <Heart className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                <span className="text-[11px] font-bold">{p.cheersCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

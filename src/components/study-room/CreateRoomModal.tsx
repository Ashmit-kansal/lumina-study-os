import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useRoom, CreateRoomInput } from '../../context/RoomContext';
import {
  Sparkles,
  BookOpen,
  Moon,
  CloudRain,
  Radio,
  Flame,
  Brain,
  Compass,
  Code,
  Laptop,
  Check,
  Plus,
} from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADIENT_PRESETS = [
  { label: 'Deep Indigo', class: 'from-slate-900 via-indigo-950/60 to-slate-900', border: 'border-indigo-500/40', dot: 'bg-indigo-500' },
  { label: 'Neon Cyber', class: 'from-slate-950 via-purple-950/60 to-slate-950', border: 'border-purple-500/40', dot: 'bg-purple-500' },
  { label: 'Emerald Forest', class: 'from-slate-950 via-emerald-950/60 to-slate-900', border: 'border-emerald-500/40', dot: 'bg-emerald-500' },
  { label: 'Cyan Rain', class: 'from-slate-950 via-cyan-950/60 to-slate-900', border: 'border-cyan-500/40', dot: 'bg-cyan-500' },
  { label: 'Amber Hearth', class: 'from-slate-950 via-amber-950/60 to-slate-900', border: 'border-amber-500/40', dot: 'bg-amber-500' },
  { label: 'Rose Sunset', class: 'from-slate-950 via-rose-950/60 to-slate-900', border: 'border-rose-500/40', dot: 'bg-rose-500' },
];

const ICON_OPTIONS = [
  { id: 'BookOpen', label: 'Library', icon: BookOpen },
  { id: 'Moon', label: 'Night Loft', icon: Moon },
  { id: 'CloudRain', label: 'Rain Sanctum', icon: CloudRain },
  { id: 'Code', label: 'Code Sprint', icon: Code },
  { id: 'Brain', label: 'AI & Research', icon: Brain },
  { id: 'Flame', label: 'Deep Grind', icon: Flame },
  { id: 'Radio', label: 'Lo-Fi Radio', icon: Radio },
  { id: 'Compass', label: 'Explorer', icon: Compass },
];

const ROOM_TEMPLATES = [
  { name: 'Late Night LeetCode Sprint', subtitle: 'Algorithms & Data Structures Grind', vibe: 'Synthwave & Silent Code', icon: 'Code', gradient: GRADIENT_PRESETS[1].class },
  { name: 'University Finals Cram Lounge', subtitle: '50m Focus / 10m Break Silent Room', vibe: 'Library Rain & Page Flips', icon: 'BookOpen', gradient: GRADIENT_PRESETS[0].class },
  { name: 'Medical Board Prep (USMLE/NEET)', subtitle: 'Flashcard SM-2 Repetitions & Active Recall', vibe: '432Hz Binaural Focus', icon: 'Brain', gradient: GRADIENT_PRESETS[2].class },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { createRoom } = useRoom();

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [ambientVibe, setAmbientVibe] = useState('Chill Lo-Fi Beats & Deep Focus');
  const [selectedIcon, setSelectedIcon] = useState('Code');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].class);

  const handleApplyTemplate = (tmpl: typeof ROOM_TEMPLATES[0]) => {
    setName(tmpl.name);
    setSubtitle(tmpl.subtitle);
    setAmbientVibe(tmpl.vibe);
    setSelectedIcon(tmpl.icon);
    setSelectedGradient(tmpl.gradient);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createRoom({
      name: name.trim(),
      subtitle: subtitle.trim() || 'Custom Collaborative Study Lounge',
      description: description.trim() || 'Focus community room created for deep work and accountability.',
      icon: selectedIcon,
      themeGradient: selectedGradient,
      ambientVibe: ambientVibe.trim(),
    });

    // Reset and close
    setName('');
    setSubtitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Study Room"
      subtitle="Establish your own focus space, invite studiers, and share live countdowns & group chat"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quick Starter Templates */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Starter Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ROOM_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                  {tmpl.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{tmpl.vibe}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Room Name & Focus Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Room Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Late Night Coding, Med School Prep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Focus Subtitle / Goal</label>
            <input
              type="text"
              placeholder="e.g. 50m Focus / 10m Break • Pure Concentration"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Description & Ambient Vibe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Room Description</label>
            <input
              type="text"
              placeholder="Brief description of rules, subjects, or schedule"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Ambient Sound / Vibe Label</label>
            <input
              type="text"
              placeholder="e.g. Shibuya Rain & Lo-Fi, 432Hz Synth"
              value={ambientVibe}
              onChange={(e) => setAmbientVibe(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="text-xs text-slate-300 font-medium block mb-1.5">Room Icon</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {ICON_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedIcon === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedIcon(opt.id)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={opt.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium truncate w-full text-center">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Gradient Theme Picker */}
        <div>
          <label className="text-xs text-slate-300 font-medium block mb-1.5">Theme Gradient</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map((preset) => {
              const isSelected = selectedGradient === preset.class;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedGradient(preset.class)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white border-indigo-400 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${preset.dot}`} />
                  <span className="truncate">{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create & Enter Room
          </button>
        </div>
      </form>
    </Modal>
  );
};

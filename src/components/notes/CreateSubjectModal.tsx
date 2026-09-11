import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Brain,
  Code2,
  Cpu,
  Database,
  Network,
  Sparkles,
  Layers,
  GraduationCap,
  Atom,
  Binary,
  Check,
} from 'lucide-react';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectCreated?: (subjectId: string) => void;
}

const COLOR_GRADIENTS = [
  { label: 'Indigo & Blue', value: 'from-blue-500 to-indigo-600', dot: 'bg-indigo-500' },
  { label: 'Purple & Pink', value: 'from-purple-500 to-pink-600', dot: 'bg-purple-500' },
  { label: 'Emerald & Teal', value: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500' },
  { label: 'Amber & Orange', value: 'from-amber-500 to-orange-600', dot: 'bg-amber-500' },
  { label: 'Cyan & Sky', value: 'from-cyan-500 to-blue-500', dot: 'bg-cyan-500' },
  { label: 'Rose & Red', value: 'from-rose-500 to-red-600', dot: 'bg-rose-500' },
];

const ICONS = [
  { name: 'BookOpen', icon: BookOpen },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Brain', icon: Brain },
  { name: 'Code2', icon: Code2 },
  { name: 'Cpu', icon: Cpu },
  { name: 'Network', icon: Network },
  { name: 'Database', icon: Database },
  { name: 'Layers', icon: Layers },
  { name: 'Atom', icon: Atom },
  { name: 'Binary', icon: Binary },
  { name: 'Sparkles', icon: Sparkles },
];

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onSubjectCreated,
}) => {
  const { addSubject, subjects } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetHours, setTargetHours] = useState(10);
  const [selectedColor, setSelectedColor] = useState(COLOR_GRADIENTS[0].value);
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setTargetHours(10);
      setSelectedColor(COLOR_GRADIENTS[subjects.length % COLOR_GRADIENTS.length].value);
      setSelectedIcon('BookOpen');
    }
  }, [isOpen, subjects.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon,
      targetHoursPerWeek: Number(targetHours) || 10,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Study Subject"
      subtitle="Subjects are the top-level course categories that contain all your folders, notes, and files"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Name */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Subject Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Distributed Systems, Mathematics, Operating Systems"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Description / Topics (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. CPU Scheduling, Memory, Concurrency & Virtualization"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Weekly Target Hours */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Weekly Study Target (Hours)
          </label>
          <input
            type="number"
            min="1"
            max="80"
            value={targetHours}
            onChange={(e) => setTargetHours(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Subject Theme Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {COLOR_GRADIENTS.map((c) => {
              const isSelected = selectedColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`h-8 rounded-xl bg-gradient-to-br ${c.value} flex items-center justify-center transition-all ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Subject Icon
          </label>
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title={item.name}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            Create Subject
          </button>
        </div>
      </form>
    </Modal>
  );
};

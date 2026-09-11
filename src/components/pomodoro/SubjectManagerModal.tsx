import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { Plus, Trash2, BookOpen, Clock, Tag } from 'lucide-react';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { label: 'Indigo / Blue', class: 'from-blue-500 to-indigo-600', dot: 'bg-indigo-500' },
  { label: 'Purple / Pink', class: 'from-purple-500 to-pink-600', dot: 'bg-purple-500' },
  { label: 'Emerald / Teal', class: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500' },
  { label: 'Amber / Orange', class: 'from-amber-500 to-orange-600', dot: 'bg-amber-500' },
  { label: 'Rose / Red', class: 'from-rose-500 to-red-600', dot: 'bg-rose-500' },
  { label: 'Cyan / Sky', class: 'from-cyan-500 to-blue-600', dot: 'bg-cyan-500' },
];

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addSubject, deleteSubject } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetHours, setTargetHours] = useState(10);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].class);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      description: description.trim(),
      targetHoursPerWeek: Number(targetHours) || 10,
      color: selectedColor,
      icon: 'BookOpen',
    });

    setName('');
    setDescription('');
    setTargetHours(10);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Study Subjects"
      subtitle="Organize your study goals, customize colors, and track time per subject"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Create Subject Form */}
        <form onSubmit={handleAdd} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Subject
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Subject Name *</label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems, Machine Learning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Hours / Week</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Clock className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Description / Topic Outline</label>
            <input
              type="text"
              placeholder="Brief summary of modules, topics or exams"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Color Palette</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.class}
                  type="button"
                  onClick={() => setSelectedColor(preset.class)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedColor === preset.class
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <span className={`w-3 h-3 rounded-full ${preset.dot}`} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            Add Subject to Study Tracker
          </button>
        </form>

        {/* Existing Subjects List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Existing Subjects ({subjects.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {subjects.map((sub) => {
              const studiedHours = (sub.totalSecondsStudied / 3600).toFixed(1);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${sub.color}`} />
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{sub.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{studiedHours}h studied</span>
                        <span>•</span>
                        <span>Target: {sub.targetHoursPerWeek}h/wk</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSubject(sub.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

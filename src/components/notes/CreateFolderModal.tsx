import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Folder as FolderIcon, Plus, Check } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string | null;
  defaultParentId?: string | null;
}

const FOLDER_COLORS = [
  { label: 'Indigo', class: 'text-indigo-400', bg: 'bg-indigo-500' },
  { label: 'Purple', class: 'text-purple-400', bg: 'bg-purple-500' },
  { label: 'Emerald', class: 'text-emerald-400', bg: 'bg-emerald-500' },
  { label: 'Cyan', class: 'text-cyan-400', bg: 'bg-cyan-500' },
  { label: 'Amber', class: 'text-amber-400', bg: 'bg-amber-500' },
  { label: 'Rose', class: 'text-rose-400', bg: 'bg-rose-500' },
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultParentId,
}) => {
  const { subjects, addFolder } = useApp();

  const [folderName, setFolderName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].class);

  React.useEffect(() => {
    if (isOpen) {
      if (defaultSubjectId) {
        setSelectedSubjectId(defaultSubjectId);
      } else if (subjects[0]) {
        setSelectedSubjectId(subjects[0].id);
      }
      setFolderName('');
    }
  }, [isOpen, defaultSubjectId, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    addFolder(folderName.trim(), selectedSubjectId || undefined, defaultParentId || null, selectedColor);
    setFolderName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Study Folder"
      subtitle="Organize notes, flashcards, and uploaded files under a specific subject"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Folder Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Chapter 1: Consensus, Lecture Slides, Exam Review"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Link to Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100 py-1">
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Folder Color Accent
          </label>
          <div className="grid grid-cols-6 gap-2">
            {FOLDER_COLORS.map((c) => {
              const isSelected = selectedColor === c.class;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setSelectedColor(c.class)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-400 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                  <span className="text-[9px] text-slate-400">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!folderName.trim()}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Folder
          </button>
        </div>
      </form>
    </Modal>
  );
};

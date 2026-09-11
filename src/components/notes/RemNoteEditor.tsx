import React, { useState, useEffect } from 'react';
import { NoteDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Heading1,
  Heading2,
  Bold,
  List,
  Code,
  Sparkles,
  Save,
  Trash2,
  Link,
  BookOpen,
  Folder as FolderIcon,
  HelpCircle,
} from 'lucide-react';

interface RemNoteEditorProps {
  note: NoteDocument;
}

export const RemNoteEditor: React.FC<RemNoteEditorProps> = ({ note }) => {
  const { updateNoteContent, deleteNote, subjects, folders } = useApp();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [subjectId, setSubjectId] = useState(note.subjectId || '');
  const [folderId, setFolderId] = useState(note.folderId || '');
  const [isSaved, setIsSaved] = useState(true);

  // Sync state if active note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSubjectId(note.subjectId || '');
    setFolderId(note.folderId || '');
    setIsSaved(true);
  }, [note.id]);

  // Debounced auto-save
  useEffect(() => {
    setIsSaved(false);
    const handler = setTimeout(() => {
      updateNoteContent(note.id, title, content, note.tags, folderId || undefined, subjectId || undefined);
      setIsSaved(true);
    }, 600);

    return () => clearTimeout(handler);
  }, [title, content, subjectId, folderId]);

  const insertTextAtCursor = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('remnote-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  const insertFlashcardSyntax = () => {
    insertTextAtCursor('- Concept / Question :: Definition / Answer');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar: Title, Subject & Folder Linkage, Save Indicator, Delete */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title..."
            className="w-full bg-transparent text-xl md:text-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Link to Subject */}
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                No Subject
              </option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-200">
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Link to Folder */}
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <FolderIcon className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                Root (No Folder)
              </option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Save Status Indicator */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              isSaved ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
            }`}
          >
            {isSaved ? '✓ Saved' : '● Saving...'}
          </span>

          {/* Delete Doc */}
          <button
            type="button"
            onClick={() => deleteNote(note.id)}
            className="p-1.5 rounded-xl hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-slate-300 flex-wrap">
        <button
          type="button"
          onClick={() => insertTextAtCursor('# ')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTextAtCursor('## ')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTextAtCursor('**', '**')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTextAtCursor('- ')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Bullet Point"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTextAtCursor('`', '`')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* RemNote Magic Flashcard Button */}
        <button
          type="button"
          onClick={insertFlashcardSyntax}
          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-all shadow-sm"
          title="Insert RemNote Spaced Repetition Flashcard"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Insert `::` Flashcard</span>
        </button>
      </div>

      {/* Main Hierarchical Textarea */}
      <div className="flex-1 flex flex-col relative min-h-[400px]">
        <textarea
          id="remnote-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing hierarchical notes with outline bullets (-)... Type 'Concept :: Definition' anywhere to create an automatic flashcard!"
          className="w-full flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-sm md:text-base font-mono leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 resize-none shadow-inner"
        />
      </div>

      {/* Syntax Tip Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 px-4 py-2.5 rounded-xl border border-slate-800/60">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <strong>RemNote Tip:</strong> Writing <code className="text-indigo-300">Front :: Back</code> automatically adds it to your SuperMemo SM-2 Spaced Repetition deck!
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          {content.split('::').length - 1} flashcards extracted
        </span>
      </div>
    </div>
  );
};

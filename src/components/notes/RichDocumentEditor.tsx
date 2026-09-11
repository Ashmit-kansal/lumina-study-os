import React, { useState, useEffect, useRef } from 'react';
import { NoteDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo,
  Redo,
  Save,
  Trash2,
  BookOpen,
  Folder as FolderIcon,
  ArrowLeft,
  Clock,
  FileText,
  Highlighter,
  Download,
  Calendar,
  Wand2,
  Zap,
} from 'lucide-react';

import { markdownToFormattedHtml } from '../../utils/textFormatter';

interface RichDocumentEditorProps {
  note: NoteDocument;
  onBackToFolder?: () => void;
  onOpenScheduleModal?: (noteId: string, subjectId?: string) => void;
  onOpenAIGenerator?: (subjectId?: string, noteId?: string) => void;
  onStartActiveRevision?: (noteId: string, folderId?: string, subjectId?: string, title?: string) => void;
}

export const RichDocumentEditor: React.FC<RichDocumentEditorProps> = ({
  note,
  onBackToFolder,
  onOpenScheduleModal,
  onOpenAIGenerator,
  onStartActiveRevision,
}) => {
  const { updateNoteContent, deleteNote, subjects, folders } = useApp();

  const [fileName, setFileName] = useState(note.title || 'Untitled.txt');
  const [subjectId, setSubjectId] = useState(note.subjectId || '');
  const [folderId, setFolderId] = useState(note.folderId || '');
  const [isSaved, setIsSaved] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const isInternalChangeRef = useRef(false);

  // Sync state if active note changes from outside
  useEffect(() => {
    setFileName(note.title || 'Untitled.txt');
    setSubjectId(note.subjectId || '');
    setFolderId(note.folderId || '');
    setIsSaved(true);

    if (editorRef.current && !isInternalChangeRef.current) {
      editorRef.current.innerHTML = markdownToFormattedHtml(note.content);
      updateStats();
    }
    isInternalChangeRef.current = false;
  }, [note.id]);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  // Handle content edits
  const handleContentInput = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    setIsSaved(false);
    updateStats();

    const currentHtml = editorRef.current.innerHTML;
    triggerAutoSave(currentHtml, fileName, folderId, subjectId);
  };

  // Debounced auto-save
  const saveTimeoutRef = useRef<any>(null);
  const triggerAutoSave = (
    contentHtml: string,
    currentName: string,
    currentFolderId: string,
    currentSubjectId: string
  ) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      updateNoteContent(
        note.id,
        currentName.trim() || 'Untitled.txt',
        contentHtml,
        note.tags,
        currentFolderId || undefined,
        currentSubjectId || undefined
      );
      setIsSaved(true);
    }, 500);
  };

  const handleFileNameChange = (newName: string) => {
    setFileName(newName);
    setIsSaved(false);
    if (editorRef.current) {
      triggerAutoSave(editorRef.current.innerHTML, newName, folderId, subjectId);
    }
  };

  const handleFolderChange = (newFolderId: string) => {
    setFolderId(newFolderId);
    setIsSaved(false);
    if (editorRef.current) {
      triggerAutoSave(editorRef.current.innerHTML, fileName, newFolderId, subjectId);
    }
  };

  const handleSubjectChange = (newSubId: string) => {
    setSubjectId(newSubId);
    setIsSaved(false);
    if (editorRef.current) {
      triggerAutoSave(editorRef.current.innerHTML, fileName, folderId, newSubId);
    }
  };

  // Formatting Execution (document.execCommand for Word-like formatting)
  const applyFormat = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleContentInput();
  };

  const handleDownloadTxt = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentFolderObj = folders.find((f) => f.id === folderId);
  const currentSubjectObj = subjects.find((s) => s.id === subjectId);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top File Header: Editable File Name, Folder Assignment, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBackToFolder && (
            <button
              type="button"
              onClick={onBackToFolder}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
              title="Back to Folder"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            {/* Editable File Name Input */}
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={fileName}
                onChange={(e) => handleFileNameChange(e.target.value)}
                placeholder="Filename (e.g. Chapter 1 Notes.txt)"
                className="w-full bg-transparent text-base sm:text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:bg-slate-900/50 px-1.5 py-0.5 rounded-lg border border-transparent focus:border-slate-700 transition-all truncate"
              />
            </div>
          </div>
        </div>

        {/* Location Selectors & Actions */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {/* Target Folder Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <FolderIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 text-[11px] hidden sm:inline">Folder:</span>
            <select
              value={folderId}
              onChange={(e) => handleFolderChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer font-semibold"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                Root (No Folder)
              </option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200">
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Subject Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
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

          {/* Save Status Indicator */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              isSaved ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
            }`}
          >
            {isSaved ? '✓ Saved' : '● Saving...'}
          </span>

          <div className="h-4 w-px bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Revision & Spaced Repetition Actions */}
          <button
            type="button"
            onClick={() => onOpenScheduleModal?.(note.id, subjectId || note.subjectId)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-xs font-semibold transition-all"
            title="Set Custom Spaced Repetition Schedule"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAIGenerator?.(subjectId || note.subjectId, note.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all shadow-sm"
            title="Generate AI Flashcards from this note"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Cards</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onStartActiveRevision?.(
                note.id,
                folderId || note.folderId,
                subjectId || note.subjectId,
                fileName || note.title
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            title="Launch Active Recall Session for this note"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Revise Now</span>
          </button>

          {/* Download Text File */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Download as .txt file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Delete File */}
          <button
            type="button"
            onClick={() => deleteNote(note.id)}
            className="p-2 rounded-xl hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Word-style Formatting Toolbar */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-slate-300 flex-wrap shadow-md">
        {/* Paragraph & Heading Dropdown */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') applyFormat('formatBlock', '<p>');
            else if (val === 'h1') applyFormat('formatBlock', '<h1>');
            else if (val === 'h2') applyFormat('formatBlock', '<h2>');
            else if (val === 'h3') applyFormat('formatBlock', '<h3>');
          }}
          defaultValue="p"
          className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer mr-1"
        >
          <option value="p">Normal Text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Basic Text Formatting */}
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('underline')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('strikeThrough')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => applyFormat('justifyLeft')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('justifyCenter')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('justifyRight')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('formatBlock', '<blockquote>')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => applyFormat('undo')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('redo')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Word-like Document Canvas Sheet */}
      <div className="flex-1 flex flex-col min-h-[480px] bg-slate-950/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-inner overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          className="outline-none min-h-[420px] text-slate-100 text-sm sm:text-base leading-relaxed space-y-3 prose prose-invert max-w-none focus:outline-none"
          style={{
            wordBreak: 'break-word',
          }}
        />
      </div>

      {/* Bottom Document Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-950/60 px-5 py-2.5 rounded-2xl border border-slate-800/70">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          <span>•</span>
          <span className="text-indigo-400 font-medium">
            Saved to folder: {currentFolderObj ? `📁 ${currentFolderObj.name}` : 'Root'}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Text Document Editor
        </div>
      </div>
    </div>
  );
};

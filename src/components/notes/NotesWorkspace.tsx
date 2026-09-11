import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../context/RouterContext';
import { FolderTree } from './FolderTree';
import { RichDocumentEditor } from './RichDocumentEditor';
import { FolderContentsView, SelectedItem } from './FolderContentsView';
import { CreateFolderModal } from './CreateFolderModal';
import { CreateSubjectModal } from './CreateSubjectModal';
import { FileUploadModal } from './FileUploadModal';
import { SetRevisionScheduleModal } from '../flashcards/SetRevisionScheduleModal';
import { AIFlashcardGeneratorModal } from '../flashcards/AIFlashcardGeneratorModal';
import { ActiveRevisionModal } from '../flashcards/ActiveRevisionModal';
import { RevisionScheduleItem } from '../../types';
import {
  Sparkles,
  ChevronRight,
  LayoutGrid,
  Edit3,
} from 'lucide-react';

export const NotesWorkspace: React.FC = () => {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    subjects,
    folders,
    revisionItems,
    scheduleRevision,
  } = useApp();

  const { searchParams, setSearchParam } = useRouter();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Main stage view: 'folder_explorer' or 'document_editor'
  const [viewState, setViewState] = useState<'folder_explorer' | 'document_editor'>('folder_explorer');

  // Creation Modals state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [modalSubjectId, setModalSubjectId] = useState<string | undefined>(undefined);
  const [modalParentId, setModalParentId] = useState<string | null | undefined>(undefined);

  // Spaced Repetition & Revision Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalTarget, setScheduleModalTarget] = useState<{
    type: 'file' | 'folder' | 'subject';
    targetId?: string;
    subjectId?: string;
  }>({ type: 'file' });

  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiGeneratorSubjectId, setAiGeneratorSubjectId] = useState<string | undefined>(undefined);
  const [aiGeneratorNoteId, setAiGeneratorNoteId] = useState<string | undefined>(undefined);

  const [isActiveRevisionOpen, setIsActiveRevisionOpen] = useState(false);
  const [activeRevisionItem, setActiveRevisionItem] = useState<RevisionScheduleItem | null>(null);

  // Sync active note, folder, and subject from URL query params
  useEffect(() => {
    const noteParam = searchParams.get('note');
    const folderParam = searchParams.get('folder');
    const subjectParam = searchParams.get('subject');

    if (noteParam && notes.some((n) => n.id === noteParam)) {
      setActiveNoteId(noteParam);
      const n = notes.find((item) => item.id === noteParam);
      if (n?.folderId) setSelectedFolderId(n.folderId);
      if (n?.subjectId) setSelectedSubjectId(n.subjectId);
      setViewState('document_editor');
    } else if (folderParam && folders.some((f) => f.id === folderParam)) {
      setSelectedFolderId(folderParam);
      const f = folders.find((item) => item.id === folderParam);
      if (f?.subjectId) setSelectedSubjectId(f.subjectId);
      setViewState('folder_explorer');
    } else if (subjectParam && subjects.some((s) => s.id === subjectParam)) {
      setSelectedSubjectId(subjectParam);
      setSelectedFolderId(null);
      setViewState('folder_explorer');
    }
  }, [searchParams, notes, folders, subjects, setActiveNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;
  const currentFolder = folders.find((f) => f.id === selectedFolderId) || null;
  const currentSubject = subjects.find((s) => s.id === (currentFolder?.subjectId || selectedSubjectId)) || null;

  // Handle note selection
  const handleOpenNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setSearchParam('note', noteId);
    setViewState('document_editor');
  };

  const handleCreateNewDocument = () => {
    const newDoc = createNote(selectedFolderId || undefined, currentSubject?.id || undefined);
    handleOpenNote(newDoc.id);
  };

  const handleOpenCreateFolder = (subId?: string, parentId?: string | null) => {
    setModalSubjectId(subId || currentSubject?.id);
    setModalParentId(parentId !== undefined ? parentId : currentFolder?.id);
    setIsCreateFolderOpen(true);
  };

  // Revision Modal Handlers
  const handleOpenScheduleModalFromExplorer = (item: SelectedItem) => {
    if (item.type === 'directory') {
      if (item.data.isSubject) {
        setScheduleModalTarget({
          type: 'subject',
          targetId: item.data.id,
          subjectId: item.data.id,
        });
      } else {
        setScheduleModalTarget({
          type: 'folder',
          targetId: item.data.id,
          subjectId: item.data.rawFolder?.subjectId || currentSubject?.id,
        });
      }
    } else {
      setScheduleModalTarget({
        type: 'file',
        targetId: item.data.id,
        subjectId: item.data.subjectId || currentSubject?.id,
      });
    }
    setIsScheduleModalOpen(true);
  };

  const handleOpenScheduleModalFromEditor = (noteId: string, subjectId?: string) => {
    setScheduleModalTarget({
      type: 'file',
      targetId: noteId,
      subjectId: subjectId || currentSubject?.id,
    });
    setIsScheduleModalOpen(true);
  };

  const handleOpenAIGenerator = (subId?: string, noteId?: string) => {
    setAiGeneratorSubjectId(subId || currentSubject?.id);
    setAiGeneratorNoteId(noteId);
    setIsAIGeneratorOpen(true);
  };

  const handleStartActiveRevision = (
    noteId?: string,
    folderId?: string,
    subjectId?: string,
    title?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetType = noteId ? 'file' : 'folder';
    const targetId = noteId || folderId || currentFolder?.id || 'root_dir';
    const subId = subjectId || currentSubject?.id || 'sub_default';
    const sub = subjects.find((s) => s.id === subId);

    // Look for existing item or create active one
    const existing = revisionItems.find((r) => r.targetId === targetId);
    if (existing) {
      setActiveRevisionItem(existing);
    } else {
      const newItem = scheduleRevision({
        targetType,
        targetId,
        title: title || (noteId ? 'Note Document' : 'Study Folder'),
        subjectId: subId,
        subjectName: sub?.name || 'General Study',
        folderName: currentFolder?.name,
        scheduledDate: todayStr,
        scheduledTime: 'Now',
        intervalDays: 1,
        emailReminder: false,
      });
      setActiveRevisionItem(newItem);
    }
    setIsActiveRevisionOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Quick Switcher Bar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 flex-wrap min-w-0">
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(null);
              setSelectedSubjectId(null);
              setViewState('folder_explorer');
            }}
            className="hover:text-indigo-400 flex items-center gap-1 text-slate-400 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Workspace</span>
          </button>

          {currentSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <button
                type="button"
                onClick={() => {
                  setSelectedFolderId(null);
                  setSelectedSubjectId(currentSubject.id);
                  setViewState('folder_explorer');
                }}
                className="hover:text-indigo-400 text-indigo-300 font-bold transition-colors truncate max-w-[150px]"
              >
                {currentSubject.name}
              </button>
            </>
          )}

          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <button
                type="button"
                onClick={() => {
                  setSelectedFolderId(currentFolder.id);
                  setViewState('folder_explorer');
                }}
                className="hover:text-indigo-400 text-slate-200 font-bold transition-colors truncate max-w-[160px]"
              >
                📁 {currentFolder.name}
              </button>
            </>
          )}

          {viewState === 'document_editor' && activeNote && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-extrabold truncate max-w-[180px]">
                📄 {activeNote.title || 'Untitled'}
              </span>
            </>
          )}
        </div>

        {/* View Switcher: Folder Explorer vs Document Editor */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setViewState('folder_explorer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewState === 'folder_explorer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Folder Explorer</span>
          </button>

          {activeNote && (
            <button
              type="button"
              onClick={() => setViewState('document_editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewState === 'document_editor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{activeNote.title || 'Editor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout: Left Sidebar + Center Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left Column: Subject & Folder Tree Hierarchy (col-span-3 on lg) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            {/* Hierarchy Tree */}
            <FolderTree
              selectedFolderId={selectedFolderId}
              selectedSubjectId={selectedSubjectId}
              onSelectFolder={(fId) => {
                setSelectedFolderId(fId);
                setViewState('folder_explorer');
              }}
              onSelectSubject={(sId) => {
                setSelectedSubjectId(sId);
                setSelectedFolderId(null);
                setViewState('folder_explorer');
              }}
              onOpenCreateFolderModal={handleOpenCreateFolder}
              onOpenCreateSubjectModal={() => setIsCreateSubjectOpen(true)}
            />
          </div>
        </div>

        {/* Center / Main Column: Folder Explorer or Rich Document Editor (col-span-9 on lg) */}
        <div className="lg:col-span-9">
          {viewState === 'document_editor' && activeNote ? (
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl min-h-[600px] flex flex-col">
              <RichDocumentEditor
                note={activeNote}
                onBackToFolder={() => setViewState('folder_explorer')}
                onOpenScheduleModal={handleOpenScheduleModalFromEditor}
                onOpenAIGenerator={handleOpenAIGenerator}
                onStartActiveRevision={handleStartActiveRevision}
              />
            </div>
          ) : (
            <FolderContentsView
              currentFolder={currentFolder}
              currentSubject={currentSubject}
              onOpenDocument={handleOpenNote}
              onCreateDocument={handleCreateNewDocument}
              onOpenFileUploadModal={() => setIsFileUploadOpen(true)}
              onNavigateFolder={(fId) => {
                setSelectedFolderId(fId);
                setViewState('folder_explorer');
              }}
              onNavigateSubject={(sId) => {
                setSelectedSubjectId(sId);
                setSelectedFolderId(null);
                setViewState('folder_explorer');
              }}
              onOpenCreateFolderModal={(sId, pId) => handleOpenCreateFolder(sId, pId)}
              onOpenCreateSubjectModal={() => setIsCreateSubjectOpen(true)}
              onOpenScheduleModal={handleOpenScheduleModalFromExplorer}
              onOpenAIGenerator={handleOpenAIGenerator}
              onStartActiveRevision={handleStartActiveRevision}
            />
          )}
        </div>
      </div>

      {/* Creation Modals */}
      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        defaultSubjectId={modalSubjectId || currentSubject?.id}
        defaultParentId={modalParentId}
      />

      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        defaultSubjectId={currentSubject?.id}
        defaultFolderId={currentFolder?.id}
      />

      {/* Spaced Repetition & Revision Modals */}
      <SetRevisionScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        defaultType={scheduleModalTarget.type}
        defaultTargetId={scheduleModalTarget.targetId}
        defaultSubjectId={scheduleModalTarget.subjectId}
        onStartActiveRecall={(item) => {
          setActiveRevisionItem(item);
          setIsActiveRevisionOpen(true);
        }}
        onOpenAIGenerator={(subId, noteId) => {
          handleOpenAIGenerator(subId, noteId);
        }}
      />

      <AIFlashcardGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        defaultSubjectId={aiGeneratorSubjectId}
        defaultNoteId={aiGeneratorNoteId}
      />

      <ActiveRevisionModal
        isOpen={isActiveRevisionOpen}
        onClose={() => {
          setIsActiveRevisionOpen(false);
          setActiveRevisionItem(null);
        }}
        revisionItem={activeRevisionItem}
        onOpenAIGenerator={(subId, noteId) => {
          handleOpenAIGenerator(subId, noteId);
        }}
      />
    </div>
  );
};

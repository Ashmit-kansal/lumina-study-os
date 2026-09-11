import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../context/RouterContext';
import { FolderTree } from './FolderTree';
import { RichDocumentEditor } from './RichDocumentEditor';
import { FolderContentsView } from './FolderContentsView';
import { CreateFolderModal } from './CreateFolderModal';
import { CreateSubjectModal } from './CreateSubjectModal';
import { FileUploadModal } from './FileUploadModal';
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
  } = useApp();

  const { searchParams, setSearchParam } = useRouter();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Main stage view: 'folder_explorer' or 'document_editor'
  const [viewState, setViewState] = useState<'folder_explorer' | 'document_editor'>('folder_explorer');

  // Modals state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [modalSubjectId, setModalSubjectId] = useState<string | undefined>(undefined);
  const [modalParentId, setModalParentId] = useState<string | null | undefined>(undefined);

  // Sync active note from URL query param if present
  useEffect(() => {
    const noteParam = searchParams.get('note');
    if (noteParam && notes.some((n) => n.id === noteParam)) {
      setActiveNoteId(noteParam);
      setViewState('document_editor');
    }
  }, [searchParams, notes, setActiveNoteId]);

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
            />
          )}
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
};

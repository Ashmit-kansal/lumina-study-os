import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Folder, Subject, NoteDocument, FileAttachment } from '../../types';
import { FileViewerModal } from './FileViewerModal';
import { stripFormattingForSnippet } from '../../utils/textFormatter';
import { R2StorageService } from '../../services/r2StorageService';
import mammoth from 'mammoth';
import {
  Folder as FolderIcon,
  FolderOpen,
  FolderClosed,
  FileText,
  Upload,
  Plus,
  Trash2,
  Search,
  Eye,
  FileCode,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Download,
  Calendar,
  FolderPlus,
  CheckCircle2,
  ArrowUpDown,
  HardDrive,
  Edit2,
  X,
  ChevronDown,
  FileSpreadsheet,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface FolderContentsViewProps {
  currentFolder: Folder | null;
  currentSubject: Subject | null;
  onOpenDocument: (noteId: string) => void;
  onCreateDocument: () => void;
  onOpenFileUploadModal: () => void;
  onNavigateFolder?: (folderId: string | null) => void;
  onNavigateSubject?: (subjectId: string | null) => void;
  onOpenCreateFolderModal?: (subjectId?: string, parentId?: string | null) => void;
  onOpenCreateSubjectModal?: () => void;
}

export interface DirectoryItem {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  isSubject: boolean;
  itemCount: number;
  rawFolder?: Folder;
  rawSubject?: Subject;
}

export type SelectedItem =
  | { type: 'directory'; data: DirectoryItem }
  | { type: 'note'; data: NoteDocument }
  | { type: 'file'; data: FileAttachment };

export const FolderContentsView: React.FC<FolderContentsViewProps> = ({
  currentFolder,
  currentSubject,
  onOpenDocument,
  onCreateDocument,
  onOpenFileUploadModal,
  onNavigateFolder,
  onNavigateSubject,
  onOpenCreateFolderModal,
  onOpenCreateSubjectModal,
}) => {
  const {
    notes,
    files,
    folders,
    subjects,
    deleteNote,
    deleteFileAttachment,
    deleteFolder,
    addFileAttachment,
    scheduleRevision,
    updateFolder,
    updateNoteContent,
  } = useApp();

  // Navigation History (Back / Forward)
  const [navHistory, setNavHistory] = useState<Array<{ folderId: string | null; subjectId: string | null }>>([
    { folderId: currentFolder?.id || null, subjectId: currentSubject?.id || null },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // View & Filter States (Windows Style)
  const [viewMode, setViewMode] = useState<'details' | 'large_icons' | 'tiles'>('details');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Context Menu & Inline Renaming
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: SelectedItem } | null>(null);
  const [renamingItem, setRenamingItem] = useState<SelectedItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Modals & Direct Upload
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<FileAttachment | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Sync navigation history on external folder changes
  useEffect(() => {
    const currentEntry = navHistory[historyIndex];
    const isSame =
      currentEntry &&
      currentEntry.folderId === (currentFolder?.id || null) &&
      currentEntry.subjectId === (currentSubject?.id || null);

    if (!isSame) {
      const newHistory = navHistory.slice(0, historyIndex + 1);
      newHistory.push({
        folderId: currentFolder?.id || null,
        subjectId: currentSubject?.id || null,
      });
      setNavHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    setSelectedItem(null);
    setContextMenu(null);
  }, [currentFolder?.id, currentSubject?.id]);

  // Back / Forward / Up navigation
  const handleNavBack = () => {
    if (historyIndex > 0) {
      const prev = navHistory[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onNavigateFolder?.(prev.folderId);
      onNavigateSubject?.(prev.subjectId);
    }
  };

  const handleNavForward = () => {
    if (historyIndex < navHistory.length - 1) {
      const next = navHistory[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onNavigateFolder?.(next.folderId);
      onNavigateSubject?.(next.subjectId);
    }
  };

  const handleNavUp = () => {
    if (currentFolder) {
      if (currentFolder.parentId) {
        onNavigateFolder?.(currentFolder.parentId);
      } else if (currentFolder.subjectId) {
        onNavigateFolder?.(null);
        onNavigateSubject?.(currentFolder.subjectId);
      } else {
        onNavigateFolder?.(null);
        onNavigateSubject?.(null);
      }
    } else if (currentSubject) {
      onNavigateFolder?.(null);
      onNavigateSubject?.(null);
    }
  };

  // Close context menu and dropdown menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setIsNewMenuOpen(false);
      setIsSortMenuOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const isRootView = !currentSubject && !currentFolder;

  // Directory Folders (At root: Subjects; In subject: Folders; In folder: Subfolders)
  const directoryFolders: DirectoryItem[] = isRootView
    ? subjects.map((sub) => {
        const subNotesCount = notes.filter((n) => n.subjectId === sub.id).length;
        const subFilesCount = files.filter((f) => f.subjectId === sub.id).length;
        const subFoldersCount = folders.filter((f) => f.subjectId === sub.id).length;
        return {
          id: sub.id,
          name: sub.name,
          color: sub.color,
          createdAt: sub.createdAt,
          isSubject: true,
          itemCount: subNotesCount + subFilesCount + subFoldersCount,
          rawSubject: sub,
        };
      })
    : folders
        .filter((f) => {
          if (currentFolder) return f.parentId === currentFolder.id;
          if (currentSubject) return f.subjectId === currentSubject.id && !f.parentId;
          return false;
        })
        .map((f) => {
          const folderNotesCount = notes.filter((n) => n.folderId === f.id).length;
          const folderFilesCount = files.filter((f) => f.folderId === f.id).length;
          const folderSubCount = folders.filter((child) => child.parentId === f.id).length;
          return {
            id: f.id,
            name: f.name,
            color: f.color,
            createdAt: f.createdAt,
            isSubject: false,
            itemCount: folderNotesCount + folderFilesCount + folderSubCount,
            rawFolder: f,
          };
        });

  // Notes in current directory
  const currentNotes = notes.filter((n) => {
    if (currentFolder) return n.folderId === currentFolder.id;
    if (currentSubject) return n.subjectId === currentSubject.id && !n.folderId;
    return !n.folderId && !n.subjectId;
  });

  // Files in current directory
  const currentFiles = files.filter((f) => {
    if (currentFolder) return f.folderId === currentFolder.id;
    if (currentSubject) return f.subjectId === currentSubject.id && !f.folderId;
    return !f.folderId && !f.subjectId;
  });

  // File metadata & icon helper (Windows styled)
  const getFileMeta = (filename: string, mime: string) => {
    const fn = filename.toLowerCase();
    if (fn.endsWith('.pdf') || mime.includes('pdf')) {
      return {
        typeLabel: 'Adobe Acrobat Document (.pdf)',
        badge: 'PDF',
        iconBg: 'bg-red-500/20 text-red-400 border border-red-500/30',
        color: 'text-red-400',
        ext: 'PDF',
      };
    }
    if (
      fn.endsWith('.docx') ||
      fn.endsWith('.doc') ||
      mime.includes('word') ||
      mime.includes('officedocument')
    ) {
      return {
        typeLabel: 'Microsoft Word Document (.docx)',
        badge: 'DOCX',
        iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        color: 'text-blue-400',
        ext: 'DOCX',
      };
    }
    if (mime.startsWith('image/') || /\.(png|jpe?g|svg|webp|gif)$/i.test(fn)) {
      return {
        typeLabel: 'PNG / JPEG Image',
        badge: 'IMAGE',
        iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        color: 'text-purple-400',
        ext: 'IMG',
      };
    }
    if (fn.endsWith('.json') || fn.endsWith('.ts') || fn.endsWith('.js') || fn.endsWith('.py') || fn.endsWith('.cpp')) {
      return {
        typeLabel: 'Source Code File',
        badge: 'CODE',
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        color: 'text-amber-400',
        ext: 'CODE',
      };
    }
    return {
      typeLabel: 'Text Document (.txt)',
      badge: 'TXT',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      color: 'text-emerald-400',
      ext: 'TXT',
    };
  };

  // Direct Drag & Drop Upload
  const handleDirectDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processDirectUpload(e.dataTransfer.files);
    }
  };

  const processDirectUpload = async (fileList: FileList) => {
    let count = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fn = file.name.toLowerCase();
      let fileUrl = URL.createObjectURL(file);
      let extractedContent: string | undefined = undefined;

      try {
        if (fn.endsWith('.docx') || file.type.includes('officedocument.wordprocessingml')) {
          const arrayBuffer = await file.arrayBuffer();
          const res = await mammoth.convertToHtml({ arrayBuffer });
          extractedContent = res.value || '<p>Empty Word document</p>';
        } else if (
          fn.endsWith('.txt') ||
          fn.endsWith('.md') ||
          fn.endsWith('.json') ||
          file.type.startsWith('text/')
        ) {
          extractedContent = await file.text();
        }
      } catch (err) {
        console.warn('File upload parse error:', err);
      }

      const newAttachment: FileAttachment = {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        sizeBytes: file.size || 50000,
        mimeType: file.type || 'application/octet-stream',
        url: fileUrl,
        storageType: 'indexeddb',
        uploadedAt: new Date().toISOString(),
        subjectId: currentFolder?.subjectId || currentSubject?.id || undefined,
        folderId: currentFolder?.id || undefined,
        fileContent: extractedContent,
      };

      addFileAttachment(newAttachment);
      count++;
    }
    showToast(`Uploaded ${count} file(s) into this folder.`);
  };

  // Filtering by Search
  const filteredFolders = directoryFolders.filter((f) =>
    searchFilter ? f.name.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  const filteredNotes = currentNotes.filter((n) =>
    searchFilter
      ? n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.content.toLowerCase().includes(searchFilter.toLowerCase())
      : true
  );

  const filteredFiles = currentFiles.filter((f) =>
    searchFilter
      ? f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (f.fileContent && f.fileContent.toLowerCase().includes(searchFilter.toLowerCase()))
      : true
  );

  // Strongly typed sorting helper
  const sortList = <T,>(
    list: T[],
    getName: (item: T) => string,
    getDate: (item: T) => string,
    getSize: (item: T) => number,
    isFolder: boolean = false
  ): T[] => {
    return [...list].sort((a, b) => {
      const nameA = getName(a).toLowerCase();
      const nameB = getName(b).toLowerCase();
      const dateA = getDate(a);
      const dateB = getDate(b);
      const sizeA = getSize(a);
      const sizeB = getSize(b);

      let comparison = 0;
      if (sortBy === 'name') comparison = nameA.localeCompare(nameB);
      else if (sortBy === 'date') comparison = dateB.localeCompare(dateA);
      else if (sortBy === 'size') comparison = sizeB - sizeA;
      else if (sortBy === 'type') comparison = (isFolder ? 'a' : 'b').localeCompare(isFolder ? 'a' : 'b');

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const sortedFolders = sortList(
    filteredFolders,
    (f) => f.name,
    (f) => f.createdAt,
    (f) => f.itemCount,
    true
  );

  const sortedNotes = sortList(
    filteredNotes,
    (n) => n.title,
    (n) => n.updatedAt,
    (n) => n.content.length,
    false
  );

  const sortedFiles = sortList(
    filteredFiles,
    (f) => f.name,
    (f) => f.uploadedAt,
    (f) => f.sizeBytes,
    false
  );

  const totalItemsCount = sortedFolders.length + sortedNotes.length + sortedFiles.length;
  const currentTotalBytes = currentFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

  // Handle Double Click to open item (Windows standard)
  const handleItemDoubleClick = (item: SelectedItem) => {
    if (item.type === 'directory') {
      if (item.data.isSubject) {
        onNavigateSubject?.(item.data.id);
      } else {
        onNavigateFolder?.(item.data.id);
      }
    } else if (item.type === 'note') {
      onOpenDocument(item.data.id);
    } else if (item.type === 'file') {
      setSelectedPreviewFile(item.data);
    }
  };

  // Rename Submission
  const handleStartRename = (item: SelectedItem) => {
    const currentName =
      item.type === 'directory'
        ? item.data.name
        : item.type === 'note'
        ? item.data.title
        : item.data.name;
    setRenamingItem(item);
    setRenameValue(currentName);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingItem || !renameValue.trim()) {
      setRenamingItem(null);
      return;
    }

    if (renamingItem.type === 'directory' && !renamingItem.data.isSubject) {
      updateFolder(renamingItem.data.id, { name: renameValue.trim() });
    } else if (renamingItem.type === 'note') {
      updateNoteContent(
        renamingItem.data.id,
        renameValue.trim(),
        renamingItem.data.content,
        renamingItem.data.tags,
        renamingItem.data.folderId,
        renamingItem.data.subjectId
      );
    }
    showToast(`Renamed to "${renameValue.trim()}"`);
    setRenamingItem(null);
  };

  // Delete Action
  const handleDeleteSelected = () => {
    if (!selectedItem) return;
    const name =
      selectedItem.type === 'directory'
        ? selectedItem.data.name
        : selectedItem.type === 'note'
        ? selectedItem.data.title
        : selectedItem.data.name;

    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      if (selectedItem.type === 'directory' && !selectedItem.data.isSubject) {
        deleteFolder(selectedItem.data.id);
      } else if (selectedItem.type === 'note') {
        deleteNote(selectedItem.data.id);
      } else if (selectedItem.type === 'file') {
        deleteFileAttachment(selectedItem.data.id);
      }
      setSelectedItem(null);
      showToast(`Deleted "${name}"`);
    }
  };

  // Schedule Revision
  const handleScheduleRevision = (item: SelectedItem) => {
    const name =
      item.type === 'directory'
        ? item.data.name
        : item.type === 'note'
        ? item.data.title
        : item.data.name;
    const todayStr = new Date().toISOString().split('T')[0];

    scheduleRevision({
      targetType: item.type === 'directory' ? 'folder' : 'file',
      targetId: item.data.id,
      title: name,
      subjectId: currentSubject?.id || currentFolder?.subjectId || 'sub_default',
      subjectName: currentSubject?.name || 'General Study',
      folderName: currentFolder?.name,
      scheduledDate: todayStr,
      intervalDays: 3,
      emailReminder: false,
    });
    showToast(`"${name}" scheduled for Smart Active Recall!`);
  };

  // Breadcrumb Path Construction
  const pathSegments: Array<{ label: string; folderId: string | null; subjectId: string | null }> = [
    { label: 'This PC', folderId: null, subjectId: null },
    { label: 'Study Drive (C:)', folderId: null, subjectId: null },
  ];

  if (currentSubject) {
    pathSegments.push({
      label: currentSubject.name,
      folderId: null,
      subjectId: currentSubject.id,
    });
  }

  if (currentFolder) {
    const breadcrumbParents: Folder[] = [];
    let parentPtr = folders.find((f) => f.id === currentFolder.parentId);
    while (parentPtr) {
      breadcrumbParents.unshift(parentPtr);
      parentPtr = folders.find((f) => f.id === parentPtr?.parentId);
    }

    breadcrumbParents.forEach((p) => {
      pathSegments.push({
        label: p.name,
        folderId: p.id,
        subjectId: p.subjectId || null,
      });
    });

    pathSegments.push({
      label: currentFolder.name,
      folderId: currentFolder.id,
      subjectId: currentFolder.subjectId || null,
    });
  }

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDirectDrop}
      className="space-y-3 relative select-none font-sans"
    >
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-2xl border border-blue-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Drag & Drop Visual Overlay (Windows copy file look) */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 rounded-2xl bg-blue-950/90 border-2 border-dashed border-blue-400 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md shadow-2xl pointer-events-none">
          <Upload className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Copy files to {currentFolder ? currentFolder.name : 'Study Drive (C:)'}</h3>
          <p className="text-xs text-blue-200 mt-1">Release mouse to complete upload.</p>
        </div>
      )}

      {/* Hidden File Input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processDirectUpload(e.target.files)}
      />

      {/* ========================================================================= */}
      {/* 1. WINDOWS FILE EXPLORER HEADER & ADDRESS BAR                             */}
      {/* ========================================================================= */}
      <div className="glass-panel p-2.5 rounded-2xl border border-slate-800 space-y-2 bg-slate-900/90 shadow-lg relative z-30">
        <div className="flex items-center gap-2">
          {/* Navigation Controls: Back, Forward, Up, Refresh */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleNavBack}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
              title="Back (Alt + Left Arrow)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNavForward}
              disabled={historyIndex >= navHistory.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
              title="Forward (Alt + Right Arrow)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNavUp}
              disabled={!currentFolder && !currentSubject}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
              title="Up to parent folder (Alt + Up Arrow)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFilter('');
                showToast('Refreshed current view');
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh (F5)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Windows 11 Address Bar (Clickable Breadcrumbs) */}
          <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 overflow-x-auto scrollbar-none transition-colors">
            <HardDrive className="w-3.5 h-3.5 text-blue-400 mr-2 flex-shrink-0" />
            <div className="flex items-center gap-1 whitespace-nowrap min-w-0 flex-1">
              {pathSegments.map((seg, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateFolder?.(seg.folderId);
                      onNavigateSubject?.(seg.subjectId);
                    }}
                    className={`px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors truncate max-w-[140px] ${
                      idx === pathSegments.length - 1 ? 'font-bold text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {seg.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Search Bar on the right */}
          <div className="relative w-48 sm:w-60">
            <input
              type="text"
              placeholder={`Search ${currentFolder ? currentFolder.name : currentSubject ? currentSubject.name : 'Study Drive (C:)'}`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. WINDOWS 11 COMMAND BAR / RIBBON                                        */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Left Ribbon: New, Cut, Copy, Paste, Rename, Delete */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* New Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNewMenuOpen(!isNewMenuOpen);
                  setIsSortMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </button>

              {isNewMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl py-1.5 z-50 divide-y divide-slate-800 ring-1 ring-black/40 backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1">
                    {isRootView ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMenuOpen(false);
                          onOpenCreateSubjectModal?.();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>+ New Study Subject</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMenuOpen(false);
                          onOpenCreateFolderModal?.(currentSubject?.id, currentFolder?.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <FolderPlus className="w-4 h-4 text-amber-400" />
                        <span>Folder in {currentSubject?.name || 'Subject'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        onCreateDocument();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Text Document (.txt)</span>
                    </button>
                  </div>
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        onOpenFileUploadModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>Upload Files (PDF / Word)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Selection actions: Rename, Delete, Revise, Download */}
            <button
              type="button"
              disabled={!selectedItem || (selectedItem.type === 'directory' && selectedItem.data.isSubject)}
              onClick={() => selectedItem && handleStartRename(selectedItem)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white font-medium transition-colors"
              title="Rename (F2)"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Rename</span>
            </button>

            <button
              type="button"
              disabled={!selectedItem || (selectedItem.type === 'directory' && selectedItem.data.isSubject)}
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-red-400 font-medium transition-colors"
              title="Delete (Del)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => selectedItem && handleScheduleRevision(selectedItem)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-indigo-300 font-medium transition-colors"
              title="Schedule Active Recall Revision"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Schedule Revision</span>
            </button>

            {selectedItem && selectedItem.type === 'file' && (
              <button
                type="button"
                onClick={() => R2StorageService.triggerDownload(selectedItem.data)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-emerald-300 font-medium transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download</span>
              </button>
            )}
          </div>

          {/* Right Ribbon: Sort & View Modes */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSortMenuOpen(!isSortMenuOpen);
                  setIsNewMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort: {sortBy}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isSortMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl py-1.5 z-50 ring-1 ring-black/40 backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                      sortBy === 'name' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Name ({sortOrder === 'asc' ? 'A to Z' : 'Z to A'})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('date');
                      setSortOrder('desc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                      sortBy === 'date' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Date modified</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('size');
                      setSortOrder('desc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                      sortBy === 'size' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Size</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Mode Dropdown */}
            <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('details')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'details' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Details View (Windows Table)"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Details</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('large_icons')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'large_icons' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Large Icons View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Icons</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('tiles')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'tiles' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tiles View"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tiles</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WINDOWS EXPLORER MAIN CANVAS (Items List / Grid / Tiles)               */}
      {/* ========================================================================= */}
      <div
        className="glass-panel rounded-2xl border border-slate-800 bg-slate-950/60 min-h-[420px] p-2 sm:p-3 overflow-x-auto shadow-inner"
        onClick={() => setSelectedItem(null)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {totalItemsCount === 0 ? (
          /* Empty Folder / Drive State */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              {isRootView ? (
                <BookOpen className="w-8 h-8 text-indigo-400" />
              ) : (
                <FolderOpen className="w-8 h-8 text-amber-400/60" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300">
                {isRootView
                  ? 'No study subjects in this drive yet.'
                  : `Folder "${currentFolder ? currentFolder.name : currentSubject?.name}" is empty.`}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRootView
                  ? 'Create your first study subject (e.g. Distributed Systems, Mathematics) to organize your folders & notes.'
                  : 'Drag and drop files here, or use the buttons below.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {isRootView ? (
                <button
                  type="button"
                  onClick={onOpenCreateSubjectModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> + Create Study Subject
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenCreateFolderModal?.(currentSubject?.id, currentFolder?.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> + Folder in {currentSubject?.name || 'Subject'}
                  </button>
                  <button
                    type="button"
                    onClick={onCreateDocument}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Document
                  </button>
                </>
              )}
            </div>
          </div>
        ) : viewMode === 'details' ? (
          /* A. DETAILS VIEW MODE (Windows Classic Table) */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold select-none">
                <th
                  className="py-2 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    {sortBy === 'name' && (
                      <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-3 hidden sm:table-cell cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Date modified</span>
                    {sortBy === 'date' && (
                      <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-3 hidden md:table-cell cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('type');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    {sortBy === 'type' && (
                      <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('size');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Size</span>
                    {sortBy === 'size' && (
                      <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {/* Folders & Subjects Rows */}
              {sortedFolders.map((folder) => {
                const isSelected = selectedItem?.type === 'directory' && selectedItem.data.id === folder.id;

                return (
                  <tr
                    key={`f_${folder.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({ type: 'directory', data: folder });
                    }}
                    onDoubleClick={() => handleItemDoubleClick({ type: 'directory', data: folder })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedItem({ type: 'directory', data: folder });
                      setContextMenu({ x: e.clientX, y: e.clientY, item: { type: 'directory', data: folder } });
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 text-white font-semibold ring-1 ring-blue-500/60 rounded-lg'
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <td className="py-2 px-3 font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        {folder.isSubject ? (
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${folder.rawSubject?.color || 'from-indigo-600 to-blue-600'} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <FolderClosed className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className={`truncate ${folder.isSubject ? 'font-bold text-slate-100' : ''}`}>{folder.name}</span>
                        {folder.isSubject && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            SUBJECT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell text-slate-400 font-mono text-[11px]">
                      {new Date(folder.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell text-slate-400 text-[11px]">
                      {folder.isSubject ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Course Subject
                        </span>
                      ) : (
                        'File folder'
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 font-mono text-[11px]">
                      {folder.itemCount} items
                    </td>
                  </tr>
                );
              })}

              {/* Notes Rows */}
              {sortedNotes.map((note) => {
                const isSelected = selectedItem?.type === 'note' && selectedItem.data.id === note.id;
                return (
                  <tr
                    key={`n_${note.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({ type: 'note', data: note });
                    }}
                    onDoubleClick={() => handleItemDoubleClick({ type: 'note', data: note })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedItem({ type: 'note', data: note });
                      setContextMenu({ x: e.clientX, y: e.clientY, item: { type: 'note', data: note } });
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 text-white font-semibold ring-1 ring-blue-500/60 rounded-lg'
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <td className="py-2 px-3 font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{note.title || 'Untitled Note.txt'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell text-slate-400 font-mono text-[11px]">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell text-slate-400 text-[11px]">Text Document</td>
                    <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {note.content.length > 1000 ? `${(note.content.length / 1024).toFixed(1)} KB` : `${note.content.length} B`}
                    </td>
                  </tr>
                );
              })}

              {/* Uploaded Files Rows */}
              {sortedFiles.map((file) => {
                const isSelected = selectedItem?.type === 'file' && selectedItem.data.id === file.id;
                const meta = getFileMeta(file.name, file.mimeType);

                return (
                  <tr
                    key={`fl_${file.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({ type: 'file', data: file });
                    }}
                    onDoubleClick={() => handleItemDoubleClick({ type: 'file', data: file })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedItem({ type: 'file', data: file });
                      setContextMenu({ x: e.clientX, y: e.clientY, item: { type: 'file', data: file } });
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 text-white font-semibold ring-1 ring-blue-500/60 rounded-lg'
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <td className="py-2 px-3 font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`px-1 rounded text-[9px] font-bold ${meta.iconBg}`}>
                          {meta.ext}
                        </div>
                        <span className="truncate">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell text-slate-400 font-mono text-[11px]">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell text-slate-400 text-[11px]">
                      {meta.typeLabel}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {R2StorageService.formatBytes(file.sizeBytes)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : viewMode === 'large_icons' ? (
          /* B. LARGE ICONS VIEW MODE (Windows Big Icon Grid) */
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-2">
            {/* Folder / Subject Icons */}
            {sortedFolders.map((folder) => {
              const isSelected = selectedItem?.type === 'directory' && selectedItem.data.id === folder.id;
              return (
                <div
                  key={`lg_f_${folder.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'directory', data: folder });
                  }}
                  onDoubleClick={() => handleItemDoubleClick({ type: 'directory', data: folder })}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 ring-1 ring-blue-500/80 shadow-md'
                      : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  {folder.isSubject ? (
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${folder.rawSubject?.color || 'from-indigo-600 to-blue-600'} flex items-center justify-center text-white shadow-md mb-1.5 ring-1 ring-white/20`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                  ) : (
                    <FolderClosed className="w-12 h-12 text-amber-400 mb-1.5 drop-shadow-md" />
                  )}
                  <span className="text-xs font-semibold text-slate-100 truncate max-w-full">{folder.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {folder.isSubject ? 'Course Subject' : 'File folder'}
                  </span>
                </div>
              );
            })}

            {/* Note Icons */}
            {sortedNotes.map((note) => {
              const isSelected = selectedItem?.type === 'note' && selectedItem.data.id === note.id;
              return (
                <div
                  key={`lg_n_${note.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'note', data: note });
                  }}
                  onDoubleClick={() => handleItemDoubleClick({ type: 'note', data: note })}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 ring-1 ring-blue-500/80 shadow-md'
                      : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1.5 shadow-sm">
                    <FileText className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-slate-100 truncate max-w-full">
                    {note.title || 'Untitled.txt'}
                  </span>
                  <span className="text-[10px] text-slate-500">Text Doc</span>
                </div>
              );
            })}

            {/* Uploaded File Icons */}
            {sortedFiles.map((file) => {
              const isSelected = selectedItem?.type === 'file' && selectedItem.data.id === file.id;
              const meta = getFileMeta(file.name, file.mimeType);

              return (
                <div
                  key={`lg_fl_${file.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'file', data: file });
                  }}
                  onDoubleClick={() => handleItemDoubleClick({ type: 'file', data: file })}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 ring-1 ring-blue-500/80 shadow-md'
                      : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm ${meta.iconBg}`}
                  >
                    {meta.ext}
                  </div>
                  <span className="text-xs font-semibold text-slate-100 truncate max-w-full">{file.name}</span>
                  <span className="text-[10px] text-slate-500">{R2StorageService.formatBytes(file.sizeBytes)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* C. TILES VIEW MODE (Windows Tiles) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1">
            {sortedFolders.map((folder) => {
              const isSelected = selectedItem?.type === 'directory' && selectedItem.data.id === folder.id;
              return (
                <div
                  key={`tile_f_${folder.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'directory', data: folder });
                  }}
                  onDoubleClick={() => handleItemDoubleClick({ type: 'directory', data: folder })}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-500/80 shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                  }`}
                >
                  {folder.isSubject ? (
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${folder.rawSubject?.color || 'from-indigo-600 to-blue-600'} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                  ) : (
                    <FolderClosed className="w-9 h-9 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-100 truncate">{folder.name}</h5>
                    <p className="text-[10px] text-slate-500">{folder.isSubject ? 'Course Subject (Root)' : 'File folder'}</p>
                  </div>
                </div>
              );
            })}

            {sortedNotes.map((note) => {
              const isSelected = selectedItem?.type === 'note' && selectedItem.data.id === note.id;
              return (
                <div
                  key={`tile_n_${note.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'note', data: note });
                  }}
                  onDoubleClick={() => handleItemDoubleClick({ type: 'note', data: note })}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-500/80 shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-100 truncate">{note.title || 'Untitled.txt'}</h5>
                    <p className="text-[10px] text-slate-500">Text Document</p>
                  </div>
                </div>
              );
            })}

            {sortedFiles.map((file) => {
              const isSelected = selectedItem?.type === 'file' && selectedItem.data.id === file.id;
              const meta = getFileMeta(file.name, file.mimeType);

              return (
                <div
                  key={`tile_fl_${file.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'file', data: file });
                  }}
                  onDoubleClick={() => handleItemDoubleClick({ type: 'file', data: file })}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-500/80 shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${meta.iconBg}`}>
                    {meta.ext}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-100 truncate">{file.name}</h5>
                    <p className="text-[10px] text-slate-500">{R2StorageService.formatBytes(file.sizeBytes)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. WINDOWS STATUS BAR (Bottom Explorer Status)                            */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{totalItemsCount} items</span>
          <span className="text-slate-600">|</span>
          <span>
            {sortedFolders.length} folder(s), {sortedNotes.length + sortedFiles.length} file(s)
          </span>
          {selectedItem && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-blue-300 font-semibold">
                1 item selected (
                {selectedItem.type === 'directory'
                  ? selectedItem.data.name
                  : selectedItem.type === 'note'
                  ? `${(selectedItem.data.content.length / 1024).toFixed(1)} KB`
                  : R2StorageService.formatBytes(selectedItem.data.sizeBytes)}
                )
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          <span>
            Drive Space: {R2StorageService.formatBytes(currentTotalBytes)} / 500 MB Free Tier
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INLINE RENAME MODAL (When F2 or Rename is triggered)                   */}
      {/* ========================================================================= */}
      {renamingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRename}
            className="w-full max-w-sm glass-panel p-5 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                <span>Rename Item</span>
              </h3>
              <button
                type="button"
                onClick={() => setRenamingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">New Name:</label>
              <input
                type="text"
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenamingItem(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                Rename
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RIGHT-CLICK CONTEXT MENU (Windows Style)                               */}
      {/* ========================================================================= */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1 divide-y divide-slate-800 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                handleItemDoubleClick(contextMenu.item);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white flex items-center gap-2 text-slate-200"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
            {!(contextMenu.item.type === 'directory' && contextMenu.item.data.isSubject) && (
              <button
                type="button"
                onClick={() => {
                  handleStartRename(contextMenu.item);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white flex items-center gap-2 text-slate-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handleScheduleRevision(contextMenu.item);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white flex items-center gap-2 text-slate-200"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Active Recall</span>
            </button>
          </div>

          <div className="p-1">
            {contextMenu.item.type === 'file' && (
              <button
                type="button"
                onClick={() => {
                  if (contextMenu.item.type === 'file') R2StorageService.triggerDownload(contextMenu.item.data);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white flex items-center gap-2 text-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}
            {!(contextMenu.item.type === 'directory' && contextMenu.item.data.isSubject) && (
              <button
                type="button"
                onClick={() => {
                  handleDeleteSelected();
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-red-600 hover:text-white flex items-center gap-2 text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. File Viewer Modal */}
      <FileViewerModal
        isOpen={!!selectedPreviewFile}
        onClose={() => setSelectedPreviewFile(null)}
        file={selectedPreviewFile}
      />
    </div>
  );
};

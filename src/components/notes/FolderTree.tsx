import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderPlus,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  HardDrive,
  BookOpen,
  Monitor,
  Star,
  Laptop,
  FolderClosed,
  FolderOpen,
  Brain,
  Code2,
  Cpu,
  Network,
  Database,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface FolderTreeProps {
  selectedFolderId: string | null;
  selectedSubjectId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onSelectSubject: (subjectId: string | null) => void;
  onOpenCreateFolderModal: (subjectId?: string, parentId?: string | null) => void;
  onOpenCreateSubjectModal?: () => void;
  onOpenCreateNoteModal?: (subjectId?: string, folderId?: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  selectedFolderId,
  selectedSubjectId,
  onSelectFolder,
  onSelectSubject,
  onOpenCreateFolderModal,
  onOpenCreateSubjectModal,
}) => {
  const { folders, subjects, deleteFolder, notes, files } = useApp();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    quick_access: true,
    this_pc: true,
    ...subjects.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}),
  });

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const totalAllItems = notes.length + files.length;

  const renderSubjectIcon = (iconName: string, colorGradient: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-3.5 h-3.5 text-pink-400" />;
      case 'Code2':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'Network':
        return <Network className="w-3.5 h-3.5 text-blue-400" />;
      case 'Database':
        return <Database className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  // Recursive renderer for nested subfolders (Windows Tree style)
  const renderFolderHierarchy = (parentId: string | null, subjectId: string, depth: number = 0) => {
    const currentLevelFolders = folders.filter(
      (f) => f.subjectId === subjectId && (parentId ? f.parentId === parentId : !f.parentId)
    );

    if (currentLevelFolders.length === 0) return null;

    return currentLevelFolders.map((folder) => {
      const isSelected = selectedFolderId === folder.id;
      const subFolders = folders.filter((f) => f.parentId === folder.id);
      const hasSubFolders = subFolders.length > 0;
      const isExpanded = !!expandedNodes[folder.id];
      const folderNotesCount = notes.filter((n) => n.folderId === folder.id).length;
      const folderFilesCount = files.filter((f) => f.folderId === folder.id).length;
      const totalCount = folderNotesCount + folderFilesCount;

      return (
        <div key={folder.id} className="select-none">
          <div
            className={`group/folder flex items-center justify-between py-1 px-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              isSelected
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
            style={{ paddingLeft: `${Math.max(6, depth * 14 + 6)}px` }}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Expand / Collapse Chevron */}
              {hasSubFolders ? (
                <button
                  type="button"
                  onClick={(e) => toggleExpand(folder.id, e)}
                  className="p-0.5 hover:bg-slate-700/60 rounded text-slate-400 hover:text-white"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <span className="w-3 h-3 inline-block" />
              )}

              {/* Windows Classic Yellow Folder Icon for normal subfolders */}
              {isExpanded || isSelected ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              ) : (
                <FolderClosed className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              )}

              <span className="truncate text-[11px]">{folder.name}</span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover/folder:opacity-100">
              <span className="text-[9px] font-mono text-slate-500 px-1 rounded bg-slate-950/60">
                {totalCount}
              </span>

              {/* Add subfolder inside this folder */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateFolderModal(subjectId, folder.id);
                }}
                className="p-0.5 opacity-0 group-hover/folder:opacity-100 hover:text-indigo-300 text-slate-400 rounded transition-opacity"
                title="New Subfolder"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>

              {/* Delete folder */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete folder "${folder.name}"?`)) {
                    deleteFolder(folder.id);
                  }
                }}
                className="p-0.5 opacity-0 group-hover/folder:opacity-100 hover:text-red-400 text-slate-500 rounded transition-opacity"
                title="Delete"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Subfolders child list */}
          {hasSubFolders && isExpanded && (
            <div className="border-l border-slate-800/80 ml-2.5">
              {renderFolderHierarchy(folder.id, subjectId, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Header bar: Navigation Pane + Add Subject Button */}
      <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Navigation Pane</span>
        </div>

        {/* Create Subject Button (Subjects are top-level course categories) */}
        <button
          type="button"
          onClick={onOpenCreateSubjectModal}
          className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-95"
          title="Create New Study Subject"
        >
          <Plus className="w-3 h-3" />
          <span>+ Subject</span>
        </button>
      </div>

      {/* 1. Quick Access Section (Windows style) */}
      <div className="space-y-1">
        <div
          className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200"
          onClick={(e) => toggleExpand('quick_access', e)}
        >
          {expandedNodes['quick_access'] ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>Quick Access</span>
        </div>

        {expandedNodes['quick_access'] && (
          <div className="pl-2 space-y-0.5">
            {/* Master Vault Root */}
            <div
              onClick={() => {
                onSelectFolder(null);
                onSelectSubject(null);
              }}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedFolderId === null && selectedSubjectId === null
                  ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <HardDrive className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate text-[11px]">All Vault Files &amp; Notes</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-950/60 px-1 rounded">
                {totalAllItems}
              </span>
            </div>

            {/* Pinned Subjects List under Quick Access */}
            {subjects.slice(0, 3).map((sub) => {
              const subItemsCount =
                notes.filter((n) => n.subjectId === sub.id).length +
                files.filter((f) => f.subjectId === sub.id).length;

              return (
                <div
                  key={`qa_${sub.id}`}
                  onClick={() => {
                    onSelectSubject(sub.id);
                    onSelectFolder(null);
                  }}
                  className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs cursor-pointer transition-all ${
                    selectedSubjectId === sub.id && selectedFolderId === null
                      ? 'bg-blue-600/20 text-blue-300 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                      {renderSubjectIcon(sub.icon, sub.color)}
                    </div>
                    <span className="truncate text-[11px]">{sub.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{subItemsCount}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. This PC / Study Drive (C:) Section (Windows Tree Hierarchy) */}
      <div className="space-y-1 pt-1">
        <div
          className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200"
          onClick={(e) => toggleExpand('this_pc', e)}
        >
          {expandedNodes['this_pc'] ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <Laptop className="w-3 h-3 text-indigo-400" />
          <span>This PC &gt; Study Drive (C:)</span>
        </div>

        {expandedNodes['this_pc'] && (
          <div className="pl-1.5 space-y-1">
            {subjects.map((sub) => {
              const isSubSelected = selectedSubjectId === sub.id && selectedFolderId === null;
              const isExpanded = !!expandedNodes[sub.id];
              const subNotesCount = notes.filter((n) => n.subjectId === sub.id).length;
              const subFilesCount = files.filter((f) => f.subjectId === sub.id).length;
              const totalSubCount = subNotesCount + subFilesCount;
              const subFolders = folders.filter((f) => f.subjectId === sub.id && !f.parentId);

              return (
                <div key={sub.id} className="space-y-0.5">
                  {/* Subject Node Row (Distinct academic course styling) */}
                  <div
                    onClick={() => {
                      onSelectSubject(sub.id);
                      onSelectFolder(null);
                    }}
                    className={`group/sub flex items-center justify-between px-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isSubSelected
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {/* Chevron to expand/collapse subject's folders */}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(sub.id, e)}
                        className="p-0.5 hover:bg-slate-700/60 rounded text-slate-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>

                      {/* Distinct Subject Icon */}
                      <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                        {renderSubjectIcon(sub.icon, sub.color)}
                      </div>

                      <span className="truncate text-[11px] font-bold">{sub.name}</span>

                      {/* Subject Tag Pill */}
                      <span className="px-1 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        SUBJECT
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover/sub:opacity-100">
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950/60 px-1 rounded">
                        {totalSubCount}
                      </span>

                      {/* + Folder button specifically inside this subject */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCreateFolderModal(sub.id);
                        }}
                        className="p-1 opacity-0 group-hover/sub:opacity-100 hover:text-amber-300 hover:bg-slate-800 text-slate-400 rounded transition-all"
                        title={`New Folder inside ${sub.name}`}
                      >
                        <FolderPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Nested Folders under Subject */}
                  {isExpanded && (
                    <div className="border-l border-indigo-900/40 ml-3.5 pl-1 space-y-0.5">
                      {subFolders.length === 0 ? (
                        <div className="py-1 px-3 text-[10px] text-slate-500 italic flex items-center justify-between">
                          <span>(No folders yet)</span>
                          <button
                            type="button"
                            onClick={() => onOpenCreateFolderModal(sub.id)}
                            className="text-indigo-400 hover:underline text-[9px] font-semibold"
                          >
                            + Add Folder
                          </button>
                        </div>
                      ) : (
                        renderFolderHierarchy(null, sub.id, 0)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

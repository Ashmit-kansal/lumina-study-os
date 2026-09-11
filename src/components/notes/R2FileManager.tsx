import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { R2StorageService } from '../../services/r2StorageService';
import { R2ConfigModal } from './R2ConfigModal';
import { ProgressBar } from '../common/ProgressBar';
import {
  UploadCloud,
  FileText,
  FileCode,
  Image,
  File,
  Download,
  Trash2,
  Settings,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
} from 'lucide-react';

interface R2FileManagerProps {
  currentNoteId?: string;
}

export const R2FileManager: React.FC<R2FileManagerProps> = ({ currentNoteId }) => {
  const { files, addFileAttachment, deleteFileAttachment, r2Config, subjects } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalUsedBytes = R2StorageService.calculateTotalUsedBytes(files);
  const maxBytes = R2StorageService.MAX_FREE_BYTES;
  const storagePercentage = (totalUsedBytes / maxBytes) * 100;

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsUploading(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const newAttachment = await R2StorageService.uploadFile(file, r2Config, files, {
          noteId: currentNoteId,
        });
        addFileAttachment(newAttachment);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <Image className="w-4 h-4 text-emerald-400" />;
    if (mime.includes('pdf') || mime.includes('text')) return <FileText className="w-4 h-4 text-indigo-400" />;
    if (mime.includes('javascript') || mime.includes('json') || mime.includes('python'))
      return <FileCode className="w-4 h-4 text-amber-400" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
      {/* Header & Local Storage Prototyping Mode */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" /> Local Document Vault (500MB)
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Saved directly in your browser's persistent database
          </p>
        </div>

        <div className="flex items-center gap-2">
          {r2Config.enabled ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Cloud className="w-3 h-3" /> R2 Cloud Sync
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Local Storage Mode
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-indigo-300 transition-colors"
            title="Storage & Cloud Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 500MB Local Storage Bar */}
      <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
        <ProgressBar
          value={storagePercentage}
          max={100}
          label="Local Storage Used"
          sublabel={`${R2StorageService.formatBytes(totalUsedBytes)} of 500.0 MB`}
          colorClass={storagePercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}
          heightClass="h-2"
        />
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
        <div className="text-xs font-semibold text-slate-200">
          {isUploading ? 'Saving file to local storage...' : 'Drop files here or click to browse'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Instant local saving (PDF, slides, images, cheat sheets up to 500MB)
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Saved Files ({files.length})</span>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-950/20 rounded-xl border border-slate-800/40">
            No files attached yet. Drop slides, notes, or PDFs to store them locally.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getFileIcon(file.mimeType)}
                  <div className="truncate">
                    <span className="font-medium text-slate-200 truncate block">{file.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{R2StorageService.formatBytes(file.sizeBytes)}</span>
                      <span>•</span>
                      <span className="uppercase text-indigo-400 font-semibold">{file.storageType === 'indexeddb' ? 'Local Storage' : 'R2 Cloud'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => R2StorageService.triggerDownload(file)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
                    title="Download / Open File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteFileAttachment(file.id);
                      R2StorageService.deleteStoredFile(file.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage Settings Modal */}
      <R2ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
};

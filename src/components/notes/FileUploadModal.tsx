import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { FileAttachment } from '../../types';
import mammoth from 'mammoth';
import {
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  Check,
  HardDrive,
  Sparkles,
  Loader2,
  Folder as FolderIcon,
  BookOpen,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string | null;
  defaultFolderId?: string | null;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultFolderId,
}) => {
  const { subjects, folders, addFileAttachment } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [selectedFolderId, setSelectedFolderId] = useState(defaultFolderId || '');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFilesList, setUploadedFilesList] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultSubjectId) setSelectedSubjectId(defaultSubjectId);
      if (defaultFolderId !== undefined) setSelectedFolderId(defaultFolderId || '');
      setUploadedFilesList([]);
    }
  }, [isOpen, defaultSubjectId, defaultFolderId]);

  const targetFolder = folders.find((f) => f.id === selectedFolderId);
  const targetSubject = subjects.find((s) => s.id === selectedSubjectId);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fn = file.name.toLowerCase();
      let fileUrl = URL.createObjectURL(file);
      let extractedContent: string | undefined = undefined;

      try {
        // 1. PDF File
        if (fn.endsWith('.pdf') || file.type.includes('pdf')) {
          const dataUrl = await readFileAsDataURL(file);
          fileUrl = dataUrl;
        }
        // 2. DOCX File - parse real HTML using mammoth
        else if (fn.endsWith('.docx') || file.type.includes('officedocument.wordprocessingml')) {
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const result = await mammoth.convertToHtml({ arrayBuffer });
          extractedContent = result.value || '<p>Empty Word document</p>';
          fileUrl = URL.createObjectURL(file);
        }
        // 3. Text / Markdown / Code File
        else if (fn.endsWith('.txt') || fn.endsWith('.md') || fn.endsWith('.json') || file.type.startsWith('text/')) {
          extractedContent = await readFileAsText(file);
          fileUrl = URL.createObjectURL(file);
        }
        // 4. Image File
        else if (file.type.startsWith('image/')) {
          const dataUrl = await readFileAsDataURL(file);
          fileUrl = dataUrl;
        }
      } catch (err) {
        console.warn('File reading error, using standard object URL:', err);
        fileUrl = URL.createObjectURL(file);
      }

      const attachment: FileAttachment = {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: file.name,
        sizeBytes: file.size || 100000,
        mimeType: file.type || 'application/octet-stream',
        url: fileUrl,
        storageType: 'indexeddb',
        uploadedAt: new Date().toISOString(),
        subjectId: selectedSubjectId || undefined,
        folderId: selectedFolderId || undefined,
        fileContent: extractedContent,
      };

      addFileAttachment(attachment);
      newAttachments.push(attachment);
    }

    setUploadedFilesList((prev) => [...prev, ...newAttachments]);
    setIsProcessing(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Documents &amp; Files"
      subtitle="Upload real PDF lecture slides, Word documents (.docx), text files, or images for instant reading &amp; revision."
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Destination Target Info / Selector */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Upload Destination:</span>
            <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
              <FolderIcon className="w-3.5 h-3.5" />
              {targetFolder ? targetFolder.name : targetSubject ? `${targetSubject.name} (Root)` : 'Vault Root'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-800/80">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                Target Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100 py-1">
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                Target Folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  No Folder (Subject Root)
                </option>
                {folders
                  .filter((f) => !selectedSubjectId || f.subjectId === selectedSubjectId)
                  .map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-slate-100 py-1">
                      📁 {f.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/15 scale-[1.01]'
              : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.svg,.webp,.json,.csv"
            className="hidden"
            onChange={(e) => processFiles(e.target.files)}
          />

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                {isProcessing ? 'Reading & Extracting Content...' : 'Click to browse or drag & drop files here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports real PDF slides, Word (.docx), text notes, and diagrams
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                PDF
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                DOCX
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PNG / JPG
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TXT / MD
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFilesList.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Uploaded {uploadedFilesList.length} item(s):
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {uploadedFilesList.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                    {(file.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

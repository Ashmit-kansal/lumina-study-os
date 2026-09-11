import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FileAttachment } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  FileCode,
  Image as ImageIcon,
  Check,
  RotateCw,
  Sun,
  Moon,
  Copy,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileAttachment | null;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const { subjects, scheduleRevision } = useApp();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);
  const [pageTheme, setPageTheme] = useState<'dark' | 'paper'>('dark');
  const [useNativePdfEmbed, setUseNativePdfEmbed] = useState(true);

  if (!file) return null;

  const subject = subjects.find((s) => s.id === file.subjectId);
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.mimeType.includes('pdf');
  const isDocx =
    file.name.toLowerCase().endsWith('.docx') ||
    file.name.toLowerCase().endsWith('.doc') ||
    file.mimeType.includes('word') ||
    file.mimeType.includes('officedocument');
  const isImage =
    file.mimeType.startsWith('image/') ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(file.name);
  const isText =
    file.name.toLowerCase().endsWith('.txt') ||
    file.name.toLowerCase().endsWith('.md') ||
    file.name.toLowerCase().endsWith('.json') ||
    file.name.toLowerCase().endsWith('.csv') ||
    file.mimeType.startsWith('text/');

  const handleDownload = () => {
    if (file.url && (file.url.startsWith('http') || file.url.startsWith('blob:') || file.url.startsWith('data:'))) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    } else {
      const blob = new Blob([file.fileContent || file.name], {
        type: file.mimeType || 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyText = () => {
    const textToCopy = file.fileContent || file.name;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const hasRealPdfUrl = isPdf && file.url && (file.url.startsWith('blob:') || file.url.startsWith('data:') || file.url.startsWith('http'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={file.name}
      subtitle={`${(file.sizeBytes / 1024).toFixed(1)} KB • Uploaded on ${new Date(
        file.uploadedAt
      ).toLocaleDateString()} • ${subject?.name || 'Study Vault'}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Document Viewer Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
          {/* Format Badge & Subject */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPdf
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : isDocx
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : isImage
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isPdf ? 'PDF Document' : isDocx ? 'Word Document (.docx)' : isImage ? 'Image Asset' : 'Text File'}
            </span>

            {subject && (
              <span className="text-slate-400 font-medium hidden sm:inline">
                📁 {subject.name}
              </span>
            )}
          </div>

          {/* PDF Viewer Mode Toggle */}
          {hasRealPdfUrl && (
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setUseNativePdfEmbed(true)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  useNativePdfEmbed ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Native PDF Embed
              </button>
              <button
                type="button"
                onClick={() => setUseNativePdfEmbed(false)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  !useNativePdfEmbed ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Reader View
              </button>
            </div>
          )}

          {/* Zoom & Theme & Download Actions */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            {!isPdf && (
              <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1.5 text-slate-300">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Reading Theme Toggle (for DOCX or Reader view) */}
            {(isDocx || (!hasRealPdfUrl && isPdf)) && (
              <button
                type="button"
                onClick={() => setPageTheme(pageTheme === 'dark' ? 'paper' : 'dark')}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Toggle Paper / Dark Mode"
              >
                {pageTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            )}

            {/* Copy Text Button (for text or docx) */}
            {(isText || isDocx) && file.fileContent && (
              <button
                type="button"
                onClick={handleCopyText}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy Text"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Schedule Revision */}
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                scheduleRevision({
                  targetType: 'file',
                  targetId: file.id,
                  title: file.name,
                  subjectId: file.subjectId || 'sub_default',
                  subjectName: subject?.name || 'General Study',
                  scheduledDate: todayStr,
                  intervalDays: 3,
                  emailReminder: false,
                });
                alert(`"${file.name}" scheduled for Smart Revision!`);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all"
              title="Schedule for Spaced Repetition"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Revise</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* DOCUMENT CANVAS CONTAINER */}
        <div className="min-h-[460px] max-h-[580px] overflow-y-auto rounded-3xl bg-slate-950 p-2 sm:p-6 flex justify-center items-start border border-slate-800/80 shadow-inner">
          {/* 1. PDF VIEWER */}
          {isPdf && (
            <div className="w-full h-full flex flex-col items-center">
              {hasRealPdfUrl && useNativePdfEmbed ? (
                <iframe
                  src={`${file.url}#toolbar=1&navpanes=1`}
                  className="w-full h-[520px] rounded-2xl border border-slate-800 bg-white"
                  title={file.name}
                />
              ) : (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className={`w-full max-w-2xl p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6 transition-colors border ${
                    pageTheme === 'paper'
                      ? 'bg-[#fcfbf9] text-slate-900 border-amber-200/60 font-serif'
                      : 'bg-slate-900 text-slate-100 border-slate-700/80 font-sans'
                  }`}
                >
                  <div className="flex items-start justify-between border-b pb-4 border-slate-700/40">
                    <div>
                      <span className="text-[11px] font-bold text-red-500 tracking-wider uppercase block">
                        PDF DOCUMENT CONTENT
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
                        {file.name.replace(/\.[^/.]+$/, '')}
                      </h2>
                    </div>
                    <span className="text-xs font-mono opacity-60">PDF Document</span>
                  </div>

                  <div className="space-y-3 pt-2 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {file.fileContent ? (
                      <div>{file.fileContent}</div>
                    ) : (
                      <p>
                        This PDF document is stored in your study vault. Click "Download" to open in your default PDF reader or view the embedded preview above.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] opacity-50 pt-4 border-t border-slate-700/40">
                    <span>{file.name}</span>
                    <span>Lumina Study Vault</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. DOCX / WORD VIEWER (Real Extracted HTML from Mammoth) */}
          {isDocx && (
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-2xl p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6 transition-colors border ${
                pageTheme === 'paper'
                  ? 'bg-[#ffffff] text-slate-900 border-slate-300 font-sans'
                  : 'bg-slate-900 text-slate-100 border-slate-700/80 font-sans'
              }`}
            >
              {/* Word Ribbon Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    W
                  </div>
                  <span className="text-xs font-bold text-blue-400">Microsoft Word Document</span>
                </div>
                <span className="text-xs opacity-60 font-mono">{(file.sizeBytes / 1024).toFixed(1)} KB</span>
              </div>

              {/* Render the ACTUAL parsed HTML from the uploaded DOCX file */}
              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight border-b pb-2 border-slate-700/30">
                  {file.name.replace(/\.[^/.]+$/, '')}
                </h1>

                {file.fileContent ? (
                  <div
                    className="text-xs sm:text-sm leading-relaxed space-y-3 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: file.fileContent }}
                  />
                ) : (
                  <div className="text-xs opacity-80 leading-relaxed space-y-2">
                    <p>
                      Word document successfully loaded. Click Download to open directly in Microsoft Word or Office.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[10px] opacity-40 pt-4 border-t border-slate-700/40 text-right">
                {file.name}
              </div>
            </div>
          )}

          {/* 3. IMAGE VIEWER */}
          {isImage && (
            <div className="text-center space-y-4 w-full flex flex-col items-center justify-center p-4">
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 p-2 inline-block max-w-full">
                <img
                  src={file.url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'}
                  alt={file.name}
                  className="max-h-[460px] w-auto mx-auto object-contain rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-400 font-mono">{file.name}</p>
            </div>
          )}

          {/* 4. PLAIN TEXT / CODE VIEWER (Real file text) */}
          {isText && !isPdf && !isDocx && !isImage && (
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-indigo-400">📄 Plain Text Document</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {file.fileContent ? `${file.fileContent.length} characters` : ''}
                </span>
              </div>

              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {file.fileContent || 'No text content available.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

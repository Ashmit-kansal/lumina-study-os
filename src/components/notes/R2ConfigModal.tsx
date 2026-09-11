import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Cloud, Key, Lock, HardDrive, CheckCircle2, Globe, Database, Sparkles } from 'lucide-react';

interface R2ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const R2ConfigModal: React.FC<R2ConfigModalProps> = ({ isOpen, onClose }) => {
  const { r2Config, updateR2Config } = useApp();

  const [accountId, setAccountId] = useState(r2Config.accountId);
  const [accessKeyId, setAccessKeyId] = useState(r2Config.accessKeyId);
  const [secretAccessKey, setSecretAccessKey] = useState(r2Config.secretAccessKey);
  const [bucketName, setBucketName] = useState(r2Config.bucketName);
  const [publicUrl, setPublicUrl] = useState(r2Config.publicUrl);
  const [enabled, setEnabled] = useState(r2Config.enabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateR2Config({
      accountId: accountId.trim(),
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
      bucketName: bucketName.trim(),
      publicUrl: publicUrl.trim(),
      enabled,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Storage & Cloudflare R2 Sync"
      subtitle="Local Browser Storage (Active) & Optional Cloudflare R2 Cloud Integration"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Prototyping Local Storage Active Banner */}
        <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
            <Database className="w-4 h-4" /> Local Storage Prototyping Mode Active
          </div>
          <p>
            Your documents, notes, flashcards, and uploaded files (up to 500MB) are automatically stored in your browser's persistent database (IndexedDB &amp; LocalStorage). Zero cloud configuration required!
          </p>
        </div>

        {/* Optional Cloud Sync Toggle */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Optional Cloudflare R2 Bucket Sync
          </span>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-100 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-400" /> Enable Cloudflare R2 Cloud Sync
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Route uploads to your remote R2 bucket when deploying</div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Credentials Inputs (Only needed when cloud sync is active) */}
        {enabled && (
          <div className="space-y-3 animate-fade-in pt-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Cloudflare Account ID</label>
              <input
                type="text"
                placeholder="e.g. 7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">R2 Bucket Name</label>
                <input
                  type="text"
                  placeholder="e.g. lumina-study-vault"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Public Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="https://files.yourdomain.com"
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">R2 Access Key ID</label>
              <input
                type="text"
                placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j"
                value={accessKeyId}
                onChange={(e) => setAccessKeyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">R2 Secret Access Key</label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••••••••••"
                value={secretAccessKey}
                onChange={(e) => setSecretAccessKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {savedSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Storage settings updated successfully!
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20"
        >
          Save Storage Preferences
        </button>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useRoom } from '../../context/RoomContext';
import { StudierPeer } from '../../types';
import { ShieldAlert, AlertTriangle, Check, Shield } from 'lucide-react';

interface ReportUserModalProps {
  peer: StudierPeer | null;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: 'inappropriate_chat', label: 'Inappropriate or Distracting Chat Behavior', desc: 'Offensive language, off-topic spam, or disruptive messages' },
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Targeted hostility or unwelcome communication' },
  { id: 'fake_activity', label: 'Fake Study Activity or Botting', desc: 'Suspicious unattended timers or automated activity' },
  { id: 'spam', label: 'Spam or Unauthorized Advertising', desc: 'Promoting external services, links, or repetitive text' },
  { id: 'other', label: 'Other Concern', desc: 'Any other violation of study room community guidelines' },
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({ peer, isOpen, onClose }) => {
  const { reportUser } = useRoom();

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].label);
  const [details, setDetails] = useState('');
  const [blockUser, setBlockUser] = useState(true);

  if (!peer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportUser({
      targetPeerId: peer.id,
      targetPeerName: peer.name,
      reason: selectedReason,
      details: details.trim(),
      blockUser,
    });
    setDetails('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Studier for Behavioral Review"
      subtitle="Help keep Lumina study rooms peaceful, focused, and distraction-free"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target Peer Card Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <img
            src={peer.avatar}
            alt={peer.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-200 text-sm">{peer.name}</span>
              <span>{peer.countryFlag}</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Studying: {peer.subjectName} • {peer.status}
            </p>
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Select Violation Category *
          </label>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => {
              const isSelected = selectedReason === r.label;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.label)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500/50 text-slate-100 ring-1 ring-red-500/40 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-slate-200">{r.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{r.desc}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Details Textarea */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Additional Details (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Please provide any specific context or message excerpt..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
          />
        </div>

        {/* Block & Mute Checkbox */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={blockUser}
            onChange={(e) => setBlockUser(e.target.checked)}
            className="accent-red-500 rounded cursor-pointer w-4 h-4"
          />
          <div className="leading-tight">
            <span className="font-medium text-slate-200 block">
              Mute & hide {peer.name} from my session immediately
            </span>
            <span className="text-[10px] text-slate-400">
              Their messages and presence will be filtered from your room view
            </span>
          </div>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" /> Submit Report
          </button>
        </div>
      </form>
    </Modal>
  );
};

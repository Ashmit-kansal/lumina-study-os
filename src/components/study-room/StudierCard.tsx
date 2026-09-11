import React from 'react';
import { StudierPeer } from '../../types';
import { useRoom } from '../../context/RoomContext';
import {
  Flame,
  Clock,
  Brain,
  Coffee,
  Sparkles,
  Heart,
  UserPlus,
  UserCheck,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

interface StudierCardProps {
  peer: StudierPeer;
  onCheer?: () => void;
  onReport?: () => void;
}

export const StudierCard: React.FC<StudierCardProps> = ({ peer, onCheer, onReport }) => {
  const {
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    openDirectChat,
  } = useRoom();

  const isFocusing = peer.status === 'focusing';
  const friendship = !peer.isLocalUser ? getFriendshipStatus(peer.id) : 'none';

  // Format MM:SS seconds
  const totalSeconds =
    peer.sessionTimeLeftSeconds !== undefined
      ? Math.max(0, peer.sessionTimeLeftSeconds)
      : peer.sessionTimeLeftMinutes * 60;

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedSeconds = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Calculate session percentage
  const maxSessionSeconds = peer.totalSessionSeconds || (isFocusing ? 25 * 60 : 5 * 60);
  const progressPercent = Math.min(
    100,
    Math.max(0, ((maxSessionSeconds - totalSeconds) / maxSessionSeconds) * 100)
  );

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 overflow-hidden ${
        peer.isLocalUser
          ? 'bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/70 border-indigo-500/50 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'glass-panel border-slate-800 hover:border-slate-700/80 hover:shadow-xl'
      }`}
    >
      {/* Top Session Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isFocusing
              ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Header: Avatar, Name, Flag & Live Status */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={peer.avatar}
              alt={peer.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
            />
            {/* Live Status Pulse Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isFocusing ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-100 text-sm truncate">{peer.name}</span>
              <span className="text-xs flex-shrink-0" title={peer.country}>
                {peer.countryFlag}
              </span>
              {peer.isLocalUser && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
                  YOU
                </span>
              )}
            </div>

            {/* Live Real-Time Seconds Timer Badge */}
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isFocusing
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {isFocusing ? (
                  <Brain className="w-3 h-3 text-emerald-400 animate-pulse" />
                ) : (
                  <Coffee className="w-3 h-3 text-amber-400" />
                )}
                <span>{isFocusing ? 'Focusing' : 'On Break'}</span>
                <span className="font-mono font-bold text-[11px] text-white">
                  {formattedSeconds}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Streak Badge, Cheer & Report Actions */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-xl border border-amber-500/20 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{peer.streakDays}d</span>
          </div>

          <div className="flex items-center gap-1">
            {onCheer && !peer.isLocalUser && (
              <button
                type="button"
                onClick={onCheer}
                className="p-1 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-pink-950/30 transition-all opacity-70 group-hover:opacity-100"
                title={`Send cheer to ${peer.name}`}
              >
                <Heart className="w-3.5 h-3.5 hover:scale-125 transition-transform" />
              </button>
            )}

            {onReport && !peer.isLocalUser && (
              <button
                type="button"
                onClick={onReport}
                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all opacity-50 group-hover:opacity-100"
                title={`Report ${peer.name}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Subject & Today's Total */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Subject:</span>
          <span className="font-medium text-slate-200 truncate max-w-[170px] bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
            {peer.subjectName}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Today's Total:</span>
          <span className="font-mono text-indigo-400 font-semibold">
            {(peer.todayMinutes / 60).toFixed(1)}h ({peer.todayMinutes}m)
          </span>
        </div>
      </div>

      {/* Quote / Status Message */}
      <div className="mt-2.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 text-[11px] text-slate-300 italic line-clamp-2">
        "{peer.quote}"
      </div>

      {/* Bottom Action: Friend Status & Direct Chat Button */}
      {!peer.isLocalUser && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
          {friendship === 'friends' ? (
            <button
              type="button"
              onClick={() => openDirectChat(peer.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Chat (Friend)</span>
            </button>
          ) : friendship === 'pending_received' ? (
            <button
              type="button"
              onClick={() => acceptFriendRequest(peer.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Accept Friend Request</span>
            </button>
          ) : friendship === 'pending_sent' ? (
            <button
              type="button"
              disabled
              className="w-full py-1.5 px-3 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Friend Request Sent</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => sendFriendRequest(peer.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friend</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

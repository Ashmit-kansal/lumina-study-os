import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useRoom } from '../../context/RoomContext';
import { StudierPeer } from '../../types';
import {
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Clock,
  Flame,
  Check,
  X,
  UserMinus,
  Sparkles,
} from 'lucide-react';

interface FriendsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FriendsListModal: React.FC<FriendsListModalProps> = ({ isOpen, onClose }) => {
  const {
    friendsList,
    allKnownPeers,
    friendships,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    sendFriendRequest,
    openDirectChat,
    pendingRequestsCount,
  } = useRoom();

  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'discover'>(
    pendingRequestsCount > 0 ? 'pending' : 'friends'
  );

  const pendingPeers = allKnownPeers.filter((p) => friendships[p.id] === 'pending_received');
  const nonFriends = allKnownPeers.filter(
    (p) => !p.isLocalUser && (!friendships[p.id] || friendships[p.id] === 'none')
  );

  const handleOpenDM = (peerId: string) => {
    openDirectChat(peerId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Study Friends & Direct Connections"
      subtitle="Connect with peers, collaborate 1-on-1, and hold each other accountable"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Friends ({friendsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Requests ({pendingPeers.length})</span>
            {pendingPeers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping absolute top-1.5 right-2" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'discover'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover ({nonFriends.length})</span>
          </button>
        </div>

        {/* Tab 1: Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {friendsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <Users className="w-8 h-8 opacity-40 mx-auto text-indigo-400" />
                <p className="text-xs">No study friends yet.</p>
                <p className="text-[11px] text-slate-500">
                  Send friend requests to studiers in your room to unlock direct 1-on-1 chat!
                </p>
              </div>
            ) : (
              friendsList.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200 text-xs truncate">
                          {friend.name}
                        </span>
                        <span className="text-xs">{friend.countryFlag}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="text-indigo-300 font-medium truncate max-w-[120px]">
                          {friend.subjectName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          <Flame className="w-3 h-3 fill-current" /> {friend.streakDays}d
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: DM & Unfriend */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenDM(friend.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFriend(friend.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Remove Friend"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Pending Requests */}
        {activeTab === 'pending' && (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {pendingPeers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-1">
                <UserCheck className="w-8 h-8 opacity-40 mx-auto text-emerald-400" />
                <p className="text-xs">No pending friend requests.</p>
              </div>
            ) : (
              pendingPeers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200 text-xs truncate">
                          {peer.name}
                        </span>
                        <span className="text-xs">{peer.countryFlag}</span>
                      </div>
                      <p className="text-[10px] text-indigo-300 truncate mt-0.5">
                        Wants to connect • {peer.subjectName}
                      </p>
                    </div>
                  </div>

                  {/* Accept & Decline Buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => acceptFriendRequest(peer.id)}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      title="Accept Friend Request"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Accept</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => declineFriendRequest(peer.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Discover Active Studiers */}
        {activeTab === 'discover' && (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {nonFriends.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-1">
                <Sparkles className="w-8 h-8 opacity-40 mx-auto text-amber-400" />
                <p className="text-xs">You are already connected with all active studiers!</p>
              </div>
            ) : (
              nonFriends.map((peer) => {
                const status = friendships[peer.id];
                const isPending = status === 'pending_sent';

                return (
                  <div
                    key={peer.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200 text-xs truncate">
                            {peer.name}
                          </span>
                          <span className="text-xs">{peer.countryFlag}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {peer.subjectName} • {peer.status}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => sendFriendRequest(peer.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isPending
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 shadow-sm active:scale-95'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isPending ? 'Sent' : 'Add Friend'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { StudierPeer } from '../../types';
import { StudierCard } from './StudierCard';
import { MotivationBar } from './MotivationBar';
import { RoomPledgeBar } from './RoomPledgeBar';
import { RoomChatModal } from './RoomChatModal';
import { CreateRoomModal } from './CreateRoomModal';
import { FriendsListModal } from './FriendsListModal';
import { ReportUserModal } from './ReportUserModal';
import { LofiAudioPlayer } from '../audio/LofiAudioPlayer';
import {
  Users,
  Sparkles,
  BookOpen,
  Moon,
  CloudRain,
  Radio,
  Headphones,
  ShieldCheck,
  Plus,
  Flame,
  Brain,
  Code,
  Compass,
  MessageSquare,
  Trash2,
  UserCheck,
  X,
  MessageCircle,
} from 'lucide-react';

export const StudyRoomView: React.FC = () => {
  const {
    rooms,
    activeRoomId,
    activeRoom,
    selectRoom,
    deleteRoom,
    peers,
    allKnownPeers,
    sendReaction,
    roomMessages,
    friendsList,
    pendingRequestsCount,
    toastMessage,
    clearToast,
    isChatModalOpen,
    openChatModal,
    closeChatModal,
  } = useRoom();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [reportingPeer, setReportingPeer] = useState<StudierPeer | null>(null);

  const getRoomIcon = (icon: string) => {
    switch (icon) {
      case 'BookOpen':
        return <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      case 'Moon':
        return <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      case 'CloudRain':
        return <CloudRain className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      case 'Code':
        return <Code className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      case 'Brain':
        return <Brain className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      case 'Flame':
        return <Flame className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      case 'Compass':
        return <Compass className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
      default:
        return <Radio className="w-3.5 sm:w-4 h-3.5 sm:h-4" />;
    }
  };

  const handleOpenReport = (peerId: string) => {
    const target = allKnownPeers.find((p) => p.id === peerId);
    if (target) setReportingPeer(target);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-16 relative">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl text-xs font-semibold text-slate-100 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-pulse" />
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={clearToast}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner & Room Switcher */}
      <div
        className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-r ${activeRoom.themeGradient} border border-slate-800 shadow-2xl relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <Headphones className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                <Users className="w-3.5 h-3.5" /> {peers.length} Live Studiers
              </span>
              <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-slate-900/60 border border-slate-700 text-slate-300">
                <Sparkles className="w-3 h-3 text-amber-400" /> Vibe: {activeRoom.ambientVibe}
              </span>
              {activeRoom.isCustom && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Custom Room
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                {activeRoom.name}
              </h2>
              {activeRoom.isCustom && (
                <button
                  type="button"
                  onClick={() => deleteRoom(activeRoom.id)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Delete Custom Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">{activeRoom.description}</p>
          </div>

          {/* Room Selector Pills & Actions */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {rooms.map((room) => {
              const isSelected = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => selectRoom(room.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                      : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {getRoomIcon(room.icon)}
                  <span>{room.name}</span>
                </button>
              );
            })}

            {/* Room Chat Launcher Button in Header */}
            <button
              type="button"
              onClick={() => openChatModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white transition-all shadow-sm active:scale-95"
              title="Open Room Chat & Direct Messages"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat ({roomMessages.length})</span>
            </button>

            {/* Friends Modal Button */}
            <button
              type="button"
              onClick={() => setIsFriendsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-purple-300 hover:text-white transition-all shadow-sm relative active:scale-95"
              title="View Study Friends & Requests"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Friends ({friendsList.length})</span>
              {pendingRequestsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Create Room Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-200 transition-all active:scale-95 shadow-sm"
              title="Create a new custom study room"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-300" />
              <span>New Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lo-Fi Music Lounge Player */}
      <LofiAudioPlayer />

      {/* Motivation Reaction Burst Bar */}
      <MotivationBar />

      {/* Main Uncluttered Studier Presence Grid (Spacious Full Width) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Live Co-Studiers (Zero Video • Pure Focus)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Real-time synchronized countdowns down to seconds, active subjects, friend requests, and direct messaging
            </p>
          </div>

          <button
            type="button"
            onClick={() => openChatModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Group Chat</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
              {roomMessages.length}
            </span>
          </button>
        </div>

        {/* Spacious 1 to 4 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {peers.map((peer) => (
            <StudierCard
              key={peer.id}
              peer={peer}
              onCheer={() => sendReaction('🔥', 'Cheered ' + peer.name)}
              onReport={() => setReportingPeer(peer)}
            />
          ))}
        </div>
      </div>

      {/* Shared Focus Pledges Wall */}
      <RoomPledgeBar />

      {/* Floating Collapsed Chat Launcher Pill (Bottom-Right, non-intrusive) */}
      <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-40">
        <button
          type="button"
          onClick={() => openChatModal()}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-2xl shadow-indigo-600/40 border border-indigo-400/40 backdrop-blur-xl transition-all transform hover:scale-105 active:scale-95 group"
          title="Open Study Room Chat & Direct Messages"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4 fill-current text-white" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-ping absolute -top-0.5 -right-0.5" />
          </div>
          <span>Room Chat & DMs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-mono font-semibold">
            {roomMessages.length}
          </span>
        </button>
      </div>

      {/* Modals */}
      <RoomChatModal
        isOpen={isChatModalOpen}
        onClose={closeChatModal}
        onOpenFriends={() => {
          closeChatModal();
          setIsFriendsModalOpen(true);
        }}
        onReportPeer={handleOpenReport}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <FriendsListModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
      />

      <ReportUserModal
        peer={reportingPeer}
        isOpen={!!reportingPeer}
        onClose={() => setReportingPeer(null)}
      />
    </div>
  );
};

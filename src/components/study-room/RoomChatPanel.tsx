import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import {
  MessageSquare,
  Send,
  Sparkles,
  Flame,
  Coffee,
  Brain,
  Users,
  ArrowLeft,
  UserCheck,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';

const QUICK_CHIPS = [
  '🚀 Starting 25m focus sprint',
  '🎯 Goal: Review 20 flashcards',
  '☕ 5 min coffee break',
  '🔥 Locked in! Let’s go!',
];

const EMOJI_REACTIONS = ['🔥', '👏', '🧠', '☕', '✨'];

interface RoomChatPanelProps {
  onOpenFriends?: () => void;
  onReportPeer?: (peerId: string) => void;
}

export const RoomChatPanel: React.FC<RoomChatPanelProps> = ({
  onOpenFriends,
  onReportPeer,
}) => {
  const {
    activeRoom,
    roomMessages,
    sendMessage,
    reactToMessage,
    peers,
    allKnownPeers,
    activeDirectPeerId,
    closeDirectChat,
    openDirectChat,
    directMessages,
    sendDirectMessage,
    friendships,
    pendingRequestsCount,
  } = useRoom();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isDirectChat = !!activeDirectPeerId;
  const directFriend = isDirectChat
    ? allKnownPeers.find((p) => p.id === activeDirectPeerId)
    : null;
  const currentDirectMessages = isDirectChat && activeDirectPeerId
    ? directMessages[activeDirectPeerId] || []
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages.length, currentDirectMessages.length, isDirectChat]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isDirectChat && activeDirectPeerId) {
      sendDirectMessage(activeDirectPeerId, inputText);
    } else {
      sendMessage(inputText);
    }
    setInputText('');
  };

  const handleChipClick = (text: string) => {
    if (isDirectChat && activeDirectPeerId) {
      sendDirectMessage(activeDirectPeerId, text);
    } else {
      sendMessage(text);
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[560px] shadow-2xl overflow-hidden">
      {/* Header: Room Chat vs Direct Message Mode */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between flex-shrink-0">
        {isDirectChat && directFriend ? (
          /* Direct Chat Header */
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={closeDirectChat}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Back to Room Chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <img
                src={directFriend.avatar}
                alt={directFriend.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {directFriend.name}
                </h4>
                <span className="text-xs">{directFriend.countryFlag}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Direct DM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {directFriend.subjectName} • {directFriend.status}
              </p>
            </div>
          </div>
        ) : (
          /* Room Group Chat Header */
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {activeRoom.name}
                </h4>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {peers.length} Live Studiers • Synchronized chat
              </p>
            </div>
          </div>
        )}

        {/* Right Header Action: Friends Shortcut */}
        <div className="flex items-center gap-1.5">
          {onOpenFriends && (
            <button
              type="button"
              onClick={onOpenFriends}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all relative"
              title="Open Friends & Direct Messages"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Friends</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[9px] font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {isDirectChat ? (
          /* 1-on-1 Direct Messages View */
          currentDirectMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40 text-purple-400" />
              <p className="text-xs font-semibold text-slate-300">
                Direct Message with {directFriend?.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Send a message to start collaborating or share study tips!
              </p>
            </div>
          ) : (
            currentDirectMessages.map((msg) => {
              const isLocal = msg.isLocalUser || msg.senderId === 'local_user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 animate-fade-in ${
                    isLocal ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-xl object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                  />
                  <div className={`max-w-[80%] space-y-1 ${isLocal ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-1.5 text-[10px] ${isLocal ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-semibold text-slate-300">{msg.senderName}</span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl text-xs leading-relaxed ${
                        isLocal
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 rounded-tr-sm'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Room Group Chat Messages View */
          roomMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40 text-indigo-400" />
              <p className="text-xs">No messages yet in this room.</p>
              <p className="text-[11px] text-slate-500">Say hello or share your study pledge below!</p>
            </div>
          ) : (
            roomMessages.map((msg) => {
              const isLocal = msg.isLocalUser || msg.senderId === 'local_user';
              const isSystem = msg.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2 animate-fade-in">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>{msg.content}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 animate-fade-in ${
                    isLocal ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-xl object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                  />

                  <div className={`max-w-[80%] sm:max-w-[75%] space-y-1 ${isLocal ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name & Meta */}
                    <div className={`flex items-center gap-1.5 text-[10px] ${isLocal ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-semibold text-slate-300">
                        {msg.senderName} {msg.senderCountryFlag}
                      </span>
                      {msg.senderSubject && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 truncate max-w-[100px]">
                          {msg.senderSubject}
                        </span>
                      )}
                      <span className="text-slate-500">{msg.timestamp}</span>

                      {/* Clickable Action to DM or Report */}
                      {!isLocal && msg.senderId && (
                        <div className="flex items-center gap-1 ml-1 opacity-60 hover:opacity-100 transition-opacity">
                          {friendships[msg.senderId] === 'friends' ? (
                            <button
                              type="button"
                              onClick={() => openDirectChat(msg.senderId)}
                              className="text-purple-400 hover:text-purple-300"
                              title={`DM ${msg.senderName}`}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          ) : null}
                          {onReportPeer && (
                            <button
                              type="button"
                              onClick={() => onReportPeer(msg.senderId)}
                              className="text-slate-500 hover:text-red-400"
                              title="Report User"
                            >
                              <ShieldAlert className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl text-xs leading-relaxed ${
                        isLocal
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-sm'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Message Reaction Chips */}
                    <div className={`flex items-center gap-1 flex-wrap pt-0.5 ${isLocal ? 'justify-end' : 'justify-start'}`}>
                      {msg.reactions &&
                        Object.entries(msg.reactions).map(([emoji, count]) => {
                          if (count <= 0) return null;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => reactToMessage(msg.id, emoji)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 transition-colors"
                            >
                              <span>{emoji}</span>
                              <span className="font-bold">{count}</span>
                            </button>
                          );
                        })}

                      {/* Quick Reaction Emojis */}
                      <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                        {EMOJI_REACTIONS.slice(0, 3).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => reactToMessage(msg.id, emoji)}
                            className="p-1 hover:bg-slate-800 rounded-md text-[10px] transition-colors"
                            title={`React ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pledge Chips */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0 pl-1">
          Quick:
        </span>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-indigo-200 transition-all flex-shrink-0 whitespace-nowrap active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800/90 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder={
            isDirectChat
              ? `Message ${directFriend?.name || 'friend'} directly...`
              : 'Type a message in the room or share your focus pledge...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex-shrink-0"
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

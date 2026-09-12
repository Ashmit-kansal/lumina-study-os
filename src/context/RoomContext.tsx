import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  StudyRoom,
  StudierPeer,
  MotivationReaction,
  Subject,
  RoomChatMessage,
  FriendshipStatus,
  DirectMessage,
  UserReport,
} from '../types';
import { SEED_STUDY_ROOMS, SEED_ROOM_CHAT_MESSAGES } from '../utils/seedData';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { useTimer } from './TimerContext';

interface StudyPledge {
  id: string;
  authorName: string;
  text: string;
  timestamp: string;
  cheersCount: number;
}

export interface CreateRoomInput {
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  themeGradient: string;
  ambientVibe: string;
}

interface RoomContextType {
  rooms: StudyRoom[];
  activeRoomId: string;
  activeRoom: StudyRoom;
  selectRoom: (id: string) => void;
  createRoom: (input: CreateRoomInput) => StudyRoom;
  deleteRoom: (id: string) => void;
  peers: StudierPeer[];
  allKnownPeers: StudierPeer[];
  reactions: MotivationReaction[];
  sendReaction: (emoji: string, label: string) => void;
  pledges: StudyPledge[];
  addPledge: (text: string) => void;
  cheerPledge: (id: string) => void;
  roomMessages: RoomChatMessage[];
  sendMessage: (content: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  // Friendship System
  friendships: Record<string, FriendshipStatus>;
  getFriendshipStatus: (peerId: string) => FriendshipStatus;
  sendFriendRequest: (peerId: string) => void;
  acceptFriendRequest: (peerId: string) => void;
  declineFriendRequest: (peerId: string) => void;
  removeFriend: (peerId: string) => void;
  pendingRequestsCount: number;
  friendsList: StudierPeer[];
  // Direct Messaging & Chat Modal System
  directMessages: Record<string, DirectMessage[]>;
  activeDirectPeerId: string | null;
  openDirectChat: (peerId: string) => void;
  closeDirectChat: () => void;
  sendDirectMessage: (friendId: string, content: string) => void;
  isChatModalOpen: boolean;
  openChatModal: (peerId?: string) => void;
  closeChatModal: () => void;
  // Reporting & Moderation
  reportedPeers: Record<string, UserReport>;
  reportUser: (report: { targetPeerId: string; targetPeerName: string; reason: string; details?: string; blockUser?: boolean }) => void;
  isPeerBlocked: (peerId: string) => boolean;
  toastMessage: string | null;
  clearToast: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

const ROOMS_STORAGE_KEY = 'lumina_study_rooms_v2';
const CHAT_STORAGE_KEY = 'lumina_room_chat_v2';
const FRIENDS_STORAGE_KEY = 'lumina_friends_v2';
const DM_STORAGE_KEY = 'lumina_direct_messages_v2';
const REPORTS_STORAGE_KEY = 'lumina_user_reports_v2';

const INITIAL_FRIENDSHIPS: Record<string, FriendshipStatus> = {
  peer_1: 'friends', // Elena Rostova is already your study friend!
  peer_3: 'pending_received', // Sophia Patel sent you a friend request
};

const INITIAL_DIRECT_MESSAGES: Record<string, DirectMessage[]> = {
  peer_1: [
    {
      id: 'dm_1',
      friendId: 'peer_1',
      senderId: 'peer_1',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'Hey! How is your Distributed Systems studying going? 🚀',
      timestamp: '10:05 AM',
    },
    {
      id: 'dm_2',
      friendId: 'peer_1',
      senderId: 'peer_1',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'Let me know if you want to test each other with SM-2 flashcards later today!',
      timestamp: '10:06 AM',
    },
  ],
};

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subjects, studyStreakDays } = useApp();
  const { mode, isRunning, timeRemaining, activeSubjectId } = useTimer();

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const clearToast = useCallback(() => setToastMessage(null), []);

  // Load custom rooms or seed rooms
  const [rooms, setRooms] = useState<StudyRoom[]>(() => {
    try {
      const saved = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_STUDY_ROOMS;
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    return rooms[0]?.id || SEED_STUDY_ROOMS[0].id;
  });

  // Track real-time live ticking seconds for peers in each room
  const [roomPeers, setRoomPeers] = useState<Record<string, StudierPeer[]>>(() => {
    const initial: Record<string, StudierPeer[]> = {};
    rooms.forEach((r: StudyRoom) => {
      initial[r.id] = r.peers.map((p) => ({
        ...p,
        sessionTimeLeftSeconds: p.sessionTimeLeftSeconds || p.sessionTimeLeftMinutes * 60,
        totalSessionSeconds: p.totalSessionSeconds || (p.status === 'focusing' ? 25 * 60 : 5 * 60),
      }));
    });
    return initial;
  });

  // Friendships state
  const [friendships, setFriendships] = useState<Record<string, FriendshipStatus>>(() => {
    try {
      const saved = localStorage.getItem(FRIENDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return INITIAL_FRIENDSHIPS;
  });

  // Direct messages state
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(DM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return INITIAL_DIRECT_MESSAGES;
  });

  // Active Direct Chat with peer & Chat Modal state
  const [activeDirectPeerId, setActiveDirectPeerId] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const openChatModal = useCallback((peerId?: string) => {
    if (peerId) {
      setActiveDirectPeerId(peerId);
    }
    setIsChatModalOpen(true);
  }, []);

  const closeChatModal = useCallback(() => {
    setIsChatModalOpen(false);
  }, []);

  // Direct Messaging
  const openDirectChat = useCallback((peerId: string) => {
    setActiveDirectPeerId(peerId);
    setIsChatModalOpen(true);
  }, []);

  const closeDirectChat = useCallback(() => {
    setActiveDirectPeerId(null);
  }, []);

  // User Reports state
  const [reportedPeers, setReportedPeers] = useState<Record<string, UserReport>>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  // Chat messages per room
  const [chatMessages, setChatMessages] = useState<Record<string, RoomChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return SEED_ROOM_CHAT_MESSAGES;
  });

  const [reactions, setReactions] = useState<MotivationReaction[]>([]);
  const [pledges, setPledges] = useState<StudyPledge[]>([
    {
      id: 'pl_1',
      authorName: 'Elena Rostova',
      text: 'Completing Raft consensus flashcards & 2 pomodoros! ⚡',
      timestamp: '10m ago',
      cheersCount: 8,
    },
    {
      id: 'pl_2',
      authorName: 'Kenji Takahashi',
      text: 'Fine-tuning LLaMA 3 weights & reviewing 20 SM-2 cards',
      timestamp: '25m ago',
      cheersCount: 14,
    },
  ]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friendships));
    } catch {}
  }, [friendships]);

  useEffect(() => {
    try {
      localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(directMessages));
    } catch {}
  }, [directMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reportedPeers));
    } catch {}
  }, [reportedPeers]);

  const activeRoom = useMemo(() => {
    return rooms.find((r: StudyRoom) => r.id === activeRoomId) || rooms[0] || SEED_STUDY_ROOMS[0];
  }, [rooms, activeRoomId]);

  // Real-time ticking engine: Decrements peer seconds countdown every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setRoomPeers((prev) => {
        const updated: Record<string, StudierPeer[]> = {};

        Object.entries(prev).forEach(([roomId, peerList]) => {
          updated[roomId] = peerList.map((p) => {
            let nextSeconds = (p.sessionTimeLeftSeconds ?? p.sessionTimeLeftMinutes * 60) - 1;
            let nextStatus = p.status;
            let totalSeconds = p.totalSessionSeconds || (p.status === 'focusing' ? 25 * 60 : 5 * 60);

            if (nextSeconds <= 0) {
              if (p.status === 'focusing') {
                nextStatus = 'break';
                nextSeconds = 5 * 60; // 5 min break
                totalSeconds = 5 * 60;
              } else {
                nextStatus = 'focusing';
                nextSeconds = 25 * 60; // 25 min focus
                totalSeconds = 25 * 60;
              }
            }

            return {
              ...p,
              sessionTimeLeftSeconds: nextSeconds,
              sessionTimeLeftMinutes: Math.max(1, Math.ceil(nextSeconds / 60)),
              totalSessionSeconds: totalSeconds,
              status: nextStatus,
            };
          });
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Periodic friendly peer message simulation
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const peersInActiveRoom = roomPeers[activeRoomId] || activeRoom.peers || [];
      const unblockedPeers = peersInActiveRoom.filter((p) => !reportedPeers[p.id]);
      if (unblockedPeers.length === 0) return;

      const randomPeer = unblockedPeers[Math.floor(Math.random() * unblockedPeers.length)];
      const sampleMessages = [
        'Halfway through my focus block! Keeping the momentum going. 🔥',
        'Just reviewed 15 flashcards with SM-2. Memory retention feels solid! 🧠',
        'Locking in for another 25m. Zero distractions! ⚡',
        'Taking a quick sip of water. Stay hydrated everyone! ☕',
        'Great work everyone in this room, let’s crush our study goals today! ✨',
      ];
      const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newPeerMessage: RoomChatMessage = {
        id: 'peer_msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        roomId: activeRoomId,
        senderId: randomPeer.id,
        senderName: randomPeer.name,
        senderAvatar: randomPeer.avatar,
        senderCountryFlag: randomPeer.countryFlag,
        senderSubject: randomPeer.subjectName,
        content: randomMsg,
        timestamp: timeStr,
        reactions: {},
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] || []), newPeerMessage],
      }));
    }, 45000);

    return () => clearInterval(chatInterval);
  }, [activeRoomId, roomPeers, activeRoom, reportedPeers]);

  // Aggregate list of all known peers across all rooms
  const allKnownPeers = useMemo(() => {
    const map = new Map<string, StudierPeer>();
    Object.values(roomPeers).forEach((peerList) => {
      peerList.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
    });
    return Array.from(map.values());
  }, [roomPeers]);

  // Local user peer synchronized with timer
  const activeSubject = subjects.find((s: Subject) => s.id === activeSubjectId);
  const currentPeers = (roomPeers[activeRoomId] || activeRoom.peers || []).filter(
    (p) => !reportedPeers[p.id]
  );

  const localUserPeer: StudierPeer = {
    id: 'peer_local_user',
    name: user?.name || 'You',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    country: user?.country || 'Global',
    countryFlag: user?.countryFlag || '⚡',
    subjectName: activeSubject?.name || 'General Focus',
    subjectColor: '#6366f1',
    status: mode === 'focus' ? 'focusing' : 'break',
    sessionTimeLeftSeconds: timeRemaining,
    sessionTimeLeftMinutes: Math.max(1, Math.ceil(timeRemaining / 60)),
    totalSessionSeconds: mode === 'focus' ? 25 * 60 : 5 * 60,
    todayMinutes: 95 + (isRunning ? Math.round((25 * 60 - timeRemaining) / 60) : 0),
    streakDays: studyStreakDays,
    quote: isRunning ? 'In deep focus session right now...' : 'Ready to start next Pomodoro cycle!',
    isLocalUser: true,
  };

  const peersWithLocalUser = [localUserPeer, ...currentPeers];

  // Room Selection
  const selectRoom = useCallback((id: string) => {
    setActiveRoomId(id);
  }, []);

  // Create Room
  const createRoom = useCallback((input: CreateRoomInput): StudyRoom => {
    const newRoomId = 'room_custom_' + Date.now();
    const starterPeers: StudierPeer[] = [
      {
        id: 'peer_custom_1_' + Date.now(),
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        country: 'Canada',
        countryFlag: '🇨🇦',
        subjectName: input.name,
        subjectColor: '#6366f1',
        status: 'focusing',
        sessionTimeLeftMinutes: 24,
        sessionTimeLeftSeconds: 24 * 60 - 15,
        totalSessionSeconds: 25 * 60,
        todayMinutes: 180,
        streakDays: 14,
        quote: `Welcome to ${input.name}! Let's stay locked in. 🚀`,
      },
      {
        id: 'peer_custom_2_' + Date.now(),
        name: 'Mei Lin',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        country: 'Singapore',
        countryFlag: '🇸🇬',
        subjectName: 'Deep Work Sprint',
        subjectColor: '#10b981',
        status: 'focusing',
        sessionTimeLeftMinutes: 18,
        sessionTimeLeftSeconds: 18 * 60 - 30,
        totalSessionSeconds: 25 * 60,
        todayMinutes: 220,
        streakDays: 28,
        quote: 'Working on core concept mastery ⚡',
      },
    ];

    const newRoom: StudyRoom = {
      id: newRoomId,
      name: input.name.trim(),
      subtitle: input.subtitle.trim() || 'Custom Collaborative Study Lounge',
      description: input.description.trim() || 'Focus community room created for deep work and accountability.',
      icon: input.icon || 'Sparkles',
      themeGradient: input.themeGradient || 'from-slate-900 via-indigo-950/40 to-slate-900',
      activeCount: 3,
      ambientVibe: input.ambientVibe || 'Chill Lo-Fi & Deep Focus',
      peers: starterPeers,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    setRooms((prev) => [newRoom, ...prev]);
    setRoomPeers((prev) => ({ ...prev, [newRoomId]: starterPeers }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const welcomeMessage: RoomChatMessage = {
      id: 'msg_welcome_' + Date.now(),
      roomId: newRoomId,
      senderId: 'system',
      senderName: 'Lumina Bot',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🤖',
      senderSubject: 'Room Announcement',
      content: `🎉 Welcome to ${newRoom.name}! Share your study pledges and stay focused with peers.`,
      timestamp: timeStr,
      reactions: { '🔥': 1, '✨': 1 },
    };

    setChatMessages((prev) => ({
      ...prev,
      [newRoomId]: [welcomeMessage],
    }));

    setActiveRoomId(newRoomId);
    showToast(`Study Room "${newRoom.name}" created!`);
    return newRoom;
  }, [showToast]);

  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (filtered.length === 0) return SEED_STUDY_ROOMS;
      return filtered;
    });
    setActiveRoomId((prevId) => (prevId === id ? SEED_STUDY_ROOMS[0].id : prevId));
    showToast('Room removed');
  }, [showToast]);

  // Friend Request System
  const getFriendshipStatus = useCallback((peerId: string): FriendshipStatus => {
    return friendships[peerId] || 'none';
  }, [friendships]);

  const sendFriendRequest = useCallback((peerId: string) => {
    const target = allKnownPeers.find((p) => p.id === peerId);
    setFriendships((prev) => ({ ...prev, [peerId]: 'pending_sent' }));
    showToast(`Friend request sent to ${target?.name || 'studier'}! ✨`);

    // Simulate peer accepting friend request after 3.5 seconds
    setTimeout(() => {
      setFriendships((prev) => {
        if (prev[peerId] === 'pending_sent') {
          showToast(`${target?.name || 'Studier'} accepted your friend request! 💬`);
          return { ...prev, [peerId]: 'friends' };
        }
        return prev;
      });
    }, 3500);
  }, [allKnownPeers, showToast]);

  const acceptFriendRequest = useCallback((peerId: string) => {
    const target = allKnownPeers.find((p) => p.id === peerId);
    setFriendships((prev) => ({ ...prev, [peerId]: 'friends' }));
    showToast(`You and ${target?.name || 'studier'} are now study friends! 🎉`);
  }, [allKnownPeers, showToast]);

  const declineFriendRequest = useCallback((peerId: string) => {
    setFriendships((prev) => ({ ...prev, [peerId]: 'none' }));
    showToast('Friend request declined');
  }, [showToast]);

  const removeFriend = useCallback((peerId: string) => {
    setFriendships((prev) => ({ ...prev, [peerId]: 'none' }));
    showToast('Friend removed');
  }, [showToast]);

  const pendingRequestsCount = useMemo(() => {
    return Object.values(friendships).filter((s) => s === 'pending_received').length;
  }, [friendships]);

  const friendsList = useMemo(() => {
    return allKnownPeers.filter((p) => friendships[p.id] === 'friends');
  }, [allKnownPeers, friendships]);

  const sendDirectMessage = useCallback((friendId: string, content: string) => {
    if (!content.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: DirectMessage = {
      id: 'dm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      friendId,
      senderId: 'local_user',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      content: content.trim(),
      timestamp: timeStr,
      isLocalUser: true,
    };

    setDirectMessages((prev) => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMsg],
    }));

    // Simulate automated direct reply from the friend after 2.5s
    const targetPeer = allKnownPeers.find((p) => p.id === friendId);
    if (targetPeer) {
      setTimeout(() => {
        const replies = [
          'Nice! Keep up the great focus block! 🚀',
          'Thanks for the message! Let’s crush this session. ⚡',
          'Good luck on your revision! Let’s talk after this pomodoro. ☕',
          'Got it! Staying locked in right now. 🔥',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const peerReplyMsg: DirectMessage = {
          id: 'dm_reply_' + Date.now(),
          friendId,
          senderId: targetPeer.id,
          senderName: targetPeer.name,
          senderAvatar: targetPeer.avatar,
          content: randomReply,
          timestamp: replyTime,
        };

        setDirectMessages((prev) => ({
          ...prev,
          [friendId]: [...(prev[friendId] || []), peerReplyMsg],
        }));
      }, 2500);
    }
  }, [allKnownPeers, user]);

  // Reporting System
  const reportUser = useCallback((reportData: { targetPeerId: string; targetPeerName: string; reason: string; details?: string; blockUser?: boolean }) => {
    const reportId = 'report_' + Date.now();
    const newReport: UserReport = {
      id: reportId,
      targetPeerId: reportData.targetPeerId,
      targetPeerName: reportData.targetPeerName,
      reason: reportData.reason,
      details: reportData.details,
      timestamp: new Date().toISOString(),
      status: 'pending_review',
    };

    setReportedPeers((prev) => ({ ...prev, [reportData.targetPeerId]: newReport }));

    // Filter out messages from reported peer in room chat
    setChatMessages((prev) => {
      const updated: Record<string, RoomChatMessage[]> = {};
      Object.entries(prev).forEach(([rId, msgs]) => {
        updated[rId] = msgs.filter((m) => m.senderId !== reportData.targetPeerId);
      });
      return updated;
    });

    showToast(`User ${reportData.targetPeerName} reported & muted for your session. 🛡️`);
  }, [showToast]);

  const isPeerBlocked = useCallback((peerId: string) => {
    return !!reportedPeers[peerId];
  }, [reportedPeers]);

  // Room Group Chatting
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const activeSub = subjects.find((s) => s.id === activeSubjectId);

    const newMessage: RoomChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      roomId: activeRoomId,
      senderId: 'local_user',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: user?.countryFlag || '⚡',
      senderSubject: activeSub?.name || 'Focus Session',
      content: content.trim(),
      timestamp: timeStr,
      isLocalUser: true,
      reactions: {},
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));
  }, [activeRoomId, subjects, activeSubjectId, user]);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    setChatMessages((prev) => {
      const roomMsgs = prev[activeRoomId] || [];
      const updated = roomMsgs.map((msg) => {
        if (msg.id === messageId) {
          const currentCount = msg.reactions?.[emoji] || 0;
          return {
            ...msg,
            reactions: {
              ...(msg.reactions || {}),
              [emoji]: currentCount + 1,
            },
          };
        }
        return msg;
      });
      return {
        ...prev,
        [activeRoomId]: updated,
      };
    });
  }, [activeRoomId]);

  const sendReaction = useCallback((emoji: string, label: string) => {
    const reaction: MotivationReaction = {
      id: 'react_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      fromName: 'You',
      emoji,
      label,
      timestamp: Date.now(),
    };
    setReactions((prev) => [reaction, ...prev.slice(0, 15)]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 4000);
  }, []);

  const addPledge = useCallback((text: string) => {
    if (!text.trim()) return;
    const newPledge: StudyPledge = {
      id: 'pl_' + Date.now(),
      authorName: 'You',
      text: text.trim(),
      timestamp: 'Just now',
      cheersCount: 1,
    };
    setPledges((prev) => [newPledge, ...prev]);
  }, []);

  const cheerPledge = useCallback((id: string) => {
    setPledges((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cheersCount: p.cheersCount + 1 } : p))
    );
  }, []);

  // Filter messages to hide reported peers
  const roomMessages = (chatMessages[activeRoomId] || []).filter(
    (m) => !reportedPeers[m.senderId]
  );

  const value = useMemo(
    () => ({
      rooms,
      activeRoomId,
      activeRoom,
      selectRoom,
      createRoom,
      deleteRoom,
      peers: peersWithLocalUser,
      allKnownPeers,
      reactions,
      sendReaction,
      pledges,
      addPledge,
      cheerPledge,
      roomMessages,
      sendMessage,
      reactToMessage,
      // Friendship
      friendships,
      getFriendshipStatus,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      pendingRequestsCount,
      friendsList,
      // Direct Messages & Chat Modal
      directMessages,
      activeDirectPeerId,
      openDirectChat,
      closeDirectChat,
      sendDirectMessage,
      isChatModalOpen,
      openChatModal,
      closeChatModal,
      // Reporting
      reportedPeers,
      reportUser,
      isPeerBlocked,
      toastMessage,
      clearToast,
    }),
    [
      rooms,
      activeRoomId,
      activeRoom,
      selectRoom,
      createRoom,
      deleteRoom,
      peersWithLocalUser,
      allKnownPeers,
      reactions,
      sendReaction,
      pledges,
      addPledge,
      cheerPledge,
      roomMessages,
      sendMessage,
      reactToMessage,
      friendships,
      getFriendshipStatus,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      pendingRequestsCount,
      friendsList,
      directMessages,
      activeDirectPeerId,
      openDirectChat,
      closeDirectChat,
      sendDirectMessage,
      isChatModalOpen,
      openChatModal,
      closeChatModal,
      reportedPeers,
      reportUser,
      isPeerBlocked,
      toastMessage,
      clearToast,
    ]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

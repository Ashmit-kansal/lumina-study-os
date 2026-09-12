export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex code
  icon: string;  // Lucide icon name or emoji
  targetHoursPerWeek: number;
  totalSecondsStudied: number;
  description?: string;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  completedAt: string;
  mode: PomodoroMode;
  notes?: string;
}

export interface StudierPeer {
  id: string;
  name: string;
  avatar: string;
  country: string;
  countryFlag: string;
  subjectName: string;
  subjectColor: string;
  status: 'focusing' | 'break';
  sessionTimeLeftMinutes: number;
  sessionTimeLeftSeconds: number; // Ticks down every 1 second (e.g. 1420s -> 23:40)
  totalSessionSeconds?: number;
  todayMinutes: number;
  streakDays: number;
  quote: string;
  isLocalUser?: boolean;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface FriendRelation {
  peerId: string;
  status: FriendshipStatus;
  friendSince?: string;
}

export interface DirectMessage {
  id: string;
  friendId: string; // the other peer's ID
  senderId: string; // 'local_user' or peerId
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string; // "10:45 PM"
  isLocalUser?: boolean;
}

export interface UserReport {
  id: string;
  targetPeerId: string;
  targetPeerName: string;
  reason: string;
  details?: string;
  timestamp: string;
  status: 'pending_review' | 'resolved';
}

export interface RoomChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCountryFlag?: string;
  senderSubject?: string;
  content: string;
  timestamp: string; // e.g. "10:42 PM"
  isLocalUser?: boolean;
  reactions?: Record<string, number>; // emoji -> count
}

export interface StudyRoom {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  themeGradient: string;
  activeCount: number;
  ambientVibe: string;
  peers: StudierPeer[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface MotivationReaction {
  id: string;
  fromName: string;
  emoji: string;
  label: string;
  timestamp: number;
}

export type AudioCategory = 'lofi' | 'ambient' | 'nature' | 'binaural';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  category: AudioCategory;
  url: string;
  duration?: string;
  isSynthetic?: boolean;
}

export interface AmbientLayer {
  id: string;
  name: string;
  icon: string;
  type: 'rain' | 'cafe' | 'binaural' | 'whitenoise' | 'forest';
  volume: number; // 0 to 100
  isEnabled: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  parentId?: string | null;
  subjectId?: string; // Links folder to a study subject
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  url: string;
  storageType: 'r2' | 'indexeddb';
  uploadedAt: string;
  noteId?: string;
  subjectId?: string;
  folderId?: string;
  fileContent?: string;
  pageCount?: number;
}

export interface Flashcard {
  id: string;
  noteId: string;
  noteTitle: string;
  subjectId: string;
  subjectName: string;
  front: string;
  back: string;
  hint?: string;
  repetitions: number;
  easeFactor: number; // starts at 2.5
  intervalDays: number; // in days
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  lastReviewedAt?: string;
  status: 'new' | 'learning' | 'mastered';
}

export interface NoteDocument {
  id: string;
  title: string;
  folderId?: string;
  subjectId?: string;
  content: string; // Markdown / bullet hierarchical content
  tags: string[];
  createdAt: string;
  updatedAt: string;
  attachments: FileAttachment[];
  flashcardIds: string[];
}

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  enabled: boolean;
  maxStorageBytes: number; // Default 500MB = 500 * 1024 * 1024
}

export interface EmailReminderConfig {
  email: string;
  enabled: boolean;
  scheduledTime: string; // e.g. "09:00"
  digestFrequency: 'daily' | 'weekly' | 'when_due';
  minDueCards: number;
  includeStudyStats: boolean;
  lastSentTimestamp?: string;
}

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // every X focus sessions
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundVolume: number;
  tickingSound: boolean;
  notificationSound: string;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  subjectMinutes: Record<string, number>;
  completedSessions: number;
  cardsReviewed: number;
}

export type RevisionTargetType = 'file' | 'folder';
export type RevisionStatus = 'due' | 'scheduled' | 'revising' | 'completed';

export interface RevisionScheduleItem {
  id: string;
  targetType: RevisionTargetType;
  targetId: string; // noteId or folderId
  title: string;
  subjectId: string;
  subjectName: string;
  folderName?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // e.g. "09:00 AM"
  intervalDays: number; // in days (e.g. 1, 3, 7, 14, 30)
  revisionCount: number;
  lastRevisedAt?: string;
  lastQuizScore?: number; // e.g. 80 (%)
  emailReminder: boolean;
  userEmail?: string;
  status: RevisionStatus;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  countryFlag?: string;
  bio?: string;
  createdAt: string;
}

export interface UserAccount extends UserProfile {
  passwordHash: string; // Stored simulated password/hash
}

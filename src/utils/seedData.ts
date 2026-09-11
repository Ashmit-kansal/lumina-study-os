import { Subject, Folder, NoteDocument, Flashcard, FileAttachment, StudyRoom, RoomChatMessage, AudioTrack, AmbientLayer, TimerSettings, R2StorageConfig, EmailReminderConfig, DailyStudyLog, RevisionScheduleItem } from '../types';

export const SEED_SUBJECTS: Subject[] = [
  {
    id: 'sub_1',
    name: 'Distributed Systems',
    color: 'from-blue-500 to-indigo-600',
    icon: 'Network',
    targetHoursPerWeek: 12,
    totalSecondsStudied: 14200, // ~3.9h
    description: 'Consensus algorithms, Raft, Paxos, event-driven architectures & CAP theorem',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'sub_2',
    name: 'Machine Learning & AI',
    color: 'from-purple-500 to-pink-600',
    icon: 'Brain',
    targetHoursPerWeek: 15,
    totalSecondsStudied: 22400, // ~6.2h
    description: 'Transformers, attention mechanisms, backpropagation, and latent diffusion',
    createdAt: '2026-08-02T11:00:00Z',
  },
  {
    id: 'sub_3',
    name: 'Algorithms & Data Structures',
    color: 'from-emerald-500 to-teal-600',
    icon: 'Code2',
    targetHoursPerWeek: 10,
    totalSecondsStudied: 18900, // ~5.25h
    description: 'Graph algorithms, dynamic programming, segment trees, and Big-O trade-offs',
    createdAt: '2026-08-03T12:00:00Z',
  },
  {
    id: 'sub_4',
    name: 'System Design & Architecture',
    color: 'from-amber-500 to-orange-600',
    icon: 'Cpu',
    targetHoursPerWeek: 8,
    totalSecondsStudied: 10800, // ~3h
    description: 'Database sharding, caching strategies, rate limiting, and microservices',
    createdAt: '2026-08-05T09:00:00Z',
  },
];

export const SEED_FOLDERS: Folder[] = [
  {
    id: 'f_cs',
    name: 'Computer Science Core',
    color: 'text-indigo-400',
    subjectId: 'sub_3',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'f_dist',
    name: 'Distributed Architectures',
    color: 'text-blue-400',
    subjectId: 'sub_1',
    createdAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'f_ai',
    name: 'Deep Learning & LLMs',
    color: 'text-purple-400',
    subjectId: 'sub_2',
    createdAt: '2026-08-03T10:00:00Z',
  },
];

export const SEED_FILES: FileAttachment[] = [
  {
    id: 'file_pdf_1',
    name: 'Distributed_Systems_Lecture_01_Overview.pdf',
    sizeBytes: 2450000,
    mimeType: 'application/pdf',
    url: '',
    storageType: 'indexeddb',
    uploadedAt: '2026-08-20T14:30:00Z',
    subjectId: 'sub_1',
    folderId: 'f_dist',
    pageCount: 14,
    fileContent: `Lecture 1: Introduction to Distributed Systems Architecture
Topic: Quorum Consensus & Network Partitions
Instructor: Dr. Leslie Lamport
Key Takeaways:
1. CAP Theorem trade-offs in modern cloud data stores.
2. Clock synchronization with Lamport timestamps and Vector clocks.
3. State machine replication (SMR) invariants across asynchronous networks.`,
  },
  {
    id: 'file_docx_1',
    name: 'Deep_Learning_Transformers_Guide.docx',
    sizeBytes: 1150000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '',
    storageType: 'indexeddb',
    uploadedAt: '2026-08-22T10:15:00Z',
    subjectId: 'sub_2',
    folderId: 'f_ai',
    pageCount: 8,
    fileContent: `Microsoft Word Document: Comprehensive Guide to Attention Mechanisms
Author: AI Research Lab
Summary:
- Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
- Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.
- Positional Encoding formulas: PE(pos, 2i) = sin(pos/10000^(2i/d_model))`,
  },
  {
    id: 'file_img_1',
    name: 'CAP_Theorem_Architecture_Diagram.png',
    sizeBytes: 680000,
    mimeType: 'image/png',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    storageType: 'indexeddb',
    uploadedAt: '2026-08-24T09:00:00Z',
    subjectId: 'sub_1',
    folderId: 'f_dist',
  },
];


export const SEED_NOTES: NoteDocument[] = [
  {
    id: 'note_1',
    title: 'CAP Theorem & Distributed Consensus',
    folderId: 'f_dist',
    subjectId: 'sub_1',
    content: `# CAP Theorem & Consensus Essentials

- **Overview**: In any distributed data store, it is impossible to simultaneously provide more than two out of three guarantees.

- **The 3 Properties**:
  - Consistency :: Every read receives the most recent write or an error.
  - Availability :: Every non-failing node returns a non-error response for every request without guarantee it contains the most recent write.
  - Partition Tolerance :: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

- **PACELC Theorem Expansion**:
  - If there is a Partition (P), how does system trade off Availability (A) and Consistency (C)?
  - Else (E), when system is running normally without partitions, how does it trade off Latency (L) and Consistency (C)?
  - PACELC Definition :: Extension to CAP theorem stating that even in absence of partitions, a distributed system must choose between Latency (L) and Consistency (C).

- **Raft Consensus Basics**:
  - What are the 3 states of a Raft node? :: Leader, Follower, and Candidate.
  - What mechanism does Raft use to detect leader failure? :: Randomized Heartbeat and Election Timeouts (typically 150ms-300ms).
`,
    tags: ['distributed-systems', 'consensus', 'raft', 'cap-theorem'],
    createdAt: '2026-08-10T14:30:00Z',
    updatedAt: '2026-08-28T16:00:00Z',
    attachments: [],
    flashcardIds: ['card_1', 'card_2', 'card_3', 'card_4', 'card_5'],
  },
  {
    id: 'note_2',
    title: 'Transformer Architecture & Self-Attention',
    folderId: 'f_ai',
    subjectId: 'sub_2',
    content: `# Transformer Networks & Scaled Dot-Product Attention

- **Core Formula**:
  - Attention Formula :: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
  - Why is the dot product scaled by sqrt(d_k)? :: To prevent the dot products from growing excessively large for large dimensions, which would push the softmax into regions with extremely small gradients.

- **Multi-Head Attention**:
  - Purpose of Multi-Head Attention :: Allows the model to jointly attend to information from different representation subspaces at different positions.
  - Layer Normalization :: Applied before (Pre-LN) or after (Post-LN) sub-layers to stabilize deep neural network training.
`,
    tags: ['machine-learning', 'transformers', 'attention', 'nlp'],
    createdAt: '2026-08-12T09:15:00Z',
    updatedAt: '2026-08-27T18:20:00Z',
    attachments: [],
    flashcardIds: ['card_6', 'card_7', 'card_8'],
  },
  {
    id: 'note_3',
    title: 'Graph Algorithms & Shortest Path',
    folderId: 'f_cs',
    subjectId: 'sub_3',
    content: `# Graph Theory & Shortest Path Algorithms

- **Dijkstra's Algorithm**:
  - Time complexity with min-heap/priority queue :: O((V + E) log V)
  - Limitation of Dijkstra's Algorithm :: Cannot handle graphs with negative edge weights (can get stuck in infinite negative cycles or produce wrong results).

- **Bellman-Ford Algorithm**:
  - Key capability of Bellman-Ford :: Can detect negative weight cycles and calculate shortest paths with negative weights in O(V * E) time.
`,
    tags: ['algorithms', 'dsa', 'graphs', 'shortest-path'],
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-26T12:00:00Z',
    attachments: [],
    flashcardIds: ['card_9', 'card_10'],
  },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const future = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

export const SEED_FLASHCARDS: Flashcard[] = [
  {
    id: 'card_1',
    noteId: 'note_1',
    noteTitle: 'CAP Theorem & Distributed Consensus',
    subjectId: 'sub_1',
    subjectName: 'Distributed Systems',
    front: 'What is Consistency in CAP Theorem?',
    back: 'Every read receives the most recent write or an error.',
    repetitions: 2,
    easeFactor: 2.5,
    intervalDays: 1,
    nextReviewDate: today, // DUE TODAY
    status: 'learning',
  },
  {
    id: 'card_2',
    noteId: 'note_1',
    noteTitle: 'CAP Theorem & Distributed Consensus',
    subjectId: 'sub_1',
    subjectName: 'Distributed Systems',
    front: 'What is Partition Tolerance in CAP Theorem?',
    back: 'The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.',
    repetitions: 1,
    easeFactor: 2.4,
    intervalDays: 1,
    nextReviewDate: today, // DUE TODAY
    status: 'learning',
  },
  {
    id: 'card_3',
    noteId: 'note_1',
    noteTitle: 'CAP Theorem & Distributed Consensus',
    subjectId: 'sub_1',
    subjectName: 'Distributed Systems',
    front: 'What is the PACELC Theorem Definition?',
    back: 'Extension to CAP theorem stating that even in absence of partitions, a distributed system must choose between Latency (L) and Consistency (C).',
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    nextReviewDate: today, // DUE TODAY (New)
    status: 'new',
  },
  {
    id: 'card_4',
    noteId: 'note_1',
    noteTitle: 'CAP Theorem & Distributed Consensus',
    subjectId: 'sub_1',
    subjectName: 'Distributed Systems',
    front: 'What are the 3 states of a Raft node?',
    back: 'Leader, Follower, and Candidate.',
    repetitions: 3,
    easeFactor: 2.6,
    intervalDays: 6,
    nextReviewDate: yesterday, // OVERDUE (Due today)
    status: 'learning',
  },
  {
    id: 'card_5',
    noteId: 'note_1',
    noteTitle: 'CAP Theorem & Distributed Consensus',
    subjectId: 'sub_1',
    subjectName: 'Distributed Systems',
    front: 'What mechanism does Raft use to detect leader failure?',
    back: 'Randomized Heartbeat and Election Timeouts (typically 150ms-300ms).',
    repetitions: 5,
    easeFactor: 2.7,
    intervalDays: 18,
    nextReviewDate: future,
    status: 'mastered',
  },
  {
    id: 'card_6',
    noteId: 'note_2',
    noteTitle: 'Transformer Architecture & Self-Attention',
    subjectId: 'sub_2',
    subjectName: 'Machine Learning & AI',
    front: 'What is the Scaled Dot-Product Attention Formula?',
    back: 'Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V',
    repetitions: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    nextReviewDate: today, // DUE TODAY
    status: 'learning',
  },
  {
    id: 'card_7',
    noteId: 'note_2',
    noteTitle: 'Transformer Architecture & Self-Attention',
    subjectId: 'sub_2',
    subjectName: 'Machine Learning & AI',
    front: 'Why is the dot product in Attention scaled by sqrt(d_k)?',
    back: 'To prevent dot products from growing excessively large with high dimensions, which would push softmax into regions with vanishing gradients.',
    repetitions: 4,
    easeFactor: 2.55,
    intervalDays: 12,
    nextReviewDate: future,
    status: 'learning',
  },
  {
    id: 'card_8',
    noteId: 'note_2',
    noteTitle: 'Transformer Architecture & Self-Attention',
    subjectId: 'sub_2',
    subjectName: 'Machine Learning & AI',
    front: 'What is the primary purpose of Multi-Head Attention?',
    back: 'Allows the model to jointly attend to information from different representation subspaces at different positions.',
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    nextReviewDate: today, // DUE TODAY (New)
    status: 'new',
  },
  {
    id: 'card_9',
    noteId: 'note_3',
    noteTitle: 'Graph Algorithms & Shortest Path',
    subjectId: 'sub_3',
    subjectName: 'Algorithms & Data Structures',
    front: "What is the time complexity of Dijkstra's Algorithm with a min-heap?",
    back: 'O((V + E) log V)',
    repetitions: 6,
    easeFactor: 2.8,
    intervalDays: 30,
    nextReviewDate: future,
    status: 'mastered',
  },
  {
    id: 'card_10',
    noteId: 'note_3',
    noteTitle: 'Graph Algorithms & Shortest Path',
    subjectId: 'sub_3',
    subjectName: 'Algorithms & Data Structures',
    front: "What is the key limitation of Dijkstra's Algorithm?",
    back: 'Cannot handle graphs with negative edge weights (requires Bellman-Ford or SPFA instead).',
    repetitions: 2,
    easeFactor: 2.4,
    intervalDays: 2,
    nextReviewDate: today, // DUE TODAY
    status: 'learning',
  },
];

export const SEED_STUDY_ROOMS: StudyRoom[] = [
  {
    id: 'room_silent_library',
    name: 'The Silent Archive',
    subtitle: 'Quiet Deep Work & University Library Atmosphere',
    description: 'Pin-drop silence. Pure focus. Co-studiers holding each other accountable through live timer synchronization.',
    icon: 'BookOpen',
    themeGradient: 'from-slate-900 via-indigo-950/40 to-slate-900',
    activeCount: 42,
    ambientVibe: 'Library Whisper & Page Turns',
    peers: [
      {
        id: 'peer_1',
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        country: 'Sweden',
        countryFlag: '🇸🇪',
        subjectName: 'Distributed Systems',
        subjectColor: '#6366f1',
        status: 'focusing',
        sessionTimeLeftMinutes: 19,
        sessionTimeLeftSeconds: 19 * 60 - 24, // 18m 36s
        totalSessionSeconds: 25 * 60,
        todayMinutes: 240,
        streakDays: 18,
        quote: 'Cracking Raft election edge cases today ⚡',
      },
      {
        id: 'peer_2',
        name: 'Kenji Takahashi',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        country: 'Japan',
        countryFlag: '🇯🇵',
        subjectName: 'Machine Learning & AI',
        subjectColor: '#ec4899',
        status: 'focusing',
        sessionTimeLeftMinutes: 14,
        sessionTimeLeftSeconds: 14 * 60 - 12, // 13m 48s
        totalSessionSeconds: 25 * 60,
        todayMinutes: 310,
        streakDays: 45,
        quote: 'Training LLaMA 3 fine-tuning pipeline 🧠',
      },
      {
        id: 'peer_3',
        name: 'Sophia Patel',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        country: 'United Kingdom',
        countryFlag: '🇬🇧',
        subjectName: 'Algorithms & DSA',
        subjectColor: '#10b981',
        status: 'break',
        sessionTimeLeftMinutes: 3,
        sessionTimeLeftSeconds: 3 * 60 - 45, // 2m 15s
        totalSessionSeconds: 5 * 60,
        todayMinutes: 180,
        streakDays: 12,
        quote: 'Tea break before segment tree problems 🍵',
      },
      {
        id: 'peer_4',
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        country: 'Germany',
        countryFlag: '🇩🇪',
        subjectName: 'System Design',
        subjectColor: '#f59e0b',
        status: 'focusing',
        sessionTimeLeftMinutes: 22,
        sessionTimeLeftSeconds: 22 * 60 - 30, // 21m 30s
        totalSessionSeconds: 25 * 60,
        todayMinutes: 150,
        streakDays: 9,
        quote: 'Designing global rate limiting with Redis token buckets 🏗️',
      },
    ],
  },
  {
    id: 'room_midnight_loft',
    name: 'Midnight Loft',
    subtitle: 'Late Night Grinders & Lofi Beats',
    description: 'For night owls and early risers pushing through intense coding, revision, and deep research sprints.',
    icon: 'Moon',
    themeGradient: 'from-slate-950 via-purple-950/40 to-slate-950',
    activeCount: 37,
    ambientVibe: 'Warm Synth & Distant Thunder',
    peers: [
      {
        id: 'peer_5',
        name: 'Aarav Sharma',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        country: 'India',
        countryFlag: '🇮🇳',
        subjectName: 'Distributed Systems',
        subjectColor: '#6366f1',
        status: 'focusing',
        sessionTimeLeftMinutes: 11,
        sessionTimeLeftSeconds: 11 * 60 - 18,
        totalSessionSeconds: 25 * 60,
        todayMinutes: 290,
        streakDays: 24,
        quote: 'Kafka partition rebalancing deep dive 🚀',
      },
      {
        id: 'peer_6',
        name: 'Chloe Dubois',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        country: 'France',
        countryFlag: '🇫🇷',
        subjectName: 'Machine Learning & AI',
        subjectColor: '#ec4899',
        status: 'focusing',
        sessionTimeLeftMinutes: 25,
        sessionTimeLeftSeconds: 24 * 60 - 50,
        totalSessionSeconds: 25 * 60,
        todayMinutes: 215,
        streakDays: 31,
        quote: 'Diffusion model latent space visualization ✨',
      },
      {
        id: 'peer_7',
        name: 'Liam O’Connor',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        country: 'Ireland',
        countryFlag: '🇮🇪',
        subjectName: 'System Design',
        subjectColor: '#f59e0b',
        status: 'break',
        sessionTimeLeftMinutes: 4,
        sessionTimeLeftSeconds: 4 * 60 - 10,
        totalSessionSeconds: 5 * 60,
        todayMinutes: 190,
        streakDays: 14,
        quote: 'Quick stretch and cold brew refill ☕',
      },
    ],
  },
  {
    id: 'room_tokyo_sanctum',
    name: 'Tokyo Focus Sanctum',
    subtitle: 'Neon Skyline & Gentle Rain',
    description: 'Minimalist aesthetic flow with soft rain sounds and chill instrumental lofi vibes.',
    icon: 'CloudRain',
    themeGradient: 'from-slate-950 via-cyan-950/30 to-slate-900',
    activeCount: 51,
    ambientVibe: 'Shibuya Rain & Warm Coffee',
    peers: [
      {
        id: 'peer_8',
        name: 'Yuki Tanaka',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        country: 'Japan',
        countryFlag: '🇯🇵',
        subjectName: 'Algorithms & DSA',
        subjectColor: '#10b981',
        status: 'focusing',
        sessionTimeLeftMinutes: 8,
        sessionTimeLeftSeconds: 8 * 60 - 40,
        totalSessionSeconds: 25 * 60,
        todayMinutes: 340,
        streakDays: 60,
        quote: 'Graph bipartite matching optimization 🎯',
      },
      {
        id: 'peer_9',
        name: 'David Miller',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        country: 'United States',
        countryFlag: '🇺🇸',
        subjectName: 'Distributed Systems',
        subjectColor: '#6366f1',
        status: 'focusing',
        sessionTimeLeftMinutes: 17,
        sessionTimeLeftSeconds: 17 * 60 - 15,
        totalSessionSeconds: 25 * 60,
        todayMinutes: 160,
        streakDays: 8,
        quote: 'Paxos vs Raft failure scenarios 🔥',
      },
    ],
  },
];

export const SEED_ROOM_CHAT_MESSAGES: Record<string, RoomChatMessage[]> = {
  room_silent_library: [
    {
      id: 'msg_1',
      roomId: 'room_silent_library',
      senderId: 'peer_1',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🇸🇪',
      senderSubject: 'Distributed Systems',
      content: 'Starting block #3 today. Aiming for 25m on Raft log replication! 🚀',
      timestamp: '10:14 AM',
      reactions: { '🔥': 4, '👏': 2 },
    },
    {
      id: 'msg_2',
      roomId: 'room_silent_library',
      senderId: 'peer_2',
      senderName: 'Kenji Takahashi',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🇯🇵',
      senderSubject: 'Machine Learning',
      content: 'Let’s lock in team. Lo-Fi track on loop. 🎧',
      timestamp: '10:18 AM',
      reactions: { '🧠': 3 },
    },
    {
      id: 'msg_3',
      roomId: 'room_silent_library',
      senderId: 'peer_3',
      senderName: 'Sophia Patel',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🇬🇧',
      senderSubject: 'Algorithms & DSA',
      content: 'Just solved a tricky segment tree problem! Taking a short 3m tea break. 🍵',
      timestamp: '10:22 AM',
      reactions: { '👏': 5, '✨': 3 },
    },
  ],
  room_midnight_loft: [
    {
      id: 'msg_4',
      roomId: 'room_midnight_loft',
      senderId: 'peer_5',
      senderName: 'Aarav Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🇮🇳',
      senderSubject: 'Distributed Systems',
      content: 'Night owl session active! Kafka partitions are making sense now 🌙',
      timestamp: '11:45 PM',
      reactions: { '🔥': 6 },
    },
    {
      id: 'msg_5',
      roomId: 'room_midnight_loft',
      senderId: 'peer_6',
      senderName: 'Chloe Dubois',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🇫🇷',
      senderSubject: 'Machine Learning',
      content: 'Diffusion loss curves are finally dropping. 2 more Pomodoros before sleep! ✨',
      timestamp: '11:50 PM',
      reactions: { '🧠': 4 },
    },
  ],
  room_tokyo_sanctum: [
    {
      id: 'msg_6',
      roomId: 'room_tokyo_sanctum',
      senderId: 'peer_8',
      senderName: 'Yuki Tanaka',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      senderCountryFlag: '🇯🇵',
      senderSubject: 'Algorithms & DSA',
      content: 'Shibuya rain vibes + max concentration. 60-day streak holding strong! 🌧️',
      timestamp: '09:05 AM',
      reactions: { '🔥': 8, '👏': 4 },
    },
  ],
};

export const SEED_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'track_1',
    title: 'Midnight Coffee & Rainy Window',
    artist: 'Lumina Chill Beats',
    category: 'lofi',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    duration: '2:45',
  },
  {
    id: 'track_2',
    title: 'Neon Tokyo Alleyway',
    artist: 'Aesthetic Flow',
    category: 'lofi',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    duration: '3:10',
  },
  {
    id: 'track_3',
    title: 'Cozy Bookstore Hearth',
    artist: 'Nordic Solitude',
    category: 'ambient',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lofi-chill-medium-version-159456.mp3',
    duration: '2:50',
  },
  {
    id: 'track_4',
    title: 'Deep Theta Waves (432Hz Focus)',
    artist: 'Binaural Synth Engine',
    category: 'binaural',
    url: '',
    duration: '∞ Infinite',
    isSynthetic: true,
  },
];

export const INITIAL_AMBIENT_LAYERS: AmbientLayer[] = [
  { id: 'rain', name: 'Rainfall', icon: 'CloudRain', type: 'rain', volume: 50, isEnabled: false },
  { id: 'cafe', name: 'Coffee Shop', icon: 'Coffee', type: 'cafe', volume: 40, isEnabled: false },
  { id: 'binaural', name: '432Hz Binaural Beat', icon: 'Activity', type: 'binaural', volume: 60, isEnabled: false },
  { id: 'whitenoise', name: 'Pink Noise', icon: 'Radio', type: 'whitenoise', volume: 30, isEnabled: false },
  { id: 'forest', name: 'Forest Birds', icon: 'Trees', type: 'forest', volume: 35, isEnabled: false },
];

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  soundVolume: 75,
  tickingSound: false,
  notificationSound: 'zen_chime',
};

export const DEFAULT_R2_CONFIG: R2StorageConfig = {
  accountId: '',
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
  publicUrl: '',
  enabled: false,
  maxStorageBytes: 500 * 1024 * 1024,
};

export const DEFAULT_EMAIL_CONFIG: EmailReminderConfig = {
  email: 'learner@example.com',
  enabled: true,
  scheduledTime: '09:00',
  digestFrequency: 'daily',
  minDueCards: 1,
  includeStudyStats: true,
};

export const SEED_DAILY_LOGS: DailyStudyLog[] = [
  { date: '2026-08-23', totalMinutes: 140, subjectMinutes: { sub_1: 60, sub_2: 50, sub_3: 30 }, completedSessions: 5, cardsReviewed: 15 },
  { date: '2026-08-24', totalMinutes: 185, subjectMinutes: { sub_1: 85, sub_2: 60, sub_4: 40 }, completedSessions: 7, cardsReviewed: 22 },
  { date: '2026-08-25', totalMinutes: 210, subjectMinutes: { sub_2: 120, sub_3: 90 }, completedSessions: 8, cardsReviewed: 18 },
  { date: '2026-08-26', totalMinutes: 150, subjectMinutes: { sub_1: 75, sub_3: 75 }, completedSessions: 6, cardsReviewed: 12 },
  { date: '2026-08-27', totalMinutes: 240, subjectMinutes: { sub_1: 90, sub_2: 90, sub_4: 60 }, completedSessions: 9, cardsReviewed: 28 },
  { date: '2026-08-28', totalMinutes: 275, subjectMinutes: { sub_2: 150, sub_3: 75, sub_1: 50 }, completedSessions: 11, cardsReviewed: 35 },
  { date: today, totalMinutes: 95, subjectMinutes: { sub_1: 50, sub_2: 45 }, completedSessions: 3, cardsReviewed: 8 },
];

export const SEED_REVISION_ITEMS: RevisionScheduleItem[] = [
  {
    id: 'rev_1',
    targetType: 'file',
    targetId: 'note_1',
    title: 'CAP Theorem & Distributed Consensus.txt',
    subjectId: 'sub_1',
    subjectName: 'Distributed Systems',
    folderName: 'Distributed Architectures',
    scheduledDate: today,
    scheduledTime: '09:00 AM',
    intervalDays: 1,
    revisionCount: 2,
    lastRevisedAt: '2026-08-28T09:30:00Z',
    lastQuizScore: 80,
    emailReminder: true,
    userEmail: 'student@university.edu',
    status: 'due',
  },
  {
    id: 'rev_2',
    targetType: 'folder',
    targetId: 'f_ai',
    title: 'Deep Learning & LLMs Folder',
    subjectId: 'sub_2',
    subjectName: 'Machine Learning & AI',
    folderName: 'Deep Learning & LLMs',
    scheduledDate: '2026-08-30',
    scheduledTime: '10:00 AM',
    intervalDays: 3,
    revisionCount: 3,
    lastRevisedAt: '2026-08-27T11:00:00Z',
    lastQuizScore: 90,
    emailReminder: true,
    userEmail: 'student@university.edu',
    status: 'scheduled',
  },
  {
    id: 'rev_3',
    targetType: 'file',
    targetId: 'note_3',
    title: 'Transformers & Multi-Head Self-Attention.txt',
    subjectId: 'sub_2',
    subjectName: 'Machine Learning & AI',
    folderName: 'Deep Learning & LLMs',
    scheduledDate: '2026-09-04',
    scheduledTime: '02:00 PM',
    intervalDays: 7,
    revisionCount: 4,
    lastRevisedAt: '2026-08-28T14:00:00Z',
    lastQuizScore: 100,
    emailReminder: true,
    userEmail: 'student@university.edu',
    status: 'scheduled',
  },
];


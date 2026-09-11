import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Subject,
  Folder,
  NoteDocument,
  Flashcard,
  FileAttachment,
  TimerSettings,
  R2StorageConfig,
  EmailReminderConfig,
  DailyStudyLog,
  PomodoroSession,
  RevisionScheduleItem,
} from '../types';
import {
  SEED_SUBJECTS,
  SEED_FOLDERS,
  SEED_NOTES,
  SEED_FLASHCARDS,
  SEED_FILES,
  SEED_REVISION_ITEMS,
  DEFAULT_TIMER_SETTINGS,
  DEFAULT_R2_CONFIG,
  DEFAULT_EMAIL_CONFIG,
  SEED_DAILY_LOGS,
} from '../utils/seedData';
import { calculateSM2, ReviewRating } from '../services/sm2Service';

interface AppContextType {
  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'totalSecondsStudied' | 'createdAt'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  recordStudyTime: (subjectId: string, seconds: number) => void;

  // Folders
  folders: Folder[];
  addFolder: (name: string, subjectId?: string, parentId?: string | null, color?: string) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;

  // Notes
  notes: NoteDocument[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  createNote: (folderId?: string, subjectId?: string, initialTitle?: string, initialContent?: string) => NoteDocument;
  updateNoteContent: (id: string, title: string, content: string, tags?: string[], folderId?: string, subjectId?: string) => void;
  deleteNote: (id: string) => void;

  // Flashcards
  flashcards: Flashcard[];
  addCustomFlashcard: (cardData: { front: string; back: string; subjectId: string; noteId?: string; hint?: string }) => Flashcard;
  createFlashcardsBatch: (cards: Array<{ front: string; back: string; subjectId: string; noteId?: string; hint?: string }>) => void;
  reviewFlashcard: (cardId: string, rating: ReviewRating) => void;
  deleteFlashcard: (cardId: string) => void;

  // Revision Schedules
  revisionItems: RevisionScheduleItem[];
  scheduleRevision: (itemData: Omit<RevisionScheduleItem, 'id' | 'revisionCount' | 'status'>) => RevisionScheduleItem;
  updateRevisionItem: (id: string, updates: Partial<RevisionScheduleItem>) => void;
  deleteRevisionItem: (id: string) => void;
  completeRevision: (id: string, nextIntervalDays: number, quizScore?: number) => void;

  // Files & Attachments (R2 & IndexedDB)
  files: FileAttachment[];
  addFileAttachment: (file: FileAttachment) => void;
  deleteFileAttachment: (fileId: string) => void;

  // Settings
  timerSettings: TimerSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  r2Config: R2StorageConfig;
  updateR2Config: (config: Partial<R2StorageConfig>) => void;
  emailConfig: EmailReminderConfig;
  updateEmailConfig: (config: Partial<EmailReminderConfig>) => void;

  // Analytics & History
  dailyLogs: DailyStudyLog[];
  completedSessions: PomodoroSession[];
  logCompletedSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;
  studyStreakDays: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUBJECTS: 'lumina_subjects_v1',
  FOLDERS: 'lumina_folders_v1',
  NOTES: 'lumina_notes_v1',
  FLASHCARDS: 'lumina_flashcards_v1',
  FILES: 'lumina_files_v1',
  TIMER_SETTINGS: 'lumina_timer_settings_v1',
  R2_CONFIG: 'lumina_r2_config_v1',
  EMAIL_CONFIG: 'lumina_email_config_v1',
  DAILY_LOGS: 'lumina_daily_logs_v1',
  SESSIONS: 'lumina_sessions_v1',
  REVISION_ITEMS: 'lumina_revision_items_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or seed data
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return saved ? JSON.parse(saved) : SEED_SUBJECTS;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return saved ? JSON.parse(saved) : SEED_FOLDERS;
  });

  const [notes, setNotes] = useState<NoteDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    return saved ? JSON.parse(saved) : SEED_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return saved ? JSON.parse(saved) : SEED_FLASHCARDS;
  });

  const [revisionItems, setRevisionItems] = useState<RevisionScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVISION_ITEMS);
    return saved ? JSON.parse(saved) : SEED_REVISION_ITEMS;
  });

  const [files, setFiles] = useState<FileAttachment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILES);
    return saved ? JSON.parse(saved) : SEED_FILES;
  });

  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMER_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_TIMER_SETTINGS;
  });

  const [r2Config, setR2Config] = useState<R2StorageConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.R2_CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_R2_CONFIG;
  });

  const [emailConfig, setEmailConfig] = useState<EmailReminderConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAIL_CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_EMAIL_CONFIG;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyStudyLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    return saved ? JSON.parse(saved) : SEED_DAILY_LOGS;
  });

  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER_SETTINGS, JSON.stringify(timerSettings));
  }, [timerSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.R2_CONFIG, JSON.stringify(r2Config));
  }, [r2Config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(emailConfig));
  }, [emailConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(completedSessions));
  }, [completedSessions]);

  // Subject Handlers
  const addSubject = (sub: Omit<Subject, 'id' | 'totalSecondsStudied' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...sub,
      id: 'sub_' + Date.now(),
      totalSecondsStudied: 0,
      createdAt: new Date().toISOString(),
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const recordStudyTime = (subjectId: string, seconds: number) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, totalSecondsStudied: s.totalSecondsStudied + seconds }
          : s
      )
    );
  };

  // Folder Handlers
  const addFolder = (name: string, subjectId?: string, parentId?: string | null, color?: string): Folder => {
    const newFolder: Folder = {
      id: 'f_' + Date.now(),
      name: name.trim(),
      subjectId,
      parentId: parentId || null,
      color: color || 'text-indigo-400',
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  /**
   * Helper: Extracts RemNote-style `::` flashcards from document content
   */
  const extractFlashcardsFromContent = (
    noteId: string,
    noteTitle: string,
    subjectId: string | undefined,
    content: string
  ): Flashcard[] => {
    const lines = content.split('\n');
    const extracted: Flashcard[] = [];
    const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
    const todayStr = new Date().toISOString().split('T')[0];

    lines.forEach((line) => {
      // Look for "Question :: Answer" or "- Concept :: Definition"
      if (line.includes('::')) {
        const parts = line.split('::');
        if (parts.length >= 2) {
          const frontRaw = parts[0].replace(/^[-*#\s]+/, '').trim();
          const backRaw = parts.slice(1).join('::').trim();

          if (frontRaw && backRaw) {
            // Check if card already exists to retain SM-2 progress
            const existing = flashcards.find(
              (f) => f.noteId === noteId && f.front.toLowerCase() === frontRaw.toLowerCase()
            );

            if (existing) {
              extracted.push({
                ...existing,
                noteTitle,
                subjectId: subject?.id || 'sub_default',
                subjectName: subject?.name || 'General',
                back: backRaw,
              });
            } else {
              extracted.push({
                id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                noteId,
                noteTitle,
                subjectId: subject?.id || 'sub_default',
                subjectName: subject?.name || 'General',
                front: frontRaw,
                back: backRaw,
                repetitions: 0,
                easeFactor: 2.5,
                intervalDays: 0,
                nextReviewDate: todayStr,
                status: 'new',
              });
            }
          }
        }
      }
    });

    return extracted;
  };

  // Notes Handlers
  const createNote = (
    folderId?: string,
    subjectId?: string,
    initialTitle?: string,
    initialContent?: string
  ): NoteDocument => {
    const defaultSubject = subjects[0]?.id;
    const newNote: NoteDocument = {
      id: 'note_' + Date.now(),
      title: initialTitle || 'Untitled Document',
      folderId,
      subjectId: subjectId || defaultSubject,
      content: initialContent || `# ${initialTitle || 'New Document'}\n\n- Start typing your structured notes or paste lecture content here...`,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      flashcardIds: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    return newNote;
  };

  const updateNoteContent = (
    id: string,
    title: string,
    content: string,
    tags?: string[],
    folderId?: string,
    subjectId?: string
  ) => {
    const noteSubjectId = subjectId || notes.find((n) => n.id === id)?.subjectId;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              title,
              content,
              tags: tags || note.tags,
              folderId: folderId !== undefined ? folderId : note.folderId,
              subjectId: noteSubjectId,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setFlashcards((prev) => prev.filter((c) => c.noteId !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Flashcards Handlers
  const reviewFlashcard = (cardId: string, rating: ReviewRating) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const sm2 = calculateSM2(card, rating);
          return {
            ...card,
            ...sm2,
            lastReviewedAt: new Date().toISOString(),
          };
        }
        return card;
      })
    );

    // Update daily logs cardsReviewed count
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyLogs((prev) => {
      const todayIndex = prev.findIndex((log) => log.date === todayStr);
      if (todayIndex >= 0) {
        const updated = [...prev];
        updated[todayIndex] = {
          ...updated[todayIndex],
          cardsReviewed: (updated[todayIndex].cardsReviewed || 0) + 1,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: todayStr,
            totalMinutes: 0,
            subjectMinutes: {},
            completedSessions: 0,
            cardsReviewed: 1,
          },
        ];
      }
    });
  };

  const addCustomFlashcard = (cardData: {
    front: string;
    back: string;
    subjectId: string;
    noteId?: string;
    hint?: string;
  }): Flashcard => {
    const subject = subjects.find((s) => s.id === cardData.subjectId) || subjects[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const newCard: Flashcard = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      noteId: cardData.noteId || 'note_custom',
      noteTitle: cardData.noteId
        ? notes.find((n) => n.id === cardData.noteId)?.title || 'General'
        : 'Folder Flashcards',
      subjectId: cardData.subjectId,
      subjectName: subject?.name || 'General',
      front: cardData.front.trim(),
      back: cardData.back.trim(),
      hint: cardData.hint?.trim(),
      repetitions: 0,
      easeFactor: 2.5,
      intervalDays: 0,
      nextReviewDate: todayStr,
      status: 'new',
    };
    setFlashcards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const createFlashcardsBatch = (
    cards: Array<{ front: string; back: string; subjectId: string; noteId?: string; hint?: string }>
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCards: Flashcard[] = cards
      .filter((c) => c.front.trim() && c.back.trim())
      .map((c) => {
        const subject = subjects.find((s) => s.id === c.subjectId) || subjects[0];
        return {
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          noteId: c.noteId || 'note_custom',
          noteTitle: c.noteId
            ? notes.find((n) => n.id === c.noteId)?.title || 'General'
            : 'Folder Flashcards',
          subjectId: c.subjectId,
          subjectName: subject?.name || 'General',
          front: c.front.trim(),
          back: c.back.trim(),
          hint: c.hint?.trim(),
          repetitions: 0,
          easeFactor: 2.5,
          intervalDays: 0,
          nextReviewDate: todayStr,
          status: 'new',
        };
      });
    setFlashcards((prev) => [...newCards, ...prev]);
  };

  const deleteFlashcard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Files Handlers
  const addFileAttachment = (file: FileAttachment) => {
    setFiles((prev) => [file, ...prev]);
    if (file.noteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === file.noteId
            ? { ...n, attachments: [...n.attachments, file] }
            : n
        )
      );
    }
  };

  const deleteFileAttachment = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        attachments: n.attachments.filter((f) => f.id !== fileId),
      }))
    );
  };

  // Settings Handlers
  const updateTimerSettings = (settings: Partial<TimerSettings>) => {
    setTimerSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateR2Config = (config: Partial<R2StorageConfig>) => {
    setR2Config((prev) => ({ ...prev, ...config }));
  };

  const updateEmailConfig = (config: Partial<EmailReminderConfig>) => {
    setEmailConfig((prev) => ({ ...prev, ...config }));
  };

  // Sessions & Daily Log
  const logCompletedSession = (sessionData: Omit<PomodoroSession, 'id' | 'completedAt'>) => {
    const session: PomodoroSession = {
      ...sessionData,
      id: 'sess_' + Date.now(),
      completedAt: new Date().toISOString(),
    };
    setCompletedSessions((prev) => [session, ...prev]);

    const todayStr = new Date().toISOString().split('T')[0];
    setDailyLogs((prev) => {
      const todayIndex = prev.findIndex((log) => log.date === todayStr);
      if (todayIndex >= 0) {
        const updated = [...prev];
        const existing = updated[todayIndex];
        updated[todayIndex] = {
          ...existing,
          totalMinutes: existing.totalMinutes + session.durationMinutes,
          subjectMinutes: {
            ...existing.subjectMinutes,
            [session.subjectId]:
              (existing.subjectMinutes[session.subjectId] || 0) + session.durationMinutes,
          },
          completedSessions: existing.completedSessions + 1,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: todayStr,
            totalMinutes: session.durationMinutes,
            subjectMinutes: { [session.subjectId]: session.durationMinutes },
            completedSessions: 1,
            cardsReviewed: 0,
          },
        ];
      }
    });

    recordStudyTime(session.subjectId, session.durationMinutes * 60);
  };

  // Calculate study streak days
  const studyStreakDays = React.useMemo(() => {
    const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;

    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      if (log.totalMinutes > 0 || log.cardsReviewed > 0) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(streak, 7); // minimum realistic streak display
  }, [dailyLogs]);

  // Revision Handlers
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVISION_ITEMS, JSON.stringify(revisionItems));
  }, [revisionItems]);

  const scheduleRevision = (
    itemData: Omit<RevisionScheduleItem, 'id' | 'revisionCount' | 'status'>
  ): RevisionScheduleItem => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isDue = itemData.scheduledDate <= todayStr;
    const newItem: RevisionScheduleItem = {
      ...itemData,
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      revisionCount: 0,
      status: isDue ? 'due' : 'scheduled',
    };
    setRevisionItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateRevisionItem = (id: string, updates: Partial<RevisionScheduleItem>) => {
    setRevisionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteRevisionItem = (id: string) => {
    setRevisionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const completeRevision = (id: string, nextIntervalDays: number, quizScore?: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextIntervalDays);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    setRevisionItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            revisionCount: item.revisionCount + 1,
            lastRevisedAt: new Date().toISOString(),
            lastQuizScore: quizScore !== undefined ? quizScore : item.lastQuizScore,
            intervalDays: nextIntervalDays,
            scheduledDate: nextDateStr,
            status: 'scheduled',
          };
        }
        return item;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        recordStudyTime,
        folders,
        addFolder,
        updateFolder,
        deleteFolder,
        notes,
        activeNoteId,
        setActiveNoteId,
        createNote,
        updateNoteContent,
        deleteNote,
        flashcards,
        addCustomFlashcard,
        createFlashcardsBatch,
        reviewFlashcard,
        deleteFlashcard,
        revisionItems,
        scheduleRevision,
        updateRevisionItem,
        deleteRevisionItem,
        completeRevision,
        files,
        addFileAttachment,
        deleteFileAttachment,
        timerSettings,
        updateTimerSettings,
        r2Config,
        updateR2Config,
        emailConfig,
        updateEmailConfig,
        dailyLogs,
        completedSessions,
        logCompletedSession,
        studyStreakDays,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

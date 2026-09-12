import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserAccount } from '../types';

interface SignupData {
  name: string;
  email: string;
  password?: string;
  country?: string;
  countryFlag?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  userName: string;
  isAuthenticated: boolean;
  registeredUsers: UserAccount[];
  login: (emailOrName: string, password?: string) => AuthResult;
  signup: (data: SignupData) => AuthResult;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  quickDemoLogin: (email?: string) => void;
  // Modals
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'lumina_current_user',
  USER_NAME: 'lumina_user_name',
  REGISTERED_USERS: 'lumina_registered_users',
};

const DEFAULT_DEMO_USERS: UserAccount[] = [
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex@lumina.study',
    passwordHash: 'lumina123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    country: 'United States',
    countryFlag: '🇺🇸',
    bio: 'Computer Science & AI enthusiast • 25m Pomodoro fan',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'user_sophia',
    name: 'Sophia Patel',
    email: 'sophia@university.edu',
    passwordHash: 'lumina123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    country: 'India',
    countryFlag: '🇮🇳',
    bio: 'Pre-Med Student • Spaced Repetition advocate',
    createdAt: '2026-02-10T10:30:00.000Z',
  },
  {
    id: 'user_kenji',
    name: 'Kenji Takahashi',
    email: 'kenji@tokyo.ac.jp',
    passwordHash: 'lumina123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    country: 'Japan',
    countryFlag: '🇯🇵',
    bio: 'Deep work & Lo-Fi focus believer',
    createdAt: '2026-03-01T14:15:00.000Z',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize registered users from localStorage or default seed
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Failed to load registered users from localStorage:', err);
    }
    return DEFAULT_DEMO_USERS;
  });

  // 2. Initialize current active user from localStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) return parsed;
      }
      // Check legacy/fallback single user_name key
      const legacyName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      if (legacyName && legacyName.trim()) {
        return {
          id: 'user_' + Date.now(),
          name: legacyName.trim(),
          email: `${legacyName.toLowerCase().replace(/\s+/g, '')}@lumina.study`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          country: 'Global',
          countryFlag: '⚡',
          createdAt: new Date().toISOString(),
        };
      }
      // Default to initial demo user Alex for a polished out-of-the-box experience
      return DEFAULT_DEMO_USERS[0];
    } catch (err) {
      console.error('Failed to load active user from localStorage:', err);
      return DEFAULT_DEMO_USERS[0];
    }
  });

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync registered users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));
    } catch (err) {
      console.error('Failed to save registered users:', err);
    }
  }, [registeredUsers]);

  // Sync active user to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.USER_NAME, user.name);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);
      }
    } catch (err) {
      console.error('Failed to save active user:', err);
    }
  }, [user]);

  // Sign up method
  const signup = useCallback((data: SignupData): AuthResult => {
    const trimmedName = data.name.trim();
    const trimmedEmail = data.email.trim().toLowerCase();
    const password = data.password || 'lumina123';

    if (!trimmedName) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password should be at least 4 characters.' };
    }

    // Check if email already registered
    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Try signing in!' };
    }

    const newUserAccount: UserAccount = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: password,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`,
      country: data.country || 'Global',
      countryFlag: data.countryFlag || '⚡',
      bio: 'Lumina Deep Work Studier',
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newUserAccount, ...prev]);

    // Strip password for active user state
    const { passwordHash, ...profile } = newUserAccount;
    setUser(profile);
    setIsAuthModalOpen(false);

    return { success: true };
  }, [registeredUsers]);

  // Login method
  const login = useCallback((emailOrName: string, password?: string): AuthResult => {
    const query = emailOrName.trim().toLowerCase();
    if (!query) {
      return { success: false, error: 'Please enter your email or name.' };
    }

    const foundAccount = registeredUsers.find(
      (u) => u.email.toLowerCase() === query || u.name.toLowerCase() === query
    );

    if (!foundAccount) {
      // If not found, check if user simply wants to login with their name directly (fallback friendly)
      if (emailOrName.trim().length >= 2 && (!password || password.length >= 2)) {
        const adHocAccount: UserAccount = {
          id: 'user_' + Date.now(),
          name: emailOrName.trim(),
          email: query.includes('@') ? query : `${query.replace(/\s+/g, '')}@lumina.study`,
          passwordHash: password || 'lumina123',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailOrName.trim())}`,
          country: 'Global',
          countryFlag: '⚡',
          bio: 'Lumina Deep Work Studier',
          createdAt: new Date().toISOString(),
        };
        setRegisteredUsers((prev) => [adHocAccount, ...prev]);
        const { passwordHash, ...profile } = adHocAccount;
        setUser(profile);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: 'Account not found. Check credentials or create an account.' };
    }

    // If password provided, verify it (demo simulation)
    if (password && foundAccount.passwordHash && foundAccount.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const { passwordHash, ...profile } = foundAccount;
    setUser(profile);
    setIsAuthModalOpen(false);

    return { success: true };
  }, [registeredUsers]);

  // Logout method
  const logout = useCallback(() => {
    setUser(null);
    setIsProfileModalOpen(false);
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      // Update in registeredUsers list as well
      setRegisteredUsers((users) =>
        users.map((u) => (u.id === prev.id ? { ...u, ...updates } : u))
      );

      return updated;
    });
  }, []);

  // Quick Demo Login helper
  const quickDemoLogin = useCallback((email?: string) => {
    const target = email
      ? registeredUsers.find((u) => u.email === email) || DEFAULT_DEMO_USERS[0]
      : DEFAULT_DEMO_USERS[0];
    
    if (target) {
      const { passwordHash, ...profile } = target;
      setUser(profile);
      setIsAuthModalOpen(false);
    }
  }, [registeredUsers]);

  const openAuthModal = useCallback((tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userName: user?.name || 'Guest Studier',
        isAuthenticated: !!user,
        registeredUsers,
        login,
        signup,
        logout,
        updateProfile,
        quickDemoLogin,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

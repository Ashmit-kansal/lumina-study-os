import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type AppTab = 'home' | 'pomodoro' | 'rooms' | 'notes' | 'revision' | 'analytics';

export interface RouteConfig {
  path: string;
  tab: AppTab;
  title: string;
}

export const ROUTES: Record<string, { tab: AppTab; title: string }> = {
  '/': { tab: 'home', title: 'Lumina — All-In-One Study Ecosystem' },
  '/home': { tab: 'home', title: 'Home Dashboard — Lumina Study' },
  '/pomodoro': { tab: 'pomodoro', title: 'Focus Pomodoro Timer — Lumina Study' },
  '/focus': { tab: 'pomodoro', title: 'Focus Pomodoro Timer — Lumina Study' },
  '/rooms': { tab: 'rooms', title: 'Study Rooms & Lounge — Lumina Study' },
  '/lounge': { tab: 'rooms', title: 'Study Rooms & Lounge — Lumina Study' },
  '/notes': { tab: 'notes', title: 'Notes & Study Vault — Lumina Study' },
  '/revision': { tab: 'revision', title: 'Smart Revision & Flashcards — Lumina Study' },
  '/flashcards': { tab: 'revision', title: 'Smart Revision & Flashcards — Lumina Study' },
  '/cards': { tab: 'revision', title: 'Smart Revision & Flashcards — Lumina Study' },
  '/analytics': { tab: 'analytics', title: 'Study Analytics & Stats — Lumina Study' },
  '/stats': { tab: 'analytics', title: 'Study Analytics & Stats — Lumina Study' },
};

export const TAB_PATHS: Record<AppTab, string> = {
  home: '/',
  pomodoro: '/pomodoro',
  rooms: '/rooms',
  notes: '/notes',
  revision: '/revision',
  analytics: '/analytics',
};

interface RouterContextType {
  currentPath: string;
  activeTab: AppTab;
  isNotFound: boolean;
  searchParams: URLSearchParams;
  navigate: (to: string, options?: { replace?: boolean; state?: any; preserveQuery?: boolean }) => void;
  navigateToTab: (tab: AppTab | string, options?: { replace?: boolean }) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  historyIndex: number;
  setSearchParam: (key: string, value: string | null) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper to parse current path and search params from window.location
const getCurrentLocation = () => {
  if (typeof window === 'undefined') {
    return { path: '/', search: '' };
  }

  // Support both hash routes (e.g. /#/notes?id=123) and standard HTML5 path routes (/notes?id=123)
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    const cleanHash = hash.slice(1); // remove '#'
    const [hPath, hSearch] = cleanHash.split('?');
    return {
      path: hPath || '/',
      search: hSearch ? `?${hSearch}` : '',
    };
  }

  return {
    path: window.location.pathname || '/',
    search: window.location.search || '',
  };
};

// Normalize path by stripping trailing slash (except for root '/')
const normalizePath = (path: string): string => {
  if (!path) return '/';
  const clean = path.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
};

// Match route path to known Tab
const resolveRoute = (path: string): { tab: AppTab; title: string; isNotFound: boolean } => {
  const norm = normalizePath(path);
  if (ROUTES[norm]) {
    return { ...ROUTES[norm], isNotFound: false };
  }
  // Check if starts with a known route prefix (e.g. /notes/123 -> /notes)
  if (norm.startsWith('/notes')) {
    return { tab: 'notes', title: 'Notes Workspace — Lumina Study', isNotFound: false };
  }
  if (norm.startsWith('/rooms')) {
    return { tab: 'rooms', title: 'Study Rooms & Lounge — Lumina Study', isNotFound: false };
  }
  if (norm.startsWith('/revision') || norm.startsWith('/flashcards') || norm.startsWith('/cards')) {
    return { tab: 'revision', title: 'Smart Revision & Flashcards — Lumina Study', isNotFound: false };
  }
  if (norm.startsWith('/pomodoro') || norm.startsWith('/focus')) {
    return { tab: 'pomodoro', title: 'Focus Pomodoro Timer — Lumina Study', isNotFound: false };
  }
  if (norm.startsWith('/analytics') || norm.startsWith('/stats')) {
    return { tab: 'analytics', title: 'Study Analytics & Stats — Lumina Study', isNotFound: false };
  }
  if (norm === '' || norm === '/') {
    return { tab: 'home', title: 'Lumina — All-In-One Study Ecosystem', isNotFound: false };
  }

  return { tab: 'home', title: 'Page Not Found — Lumina Study', isNotFound: true };
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(getCurrentLocation);
  const [historyIndex, setHistoryIndex] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.history.state?.idx !== undefined) {
      return window.history.state.idx;
    }
    return 0;
  });
  const [maxHistoryIndex, setMaxHistoryIndex] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.history.state?.maxIdx !== undefined) {
      return window.history.state.maxIdx;
    }
    return 0;
  });

  const normalizedPath = normalizePath(currentLocation.path);
  const routeInfo = useMemo(() => resolveRoute(normalizedPath), [normalizedPath]);
  const searchParams = useMemo(() => new URLSearchParams(currentLocation.search), [currentLocation.search]);

  // Synchronize document title
  useEffect(() => {
    document.title = routeInfo.title;
  }, [routeInfo.title]);

  // Listen to browser Back and Forward button events (popstate) & hashchange
  useEffect(() => {
    // Ensure initial history state has index
    if (window.history.state?.idx === undefined) {
      window.history.replaceState({ idx: 0, maxIdx: 0, path: currentLocation.path }, document.title, window.location.href);
    }

    const handlePopState = (e: PopStateEvent) => {
      const newLoc = getCurrentLocation();
      setCurrentLocation(newLoc);

      if (e.state && typeof e.state.idx === 'number') {
        setHistoryIndex(e.state.idx);
        if (typeof e.state.maxIdx === 'number') {
          setMaxHistoryIndex(Math.max(e.state.maxIdx, e.state.idx));
        }
      } else {
        // Fallback index change
        setHistoryIndex((prev) => Math.max(0, prev - 1));
      }
    };

    const handleHashChange = () => {
      const newLoc = getCurrentLocation();
      setCurrentLocation(newLoc);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentLocation.path]);

  // Navigate to a specific path
  const navigate = useCallback(
    (to: string, options?: { replace?: boolean; state?: any; preserveQuery?: boolean }) => {
      if (typeof window === 'undefined') return;

      let targetPath = to;
      let targetSearch = '';

      if (to.includes('?')) {
        const parts = to.split('?');
        targetPath = parts[0];
        targetSearch = `?${parts[1]}`;
      } else if (options?.preserveQuery && currentLocation.search) {
        targetSearch = currentLocation.search;
      }

      const fullUrl = `${targetPath}${targetSearch}`;
      const currentFullUrl = `${currentLocation.path}${currentLocation.search}`;

      if (fullUrl === currentFullUrl && !options?.replace) {
        return; // Already on this route
      }

      const nextIdx = options?.replace ? historyIndex : historyIndex + 1;
      const nextMaxIdx = options?.replace ? maxHistoryIndex : Math.max(maxHistoryIndex, nextIdx);

      const stateObj = {
        ...(options?.state || {}),
        idx: nextIdx,
        maxIdx: nextMaxIdx,
        path: targetPath,
      };

      if (options?.replace) {
        window.history.replaceState(stateObj, '', fullUrl);
      } else {
        window.history.pushState(stateObj, '', fullUrl);
      }

      setHistoryIndex(nextIdx);
      setMaxHistoryIndex(nextMaxIdx);
      setCurrentLocation({ path: targetPath, search: targetSearch });

      // Smooth scroll to top of workspace
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentLocation, historyIndex, maxHistoryIndex]
  );

  // Navigate directly by Tab name
  const navigateToTab = useCallback(
    (tab: AppTab | string, options?: { replace?: boolean }) => {
      const path = TAB_PATHS[tab as AppTab] || (tab.startsWith('/') ? tab : `/${tab}`);
      navigate(path, options);
    },
    [navigate]
  );

  // Browser-level history Back & Forward functions
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  const goForward = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }, []);

  // Update query params in the current URL without full reload
  const setSearchParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(currentLocation.search);
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const newSearch = params.toString() ? `?${params.toString()}` : '';
      navigate(`${currentLocation.path}${newSearch}`, { replace: true });
    },
    [currentLocation.path, currentLocation.search, navigate]
  );

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < maxHistoryIndex;

  const value = useMemo(
    () => ({
      currentPath: normalizedPath,
      activeTab: routeInfo.tab,
      isNotFound: routeInfo.isNotFound,
      searchParams,
      navigate,
      navigateToTab,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      historyIndex,
      setSearchParam,
    }),
    [
      normalizedPath,
      routeInfo.tab,
      routeInfo.isNotFound,
      searchParams,
      navigate,
      navigateToTab,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      historyIndex,
      setSearchParam,
    ]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, replace, onClick, children, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Allow normal browser new-tab / modified clicks (Cmd, Ctrl, Shift, Alt, middle-click)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }

    e.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

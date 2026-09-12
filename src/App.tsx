import React from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { AudioProvider } from './context/AudioContext';
import { RoomProvider } from './context/RoomContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Header } from './components/layout/Header';
import { QuickAudioFloatingBar } from './components/layout/QuickAudioFloatingBar';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { HomeView } from './components/home/HomeView';
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer';
import { TodayStatsCard } from './components/pomodoro/TodayStatsCard';
import { StudyRoomView } from './components/study-room/StudyRoomView';
import { NotesWorkspace } from './components/notes/NotesWorkspace';
import { FlashcardDashboard } from './components/flashcards/FlashcardDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFoundView: React.FC = () => {
  const { navigate, goBack, canGoBack } = useRouter();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-500/10">
        <Compass className="w-10 h-10 text-indigo-400 animate-spin-slow" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-3xl font-black text-white tracking-tight">404 — Page Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested study path does not exist. Use the buttons below or your browser's back button to return.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {canGoBack && (
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Home className="w-4 h-4" /> Return to Home
        </button>
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { activeTab, isNotFound, navigateToTab } = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Decorative Background Glow Blobs */}
      <div className="fixed top-[-150px] left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-150px] right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-[-100px] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Header with Integrated Navigation and Prev/Next History Controls */}
      <Header />

      {/* Full-Width Workspace Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full pb-20">
          {isNotFound ? (
            <NotFoundView />
          ) : (
            <>
              {activeTab === 'home' && (
                <div className="animate-fade-in">
                  <HomeView onNavigate={(tab) => navigateToTab(tab)} />
                </div>
              )}

              {activeTab === 'pomodoro' && (
                <div className="space-y-8 animate-fade-in">
                  <PomodoroTimer />
                  <TodayStatsCard />
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="animate-fade-in">
                  <StudyRoomView />
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="animate-fade-in">
                  <NotesWorkspace />
                </div>
              )}

              {(activeTab === 'revision' || (activeTab as string) === 'flashcards') && (
                <div className="animate-fade-in">
                  <FlashcardDashboard />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="animate-fade-in">
                  <AnalyticsDashboard />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Floating Lo-Fi Audio Controller */}
      <QuickAudioFloatingBar onOpenStudyRoom={() => navigateToTab('rooms')} />

      {/* Global Authentication & Profile Modals */}
      <AuthModal />
      <UserProfileModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <TimerProvider>
          <AudioProvider>
            <RoomProvider>
              <RouterProvider>
                <MainAppContent />
              </RouterProvider>
            </RoomProvider>
          </AudioProvider>
        </TimerProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;

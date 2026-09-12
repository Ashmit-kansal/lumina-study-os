import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  User,
  Mail,
  Flame,
  FileText,
  Brain,
  Timer,
  Edit2,
  Check,
  LogOut,
  UserCheck,
  Globe,
  Calendar,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'GL', name: 'Global', flag: '⚡' },
];

export const UserProfileModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isProfileModalOpen,
    closeProfileModal,
    updateProfile,
    logout,
    openAuthModal,
    registeredUsers,
    quickDemoLogin,
  } = useAuth();

  const { studyStreakDays, notes, flashcards, dailyLogs } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState(COUNTRIES[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      const found = COUNTRIES.find((c) => c.name === user.country || c.flag === user.countryFlag);
      if (found) setEditCountry(found);
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find((l) => l.date === todayStr);
  const todayMinutes = todayLog?.totalMinutes || 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateProfile({
      name: editName.trim(),
      country: editCountry.name,
      countryFlag: editCountry.flag,
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    closeProfileModal();
  };

  const handleSwitchAccount = () => {
    closeProfileModal();
    openAuthModal('login');
  };

  const joinedDateStr = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      title="Student Profile & Account"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-lg shadow-indigo-500/30">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-2xl text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 text-lg" title={user.country || 'Global'}>
                {user.countryFlag || '⚡'}
              </span>
            </div>

            {/* Profile Info or Edit Form */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              {!isEditing ? (
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight truncate">
                      {user.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/50 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {user.email}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800">
                      <Globe className="w-3 h-3 text-indigo-400" />
                      {user.country || 'Global'}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      Member since {joinedDateStr}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Country &amp; Flag
                    </label>
                    <select
                      value={editCountry.code}
                      onChange={(e) => {
                        const found = COUNTRIES.find((c) => c.code === e.target.value);
                        if (found) setEditCountry(found);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Profile successfully updated in local storage!
            </div>
          )}
        </div>

        {/* Study Stats Snapshot */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Learning Achievements
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-1">
              <Flame className="w-4 h-4 text-amber-400 mx-auto fill-amber-400" />
              <div className="text-base font-bold font-mono text-white">{studyStreakDays}d</div>
              <div className="text-[10px] text-slate-400">Study Streak</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-1">
              <Timer className="w-4 h-4 text-indigo-400 mx-auto" />
              <div className="text-base font-bold font-mono text-white">{todayMinutes}m</div>
              <div className="text-[10px] text-slate-400">Today Focused</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-1">
              <FileText className="w-4 h-4 text-purple-400 mx-auto" />
              <div className="text-base font-bold font-mono text-white">{notes.length}</div>
              <div className="text-[10px] text-slate-400">Documents</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-1">
              <Brain className="w-4 h-4 text-pink-400 mx-auto" />
              <div className="text-base font-bold font-mono text-white">{flashcards.length}</div>
              <div className="text-[10px] text-slate-400">Cards Synced</div>
            </div>
          </div>
        </div>

        {/* Account Switcher / Other Saved Accounts */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Switch Saved Profile
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {registeredUsers.map((u) => {
              const isCurrent = u.email === user.email;
              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => {
                    quickDemoLogin(u.email);
                    closeProfileModal();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 cursor-default'
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{u.countryFlag || '⚡'}</span>
                      <span className="truncate">{u.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                  </div>
                  {isCurrent && <UserCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" /> Log In with Another Account
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </Modal>
  );
};

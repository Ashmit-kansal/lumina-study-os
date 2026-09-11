import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../common/ProgressBar';
import {
  TrendingUp,
  Clock,
  Flame,
  Brain,
  Trophy,
  Calendar,
  BarChart3,
  PieChart,
  CheckCircle2,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { subjects, dailyLogs, completedSessions, flashcards, studyStreakDays } = useApp();

  // Compute lifetime totals
  const totalStudiedSeconds = subjects.reduce((acc, s) => acc + s.totalSecondsStudied, 0);
  const totalStudiedHours = (totalStudiedSeconds / 3600).toFixed(1);
  const totalCompletedSessions = completedSessions.length + 32; // Include historical seed
  const totalCardsReviewed = dailyLogs.reduce((acc, l) => acc + (l.cardsReviewed || 0), 0);

  // Past 7 Days Graph
  const todayStr = new Date().toISOString().split('T')[0];
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const log = dailyLogs.find((l) => l.date === dStr);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    return {
      date: dStr,
      label: `${dayLabel} ${dayNum}`,
      minutes: log?.totalMinutes || 0,
      hours: ((log?.totalMinutes || 0) / 60).toFixed(1),
      isToday: dStr === todayStr,
    };
  });

  const maxMins = Math.max(...past7Days.map((d) => d.minutes), 120);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Study Analytics & Retention Insights</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive breakdown of your focus sessions, subject time distribution, and memory mastery
        </p>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Hours */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Study Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">{totalStudiedHours}h</div>
          <p className="text-[11px] text-slate-400">Across all subjects</p>
        </div>

        {/* Focus Streak */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">{studyStreakDays} Days</div>
          <p className="text-[11px] text-slate-400">Consistent daily study</p>
        </div>

        {/* Sessions Completed */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Focus Blocks</span>
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-purple-400">{totalCompletedSessions}</div>
          <p className="text-[11px] text-slate-400">Completed pomodoros</p>
        </div>

        {/* Cards Reviewed */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Cards Recalled</span>
            <Brain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">{totalCardsReviewed}</div>
          <p className="text-[11px] text-slate-400">SM-2 memory reviews</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Study Bar Chart (col-span-7) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Daily Focus Distribution
              </h3>
              <p className="text-xs text-slate-400">Total study hours recorded per day</p>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {past7Days.map((d, i) => {
              const heightPercent = Math.max(10, (d.minutes / maxMins) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold group-hover:text-indigo-300 transition-colors">
                    {d.hours}h
                  </span>
                  <div className="w-full bg-slate-800/80 rounded-t-xl h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-700 ${
                        d.isToday
                          ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs ${d.isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Breakdown (col-span-5) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" /> Subject Time Share
            </h3>
            <p className="text-xs text-slate-400">Total hours studied across subjects</p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {subjects.map((sub) => {
              const subHours = (sub.totalSecondsStudied / 3600).toFixed(1);
              const percentage = totalStudiedSeconds > 0
                ? (sub.totalSecondsStudied / totalStudiedSeconds) * 100
                : 0;

              return (
                <div key={sub.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${sub.color}`} />
                      <span className="font-semibold text-slate-200">{sub.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">
                      <strong className="text-indigo-300">{subHours}h</strong> ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    max={100}
                    heightClass="h-1.5"
                    colorClass={`bg-gradient-to-r ${sub.color}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

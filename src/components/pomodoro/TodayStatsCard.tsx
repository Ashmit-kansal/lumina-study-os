import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Clock, Trophy, Target, TrendingUp } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const TodayStatsCard: React.FC = () => {
  const { subjects, dailyLogs, completedSessions, studyStreakDays } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find((l) => l.date === todayStr);

  const todayMinutes = todayLog?.totalMinutes || 0;
  const todayHours = (todayMinutes / 60).toFixed(1);
  const todayCompletedSessions = todayLog?.completedSessions || 0;

  // Calculate past 7 days chart
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const log = dailyLogs.find((l) => l.date === dStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    return {
      date: dStr,
      dayName,
      minutes: log?.totalMinutes || 0,
      isToday: dStr === todayStr,
    };
  });

  const maxDailyMins = Math.max(...past7Days.map((d) => d.minutes), 120);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
      {/* 1. Daily Summary Card */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Focus</span>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 fill-amber-400" /> {studyStreakDays} Day Streak
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{todayHours}</span>
            <span className="text-sm font-medium text-slate-400">hours studied</span>
          </div>
          <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {todayCompletedSessions} focus sessions completed
          </div>
        </div>

        {/* 7-Day Mini Chart */}
        <div>
          <div className="text-[11px] text-slate-400 font-medium mb-2">Past 7 Days Trend</div>
          <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
            {past7Days.map((day, idx) => {
              const heightPercent = Math.max(8, (day.minutes / maxDailyMins) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-slate-800/80 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-purple-500 shadow-sm shadow-indigo-500/50'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${day.date}: ${day.minutes} mins`}
                    />
                  </div>
                  <span className={`text-[10px] ${day.isToday ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Active Subjects Progress */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 md:col-span-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Subject Weekly Targets
          </span>
          <span className="text-xs text-slate-500">{subjects.length} active subjects</span>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const studiedHours = sub.totalSecondsStudied / 3600;
            const targetHours = sub.targetHoursPerWeek || 10;
            const percent = Math.min(100, (studiedHours / targetHours) * 100);

            return (
              <div key={sub.id} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${sub.color}`} />
                    <span className="text-slate-200 font-semibold">{sub.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    <strong className="text-indigo-400">{studiedHours.toFixed(1)}h</strong> / {targetHours}h
                  </span>
                </div>
                <ProgressBar
                  value={percent}
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
  );
};

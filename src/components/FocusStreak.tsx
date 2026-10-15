import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Sparkles,
  Settings2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StreakData, DayStreakStatus, getLast7DaysStatus } from '../utils/logic';

interface FocusStreakProps {
  streakData: StreakData;
  onUpdateDailyGoal: (newGoal: number) => void;
  todayCompletedCount: number;
}

export const FocusStreak: React.FC<FocusStreakProps> = ({
  streakData,
  onUpdateDailyGoal,
  todayCompletedCount,
}) => {
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  const goal = streakData.dailyGoal || 4;
  const progressRatio = Math.min(1, todayCompletedCount / goal);
  const progressPercent = Math.round(progressRatio * 100);
  const isGoalAchieved = todayCompletedCount >= goal;
  const days: DayStreakStatus[] = getLast7DaysStatus(streakData.history, goal);

  return (
    <div
      data-testid="focus-streak-indicator"
      className="glass-panel p-5 sm:p-6 w-full flex flex-col gap-4 relative overflow-hidden transition-all duration-300"
    >
      {/* Background ambient decorative flame glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#ff7e6b]/15 via-[#ffb88c]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Main Top Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Streak Flame & Title */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              streakData.currentStreak > 0
                ? 'bg-gradient-to-br from-[#ff7e6b]/30 to-[#ffb88c]/20 border-[#ff7e6b]/50 shadow-lg shadow-[#ff7e6b]/25'
                : 'bg-white/5 border-white/10 text-[#8b90d6]'
            }`}
          >
            <Flame
              className={`w-6 h-6 transition-transform ${
                streakData.currentStreak > 0
                  ? 'text-[#ff7e6b] fill-[#ff7e6b] animate-pulse scale-110'
                  : 'text-[#8b90d6]'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {streakData.currentStreak > 0
                  ? `${streakData.currentStreak} Day${streakData.currentStreak > 1 ? 's' : ''} Focus Streak`
                  : 'Start Your Focus Streak'}
              </span>
              {streakData.currentStreak > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#ff7e6b]/20 text-[#ffb88c] border border-[#ff7e6b]/30">
                  On Fire 🔥
                </span>
              )}
            </div>

            <p className="text-xs text-[#b7b5d6] mt-0.5 flex items-center gap-2">
              <span>Hit your daily target of {goal} pomodoros to grow your streak.</span>
              {streakData.bestStreak > 0 && (
                <span className="inline-flex items-center gap-1 text-[#4ecdc4] font-medium">
                  <Trophy className="w-3 h-3" /> Best: {streakData.bestStreak}d
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Goal Action & Today's Status Badge */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {isGoalAchieved ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#4ecdc4]/15 border border-[#4ecdc4]/40 text-[#4ecdc4] text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#4ecdc4]/20 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Daily Goal Smashed!
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#b7b5d6] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb88c] animate-ping" />
              <span>
                <strong className="text-white">{goal - todayCompletedCount}</strong> more to keep streak
              </span>
            </div>
          )}

          <button
            onClick={() => setShowGoalSettings(!showGoalSettings)}
            aria-label="Adjust daily pomodoro goal"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#b7b5d6] hover:text-white border border-white/10 transition-colors"
            title="Configure Daily Goal"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Goal Adjustment Drawer (toggleable) */}
      {showGoalSettings && (
        <div className="p-3 rounded-xl bg-black/30 border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
          <span className="text-[#b7b5d6] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#ffb88c]" /> Set daily target:
          </span>
          <div className="flex items-center gap-1.5">
            {[2, 3, 4, 6, 8].map((g) => (
              <button
                key={g}
                onClick={() => onUpdateDailyGoal(g)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  goal === g
                    ? 'bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a] shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-[#b7b5d6] border border-white/10'
                }`}
              >
                {g} pomos
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Middle Row: Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#b7b5d6] font-medium flex items-center gap-1.5">
            Today's Progress:
            <strong className="text-white font-mono">{todayCompletedCount}</strong> /{' '}
            <span className="text-[#8b90d6]">{goal} pomodoros</span>
          </span>
          <span className="font-mono text-[#ffb88c] font-semibold">{progressPercent}%</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGoalAchieved
                ? 'bg-gradient-to-r from-[#4ecdc4] to-[#7ee8e0]'
                : 'bg-gradient-to-r from-[#ffb88c] via-[#ff7e6b] to-[#ffb88c] bg-[length:200%_100%] animate-shimmer'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Row: 7-Day Mini Calendar Strip */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        {days.map((d) => (
          <div
            key={d.dateKey}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 min-w-[50px] transition-all border ${
              d.isToday
                ? 'bg-white/10 border-[#ffb88c]/40 shadow-sm'
                : d.goalMet
                ? 'bg-[#4ecdc4]/10 border-[#4ecdc4]/30'
                : 'bg-white/2 border-white/5 opacity-80'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                d.isToday ? 'text-[#ffb88c]' : 'text-[#8b90d6]'
              }`}
            >
              {d.dayLabel}
            </span>

            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs">
              {d.goalMet ? (
                <Flame className="w-4 h-4 text-[#ff7e6b] fill-[#ff7e6b]" />
              ) : d.count > 0 ? (
                <span className="font-mono font-bold text-white text-[11px]">{d.count}</span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              )}
            </div>

            <span className="text-[9px] text-[#b7b5d6] mt-0.5">
              {d.count > 0 ? `${d.count} done` : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

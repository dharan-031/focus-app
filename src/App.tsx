import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Keyboard,
  Maximize2,
  Flame,
  CheckCircle2,
  HelpCircle,
  Clock,
  Heart,
} from 'lucide-react';
import { TimerCard } from './components/TimerCard';
import { TaskPlanner } from './components/TaskPlanner';
import { ProcrastinationRescue } from './components/ProcrastinationRescue';
import { AnalyticsCard } from './components/AnalyticsCard';
import { AmbientSoundscape } from './components/AmbientSoundscape';
import { ZenOverlay } from './components/ZenOverlay';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FocusStreak } from './components/FocusStreak';
import {
  TimerMode,
  Task,
  DistractionLog,
  StreakData,
  createDefaultStreakData,
  evaluateStreakOnLoad,
  recordCompletedSessionInStreak,
  getTodayDateKey,
} from './utils/logic';
import { soundEngine } from './utils/audio';
import { triggerConfetti } from './utils/confetti';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    text: 'Write 1 single messy paragraph',
    done: false,
    isPriority: true,
    pomodorosEstimated: 1,
    pomodorosCompleted: 0,
    createdAt: Date.now() - 60000,
  },
  {
    id: '2',
    text: 'Review 3 references without self-criticism',
    done: false,
    isPriority: false,
    pomodorosEstimated: 1,
    pomodorosCompleted: 0,
    createdAt: Date.now() - 30000,
  },
];

export default function App() {
  // Timer State
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusLengthMinutes, setFocusLengthMinutes] = useState<number>(25);
  const [shortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes] = useState<number>(15);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Task & Stats State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('focus_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return INITIAL_TASKS[0]?.id || null;
  });

  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    const s = localStorage.getItem('focus_sessions_today');
    return s ? parseInt(s, 10) : 0;
  });

  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => {
    const s = localStorage.getItem('focus_minutes_today');
    return s ? parseInt(s, 10) : 0;
  });

  const [distractions, setDistractions] = useState<DistractionLog[]>(() => {
    try {
      const s = localStorage.getItem('focus_distractions');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Focus Streak State stored in localStorage
  const [streakData, setStreakData] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem('focus_streak_data');
      if (saved) {
        return evaluateStreakOnLoad(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return createDefaultStreakData();
  });

  // UI States
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Current session duration
  const totalSeconds =
    mode === 'focus'
      ? focusLengthMinutes * 60
      : mode === 'shortBreak'
      ? shortBreakMinutes * 60
      : longBreakMinutes * 60;

  // Persist tasks, stats & streak
  useEffect(() => {
    try {
      localStorage.setItem('focus_tasks', JSON.stringify(tasks));
      localStorage.setItem('focus_sessions_today', completedSessions.toString());
      localStorage.setItem('focus_minutes_today', totalFocusMinutes.toString());
      localStorage.setItem('focus_distractions', JSON.stringify(distractions));
      localStorage.setItem('focus_streak_data', JSON.stringify(streakData));
    } catch {
      // Ignore local storage error
    }
  }, [tasks, completedSessions, totalFocusMinutes, distractions, streakData]);

  // Adjust remaining time whenever focus length or mode changes while stopped
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  // Switch mode handler
  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const secs =
      newMode === 'focus'
        ? focusLengthMinutes * 60
        : newMode === 'shortBreak'
        ? shortBreakMinutes * 60
        : longBreakMinutes * 60;
    setRemainingSeconds(secs);
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Timer Completed!
            if (soundEnabled) {
              soundEngine.playCompletionChime();
            }
            triggerConfetti();

            if (modeRef.current === 'focus') {
              setCompletedSessions((c) => c + 1);
              setTotalFocusMinutes((m) => m + focusLengthMinutes);

              // Update focus streak in localStorage
              setStreakData((prevStreak) => {
                const { updated, goalJustAchieved } = recordCompletedSessionInStreak(prevStreak);
                if (goalJustAchieved && soundEnabled) {
                  soundEngine.playCompletionChime();
                }
                return updated;
              });

              // Update active task pomodoros
              if (activeTaskId) {
                setTasks((prevTasks) =>
                  prevTasks.map((t) =>
                    t.id === activeTaskId
                      ? { ...t, pomodorosCompleted: (t.pomodorosCompleted || 0) + 1 }
                      : t
                  )
                );
              }

              // Auto switch to short break or long break
              const nextMode = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
              setMode(nextMode);
              return nextMode === 'longBreak' ? longBreakMinutes * 60 : shortBreakMinutes * 60;
            } else {
              setMode('focus');
              return focusLengthMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, soundEnabled, focusLengthMinutes, shortBreakMinutes, longBreakMinutes, activeTaskId, completedSessions]);

  // Document Title update
  useEffect(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    const timeStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    const prefix = isRunning ? `${timeStr} · ` : '';
    document.title = `${prefix}Focus Studio · Anti-Procrastination Flow`;
  }, [remainingSeconds, isRunning]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        setIsRunning(false);
        setRemainingSeconds(totalSeconds);
      } else if (e.key === 's' || e.key === 'S') {
        // Skip session
        setIsRunning(false);
        const next = mode === 'focus' ? 'shortBreak' : 'focus';
        handleSwitchMode(next);
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZenMode((z) => !z);
      } else if (e.key === 'm' || e.key === 'M') {
        soundEngine.toggleMute();
      } else if (e.key === '?') {
        setIsShortcutsOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, totalSeconds]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleSkip = () => {
    setIsRunning(false);
    const next = mode === 'focus' ? 'shortBreak' : 'focus';
    handleSwitchMode(next);
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    setRemainingSeconds((prev) => Math.max(10, prev + deltaSeconds));
  };

  const handleLogDistraction = (reason: string) => {
    const newLog: DistractionLog = {
      id: Date.now().toString(),
      reason,
      timestamp: Date.now(),
    };
    setDistractions((prev) => [newLog, ...prev]);
  };

  const handleClearStats = () => {
    setCompletedSessions(0);
    setTotalFocusMinutes(0);
    setDistractions([]);
  };

  // Launch quick sprint from anti-procrastination rescue
  const handleStartSprint = (durationMinutes: number, taskName: string) => {
    // Add task if not exists
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskName,
      done: false,
      isPriority: true,
      pomodorosEstimated: 1,
      pomodorosCompleted: 0,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskId(newTask.id);

    // Set duration & start
    setMode('focus');
    setFocusLengthMinutes(durationMinutes);
    setRemainingSeconds(durationMinutes * 60);
    setIsRunning(true);
  };

  const handleUpdateDailyGoal = (newGoal: number) => {
    setStreakData((prev) => ({
      ...prev,
      dailyGoal: newGoal,
    }));
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="min-h-screen text-[#f4f1ff] flex flex-col items-center px-4 py-8 sm:px-6 sm:py-12 relative selection:bg-[#ff7e6b] selection:text-white">
      {/* Top App Header */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#ffb88c] mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ff7e6b]" />
            Deep Work & Anti-Procrastination Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-shimmer">
            Focus Studio
          </h1>
          <p className="text-sm text-[#b7b5d6] mt-1 max-w-md">
            Small steps, short sprints, and gentle nudges against procrastination.
          </p>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#b7b5d6] hover:text-white transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsZenMode(true)}
            className="px-4 py-2 rounded-full border border-[#4ecdc4]/30 bg-[#4ecdc4]/10 hover:bg-[#4ecdc4]/20 text-[#4ecdc4] text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
            title="Zen Fullscreen Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Zen Mode
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Horizontally Full Focus Streak Indicator */}
        <div className="col-span-1 lg:col-span-12 w-full">
          <FocusStreak
            streakData={streakData}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            todayCompletedCount={streakData.history[getTodayDateKey()] || 0}
          />
        </div>

        {/* Left Column: Timer & Ambient Soundscape (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TimerCard
            mode={mode}
            setMode={handleSwitchMode}
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            isRunning={isRunning}
            onStartPause={handleStartPause}
            onReset={handleReset}
            onSkip={handleSkip}
            focusLengthMinutes={focusLengthMinutes}
            setFocusLengthMinutes={(mins) => {
              setFocusLengthMinutes(mins);
              if (!isRunning && mode === 'focus') {
                setRemainingSeconds(mins * 60);
              }
            }}
            activeTask={activeTask}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((s) => !s)}
            onOpenZen={() => setIsZenMode(true)}
            onAdjustTime={handleAdjustTime}
          />

          <AmbientSoundscape />
        </div>

        {/* Right Column: Next Small Step & Analytics & Procrastination Kit (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <TaskPlanner
            tasks={tasks}
            setTasks={setTasks}
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
          />

          <AnalyticsCard
            completedSessions={completedSessions}
            totalFocusMinutes={totalFocusMinutes}
            distractions={distractions}
            onLogDistraction={handleLogDistraction}
            onClearStats={handleClearStats}
          />
        </div>

        {/* Full-width Bottom: Anti-Procrastination Emergency Kit */}
        <div className="lg:col-span-12">
          <ProcrastinationRescue onStartSprint={handleStartSprint} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8b90d6] gap-3">
        <p>Your session history and micro-steps are saved locally in your browser.</p>
        <p className="flex items-center gap-1.5">
          Crafted for intentional focus <Heart className="w-3.5 h-3.5 text-[#ff7e6b] fill-current" />
        </p>
      </footer>

      {/* Zen Fullscreen Overlay */}
      {isZenMode && (
        <ZenOverlay
          mode={mode}
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          onStartPause={handleStartPause}
          onReset={handleReset}
          onSkip={handleSkip}
          onClose={() => setIsZenMode(false)}
          activeTask={activeTask}
          onCompleteTask={(task) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, done: true } : t))
            );
          }}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

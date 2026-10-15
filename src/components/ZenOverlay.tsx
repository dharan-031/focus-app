import React, { useEffect } from 'react';
import {
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TimerMode, Task, formatTime, calculateProgressOffset } from '../utils/logic';
import { soundEngine } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface ZenOverlayProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onClose: () => void;
  activeTask?: Task;
  onCompleteTask?: (task: Task) => void;
}

export const ZenOverlay: React.FC<ZenOverlayProps> = ({
  mode,
  remainingSeconds,
  totalSeconds,
  isRunning,
  onStartPause,
  onReset,
  onSkip,
  onClose,
  activeTask,
  onCompleteTask,
}) => {
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = calculateProgressOffset(remainingSeconds, totalSeconds, circumference);

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';
  const modeTitle = mode === 'focus' ? 'Deep Work Flow' : mode === 'shortBreak' ? 'Short Break' : 'Restorative Break';

  // Listen for Escape key to exit Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        onStartPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onStartPause]);

  const handleFinishTask = (e: React.MouseEvent) => {
    if (!activeTask || !onCompleteTask) return;
    soundEngine.playTaskSuccess();
    triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
    onCompleteTask(activeTask);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0f28]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-12 text-white animate-fade-in">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ecdc4] animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#8b90d6] font-semibold">
            Zen Mode · Press ESC to exit
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Exit Zen Mode"
          className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-[#b7b5d6] hover:text-white flex items-center gap-2 transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
          Exit Zen
        </button>
      </div>

      {/* Main Big Centerpiece */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center glow-ring mb-6">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 300 300"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="zenFocusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffb88c" />
                <stop offset="100%" stopColor="#ff7e6b" />
              </linearGradient>
              <linearGradient id="zenBreakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ecdc4" />
                <stop offset="100%" stopColor="#7ee8e0" />
              </linearGradient>
            </defs>

            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke="#2a2e6b"
              strokeWidth="12"
              className="opacity-30"
            />
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke={isBreak ? 'url(#zenBreakGrad)' : 'url(#zenFocusGrad)'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
            <span className="text-xs uppercase tracking-widest text-[#b7b5d6] font-semibold mb-2">
              {modeTitle}
            </span>
            <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white font-mono drop-shadow-lg">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs text-[#8b90d6] mt-3">
              {isRunning ? 'Flow state active' : 'Paused · Hit Space to start'}
            </span>
          </div>
        </div>

        {/* Current Active Step Callout */}
        {activeTask && (
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#ffb88c] block">
                Single Focus Goal
              </span>
              <p className="text-sm font-medium text-white truncate mt-0.5">{activeTask.text}</p>
            </div>
            {!activeTask.done && onCompleteTask && (
              <button
                onClick={handleFinishTask}
                className="px-3 py-1.5 rounded-lg bg-[#4ecdc4]/20 hover:bg-[#4ecdc4]/30 border border-[#4ecdc4]/40 text-[#4ecdc4] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done!
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          aria-label="Reset timer"
          className="p-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-transform hover:scale-105"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onStartPause}
          className={`px-8 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-xl ${
            isRunning
              ? 'bg-white/15 text-white border border-white/20'
              : isBreak
              ? 'bg-gradient-to-r from-[#4ecdc4] to-[#7ee8e0] text-[#14163a]'
              : 'bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Resume
            </>
          )}
        </button>

        <button
          onClick={onSkip}
          aria-label="Skip session"
          className="p-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-transform hover:scale-105"
          title="Skip"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

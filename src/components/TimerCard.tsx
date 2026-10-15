import React, { useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Coffee,
  Brain,
  Sliders,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { TimerMode, Task, formatTime, calculateProgressOffset } from '../utils/logic';

interface TimerCardProps {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  focusLengthMinutes: number;
  setFocusLengthMinutes: (mins: number) => void;
  activeTask?: Task;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenZen: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  strictLockEnabled: boolean;
  onToggleStrictLock: () => void;
}

export const TimerCard: React.FC<TimerCardProps> = ({
  mode,
  setMode,
  remainingSeconds,
  totalSeconds,
  isRunning,
  onStartPause,
  onReset,
  onSkip,
  focusLengthMinutes,
  setFocusLengthMinutes,
  activeTask,
  soundEnabled,
  onToggleSound,
  onOpenZen,
  onAdjustTime,
  strictLockEnabled,
  onToggleStrictLock,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = calculateProgressOffset(remainingSeconds, totalSeconds, circumference);

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';
  const modeTitle = mode === 'focus' ? 'Deep Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';

  // 3D Card tilt on mouse move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
  };

  const handlePointerLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="glass-panel p-6 sm:p-8 flex flex-col items-center relative transition-all duration-300"
    >
      {/* Top action toolbar */}
      <div className="w-full flex items-center justify-between mb-4">
        {/* Mode selector pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setMode('focus')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a] shadow-md font-semibold'
                : 'text-[#b7b5d6] hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Focus
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              mode === 'shortBreak'
                ? 'bg-gradient-to-r from-[#4ecdc4] to-[#7ee8e0] text-[#14163a] shadow-md font-semibold'
                : 'text-[#b7b5d6] hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Short Break
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              mode === 'longBreak'
                ? 'bg-gradient-to-r from-[#8b90d6] to-[#b7b5d6] text-[#14163a] shadow-md font-semibold'
                : 'text-[#b7b5d6] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Long Break
          </button>
        </div>

        {/* Audio, Lock, and Zen buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStrictLock}
            aria-label={strictLockEnabled ? 'Disable Deep Lock Guard' : 'Enable Deep Lock Guard'}
            className={`p-2 rounded-full border transition-all ${
              strictLockEnabled
                ? 'border-[#ff7e6b]/40 bg-[#ff7e6b]/20 text-[#ffb88c] shadow-sm shadow-[#ff7e6b]/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10 text-[#b7b5d6] hover:text-white'
            }`}
            title={
              strictLockEnabled
                ? 'Deep Lock Guard: ACTIVE (blocks leaving page & monitors tab switching)'
                : 'Deep Lock Guard: OFF (click to guard workspace from exits and tab switching)'
            }
          >
            {strictLockEnabled ? <Lock className="w-4 h-4 text-[#ff7e6b]" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#b7b5d6] hover:text-white transition-colors"
            title={soundEnabled ? 'Sound is ON' : 'Sound is MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#4ecdc4]" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenZen}
            aria-label="Enter Zen Fullscreen mode"
            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#b7b5d6] hover:text-white transition-colors"
            title="Zen Fullscreen View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center glow-ring">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 240 240"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffb88c" />
              <stop offset="100%" stopColor="#ff7e6b" />
            </linearGradient>
            <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ecdc4" />
              <stop offset="100%" stopColor="#7ee8e0" />
            </linearGradient>
          </defs>
          {/* Background track circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#2a2e6b"
            strokeWidth="11"
            className="opacity-40"
          />
          {/* Progress circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={isBreak ? 'url(#breakGrad)' : 'url(#focusGrad)'}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-xs uppercase tracking-widest text-[#b7b5d6] font-semibold mb-1">
            {modeTitle}
          </span>
          <span
            data-testid="timer-display"
            className="text-5xl sm:text-6xl font-bold tracking-tight text-white font-mono drop-shadow-md"
          >
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-xs text-[#8b90d6] mt-2 flex items-center gap-1 font-medium">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-[#4ecdc4]">
                <span className="w-2 h-2 rounded-full bg-[#4ecdc4] animate-ping" />
                In progress
              </span>
            ) : (
              'Ready'
            )}
          </span>

          {isRunning && mode === 'focus' && strictLockEnabled && (
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ff7e6b]/20 text-[#ffb88c] border border-[#ff7e6b]/30 flex items-center gap-1 shadow-sm">
              <Lock className="w-3 h-3 text-[#ff7e6b]" />
              Locked · Exit Guard
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
        <button
          onClick={onStartPause}
          className={`px-8 py-3.5 rounded-full font-bold text-base flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg ${
            isRunning
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
              : isBreak
              ? 'bg-gradient-to-r from-[#4ecdc4] to-[#7ee8e0] text-[#14163a] shadow-[#4ecdc4]/20 hover:shadow-[#4ecdc4]/40'
              : 'bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a] shadow-[#ff7e6b]/30 hover:shadow-[#ff7e6b]/50'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Start Focus
            </>
          )}
        </button>

        <button
          onClick={onReset}
          aria-label="Reset timer"
          className="p-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-[#f4f1ff] transition-all hover:-translate-y-0.5"
          title="Reset session"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onSkip}
          aria-label="Skip to next session"
          className="p-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-[#f4f1ff] transition-all hover:-translate-y-0.5"
          title="Skip session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Quick time adjustment buttons */}
      <div className="flex items-center gap-2 mt-4 text-xs text-[#b7b5d6]">
        <button
          onClick={() => onAdjustTime(-300)}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Minus 5 minutes"
        >
          -5 min
        </button>
        <button
          onClick={() => onAdjustTime(60)}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Plus 1 minute"
        >
          +1 min
        </button>
        <button
          onClick={() => onAdjustTime(300)}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Plus 5 minutes"
        >
          +5 min
        </button>
      </div>

      {/* Settings bar */}
      <div className="mt-5 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-[#b7b5d6]">
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#ffb88c]" />
          Focus duration:
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={120}
            value={focusLengthMinutes}
            onChange={(e) => setFocusLengthMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 25)))}
            disabled={isRunning}
            className="w-14 px-2 py-1 text-center bg-white/5 border border-white/15 rounded-lg text-white font-medium focus:outline-none focus:border-[#4ecdc4] disabled:opacity-50"
          />
          <span>mins</span>
        </div>
      </div>

      {/* Deep Lock Guard Control Bar */}
      <div className="mt-3 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#b7b5d6]">
          <ShieldCheck className={`w-3.5 h-3.5 ${strictLockEnabled ? 'text-[#ff7e6b]' : 'text-[#8b90d6]'}`} />
          <span>Exit & Tab-Switch Guard:</span>
        </div>
        <button
          onClick={onToggleStrictLock}
          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            strictLockEnabled
              ? 'bg-[#ff7e6b]/20 text-[#ffb88c] border-[#ff7e6b]/40 shadow-sm shadow-[#ff7e6b]/20'
              : 'bg-white/5 text-[#b7b5d6] border-white/10 hover:text-white'
          }`}
        >
          {strictLockEnabled ? (
            <>
              <Lock className="w-3 h-3 text-[#ff7e6b]" />
              Active (Guarded)
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3" />
              Disabled
            </>
          )}
        </button>
      </div>

      {/* Current Active Micro-Step Notice */}
      {activeTask && (
        <div className="mt-4 w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/15 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff7e6b] animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-[#ffb88c] font-semibold">Current Micro-Step</div>
            <div className="text-sm font-medium text-white truncate">{activeTask.text}</div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Compass,
} from 'lucide-react';
import { formatAwayTime } from '../utils/logic';

interface FocusLockAlertProps {
  isOpen: boolean;
  awaySeconds: number;
  onDismiss: () => void;
  activeTaskText?: string;
}

export const FocusLockAlert: React.FC<FocusLockAlertProps> = ({
  isOpen,
  awaySeconds,
  onDismiss,
  activeTaskText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0f28]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel p-6 sm:p-8 max-w-lg w-full bg-[#14163a] border-white/20 shadow-2xl rounded-3xl flex flex-col gap-5 text-white">
        {/* Header with glowing shield */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7e6b]/20 border border-[#ff7e6b]/40 flex items-center justify-center text-[#ff7e6b] shadow-lg shadow-[#ff7e6b]/20 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#ffb88c]">
              Attention Drift Detected
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Focus Lock: Tab Switch Logged
            </h3>
          </div>
        </div>

        {/* Away metric callout */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#4ecdc4]" />
            <span className="text-xs text-[#b7b5d6]">Time away from workspace:</span>
          </div>
          <span className="text-base font-extrabold text-[#ff7e6b] font-mono">
            {formatAwayTime(awaySeconds)}
          </span>
        </div>

        {/* Psychological Reframing */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 text-xs text-[#b7b5d6] leading-relaxed">
          <p className="font-semibold text-white mb-1">Why did this happen?</p>
          <p>
            The urge to open another tab or check apps is a normal reaction to cognitive resistance.
            Recognize the urge without self-criticism, take one slow breath, and refocus on your micro-step.
          </p>
        </div>

        {activeTaskText && (
          <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2 text-xs">
            <span className="text-[#ffb88c] font-semibold shrink-0">Your single mission:</span>
            <span className="text-white truncate font-medium">"{activeTaskText}"</span>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onDismiss}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a] font-bold text-sm shadow-lg shadow-[#ff7e6b]/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Resume Deep Flow
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

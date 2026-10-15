import React, { useState } from 'react';
import {
  LifeBuoy,
  Zap,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Flame,
  ShieldAlert,
  ArrowRight,
  Smile,
} from 'lucide-react';
import {
  PROCRASTINATION_REASONS,
  getDiagnosticRecommendation,
  getRandomNudge,
  DiagnosticResult,
} from '../utils/logic';
import { soundEngine } from '../utils/audio';

interface ProcrastinationRescueProps {
  onStartSprint: (durationMinutes: number, taskName: string) => void;
}

export const ProcrastinationRescue: React.FC<ProcrastinationRescueProps> = ({
  onStartSprint,
}) => {
  const [selectedBlocker, setSelectedBlocker] = useState<string>('overwhelmed');
  const [currentNudge, setCurrentNudge] = useState<{ text: string; index: number }>(() => getRandomNudge());
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const recommendation: DiagnosticResult = getDiagnosticRecommendation(selectedBlocker);

  const handleNextNudge = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrentNudge(getRandomNudge(currentNudge.index));
      setIsRotating(false);
    }, 200);
  };

  const handleCopyNudge = () => {
    navigator.clipboard.writeText(currentNudge.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdoptMicroStep = () => {
    soundEngine.playTick();
    onStartSprint(recommendation.suggestedDurationMinutes, recommendation.sampleStep);
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#ffb88c] flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-[#ff7e6b]" />
            Anti-Procrastination Toolkit
          </h2>
          <p className="text-xs text-[#b7b5d6] mt-0.5">
            Diagnose resistance, shrink intimidation, and ignite instant momentum.
          </p>
        </div>
      </div>

      {/* Blocker Diagnostic Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#8b90d6]">
          What is causing resistance right now?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(PROCRASTINATION_REASONS).map(([key, item]) => {
            const isSelected = selectedBlocker === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedBlocker(key)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'border-[#ff7e6b] bg-[#ff7e6b]/15 text-white shadow-md shadow-[#ff7e6b]/15 scale-[1.02]'
                    : 'border-white/10 bg-white/5 text-[#b7b5d6] hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs sm:text-sm">{item.category}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#ff7e6b]" />}
                </div>
                <span className="text-[11px] opacity-75 line-clamp-1">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prescribed Solution Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#4ecdc4]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#4ecdc4]">
              Rx: {recommendation.strategy}
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-[#ffb88c] font-medium border border-white/10">
            {recommendation.suggestedDurationMinutes}-min sprint
          </span>
        </div>

        <p className="text-sm text-[#f4f1ff] leading-relaxed font-normal">
          {recommendation.actionPrompt}
        </p>

        <div className="p-3 rounded-xl bg-black/25 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#ffb88c] shrink-0">Prescribed Step:</span>
            <span className="text-white italic">"{recommendation.sampleStep}"</span>
          </div>
          <button
            onClick={handleAdoptMicroStep}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a] font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#ff7e6b]/20"
          >
            Launch This Sprint
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The 6 Core Anti-Procrastination Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white/5 border-l-4 border-[#ff7e6b] border-t border-r border-b border-white/10 hover:bg-white/10 transition-colors">
          <h3 className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
            <span className="text-base">🪜</span> Shrink the Task
          </h3>
          <p className="text-[11px] text-[#b7b5d6] leading-relaxed">
            Break it down until you can do it in 2 minutes. "Write paper" becomes "type 1 ugly headline."
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border-l-4 border-[#4ecdc4] border-t border-r border-b border-white/10 hover:bg-white/10 transition-colors">
          <h3 className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
            <span className="text-base">⏱️</span> The 2-Minute Rule
          </h3>
          <p className="text-[11px] text-[#b7b5d6] leading-relaxed">
            Commit to starting for just 120 seconds. Friction evaporates once your hands are moving.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border-l-4 border-[#ffb88c] border-t border-r border-b border-white/10 hover:bg-white/10 transition-colors">
          <h3 className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
            <span className="text-base">💛</span> Radical Self-Kindness
          </h3>
          <p className="text-[11px] text-[#b7b5d6] leading-relaxed">
            Guilt and shame worsen procrastination. Acknowledge the slip, smile, and restart without drama.
          </p>
        </div>
      </div>

      {/* Dynamic Nudge / Instant Tip Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#4ecdc4]/15 to-[#ff7e6b]/15 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#ffb88c] shrink-0" />
          <p
            className={`text-sm text-[#f4f1ff] font-medium transition-opacity duration-200 ${
              isRotating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentNudge.text}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyNudge}
            aria-label="Copy tip to clipboard"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-[#b7b5d6] hover:text-white transition-colors"
            title="Copy tip"
          >
            {copied ? <Check className="w-4 h-4 text-[#4ecdc4]" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleNextNudge}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            Another Tip
          </button>
        </div>
      </div>
    </div>
  );
};

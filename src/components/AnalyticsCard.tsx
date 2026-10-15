import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Zap,
  Plus,
  History,
  X,
} from 'lucide-react';
import { DistractionLog, calculateEfficiency } from '../utils/logic';
import { soundEngine } from '../utils/audio';

interface AnalyticsCardProps {
  completedSessions: number;
  totalFocusMinutes: number;
  distractions: DistractionLog[];
  onLogDistraction: (reason: string) => void;
  onClearStats: () => void;
}

const DISTRACTION_TAGS = [
  '📱 Phone notification',
  '🌐 Social media / YouTube',
  '✉️ Email / Slack ping',
  '💭 Mind wandering',
  '☕ Hunger / Thirst break',
  '👥 Colleague / Interruption',
];

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  completedSessions,
  totalFocusMinutes,
  distractions,
  onLogDistraction,
  onClearStats,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(DISTRACTION_TAGS[0]);
  const [customReason, setCustomReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const efficiency = calculateEfficiency(totalFocusMinutes, distractions.length);

  const handleConfirmDistraction = () => {
    const reason = customReason.trim() || selectedTag;
    soundEngine.playDistractionChime();
    onLogDistraction(reason);
    setCustomReason('');
    setShowLogModal(false);
  };

  return (
    <div className="glass-panel p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#ffb88c] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4ecdc4]" />
            Today's Flow & Focus
          </h2>
          <p className="text-xs text-[#b7b5d6] mt-0.5">
            Real metrics for mindful productivity, not toxic burnout.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#b7b5d6] hover:text-white flex items-center gap-1.5 transition-colors border border-white/10"
        >
          <History className="w-3.5 h-3.5" />
          {showHistory ? 'Hide Logs' : 'View Logs'}
        </button>
      </div>

      {/* Main 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Sessions Done */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
          <span className="text-3xl font-extrabold text-[#4ecdc4]">{completedSessions}</span>
          <span className="text-[11px] text-[#b7b5d6] font-medium mt-1">Sessions Done</span>
        </div>

        {/* Focus Minutes */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
          <span className="text-3xl font-extrabold text-[#ffb88c]">{totalFocusMinutes}</span>
          <span className="text-[11px] text-[#b7b5d6] font-medium mt-1">Focus Minutes</span>
        </div>

        {/* Distractions */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
          <span className="text-3xl font-extrabold text-[#ff7e6b]">{distractions.length}</span>
          <span className="text-[11px] text-[#b7b5d6] font-medium mt-1">Distractions</span>
        </div>

        {/* Flow Efficiency */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
          <span className="text-3xl font-extrabold text-[#7ee8e0]">{efficiency}%</span>
          <span className="text-[11px] text-[#b7b5d6] font-medium mt-1">Flow Score</span>
        </div>
      </div>

      {/* Distraction Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
        <button
          onClick={() => setShowLogModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#ff7e6b]/40 bg-[#ff7e6b]/15 hover:bg-[#ff7e6b]/25 text-[#ff7e6b] hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <AlertCircle className="w-4 h-4" />
          I Got Distracted (Log it)
        </button>

        <span className="text-xs text-[#8b90d6] text-center sm:text-right">
          {distractions.length === 0
            ? '✨ Zero interruptions logged. Pure flow!'
            : `Logged ${distractions.length} drift${distractions.length > 1 ? 's' : ''}. Recognizing drift is progress.`}
        </span>
      </div>

      {/* Distraction History Log Dropdown */}
      {showHistory && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#b7b5d6] uppercase tracking-wider">
              Distraction Log ({distractions.length})
            </span>
            {distractions.length > 0 && (
              <button
                onClick={onClearStats}
                className="text-[11px] text-red-300 hover:underline"
              >
                Reset stats
              </button>
            )}
          </div>

          {distractions.length === 0 ? (
            <p className="text-xs text-[#8b90d6] italic py-2">No distractions logged yet today.</p>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {distractions.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs"
                >
                  <span className="text-white truncate">{log.reason}</span>
                  <span className="text-[#8b90d6] text-[10px] shrink-0 ml-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal / Dialog for logging distraction */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full bg-[#181b49] border-white/20 shadow-2xl rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#ff7e6b]" />
                Notice the Drift Without Judgment
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg text-[#b7b5d6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b7b5d6]">
              Naming the distraction breaks the autopilot dopamine trance. What took your focus?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DISTRACTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedTag === tag
                      ? 'border-[#ff7e6b] bg-[#ff7e6b]/20 text-white font-medium'
                      : 'border-white/10 bg-white/5 text-[#b7b5d6] hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or write custom reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8b90d6]/60 focus:outline-none focus:border-[#4ecdc4]"
            />

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#b7b5d6] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDistraction}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ffb88c] to-[#ff7e6b] text-[#14163a] font-bold text-xs shadow-md shadow-[#ff7e6b]/30 hover:scale-105 active:scale-95 transition-transform"
              >
                Log & Return to Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

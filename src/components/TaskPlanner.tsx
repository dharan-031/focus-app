import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Star,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Task } from '../utils/logic';
import { soundEngine } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface TaskPlannerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
}

const MICRO_SUGGESTIONS = [
  'Write 1 messy sentence',
  'Open folder & read page 1',
  'Brainstorm 3 bullet ideas',
  'Draft email subject & opening',
  'Clear desktop of clutter',
];

export const TaskPlanner: React.FC<TaskPlannerProps> = ({
  tasks,
  setTasks,
  activeTaskId,
  setActiveTaskId,
}) => {
  const [inputText, setInputText] = useState('');
  const [estimatedPomos, setEstimatedPomos] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text,
      done: false,
      isPriority: tasks.length === 0,
      pomodorosEstimated: estimatedPomos,
      pomodorosCompleted: 0,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    if (!activeTaskId || tasks.length === 0) {
      setActiveTaskId(newTask.id);
    }
    setInputText('');
  };

  const handleToggleTask = (task: Task, e: React.MouseEvent) => {
    const isNowDone = !task.done;
    if (isNowDone) {
      soundEngine.playTaskSuccess();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: isNowDone } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      const remaining = tasks.filter((t) => t.id !== id && !t.done);
      setActiveTaskId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSelectActive = (id: string) => {
    setActiveTaskId(activeTaskId === id ? null : id);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#ffb88c] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ff7e6b]" />
            Next Small Step
          </h2>
          <p className="text-xs text-[#b7b5d6] mt-0.5">
            Break giants into bite-sized, 5-minute micro actions.
          </p>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-1 text-xs bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            <span className="text-[#4ecdc4] font-semibold">{completedCount}</span>
            <span className="text-[#b7b5d6]">/ {tasks.length} done</span>
          </div>
        )}
      </div>

      {/* Input row */}
      <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Open slide 3 and write the summary"
            maxLength={120}
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#b7b5d6]/50 focus:outline-none focus:border-[#4ecdc4] focus:ring-1 focus:ring-[#4ecdc4] transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4ecdc4] to-[#7ee8e0] text-[#14163a] font-bold text-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#4ecdc4]/20"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Micro suggestion chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[#8b90d6] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-[#ffb88c]" /> Quick ideas:
          </span>
          {MICRO_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInputText(sug)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#b7b5d6] hover:text-white transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </form>

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-white/15 text-white font-medium' : 'text-[#b7b5d6] hover:text-white'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'active' ? 'bg-white/15 text-white font-medium' : 'text-[#b7b5d6] hover:text-white'
              }`}
            >
              Active ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'done' ? 'bg-white/15 text-white font-medium' : 'text-[#b7b5d6] hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {completedCount > 0 && (
            <button
              onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
              className="text-[#ff7e6b] hover:underline text-[11px]"
            >
              Clear completed
            </button>
          )}
        </div>
      )}

      {/* Task list container */}
      <div className="flex-1 overflow-y-auto max-h-72 space-y-2 pr-1">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#b7b5d6] border border-dashed border-white/10 rounded-xl">
            <p className="font-medium text-white mb-1">Starting is the hardest hurdle.</p>
            <p className="max-w-xs mx-auto text-[#8b90d6]">
              Write one tiny, specific action above. Once you complete it, momentum will take care of the rest!
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                  task.done
                    ? 'bg-white/2 border-white/5 opacity-60'
                    : isActive
                    ? 'bg-gradient-to-r from-white/10 to-white/5 border-[#ffb88c]/40 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={(e) => handleToggleTask(task, e)}
                    aria-label={task.done ? `Mark "${task.text}" as incomplete` : `Mark "${task.text}" as complete`}
                    className="text-[#4ecdc4] shrink-0 hover:scale-110 transition-transform"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 fill-[#4ecdc4]/20 text-[#4ecdc4]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#8b90d6] hover:text-[#4ecdc4]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm block break-words ${
                        task.done ? 'line-through text-[#b7b5d6]' : 'text-white'
                      }`}
                    >
                      {task.text}
                    </span>
                    {isActive && !task.done && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#ffb88c] font-semibold mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb88c] animate-pulse" />
                        Active on Timer
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!task.done && (
                    <button
                      onClick={() => handleSelectActive(task.id)}
                      aria-label={isActive ? 'Unpin from timer HUD' : 'Pin to timer HUD'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#ffb88c]/50 bg-[#ffb88c]/15 text-[#ffb88c]'
                          : 'border-white/10 hover:border-white/20 text-[#8b90d6] hover:text-white'
                      }`}
                      title={isActive ? 'Active Task on Timer' : 'Pin as Active Task'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label={`Delete task ${task.text}`}
                    className="p-1.5 rounded-lg border border-white/10 hover:border-red-400/40 text-[#8b90d6] hover:text-[#ff7e6b] transition-colors"
                    title="Remove task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

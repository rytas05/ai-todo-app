"use client";

import { Task } from "@/types";

const priorityConfig = {
  high: {
    label: "高",
    bg: "bg-red-50",
    text: "text-red-600",
    badge: "bg-red-100 text-red-600",
    border: "border-red-100",
  },
  medium: {
    label: "中",
    bg: "bg-amber-50",
    text: "text-amber-600",
    badge: "bg-amber-100 text-amber-600",
    border: "border-amber-100",
  },
  low: {
    label: "低",
    bg: "bg-green-50",
    text: "text-green-600",
    badge: "bg-green-100 text-green-600",
    border: "border-green-100",
  },
};

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  const cfg = priorityConfig[task.priority];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        task.completed ? "opacity-50 bg-gray-50 border-gray-100" : `${cfg.bg} ${cfg.border}`
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
          task.completed
            ? "bg-gray-400 border-gray-400"
            : `border-current ${cfg.text} hover:scale-110`
        }`}
      >
        {task.completed && (
          <svg
            className="w-full h-full text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm ${
          task.completed ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {task.title}
      </span>

      {!task.completed && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}
        >
          {cfg.label}
        </span>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
        title="削除"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  );
}

"use client";

import { Task } from "@/types";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
}

const ORDER: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onClearCompleted,
}: Props) {
  const active = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500">
          📋 タスク ({active.length}件)
        </p>
        {completed.length > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            完了済みを削除 ({completed.length})
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm text-gray-300">タスクがありません</p>
          <p className="text-xs text-gray-200 mt-1">
            上のフォームから追加しましょう
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
          {completed.length > 0 && active.length > 0 && (
            <hr className="border-gray-100 my-3" />
          )}
          {completed.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

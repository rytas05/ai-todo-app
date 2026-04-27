"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types";
import { loadTasks, saveTasks } from "@/lib/storage";
import CalendarSection from "@/components/CalendarSection";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveTasks(tasks);
  }, [tasks, mounted]);

  const handleAdd = (newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <header className="text-center pb-2">
          <h1 className="text-2xl font-bold text-gray-800">AI Todo</h1>
          <p className="text-xs text-gray-400 mt-1">
            音声・テキストで賢くタスク管理
          </p>
        </header>

        <CalendarSection />
        <TaskInput onAdd={handleAdd} />
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onClearCompleted={handleClearCompleted}
        />
      </div>
    </main>
  );
}

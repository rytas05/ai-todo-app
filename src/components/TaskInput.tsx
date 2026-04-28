"use client";

import { useCallback, useRef, useState } from "react";
import { Task } from "@/types";
import VoiceRecorder from "./VoiceRecorder";
import { v4 as uuidv4 } from "uuid";

interface Props {
  onAdd: (tasks: Task[]) => void;
}

export default function TaskInput({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const textRef = useRef("");
  const submitRef = useRef<(input: string) => void>(() => {});

  const submit = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setProcessing(true);
    textRef.current = "";
    setText("");
    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      const newTasks: Task[] = (data.tasks || []).map(
        (t: { title: string; priority: Task["priority"] }) => ({
          id: uuidv4(),
          title: t.title,
          priority: t.priority,
          completed: false,
          createdAt: new Date().toISOString(),
        })
      );
      if (newTasks.length > 0) {
        onAdd(newTasks);
      }
    } catch {
      const fallback: Task = {
        id: uuidv4(),
        title: trimmed,
        priority: "medium",
        completed: false,
        createdAt: new Date().toISOString(),
      };
      onAdd([fallback]);
    } finally {
      setProcessing(false);
    }
  };

  submitRef.current = submit;

  const handleTranscript = useCallback((t: string) => {
    const next = textRef.current ? textRef.current + " " + t : t;
    textRef.current = next;
    setText(next);
  }, []);

  const handleVoiceEnd = useCallback(() => {
    const current = textRef.current;
    if (current.trim()) {
      submitRef.current(current);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textRef.current = text;
      submit(text);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    textRef.current = e.target.value;
    setText(e.target.value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-500 mb-3">
        ✏️ タスクを追加
      </p>
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="タスクを入力（Enter で追加）&#10;音声入力も可能です"
          rows={2}
          className="flex-1 resize-none text-sm text-gray-700 placeholder-gray-300 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          disabled={processing}
        />
        <div className="flex flex-col gap-2">
          <VoiceRecorder
            onTranscript={handleTranscript}
            onEnd={handleVoiceEnd}
            disabled={processing}
          />
          <button
            onClick={() => { textRef.current = text; submit(text); }}
            disabled={processing || !text.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 transition-all"
            title="追加"
          >
            {processing ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {processing && (
        <p className="text-xs text-indigo-400 mt-2 animate-pulse">
          AIがタスクを解析中...
        </p>
      )}
    </div>
  );
}

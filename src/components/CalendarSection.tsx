"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { CalendarEvent } from "@/types";

function formatTime(dateStr: string, isAllDay: boolean): string {
  if (isAllDay) return "終日";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function CalendarSection() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      fetch("/api/calendar")
        .then((r) => r.json())
        .then((data) => setEvents(data.events || []))
        .catch(() => setEvents([]))
        .finally(() => setLoading(false));
    }
  }, [session?.accessToken]);

  const todayEvents = events.filter((e) => isToday(e.start));
  const tomorrowEvents = events.filter((e) => !isToday(e.start));

  if (status === "loading") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              📅 Googleカレンダー
            </h2>
            <p className="text-xs text-gray-500">
              連携すると今日・明日の予定が表示されます
            </p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">📅 今日・明日の予定</h2>
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt=""
              className="w-6 h-6 rounded-full"
            />
          )}
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DayEvents label="今日" events={todayEvents} />
          <DayEvents label="明日" events={tomorrowEvents} />
        </div>
      )}
    </div>
  );
}

function DayEvents({
  label,
  events,
}: {
  label: string;
  events: CalendarEvent[];
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      {events.length === 0 ? (
        <p className="text-xs text-gray-300 italic">予定なし</p>
      ) : (
        <ul className="space-y-1.5">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-start gap-2 text-xs text-gray-600"
            >
              <span className="text-gray-400 shrink-0 w-10">
                {formatTime(ev.start, ev.isAllDay)}
              </span>
              <span className="truncate">{ev.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

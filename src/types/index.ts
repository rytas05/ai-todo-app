export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
  description?: string;
}

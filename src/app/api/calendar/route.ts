import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { CalendarEvent } from "@/types";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ events: [] }, { status: 200 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const events: CalendarEvent[] = (response.data.items || []).map((item) => {
      const isAllDay = !!item.start?.date;
      return {
        id: item.id || crypto.randomUUID(),
        title: item.summary || "（タイトルなし）",
        start: item.start?.dateTime || item.start?.date || "",
        end: item.end?.dateTime || item.end?.date || "",
        isAllDay,
        description: item.description || undefined,
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ events: [], error: "カレンダー取得失敗" });
  }
}

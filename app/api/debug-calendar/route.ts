// app/api/debug-calendar/route.ts
import { NextResponse } from "next/server";
import { getCalendar, calendarId } from "@/lib/googleClient";

export async function GET() {
  try {
    const calendar = await getCalendar();

    const res = await calendar.events.list({
      calendarId,
      maxResults: 5,
      singleEvents: true,
      orderBy: "startTime",
      timeMin: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      events: res.data.items ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[debug-calendar] error:", err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

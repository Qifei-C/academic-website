import { NextResponse } from "next/server";

import { calendarId, getCalendar } from "@/lib/googleClient";

type BookBody = {
  name?: string;
  email?: string;
  start?: string; // ISO
  end?: string; // ISO
  token?: string;
  type?: string;
  topic?: string;
  institution?: string;
  mode?: string;
  location?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_TOKEN = process.env.BOOKING_API_TOKEN || process.env.API_TOKEN || process.env.X_API_TOKEN;

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  let body: BookBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, start, end, token, type, topic, institution, mode, location } = body;

  if (!name || !email || !start || !end) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }
  if (API_TOKEN && token !== API_TOKEN) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
    return NextResponse.json({ ok: false, error: "Invalid time range" }, { status: 400 });
  }

  try {
    const calendar = await getCalendar();
    // Verify availability
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busy = fb.data.calendars?.[calendarId]?.busy || [];
    const hasConflict = busy.some((b) => {
      const bStart = new Date(b.start as string);
      const bEnd = new Date(b.end as string);
      return overlap(startDate, endDate, bStart, bEnd);
    });
    if (hasConflict) {
      return NextResponse.json({ ok: false, error: "Slot not available" }, { status: 409 });
    }

    const extraLines: string[] = [];
    if (topic) extraLines.push(`Notes: ${topic}`);
    if (type) extraLines.push(`Type: ${type}`);
    if (mode) extraLines.push(`Format: ${mode}`);
    if (institution) extraLines.push(`Institution: ${institution}`);
    if (location) extraLines.push(`Location: ${location}`);
    const description = ["Scheduled via personal site.", ...extraLines].join("\n");

    const res = await calendar.events.insert({
      calendarId,
      sendUpdates: "all",
      requestBody: {
        summary: `Meeting with ${name}`,
        description,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        attendees: [{ email }],
        location: location || undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      eventId: res.data.id,
      htmlLink: res.data.htmlLink,
    });
  } catch (error) {
    console.error("book error", error);
    return NextResponse.json({ ok: false, error: "Failed to create event" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}

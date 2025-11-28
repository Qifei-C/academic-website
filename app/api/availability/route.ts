import { addDays, addMinutes, endOfDay, isBefore, isValid, max, min, parseISO, setHours, setMinutes, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

import { calendarId, getCalendar } from "@/lib/googleClient";

const SLOT_MINUTES = 30;
const BUFFER_MINUTES = 10;
const WORK_START_HOUR = 14;
const WORK_END_HOUR = 18;
const DEFAULT_DAYS = 7;

function buildSlotsForDay(day: Date) {
  const slots: { start: Date; end: Date }[] = [];
  let cursor = setMinutes(setHours(startOfDay(day), WORK_START_HOUR), 0);
  const endOfWork = setMinutes(setHours(startOfDay(day), WORK_END_HOUR), 0);
  while (isBefore(cursor, endOfWork)) {
    const slotEnd = addMinutes(cursor, SLOT_MINUTES);
    if (slotEnd > endOfWork) break;
    slots.push({ start: cursor, end: slotEnd });
    cursor = addMinutes(slotEnd, BUFFER_MINUTES);
  }
  return slots;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const now = new Date();
  const parsedFrom = fromParam ? parseISO(fromParam) : startOfDay(now);
  const parsedTo = toParam ? parseISO(toParam) : endOfDay(addDays(now, DEFAULT_DAYS - 1));
  const from = isValid(parsedFrom) ? startOfDay(parsedFrom) : startOfDay(now);
  const to = isValid(parsedTo) ? endOfDay(parsedTo) : endOfDay(addDays(now, DEFAULT_DAYS - 1));

  try {
    const calendar = await getCalendar();
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busyBlocks = fb.data.calendars?.[calendarId]?.busy || [];

    const slots: { start: string; end: string }[] = [];
    const dayCursor = new Date(from);
    while (dayCursor <= to) {
      const daySlots = buildSlotsForDay(dayCursor);
      for (const slot of daySlots) {
        const clampedStart = max([slot.start, from]);
        const clampedEnd = min([slot.end, to]);
        if (clampedStart >= clampedEnd) continue;
        const isFree = !busyBlocks.some((b) => overlaps(clampedStart, clampedEnd, new Date(b.start as string), new Date(b.end as string)));
        if (isFree) {
          slots.push({ start: clampedStart.toISOString(), end: clampedEnd.toISOString() });
        }
      }
      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    return NextResponse.json({ ok: true, slots });
  } catch (error) {
    console.error("availability error", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch availability" }, { status: 500 });
  }
}

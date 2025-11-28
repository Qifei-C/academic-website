import { addMinutes, format, parse } from "date-fns";
import { AvailabilityDay, MockEventInput, MockEventResult } from "@/types/calendar";

const BASE_SLOTS = ["14:00–14:30", "15:00–15:30", "16:00–16:30"];

export function getMockAvailability(): AvailabilityDay[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    return {
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "EEEE, MMM d"),
      slots: BASE_SLOTS.map((time) => ({
        time,
        available: true,
      })),
    };
  });
}

export function createMockCalendarEvent(input: MockEventInput): MockEventResult {
  // Parse times like "14:00–14:30"
  const [startStr, endStr] = input.time.split("–");
  const start = parse(`${input.date} ${startStr}`, "yyyy-MM-dd HH:mm", new Date());
  const end = endStr
    ? parse(`${input.date} ${endStr}`, "yyyy-MM-dd HH:mm", new Date())
    : addMinutes(start, 30);

  return {
    summary: `Meeting with ${input.name}`,
    start: format(start, "yyyy-MM-dd HH:mm"),
    end: format(end, "yyyy-MM-dd HH:mm"),
    description: `Requested by ${input.email}`,
    attendee: input.email,
  };
}

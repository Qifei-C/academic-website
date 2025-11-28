"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { BookingDialog } from "@/components/schedule/BookingDialog";
import { SlotCard } from "@/components/schedule/SlotCard";
import { Separator } from "@/components/ui/separator";
import { createMockCalendarEvent, getMockAvailability } from "@/lib/mockCalendar";
import { AvailabilityDay, MockEventInput } from "@/types/calendar";

export default function SchedulePage() {
  const router = useRouter();
  const days: AvailabilityDay[] = useMemo(() => getMockAvailability(), []);

  const handleConfirm = (payload: MockEventInput) => {
    const mockEvent = createMockCalendarEvent(payload);
    console.log("Mock calendar event (simulated calendar.events.insert):", mockEvent);
    const params = new URLSearchParams({
      date: payload.date,
      time: payload.time,
      name: payload.name,
      email: payload.email,
      summary: mockEvent.summary,
      start: mockEvent.start,
      end: mockEvent.end,
      attendee: mockEvent.attendee || "",
    });
    router.push(`/schedule/success?${params.toString()}`);
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <header className="space-y-2">
        <p className="text-xs text-muted-foreground">
          This demo simulates the use of Google Calendar’s `calendar.events` scope for OAuth verification.
        </p>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
        <h1 className="text-4xl font-semibold tracking-tight">Upcoming Availability</h1>
        <p className="text-sm text-muted-foreground">
          Choose a slot to get in touch. This flow is fully mocked to demonstrate calendar.events usage.
        </p>
      </header>

      <div className="grid gap-6 rounded-xl border border-border/60 bg-card/70 p-6 shadow-sm">
        {days.map((day, dayIdx) => (
          <div key={`${day.date}-${dayIdx}`} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-foreground">{day.label || day.date}</p>
              <p className="text-xs text-muted-foreground">{dayIdx === 0 ? "Today" : ""}</p>
            </div>
              <div className="flex flex-wrap gap-2">
                {day.slots.map((slot) => (
                  <BookingDialog
                    key={`${day.date}-${slot.time}`}
                    dateLabel={day.label || day.date}
                    dateValue={day.date}
                    slot={slot}
                    onConfirm={({ name, email }) => handleConfirm({ name, email, date: day.date, time: slot.time })}
                    trigger={<SlotCard slot={slot} />}
                  />
                ))}
              </div>
              {dayIdx < days.length - 1 && <Separator className="opacity-60" />}
            </div>
        ))}
      </div>
    </main>
  );
}

"use client";

import { useSearchParams } from "next/navigation";

import { EventSummaryCard } from "@/components/schedule/EventSummaryCard";
import { MockEventResult } from "@/types/calendar";

export default function SuccessPage() {
  const params = useSearchParams();
  const summary = params.get("summary") || "Meeting request";
  const start = params.get("start") || "TBD";
  const end = params.get("end") || "TBD";
  const attendee = params.get("attendee") || params.get("email") || "you@example.com";

  const event: MockEventResult = {
    summary,
    start,
    end,
    attendee,
    description: params.get("description") || undefined,
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
        <h1 className="text-3xl font-semibold tracking-tight">Success</h1>
        <p className="text-sm text-muted-foreground">
          This is a mock confirmation screen showing how an event would appear after calling `calendar.events.insert`.
        </p>
      </header>
      <EventSummaryCard event={event} />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Loader2, CalendarCheck } from "lucide-react";

import { BookingDialog } from "@/components/schedule/BookingDialog";
import { SlotCard } from "@/components/schedule/SlotCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Slot = { start: string; end: string };
type DayGroup = { label: string; dateKey: string; slots: Slot[] };

type AvailabilityResponse =
  | { ok: true; slots: Slot[] }
  | { ok: false; error: string };

export default function SchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/availability");
        const json: AvailabilityResponse = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Failed to load availability");
        }
        setSlots(json.slots);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load availability";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped: DayGroup[] = useMemo(() => {
    const groups: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      const start = parseISO(slot.start);
      const key = format(start, "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(slot);
    });
    return Object.entries(groups)
      .map(([dateKey, list]) => ({
        dateKey,
        label: format(parseISO(list[0].start), "EEEE, MMM d"),
        slots: list.sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()),
      }))
      .sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));
  }, [slots]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
        <h1 className="text-4xl font-semibold tracking-tight">Upcoming Availability</h1>
        <p className="text-sm text-muted-foreground">
          Pick a time and confirm your name and email. This books directly into my Google Calendar.
        </p>
        <Badge variant="secondary" className="mt-2 w-fit">
          Live Google Calendar availability
        </Badge>
      </header>

      <Card className="border-border/60 bg-card/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Available slots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading availability…
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && grouped.length === 0 && (
            <p className="text-sm text-muted-foreground">No available slots found.</p>
          )}
          {!loading &&
            !error &&
            grouped.map((group, idx) => (
              <div key={group.dateKey} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">{group.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.slots.map((slot) => (
                    <BookingSlot
                      key={slot.start}
                      slot={slot}
                      onBooked={({ htmlLink }) => {
                        const params = new URLSearchParams();
                        if (htmlLink) params.set("link", htmlLink);
                        router.push(`/schedule/success?${params.toString()}`);
                      }}
                    />
                  ))}
                </div>
                {idx < grouped.length - 1 && <Separator className="opacity-70" />}
              </div>
            ))}
        </CardContent>
      </Card>
    </main>
  );
}

type BookingSlotProps = {
  slot: Slot;
  onBooked: (res: { htmlLink?: string }) => void;
};

function BookingSlot({ slot, onBooked }: BookingSlotProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "conflict">("idle");
  const startDate = parseISO(slot.start);
  const endDate = parseISO(slot.end);
  const label = `${format(startDate, "HH:mm")}–${format(endDate, "HH:mm")}`;

  const handleConfirm = async (payload: { name: string; email: string; notes?: string }) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          start: slot.start,
          end: slot.end,
          token: process.env.NEXT_PUBLIC_BOOK_TOKEN,
          description: payload.notes,
        }),
      });
      const json = await res.json();
      if (res.status === 409 || json.error === "Slot not available") {
        setStatus("conflict");
        return;
      }
      if (!res.ok || !json.ok) {
        setStatus("error");
        return;
      }
      onBooked({ htmlLink: json.htmlLink });
      setDialogOpen(false);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <BookingDialog
      open={dialogOpen}
      onOpenChange={(v) => {
        setDialogOpen(v);
        if (!v) setStatus("idle");
      }}
      dateLabel={format(startDate, "EEEE, MMM d")}
      timeLabel={label}
      slot={slot}
      status={status}
      onConfirm={handleConfirm}
      trigger={
        <SlotCard
          slot={{ time: label, available: true }}
          disabled={status === "loading"}
        />
      }
    />
  );
}

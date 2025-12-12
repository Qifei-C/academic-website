"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Loader2, CalendarCheck } from "lucide-react";

import { BookingDialog } from "@/components/schedule/BookingDialog";
import { SlotCard } from "@/components/schedule/SlotCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Slot = { start: string; end: string };
type DayGroup = { label: string; dateKey: string; slots: Slot[] };

type AvailabilityResponse =
  | { ok: true; slots: Slot[] }
  | { ok: false; error: string };

const eventTypes = [
  {
    id: "research",
    title: "Research / collaboration",
    duration: 60,
    desc: "For discussing potential research projects, collaborations, or technical ideas.",
  },
  {
    id: "mentoring",
    title: "Student / mentoring chat",
    duration: 30,
    desc: "For students seeking advice on research direction, grad school, or career paths.",
  },
  {
    id: "other",
    title: "Other / recruiting",
    duration: 15,
    desc: "For recruiting, industry outreach, or anything that doesn’t fit the other categories.",
  },
];

export default function SchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const leadCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/availability");
        const json: AvailabilityResponse = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Failed to load availability");
        }
        // 过滤掉未满足 2 天提前量的 slot
        const filtered = json.slots.filter((s) => parseISO(s.start) >= leadCutoff);
        // 仅保留 14:00-17:40 窗口内的时段
        const withinHours = filtered.filter((s) => {
          const startDate = parseISO(s.start);
          const endDate = parseISO(s.end);
          const startHour = startDate.getHours() + startDate.getMinutes() / 60;
          const endHour = endDate.getHours() + endDate.getMinutes() / 60;
          return startHour >= 14 && endHour <= 17 + 40 / 60;
        });
        setSlots(withinHours);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load availability";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leadCutoff]);

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

  const selectedType = useMemo(
    () => eventTypes.find((t) => t.id === selectedTypeId) ?? null,
    [selectedTypeId],
  );

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <div className="grid gap-20 lg:grid-cols-[0.39fr_0.61fr] lg:items-center">
        {/* Left column */}
        <div className="space-y-5">
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            SCHEDULE
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">Let’s find a time to talk</h1>
            <p className="text-sm text-muted-foreground">
              This calendar is mainly for research, collaboration, and mentoring calls. Please add 1–2 sentences about
              what you’d like to talk about so I can prepare for our discussion. If you’re not sure which option fits,
              feel free to email me instead.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Current students.</span> If you have questions about a
              course I’m TA’ing for, please come to my regular office hours (listed on the syllabus / Canvas) or post on
              Ed instead of using this calendar.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="relative min-h-[620px] overflow-hidden">
            {/* Cards view */}
            <div
              className={`absolute inset-0 flex h-full flex-col justify-center space-y-3 transition-all duration-300 ease-in-out ${
                selectedType
                  ? "translate-y-6 opacity-0 pointer-events-none"
                  : "translate-y-0 opacity-100 z-10"
              }`}
            >
              {eventTypes.map((type) => {
                const isActive = selectedTypeId === type.id;
                return (
                  <Card
                    key={type.id}
                    className={`border ${isActive ? "border-primary shadow-sm" : "border-border/60"} cursor-pointer transition`}
                    onClick={() => setSelectedTypeId(type.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-semibold leading-tight">{type.title}</CardTitle>
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {type.duration} min
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{type.desc}</CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Slots view */}
            <Card
              className={`absolute inset-0 border-border/60 bg-card/70 shadow-sm transition-all duration-300 ease-in-out gap-2.5 py-4 ${
                selectedType
                  ? "translate-y-0 opacity-100 z-10"
                  : "translate-y-6 opacity-0 pointer-events-none"
              }`}
            >
              <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">Available slots</CardTitle>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {selectedType && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTypeId(null)}>
                      Back
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {selectedType ? (
                    <span>
                      {selectedType.title} · {selectedType.duration} min
                    </span>
                  ) : (
                    <span>Select a meeting type to continue</span>
                  )}
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading availability…
                  </div>
                )}
                <div className="space-y-2.5">
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {!loading && !error && selectedType && grouped.length === 0 && (
                    <p className="text-sm text-muted-foreground">No available slots found.</p>
                  )}
                  {!loading &&
                    !error &&
                    selectedType &&
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
                              eventType={selectedType}
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
                </div>
                <p className="text-xs text-muted-foreground">
                  Remote meetings use my UPenn Zoom room:{" "}
                  <span className="font-mono">https://upenn.zoom.us/my/Qifei</span>.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}

type BookingSlotProps = {
  slot: Slot;
  eventType: (typeof eventTypes)[number];
  onBooked: (res: { htmlLink?: string }) => void;
};

function BookingSlot({ slot, eventType, onBooked }: BookingSlotProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [meetingMode, setMeetingMode] = useState<"Remote" | "In person" | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "conflict">("idle");
  const startDate = parseISO(slot.start);
  const endDate = new Date(startDate.getTime() + eventType.duration * 60 * 1000);
  const label = `${format(startDate, "HH:mm")}–${format(endDate, "HH:mm")}`;
  const allowInPerson = eventType.id === "research" || eventType.id === "mentoring";
  const remoteMeetingUrl = "https://upenn.zoom.us/my/Qifei";

  const handleConfirm = async (payload: {
    name: string;
    email: string;
    notes?: string;
    institution?: string;
    meetingMode?: string;
    meetingLocation?: string;
  }) => {
    const effectiveMode = payload.meetingMode || meetingMode;
    const effectiveLocation =
      payload.meetingLocation ||
      (effectiveMode === "Remote" ? remoteMeetingUrl : undefined);
    setStatus("loading");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          start: slot.start,
          end: endDate.toISOString(),
          type: eventType.id,
          topic: payload.notes,
          institution: payload.institution,
          mode: payload.meetingMode || meetingMode,
          location: effectiveLocation,
          token: process.env.NEXT_PUBLIC_BOOK_TOKEN,
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
    <>
      <div
        className="cursor-pointer"
        onClick={() => {
          // If in-person not allowed, default to Remote (Zoom) and skip mode dialog
          if (!allowInPerson) {
            setMeetingMode("Remote");
            setDialogOpen(true);
          } else {
            setMeetingMode(null);
            setModeDialogOpen(true);
          }
        }}
      >
        <SlotCard slotInfo={{ time: label, available: true }} disabled={status === "loading"} />
      </div>

      {/* Mode picker dialog */}
      <BookingModeDialog
        open={modeDialogOpen}
        onOpenChange={(v) => {
          setModeDialogOpen(v);
          if (!v && !dialogOpen) {
            setStatus("idle");
          }
        }}
        onSelectMode={(mode) => {
          setMeetingMode(mode);
          setModeDialogOpen(false);
          setDialogOpen(true);
        }}
        allowInPerson={allowInPerson}
      />

      <BookingDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) {
            setStatus("idle");
            setMeetingMode(null);
          }
        }}
        dateLabel={format(startDate, "EEEE, MMM d")}
        timeLabel={label}
        meetingMode={meetingMode || undefined}
        status={status}
        onConfirm={handleConfirm}
      />
    </>
  );
}

type BookingModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: "Remote" | "In person") => void;
  allowInPerson: boolean;
};

function BookingModeDialog({ open, onOpenChange, onSelectMode, allowInPerson }: BookingModeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Choose meeting format</DialogTitle>
          <DialogDescription>Select whether you prefer to meet remotely or in person.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="justify-start" onClick={() => onSelectMode("Remote")}>
            Zoom
          </Button>
          {allowInPerson && (
            <Button variant="outline" className="justify-start" onClick={() => onSelectMode("In person")}>
              In person
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

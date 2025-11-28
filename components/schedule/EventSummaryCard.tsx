"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MockEventResult } from "@/types/calendar";

type Props = {
  event: MockEventResult;
};

export function EventSummaryCard({ event }: Props) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Your meeting has been scheduled</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="space-y-1">
          <div className="text-foreground font-semibold">{event.summary}</div>
          <div>
            {event.start} → {event.end}
          </div>
          <div className="text-xs text-muted-foreground">Attendee: {event.attendee}</div>
        </div>
        <Separator />
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>In the real implementation, this corresponds to Google Calendar’s `calendar.events.insert`.</div>
        </div>
        <Button asChild variant="outline">
          <Link href="https://calendar.google.com" target="_blank">
            View event (example)
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

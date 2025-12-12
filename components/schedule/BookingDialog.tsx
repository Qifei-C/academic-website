"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  timeLabel: string;
  meetingMode?: string;
  status: "idle" | "loading" | "error" | "conflict";
  onConfirm: (payload: {
    name: string;
    email: string;
    notes?: string;
    institution?: string;
    meetingMode?: string;
    meetingLocation?: string;
  }) => void;
  trigger?: React.ReactNode;
};

export function BookingDialog({
  open,
  onOpenChange,
  dateLabel,
  timeLabel,
  meetingMode,
  status,
  onConfirm,
  trigger,
}: BookingDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [institution, setInstitution] = React.useState("");
  const [meetingLocation, setMeetingLocation] = React.useState("");

  const handleConfirm = () => {
    const resolvedLocation = meetingMode === "In person" ? meetingLocation : undefined;
    onConfirm({ name, email, notes, institution, meetingMode, meetingLocation: resolvedLocation });
  };

  const disabled = status === "loading";

  React.useEffect(() => {
    if (meetingMode === "In person") {
      setMeetingLocation((prev) => prev || "Amy Gutmann Hall (lobby)");
    } else {
      setMeetingLocation("");
    }
  }, [meetingMode]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setName("");
          setEmail("");
          setNotes("");
          setInstitution("");
          setMeetingLocation("");
        }
      }}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm this slot</DialogTitle>
          <DialogDescription>
            {dateLabel} · {timeLabel}
            {meetingMode ? <span className="block text-xs text-muted-foreground">Format: {meetingMode}</span> : null}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Your university or organization"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">What would you like to talk about? (1–2 sentences)</Label>
            <textarea
              id="notes"
              className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief context or questions"
              disabled={disabled}
            />
          </div>
          {meetingMode === "In person" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="meeting-location">Where should we meet?</Label>
                <select
                  id="meeting-location"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  disabled={disabled}
                >
                  <option value="Amy Gutmann Hall (lobby)">Amy Gutmann Hall (lobby)</option>
                  <option value="Levine Hall (1F)">Levine Hall (1F)</option>
                  <option value="Starbucks @ Penn Bookstore">Starbucks @ Penn Bookstore</option>
                </select>
              </div>
            </div>
          )}
          {status === "error" && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
          {status === "conflict" && <p className="text-sm text-amber-600">This time slot is no longer available.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              disabled ||
              !name.trim() ||
              !email.trim() ||
              !institution.trim() ||
              (meetingMode === "In person" &&
                !(meetingLocation && meetingLocation.trim()))
            }
          >
            {status === "loading" ? "Booking…" : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

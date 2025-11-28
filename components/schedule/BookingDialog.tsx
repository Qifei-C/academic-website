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
  status: "idle" | "loading" | "error" | "conflict";
  onConfirm: (payload: { name: string; email: string; notes?: string }) => void;
  trigger: React.ReactNode;
};

export function BookingDialog({
  open,
  onOpenChange,
  dateLabel,
  timeLabel,
  status,
  onConfirm,
  trigger,
}: BookingDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleConfirm = () => {
    onConfirm({ name, email, notes });
  };

  const disabled = status === "loading";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setName("");
          setEmail("");
          setNotes("");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm this slot</DialogTitle>
          <DialogDescription>
            {dateLabel} · {timeLabel}
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
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a short note"
              disabled={disabled}
            />
          </div>
          {status === "error" && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
          {status === "conflict" && <p className="text-sm text-amber-600">This time slot is no longer available.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={disabled || !name || !email}>
            {status === "loading" ? "Booking…" : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

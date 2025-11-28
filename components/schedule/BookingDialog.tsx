"use client";

import { useState } from "react";

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
import { Slot } from "@/types/calendar";

type BookingDialogProps = {
  dateLabel: string;
  dateValue: string;
  slot: Slot;
  onConfirm: (payload: { name: string; email: string }) => void;
  trigger: React.ReactNode;
};

export function BookingDialog({ dateLabel, dateValue, slot, onConfirm, trigger }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleConfirm = () => {
    onConfirm({ name, email });
    setOpen(false);
    setName("");
    setEmail("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setName("");
          setEmail("");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request this slot</DialogTitle>
          <DialogDescription>
            {dateLabel} · {slot.time}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor={`name-${dateValue}-${slot.time}`}>Name</Label>
            <Input
              id={`name-${dateValue}-${slot.time}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`email-${dateValue}-${slot.time}`}>Email</Label>
            <Input
              id={`email-${dateValue}-${slot.time}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

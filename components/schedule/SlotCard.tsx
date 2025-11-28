"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Slot } from "@/types/calendar";

type SlotCardProps = React.ComponentPropsWithoutRef<typeof Button> & {
  slot: Slot;
  onSelect?: () => void;
};

export const SlotCard = React.forwardRef<HTMLButtonElement, SlotCardProps>(
  ({ slot, onSelect, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={`h-9 border-border/70 bg-background/60 text-sm font-medium ${className ?? ""}`}
        onClick={(e) => {
          props.onClick?.(e);
          onSelect?.();
        }}
        disabled={slot.available === false}
        {...props}
      >
        {slot.time}
      </Button>
    );
  },
);
SlotCard.displayName = "SlotCard";

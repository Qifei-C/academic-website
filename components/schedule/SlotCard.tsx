"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

type SlotCardProps = React.ComponentPropsWithoutRef<typeof Button> & {
  slot: { time: string; available?: boolean };
};

export const SlotCard = React.forwardRef<HTMLButtonElement, SlotCardProps>(
  ({ slot, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={`h-9 border-border/70 bg-background/60 text-sm font-medium ${className ?? ""}`}
        disabled={slot.available === false || props.disabled}
        {...props}
      >
        {slot.time}
      </Button>
    );
  },
);
SlotCard.displayName = "SlotCard";

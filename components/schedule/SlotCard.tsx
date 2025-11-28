"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

type SlotInfo = { time: string; available?: boolean };
type SlotCardProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, "slot"> & {
  slotInfo: SlotInfo;
};

export const SlotCard = React.forwardRef<HTMLButtonElement, SlotCardProps>(
  ({ slotInfo, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={`h-9 border-border/70 bg-background/60 text-sm font-medium ${className ?? ""}`}
        disabled={slotInfo.available === false || props.disabled}
        {...props}
      >
        {slotInfo.time}
      </Button>
    );
  },
);
SlotCard.displayName = "SlotCard";

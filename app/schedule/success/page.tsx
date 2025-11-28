"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
  const params = useSearchParams();
  const htmlLink = params.get("link") || undefined;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your meeting has been scheduled!</h1>
        </div>
      </div>

      <Card className="border-border/60 bg-card/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>You will receive a calendar invitation shortly.</p>
          <div className="flex flex-wrap gap-3">
            {htmlLink && (
              <Button asChild>
                <Link href={htmlLink} target="_blank" rel="noreferrer">
                  View event in Google Calendar
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

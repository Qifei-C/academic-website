import { Suspense } from "react";

import { SuccessContent } from "@/components/schedule/SuccessContent";

export const dynamic = "force-dynamic";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-muted-foreground">Loading confirmation…</div>}>
      <SuccessContent />
    </Suspense>
  );
}

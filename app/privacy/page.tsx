"use client";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          This application only accesses my own Google Calendar for the purpose of creating events that I explicitly
          request. No user data is stored or shared with third parties. This application is used solely by myself for
          scheduling purposes.
        </p>
      </div>
    </main>
  );
}

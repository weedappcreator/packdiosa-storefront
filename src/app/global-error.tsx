"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0f1a24] text-center">
        <div>
          <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-6 text-[#9ca3af]">
            An unexpected error occurred. Please try again.
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}

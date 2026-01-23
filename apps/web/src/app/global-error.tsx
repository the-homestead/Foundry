"use client";

import { Button } from "@foundry/ui/primitives/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en">
            <body className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
                <div className="flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="space-y-1">
                        <h1 className="font-semibold text-lg">Something went wrong</h1>
                        <p className="text-muted-foreground text-sm">An unexpected error occurred while rendering this page.</p>
                    </div>
                    <div className="rounded-md border border-dashed bg-muted/40 p-3 text-muted-foreground text-xs">{error?.message ?? "Unknown error"}</div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={reset} type="button">
                            Try again
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}

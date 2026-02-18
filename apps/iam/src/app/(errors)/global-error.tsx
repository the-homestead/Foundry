"use client";

import ErrorPage from "@foundry/iam/components/error-page";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return <ErrorPage error={error} resetAction={reset} />;
}

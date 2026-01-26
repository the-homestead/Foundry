"use client";

import { ErrorView } from "@foundry/ui/components";
import { Button } from "@foundry/ui/primitives/button";

export default function ErrorPage({ error, resetAction }: { error?: Error; resetAction?: () => void }) {
    return (
        <div>
            <ErrorView message={error?.message} secondaryAction={{ label: "Back to home page", href: "/" }} status={500} title={error?.name ?? "Error"} />

            {resetAction ? (
                <div className="mt-4 flex justify-center">
                    <Button onClick={resetAction} size="lg" type="button">
                        Try again
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

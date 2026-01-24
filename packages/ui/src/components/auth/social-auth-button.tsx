"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";

export default function SocialAuthButtons({ lastUsedMethod, onClick }: { lastUsedMethod?: string | null; onClick: (provider: string) => void }) {
    const providers = ["github", "discord", "google"];

    return (
        <div className="flex flex-col gap-2">
            {providers.map((p) => (
                <Button className="mx-auto w-72" key={p} onClick={() => onClick(p)} variant="outline">
                    Continue with {p[0]?.toUpperCase() + p.slice(1)}
                    {lastUsedMethod === p ? (
                        <Badge className="ml-2" variant="outline">
                            Last used
                        </Badge>
                    ) : null}
                </Button>
            ))}
        </div>
    );
}

"use client";

import { PhDiscordLogoDuotone, PhGithubLogoDuotone, PhGitlabLogoDuotone, PhGoogleLogoDuotone, PhTwitchLogoDuotone } from "@foundry/ui/components/cicons";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { LogInIcon } from "lucide-react";

const PROVIDERS = [
    { id: "github", name: "GitHub", icon: PhGithubLogoDuotone },
    { id: "google", name: "Google", icon: PhGoogleLogoDuotone },
    { id: "discord", name: "Discord", icon: PhDiscordLogoDuotone },
    { id: "gitlab", name: "GitLab", icon: PhGitlabLogoDuotone },
    { id: "twitch", name: "Twitch", icon: PhTwitchLogoDuotone },
    { id: "keycloak", name: "Keycloak", icon: LogInIcon },
];

export default function SocialAuthButtons({ lastUsedMethod, onClick }: { lastUsedMethod?: string | null; onClick: (provider: string) => void }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            {PROVIDERS.map((provider) => {
                const Icon = provider.icon;
                const isLastUsed = lastUsedMethod === provider.id;

                return (
                    <Button
                        className="relative h-16 w-16 p-0"
                        key={provider.id}
                        onClick={() => onClick(provider.id)}
                        title={`Continue with ${provider.name}`}
                        type="button"
                        variant="outline"
                    >
                        <Icon style={{ width: "2rem", height: "2rem" }} />
                        {isLastUsed ? <Badge className="absolute -top-1 -right-1 h-2 w-2 rounded-full p-0" variant="default" /> : null}
                    </Button>
                );
            })}
        </div>
    );
}

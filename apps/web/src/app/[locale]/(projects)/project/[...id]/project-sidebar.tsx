"use client";

import { GitHubStarsButton } from "@foundry/ui/components/github-stars";
import { ArrowDownOnSquareIcon, BookmarkIcon, ChatBubbleLeftRightIcon, LinkIcon } from "@foundry/ui/icons";
import { AspectRatio } from "@foundry/ui/primitives/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@foundry/ui/primitives/collapsible";
import { Progress } from "@foundry/ui/primitives/progress";
import { Separator } from "@foundry/ui/primitives/separator";
import { ShareButton } from "@foundry/ui/primitives/share-button";
import { Skeleton } from "@foundry/ui/primitives/skeleton";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
// Note: creator links use plain anchors to avoid Next.js typing constraints in this context.

export interface ProjectSidebarProps {
    project: {
        compatibility: {
            status: string;
            notes: string;
            matrix: { label: string; value: number }[];
        };
    };
    links: { label: string; href: string }[];
    creators: { name: string; role: string; avatar: string }[];
    onDownload?: () => void;
    onAddToCollection?: () => void;
    loading?: boolean;
}

export function ProjectSidebar({ project, links, creators, onDownload, onAddToCollection, loading = false }: ProjectSidebarProps) {
    const [liveMessage, setLiveMessage] = useState<string | null>(null);
    const [isCompatOpen, setIsCompatOpen] = useState<boolean>(() => (typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : true));
    const [isLinksOpen, setIsLinksOpen] = useState<boolean>(() => (typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : true));
    const [isCreatorsOpen, setIsCreatorsOpen] = useState<boolean>(() => (typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : true));
    const compatibilityScore = Math.round((project.compatibility.matrix.reduce((sum, item) => sum + item.value, 0) / Math.max(1, project.compatibility.matrix.length)) * 100);

    // Keep open state in sync with viewport changes (optional)
    useEffect(() => {
        const m = window.matchMedia("(min-width: 640px)");
        const onChange = () => {
            const matches = m.matches;
            setIsCompatOpen(matches);
            setIsLinksOpen(matches);
            setIsCreatorsOpen(matches);
        };
        try {
            m.addEventListener("change", onChange);
        } catch {
            // Safari fallback
            m.addListener(onChange);
        }
        return () => {
            try {
                m.removeEventListener("change", onChange);
            } catch {
                m.removeListener(onChange);
            }
        };
    }, []);

    const handleDownload = () => {
        try {
            onDownload?.();
            setLiveMessage("Download started");
            setTimeout(() => setLiveMessage(null), 3500);
        } catch {
            setLiveMessage("Download failed");
            setTimeout(() => setLiveMessage(null), 3500);
        }
    };

    const handleAddToCollection = () => {
        try {
            onAddToCollection?.();
            setLiveMessage("Added to collection");
            setTimeout(() => setLiveMessage(null), 3500);
        } catch {
            setLiveMessage("Failed to add to collection");
            setTimeout(() => setLiveMessage(null), 3500);
        }
    };

    return (
        <aside className="w-full space-y-4 rounded-md border border-border bg-card p-4 shadow-md ring-1 ring-border/5 sm:sticky sm:top-20 sm:w-72">
            {/* Quick actions moved higher and made sticky so primary CTAs remain visible */}
            <Card className="z-10 bg-sidebar sm:sticky sm:top-4">
                <CardHeader>
                    <CardTitle>Quick actions</CardTitle>
                    <CardDescription>Common tasks for this project</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Button
                                aria-describedby="download-desc"
                                aria-label="Download project"
                                className="flex-1"
                                disabled={loading}
                                onClick={handleDownload}
                                size="lg"
                                variant="default"
                            >
                                <ArrowDownOnSquareIcon className="h-5 w-5" />
                                Download
                            </Button>
                            <Button
                                aria-label="Add project to collection"
                                className="flex-none"
                                disabled={loading}
                                onClick={handleAddToCollection}
                                size="lg"
                                title="Add to collection"
                                variant="secondary"
                            >
                                <BookmarkIcon className="h-5 w-5" />
                            </Button>
                        </div>
                        {liveMessage ? <p className="text-muted-foreground text-sm">{liveMessage}</p> : null}
                        <div className="sr-only" id="download-desc">
                            Starts a download of the primary project file.
                        </div>
                        <ShareButton
                            className="w-full"
                            data-urls={JSON.stringify({ facebook: "https://facebook.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com" })}
                        >
                            <LinkIcon className="h-4 w-4" />
                            Share
                        </ShareButton>
                        <GitHubStarsButton className="w-full" repo="animate-ui" username="imskyleen" variant="outline" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-sidebar">
                <Collapsible onOpenChange={setIsCompatOpen} open={isCompatOpen}>
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            {/** biome-ignore lint/a11y/useButtonType: <Def> */}
                            <button className="flex w-full items-start justify-between gap-4 text-left">
                                <div>
                                    <CardTitle>Compatibility</CardTitle>
                                    <CardDescription>Top-level support signals for this project.</CardDescription>
                                </div>
                                <ChevronDownIcon className={`mt-1 h-4 w-4 text-muted-foreground transition-transform ${isCompatOpen ? "rotate-180" : ""}`} />
                            </button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Status</span>
                                    <Badge variant="outline">{project.compatibility.status}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Score</span>
                                    {loading ? <Skeleton className="h-4 w-10" /> : <span className="font-semibold text-sm">{compatibilityScore}%</span>}
                                </div>
                                <p className="text-muted-foreground text-sm">{project.compatibility.notes}</p>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                {loading ? (
                                    // loading skeleton for compatibility rows
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3" />
                                        <Skeleton className="h-3" />
                                    </div>
                                ) : (
                                    project.compatibility.matrix.map((item) => {
                                        const pct = Math.round(item.value * 100);
                                        // determine color variant
                                        let variant: "default" | "success" | "warning" | "danger" = "default";
                                        if (item.value >= 0.8) {
                                            variant = "success";
                                        } else if (item.value >= 0.6) {
                                            variant = "default";
                                        } else if (item.value >= 0.4) {
                                            variant = "warning";
                                        } else {
                                            variant = "danger";
                                        }

                                        return (
                                            <div className="space-y-2 rounded-md border border-border/60 bg-background/40 p-3" key={item.label}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{item.label}</span>
                                                    <span className="text-muted-foreground">{pct}%</span>
                                                </div>
                                                <Progress aria-label={`${item.label} compatibility`} value={pct} variant={variant} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            <Card className="bg-sidebar">
                <Collapsible onOpenChange={setIsLinksOpen} open={isLinksOpen}>
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            {/** biome-ignore lint/a11y/useButtonType: <Def> */}
                            <button className="flex w-full items-center justify-between gap-4 text-left">
                                <div>
                                    <CardTitle>Links</CardTitle>
                                    <CardDescription>Fully customizable by the project owner.</CardDescription>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-muted-foreground transition-transform ${isLinksOpen ? "rotate-180" : ""}`} />
                            </button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-2">
                            <div className="flex flex-col gap-2">
                                {links.map((link) => (
                                    <a
                                        aria-label={`Open ${link.label} in a new tab`}
                                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        href={link.href}
                                        key={link.label}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        title={link.label}
                                    >
                                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                                        <span className="truncate">{link.label}</span>
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            <Card className="bg-sidebar">
                <Collapsible onOpenChange={setIsCreatorsOpen} open={isCreatorsOpen}>
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            {/** biome-ignore lint/a11y/useButtonType: <Def> */}
                            <button className="flex w-full items-center justify-between gap-4 text-left">
                                <div>
                                    <CardTitle>Creators</CardTitle>
                                    <CardDescription>Show co-maintainers or teams.</CardDescription>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-muted-foreground transition-transform ${isCreatorsOpen ? "rotate-180" : ""}`} />
                            </button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-3">
                            {creators.map((creator) => (
                                <div className="flex items-center gap-3" key={creator.name}>
                                    <Avatar>
                                        <AvatarImage alt={creator.name} src={creator.avatar} />
                                        <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <a
                                            aria-label={`View ${creator.name} profile`}
                                            className="font-medium leading-tight hover:underline"
                                            href={`/users/${encodeURIComponent(creator.name)}`}
                                            title={`View ${creator.name}'s profile`}
                                        >
                                            {creator.name}
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-sm">{creator.role}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Button className="gap-2" size="sm" variant="ghost">
                                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                            Message
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            {/* SR live region for screen readers to announce action results */}
            <div aria-live="polite" className="sr-only">
                {liveMessage}
            </div>
            <Card className="overflow-hidden bg-sidebar">
                <CardHeader>
                    <CardTitle>Ad spot</CardTitle>
                    <CardDescription>Reserved inventory for project pages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AspectRatio ratio={16 / 9}>
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ctp-mauve-500/80 via-ctp-blue-500/70 to-ctp-teal-400/70 text-white">
                            <div className="text-center">
                                <div className="font-semibold text-lg">Promoted placement</div>
                                <p className="text-sm opacity-80">1600x900 mock creative</p>
                            </div>
                        </div>
                    </AspectRatio>
                </CardContent>
            </Card>
        </aside>
    );
}

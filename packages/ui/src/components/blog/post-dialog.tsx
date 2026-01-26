"use client";

import { cn } from "@foundry/ui/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@foundry/ui/primitives/dialog";
import type { ReactNode } from "react";

export interface BlogPost {
    title: string;
    date: string;
    excerpt: string;
    comments: number;
    content?: string;
}

export function PostDialog({
    post,
    open,
    onOpenChange,
    onEdit,
    renderContent,
}: {
    post: BlogPost | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (post: BlogPost) => void;
    renderContent?: (content: string) => ReactNode;
}) {
    if (!post) {
        return null;
    }

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{post.title}</DialogTitle>
                    <div className="text-muted-foreground text-xs">
                        {post.date} • {post.comments} comments
                    </div>
                </DialogHeader>

                {(() => {
                    const articleClass = ["mt-4", "max-w-none", "prose", "text-sm", "wrap-break-word"].join(" ");
                    return (
                        <article className={cn(articleClass)}>
                            {renderContent ? renderContent(post.content ?? post.excerpt) : <div className="whitespace-pre-wrap">{post.content ?? post.excerpt}</div>}
                        </article>
                    );
                })()}

                <DialogFooter>
                    <div className="flex gap-2">
                        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => onEdit?.(post)} type="button">
                            Edit
                        </button>
                        <button className="rounded-md bg-muted px-3 py-1 text-muted-foreground text-sm" onClick={() => onOpenChange(false)} type="button">
                            Close
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

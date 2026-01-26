"use client";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@foundry/ui/primitives/sheet";
import { useEffect, useState } from "react";

import type { BlogPost } from "./post-dialog";
//yas
export function PostEditor({ post, open, onOpenChange, onSave }: { post: BlogPost | null; open: boolean; onOpenChange: (open: boolean) => void; onSave: (p: BlogPost) => void }) {
    const [title, setTitle] = useState(post?.title ?? "");
    const [content, setContent] = useState(post?.content ?? post?.excerpt ?? "");

    useEffect(() => {
        if (!post) {
            return;
        }

        setTitle(post.title);
        setContent(post.content ?? post.excerpt ?? "");
    }, [post]);

    if (!post) {
        return null;
    }

    return (
        <Sheet onOpenChange={onOpenChange} open={open}>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Edit Post</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-3 p-4">
                    <label className="font-medium text-sm" htmlFor="post-title">
                        Title
                    </label>
                    <input className="rounded-md border px-3 py-2" id="post-title" onChange={(e) => setTitle(e.target.value)} value={title} />

                    <label className="font-medium text-sm" htmlFor="post-content">
                        Content
                    </label>
                    <textarea className="rounded-md border px-3 py-2" id="post-content" onChange={(e) => setContent(e.target.value)} rows={10} value={content} />
                </div>

                <SheetFooter>
                    <div className="flex gap-2 p-4">
                        <button
                            className="rounded-md border px-3 py-1 text-sm"
                            onClick={() => {
                                onSave({ ...post, title, content });
                                onOpenChange(false);
                            }}
                            type="button"
                        >
                            Save
                        </button>
                        <button className="rounded-md bg-muted px-3 py-1 text-muted-foreground text-sm" onClick={() => onOpenChange(false)} type="button">
                            Cancel
                        </button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

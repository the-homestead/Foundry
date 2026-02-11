"use client";
import { type BlogPost, PostEditor } from "@foundry/ui/components";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@foundry/ui/primitives/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@foundry/ui/primitives/sheet";
import { Edit, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { lazy, Suspense, useEffect, useState } from "react";

const MarkdownViewer = lazy(() => import("@foundry/web/components/markdown/md-viewer"));

import { Separator } from "@foundry/ui/primitives/separator";
import { Textarea } from "@foundry/ui/primitives/textarea";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectBlogTabProps {
    //
    posts: ProjectTabsProps["posts"];
}

export function ProjectBlogTab({ posts }: ProjectBlogTabProps) {
    type LocalPost = BlogPost & ProjectTabsProps["posts"][number] & { content?: string };

    const [localPosts, setLocalPosts] = useState<LocalPost[]>(posts.map((p) => ({ ...p })));

    useEffect(() => {
        setLocalPosts(posts.map((p) => ({ ...p })));
    }, [posts]);

    const [selectedPost, setSelectedPost] = useState<LocalPost | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<LocalPost | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deletingPost, setDeletingPost] = useState<LocalPost | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    function handleSave(updated: BlogPost) {
        setLocalPosts((cur) => cur.map((p) => (p.title === updated.title ? { ...p, ...updated } : p)));
    }

    function handleDelete(post: LocalPost) {
        setLocalPosts((cur) => cur.filter((p) => p.title !== post.title));
        setDeletingPost(null);
        setIsDeleteOpen(false);
    }

    return (
        <Card className="bg-background">
            <CardHeader>
                <CardTitle className="font-bold text-2xl">Project Blog</CardTitle>
                <CardDescription className="text-base text-muted-foreground">Release notes, updates, and stories from the project team.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    {localPosts.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No blog posts yet.</div>
                    ) : (
                        localPosts.map((post) => (
                            <div className="flex flex-col gap-2 rounded-lg border bg-card p-5 shadow-sm" key={post.title}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="truncate font-semibold text-lg leading-tight">{post.title}</h3>
                                        <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                                            <span>{post.date}</span>
                                            {post.author && <span>• by {post.author}</span>}
                                            <span>• {post.comments} comments</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="inline-flex items-center gap-1 rounded-md border bg-accent px-3 py-1 text-accent-foreground transition hover:bg-accent/80"
                                            onClick={() => {
                                                setSelectedPost(post);
                                                setIsViewOpen(true);
                                            }}
                                            type="button"
                                        >
                                            <Eye className="size-4" />
                                            <span className="text-sm">View</span>
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 rounded-md border bg-muted px-3 py-1 text-muted-foreground transition hover:bg-muted/80"
                                            onClick={() => {
                                                setEditingPost(post);
                                                setIsEditOpen(true);
                                            }}
                                            type="button"
                                        >
                                            <Edit className="size-4" />
                                            <span className="text-sm">Edit</span>
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 rounded-md border bg-destructive/10 px-3 py-1 text-destructive transition hover:bg-destructive/20"
                                            onClick={() => {
                                                setDeletingPost(post);
                                                setIsDeleteOpen(true);
                                            }}
                                            type="button"
                                        >
                                            <Trash2 className="size-4" />
                                            <span className="text-sm">Delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-muted-foreground text-sm">{post.excerpt}</div>
                                {post.tags && post.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {post.tags.map((tag: string) => (
                                            <span className="rounded bg-accent px-2 py-0.5 text-accent-foreground text-xs" key={tag}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            {/* Sheet for viewing post details and comments */}
            <Sheet onOpenChange={setIsViewOpen} open={isViewOpen}>
                <SheetContent className="w-full max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{selectedPost?.title}</SheetTitle>
                        <SheetDescription>
                            <span className="inline-flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                <span>{selectedPost?.date}</span>
                                {selectedPost?.author && <span>• by {selectedPost.author}</span>}
                                <span>• {selectedPost?.comments} comments</span>
                            </span>
                        </SheetDescription>
                    </SheetHeader>
                    <div className="m-4 border p-4">
                        <Suspense fallback={<div className="p-4 text-muted-foreground text-sm">Loading…</div>}>
                            <MarkdownViewer content={selectedPost?.content ?? selectedPost?.excerpt ?? ""} />
                        </Suspense>
                    </div>
                    {/* Comments section */}
                    <div className="border-t px-4 pt-4">
                        <h4 className="mb-2 font-semibold text-base">Comments</h4>
                        <Textarea className="mb-4" disabled placeholder="Add a comment..." />
                        <Separator />
                        <div className="mt-4 flex flex-col gap-4">
                            {Array.isArray(selectedPost?.commentList) && selectedPost.commentList.length > 0 ? (
                                selectedPost.commentList.map((comment: { id: string; author: string; avatar?: string; content: string; date: string }) => (
                                    <div className="flex items-start gap-3" key={comment.id}>
                                        {comment.avatar && (
                                            <Image alt={comment.author} className="rounded-full border" height={32} loading="lazy" src={comment.avatar} width={32} />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{comment.author}</span>
                                                <span className="text-muted-foreground text-xs">{comment.date}</span>
                                            </div>
                                            <div className="mt-1 text-sm">{comment.content}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground text-sm">No comments yet.</div>
                            )}
                        </div>
                    </div>
                    <SheetFooter>
                        <Separator />
                        <button
                            className="mt-4 inline-flex items-center gap-1 rounded-md border bg-muted px-3 py-1 text-muted-foreground transition hover:bg-muted/80"
                            onClick={() => {
                                setIsViewOpen(false);
                                setSelectedPost(null);
                            }}
                            type="button"
                        >
                            Close
                        </button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <PostEditor onOpenChange={setIsEditOpen} onSave={(p) => handleSave(p)} open={isEditOpen} post={editingPost} />
            <AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete post?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the post. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletingPost && handleDelete(deletingPost)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

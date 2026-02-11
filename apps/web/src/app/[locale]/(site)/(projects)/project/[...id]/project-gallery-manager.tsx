"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@foundry/ui/primitives/alert-dialog";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { AlertCircle, Image as ImageIcon, Trash2, Upload, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { deleteGalleryItem, uploadGalleryItem } from "./actions";

const EXTENSION_REGEX = /\.[^/.]+$/;

interface GalleryItem {
    id: string;
    title: string;
    tone: string;
    aspect: number;
    image?: string;
}

interface ProjectGalleryManagerProps {
    projectSlug: string;
    canEdit: boolean;
    gallery: GalleryItem[];
}

export function ProjectGalleryManager({ projectSlug, canEdit, gallery }: ProjectGalleryManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate MIME type
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/ogg"];

            if (!allowedTypes.includes(file.type)) {
                setError("Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG) are allowed");
                return;
            }

            setSelectedFile(file);
            setTitle(file.name.replace(EXTENSION_REGEX, "")); // Remove extension
            setError(null);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", title || selectedFile.name);

            const result = await uploadGalleryItem(projectSlug, formData);

            if (result.error) {
                setError(result.error);
            } else {
                // Reset form
                setSelectedFile(null);
                setTitle("");
                setPreviewUrl(null);

                // Reset file input
                const fileInput = document.getElementById("gallery-upload") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (galleryId: string, imageUrl: string) => {
        setDeleting(galleryId);
        setError(null);

        try {
            const result = await deleteGalleryItem(projectSlug, galleryId, imageUrl);

            if (result.error) {
                setError(result.error);
            }
        } catch {
            setError("Failed to delete gallery item");
        } finally {
            setDeleting(null);
        }
    };

    const isVideo = (url: string) => {
        return url.includes(".mp4") || url.includes(".webm") || url.includes(".ogg");
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            {canEdit && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Gallery Item</CardTitle>
                        <CardDescription>
                            Add images or videos to your project gallery. Images/Videos up to 100MB. Supported formats: JPEG, PNG, GIF, WebP, MP4, WebM, OGG.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-50 p-3 text-red-900 text-sm dark:bg-red-950/20 dark:text-red-100">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="gallery-upload">File</Label>
                            <Input accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg" id="gallery-upload" onChange={handleFileSelect} type="file" />
                            {selectedFile && (
                                <p className="text-muted-foreground text-sm">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>

                        {previewUrl && (
                            <div className="rounded-lg border border-border p-4">
                                <Label className="mb-2 block">Preview</Label>
                                {selectedFile?.type.startsWith("video/") ? (
                                    <video className="max-h-64 w-full rounded-lg" controls src={previewUrl}>
                                        <track kind="captions" label="No captions" />
                                    </video>
                                ) : (
                                    <Image alt="Preview" className="max-h-64 w-full rounded-lg object-contain" height={256} src={previewUrl} width={400} />
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for this item" value={title} />
                        </div>

                        <Button className="w-full" disabled={uploading || !selectedFile} onClick={handleUpload}>
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? "Uploading..." : "Upload to Gallery"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Gallery Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                    <CardDescription>Project screenshots, videos, and media</CardDescription>
                </CardHeader>
                <CardContent>
                    {gallery.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ImageIcon className="mb-3 h-16 w-16 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">No gallery items yet</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {gallery.map((item) => (
                                <div className="group relative overflow-hidden rounded-lg border border-border" key={item.id}>
                                    {item.image && isVideo(item.image) ? (
                                        <div className="relative aspect-video bg-muted">
                                            <video className="h-full w-full object-cover" src={item.image}>
                                                <track kind="captions" label="No captions" />
                                            </video>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <Video className="h-12 w-12 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative aspect-video bg-muted">
                                            {item.image ? (
                                                <Image
                                                    alt={item.title}
                                                    className="object-cover"
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    src={item.image}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-3">
                                        <h4 className="font-medium text-sm">{item.title}</h4>
                                    </div>

                                    {canEdit && (
                                        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button disabled={deleting === item.id} size="sm" variant="destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Gallery Item?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{item.title}"? This action cannot be undone and the file will be permanently removed
                                                            from storage.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => {
                                                                if (item.image) {
                                                                    handleDelete(item.id, item.image);
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

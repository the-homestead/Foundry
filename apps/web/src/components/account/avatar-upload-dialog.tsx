"use client";

import { ArrowUpTrayIcon } from "@foundry/ui/components/icons/arrow-up-tray";
import { LinkIcon } from "@foundry/ui/components/icons/link";
import { PhotoIcon } from "@foundry/ui/components/icons/photo";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Button } from "@foundry/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { uploadAvatar } from "@foundry/web/actions/avatar";
import { authClient } from "@foundry/web/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface AvatarUploadDialogProps {
    avatarUrl: string | null;
    avatarFallback: string;
    userId: string;
}

export function AvatarUploadDialog({ avatarUrl, avatarFallback, userId }: AvatarUploadDialogProps) {
    const t = useTranslations("AccountPage");
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const publicUrl = await uploadAvatar(formData, userId);

            await authClient.updateUser({
                image: publicUrl,
            });

            toast.success(t("profile.avatar.success"));
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error(t("profile.avatar.error"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlUpload = async () => {
        if (!imageUrl.trim()) {
            toast.error("Please enter an image URL");
            return;
        }

        setIsUploading(true);
        try {
            await authClient.updateUser({
                image: imageUrl,
            });

            toast.success(t("profile.avatar.success"));
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error(t("profile.avatar.error"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setIsUploading(true);
        try {
            await authClient.updateUser({
                image: null,
            });

            toast.success("Avatar removed");
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove avatar");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                <button
                    className="group relative overflow-hidden rounded-full ring-2 ring-border transition-all hover:ring-4 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    type="button"
                >
                    <Avatar className="h-24 w-24 transition-all group-hover:scale-105">
                        <AvatarImage alt="User avatar" src={avatarUrl ?? undefined} />
                        <AvatarFallback className="font-bold text-2xl">{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <PhotoIcon className="h-8 w-8 text-white" />
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>Change your avatar by uploading an image or providing a URL</DialogDescription>
                </DialogHeader>

                <Tabs className="mt-4" defaultValue="upload">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">
                            <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="url">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            URL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent className="space-y-4" value="upload">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 ring-2 ring-border">
                                    {previewUrl ? (
                                        <AvatarImage alt="Preview" src={previewUrl} />
                                    ) : (
                                        <>
                                            <AvatarImage alt="Current avatar" src={avatarUrl ?? undefined} />
                                            <AvatarFallback className="font-bold text-3xl">{avatarFallback}</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                            </div>

                            <div className="w-full space-y-2">
                                <Label htmlFor="file-upload">Select Image</Label>
                                <Input
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                    disabled={isUploading}
                                    id="file-upload"
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    type="file"
                                />
                                <p className="text-muted-foreground text-xs">PNG, JPG, WEBP or GIF (max. 5MB)</p>
                            </div>

                            <div className="flex w-full gap-2">
                                <Button className="flex-1" disabled={isUploading || !fileInputRef.current?.files?.[0]} onClick={handleFileUpload}>
                                    {isUploading ? "Uploading..." : "Upload Image"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent className="space-y-4" value="url">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 ring-2 ring-border">
                                    {imageUrl ? (
                                        <AvatarImage alt="Preview" src={imageUrl} />
                                    ) : (
                                        <>
                                            <AvatarImage alt="Current avatar" src={avatarUrl ?? undefined} />
                                            <AvatarFallback className="font-bold text-3xl">{avatarFallback}</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                            </div>

                            <div className="w-full space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    disabled={isUploading}
                                    id="image-url"
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    type="url"
                                    value={imageUrl}
                                />
                                <p className="text-muted-foreground text-xs">Enter a direct link to an image</p>
                            </div>

                            <div className="flex w-full gap-2">
                                <Button className="flex-1" disabled={isUploading || !imageUrl.trim()} onClick={handleUrlUpload}>
                                    {isUploading ? "Saving..." : "Save URL"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {avatarUrl && (
                    <div className="border-t pt-4">
                        <Button className="w-full" disabled={isUploading} onClick={handleRemoveAvatar} variant="outline">
                            Remove Avatar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

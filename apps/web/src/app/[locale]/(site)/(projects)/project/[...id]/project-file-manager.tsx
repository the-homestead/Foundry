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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { AlertCircle, FileIcon, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { deleteProjectFile, uploadProjectFile } from "./actions";

interface ProjectFileManagerProps {
    projectSlug: string;
    canEdit: boolean;
    files: Array<{
        id?: string;
        name: string;
        version: string;
        size: string;
        uploaded: string;
        downloads: string;
        channel: string;
        path?: string;
    }>;
}

export function ProjectFileManager({ projectSlug, canEdit, files }: ProjectFileManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [version, setVersion] = useState("");
    const [channel, setChannel] = useState("stable");
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file");
            return;
        }

        if (!version) {
            setError("Please enter a version");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("version", version);
            formData.append("channel", channel);

            const result = await uploadProjectFile(projectSlug, formData, "files");

            if (result.error) {
                setError(result.error);
            } else {
                // Reset form
                setSelectedFile(null);
                setVersion("");
                setChannel("stable");

                // Reset file input
                const fileInput = document.getElementById("file-upload") as HTMLInputElement;
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

    const handleDelete = async (fileId: string, filePath: string) => {
        setDeleting(fileId);
        setError(null);

        try {
            const result = await deleteProjectFile(projectSlug, filePath, fileId);

            if (result.error) {
                setError(result.error);
            }
        } catch {
            setError("Failed to delete file");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            {canEdit && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload File</CardTitle>
                        <CardDescription>Add new files to your project. Maximum file size: 50MB</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-50 p-3 text-red-900 text-sm dark:bg-red-950/20 dark:text-red-100">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">File</Label>
                            <Input accept="*/*" id="file-upload" onChange={handleFileSelect} type="file" />
                            {selectedFile && (
                                <p className="text-muted-foreground text-sm">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="version">Version</Label>
                                <Input id="version" onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" value={version} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="channel">Release Channel</Label>
                                <Select onValueChange={setChannel} value={channel}>
                                    <SelectTrigger id="channel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="stable">Stable</SelectItem>
                                        <SelectItem value="beta">Beta</SelectItem>
                                        <SelectItem value="alpha">Alpha</SelectItem>
                                        <SelectItem value="legacy">Legacy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button className="w-full" disabled={uploading || !selectedFile || !version} onClick={handleUpload}>
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? "Uploading..." : "Upload File"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Files List */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Files</CardTitle>
                    <CardDescription>All files available for download</CardDescription>
                </CardHeader>
                <CardContent>
                    {files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <FileIcon className="mb-3 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">No files uploaded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {files.map((file) => (
                                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4" key={file.id || file.name}>
                                    <div className="flex items-start gap-3">
                                        <FileIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h4 className="font-medium">{file.name}</h4>
                                            <p className="text-muted-foreground text-sm">
                                                v{file.version} • {file.size} • {file.channel} • {file.downloads} downloads
                                            </p>
                                            <p className="text-muted-foreground text-xs">Uploaded: {file.uploaded}</p>
                                        </div>
                                    </div>

                                    {canEdit && file.id && file.path && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button disabled={deleting === file.id} size="sm" variant="ghost">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete File?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{file.name}"? This action cannot be undone and the file will be permanently removed from
                                                        storage and download history will be lost.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        onClick={() => {
                                                            if (file.id && file.path) {
                                                                handleDelete(file.id, file.path);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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

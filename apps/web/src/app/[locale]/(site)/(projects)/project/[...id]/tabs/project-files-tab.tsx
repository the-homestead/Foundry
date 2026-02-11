"use client";
import {
    ArchiveBoxArrowDownIcon,
    ClipboardIcon,
    TreeExpander,
    TreeIcon,
    TreeLabel,
    TreeNode,
    TreeNodeContent,
    TreeNodeTrigger,
    TreeProvider,
    TreeView,
} from "@foundry/ui/components";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { H3, P } from "@foundry/ui/typography";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProjectFileManager } from "../project-file-manager";
import type { FileTreeNode, OptionalDownloads, ProjectFile } from "./project-tabs.types";

export interface ProjectFilesTabProps {
    mainDownload: ProjectFile;
    optionalDownloads: OptionalDownloads;
    // legacy: per-project fileTree (optional). Prefer per-file `file.fileTree` instead.
    fileTree?: FileTreeNode[];
    projectSlug: string;
    canEdit?: boolean;
}

function FileTreeNodeComponent({ node, level = 0, isLast = false }: { node: FileTreeNode; level?: number; isLast?: boolean }) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    return (
        <TreeNode isLast={isLast} level={level} nodeId={node.id}>
            <TreeNodeTrigger>
                <TreeExpander hasChildren={hasChildren} />
                <TreeIcon hasChildren={hasChildren} />
                <TreeLabel>{node.name}</TreeLabel>
            </TreeNodeTrigger>
            {hasChildren && (
                <TreeNodeContent className="ml-2" hasChildren={hasChildren}>
                    {node.children?.map((child: FileTreeNode, i: number) => (
                        <FileTreeNodeComponent isLast={i === (node.children?.length ?? 0) - 1} key={child.id} level={level + 1} node={child} />
                    ))}
                </TreeNodeContent>
            )}
        </TreeNode>
    );
}

function FileCard({ file, variant = "list" }: { file: ProjectFile; variant?: "list" | "hero" }) {
    const [copied, setCopied] = useState(false);
    if (!file?.name) {
        return null;
    }
    const downloadUrl = `/download/${encodeURIComponent(file.name)}`;
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(location.origin + downloadUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // ignore
        }
    };

    if (variant === "hero") {
        return (
            <div className="mb-4 rounded-lg border bg-card p-4 shadow-sm" key={file.name}>
                {/* Banner */}
                {file.bannerURL ? (
                    <div className="mb-3 overflow-hidden rounded-md">
                        <Image alt={`${file.name} banner`} className="h-40 w-full object-cover" height={660} src={file.bannerURL} width={1240} />
                    </div>
                ) : null}
                <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="font-semibold text-lg">{file.name}</div>
                                <div className="mt-1 text-muted-foreground text-sm">
                                    v{file.version} • {file.size} • Uploaded: {file.uploaded}
                                </div>
                                {file.description && <div className="mt-2 text-muted-foreground text-sm">{file.description}</div>}
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="flex items-center gap-2">
                                    <Button asChild className="inline-flex items-center gap-2" size="lg">
                                        <a aria-label={`Download ${file.name}`} className="inline-flex items-center gap-2" download href={downloadUrl}>
                                            <ArchiveBoxArrowDownIcon className="size-4" />
                                            Download
                                        </a>
                                    </Button>
                                    <Button aria-label={`Copy link to ${file.name}`} onClick={copyLink} size="sm" variant="ghost">
                                        <ClipboardIcon className="size-4" />
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                    <Button asChild size="sm" variant="secondary">
                                        <a href={`${downloadUrl}?mirror=1`}>Mirror</a>
                                    </Button>
                                </div>
                                <div>
                                    <Badge variant="outline">{file.channel}</Badge>
                                </div>
                            </div>
                        </div>

                        <Tabs>
                            <TabsList
                                className="w-full border-b"
                                defaultValue={(() => {
                                    if (file.dependencies && file.dependencies.length > 0) {
                                        return "dependencies";
                                    }
                                    if (file.fileTree && file.fileTree.length > 0) {
                                        return "contents";
                                    }
                                    return "";
                                })()}
                            >
                                {file.dependencies && file.dependencies.length > 0 && <TabsTrigger value="dependencies">Dependencies</TabsTrigger>}
                                {file.fileTree && file.fileTree.length > 0 && <TabsTrigger value="contents">Contents</TabsTrigger>}
                            </TabsList>
                            {file.dependencies && file.dependencies.length > 0 && (
                                <TabsContent value="dependencies">
                                    <ul className="mt-2 ml-4 list-disc text-sm">
                                        {file.dependencies.map((dep) => (
                                            <li key={dep.url}>
                                                <a className="underline" href={dep.url} rel="noopener" target="_blank">
                                                    {dep.name} v{dep.version}
                                                    {dep.gameVersion && <span> (Game v{dep.gameVersion})</span>}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </TabsContent>
                            )}
                            {file.fileTree && file.fileTree.length > 0 && (
                                <TabsContent value="contents">
                                    <div className="mt-2">
                                        <TreeProvider
                                            animateExpand
                                            className="rounded-md border bg-muted p-2"
                                            defaultExpandedIds={file.fileTree.map((n) => n.id)}
                                            indent={16}
                                            showIcons
                                            showLines
                                        >
                                            <TreeView>
                                                {file.fileTree.map((node) => (
                                                    <FileTreeNodeComponent key={node.id} node={node} />
                                                ))}
                                            </TreeView>
                                        </TreeProvider>
                                    </div>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
                <P className="mt-2 text-center text-muted-foreground text-sm">
                    {file.downloads} downloads
                    {file.uniqueDownloads && <span> • {file.uniqueDownloads} unique</span>}
                    {file.lastDownloaded && <span> • Last: {file.lastDownloaded}</span>}
                </P>
            </div>
        );
    }

    return (
        <li className="flex items-start gap-4 border-b py-3" key={file.name}>
            {file.bannerURL ? (
                <div className="h-12 w-16 flex-none overflow-hidden rounded-md bg-muted">
                    <Image alt={file.name} className="object-cover" height={48} src={file.bannerURL} width={64} />
                </div>
            ) : (
                <div className="flex h-12 w-16 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground text-xs">ZIP</div>
            )}

            <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="mt-1 text-muted-foreground text-xs">
                            v{file.version} • {file.size}
                        </div>
                        {file.description && <div className="mt-1 truncate text-muted-foreground text-xs">{file.description}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button asChild className="w-full" size="sm">
                            <a aria-label={`Download ${file.name}`} className="inline-flex w-full items-center justify-center gap-2" download href={downloadUrl}>
                                <Download className="size-4" />
                                Download
                            </a>
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button aria-label={`Copy link to ${file.name}`} onClick={copyLink} size="sm" variant="ghost">
                                <Copy className="size-4" />
                            </Button>
                            <Button asChild size="sm" variant="secondary">
                                <a href={`${downloadUrl}?mirror=1`}>Mirror</a>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 text-muted-foreground text-xs">
                    <div>
                        {file.downloads} downloads
                        {file.uniqueDownloads && <span> • {file.uniqueDownloads} unique</span>}
                    </div>
                    {file.lastDownloaded && <div className="text-xs">Last: {file.lastDownloaded}</div>}
                </div>
                {file.fileTree && file.fileTree.length > 0 && (
                    <details className="mt-2 text-sm">
                        <summary className="cursor-pointer text-muted-foreground">Contents ({file.fileTree.length})</summary>
                        <div className="mt-2">
                            <TreeProvider
                                animateExpand
                                className="rounded-md border bg-muted p-2"
                                defaultExpandedIds={file.fileTree.map((n) => n.id)}
                                indent={16}
                                showIcons
                                showLines
                            >
                                <TreeView>
                                    {file.fileTree.map((node) => (
                                        <FileTreeNodeComponent key={node.id} node={node} />
                                    ))}
                                </TreeView>
                            </TreeProvider>
                        </div>
                    </details>
                )}
            </div>
        </li>
    );
}

export function ProjectFilesTab({ mainDownload, optionalDownloads, projectSlug, canEdit = false }: ProjectFilesTabProps) {
    const [sort, setSort] = useState<"newest" | "popular">("newest");
    const [activeCategory, setActiveCategory] = useState<string>(() => optionalDownloads?.categories?.[0]?.name ?? "");

    useEffect(() => {
        setActiveCategory(optionalDownloads?.categories?.[0]?.name ?? "");
    }, [optionalDownloads]);

    const sortFiles = (files: ProjectFile[]) => {
        const copy = [...files];
        if (sort === "popular") {
            return copy.sort((a, b) => Number(b.downloads.replace(/[^0-9]/g, "")) - Number(a.downloads.replace(/[^0-9]/g, "")));
        }
        // newest (fallback) - we don't have exact date parsing in mocks, so keep original order
        return copy;
    };

    const hasCategories = optionalDownloads?.categories && optionalDownloads.categories.length > 0;

    // Combine all files for the manager
    const allFiles = [
        mainDownload,
        ...(optionalDownloads?.files ?? []),
        ...(hasCategories && optionalDownloads.categories ? optionalDownloads.categories.flatMap((c) => c.files) : []),
    ];

    return (
        <div className="space-y-6">
            {/* File Manager (for owners/editors) */}
            {canEdit && <ProjectFileManager canEdit={canEdit} files={allFiles} projectSlug={projectSlug} />}

            {/* Downloads Display */}
            <Card>
                <CardHeader>
                    <CardTitle>Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Main Download */}
                    <div className="mb-6">
                        <H3 className="mb-2">Main Download</H3>
                        <FileCard file={mainDownload} variant="hero" />
                    </div>

                    {/* Optional Downloads */}
                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                            <H3 className="m-0">Optional Downloads</H3>
                            <div className="flex items-center gap-2">
                                <Select aria-label="Sort optional downloads" onValueChange={(v) => setSort(v as "newest" | "popular")} value={sort}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest</SelectItem>
                                        <SelectItem value="popular">Most downloaded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(() => {
                            if (hasCategories) {
                                return (
                                    <Tabs className="w-full" onValueChange={(v) => setActiveCategory(v)} value={activeCategory}>
                                        <TabsList>
                                            {optionalDownloads?.categories?.map((cat) => (
                                                <TabsTrigger className="capitalize" key={cat.name} value={cat.name}>
                                                    <span className="flex items-center gap-2">
                                                        <span className="capitalize">{cat.name}</span>
                                                        <Badge variant="outline">{cat.files.length}</Badge>
                                                    </span>
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        {optionalDownloads?.categories?.map((cat) => (
                                            <TabsContent key={cat.name} value={cat.name}>
                                                <ul className="space-y-4">
                                                    {sortFiles(cat.files).map((file) => (
                                                        <FileCard file={file} key={file.name} />
                                                    ))}
                                                </ul>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                );
                            }
                            if (optionalDownloads?.files && optionalDownloads.files.length > 0) {
                                return (
                                    <ul className="space-y-4">
                                        {sortFiles(optionalDownloads.files).map((file) => (
                                            <FileCard file={file} key={file.name} />
                                        ))}
                                    </ul>
                                );
                            }
                            return <div className="text-muted-foreground text-sm">No optional downloads available.</div>;
                        })()}
                    </div>

                    {/* Note: file-level trees are shown inline per-file when present. */}
                </CardContent>
            </Card>
        </div>
    );
}

import { TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent, TreeNodeTrigger, TreeProvider, TreeView } from "@foundry/ui/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import Image from "next/image";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectFilesTabProps {
    files: ProjectTabsProps["files"];
    fileTree: ProjectTabsProps["fileTree"];
}

function FileTreeNodeComponent({ node }: { node: ProjectTabsProps["fileTree"][number] }) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    return (
        <TreeNode isLast={false} level={0} nodeId={node.id}>
            <TreeNodeTrigger>
                <TreeExpander hasChildren={hasChildren} />
                <TreeIcon hasChildren={hasChildren} />
                <TreeLabel>{node.name}</TreeLabel>
            </TreeNodeTrigger>
            {hasChildren && (
                <TreeNodeContent hasChildren={hasChildren}>
                    {node.children?.map((child) => (
                        <FileTreeNodeComponent key={child.id} node={child} />
                    ))}
                </TreeNodeContent>
            )}
        </TreeNode>
    );
}
export function ProjectFilesTab({ files, fileTree }: ProjectFilesTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Files</CardTitle>
                <CardDescription>Downloadable releases and file tree.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="mb-4 space-y-4">
                    {files.map((file) => (
                        <li className="flex flex-col gap-2 border-b pb-4" key={file.name}>
                            <div className="flex items-center gap-3">
                                {file.bannerURL && <Image alt={file.name} className="rounded object-cover" height={40} src={file.bannerURL} width={64} />}
                                <div className="flex-1">
                                    <div className="font-medium text-base">{file.name}</div>
                                    <div className="text-muted-foreground text-xs">
                                        v{file.version} • {file.size} • Uploaded: {file.uploaded}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        {file.downloads} downloads
                                        {file.uniqueDownloads && <span> • {file.uniqueDownloads} unique</span>}
                                        {file.lastDownloaded && <span> • Last: {file.lastDownloaded}</span>}
                                    </div>
                                    <div className="mt-1 flex gap-2">
                                        <span className="badge badge-secondary">{file.channel}</span>
                                    </div>
                                </div>
                            </div>
                            {file.dependencies && file.dependencies.length > 0 && (
                                <div className="mt-1 ml-16">
                                    <div className="font-semibold text-xs">Dependencies:</div>
                                    <ul className="ml-2 list-disc text-xs">
                                        {file.dependencies.map((dep) => (
                                            <li key={dep.url}>
                                                <a className="underline" href={dep.url} rel="noopener" target="_blank">
                                                    {dep.name} v{dep.version}
                                                    {dep.gameVersion && <span> (Game v{dep.gameVersion})</span>}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                <Card>
                    <CardHeader>
                        <CardTitle>File Tree</CardTitle>
                        <CardDescription>Explore the latest upload's structure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TreeProvider animateExpand indent={20} showIcons showLines>
                            <TreeView>
                                {fileTree.map((node) => (
                                    <FileTreeNodeComponent key={node.id} node={node} />
                                ))}
                            </TreeView>
                        </TreeProvider>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}

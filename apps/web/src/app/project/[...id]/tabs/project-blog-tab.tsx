import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectBlogTabProps {
    posts: ProjectTabsProps["posts"];
}

export function ProjectBlogTab({ posts }: ProjectBlogTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Blog</CardTitle>
                <CardDescription>Release notes and updates.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {posts.map((post) => (
                        <li className="border-b pb-2" key={post.title}>
                            <div className="font-semibold">{post.title}</div>
                            <div className="text-muted-foreground text-xs">
                                {post.date} • {post.comments} comments
                            </div>
                            <div className="text-sm">{post.excerpt}</div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

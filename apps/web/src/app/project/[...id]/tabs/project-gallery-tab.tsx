import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectGalleryTabProps {
    gallery: ProjectTabsProps["gallery"];
}

export function ProjectGalleryTab({ gallery }: ProjectGalleryTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gallery</CardTitle>
                <CardDescription>Preview images and themes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {gallery.map((img) => (
                    <div className={`rounded-lg bg-gradient-to-br p-4 ${img.tone}`} key={img.title} style={{ aspectRatio: img.aspect }}>
                        <div className="font-semibold text-lg text-white drop-shadow">{img.title}</div>
                        <div className="text-white/80 text-xs">Aspect: {img.aspect}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

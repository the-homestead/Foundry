"use client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@foundry/ui/primitives/carousel";
import Image from "next/image";
import { ProjectGalleryManager } from "../project-gallery-manager";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectGalleryTabProps {
    gallery: ProjectTabsProps["gallery"];
    projectSlug: string;
    canEdit?: boolean;
}

export function ProjectGalleryTab({ gallery, projectSlug, canEdit = false }: ProjectGalleryTabProps) {
    const hasGallery = gallery && gallery.length > 0;
    const shouldShowEmptyMessage = !(hasGallery || canEdit);

    return (
        <div className="space-y-6">
            {/* Gallery Manager (for owners/editors) */}
            {canEdit && (
                <ProjectGalleryManager
                    canEdit={canEdit}
                    gallery={(gallery ?? []).map((item, idx) => ({
                        id: (item as any).id ?? `${projectSlug}-${idx}`,
                        title: item.title,
                        tone: item.tone,
                        aspect: item.aspect,
                        image: item.image,
                    }))}
                    projectSlug={projectSlug}
                />
            )}

            {/* Gallery Display (for everyone) */}
            {shouldShowEmptyMessage && <div className="rounded-md border p-4 text-muted-foreground text-sm">No gallery items</div>}

            {hasGallery && (
                <div className="p-12">
                    <Carousel opts={{ align: "center", loop: true }}>
                        <CarouselContent>
                            {gallery.map((g, i) => (
                                <CarouselItem key={g.title}>
                                    <div className="flex h-full w-full items-center justify-center">
                                        {g.image
                                            ? (() => {
                                                  const imgWrapperClass = ["relative", "w-full", "max-h-[70vh]"].join(" ");
                                                  return (
                                                      <div className={imgWrapperClass} style={{ aspectRatio: g.aspect }}>
                                                          <Image
                                                              alt={g.title}
                                                              className="rounded-md object-cover"
                                                              fill
                                                              priority={i === 0}
                                                              quality={90}
                                                              sizes="100vw"
                                                              src={g.image as string}
                                                          />
                                                      </div>
                                                  );
                                              })()
                                            : (() => {
                                                  const placeholderClass = ["rounded-md", "border", "p-8", "text-center", g.tone].join(" ");
                                                  return (
                                                      <div className={placeholderClass}>
                                                          <div className="font-semibold text-lg text-white">{g.title}</div>
                                                          <div className="text-sm text-white/80">No image available</div>
                                                      </div>
                                                  );
                                              })()}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            )}
        </div>
    );
}

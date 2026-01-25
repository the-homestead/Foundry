"use client";

export interface ProjectHeaderProps {
    project: {
        title: string;
        game: string;
        summary: string;
        version: string;
        updated: string;
        downloads: string;
        views: string;
        rating: string;
    };
    onAddToCollection?: () => void;
    onDownload?: () => void;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    // Stub functions for demo
    const onAddToCollection = () => {
        // Stub: Add to collection logic
    };
    const onDownload = () => {
        // Stub: Download logic
    };
    return (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl leading-tight tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground text-sm">{project.summary}</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={onDownload} type="button">
                        Download
                    </button>
                    <button className="btn btn-outline" onClick={onAddToCollection} type="button">
                        Add to Collection
                    </button>
                </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
                <span>
                    Game: <b>{project.game}</b>
                </span>
                <span>
                    Version: <b>{project.version}</b>
                </span>
                <span>
                    Updated: <b>{project.updated}</b>
                </span>
                <span>
                    Downloads: <b>{project.downloads}</b>
                </span>
                <span>
                    Views: <b>{project.views}</b>
                </span>
                <span>
                    Rating: <b>{project.rating}</b>
                </span>
            </div>
        </section>
    );
}

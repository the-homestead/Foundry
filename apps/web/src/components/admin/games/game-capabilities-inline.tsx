"use client";

import { Button } from "@foundry/ui/primitives/button";
import { updateGame } from "@foundry/web/actions/games";
import { TagsInput } from "@foundry/web/components/ui/tags-input";
import { Check, Edit, Loader2, X as XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    gameId: string;
    versions: string[];
    modloaders: string[];
    // required for updateGame payload
    name: string;
    slug: string;
    description: string;
    images?: { icon?: string; cover?: string; background?: string };
}

export function GameCapabilitiesInline({ gameId, versions, modloaders, name, slug, description, images }: Props) {
    const [editing, setEditing] = useState(false);
    const [localVersions, setLocalVersions] = useState(versions.join(", "));
    const [localModloaders, setLocalModloaders] = useState(modloaders.join(", "));
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateGame(gameId, {
                name: name || "",
                slug: slug || "",
                description: description || "",
                images: {
                    cover: images?.cover || "",
                    icon: images?.icon || "",
                    background: images?.background || "",
                },
                capabilities: {
                    versions: localVersions,
                    modloaders: localModloaders,
                },
            });

            if (result?.error) {
                toast.error(typeof result.error === "string" ? result.error : "Failed to save capabilities");
            } else {
                toast.success("Capabilities updated");
                setEditing(false);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save capabilities");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-3">
            {editing ? (
                <div className="space-y-4">
                    <div>
                        <div className="mb-2 text-muted-foreground text-sm">Game Versions</div>
                        <TagsInput onChange={setLocalVersions} placeholder="Type version and press Enter..." value={localVersions} />
                    </div>

                    <div>
                        <div className="mb-2 text-muted-foreground text-sm">Mod Loaders</div>
                        <TagsInput onChange={setLocalModloaders} placeholder="Type loader and press Enter..." value={localModloaders} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button disabled={saving} onClick={handleSave}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                        <Button disabled={saving} onClick={() => setEditing(false)} variant="ghost">
                            <XIcon className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="mb-2 text-muted-foreground text-sm">Game Versions</div>
                        <div className="flex flex-wrap gap-2">
                            {versions.map((v) => (
                                <span className="rounded-md bg-muted px-2 py-1 text-sm" key={v}>
                                    {v}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 mb-2 text-muted-foreground text-sm">Mod Loaders</div>
                        <div className="flex flex-wrap gap-2">
                            {modloaders.map((m) => (
                                <span className="rounded-md bg-muted px-2 py-1 text-sm" key={m}>
                                    {m}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Button onClick={() => setEditing(true)} size="sm" variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

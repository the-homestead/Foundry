"use client";

import { CheckIcon, ClockIcon } from "@foundry/ui/icons";
import { Button } from "@foundry/ui/primitives/button";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { isGameSlugAvailable, updateGame } from "@foundry/web/actions/games";
import { gameFormSchema } from "@foundry/web/lib/schemas/games";
import { Check, Loader2, Pencil, X as XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
    gameId: string;
    label: string;
    field: "name" | "slug" | "description";
    value: string | null | undefined;
    // original values (used to build a complete payload when saving a single field)
    originalName: string;
    originalSlug: string;
    originalDescription: string;
    images: { icon?: string; cover?: string; background?: string } | undefined;
    capabilities: { versions?: string[]; modloaders?: string[] } | undefined;
}

function SlugHelp({ gameId, slugError, checkingSlug, slugAvailable }: { gameId: string; slugError: string | null; checkingSlug: boolean; slugAvailable: boolean | null }) {
    return (
        <div aria-live="polite" className="mt-1" id={`${gameId}-slug-help`}>
            {slugError ? <p className="text-destructive text-sm">{slugError}</p> : null}

            {!slugError && checkingSlug ? (
                <p className="text-muted-foreground text-sm">
                    <ClockIcon className="mr-2 inline-block animate-spin align-middle text-muted-foreground" size={14} />
                    Checking availability…
                </p>
            ) : null}

            {!slugError && slugAvailable ? (
                <p className="text-green-600 text-sm">
                    <CheckIcon className="mr-2 inline-block align-middle text-green-600" size={14} />
                    Slug is available
                </p>
            ) : null}
        </div>
    );
}

export function GameFieldEditable({ gameId, label, field, value = "", images, capabilities, originalName, originalSlug, originalDescription }: Props) {
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(String(value ?? ""));
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const isTextarea = field === "description";
    const [slugError, setSlugError] = useState<string | null>(null);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [checkingSlug, setCheckingSlug] = useState(false);
    !slugError && checkingSlug ? (
        <p className="text-muted-foreground text-sm">
            <ClockIcon className="mr-2 inline-block animate-spin align-middle text-muted-foreground" size={14} />
            Checking availability…
        </p>
    ) : null;

    const buildPayload = () => {
        !slugError && slugAvailable ? (
            <p className="text-green-600 text-sm">
                <CheckIcon className="mr-2 inline-block align-middle text-green-600" size={14} />
                Slug is available
            </p>
        ) : null;
        return {
            name: field === "name" ? input : originalName || "",
            slug: field === "slug" ? input : originalSlug || "",
            description: field === "description" ? input : originalDescription || "",
            images: {
                cover: images?.cover || "",
                icon: images?.icon || "",
                background: images?.background || "",
            },
            capabilities: {
                versions: (capabilities?.versions || []).join(", "),
                modloaders: (capabilities?.modloaders || []).join(", "),
            },
        } as const;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateGame(gameId, buildPayload());

            if (result?.error) {
                toast.error(typeof result.error === "string" ? result.error : "Failed to save");
            } else {
                toast.success(`${label} updated`);
                setEditing(false);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to save ${label}`);
        } finally {
            setSaving(false);
        }
    };

    // debounce slug availability + inline validation
    useEffect(() => {
        if (field !== "slug") {
            return;
        }

        const value = String(input ?? "").trim();

        // run zod sync validation first
        const res = gameFormSchema.shape.slug.safeParse(value);
        if (!res.success) {
            setSlugError(res.error.issues[0]?.message ?? "Invalid slug");
            setSlugAvailable(false);
            return;
        }

        setSlugError(null);
        setSlugAvailable(null);

        if (!value) {
            setSlugAvailable(false);
            return;
        }

        const id = setTimeout(async () => {
            try {
                setCheckingSlug(true);
                const r = await isGameSlugAvailable(gameId, value);
                setSlugAvailable(Boolean(r?.available));
                setSlugError(r?.available ? null : "Slug already exists");
            } catch (err) {
                // network / server error — don't block the user, show soft warning
                console.warn("slug check failed:", err);
            } finally {
                setCheckingSlug(false);
            }
        }, 400);

        return () => clearTimeout(id);
    }, [input, field, gameId]);

    const handleCancel = () => {
        setInput(String(value ?? ""));
        setEditing(false);
    };

    if (!editing) {
        // Description needs a multi-line preview (don't hide the text in a single-line box)
        if (field === "description") {
            return (
                <div className="group space-y-2">
                    <Label>{label}</Label>
                    <div className="rounded-md border p-3">
                        <div className="max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground text-sm">{value ?? "—"}</div>
                        <div className="mt-3 flex justify-end">
                            <button aria-label={`Edit ${label}`} className="text-muted-foreground opacity-100 hover:text-foreground" onClick={() => setEditing(true)} type="button">
                                <Pencil className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="group space-y-2">
                <Label>{label}</Label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-transparent px-3 transition-colors hover:border-border">
                    <span className="flex-1 truncate">{value ?? "—"}</span>
                    <button aria-label={`Edit ${label}`} className="opacity-0 group-hover:opacity-60" onClick={() => setEditing(true)} type="button">
                        <Pencil className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-start gap-2">
                <div className="flex-1">
                    {isTextarea ? (
                        <Textarea
                            autoFocus
                            className="min-h-[220px] w-full resize-y"
                            onChange={(e) => {
                                setInput(e.target.value);
                                // auto-grow using the DOM target
                                try {
                                    const t = e.target as HTMLTextAreaElement;
                                    t.style.height = "auto";
                                    t.style.height = `${Math.max(t.scrollHeight, 120)}px`;
                                } catch (_err) {
                                    /* ignore */
                                }
                            }}
                            onFocus={(e) => {
                                const t = e.currentTarget as HTMLTextAreaElement;
                                t.style.height = "auto";
                                t.style.height = `${Math.max(t.scrollHeight, 120)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.stopPropagation();
                                    handleCancel();
                                }
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    if (!saving) {
                                        handleSave();
                                    }
                                }
                            }}
                            value={input}
                        />
                    ) : (
                        <>
                            <Input
                                aria-describedby={field === "slug" ? `${gameId}-slug-help` : undefined}
                                aria-invalid={field === "slug" && Boolean(slugError) ? true : undefined}
                                autoFocus
                                className="w-full"
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();

                                        // prevent save when slug invalid / checking
                                        if (field === "slug" && (slugError || checkingSlug || slugAvailable === false)) {
                                            return;
                                        }

                                        if (!saving) {
                                            handleSave();
                                        }
                                    }

                                    if (e.key === "Escape") {
                                        handleCancel();
                                    }
                                }}
                                value={input}
                            />

                            {field === "slug" ? <SlugHelp checkingSlug={checkingSlug} gameId={gameId} slugAvailable={slugAvailable} slugError={slugError} /> : null}
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Button disabled={saving || (field === "slug" && (Boolean(slugError) || checkingSlug || slugAvailable === false))} onClick={handleSave} size="icon">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button disabled={saving} onClick={handleCancel} size="icon" variant="ghost">
                        <XIcon className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

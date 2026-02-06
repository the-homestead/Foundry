"use client";

import { PaintBrushIcon } from "@foundry/ui/icons";
import { type AccentColor, type BaseTheme, THEMES } from "@foundry/ui/lib/theme-config";
import { cn } from "@foundry/ui/lib/utils";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent } from "@foundry/ui/primitives/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@foundry/ui/primitives/sheet";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "../../providers/theme-provider";

function getThemeIcon(key: string) {
    switch (key) {
        case "light":
            return <Sun className="h-4 w-4" />;
        case "dark":
            return <Moon className="h-4 w-4" />;
        case "system":
            return <Monitor className="h-4 w-4" />;
        default:
            return (
                <div
                    className={cn(
                        "h-4 w-4 rounded-full border-2",
                        key.startsWith("latte") && "bg-gradient-to-br from-blue-200 to-blue-400",
                        key.startsWith("mocha") && "bg-gradient-to-br from-gray-800 to-gray-600",
                        key.startsWith("frappe") && "bg-gradient-to-br from-slate-700 to-slate-500",
                        key.startsWith("macchiato") && "bg-gradient-to-br from-indigo-800 to-indigo-600"
                    )}
                />
            );
    }
}

// descriptions are provided via translations (see /apps/web/messages/*.json)

export function ThemeSheet({ triggerClassName }: { triggerClassName?: string }) {
    const { theme, color, setTheme, setColor } = useTheme();
    const activeTheme = THEMES[theme];
    const t = useTranslations("Theme");

    // compute translation maps in an effect to avoid calling t() synchronously during render
    const [themeLabels, setThemeLabels] = useState<Record<string, string>>(() => Object.fromEntries(Object.keys(THEMES).map((k) => [k, THEMES[k as BaseTheme].label])));

    const [themeDescriptions, setThemeDescriptions] = useState<Record<string, string>>(() => Object.fromEntries(Object.keys(THEMES).map((k) => [k, ""])));

    const [colorLabels, setColorLabels] = useState<Record<string, string>>(() => ({}));

    // Only run when translation function changes
    useEffect(() => {
        // build labels/descriptions safely and only set state if values changed
        const newLabels = Object.fromEntries(
            Object.keys(THEMES).map((k) => {
                try {
                    const v = t(`labels.${k}`) as string;
                    return [k, v || THEMES[k as BaseTheme].label];
                } catch {
                    return [k, THEMES[k as BaseTheme].label];
                }
            })
        ) as Record<string, string>;

        const newDescriptions = Object.fromEntries(
            Object.keys(THEMES).map((k) => {
                try {
                    const v = t(`descriptions.${k}`) as string;
                    return [k, v || ""];
                } catch {
                    return [k, ""];
                }
            })
        ) as Record<string, string>;

        setThemeLabels((prev) => {
            return JSON.stringify(prev) === JSON.stringify(newLabels) ? prev : newLabels;
        });
        setThemeDescriptions((prev) => {
            return JSON.stringify(prev) === JSON.stringify(newDescriptions) ? prev : newDescriptions;
        });
        // Only run when translation function changes
    }, [t]);

    // Recompute color labels when theme or translations change
    useEffect(() => {
        if (!activeTheme?.colors) {
            setColorLabels({});
            return;
        }

        const newColors = Object.fromEntries(
            Object.entries(activeTheme.colors).map(([k, c]) => {
                try {
                    const v = t(`colors.${k}`) as string;
                    return [k, v || c.label];
                } catch {
                    return [k, c.label];
                }
            })
        ) as Record<string, string>;

        setColorLabels((prev) => (JSON.stringify(prev) === JSON.stringify(newColors) ? prev : newColors));
        // Recompute color labels when theme or translations change
    }, [activeTheme, t]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className={cn("h-9 w-9 p-0", triggerClassName)} type="button" variant="outline">
                    <PaintBrushIcon size={20} />
                </Button>
            </SheetTrigger>

            <SheetContent className="w-[480px] overflow-y-auto" side="right">
                <SheetHeader className="pb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        {t("sheet.title")}
                    </SheetTitle>
                    <SheetDescription>{t("sheet.description")}</SheetDescription>
                </SheetHeader>

                <div className="space-y-8 p-6">
                    {/* Standard themes */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">{t("sheet.header_standard")}</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {["light", "dark", "system"].map((key) => (
                                        <Button
                                            className={cn("h-auto justify-start p-3 transition-all", theme === key && "ring-2 ring-primary ring-offset-2")}
                                            key={key}
                                            onClick={() => setTheme(key as BaseTheme)}
                                            type="button"
                                            variant={theme === key ? "default" : "outline"}
                                        >
                                            <div className="flex w-full items-center gap-3">
                                                {getThemeIcon(key)}
                                                <div className="flex-1 text-left">
                                                    <div className={cn("font-medium text-sm", theme === key && "text-primary-foreground")}>{themeLabels[key]}</div>
                                                    <div className={cn("text-xs", theme === key ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                        {themeDescriptions[key]}
                                                    </div>
                                                </div>
                                                {theme === key && <Check className="h-4 w-4" />}
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Catppuccin themes */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">{t("sheet.header_catppuccin")}</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {["latte", "mocha", "frappe", "macchiato"].map((key) => (
                                        <Button
                                            className={cn("h-auto justify-start p-3 transition-all", theme === key && "ring-2 ring-primary ring-offset-2")}
                                            key={key}
                                            onClick={() => setTheme(key as BaseTheme)}
                                            type="button"
                                            variant={theme === key ? "default" : "outline"}
                                        >
                                            <div className="flex w-full items-center gap-3">
                                                {getThemeIcon(key)}
                                                <div className="min-w-0 flex-1 text-left">
                                                    <div className={cn("truncate font-medium text-sm", theme === key && "text-primary-foreground")}>{themeLabels[key]}</div>
                                                    <div className={cn("truncate text-xs", theme === key ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                        {themeDescriptions[key]}
                                                    </div>
                                                </div>
                                                {theme === key && <Check className="h-4 w-4 flex-shrink-0" />}
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accent colors */}
                    {activeTheme?.colors && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-sm">{t("sheet.header_accent")}</h3>
                                        <div className="ml-2 truncate text-muted-foreground text-xs">{colorLabels[color] ?? activeTheme.colors[color]?.label ?? ""} selected</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-4 gap-2">
                                            {Object.entries(activeTheme.colors).map(([key, c]) => (
                                                <button
                                                    className={cn(
                                                        "group relative h-12 w-full rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                                        color === key ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary/50"
                                                    )}
                                                    key={key}
                                                    onClick={() => setColor(key as AccentColor)}
                                                    style={{ backgroundColor: c.preview }}
                                                    title={colorLabels[key] ?? c.label}
                                                    type="button"
                                                >
                                                    {color === key && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="rounded-full bg-background/90 p-0.5">
                                                                <Check className="h-2.5 w-2.5 text-foreground" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-muted-foreground text-xs">
                                            {Object.entries(activeTheme.colors).map(([key, c]) => (
                                                <div className="truncate text-center" key={key}>
                                                    {colorLabels[key] ?? c.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

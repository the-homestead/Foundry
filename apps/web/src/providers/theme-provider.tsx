"use client";

import { type AccentColor, type BaseTheme, THEMES } from "@foundry/ui/lib/theme-config";
import { useTheme as useNextTheme } from "next-themes";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from "react";

interface ThemeState {
    theme: BaseTheme;
    color: AccentColor;
}

type ThemeContextType = ThemeState & {
    setTheme: (theme: BaseTheme) => void;
    setColor: (color: AccentColor) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "ui-theme";

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { setTheme: setNextTheme } = useNextTheme();
    const [state, setState] = useState<ThemeState>({
        theme: "system",
        color: "base",
    });

    // Synchronously apply theme + load from storage to avoid flicker.
    const applyState = useCallback(
        (s: ThemeState) => {
            const body = document.body;

            // Remove all known theme + color classes
            // biome-ignore lint/complexity/noForEach: teehhee
            Object.values(THEMES).forEach((t) => {
                if (t.baseClass) {
                    body.classList.remove(t.baseClass);
                }
                // biome-ignore lint/complexity/noForEach: teehee
                Object.values(t.colors ?? {}).forEach((c) => {
                    if (c.className) {
                        body.classList.remove(c.className);
                    }
                });
            });

            const config = THEMES[s.theme];

            // Handle light/dark/system with next-themes
            if (s.theme === "light" || s.theme === "dark" || s.theme === "system") {
                setNextTheme(s.theme);
            }

            // Apply Catppuccin themes if they have baseClass
            if (config?.baseClass) {
                body.classList.add(config.baseClass);
            }

            const colorClass = config?.colors?.[s.color]?.className ?? "";

            if (colorClass) {
                body.classList.add(colorClass);
            }
        },
        [setNextTheme]
    );

    // Read stored state and apply synchronously to avoid flash and to ensure
    // that themes are reapplied immediately when returning to the site.
    useLayoutEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<ThemeState> | null;
                if (parsed) {
                    setState((s) => {
                        const next = { theme: parsed.theme ?? s.theme, color: parsed.color ?? s.color };
                        applyState(next);
                        return next;
                    });
                }
            } else {
                // Still apply default on first load
                applyState(state);
            }
        } catch (_e) {
            // If parsing fails, apply current in-memory state
            applyState(state);
        }

        // Sync across tabs: if another tab updates the theme, adopt it
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue) as Partial<ThemeState> | null;
                    if (parsed) {
                        setState((s) => {
                            const next = { theme: parsed.theme ?? s.theme, color: parsed.color ?? s.color };
                            applyState(next);
                            return next;
                        });
                    }
                } catch {
                    /* ignore */
                }
            }
        };

        // Reapply when the page becomes visible (handles system theme changes)
        const onVisibility = () => {
            if (document.visibilityState === "visible") {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    const parsed = raw ? (JSON.parse(raw) as Partial<ThemeState>) : null;
                    const next = { theme: parsed?.theme ?? state.theme, color: parsed?.color ?? state.color };
                    applyState(next);
                } catch {
                    applyState(state);
                }
            }
        };

        window.addEventListener("storage", onStorage);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            window.removeEventListener("storage", onStorage);
            document.removeEventListener("visibilitychange", onVisibility);
            try {
                document.documentElement.classList.remove("theme-loading");
            } catch {
                /* ignore */
            }
        };
        // We intentionally omit 'state' here because we want to read the
        // stored state on mount and when storage changes. applyState reads
        // from its closure and setState is used when needed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applyState, state]);

    // Persist and apply whenever state changes
    useLayoutEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // ignore storage quota issues
        }
        applyState(state);
    }, [state, applyState]);

    const value: ThemeContextType = {
        ...state,
        setTheme: (theme) =>
            setState((_s) => ({
                theme,
                color: "base", // reset color when switching theme
            })),
        setColor: (color) => setState((s) => ({ ...s, color })),
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used in ThemeProvider");
    }
    return ctx;
}

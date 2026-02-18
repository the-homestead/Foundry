"use client";

import { type AccentColor, type BaseTheme, THEMES } from "@foundry/ui/lib/theme-config";
import { useTheme as useNextTheme } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

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

    // Keep a ref to the current state so effects that intentionally don't
    // depend on `state` can still access the latest values without forcing
    // the effect to re-run on every state change.
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

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
                        // Only update/apply if something actually changed to avoid an update loop
                        if (next.theme === s.theme && next.color === s.color) {
                            return s;
                        }
                        applyState(next);
                        return next;
                    });
                }
            } else {
                // Still apply default on first load - use the ref so we don't depend on state
                applyState(stateRef.current);
            }
        } catch (_e) {
            // If parsing fails, apply current in-memory state
            applyState(stateRef.current);
        }

        // Sync across tabs: if another tab updates the theme, adopt it
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue) as Partial<ThemeState> | null;
                    if (parsed) {
                        setState((s) => {
                            const next = { theme: parsed.theme ?? s.theme, color: parsed.color ?? s.color };
                            // Only update/apply if something actually changed to avoid an update loop
                            if (next.theme === s.theme && next.color === s.color) {
                                return s;
                            }
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
                    const next = { theme: parsed?.theme ?? stateRef.current.theme, color: parsed?.color ?? stateRef.current.color };
                    applyState(next);
                } catch {
                    applyState(stateRef.current);
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
        // Only re-run if applyState identity changes.
        // We intentionally omit 'state' here to avoid this effect running on every
        // theme change which can trigger reentrant updates. applyState reads from
        // its closure and setState is used when needed.
        // Disable the exhaustive deps correctness rule for this effect on purpose.
        // eslint-disable-next-line lint/correctness/useExhaustiveDependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applyState]);

    // Persist and apply whenever state changes
    useLayoutEffect(() => {
        // Avoid reapplying/writing if the state is identical to the last applied state.
        // This prevents potential update loops where applyState or storage events
        // inadvertently cause re-renders that would re-trigger this effect.
        const last = lastAppliedRef.current;
        const currentJson = JSON.stringify(state);
        if (last === currentJson) {
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, currentJson);
        } catch {
            // ignore storage quota issues
        }
        applyState(state);
        lastAppliedRef.current = currentJson;
    }, [state, applyState]);

    const lastAppliedRef = useRef<string | null>(null);

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

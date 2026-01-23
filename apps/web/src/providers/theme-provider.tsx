"use client";

import { type AccentColor, type BaseTheme, THEMES } from "@foundry/ui/lib/theme-config";
import { useTheme as useNextTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

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

    // Load from storage
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            setState(JSON.parse(raw));
        }
    }, []);

    // Apply classes and next-themes integration
    useEffect(() => {
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

        const config = THEMES[state.theme];

        // Handle light/dark/system with next-themes
        if (state.theme === "light" || state.theme === "dark" || state.theme === "system") {
            setNextTheme(state.theme);
        }

        // Apply Catppuccin themes if they have baseClass
        if (config?.baseClass) {
            body.classList.add(config.baseClass);
        }

        const colorClass = config?.colors?.[state.color]?.className ?? "";

        if (colorClass) {
            body.classList.add(colorClass);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state, setNextTheme]);

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

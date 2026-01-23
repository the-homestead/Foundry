export type BaseTheme = "light" | "dark" | "system" | "latte" | "mocha" | "frappe" | "macchiato";

export type AccentColor = "base" | "flamingo" | "green" | "lavender" | "maroon" | "mauve" | "peach" | "pink" | "red" | "rosewater" | "sapphire" | "sky" | "teal" | "yellow";

export interface ThemeConfig {
    label: string;
    baseClass?: string; // applied to body
    colors?: Record<
        AccentColor,
        {
            label: string;
            className: string;
            preview: string; // used for color box UI
        }
    >;
}

export const THEMES: Record<BaseTheme, ThemeConfig> = {
    light: {
        label: "Light (Default)",
    },
    dark: {
        label: "Dark (Default)",
    },
    system: {
        label: "System",
    },

    latte: {
        label: "Latte",
        baseClass: "latte-base",
        colors: {
            base: {
                label: "Blue",
                className: "",
                preview: "hsl(220 91% 54%)",
            },
            flamingo: {
                label: "Flamingo",
                className: "latte-flamingo",
                preview: "hsl(0 60% 67%)",
            },
            green: {
                label: "Green",
                className: "latte-green",
                preview: "hsl(109 58% 40%)",
            },
            lavender: {
                label: "Lavender",
                className: "latte-lavender",
                preview: "hsl(220 23% 95%)",
            },
            maroon: {
                label: "Maroon",
                className: "latte-maroon",
                preview: "hsl(355 76% 59%)",
            },
            mauve: {
                label: "Mauve",
                className: "latte-mauve",
                preview: "hsl(266 85% 58%)",
            },
            peach: {
                label: "Peach",
                className: "latte-peach",
                preview: "hsl(22 99% 52%)",
            },
            pink: {
                label: "Pink",
                className: "latte-pink",
                preview: "hsl(316 73% 69%)",
            },
            red: {
                label: "Red",
                className: "latte-red",
                preview: "hsl(347 87% 44%)",
            },
            rosewater: {
                label: "Rosewater",
                className: "latte-rosewater",
                preview: "hsl(11 59% 67%)",
            },
            sapphire: {
                label: "Sapphire",
                className: "latte-sapphire",
                preview: "hsl(190 70% 42%)",
            },
            sky: {
                label: "Sky",
                className: "latte-sky",
                preview: "hsl(197 97% 46%)",
            },
            teal: {
                label: "Teal",
                className: "latte-teal",
                preview: "hsl(183 74% 35%)",
            },
            yellow: {
                label: "Yellow",
                className: "latte-yellow",
                preview: "hsl(35 77% 49%)",
            },
        },
    },

    mocha: {
        label: "Mocha",
        baseClass: "mocha-base",
        colors: {
            base: {
                label: "Blue",
                className: "",
                preview: "hsl(217 91.87% 75.88%)",
            },
            flamingo: {
                label: "Flamingo",
                className: "mocha-flamingo",
                preview: "hsl(0 58.73% 87.65%)",
            },
            green: {
                label: "Green",
                className: "mocha-green",
                preview: "hsl(115 54.10% 76.08%)",
            },
            lavender: {
                label: "Lavender",
                className: "mocha-lavender",
                preview: "hsl(232 97.37% 85.10%)",
            },
            maroon: {
                label: "Maroon",
                className: "mocha-maroon",
                preview: "hsl(350 65.22% 77.45%)",
            },
            mauve: {
                label: "Mauve",
                className: "mocha-mauve",
                preview: "hsl(267 83.51% 80.98%)",
            },
            peach: {
                label: "Peach",
                className: "mocha-peach",
                preview: "hsl(23 92.00% 75.49%)",
            },
            pink: {
                label: "Pink",
                className: "mocha-pink",
                preview: "hsl(316 71.83% 86.08%)",
            },
            red: {
                label: "Red",
                className: "mocha-red",
                preview: "hsl(343 81.25% 74.90%)",
            },
            rosewater: {
                label: "Rosewater",
                className: "mocha-rosewater",
                preview: "hsl(10 55.56% 91.18%)",
            },
            sapphire: {
                label: "Sapphire",
                className: "mocha-sapphire",
                preview: "hsl(199 75.95% 69.02%)",
            },
            sky: {
                label: "Sky",
                className: "mocha-sky",
                preview: "hsl(189 71.01% 72.94%)",
            },
            teal: {
                label: "Teal",
                className: "mocha-teal",
                preview: "hsl(170 57.35% 73.33%)",
            },
            yellow: {
                label: "Yellow",
                className: "mocha-yellow",
                preview: "hsl(41 86.05% 83.14%)",
            },
        },
    },

    frappe: {
        label: "Frappe",
        baseClass: "frappe-base",
        colors: {
            base: {
                label: "Blue",
                className: "",
                preview: "hsl(222 74.24% 74.12%)",
            },
            flamingo: {
                label: "Flamingo",
                className: "frappe-flamingo",
                preview: "hsl(0 58.54% 83.92%)",
            },
            green: {
                label: "Green",
                className: "frappe-green",
                preview: "hsl(96 43.90% 67.84%)",
            },
            lavender: {
                label: "Lavender",
                className: "frappe-lavender",
                preview: "hsl(239 66.27% 83.73%)",
            },
            maroon: {
                label: "Maroon",
                className: "frappe-maroon",
                preview: "hsl(358 65.85% 75.88%)",
            },
            mauve: {
                label: "Mauve",
                className: "frappe-mauve",
                preview: "hsl(277 59.02% 76.08%)",
            },
            peach: {
                label: "Peach",
                className: "frappe-peach",
                preview: "hsl(20 79.08% 70.00%)",
            },
            pink: {
                label: "Pink",
                className: "frappe-pink",
                preview: "hsl(316 73.17% 83.92%)",
            },
            red: {
                label: "Red",
                className: "frappe-red",
                preview: "hsl(359 67.79% 70.78%)",
            },
            rosewater: {
                label: "Rosewater",
                className: "frappe-rosewater",
                preview: "hsl(10 57.38% 88.04%)",
            },
            sapphire: {
                label: "Sapphire",
                className: "frappe-sapphire",
                preview: "hsl(199 55.41% 69.22%)",
            },
            sky: {
                label: "Sky",
                className: "frappe-sky",
                preview: "hsl(189 47.83% 72.94%)",
            },
            teal: {
                label: "Teal",
                className: "frappe-teal",
                preview: "hsl(172 39.23% 64.51%)",
            },
            yellow: {
                label: "Yellow",
                className: "frappe-yellow",
                preview: "hsl(40 62.04% 73.14%)",
            },
        },
    },

    macchiato: {
        label: "Macchiato",
        baseClass: "macchiato-base",
        colors: {
            base: {
                label: "Blue",
                className: "",
                preview: "hsl(220 82.81% 74.90%)",
            },
            flamingo: {
                label: "Flamingo",
                className: "macchiato-flamingo",
                preview: "hsl(0 58.33% 85.88%)",
            },
            green: {
                label: "Green",
                className: "macchiato-green",
                preview: "hsl(105 48.25% 71.96%)",
            },
            lavender: {
                label: "Lavender",
                className: "macchiato-lavender",
                preview: "hsl(234 82.28% 84.51%)",
            },
            maroon: {
                label: "Maroon",
                className: "macchiato-maroon",
                preview: "hsl(355 71.43% 76.67%)",
            },
            mauve: {
                label: "Mauve",
                className: "macchiato-mauve",
                preview: "hsl(267 82.69% 79.61%)",
            },
            peach: {
                label: "Peach",
                className: "macchiato-peach",
                preview: "hsl(21 85.51% 72.94%)",
            },
            pink: {
                label: "Pink",
                className: "macchiato-pink",
                preview: "hsl(316 73.68% 85.10%)",
            },
            red: {
                label: "Red",
                className: "macchiato-red",
                preview: "hsl(351 73.91% 72.94%)",
            },
            rosewater: {
                label: "Rosewater",
                className: "macchiato-rosewater",
                preview: "hsl(10 57.69% 89.80%)",
            },
            sapphire: {
                label: "Sapphire",
                className: "macchiato-sapphire",
                preview: "hsl(199 65.61% 69.22%)",
            },
            sky: {
                label: "Sky",
                className: "macchiato-sky",
                preview: "hsl(189 59.42% 72.94%)",
            },
            teal: {
                label: "Teal",
                className: "macchiato-teal",
                preview: "hsl(171 46.84% 69.02%)",
            },
            yellow: {
                label: "Yellow",
                className: "macchiato-yellow",
                preview: "hsl(40 69.91% 77.84%)",
            },
        },
    },
};

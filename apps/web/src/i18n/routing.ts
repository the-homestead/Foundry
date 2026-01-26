import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ["en", "de", "es", "fr", "it", "ja", "ko", "pt", "ru", "zh"],
    localePrefix: "as-needed",
    // Used when no locale matches
    defaultLocale: "en",
});

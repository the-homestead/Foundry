import { getTranslations } from "next-intl/server";

export default async function BrowsePage() {
    const t = await getTranslations("BrowsePage");
    return <div className="p-8">{t("title")}</div>;
}

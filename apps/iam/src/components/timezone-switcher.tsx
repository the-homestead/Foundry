import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { useTranslations } from "next-intl";

export function TimezoneSwitcher() {
    const t = useTranslations("TimezoneSwitcher");

    const groups = [
        {
            label: t("groups.northAmerica"),
            items: [
                { value: "est", label: t("items.est") },
                { value: "cst", label: t("items.cst") },
                { value: "mst", label: t("items.mst") },
                { value: "pst", label: t("items.pst") },
                { value: "akst", label: t("items.akst") },
                { value: "hst", label: t("items.hst") },
            ],
        },
        {
            label: t("groups.europeAfrica"),
            items: [
                { value: "gmt", label: t("items.gmt") },
                { value: "cet", label: t("items.cet") },
                { value: "eet", label: t("items.eet") },
                { value: "west", label: t("items.west") },
                { value: "cat", label: t("items.cat") },
                { value: "eat", label: t("items.eat") },
            ],
        },
        {
            label: t("groups.asia"),
            items: [
                { value: "msk", label: t("items.msk") },
                { value: "ist", label: t("items.ist") },
                { value: "cst_china", label: t("items.cstChina") },
                { value: "jst", label: t("items.jst") },
                { value: "kst", label: t("items.kst") },
                { value: "ist_indonesia", label: t("items.istIndonesia") },
            ],
        },
        {
            label: t("groups.australia"),
            items: [
                { value: "awst", label: t("items.awst") },
                { value: "acst", label: t("items.acst") },
                { value: "aest", label: t("items.aest") },
                { value: "nzst", label: t("items.nzst") },
                { value: "fjt", label: t("items.fjt") },
            ],
        },
        {
            label: t("groups.southAmerica"),
            items: [
                { value: "art", label: t("items.art") },
                { value: "bot", label: t("items.bot") },
                { value: "brt", label: t("items.brt") },
                { value: "clt", label: t("items.clt") },
            ],
        },
    ];
    return (
        <Select>
            <SelectTrigger className="w-full max-w-64">
                <SelectValue placeholder={t("placeholder")} />
            </SelectTrigger>
            <SelectContent>
                {groups.map((group) => (
                    <SelectGroup key={group.label}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    );
}

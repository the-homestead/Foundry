import { cn } from "@foundry/ui/lib/utils";
import { AnvilIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Footer, FooterBottom, FooterColumn, FooterContent } from "../primitives/footer";
import { ModeToggle } from "../primitives/mode-toggle";

interface FooterLink {
    text: string;
    href: string;
}

interface FooterColumnProps {
    title: string;
    links: FooterLink[];
}

interface FooterProps {
    logo?: ReactNode;
    name?: string;
    columns?: FooterColumnProps[];
    copyright?: string;
    policies?: FooterLink[];
    showModeToggle?: boolean;
    className?: string;
}

export function FooterSection({
    logo = <AnvilIcon />,
    name = "Foundry",
    columns = [
        {
            title: "Product",
            links: [
                { text: "Changelog", href: "https://www.foundry.homestead.systems/" },
                { text: "Documentation", href: "https://www.foundry.homestead.systems/" },
            ],
        },
        {
            title: "Company",
            links: [
                { text: "About", href: "https://www.foundry.homestead.systems/" },
                { text: "Careers", href: "https://www.foundry.homestead.systems/" },
                { text: "Blog", href: "https://www.foundry.homestead.systems/" },
            ],
        },
        {
            title: "Contact",
            links: [
                { text: "Discord", href: "https://www.foundry.homestead.systems/" },
                { text: "Twitter", href: "https://www.foundry.homestead.systems/" },
                { text: "Github", href: "https://www.foundry.homestead.systems/" },
            ],
        },
    ],
    copyright = "© 2025 Homestead Systems. All rights reserved",
    policies = [
        { text: "Privacy Policy", href: "https://www.foundry.homestead.systems/" },
        { text: "Terms of Service", href: "https://www.foundry.homestead.systems/" },
    ],
    showModeToggle = true,
    className,
}: FooterProps) {
    return (
        <footer className={cn("w-full bg-background px-4", className)}>
            <div className="mx-auto max-w-container">
                <Footer>
                    <FooterContent>
                        <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
                            <div className="flex items-center gap-2">
                                {logo}
                                <h3 className="font-bold text-xl">{name}</h3>
                            </div>
                        </FooterColumn>
                        {columns.map((column) => (
                            <FooterColumn key={column.title.replace(/\s+/g, "-").toLowerCase()}>
                                <h3 className="pt-1 font-semibold text-md">{column.title}</h3>
                                {column.links.map((link, idx) => (
                                    <a className="text-muted-foreground text-sm" href={link.href} key={`${column.title}-${link.href}-${idx}`}>
                                        {link.text}
                                    </a>
                                ))}
                            </FooterColumn>
                        ))}
                    </FooterContent>
                    <FooterBottom>
                        <div>{copyright}</div>
                        <div className="flex items-center gap-4">
                            {policies.map((policy, idx) => (
                                <a href={policy.href} key={`policy-${policy.href}-${idx}`}>
                                    {policy.text}
                                </a>
                            ))}
                            {showModeToggle && <ModeToggle />}
                        </div>
                    </FooterBottom>
                </Footer>
            </div>
        </footer>
    );
}

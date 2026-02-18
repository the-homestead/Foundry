"use client";

import { FolderArrowDownIcon } from "@foundry/ui/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@foundry/ui/primitives/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from "@foundry/ui/primitives/sidebar";
import { ChevronRight, Folder } from "lucide-react";

const data = {
    changes: [
        {
            file: "README.md",
            state: "M",
        },
        {
            file: "api/hello/route.ts",
            state: "U",
        },
        {
            file: "app/layout.tsx",
            state: "M",
        },
    ],
    tree: [
        ["app", ["api", ["hello", ["route.ts"]], "page.tsx", "layout.tsx", ["blog", ["page.tsx"]]]],
        ["components", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
        ["lib", ["util.ts"]],
        ["public", "favicon.ico", "vercel.svg"],
        ".eslintrc.json",
        ".gitignore",
        "next.config.js",
        "tailwind.config.js",
        "package.json",
        "README.md",
    ],
};

export default function SidebarClient({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Changes</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.changes.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton>
                                        <FolderArrowDownIcon />
                                        {item.file}
                                    </SidebarMenuButton>
                                    <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Files</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.tree.map((item, index) => (
                                <Tree item={item} key={index} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}

type TreeItem = string | TreeItem[];
function Tree({ item }: { item: TreeItem }) {
    const [name, ...items] = Array.isArray(item) ? item : [item];
    if (!items.length) {
        return (
            <SidebarMenuButton className="data-[active=true]:bg-transparent" isActive={name === "button.tsx"}>
                <FolderArrowDownIcon />
                {name}
            </SidebarMenuButton>
        );
    }
    return (
        <SidebarMenuItem>
            <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90" defaultOpen={name === "components" || name === "ui"}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRight className="transition-transform" />
                        <Folder />
                        {name}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((subItem, index) => (
                            <Tree item={subItem} key={index} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

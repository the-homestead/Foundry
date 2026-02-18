import { Separator } from "@foundry/ui/primitives/separator";
import { SidebarInset, SidebarTrigger } from "@foundry/ui/primitives/sidebar";
import SidebarServer from "@foundry/web/components/browse/sidebar.server";

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Left: persistent sidebar on large screens */}
            <aside className="hidden border-r lg:block">
                <SidebarServer />
            </aside>

            {/* Right: header + page content */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
                </header>

                {/* SidebarInset keeps any internal spacing behavior from primitives */}
                <SidebarInset className="flex-1">{children}</SidebarInset>
            </div>
        </div>
    );
}

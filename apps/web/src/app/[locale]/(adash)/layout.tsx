import { Button } from "@foundry/ui/primitives/button";
import { Separator } from "@foundry/ui/primitives/separator";
import { SidebarInset, SidebarTrigger } from "@foundry/ui/primitives/sidebar";
import { AdminSidebar } from "@foundry/web/components/admin/admin-sidebar";
import { Link, redirect } from "@foundry/web/i18n/navigation";
import { auth } from "@foundry/web/lib/auth";
import { headers } from "next/headers";
import "@foundry/ui/global.css";
import "@foundry/ui/shadcn.css";
import "@foundry/ui/catppuccin.css";
import { Unauthorized } from "@foundry/web/components/unauthorized";

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect({ href: "/auth/login", locale });
    }

    async function permissionCheck({ userId }: { userId: string }) {
        "use server";
        // Check if the user has specific admin permissions (e.g., listing users)
        // The previous error "Invalid input" was because 'permission' or 'permissions' field is required
        const permCheck = await auth.api.userHasPermission({
            body: {
                userId,
                role: "admin",
                permission: {
                    user: ["list"],
                },
            },
        });
        if (permCheck.error) {
            return false;
        }
        return permCheck.granted;
    }

    if (await permissionCheck({ userId: session?.user.id })) {
        return <Unauthorized />;
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar user={session.user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator className="mr-2 h-4" orientation="vertical" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/">Back to Site</Link>
                        </Button>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">{children}</div>
                </div>
            </SidebarInset>
        </div>
    );
}

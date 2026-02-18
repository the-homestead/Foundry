import { ArrowLeftIcon } from "@foundry/ui/icons";
import { Button } from "@foundry/ui/primitives/button";
import { Separator } from "@foundry/ui/primitives/separator";
import { UserDetailsView } from "@foundry/web/components/admin/users/user-details-view";
import { Link } from "@foundry/web/i18n/navigation";

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Button asChild className="-ml-2 w-fit text-muted-foreground" size="sm" variant="ghost">
                    <Link href="/management/users">
                        <ArrowLeftIcon />
                        Back to Users
                    </Link>
                </Button>
                <h1 className="font-bold text-2xl tracking-tight">User Details</h1>
                <p className="text-muted-foreground">Manage user profile, roles, and permissions.</p>
            </div>
            <Separator />
            <UserDetailsView userId={id} />
        </div>
    );
}

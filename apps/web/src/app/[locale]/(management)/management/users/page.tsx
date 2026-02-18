import { Separator } from "@foundry/ui/primitives/separator";
import { UsersTable } from "@foundry/web/components/admin/users/users-table";

export default function AdminUsersPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="font-bold text-2xl tracking-tight">Users & Auth</h1>
                <p className="text-muted-foreground">Manage users, roles, and authentication sessions.</p>
            </div>
            <Separator />
            <UsersTable />
        </div>
    );
}

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { ShieldX } from "lucide-react";
import Link from "next/link";

export function Unauthorized() {
    return (
        <div className="flex min-h-screen min-w-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldX className="h-6 w-6 text-destructive" />
                    </div>

                    <CardTitle className="font-semibold text-2xl">Access denied</CardTitle>

                    <CardDescription>You don’t have permission to access the admin dashboard.</CardDescription>
                </CardHeader>

                <CardContent>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/">Back to home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

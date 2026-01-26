import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardFooter, CardHeader } from "@foundry/ui/primitives/card";
import { H1, P } from "@foundry/ui/typography/index";
import Link from "next/link";

export interface ErrorProps {
    status?: number;
    title?: string;
    message?: string;
    primaryAction?: { label: string; href?: string; onClick?: () => void };
    secondaryAction?: { label: string; href?: string; onClick?: () => void };
}

/**
 * A generic Error display used across the app and error pages.
 * This is a presentational component (Server / Client safe). For
 * interactive handlers (reset) wrap this in a Client component.
 */
export function ErrorView({ status = 500, title, message, primaryAction, secondaryAction }: ErrorProps) {
    let defaultTitle = "Something went wrong";
    if (status === 404) {
        defaultTitle = "Page not found";
    } else if (status >= 500) {
        defaultTitle = "Server error";
    }

    const defaultMessage = message ?? (status === 404 ? "We couldn't find the page you're looking for." : "An unexpected error occurred.");

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="rounded-md bg-rose-100 px-4 py-2 font-mono text-3xl text-rose-700">{status}</div>
                        <div>
                            <H1 className="font-semibold text-lg">{title ?? defaultTitle}</H1>
                            <P className="mt-1 text-neutral-500 text-sm">{defaultMessage}</P>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Provide a bit more context for common errors */}
                    {status === 401 ? <P className="text-sm">You need to sign in to access this resource.</P> : null}
                    {status === 403 ? <P className="text-sm">You don't have permission to access this resource.</P> : null}
                </CardContent>
                <CardFooter className="flex gap-2 border-t pt-6">
                    <div className="flex w-full justify-center gap-2 sm:justify-end">
                        {renderPrimary(primaryAction)}
                        {renderSecondary(secondaryAction)}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default ErrorView;

function renderPrimary(action?: ErrorProps["primaryAction"]) {
    if (!action) {
        return (
            <div className="w-full sm:w-auto">
                <Button asChild className="w-full sm:w-auto" size="lg">
                    <Link href="/">Go home</Link>
                </Button>
            </div>
        );
    }

    if (action.href) {
        return (
            <div className="w-full sm:w-auto">
                <Button asChild className="w-full sm:w-auto" size="lg">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={action.onClick} size="lg">
                {action.label}
            </Button>
        </div>
    );
}

function renderSecondary(action?: ErrorProps["secondaryAction"]) {
    if (!action) {
        return null;
    }

    if (action.href) {
        return (
            <div className="w-full sm:w-auto">
                <Button asChild className="w-full sm:w-auto" size="lg" variant="ghost">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={action.onClick} size="lg" variant="ghost">
                {action.label}
            </Button>
        </div>
    );
}

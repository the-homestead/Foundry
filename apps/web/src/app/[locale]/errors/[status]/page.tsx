import { ErrorView } from "@foundry/ui/components";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ status: string }>;
}

const STATUS_MAP: Record<number, { title: string; message: string }> = {
    400: { title: "Bad request", message: "The request could not be understood by the server." },
    401: { title: "Unauthorized", message: "You must authenticate to access this resource." },
    403: { title: "Forbidden", message: "You do not have permission to access this resource." },
    404: { title: "Page not found", message: "We couldn't find what you were looking for." },
    408: { title: "Request timed out", message: "The server timed out waiting for your request." },
    429: { title: "Too many requests", message: "You're sending too many requests. Try again later." },
    500: { title: "Server error", message: "Something went wrong on our end." },
    501: { title: "Not implemented", message: "This functionality is not implemented." },
    502: { title: "Bad gateway", message: "Invalid response from the upstream server." },
    503: { title: "Service unavailable", message: "The service is temporarily unavailable." },
    504: { title: "Gateway timeout", message: "The upstream server failed to respond in time." },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { status } = await params;
    const code = Number(status);

    const info = STATUS_MAP[code] ?? { title: `${code} Error`, message: "An error occurred." };

    return {
        title: `${info.title} • ${code}`,
        description: info.message,
    };
}

export default async function StatusPage({ params }: Props) {
    const { status } = await params;
    const code = Number(status);

    const info = STATUS_MAP[code] ?? { title: `${code} Error`, message: "An error occurred." };

    return <ErrorView message={info.message} status={code} title={info.title} />;
}

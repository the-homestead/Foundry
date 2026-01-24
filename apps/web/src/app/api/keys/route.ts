import { NextResponse } from "next/server";

const HOP_BY_HOP_HEADERS = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"]);

const buildForwardHeaders = (request: Request) => {
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
        if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            continue;
        }
        headers.set(key, value);
    }
    headers.delete("host");
    return headers;
};

const forwardRequest = async (request: Request) => {
    const backend = process.env.NEXT_SERVER_APP_URL ?? "";
    if (!backend) {
        return NextResponse.json({ error: "Missing backend URL" }, { status: 500 });
    }

    const url = new URL(request.url);
    const target = `${backend}${url.pathname}${url.search}`;

    const init: RequestInit = {
        method: request.method,
        headers: buildForwardHeaders(request),
        redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = await request.arrayBuffer();
    }

    const response = await fetch(target, init);
    const responseHeaders = new Headers(response.headers);

    return new NextResponse(response.body, {
        status: response.status,
        headers: responseHeaders,
    });
};

export const POST = forwardRequest;
export const OPTIONS = forwardRequest;

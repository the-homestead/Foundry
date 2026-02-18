"use client";

import { authClient } from "@foundry/iam/lib/auth-client";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const WHITESPACE_RE = /\s+/;
const LEADING_Q_RE = /^\?/;

function prettyScope(s: string) {
    return s.replace(/_/g, " ");
}

export default function ConsentPage() {
    const searchParams = useSearchParams();
    const rawScope = searchParams?.get("scope") ?? "";
    const clientId = searchParams?.get("client_id") ?? searchParams?.get("client_id_issued_at") ?? "unknown";

    const scopes = useMemo(() => rawScope.trim().split(WHITESPACE_RE).filter(Boolean), [rawScope]);
    const [selected, setSelected] = useState<string[]>(() => Array.from(new Set(scopes)));
    const [submitting, setSubmitting] = useState(false);

    const toggleScope = useCallback((s: string) => {
        setSelected((prev) => (prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s]));
    }, []);

    // prefer the signed `oauth_query` parameter (added by the auth middleware) —
    // fall back to the full search string when it's not present
    const signedQueryParam = searchParams?.get("oauth_query");
    const oauthQuery = signedQueryParam ?? (typeof window !== "undefined" ? window.location.search.replace(LEADING_Q_RE, "") : searchParams?.toString());

    // if client_id is missing directly on the page, try to extract it from the signed query
    const clientIdFromQuery = (() => {
        if (searchParams?.get("client_id")) {
            return searchParams.get("client_id");
        }
        if (!signedQueryParam) {
            return null;
        }
        const params = new URLSearchParams(signedQueryParam);
        return params.get("client_id");
    })();
    const effectiveClientId = clientIdFromQuery ?? clientId;

    const handleDecision = useCallback(
        async (accept: boolean) => {
            setSubmitting(true);
            try {
                // prefer cookie-based submission (auth client handles cookies/signed query)
                const payload: Record<string, unknown> = { accept };

                // when the user has changed scopes only send the explicit scope list
                if (accept && selected.length > 0 && selected.length !== scopes.length) {
                    payload.scope = selected.join(" ");
                }

                // if a signed oauth_query is present the server may expect it (preserves existing behavior)
                if (oauthQuery) {
                    payload.oauth_query = oauthQuery;
                }

                const result = (await authClient.oauth2.consent(payload as Record<string, unknown>)) as { redirect_uri?: string; redirectUri?: string } | undefined;

                // auth client may return a plain object with redirect information
                const redirect = result?.redirect_uri ?? result?.redirectUri;
                if (redirect) {
                    window.location.href = redirect as string;
                    return;
                }

                // successful submission with no explicit redirect — try a full-page POST so the
                // authorization server can perform a top-level redirect (some server flows
                // return a Set-Cookie + 302 which won't navigate when called via XHR).
                // If reload doesn't send us to the client, submit a hidden form as a fallback.
                const tryReload = () => window.location.reload();
                tryReload();

                // if the auth server didn't navigate after a short delay, do a form POST
                setTimeout(() => {
                    // still on the consent page — submit a plain form to allow server-side redirect
                    const params = new URLSearchParams(oauthQuery || "");
                    const consentCode = params.get("consent_code");

                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = "/oauth2/consent";
                    form.style.display = "none";

                    const add = (name: string, value: string) => {
                        const i = document.createElement("input");
                        i.type = "hidden";
                        i.name = name;
                        i.value = value;
                        form.appendChild(i);
                    };

                    add("accept", String(accept));
                    if (payload.scope) {
                        add("scope", String(payload.scope));
                    }

                    if (consentCode) {
                        add("consent_code", consentCode);
                    } else if (oauthQuery) {
                        add("oauth_query", oauthQuery);
                    }

                    document.body.appendChild(form);
                    form.submit();
                }, 250);
            } catch (err: unknown) {
                console.error(err);
                const msg = err instanceof Error ? err.message : String(err);
                toast.error(msg || "Consent failed");
            } finally {
                setSubmitting(false);
            }
        },
        [oauthQuery, scopes.length, selected]
    );

    return (
        <div className="mx-auto max-w-xl p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Authorize application</CardTitle>
                    <CardDescription>This application is requesting access to your account.</CardDescription>
                </CardHeader>

                <div className="p-6">
                    <div className="mb-4">
                        <div className="text-muted-foreground text-sm">Application</div>
                        <div className="wrap-break-word font-mono">{effectiveClientId}</div>
                    </div>

                    <div className="mb-4">
                        <div className="text-muted-foreground text-sm">Requested scopes</div>
                        {scopes.length === 0 ? (
                            <div className="mt-2 text-muted-foreground text-sm">No scopes requested</div>
                        ) : (
                            <div className="mt-2 grid gap-2">
                                {scopes.map((s) => {
                                    const id = `scope-${s}`;
                                    return (
                                        <div className="flex items-center gap-2" key={s}>
                                            <Checkbox checked={selected.includes(s)} id={id} onCheckedChange={() => toggleScope(s)} />
                                            <label className="text-sm" htmlFor={id}>
                                                {prettyScope(s)}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button disabled={submitting} onClick={() => handleDecision(true)}>
                            {submitting ? "Allowing…" : "Allow"}
                        </Button>
                        <Button disabled={submitting} onClick={() => handleDecision(false)} variant="ghost">
                            Deny
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

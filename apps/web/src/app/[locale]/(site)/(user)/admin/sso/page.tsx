"use client";
import { authClient, useCurrentUser } from "@foundry/web/lib/auth-client";
import { useState } from "react";

export default function SSOAdminPage() {
    const { user, isPending } = useCurrentUser();
    const [providerId, setProviderId] = useState("keycloak");
    const [issuer, setIssuer] = useState("https://key.homestead.systems/realms/Foundry");
    const [domain, setDomain] = useState("homestead.systems");
    const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "");
    const [clientSecret, setClientSecret] = useState("");
    const [discovery, setDiscovery] = useState(`${issuer}/.well-known/openid-configuration`);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (isPending) {
        return <div>Loading…</div>;
    }

    const isAdmin = !!user && (user.role === "admin" || user.role === "dev");
    if (!isAdmin) {
        return <div>You must be an admin to access this page.</div>;
    }

    const register = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await authClient.sso.register({
                providerId,
                issuer,
                domain,
                oidcConfig: {
                    clientId,
                    clientSecret,
                    discoveryEndpoint: discovery,
                    scopes: ["openid", "email", "profile"],
                    pkce: true,
                },
            });

            setResult(res?.data ?? res);
        } catch (e: unknown) {
            setError(String((e as Error)?.message ?? e));
        } finally {
            setLoading(false);
        }
    };

    const requestVerification = async () => {
        if (!providerId) {
            return;
        }
        setLoading(true);
        try {
            // runtime may provide these helper methods; use a safe typed facade to avoid 'any'
            const ssoFacade = authClient.sso as unknown as {
                requestDomainVerification?: (d: { providerId: string }) => Promise<unknown>;
            };
            if (!ssoFacade.requestDomainVerification) {
                setError("requestDomainVerification is not available on this auth client");
                return;
            }
            const res = await ssoFacade.requestDomainVerification({ providerId });
            setResult((res as Record<string, unknown>) ?? null);
            setError(null);
        } catch (e: unknown) {
            setError(String((e as Error)?.message ?? e));
        } finally {
            setLoading(false);
        }
    };

    const verifyDomain = async () => {
        if (!providerId) {
            return;
        }
        setLoading(true);
        try {
            const ssoFacade = authClient.sso as unknown as {
                verifyDomain?: (d: { providerId: string }) => Promise<unknown>;
            };
            if (!ssoFacade.verifyDomain) {
                setError("verifyDomain is not available on this auth client");
                return;
            }
            const res = await ssoFacade.verifyDomain({ providerId });
            setResult((res as Record<string, unknown>) ?? null);
            setError(null);
        } catch (e: unknown) {
            setError(String((e as Error)?.message ?? e));
        } finally {
            setLoading(false);
        }
    };

    const h1Class = "mb-4 text-2xl font-semibold";
    const containerClass = "grid grid-cols-1 gap-3 max-w-2xl";
    const preClass = "p-3 rounded bg-gray-100";

    return (
        <div className="p-6">
            <h1 className={h1Class}>SSO Admin</h1>
            <div className={containerClass}>
                <label>
                    Provider ID
                    <input className="w-full" onChange={(e) => setProviderId(e.target.value)} value={providerId} />
                </label>
                <label>
                    Issuer
                    <input className="w-full" onChange={(e) => setIssuer(e.target.value)} value={issuer} />
                </label>
                <label>
                    Domain
                    <input className="w-full" onChange={(e) => setDomain(e.target.value)} value={domain} />
                </label>
                <label>
                    Client ID
                    <input className="w-full" onChange={(e) => setClientId(e.target.value)} value={clientId} />
                </label>
                <label>
                    Client Secret
                    <input className="w-full" onChange={(e) => setClientSecret(e.target.value)} value={clientSecret} />
                </label>
                <label>
                    Discovery Endpoint
                    <input className="w-full" onChange={(e) => setDiscovery(e.target.value)} value={discovery} />
                </label>

                <div className="flex gap-2">
                    <button className="btn" disabled={loading} onClick={register} type="button">
                        Register Provider
                    </button>
                    <button className="btn" disabled={loading} onClick={requestVerification} type="button">
                        Request Domain Verification
                    </button>
                    <button className="btn" disabled={loading} onClick={verifyDomain} type="button">
                        Verify Domain
                    </button>
                </div>

                {loading && <div>Working…</div>}
                {error && <div className="text-red-600">{error}</div>}
                {result && <pre className={preClass}>{JSON.stringify(result, null, 2)}</pre>}
            </div>
        </div>
    );
}

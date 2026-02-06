"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@foundry/ui/primitives/input-group";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { authClient, useSession } from "@foundry/web/lib/auth-client";
import { useDebounce } from "@uidotdev/usehooks";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type AdminSession,
    type AdminUser,
    banUserSchema,
    createUserSchema,
    impersonateSchema,
    listSessionsResponseSchema,
    listUserSessionsSchema,
    listUsersQuerySchema,
    listUsersResponseSchema,
    permissionCheckSchema,
    removeUserSchema,
    revokeSessionSchema,
    revokeSessionsSchema,
    setPasswordSchema,
    setRoleSchema,
    unbanUserSchema,
    updateUserSchema,
} from "./schemas";

const PAGE_SIZE = 20;

const parseRoleInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }
    const roles = trimmed
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);
    return roles.length <= 1 ? roles[0] : roles;
};

const parseJson = (value: string) => {
    if (!value.trim()) {
        return undefined;
    }
    return JSON.parse(value) as Record<string, unknown>;
};

export default function AdminClient() {
    const t = useTranslations("AdminPage");
    const common = useTranslations("common");
    const { data: sessionData, isPending } = useSession();
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 350);
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<AdminSession[]>([]);
    const [sessionsMeta, setSessionsMeta] = useState<{ total?: number; limit?: number; offset?: number }>({});
    const [sessionsError, setSessionsError] = useState<string | null>(null);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const [createForm, setCreateForm] = useState({ email: "", password: "", name: "", role: "", data: "" });
    const [updateForm, setUpdateForm] = useState({ userId: "", data: "" });
    const [roleForm, setRoleForm] = useState({ userId: "", role: "" });
    const [passwordForm, setPasswordForm] = useState({ userId: "", password: "" });
    const [banForm, setBanForm] = useState({ userId: "", reason: "", expiresIn: "" });
    const [unbanForm, setUnbanForm] = useState({ userId: "" });
    const [impersonateForm, setImpersonateForm] = useState({ userId: "" });
    const [revokeForm, setRevokeForm] = useState({ userId: "" });
    const [revokeSessionForm, setRevokeSessionForm] = useState({ sessionToken: "" });
    const [removeForm, setRemoveForm] = useState({ userId: "" });
    const [permissionForm, setPermissionForm] = useState({ json: "" });

    const currentRoles = useMemo(() => {
        const user = sessionData?.user as Record<string, unknown> | undefined;
        const role = user?.role;
        const roles = user?.roles;
        const roleList: string[] = [];
        if (typeof role === "string") {
            roleList.push(role);
        } else if (Array.isArray(role)) {
            roleList.push(...role.filter((item) => typeof item === "string"));
        }
        if (Array.isArray(roles)) {
            roleList.push(...roles.filter((item) => typeof item === "string"));
        }
        return Array.from(new Set(roleList));
    }, [sessionData?.user]);

    const isAdmin = useMemo(() => currentRoles.some((role) => ["admin", "superadmin"].includes(role)), [currentRoles]);

    const loadUsers = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        try {
            const queryPayload = listUsersQuerySchema.parse({
                searchValue: debouncedQuery || undefined,
                searchField: debouncedQuery ? "email" : undefined,
                searchOperator: debouncedQuery ? "contains" : undefined,
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
                sortDirection: "desc",
            });

            const result = await authClient.admin.listUsers({ query: queryPayload });
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.listUsers"));
            }

            const parsed = listUsersResponseSchema.safeParse(result);
            if (!parsed.success) {
                throw new Error(t("errors.invalidResponse"));
            }

            setUsers(parsed.data.users);
            setTotalUsers(parsed.data.total);
        } catch (err: unknown) {
            setListError(err instanceof Error ? err.message : t("errors.listUsers"));
        } finally {
            setListLoading(false);
        }
    }, [debouncedQuery, page, t]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = createUserSchema.parse({
                email: createForm.email,
                password: createForm.password,
                name: createForm.name,
                role: parseRoleInput(createForm.role),
                data: createForm.data ? parseJson(createForm.data) : undefined,
            });
            const result = await authClient.admin.createUser(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.createUser"));
            }
            toast.success(t("success.createUser"));
            setCreateForm({ email: "", password: "", name: "", role: "", data: "" });
            await loadUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.createUser"));
        }
    };

    const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = updateUserSchema.parse({
                userId: updateForm.userId,
                data: parseJson(updateForm.data) ?? {},
            });
            const result = await authClient.admin.updateUser(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.updateUser"));
            }
            toast.success(t("success.updateUser"));
            setUpdateForm({ userId: "", data: "" });
            await loadUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.updateUser"));
        }
    };

    const handleSetRole = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = setRoleSchema.parse({
                userId: roleForm.userId,
                role: parseRoleInput(roleForm.role) ?? "",
            });
            const result = await authClient.admin.setRole(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.setRole"));
            }
            toast.success(t("success.setRole"));
            setRoleForm({ userId: "", role: "" });
            await loadUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.setRole"));
        }
    };

    const handleSetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = setPasswordSchema.parse({
                userId: passwordForm.userId,
                newPassword: passwordForm.password,
            });
            const result = await authClient.admin.setUserPassword(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.setPassword"));
            }
            toast.success(t("success.setPassword"));
            setPasswordForm({ userId: "", password: "" });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.setPassword"));
        }
    };

    const handleBanUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const expiresNumber = banForm.expiresIn ? Number(banForm.expiresIn) : undefined;
            const payload = banUserSchema.parse({
                userId: banForm.userId,
                banReason: banForm.reason || undefined,
                banExpiresIn: Number.isFinite(expiresNumber) ? expiresNumber : undefined,
            });
            const result = await authClient.admin.banUser(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.banUser"));
            }
            toast.success(t("success.banUser"));
            setBanForm({ userId: "", reason: "", expiresIn: "" });
            await loadUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.banUser"));
        }
    };

    const handleUnbanUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = unbanUserSchema.parse({ userId: unbanForm.userId });
            const result = await authClient.admin.unbanUser(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.unbanUser"));
            }
            toast.success(t("success.unbanUser"));
            setUnbanForm({ userId: "" });
            await loadUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.unbanUser"));
        }
    };

    const handleImpersonate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = impersonateSchema.parse({ userId: impersonateForm.userId });
            const result = await authClient.admin.impersonateUser(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.impersonate"));
            }
            toast.success(t("success.impersonate"));
            setImpersonateForm({ userId: "" });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.impersonate"));
        }
    };

    const handleStopImpersonating = async () => {
        try {
            const result = await authClient.admin.stopImpersonating({});
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.stopImpersonating"));
            }
            toast.success(t("success.stopImpersonating"));
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.stopImpersonating"));
        }
    };

    const handleListSessions = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSessionsLoading(true);
        setSessionsError(null);
        try {
            const payload = listUserSessionsSchema.parse({ userId: revokeForm.userId });
            const result = await authClient.admin.listUserSessions(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.listSessions"));
            }
            const parsed = listSessionsResponseSchema.safeParse(result);
            if (!parsed.success) {
                throw new Error(t("errors.invalidResponse"));
            }
            setSessions(parsed.data.sessions ?? []);
            setSessionsMeta({
                total: parsed.data.total,
                limit: parsed.data.limit,
                offset: parsed.data.offset,
            });
        } catch (err: unknown) {
            setSessionsError(err instanceof Error ? err.message : t("errors.listSessions"));
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleRevokeSessions = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = revokeSessionsSchema.parse({ userId: revokeForm.userId });
            const result = await authClient.admin.revokeUserSessions(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.revokeSessions"));
            }
            toast.success(t("success.revokeSessions"));
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.revokeSessions"));
        }
    };

    const handleRevokeSession = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = revokeSessionSchema.parse({ sessionToken: revokeSessionForm.sessionToken });
            const result = await authClient.admin.revokeUserSession(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.revokeSession"));
            }
            toast.success(t("success.revokeSession"));
            setRevokeSessionForm({ sessionToken: "" });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.revokeSession"));
        }
    };

    const handleRemoveUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = removeUserSchema.parse({ userId: removeForm.userId });
            const result = await authClient.admin.removeUser(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.removeUser"));
            }
            toast.success(t("success.removeUser"));
            setRemoveForm({ userId: "" });
            await loadUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.removeUser"));
        }
    };

    const handlePermissionCheck = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const payload = permissionCheckSchema.parse({ permissions: parseJson(permissionForm.json) ?? {} });
            const result = await authClient.admin.hasPermission(payload);
            if (result && typeof result === "object" && "error" in result && result.error) {
                throw new Error(result.error.message ?? t("errors.permissionCheck"));
            }
            const allowed = Boolean((result as { result?: boolean }).result);
            toast.success(allowed ? t("success.permissionAllowed") : t("success.permissionDenied"));
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("errors.permissionCheck"));
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

    return (
        <div className="flex flex-col gap-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                    <Badge variant={isAdmin ? "default" : "outline"}>{isAdmin ? t("status.admin") : t("status.readOnly")}</Badge>
                    {isPending ? <span className="text-muted-foreground text-sm">{common("states.loading")}</span> : null}
                    {sessionData?.user ? (
                        <span className="text-muted-foreground text-sm">{t("status.signedInAs", { email: sessionData.user.email ?? sessionData.user.name ?? "" })}</span>
                    ) : (
                        <span className="text-muted-foreground text-sm">{t("status.notSignedIn")}</span>
                    )}
                </CardContent>
            </Card>

            <Tabs className="flex flex-col gap-6" defaultValue="users">
                <TabsList className="flex flex-wrap gap-2">
                    <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
                    <TabsTrigger value="create">{t("tabs.create")}</TabsTrigger>
                    <TabsTrigger value="update">{t("tabs.update")}</TabsTrigger>
                    <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
                    <TabsTrigger value="sessions">{t("tabs.sessions")}</TabsTrigger>
                    <TabsTrigger value="permissions">{t("tabs.permissions")}</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("users.title")}</CardTitle>
                            <CardDescription>{t("users.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputGroup>
                                <InputGroupAddon>
                                    <Search className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    onChange={(event) => {
                                        setPage(1);
                                        setQuery(event.target.value);
                                    }}
                                    placeholder={t("users.searchPlaceholder")}
                                    value={query}
                                />
                            </InputGroup>

                            {listError ? <p className="text-destructive text-sm">{listError}</p> : null}

                            <ScrollArea className="max-h-[420px] rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("users.table.name")}</TableHead>
                                            <TableHead>{t("users.table.email")}</TableHead>
                                            <TableHead>{t("users.table.role")}</TableHead>
                                            <TableHead>{t("users.table.status")}</TableHead>
                                            <TableHead>{t("users.table.id")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {listLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5}>{common("states.loading")}</TableCell>
                                            </TableRow>
                                        ) : users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5}>{t("users.empty")}</TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => {
                                                const roles = Array.isArray(user.role) ? user.role.join(", ") : (user.role ?? t("users.noRole"));
                                                return (
                                                    <TableRow key={user.id}>
                                                        <TableCell>{user.name ?? t("users.unnamed")}</TableCell>
                                                        <TableCell>{user.email ?? t("users.noEmail")}</TableCell>
                                                        <TableCell>{roles}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={user.banned ? "destructive" : "outline"}>{user.banned ? t("users.banned") : t("users.active")}</Badge>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("users.pagination", { page, totalPages })}</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        disabled={page <= 1 || listLoading}
                                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        {t("users.prev")}
                                    </Button>
                                    <Button
                                        disabled={page >= totalPages || listLoading}
                                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        {t("users.next")}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("create.title")}</CardTitle>
                            <CardDescription>{t("create.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleCreateUser}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="create-email">{t("fields.email")}</FieldLabel>
                                        <Input
                                            id="create-email"
                                            onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
                                            type="email"
                                            value={createForm.email}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="create-name">{t("fields.name")}</FieldLabel>
                                        <Input id="create-name" onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} value={createForm.name} />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="create-password">{t("fields.password")}</FieldLabel>
                                        <Input
                                            id="create-password"
                                            onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
                                            type="password"
                                            value={createForm.password}
                                        />
                                        <FieldDescription>{t("create.passwordHelp")}</FieldDescription>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="create-role">{t("fields.role")}</FieldLabel>
                                        <Input id="create-role" onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })} value={createForm.role} />
                                        <FieldDescription>{t("fields.roleHelp")}</FieldDescription>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="create-data">{t("fields.data")}</FieldLabel>
                                        <Textarea
                                            id="create-data"
                                            onChange={(event) => setCreateForm({ ...createForm, data: event.target.value })}
                                            rows={4}
                                            value={createForm.data}
                                        />
                                        <FieldDescription>{t("fields.dataHelp")}</FieldDescription>
                                    </Field>
                                </FieldGroup>
                                <Button type="submit">{t("create.submit")}</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="update">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("update.title")}</CardTitle>
                                <CardDescription>{t("update.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleUpdateUser}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="update-user">{t("fields.userId")}</FieldLabel>
                                            <Input id="update-user" onChange={(event) => setUpdateForm({ ...updateForm, userId: event.target.value })} value={updateForm.userId} />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="update-data">{t("fields.data")}</FieldLabel>
                                            <Textarea
                                                id="update-data"
                                                onChange={(event) => setUpdateForm({ ...updateForm, data: event.target.value })}
                                                rows={5}
                                                value={updateForm.data}
                                            />
                                            <FieldDescription>{t("update.dataHelp")}</FieldDescription>
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit">{t("update.submit")}</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("roles.title")}</CardTitle>
                                <CardDescription>{t("roles.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleSetRole}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="role-user">{t("fields.userId")}</FieldLabel>
                                            <Input id="role-user" onChange={(event) => setRoleForm({ ...roleForm, userId: event.target.value })} value={roleForm.userId} />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="role-value">{t("fields.role")}</FieldLabel>
                                            <Input id="role-value" onChange={(event) => setRoleForm({ ...roleForm, role: event.target.value })} value={roleForm.role} />
                                            <FieldDescription>{t("fields.roleHelp")}</FieldDescription>
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit">{t("roles.submit")}</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("password.title")}</CardTitle>
                                <CardDescription>{t("password.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleSetPassword}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="password-user">{t("fields.userId")}</FieldLabel>
                                            <Input
                                                id="password-user"
                                                onChange={(event) => setPasswordForm({ ...passwordForm, userId: event.target.value })}
                                                value={passwordForm.userId}
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="password-new">{t("fields.newPassword")}</FieldLabel>
                                            <Input
                                                id="password-new"
                                                onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
                                                type="password"
                                                value={passwordForm.password}
                                            />
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit">{t("password.submit")}</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("ban.title")}</CardTitle>
                                <CardDescription>{t("ban.description")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form className="space-y-4" onSubmit={handleBanUser}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="ban-user">{t("fields.userId")}</FieldLabel>
                                            <Input id="ban-user" onChange={(event) => setBanForm({ ...banForm, userId: event.target.value })} value={banForm.userId} />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="ban-reason">{t("fields.reason")}</FieldLabel>
                                            <Input id="ban-reason" onChange={(event) => setBanForm({ ...banForm, reason: event.target.value })} value={banForm.reason} />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="ban-expires">{t("fields.expiresIn")}</FieldLabel>
                                            <Input
                                                id="ban-expires"
                                                onChange={(event) => setBanForm({ ...banForm, expiresIn: event.target.value })}
                                                type="number"
                                                value={banForm.expiresIn}
                                            />
                                            <FieldDescription>{t("ban.expiresHelp")}</FieldDescription>
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit" variant="destructive">
                                        {t("ban.submit")}
                                    </Button>
                                </form>

                                <form className="space-y-4" onSubmit={handleUnbanUser}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="unban-user">{t("fields.userId")}</FieldLabel>
                                            <Input id="unban-user" onChange={(event) => setUnbanForm({ ...unbanForm, userId: event.target.value })} value={unbanForm.userId} />
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit" variant="outline">
                                        {t("ban.unban")}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("impersonate.title")}</CardTitle>
                                <CardDescription>{t("impersonate.description")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form className="space-y-4" onSubmit={handleImpersonate}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="impersonate-user">{t("fields.userId")}</FieldLabel>
                                            <Input
                                                id="impersonate-user"
                                                onChange={(event) => setImpersonateForm({ ...impersonateForm, userId: event.target.value })}
                                                value={impersonateForm.userId}
                                            />
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit">{t("impersonate.submit")}</Button>
                                </form>
                                <Button onClick={handleStopImpersonating} type="button" variant="outline">
                                    {t("impersonate.stop")}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("sessions.title")}</CardTitle>
                            <CardDescription>{t("sessions.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form className="space-y-4" onSubmit={handleListSessions}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="sessions-user">{t("fields.userId")}</FieldLabel>
                                        <Input id="sessions-user" onChange={(event) => setRevokeForm({ ...revokeForm, userId: event.target.value })} value={revokeForm.userId} />
                                    </Field>
                                </FieldGroup>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="submit" variant="outline">
                                        {t("sessions.list")}
                                    </Button>
                                    <Button onClick={handleRevokeSessions} type="button" variant="destructive">
                                        {t("sessions.revokeAll")}
                                    </Button>
                                </div>
                            </form>

                            {sessionsError ? <p className="text-destructive text-sm">{sessionsError}</p> : null}

                            <ScrollArea className="max-h-[320px] rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("sessions.table.token")}</TableHead>
                                            <TableHead>{t("sessions.table.expires")}</TableHead>
                                            <TableHead>{t("sessions.table.impersonatedBy")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessionsLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={3}>{common("states.loading")}</TableCell>
                                            </TableRow>
                                        ) : sessions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3}>{t("sessions.empty")}</TableCell>
                                            </TableRow>
                                        ) : (
                                            sessions.map((session) => (
                                                <TableRow key={session.sessionToken}>
                                                    <TableCell className="font-mono text-xs">{session.sessionToken}</TableCell>
                                                    <TableCell>{session.expiresAt ?? t("sessions.never")}</TableCell>
                                                    <TableCell>{session.impersonatedBy ?? t("sessions.none")}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>

                            {sessionsMeta.total ? <p className="text-muted-foreground text-sm">{t("sessions.meta", sessionsMeta)}</p> : null}

                            <form className="space-y-4" onSubmit={handleRevokeSession}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="session-token">{t("sessions.revokeToken")}</FieldLabel>
                                        <Input
                                            id="session-token"
                                            onChange={(event) => setRevokeSessionForm({ sessionToken: event.target.value })}
                                            value={revokeSessionForm.sessionToken}
                                        />
                                    </Field>
                                </FieldGroup>
                                <Button type="submit" variant="outline">
                                    {t("sessions.revokeOne")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("permissions.title")}</CardTitle>
                                <CardDescription>{t("permissions.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handlePermissionCheck}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="permissions-json">{t("permissions.permissionsJson")}</FieldLabel>
                                            <Textarea
                                                id="permissions-json"
                                                onChange={(event) => setPermissionForm({ json: event.target.value })}
                                                rows={5}
                                                value={permissionForm.json}
                                            />
                                            <FieldDescription>{t("permissions.help")}</FieldDescription>
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit">{t("permissions.submit")}</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("remove.title")}</CardTitle>
                                <CardDescription>{t("remove.description")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleRemoveUser}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="remove-user">{t("fields.userId")}</FieldLabel>
                                            <Input id="remove-user" onChange={(event) => setRemoveForm({ userId: event.target.value })} value={removeForm.userId} />
                                        </Field>
                                    </FieldGroup>
                                    <Button type="submit" variant="destructive">
                                        {t("remove.submit")}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

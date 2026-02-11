"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@foundry/ui/primitives/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ApiKeyEntry } from "./types/types";
import { formatDate, getProfileLabel } from "./utils";

interface ApiKeysTableProps {
    data: ApiKeyEntry[];
    onDelete: (keyId: string) => void;
    onIpRestrictions?: (key: ApiKeyEntry) => void;
    onRateLimits?: (key: ApiKeyEntry) => void;
    onRefresh?: () => void;
    onScopes?: (key: ApiKeyEntry) => void;
    onViewDetails?: (key: ApiKeyEntry) => void;
    pendingRevokeId?: string | null;
    setPendingRevokeId?: (value: string | null) => void;
}

export function ApiKeysTable({
    data,
    onDelete,
    onIpRestrictions,
    onRateLimits,
    onRefresh: _onRefresh,
    onScopes,
    onViewDetails,
    pendingRevokeId: _pendingRevokeId,
    setPendingRevokeId: _setPendingRevokeId,
}: ApiKeysTableProps) {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const getRelativeDays = useCallback(
        (dateInput?: string | Date | null) => {
            if (!dateInput) {
                return "—";
            }
            const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
            if (Number.isNaN(d.getTime())) {
                return "—";
            }
            const diffMs = d.getTime() - Date.now();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                return String(c("dates.today"));
            }
            if (diffDays > 0) {
                return String(t("apiKeys.list.inDays", { n: diffDays }));
            }
            return String(t("apiKeys.list.daysAgo", { n: Math.abs(diffDays) }));
        },
        [c, t]
    );

    const columns: ColumnDef<ApiKeyEntry>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        aria-label="Select all"
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    />
                ),
                cell: ({ row }) => <Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} type="button" variant="ghost">
                        {t("apiKeys.list.columns.name")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="font-medium">{row.getValue("name") || t("apiKeys.list.untitled")}</div>,
            },
            {
                accessorKey: "prefix",
                header: t("apiKeys.list.columns.prefix"),
                cell: ({ row }) => {
                    const prefix = row.original.prefix || row.original.start || "—";
                    return (
                        <Button
                            className="font-mono"
                            onClick={async () => {
                                if (prefix !== "—") {
                                    await navigator.clipboard.writeText(prefix);
                                    toast.success("Prefix copied to clipboard");
                                }
                            }}
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            {prefix}
                        </Button>
                    );
                },
            },
            {
                accessorKey: "metadata.profile",
                header: t("apiKeys.list.columns.profile"),
                cell: ({ row }) => <Badge variant="secondary">{getProfileLabel(row.original.metadata?.profile ?? null)}</Badge>,
            },
            {
                accessorKey: "tags",
                header: "Tags",
                cell: ({ row }) => {
                    const tags = row.original.tags;
                    if (!tags || tags.length === 0) {
                        return <span className="text-muted-foreground">—</span>;
                    }
                    return (
                        <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                            {tags.length > 2 ? <Badge variant="outline">+{tags.length - 2}</Badge> : null}
                        </div>
                    );
                },
            },
            {
                accessorKey: "usageCount",
                header: ({ column }) => (
                    <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} type="button" variant="ghost">
                        Usage
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const count = row.original.usageCount ?? 0;
                    return <span className="font-mono text-sm">{count.toLocaleString()}</span>;
                },
            },
            {
                accessorKey: "lastUsedAt",
                header: ({ column }) => (
                    <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} type="button" variant="ghost">
                        Last Used
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const lastUsed = row.original.lastUsedAt;
                    if (!lastUsed) {
                        return <span className="text-muted-foreground">Never</span>;
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="font-mono text-sm">{formatDate(lastUsed)}</span>
                            <span className="text-muted-foreground text-xs">{getRelativeDays(lastUsed)}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} type="button" variant="ghost">
                        {t("apiKeys.list.columns.created")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-mono text-sm">{formatDate(row.original.createdAt)}</span>
                        <span className="text-muted-foreground text-xs">{getRelativeDays(row.original.createdAt)}</span>
                    </div>
                ),
            },
            {
                accessorKey: "expiresAt",
                header: ({ column }) => (
                    <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} type="button" variant="ghost">
                        {t("apiKeys.list.columns.expires")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-mono text-sm">{formatDate(row.original.expiresAt)}</span>
                        <span className="text-muted-foreground text-xs">{getRelativeDays(row.original.expiresAt)}</span>
                    </div>
                ),
            },
            {
                accessorKey: "metadata.ipWhitelist",
                header: "IP Restrictions",
                cell: ({ row }) => {
                    const whitelist = row.original.metadata?.ipWhitelist;
                    const blacklist = row.original.metadata?.ipBlacklist;
                    const hasRestrictions = (whitelist?.length ?? 0) > 0 || (blacklist?.length ?? 0) > 0;
                    if (!hasRestrictions) {
                        return <span className="text-muted-foreground">None</span>;
                    }
                    return (
                        <div className="flex flex-col gap-1 text-xs">
                            {whitelist?.length ? (
                                <Badge className="text-xs" variant="default">
                                    ✓ {whitelist.length} allowed
                                </Badge>
                            ) : null}
                            {blacklist?.length ? (
                                <Badge className="text-xs" variant="destructive">
                                    ✗ {blacklist.length} blocked
                                </Badge>
                            ) : null}
                        </div>
                    );
                },
            },
            {
                accessorKey: "metadata.rateLimit",
                header: "Rate Limit",
                cell: ({ row }) => {
                    const rateLimit = row.original.metadata?.rateLimit;
                    if (!rateLimit) {
                        return <span className="text-muted-foreground">None</span>;
                    }
                    const { requestsPerMinute, requestsPerHour, requestsPerDay } = rateLimit;
                    const hasLimits = (requestsPerMinute ?? 0) > 0 || (requestsPerHour ?? 0) > 0 || (requestsPerDay ?? 0) > 0;
                    if (!hasLimits) {
                        return <span className="text-muted-foreground">None</span>;
                    }
                    return (
                        <div className="flex flex-col gap-1 text-xs">
                            {requestsPerMinute ? <span>{requestsPerMinute}/min</span> : null}
                            {requestsPerHour ? <span>{requestsPerHour}/hr</span> : null}
                            {requestsPerDay ? <span>{requestsPerDay}/day</span> : null}
                        </div>
                    );
                },
            },
            {
                accessorKey: "enabled",
                header: t("apiKeys.list.columns.status"),
                cell: ({ row }) => {
                    const enabled = row.getValue("enabled");
                    return enabled === false ? <Badge variant="outline">{c("fields.disabled")}</Badge> : <Badge>{c("fields.active")}</Badge>;
                },
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const key = row.original;

                    const handleCopyPrefix = async () => {
                        const prefix = key.prefix ?? key.start ?? "";
                        if (prefix) {
                            await navigator.clipboard.writeText(prefix);
                            toast.success("Prefix copied to clipboard");
                        }
                    };

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" type="button" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={handleCopyPrefix}>Copy prefix</DropdownMenuItem>
                                {onViewDetails ? <DropdownMenuItem onClick={() => onViewDetails(key)}>View details</DropdownMenuItem> : null}
                                {onIpRestrictions ? <DropdownMenuItem onClick={() => onIpRestrictions(key)}>IP Restrictions</DropdownMenuItem> : null}
                                {onRateLimits ? <DropdownMenuItem onClick={() => onRateLimits(key)}>Rate Limits</DropdownMenuItem> : null}
                                {onScopes ? <DropdownMenuItem onClick={() => onScopes(key)}>Scopes</DropdownMenuItem> : null}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(key.id)}>
                                    {t("apiKeys.list.revoke")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [t, c, onDelete, onIpRestrictions, onRateLimits, onScopes, onViewDetails, getRelativeDays]
    );

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleBulkDelete = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => row.original.id);
        if (selectedIds.length === 0) {
            return;
        }
        // This would need to be implemented in the parent component
        toast.info(`Bulk delete ${selectedIds.length} keys (feature pending)`);
    };

    const handleExport = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const dataToExport = selectedRows.length > 0 ? selectedRows.map((row) => row.original) : data;

        const csv = [
            ["Name", "Prefix", "Profile", "Created", "Expires", "Status", "Usage", "Last Used"],
            ...dataToExport.map((key) => [
                key.name || "Untitled",
                key.prefix || key.start || "",
                getProfileLabel(key.metadata?.profile ?? null),
                formatDate(key.createdAt),
                formatDate(key.expiresAt),
                key.enabled === false ? "Disabled" : "Active",
                (key.usageCount ?? 0).toString(),
                formatDate(key.lastUsedAt) || "Never",
            ]),
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `api-keys-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported API keys");
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                        <>
                            <Button onClick={handleBulkDelete} size="sm" type="button" variant="destructive">
                                Delete {table.getFilteredSelectedRowModel().rows.length} selected
                            </Button>
                            <Button onClick={() => table.toggleAllRowsSelected(false)} size="sm" type="button" variant="ghost">
                                Clear selection
                            </Button>
                        </>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExport} size="sm" type="button" variant="outline">
                        Export {table.getFilteredSelectedRowModel().rows.length > 0 ? "selected" : "all"}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" type="button" variant="outline">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        checked={column.getIsVisible()}
                                        className="capitalize"
                                        key={column.id}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="h-24 text-center" colSpan={columns.length}>
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-muted-foreground text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} size="sm" type="button" variant="outline">
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        <span className="text-sm">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                    </div>
                    <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="sm" type="button" variant="outline">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

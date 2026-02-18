"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@foundry/ui/primitives/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
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
import { Input } from "@foundry/ui/primitives/input";
import { Skeleton } from "@foundry/ui/primitives/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { authClient } from "@foundry/web/lib/auth-client";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Ban as BanIcon, ChevronDown, LogOut, MoreHorizontal, Shield, UserCog, UserX, VenetianMask } from "lucide-react";
import { useRouter } from "next/navigation";
// biome-ignore lint/performance/noNamespaceImport: <React>
import * as React from "react";
import { toast } from "sonner";
import { BanDialog } from "./ban-dialog";
import type { AdminUser } from "./user-schema";
import { UserSheet } from "./user-sheet";

export function UsersTable() {
    const router = useRouter();
    const [users, setUsers] = React.useState<AdminUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [totalUsers, setTotalUsers] = React.useState(0);

    // Table States
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Action States
    const [banUser, setBanUser] = React.useState<AdminUser | null>(null);
    const [deleteUser, setDeleteUser] = React.useState<AdminUser | null>(null);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isBanOpen, setIsBanOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

    const fetchUsers = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await authClient.admin.listUsers({
                query: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                    sortBy: sorting[0]?.id,
                    sortDirection: sorting[0]?.desc ? "desc" : "asc",
                    searchValue: (columnFilters.find((f) => f.id === "name")?.value as string) || undefined,
                    searchField: "name",
                },
            });
            if (data) {
                setUsers(data.users as unknown as AdminUser[]);
                setTotalUsers(data.total || 0);
            }
        } catch {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, [pagination, sorting, columnFilters]);

    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleImpersonate = async (userId: string) => {
        try {
            await authClient.admin.impersonateUser(
                {
                    userId,
                },
                {
                    onSuccess: () => {
                        toast.success("Impersonation started", {
                            action: {
                                label: "Go to App",
                                onClick: () => router.push("/"),
                            },
                        });
                        router.refresh();
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                    },
                }
            );
        } catch {
            toast.error("Could not impersonate");
        }
    };

    const handleRevokeSessions = async (userId: string) => {
        try {
            await authClient.admin.revokeUserSessions({ userId });
            toast.success("User sessions revoked");
        } catch {
            toast.error("Failed to revoke sessions");
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            await authClient.admin.unbanUser({ userId });
            toast.success("User unbanned");
            fetchUsers();
        } catch {
            toast.error("Failed to unban user");
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            await authClient.admin.removeUser({ userId });
            toast.success("User deleted");
            fetchUsers();
        } catch {
            toast.error("Failed to delete user");
        }
    };

    const columns: ColumnDef<AdminUser>[] = [
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
            header: ({ column }) => {
                return (
                    <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
                        User
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage alt={user.name} src={user.image ?? undefined} />
                            <AvatarFallback className="rounded-lg">{user.name?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-muted-foreground text-xs">{user.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>;
            },
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => {
                return new Date(row.getValue("createdAt")).toLocaleDateString();
            },
        },
        {
            accessorKey: "banned",
            header: "Status",
            cell: ({ row }) => {
                const isBanned = row.original.banned;
                if (!isBanned) {
                    return (
                        <Badge className="border-green-200 bg-green-50 text-green-600" variant="outline">
                            Active
                        </Badge>
                    );
                }
                return <Badge variant="destructive">Banned</Badge>;
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" variant="ghost">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copy ID</DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => {
                                    router.push(`/management/users/${user.id}`);
                                }}
                            >
                                <UserCog className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleImpersonate(user.id)}>
                                <VenetianMask className="mr-2 h-4 w-4" /> Impersonate
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleRevokeSessions(user.id)}>
                                <LogOut className="mr-2 h-4 w-4" /> Revoke Sessions
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {user.banned ? (
                                <DropdownMenuItem onClick={() => handleUnban(user.id)}>
                                    <Shield className="mr-2 h-4 w-4" /> Unban User
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                        setBanUser(user);
                                        setIsBanOpen(true);
                                    }}
                                >
                                    <BanIcon className="mr-2 h-4 w-4" /> Ban User
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteUser(user)}>
                                <UserX className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        manualPagination: true,
        pageCount: Math.ceil(totalUsers / pagination.pageSize),
    });

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    className="max-w-sm"
                    onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                    placeholder="Search visible users..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                />

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => {
                            setIsCreateOpen(true);
                        }}
                        variant="outline"
                    >
                        Add User
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="ml-auto" variant="outline">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            checked={column.getIsVisible()}
                                            className="capitalize"
                                            key={column.id}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell className="h-24 text-center" colSpan={columns.length}>
                                    <div className="flex items-center justify-center">
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && table.getRowModel().rows?.length
                            ? table.getRowModel().rows.map((row) => (
                                  <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                                      {row.getVisibleCells().map((cell) => (
                                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                      ))}
                                  </TableRow>
                              ))
                            : !loading && (
                                  <TableRow>
                                      <TableCell className="h-24 text-center" colSpan={columns.length}>
                                          No results.
                                      </TableCell>
                                  </TableRow>
                              )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-muted-foreground text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} size="sm" variant="outline">
                        Previous
                    </Button>
                    <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="sm" variant="outline">
                        Next
                    </Button>
                </div>
            </div>

            <UserSheet onOpenChange={setIsCreateOpen} onSuccess={fetchUsers} open={isCreateOpen} user={null} />

            <BanDialog onOpenChange={setIsBanOpen} onSuccess={fetchUsers} open={isBanOpen} user={banUser} />

            <AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this user? This action is irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteUser) {
                                    handleDelete(deleteUser.id);
                                }
                                setIsDeleteOpen(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

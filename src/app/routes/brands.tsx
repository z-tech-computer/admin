import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { PlusIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { Brand } from "@/types/database";
import { useBrands, useDeleteBrand } from "@/features/brands/hooks/use-brands";
import { BrandFormDialog } from "@/features/brands/components/brand-form-dialog";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const col = createColumnHelper<Brand>();

export default function BrandsPage() {
  const { data: brands, isLoading } = useBrands();
  const deleteMut = useDeleteBrand();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const columns = useMemo(
    () => [
      col.display({
        id: "logo",
        header: "Logo",
        cell: ({ row }) =>
          row.original.logo_url ? (
            <img src={row.original.logo_url} alt={row.original.name} className="size-8 rounded object-contain" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded bg-muted text-xs font-medium">
              {row.original.name.charAt(0)}
            </div>
          ),
      }),
      col.accessor("name", { header: "Name" }),
      col.accessor("slug", {
        header: "Slug",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      col.accessor("is_active", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "secondary"}>
            {info.getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
      }),
      col.display({
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setEditing(row.original); setFormOpen(true); }}>
                <PencilIcon /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>
                <TrashIcon /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: brands ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage product brands</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <PlusIcon className="mr-1.5 size-4" /> Add Brand
        </Button>
      </div>

      <DataTable table={table} />

      <BrandFormDialog open={formOpen} onOpenChange={setFormOpen} brand={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Brand"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
      />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

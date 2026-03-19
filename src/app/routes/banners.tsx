import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { PlusIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { Banner } from "@/types/database";
import { useBanners, useDeleteBanner } from "@/features/banners/hooks/use-banners";
import { BannerFormDialog } from "@/features/banners/components/banner-form-dialog";
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

const col = createColumnHelper<Banner>();

export default function BannersPage() {
  const { data: banners, isLoading } = useBanners();
  const deleteMut = useDeleteBanner();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const columns = useMemo(
    () => [
      col.display({
        id: "preview",
        header: "Preview",
        cell: ({ row }) => (
          <img
            src={row.original.image_url}
            alt={row.original.title}
            className="h-10 w-20 rounded-md object-cover"
          />
        ),
      }),
      col.accessor("title", { header: "Title" }),
      col.accessor("subtitle", {
        header: "Subtitle",
        cell: (info) => info.getValue() || "—",
      }),
      col.accessor("sort_order", { header: "Order" }),
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
    data: banners ?? [],
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
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">Manage homepage banners</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <PlusIcon className="mr-1.5 size-4" /> Add Banner
        </Button>
      </div>

      <DataTable table={table} />

      <BannerFormDialog open={formOpen} onOpenChange={setFormOpen} banner={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Banner"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? The image will also be removed.`}
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
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useProducts, useDeleteProduct } from "@/features/admin-products/hooks/use-products";
import { formatCurrency } from "@/lib/utils/format";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  categories: { name: string } | null;
  brands: { name: string } | null;
  product_images: { url: string; is_primary: boolean }[];
};

const col = createColumnHelper<ProductRow>();

export default function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<{ id: string; name: string } | null>(null);

  const { data: result, isLoading } = useProducts({ page, search: search || undefined });
  const deleteMut = useDeleteProduct();

  const totalPages = result ? Math.ceil(result.count / result.pageSize) : 0;

  const columns = useMemo(
    () => [
      col.display({
        id: "image",
        header: "",
        cell: ({ row }) => {
          const primary = row.original.product_images?.find((i) => i.is_primary);
          const src = primary?.url ?? row.original.product_images?.[0]?.url;
          return src ? (
            <img src={src} alt="" className="size-9 rounded-md object-cover" />
          ) : (
            <div className="size-9 rounded-md bg-muted" />
          );
        },
      }),
      col.accessor("name", { header: "Name" }),
      col.accessor("sku", {
        header: "SKU",
        cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
      }),
      col.accessor("price", {
        header: "Price",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      col.accessor("stock_quantity", { header: "Stock" }),
      col.display({
        id: "category",
        header: "Category",
        cell: ({ row }) => row.original.categories?.name ?? "—",
      }),
      col.accessor("is_active", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "secondary"}>
            {info.getValue() ? "Active" : "Draft"}
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
              <DropdownMenuItem onClick={() => navigate(`/products/${row.original.id}/edit`)}>
                <PencilIcon /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteId({ id: row.original.id, name: row.original.name })}
              >
                <TrashIcon /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [navigate],
  );

  const table = useReactTable({
    data: (result?.data as ProductRow[]) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {result?.count ?? 0} products total
          </p>
        </div>
        <Button onClick={() => navigate("/products/new")}>
          <PlusIcon className="mr-1.5 size-4" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-8"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable table={table} />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteId?.name}"? All images will also be removed.`}
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId.id, { onSuccess: () => setDeleteId(null) });
        }}
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
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

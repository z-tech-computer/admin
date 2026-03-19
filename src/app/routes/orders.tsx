import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "lucide-react";
import { Constants } from "@/types/database";
import { useOrders } from "@/features/admin-orders/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

const ORDER_STATUSES = Constants.public.Enums.order_status;

const col = createColumnHelper<OrderRow>();

export default function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: result, isLoading } = useOrders({
    page,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const totalPages = result ? Math.ceil(result.count / result.pageSize) : 0;

  const columns = useMemo(
    () => [
      col.accessor("order_number", {
        header: "Order #",
        cell: (info) => <span className="font-mono font-medium">{info.getValue()}</span>,
      }),
      col.display({
        id: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.profiles?.full_name ?? "Unknown",
      }),
      col.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={STATUS_VARIANT[info.getValue()] ?? "outline"}>
            {info.getValue()}
          </Badge>
        ),
      }),
      col.accessor("total", {
        header: "Total",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      col.accessor("created_at", {
        header: "Date",
        cell: (info) => formatDate(info.getValue()),
      }),
      col.display({
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(`/orders/${row.original.id}`)}
          >
            <EyeIcon className="size-4" />
          </Button>
        ),
      }),
    ],
    [navigate],
  );

  const table = useReactTable({
    data: (result?.data as OrderRow[]) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {result?.count ?? 0} orders total
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v ?? ""); setPage(1); }}
          items={[
            { value: "", label: "All statuses" },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

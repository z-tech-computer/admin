import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchIcon, CheckIcon, ArrowUpDownIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
};

function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, stock_quantity")
        .order("stock_quantity", { ascending: true });
      if (error) throw error;
      return data!;
    },
  });
}

function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: stock })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Stock updated");
    },
    onError: () => toast.error("Failed to update stock"),
  });
}

function stockBadge(qty: number) {
  if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (qty <= 10)
    return (
      <Badge
        variant="outline"
        className="border-yellow-600/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      >
        Low Stock
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
    >
      In Stock
    </Badge>
  );
}

function StockTable({ rows }: { rows: ProductRow[] }) {
  const mutation = useUpdateStock();
  const [edits, setEdits] = useState<Record<string, number>>({});
  function handleSave(id: string) {
    const stock = edits[id];
    if (stock === undefined) return;
    mutation.mutate(
      { id, stock },
      {
        onSuccess: () =>
          setEdits((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          }),
      },
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p) => {
          const qty = edits[p.id] ?? p.stock_quantity;
          return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="font-mono text-sm">{p.sku}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    className="w-20"
                    value={qty}
                    onChange={(e) =>
                      setEdits((s) => ({
                        ...s,
                        [p.id]: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                  {edits[p.id] !== undefined && (
                    <Button
                      size="icon-sm"
                      disabled={mutation.isPending}
                      onClick={() => handleSave(p.id)}
                    >
                      <CheckIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>{stockBadge(qty)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function InventoryPage() {
  const { data, isLoading } = useInventory();
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    let items = (data ?? []) as ProductRow[];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }
    return [...items].sort((a, b) =>
      sortAsc
        ? a.stock_quantity - b.stock_quantity
        : b.stock_quantity - a.stock_quantity,
    );
  }, [data, search, sortAsc]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} products
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAsc(!sortAsc)}
        >
          <ArrowUpDownIcon className="size-3.5" />
          Stock {sortAsc ? "↑" : "↓"}
        </Button>
      </div>
      <StockTable rows={rows} />
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
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

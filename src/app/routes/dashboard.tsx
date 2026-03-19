import { useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ShoppingCartIcon,
  DollarSignIcon,
  PackageIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [orders, revenue, products, lowStock] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .lt("stock_quantity", 10),
      ]);
      return {
        totalOrders: orders.count ?? 0,
        revenue: (revenue.data ?? []).reduce((sum, o) => sum + o.total, 0),
        activeProducts: products.count ?? 0,
        lowStock: lowStock.count ?? 0,
      };
    },
  });
}

function useRecentOrders() {
  return useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total, created_at, profiles(full_name)",
        )
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data!;
    },
  });
}

function useOrdersChart() {
  return useQuery({
    queryKey: ["dashboard-orders-chart"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      since.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", since.toISOString());
      if (error) throw error;
      return data!;
    },
  });
}

function buildChartData(orders: { created_at: string }[] | undefined) {
  const days: { label: string; iso: string; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      orders: 0,
    });
  }
  for (const o of orders ?? []) {
    const day = days.find((d) => d.iso === o.created_at.slice(0, 10));
    if (day) day.orders++;
  }
  return days;
}

const STATS = [
  { key: "totalOrders" as const, label: "Total Orders", icon: ShoppingCartIcon },
  { key: "revenue" as const, label: "Revenue", icon: DollarSignIcon, fmt: formatCurrency },
  { key: "activeProducts" as const, label: "Active Products", icon: PackageIcon },
  { key: "lowStock" as const, label: "Low Stock Items", icon: AlertTriangleIcon },
];

function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map(({ key, label, icon: Icon, fmt }) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <CardAction>
              <Icon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">
                {fmt
                  ? fmt(stats?.[key] ?? 0)
                  : (stats?.[key] ?? 0).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentOrdersCard() {
  const { data, isLoading } = useRecentOrders();
  if (isLoading) return <Skeleton className="h-72 w-full rounded-xl" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardAction>
          <Link
            to={ROUTES.orders}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRightIcon className="size-3" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono font-medium">
                  {o.order_number}
                </TableCell>
                <TableCell>{o.profiles?.full_name ?? "Unknown"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status] ?? "outline"}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(o.total)}
                </TableCell>
                <TableCell>{formatDate(o.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function OrdersChartCard() {
  const { data } = useOrdersChart();
  const chartData = useMemo(() => buildChartData(data), [data]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="orders"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to Z-TECH-COMPUTER Admin
        </p>
      </div>
      <StatsCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersCard />
        <OrdersChartCard />
      </div>
    </div>
  );
}

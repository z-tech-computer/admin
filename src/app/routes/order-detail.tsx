import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Constants } from "@/types/database";
import type { OrderStatus } from "@/types/database";
import { useOrder, useUpdateOrderStatus } from "@/features/admin-orders/hooks/use-orders";
import { useAuth } from "@/app/providers/auth-provider";
import { OrderItemsTable } from "@/features/admin-orders/components/order-items-table";
import { OrderStatusTimeline } from "@/features/admin-orders/components/order-status-timeline";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ORDER_STATUSES = Constants.public.Enums.order_status;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(id!);
  const updateStatus = useUpdateOrderStatus();

  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  function handleStatusUpdate() {
    if (!id || !newStatus) return;
    updateStatus.mutate(
      {
        orderId: id,
        status: newStatus as OrderStatus,
        note: note || undefined,
        changedBy: user?.id,
      },
      {
        onSuccess: () => {
          setNewStatus("");
          setNote("");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-muted-foreground">Order not found.</p>;
  }

  const profile = order.profiles as { full_name: string | null; phone: string | null; avatar_url: string | null } | null;
  const address = order.shipping_address as Record<string, string> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate("/orders")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"} className="ml-auto">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-4">
            <h3 className="mb-3 font-medium">Items</h3>
            <OrderItemsTable items={order.order_items ?? []} />
            <Separator className="my-3" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-1">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <OrderStatusTimeline history={(order.order_status_history ?? []) as never[]} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 space-y-2">
            <h3 className="font-medium">Customer</h3>
            <p className="text-sm">{profile?.full_name ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
          </Card>

          {address && (
            <Card className="p-4 space-y-2">
              <h3 className="font-medium">Shipping Address</h3>
              <p className="text-sm text-muted-foreground">
                {Object.values(address).filter(Boolean).join(", ")}
              </p>
            </Card>
          )}

          <Card className="p-4 space-y-3">
            <h3 className="font-medium">Update Status</h3>
            <div className="space-y-1.5">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
              />
            </div>
            <Button
              className="w-full"
              disabled={!newStatus || updateStatus.isPending}
              onClick={handleStatusUpdate}
            >
              {updateStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

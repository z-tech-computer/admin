import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OrderStatus } from "@/types/database";
import * as orderService from "@/features/admin-orders/services/order-service";

export function useOrders(params: {
  page?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.getOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
      note,
      changedBy,
    }: {
      orderId: string;
      status: OrderStatus;
      note?: string;
      changedBy?: string;
    }) => orderService.updateOrderStatus(orderId, status, note, changedBy),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order status"),
  });
}

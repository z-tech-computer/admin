import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { OrderStatus } from "@/types/database";

const PAGE_SIZE = 10;

export async function getOrders(params: {
  page?: number;
  status?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("*, profiles(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status) {
    query = query.eq(
      "status",
      params.status as Database["public"]["Enums"]["order_status"],
    );
  }

  if (params.search) {
    query = query.ilike("order_number", `%${params.search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*), order_status_history(*, profiles(full_name)), profiles(full_name, phone, avatar_url)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
  changedBy?: string,
) {
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (orderError) throw orderError;

  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: orderId,
      status,
      note: note ?? null,
      changed_by: changedBy ?? null,
    });
  if (historyError) throw historyError;
}

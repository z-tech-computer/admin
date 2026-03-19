import { supabase } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/types/database";

export async function getBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createBrand(input: TablesInsert<"brands">) {
  const { data, error } = await supabase
    .from("brands")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBrand(id: string, input: TablesUpdate<"brands">) {
  const { data, error } = await supabase
    .from("brands")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw error;
}

import { supabase } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import { compressImageToWebp, calculateFileHash } from "@/lib/utils/image-compression";

const PAGE_SIZE = 10;

export async function getProducts(params: { page?: number; search?: string }) {
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name), brands(name), product_images(url, is_primary)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_specifications(*), categories(name), brands(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(input: TablesInsert<"products">) {
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, input: TablesUpdate<"products">) {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { data: images } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", id);

  if (images?.length) {
    const paths = images.map((img) => extractStoragePath(img.url, "product-images"));
    await supabase.storage.from("product-images").remove(paths);
  }

  await supabase.from("product_specifications").delete().eq("product_id", id);
  await supabase.from("product_images").delete().eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(productId: string, file: File) {
  const compressedFile = await compressImageToWebp(file);
  const hash = await calculateFileHash(compressedFile);
  const path = `${productId}/${hash}.webp`;

  const { error } = await supabase.storage.from("product-images").upload(path, compressedFile);
  
  if (error && !error.message.includes("already exists") && !error.message.includes("Duplicate")) {
    throw error;
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(imageId: string, storagePath: string) {
  await supabase.storage.from("product-images").remove([storagePath]);

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) throw error;
}

export async function addProductImage(input: {
  product_id: string;
  url: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}) {
  const { data, error } = await supabase
    .from("product_images")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProductSpecs(
  productId: string,
  specs: { key: string; value: string; sort_order: number }[],
) {
  const { error: deleteError } = await supabase
    .from("product_specifications")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (specs.length === 0) return;

  const { error: insertError } = await supabase
    .from("product_specifications")
    .insert(specs.map((s) => ({ ...s, product_id: productId })));
  if (insertError) throw insertError;
}

function extractStoragePath(url: string, bucket: string): string {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : url;
}

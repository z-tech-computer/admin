import { supabase } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import { calculateFileHash, compressImageToWebp } from "@/lib/utils/image-compression";

export async function getBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createBanner(input: TablesInsert<"banners">) {
  const { data, error } = await supabase
    .from("banners")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBanner(id: string, input: TablesUpdate<"banners">) {
  const { data, error } = await supabase
    .from("banners")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBanner(id: string) {
  const { data: banner } = await supabase
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .single();

  if (banner?.image_url) {
    const path = extractStoragePath(banner.image_url, "assets");
    await supabase.storage.from("assets").remove([path]);
  }

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadBannerImage(file: File) {
  const compressedFile = await compressImageToWebp(file);
  const hash = await calculateFileHash(compressedFile);
  const path = `banners/${hash}.webp`;

  const { error } = await supabase.storage.from("assets").upload(path, compressedFile);
  if (error) throw error;

  const { data } = supabase.storage.from("assets").getPublicUrl(path);
  return data.publicUrl;
}

function extractStoragePath(url: string, bucket: string): string {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : url;
}

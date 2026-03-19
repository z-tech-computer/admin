import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import * as bannerService from "@/features/banners/services/banner-service";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: bannerService.getBanners,
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<"banners">) =>
      bannerService.createBanner(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner created");
    },
    onError: () => toast.error("Failed to create banner"),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"banners"> }) =>
      bannerService.updateBanner(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner updated");
    },
    onError: () => toast.error("Failed to update banner"),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted");
    },
    onError: () => toast.error("Failed to delete banner"),
  });
}

export function useUploadBannerImage() {
  return useMutation({
    mutationFn: bannerService.uploadBannerImage,
    onError: () => toast.error("Failed to upload banner image"),
  });
}

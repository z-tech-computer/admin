import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import * as brandService from "@/features/brands/services/brand-service";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: brandService.getBrands,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<"brands">) => brandService.createBrand(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand created");
    },
    onError: () => toast.error("Failed to create brand"),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"brands"> }) =>
      brandService.updateBrand(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand updated");
    },
    onError: () => toast.error("Failed to update brand"),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandService.deleteBrand,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand deleted");
    },
    onError: () => toast.error("Failed to delete brand"),
  });
}

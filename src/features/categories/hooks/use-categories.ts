import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import * as categoryService from "@/features/categories/services/category-service";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<"categories">) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: () => toast.error("Failed to create category"),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"categories"> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
    },
    onError: () => toast.error("Failed to update category"),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });
}

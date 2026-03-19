import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import * as productService from "@/features/admin-products/services/product-service";

export function useProducts(params: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<"products">) =>
      productService.createProduct(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
    },
    onError: () => toast.error("Failed to create product"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"products"> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
    },
    onError: () => toast.error("Failed to update product"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      productService.uploadProductImage(productId, file),
    onError: () => toast.error("Failed to upload image"),
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, path }: { imageId: string; path: string }) =>
      productService.deleteProductImage(imageId, path),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image deleted");
    },
    onError: () => toast.error("Failed to delete image"),
  });
}

export function useAddProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.addProductImage,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to save image record"),
  });
}

export function useUpdateProductSpecs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      specs,
    }: {
      productId: string;
      specs: { key: string; value: string; sort_order: number }[];
    }) => productService.updateProductSpecs(productId, specs),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to update specifications"),
  });
}

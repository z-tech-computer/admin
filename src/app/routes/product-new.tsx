import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ImagePlusIcon } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useBrands } from "@/features/brands/hooks/use-brands";
import {
  useCreateProduct,
  useUploadProductImage,
  useAddProductImage,
  useUpdateProductSpecs,
} from "@/features/admin-products/hooks/use-products";
import { ProductForm } from "@/features/admin-products/components/product-form";
import {
  ProductSpecsSection,
  type SpecRow,
} from "@/features/admin-products/components/product-specs-section";
import { PendingImagesPreview } from "@/features/admin-products/components/product-images-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import type { ProductFormValues } from "@/lib/validations/product.schemas";

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: brands, isLoading: brandLoading } = useBrands();

  const createMut = useCreateProduct();
  const uploadMut = useUploadProductImage();
  const addImgMut = useAddProductImage();
  const specsMut = useUpdateProductSpecs();

  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const isPending =
    createMut.isPending || uploadMut.isPending || addImgMut.isPending || specsMut.isPending;

  async function handleSubmit(values: ProductFormValues) {
    const payload = {
      ...values,
      description: values.description || null,
      short_description: values.short_description || null,
    };

    const product = await createMut.mutateAsync(payload);

    for (let i = 0; i < pendingFiles.length; i++) {
      const url = await uploadMut.mutateAsync({ productId: product.id, file: pendingFiles[i] });
      await addImgMut.mutateAsync({
        product_id: product.id,
        url,
        is_primary: i === 0,
        sort_order: i,
      });
    }

    const validSpecs = specs.filter((s) => s.key && s.value);
    if (validSpecs.length > 0) {
      await specsMut.mutateAsync({ productId: product.id, specs: validSpecs });
    }

    navigate(ROUTES.products);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  if (catLoading || brandLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Product</h1>
        <p className="text-sm text-muted-foreground">Create a new product listing</p>
      </div>

      <ProductForm
        categories={categories ?? []}
        brands={brands ?? []}
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="Create Product"
      >
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Images</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlusIcon className="mr-1.5 size-4" /> Add Images
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png, image/jpeg, image/tiff, image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <PendingImagesPreview
            files={pendingFiles}
            onRemove={(i) => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
          {pendingFiles.length === 0 && (
            <p className="text-sm text-muted-foreground">No images selected yet.</p>
          )}
        </Card>

        <Card className="p-4">
          <ProductSpecsSection specs={specs} onChange={setSpecs} />
        </Card>
      </ProductForm>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useBrands } from "@/features/brands/hooks/use-brands";
import {
  useProduct,
  useUpdateProduct,
  useUpdateProductSpecs,
} from "@/features/admin-products/hooks/use-products";
import { ProductForm } from "@/features/admin-products/components/product-form";
import { ProductImagesSection } from "@/features/admin-products/components/product-images-section";
import {
  ProductSpecsSection,
  type SpecRow,
} from "@/features/admin-products/components/product-specs-section";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import type { ProductFormValues } from "@/lib/validations/product.schemas";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading: prodLoading } = useProduct(id!);
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: brands, isLoading: brandLoading } = useBrands();

  const updateMut = useUpdateProduct();
  const specsMut = useUpdateProductSpecs();

  const [specs, setSpecs] = useState<SpecRow[]>([]);

  useEffect(() => {
    if (product?.product_specifications) {
      setSpecs(
        product.product_specifications.map((s) => ({
          key: s.key,
          value: s.value,
          sort_order: s.sort_order,
        })),
      );
    }
  }, [product]);

  const isLoading = prodLoading || catLoading || brandLoading;
  const isPending = updateMut.isPending || specsMut.isPending;

  async function handleSubmit(values: ProductFormValues) {
    if (!id) return;

    const payload = {
      ...values,
      description: values.description || null,
      short_description: values.short_description || null,
    };

    await updateMut.mutateAsync({ id, data: payload });

    const validSpecs = specs.filter((s) => s.key && s.value);
    await specsMut.mutateAsync({ productId: id, specs: validSpecs });

    navigate(ROUTES.products);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-muted-foreground">Product not found.</p>;
  }

  const defaultValues: Partial<ProductFormValues> = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    short_description: product.short_description ?? "",
    price: product.price,
    compare_at_price: product.compare_at_price,
    sku: product.sku,
    stock_quantity: product.stock_quantity,
    category_id: product.category_id,
    brand_id: product.brand_id,
    is_active: product.is_active,
    is_featured: product.is_featured,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm
        defaultValues={defaultValues}
        categories={categories ?? []}
        brands={brands ?? []}
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="Save Changes"
      >
        <Card className="p-4">
          <ProductImagesSection
            productId={product.id}
            images={product.product_images ?? []}
          />
        </Card>

        <Card className="p-4">
          <ProductSpecsSection specs={specs} onChange={setSpecs} />
        </Card>
      </ProductForm>
    </div>
  );
}

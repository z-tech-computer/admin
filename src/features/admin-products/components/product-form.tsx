import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Brand } from "@/types/database";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validations/product.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { slugify } from "@/lib/utils/format";

interface Props {
  defaultValues?: Partial<ProductFormValues>;
  categories: Category[];
  brands: Brand[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
  children?: React.ReactNode;
}

export function ProductForm({
  defaultValues,
  categories,
  brands,
  onSubmit,
  isPending,
  submitLabel,
  children,
}: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: 0,
      compare_at_price: null,
      sku: "",
      stock_quantity: 0,
      category_id: "",
      brand_id: null,
      is_active: true,
      is_featured: false,
      ...defaultValues,
    },
  });

  const { register, formState: { errors }, watch, setValue, handleSubmit } = form;

  function handleNameBlur() {
    const name = form.getValues("name");
    if (name && !form.getValues("slug")) {
      setValue("slug", slugify(name));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4 space-y-4">
        <h3 className="font-medium">Basic Info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Name" error={errors.name?.message}>
            <Input {...register("name")} onBlur={handleNameBlur} />
          </FieldWrapper>
          <FieldWrapper label="Slug" error={errors.slug?.message}>
            <Input {...register("slug")} />
          </FieldWrapper>
          <FieldWrapper label="SKU" error={errors.sku?.message}>
            <Input {...register("sku")} />
          </FieldWrapper>
          <FieldWrapper label="Stock Quantity" error={errors.stock_quantity?.message}>
            <Input type="number" {...register("stock_quantity", { valueAsNumber: true })} />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Short Description">
          <Input {...register("short_description")} />
        </FieldWrapper>
        <FieldWrapper label="Description">
          <Textarea rows={4} {...register("description")} />
        </FieldWrapper>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="font-medium">Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Price" error={errors.price?.message}>
            <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
          </FieldWrapper>
          <FieldWrapper label="Compare At Price" error={errors.compare_at_price?.message}>
            <Input
              type="number"
              step="0.01"
              placeholder="Optional"
              {...register("compare_at_price", {
                setValueAs: (v: string) => (v === "" ? null : parseFloat(v)),
              })}
            />
          </FieldWrapper>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="font-medium">Organization</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Category" error={errors.category_id?.message}>
            <Select
              value={watch("category_id")}
              onValueChange={(v) => setValue("category_id", v ?? "")}
              items={categories.map((c) => ({ value: c.id, label: c.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Brand">
            <Select
              value={watch("brand_id") ?? ""}
              onValueChange={(v) => setValue("brand_id", v || null)}
              items={brands.map((b) => ({ value: b.id, label: b.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
            <Label>Active</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={watch("is_featured")} onCheckedChange={(v) => setValue("is_featured", v)} />
            <Label>Featured</Label>
          </div>
        </div>
      </Card>

      {children}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

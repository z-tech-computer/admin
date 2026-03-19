import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string(),
  short_description: z.string(),
  price: z.number().positive("Price must be positive"),
  compare_at_price: z.number().positive("Must be positive").nullable(),
  sku: z.string().min(1, "SKU is required"),
  stock_quantity: z.number().int().min(0, "Cannot be negative"),
  category_id: z.string().min(1, "Category is required"),
  brand_id: z.string().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

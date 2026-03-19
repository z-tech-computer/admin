import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

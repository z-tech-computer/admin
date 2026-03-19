import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
  is_active: z.boolean(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

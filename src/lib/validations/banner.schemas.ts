import { z } from "zod";

export const bannerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string(),
  link_url: z.union([z.string().url("Must be a valid URL"), z.literal("")]),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;

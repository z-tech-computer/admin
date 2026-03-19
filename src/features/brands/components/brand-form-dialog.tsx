import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Brand } from "@/types/database";
import {
  brandFormSchema,
  type BrandFormValues,
} from "@/lib/validations/brand.schemas";
import {
  useCreateBrand,
  useUpdateBrand,
} from "@/features/brands/hooks/use-brands";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
}

export function BrandFormDialog({ open, onOpenChange, brand }: Props) {
  const isEdit = !!brand;
  const create = useCreateBrand();
  const update = useUpdateBrand();
  const isPending = create.isPending || update.isPending;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "", slug: "", is_active: true },
  });

  useEffect(() => {
    if (open && brand) {
      form.reset({ name: brand.name, slug: brand.slug, is_active: brand.is_active });
    } else if (open) {
      form.reset({ name: "", slug: "", is_active: true });
    }
  }, [open, brand, form]);

  function handleNameBlur() {
    const name = form.getValues("name");
    if (name && !form.getValues("slug")) {
      form.setValue("slug", slugify(name));
    }
  }

  async function onSubmit(values: BrandFormValues) {
    if (isEdit) {
      await update.mutateAsync({ id: brand.id, data: values });
    } else {
      await create.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Brand" : "Add Brand"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} onBlur={handleNameBlur} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("is_active")}
              onCheckedChange={(val) => form.setValue("is_active", val)}
            />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

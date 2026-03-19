import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@/types/database";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/validations/category.schemas";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/features/categories/hooks/use-categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const isEdit = !!category;
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const isPending = create.isPending || update.isPending;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        is_active: category.is_active,
        sort_order: category.sort_order,
      });
    } else if (open) {
      form.reset({ name: "", slug: "", description: "", is_active: true, sort_order: 0 });
    }
  }, [open, category, form]);

  function handleNameBlur() {
    const name = form.getValues("name");
    if (name && !form.getValues("slug")) {
      form.setValue("slug", slugify(name));
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    const payload = { ...values, description: values.description || null };
    if (isEdit) {
      await update.mutateAsync({ id: category.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
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
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input id="sort_order" type="number" {...form.register("sort_order", { valueAsNumber: true })} />
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

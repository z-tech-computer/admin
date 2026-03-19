import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlusIcon } from "lucide-react";
import type { Banner } from "@/types/database";
import {
  bannerFormSchema,
  type BannerFormValues,
} from "@/lib/validations/banner.schemas";
import {
  useCreateBanner,
  useUpdateBanner,
} from "@/features/banners/hooks/use-banners";
import { useUploadBannerImage } from "@/features/banners/hooks/use-banners";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Banner | null;
}

export function BannerFormDialog({ open, onOpenChange, banner }: Props) {
  const isEdit = !!banner;
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const upload = useUploadBannerImage();
  const isPending = create.isPending || update.isPending || upload.isPending;

  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { title: "", subtitle: "", link_url: "", is_active: true, sort_order: 0 },
  });

  useEffect(() => {
    if (open && banner) {
      form.reset({
        title: banner.title,
        subtitle: banner.subtitle ?? "",
        link_url: banner.link_url ?? "",
        is_active: banner.is_active,
        sort_order: banner.sort_order,
      });
      setPreview(banner.image_url);
      selectedFile.current = null;
    } else if (open) {
      form.reset({ title: "", subtitle: "", link_url: "", is_active: true, sort_order: 0 });
      setPreview(null);
      selectedFile.current = null;
    }
  }, [open, banner, form]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    selectedFile.current = file;
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: BannerFormValues) {
    let imageUrl = banner?.image_url ?? "";

    if (selectedFile.current) {
      imageUrl = await upload.mutateAsync(selectedFile.current);
    }

    if (!imageUrl) return;

    const payload = {
      ...values,
      subtitle: values.subtitle || null,
      link_url: values.link_url || null,
      image_url: imageUrl,
    };

    if (isEdit) {
      await update.mutateAsync({ id: banner.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Banner" : "Add Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Banner Image</Label>
            <input ref={fileRef} type="file" accept="image/png, image/jpeg, image/tiff, image/webp" className="hidden" onChange={handleFileSelect} />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-32 w-full rounded-lg object-cover cursor-pointer"
                onClick={() => fileRef.current?.click()}
              />
            ) : (
              <button
                type="button"
                className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlusIcon className="mr-2 size-5" /> Upload Image
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" {...form.register("subtitle")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link_url">Link URL</Label>
            <Input id="link_url" placeholder="https://..." {...form.register("link_url")} />
            {form.formState.errors.link_url && (
              <p className="text-sm text-destructive">{form.formState.errors.link_url.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" {...form.register("sort_order", { valueAsNumber: true })} />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch
                checked={form.watch("is_active")}
                onCheckedChange={(val) => form.setValue("is_active", val)}
              />
              <Label>Active</Label>
            </div>
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

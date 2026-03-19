import { useRef } from "react";
import { ImagePlusIcon, TrashIcon, StarIcon } from "lucide-react";
import type { ProductImage } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  useUploadProductImage,
  useDeleteProductImage,
  useAddProductImage,
} from "@/features/admin-products/hooks/use-products";

interface Props {
  productId: string;
  images: ProductImage[];
}

export function ProductImagesSection({ productId, images }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMut = useUploadProductImage();
  const deleteMut = useDeleteProductImage();
  const addMut = useAddProductImage();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = await uploadMut.mutateAsync({ productId, file });
      await addMut.mutateAsync({
        product_id: productId,
        url,
        is_primary: images.length === 0,
        sort_order: images.length,
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDelete(img: ProductImage) {
    const path = extractPath(img.url);
    deleteMut.mutate({ imageId: img.id, path });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Images</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMut.isPending}
        >
          <ImagePlusIcon className="mr-1.5 size-4" />
          {uploadMut.isPending ? "Uploading..." : "Add Images"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png, image/jpeg, image/tiff, image/webp"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-lg border">
                <img
                  src={img.url}
                  alt={img.alt_text ?? "Product"}
                  className="aspect-square w-full object-cover"
                />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Primary
                  </span>
                )}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => handleDelete(img)}
                    disabled={deleteMut.isPending}
                  >
                    <TrashIcon className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

interface PendingImagesProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function PendingImagesPreview({ files, onRemove }: PendingImagesProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {files.map((file, i) => (
        <div key={file.name + i} className="group relative overflow-hidden rounded-lg border">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="aspect-square w-full object-cover"
          />
          {i === 0 && (
            <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              <StarIcon className="size-2.5" /> Primary
            </span>
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(i)}
          >
            <TrashIcon className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function extractPath(url: string): string {
  const marker = "/storage/v1/object/public/product-images/";
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : url;
}

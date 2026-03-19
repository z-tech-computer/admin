import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SpecRow {
  key: string;
  value: string;
  sort_order: number;
}

interface Props {
  specs: SpecRow[];
  onChange: (specs: SpecRow[]) => void;
}

export function ProductSpecsSection({ specs, onChange }: Props) {
  function addRow() {
    onChange([...specs, { key: "", value: "", sort_order: specs.length }]);
  }

  function removeRow(index: number) {
    onChange(specs.filter((_, i) => i !== index).map((s, i) => ({ ...s, sort_order: i })));
  }

  function updateRow(index: number, field: "key" | "value", val: string) {
    onChange(specs.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Specifications</h3>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <PlusIcon className="mr-1.5 size-4" /> Add Spec
        </Button>
      </div>
      {specs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No specifications yet.</p>
      ) : (
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Key"
                value={spec.key}
                onChange={(e) => updateRow(i, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateRow(i, "value", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeRow(i)}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

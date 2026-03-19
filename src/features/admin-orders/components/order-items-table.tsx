import type { OrderItem } from "@/types/database";
import { formatCurrency } from "@/lib/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                {item.product_image_url && (
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="size-10 rounded-md object-cover"
                  />
                )}
                <span className="font-medium">{item.product_name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.product_price)}
            </TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(item.subtotal)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

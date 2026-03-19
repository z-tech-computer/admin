import { formatDateTime } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface StatusEntry {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

interface Props {
  history: StatusEntry[];
}

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export function OrderStatusTimeline({ history }: Props) {
  const sorted = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Status History</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No history recorded.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 border-l-2 border-muted pl-4 pb-1">
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_COLOR[entry.status] ?? "outline"}>
                    {entry.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-muted-foreground">{entry.note}</p>
                )}
                {entry.profiles?.full_name && (
                  <p className="text-xs text-muted-foreground">
                    by {entry.profiles.full_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

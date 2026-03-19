import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button render={<Link to={ROUTES.dashboard} />} nativeButton={false}>
        Back to Dashboard
      </Button>
    </div>
  );
}

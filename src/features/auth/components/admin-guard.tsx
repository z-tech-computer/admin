import { Navigate, Outlet } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function AdminGuard() {
  const { session, profile, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have admin privileges.
        </p>
        <Button onClick={() => void signOut()}>Sign Out</Button>
      </div>
    );
  }

  return <Outlet />;
}

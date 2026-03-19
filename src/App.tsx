import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/app/providers/query-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster richColors closeButton />
      </AuthProvider>
    </QueryProvider>
  );
}

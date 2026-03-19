import { createHashRouter, RouterProvider, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import AdminGuard from "@/features/auth/components/admin-guard";
import AdminLayout from "@/components/shared/admin-layout";

function RouteErrorFallback() {
  const error = useRouteError();
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-4 text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  );
}

function lazyRoute(importFn: () => Promise<{ default: React.ComponentType }>) {
  return async () => {
    const { default: Component } = await importFn();
    return { Component };
  };
}

const router = createHashRouter([
  {
    path: "auth/login",
    lazy: lazyRoute(() => import("@/app/routes/login")),
  },
  {
    path: "/",
    Component: AdminGuard,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        Component: AdminLayout,
        children: [
          {
            index: true,
            lazy: lazyRoute(() => import("@/app/routes/dashboard")),
          },
          {
            path: "products",
            lazy: lazyRoute(() => import("@/app/routes/products")),
          },
          {
            path: "products/new",
            lazy: lazyRoute(() => import("@/app/routes/product-new")),
          },
          {
            path: "products/:id/edit",
            lazy: lazyRoute(() => import("@/app/routes/product-edit")),
          },
          {
            path: "categories",
            lazy: lazyRoute(() => import("@/app/routes/categories")),
          },
          {
            path: "brands",
            lazy: lazyRoute(() => import("@/app/routes/brands")),
          },
          {
            path: "orders",
            lazy: lazyRoute(() => import("@/app/routes/orders")),
          },
          {
            path: "orders/:id",
            lazy: lazyRoute(() => import("@/app/routes/order-detail")),
          },
          {
            path: "inventory",
            lazy: lazyRoute(() => import("@/app/routes/inventory")),
          },
          {
            path: "banners",
            lazy: lazyRoute(() => import("@/app/routes/banners")),
          },
          {
            path: "customers",
            lazy: lazyRoute(() => import("@/app/routes/customers")),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    lazy: lazyRoute(() => import("@/app/routes/not-found")),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export const APP_NAME = "Z-TECH-COMPUTER Admin";

export const ROUTES = {
  dashboard: "/",
  products: "/products",
  productNew: "/products/new",
  productEdit: "/products/:id/edit",
  categories: "/categories",
  brands: "/brands",
  orders: "/orders",
  orderDetail: "/orders/:id",
  inventory: "/inventory",
  banners: "/banners",
  customers: "/customers",
  login: "/auth/login",
} as const;

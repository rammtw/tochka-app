import { resolve } from "node:path";

export const config = {
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3001),
  dataDirectory: resolve(process.env.DATA_DIR ?? "data"),
  distDirectory: resolve("dist"),
  isProduction: process.env.NODE_ENV === "production",
  authUsername: process.env.AUTH_USERNAME ?? "admin",
  authPassword: process.env.AUTH_PASSWORD ?? "Tochka!2026",
  cookieSecure: process.env.COOKIE_SECURE === "true",
};

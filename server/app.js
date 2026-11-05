import express from "express";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";
import { HttpError } from "./http-error.js";
import { taskRouter } from "./task-routes.js";
import { wikiRouter } from "./wiki-routes.js";

export const app = express();

app.disable("x-powered-by");
app.use((_request, response, next) => {
  response.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  });
  next();
});
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/tasks", taskRouter);
app.use("/api/wiki", wikiRouter);
app.use("/api", (_request, _response, next) => {
  next(new HttpError(404, "API-метод не найден"));
});

if (config.isProduction) {
  if (!existsSync(config.distDirectory)) {
    throw new Error("Сначала выполните npm run build");
  }
  app.use(express.static(config.distDirectory));
  app.get("/{*path}", (_request, response) => {
    response.sendFile(join(config.distDirectory, "index.html"));
  });
}

app.use((_request, _response, next) => {
  next(new HttpError(404, "Страница не найдена"));
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return response.status(400).json({ message: "Некорректный JSON" });
  }
  const status = error.status ?? 500;
  if (status >= 500) {
    console.error(error);
  }
  return response.status(status).json({
    message: status >= 500 ? "Внутренняя ошибка сервера" : error.message,
  });
});

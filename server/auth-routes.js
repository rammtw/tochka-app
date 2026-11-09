import { Router } from "express";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  createSession,
  destroySession,
  getSessionUser,
  recordLoginFailure,
  verifyCredentials,
} from "./auth-service.js";
import { HttpError } from "./http-error.js";
import { validateCredentials } from "./validation.js";

export const authRouter = Router();

authRouter.use((_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});

authRouter.get("/session", (request, response) => {
  const username = getSessionUser(request);
  if (!username) throw new HttpError(401, "Сессия не найдена");
  response.json({ user: { username } });
});

authRouter.post("/login", (request, response) => {
  checkLoginRateLimit(request, response);
  const { username, password } = validateCredentials(request.body);
  if (!verifyCredentials(username, password)) {
    recordLoginFailure(request);
    throw new HttpError(401, "Неверный логин или пароль");
  }
  clearLoginFailures(request);
  createSession(response, username);
  response.json({ user: { username } });
});

authRouter.post("/logout", (request, response) => {
  destroySession(request, response);
  response.status(204).end();
});

import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { config } from "./config.js";
import { database } from "./database.js";
import { HttpError } from "./http-error.js";

const SESSION_COOKIE = "tochka_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const LOGIN_WINDOW = 15 * 60 * 1000;
const LOGIN_ATTEMPTS = 5;
const passwordSalt = randomBytes(16);
const passwordHash = scryptSync(config.authPassword, passwordSalt, 64);
const loginAttempts = new Map();

function hashValue(value) {
  return createHash("sha256").update(value).digest();
}

function tokenFromRequest(request) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    const name = cookie.slice(0, separator).trim();
    if (name === SESSION_COOKIE) return cookie.slice(separator + 1).trim();
  }
  return null;
}

export function verifyCredentials(username, password) {
  const usernameMatches = timingSafeEqual(
    hashValue(username),
    hashValue(config.authUsername),
  );
  const candidate = scryptSync(password, passwordSalt, 64);
  const passwordMatches = timingSafeEqual(candidate, passwordHash);
  return usernameMatches && passwordMatches;
}

export function getSessionUser(request) {
  const token = tokenFromRequest(request);
  if (!token) return null;
  const tokenHash = hashValue(token).toString("hex");
  const session = database
    .prepare("SELECT username, expires_at AS expiresAt FROM sessions WHERE token_hash = ?")
    .get(tokenHash);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }
  return session.username;
}

export function requireAuth(request, _response, next) {
  const username = getSessionUser(request);
  if (!username) {
    return next(new HttpError(401, "Требуется авторизация"));
  }
  request.authUsername = username;
  return next();
}

export function createSession(response, username) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashValue(token).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION;
  database.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  database
    .prepare("INSERT INTO sessions (token_hash, username, expires_at) VALUES (?, ?, ?)")
    .run(tokenHash, username, expiresAt);
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: config.cookieSecure,
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export function destroySession(request, response) {
  const token = tokenFromRequest(request);
  if (token) {
    database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashValue(token).toString("hex"));
  }
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "strict",
    secure: config.cookieSecure,
    path: "/",
  });
}

export function checkLoginRateLimit(request) {
  const key = request.ip ?? "unknown";
  const record = loginAttempts.get(key);
  if (!record) return;
  if (record.resetAt <= Date.now()) {
    loginAttempts.delete(key);
    return;
  }
  if (record.count >= LOGIN_ATTEMPTS) {
    throw new HttpError(429, "Слишком много попыток. Повторите через 15 минут");
  }
}

export function recordLoginFailure(request) {
  const key = request.ip ?? "unknown";
  const current = loginAttempts.get(key);
  const record = !current || current.resetAt <= Date.now()
    ? { count: 0, resetAt: Date.now() + LOGIN_WINDOW }
    : current;
  record.count += 1;
  loginAttempts.set(key, record);
}

export function clearLoginFailures(request) {
  loginAttempts.delete(request.ip ?? "unknown");
}

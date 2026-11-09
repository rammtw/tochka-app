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
const LOGIN_WINDOW = 120 * 60 * 1000;
const LOGIN_ATTEMPTS = 3;
const passwordSalt = randomBytes(16);
const passwordHash = scryptSync(config.authPassword, passwordSalt, 64);

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

function loginAttemptKey(request) {
  return hashValue(request.ip ?? "unknown").toString("hex");
}

export function checkLoginRateLimit(request, response) {
  const now = Date.now();
  database.prepare("DELETE FROM login_attempts WHERE reset_at <= ?").run(now);
  const record = database
    .prepare(
      "SELECT failure_count AS failureCount, reset_at AS resetAt FROM login_attempts WHERE ip_hash = ?",
    )
    .get(loginAttemptKey(request));
  if (!record || record.failureCount < LOGIN_ATTEMPTS) return;

  const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  const retryMinutes = Math.max(1, Math.ceil(retryAfter / 60));
  response.set("Retry-After", String(retryAfter));
  throw new HttpError(
    429,
    `Слишком много попыток.`,
  );
}

export function recordLoginFailure(request) {
  const now = Date.now();
  database
    .prepare(
      `INSERT INTO login_attempts (ip_hash, failure_count, reset_at)
       VALUES (?, 1, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET
         failure_count = CASE
           WHEN login_attempts.reset_at <= ? THEN 1
           ELSE login_attempts.failure_count + 1
         END,
         reset_at = CASE
           WHEN login_attempts.reset_at <= ? THEN excluded.reset_at
           ELSE login_attempts.reset_at
         END`,
    )
    .run(loginAttemptKey(request), now + LOGIN_WINDOW, now, now);
}

export function clearLoginFailures(request) {
  database
    .prepare("DELETE FROM login_attempts WHERE ip_hash = ?")
    .run(loginAttemptKey(request));
}

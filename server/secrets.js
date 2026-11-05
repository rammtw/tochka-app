import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import {
  chmodSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";

function loadKey() {
  if (process.env.DATA_ENCRYPTION_KEY) {
    const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY, "hex");
    if (key.length !== 32 || process.env.DATA_ENCRYPTION_KEY.length !== 64) {
      throw new Error(
        "DATA_ENCRYPTION_KEY должен содержать 32 байта в hex-формате (64 символа)",
      );
    }
    return key;
  }

  const keyPath = join(config.dataDirectory, ".encryption-key");
  if (existsSync(keyPath)) {
    const storedKey = readFileSync(keyPath, "utf8").trim();
    const key = Buffer.from(storedKey, "hex");
    if (key.length !== 32 || storedKey.length !== 64) {
      throw new Error(`Некорректный ключ шифрования в ${keyPath}`);
    }
    return key;
  }

  const key = randomBytes(32);
  writeFileSync(keyPath, key.toString("hex"), { mode: 0o600, flag: "wx" });
  chmodSync(keyPath, 0o600);
  return key;
}

const encryptionKey = loadKey();

export function encryptSecret(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptSecret(payload) {
  const [version, iv, tag, encrypted] = payload.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) {
    throw new Error("Некорректный формат зашифрованного пароля");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

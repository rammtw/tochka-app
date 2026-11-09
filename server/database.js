import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { config } from "./config.js";

mkdirSync(config.dataDirectory, { recursive: true });

export const database = new DatabaseSync(
  join(config.dataDirectory, "daily-tracker.sqlite"),
);

database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    task_date TEXT NOT NULL,
    task_time TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS tasks_date_index
    ON tasks(task_date, task_time);

  CREATE TABLE IF NOT EXISTS wiki_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Общее',
    content TEXT NOT NULL DEFAULT '',
    encrypted_password TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS wiki_entries_updated_index
    ON wiki_entries(updated_at DESC);

  CREATE TABLE IF NOT EXISTS password_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    login TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    encrypted_password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS password_entries_updated_index
    ON password_entries(updated_at DESC);

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS sessions_expiry_index ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS login_attempts (
    ip_hash TEXT PRIMARY KEY,
    failure_count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS login_attempts_reset_index
    ON login_attempts(reset_at);

  BEGIN IMMEDIATE;
  INSERT INTO password_entries (title, notes, encrypted_password, created_at, updated_at)
    SELECT title, 'Перенесено из базы знаний', encrypted_password, created_at, updated_at
    FROM wiki_entries WHERE encrypted_password IS NOT NULL;
  UPDATE wiki_entries SET encrypted_password = NULL WHERE encrypted_password IS NOT NULL;
  COMMIT;
`);

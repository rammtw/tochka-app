import { Router } from "express";
import { database } from "./database.js";
import { HttpError } from "./http-error.js";
import { decryptSecret, encryptSecret } from "./secrets.js";
import { numericId, validatePasswordEntry } from "./validation.js";

export const passwordRouter = Router();

const passwordColumns = `
  id,
  title,
  login,
  url,
  notes,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

function findPasswordEntry(id) {
  const row = database
    .prepare(`SELECT ${passwordColumns} FROM password_entries WHERE id = ?`)
    .get(id);
  if (!row) {
    throw new HttpError(404, "Парольная запись не найдена");
  }
  return row;
}

passwordRouter.get("/", (_request, response) => {
  const rows = database
    .prepare(
      `SELECT ${passwordColumns} FROM password_entries
       ORDER BY updated_at DESC, id DESC`,
    )
    .all();
  response.json(rows);
});

passwordRouter.post("/", (request, response) => {
  const input = validatePasswordEntry(request.body);
  const result = database
    .prepare(
      `INSERT INTO password_entries (title, login, url, notes, encrypted_password)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(input.title, input.login, input.url, input.notes, encryptSecret(input.password));
  response.status(201).json(findPasswordEntry(Number(result.lastInsertRowid)));
});

passwordRouter.patch("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findPasswordEntry(id);
  const input = validatePasswordEntry(request.body, true);
  const columns = {
    title: input.title,
    login: input.login,
    url: input.url,
    notes: input.notes,
    encrypted_password: input.password ? encryptSecret(input.password) : undefined,
  };
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);

  if (entries.length) {
    const assignments = entries.map(([column]) => `${column} = ?`).join(", ");
    database
      .prepare(
        `UPDATE password_entries SET ${assignments},
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      )
      .run(...entries.map(([, value]) => value), id);
  }
  response.json(findPasswordEntry(id));
});

passwordRouter.post("/:id/reveal", (request, response) => {
  const id = numericId(request.params.id);
  findPasswordEntry(id);
  const row = database
    .prepare("SELECT encrypted_password AS password FROM password_entries WHERE id = ?")
    .get(id);
  response.json({ password: decryptSecret(row.password) });
});

passwordRouter.delete("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findPasswordEntry(id);
  database.prepare("DELETE FROM password_entries WHERE id = ?").run(id);
  response.status(204).end();
});

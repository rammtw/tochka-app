import { Router } from "express";
import { database } from "./database.js";
import { HttpError } from "./http-error.js";
import { decryptSecret, encryptSecret } from "./secrets.js";
import { numericId, validateWikiEntry } from "./validation.js";

export const wikiRouter = Router();

const wikiColumns = `
  id,
  title,
  category,
  content,
  encrypted_password IS NOT NULL AS hasPassword,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

function findWikiEntry(id) {
  const row = database
    .prepare(`SELECT ${wikiColumns} FROM wiki_entries WHERE id = ?`)
    .get(id);
  if (!row) {
    throw new HttpError(404, "Запись не найдена");
  }
  return { ...row, hasPassword: Boolean(row.hasPassword) };
}

wikiRouter.get("/", (_request, response) => {
  const rows = database
    .prepare(
      `SELECT ${wikiColumns} FROM wiki_entries
       ORDER BY updated_at DESC, id DESC`,
    )
    .all();
  response.json(
    rows.map((row) => ({ ...row, hasPassword: Boolean(row.hasPassword) })),
  );
});

wikiRouter.post("/", (request, response) => {
  const input = validateWikiEntry(request.body);
  const encryptedPassword = input.password
    ? encryptSecret(input.password)
    : null;
  const result = database
    .prepare(
      `INSERT INTO wiki_entries (title, category, content, encrypted_password)
       VALUES (?, ?, ?, ?)`,
    )
    .run(input.title, input.category, input.content, encryptedPassword);
  response.status(201).json(findWikiEntry(Number(result.lastInsertRowid)));
});

wikiRouter.patch("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findWikiEntry(id);
  const input = validateWikiEntry(request.body, true);
  const encryptedPassword = input.clearPassword
    ? null
    : input.password
      ? encryptSecret(input.password)
      : undefined;
  const columns = {
    title: input.title,
    category: input.category,
    content: input.content,
    encrypted_password: encryptedPassword,
  };
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);

  if (entries.length) {
    const assignments = entries.map(([column]) => `${column} = ?`).join(", ");
    database
      .prepare(
        `UPDATE wiki_entries SET ${assignments},
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      )
      .run(...entries.map(([, value]) => value), id);
  }
  response.json(findWikiEntry(id));
});

wikiRouter.post("/:id/reveal", (request, response) => {
  const id = numericId(request.params.id);
  findWikiEntry(id);
  const row = database
    .prepare("SELECT encrypted_password AS password FROM wiki_entries WHERE id = ?")
    .get(id);
  if (!row.password) {
    throw new HttpError(404, "У этой записи нет сохранённого пароля");
  }
  response.json({ password: decryptSecret(row.password) });
});

wikiRouter.delete("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findWikiEntry(id);
  database.prepare("DELETE FROM wiki_entries WHERE id = ?").run(id);
  response.status(204).end();
});

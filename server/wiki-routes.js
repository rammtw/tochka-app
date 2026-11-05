import { Router } from "express";
import { database } from "./database.js";
import { HttpError } from "./http-error.js";
import { numericId, validateWikiEntry } from "./validation.js";

export const wikiRouter = Router();

const wikiColumns = `
  id,
  title,
  category,
  content,
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
  return row;
}

wikiRouter.get("/", (_request, response) => {
  const rows = database
    .prepare(
      `SELECT ${wikiColumns} FROM wiki_entries
       ORDER BY updated_at DESC, id DESC`,
    )
    .all();
  response.json(rows);
});

wikiRouter.get("/:id", (request, response) => {
  response.json(findWikiEntry(numericId(request.params.id)));
});

wikiRouter.post("/", (request, response) => {
  const input = validateWikiEntry(request.body);
  const result = database
    .prepare(
      `INSERT INTO wiki_entries (title, category, content)
       VALUES (?, ?, ?)`,
    )
    .run(input.title, input.category, input.content);
  response.status(201).json(findWikiEntry(Number(result.lastInsertRowid)));
});

wikiRouter.patch("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findWikiEntry(id);
  const input = validateWikiEntry(request.body, true);
  const columns = {
    title: input.title,
    category: input.category,
    content: input.content,
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

wikiRouter.delete("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findWikiEntry(id);
  database.prepare("DELETE FROM wiki_entries WHERE id = ?").run(id);
  response.status(204).end();
});

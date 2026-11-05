import { Router } from "express";
import { database } from "./database.js";
import { HttpError } from "./http-error.js";
import { numericId, taskDate, validateTask } from "./validation.js";

export const taskRouter = Router();

const taskColumns = `
  id,
  title,
  description,
  task_date AS date,
  task_time AS time,
  completed,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

function serializeTask(row) {
  return row ? { ...row, completed: Boolean(row.completed) } : null;
}

function findTask(id) {
  const row = database
    .prepare(`SELECT ${taskColumns} FROM tasks WHERE id = ?`)
    .get(id);
  if (!row) {
    throw new HttpError(404, "Задача не найдена");
  }
  return serializeTask(row);
}

taskRouter.get("/", (request, response) => {
  const date = taskDate(request.query.date);
  const rows = database
    .prepare(
      `SELECT ${taskColumns} FROM tasks
       WHERE task_date = ? ORDER BY task_time, id`,
    )
    .all(date);
  response.json(rows.map(serializeTask));
});

taskRouter.post("/", (request, response) => {
  const input = validateTask(request.body);
  const result = database
    .prepare(
      `INSERT INTO tasks (title, description, task_date, task_time, completed)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.title,
      input.description,
      input.date,
      input.time,
      Number(input.completed ?? false),
    );
  response.status(201).json(findTask(Number(result.lastInsertRowid)));
});

taskRouter.patch("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findTask(id);
  const input = validateTask(request.body, true);
  const columns = {
    title: input.title,
    description: input.description,
    task_date: input.date,
    task_time: input.time,
    completed: input.completed === undefined ? undefined : Number(input.completed),
  };
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);

  if (entries.length) {
    const assignments = entries.map(([column]) => `${column} = ?`).join(", ");
    database
      .prepare(
        `UPDATE tasks SET ${assignments},
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      )
      .run(...entries.map(([, value]) => value), id);
  }
  response.json(findTask(id));
});

taskRouter.delete("/:id", (request, response) => {
  const id = numericId(request.params.id);
  findTask(id);
  database.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  response.status(204).end();
});

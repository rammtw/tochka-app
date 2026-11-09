import { HttpError } from "./http-error.js";

function assertObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Ожидался JSON-объект");
  }
}

function text(value, field, maxLength, { required = false } = {}) {
  if (typeof value !== "string") {
    throw new HttpError(400, `Поле «${field}» должно быть строкой`);
  }
  const result = value.trim();
  if (required && !result) {
    throw new HttpError(400, `Заполните поле «${field}»`);
  }
  if (value.length > maxLength) {
    throw new HttpError(400, `Поле «${field}» не длиннее ${maxLength} символов`);
  }
  return result;
}

function website(value) {
  const result = text(value, "Ссылка", 2000);
  if (!result) return "";
  const normalized = /^https?:\/\//i.test(result) ? result : `https://${result}`;
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new HttpError(400, "Укажите корректную ссылку");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
    throw new HttpError(400, "Ссылка должна использовать HTTP или HTTPS");
  }
  return parsed.toString();
}

export function taskDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "Дата должна быть в формате ГГГГ-ММ-ДД");
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, "Указана несуществующая дата");
  }
  return value;
}

function taskTime(value) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new HttpError(400, "Время должно быть в формате ЧЧ:ММ");
  }
  return value;
}

export function validateCredentials(body) {
  assertObject(body);
  const { username, password } = body;
  if (
    typeof username !== "string" || typeof password !== "string" ||
    !username.trim() || !password || username.length > 320 || password.length > 1000
  ) {
    throw new HttpError(400, "Введите логин и пароль");
  }
  return { username: username.trim(), password };
}

export function validateTask(body, partial = false) {
  assertObject(body);
  const result = {};

  if (!partial || "title" in body) {
    result.title = text(body.title, "Название", 160, { required: true });
  }
  if (!partial || "description" in body) {
    result.description = text(body.description, "Описание", 5000);
  }
  if (!partial || "date" in body) {
    result.date = taskDate(body.date);
  }
  if (!partial || "time" in body) {
    result.time = taskTime(body.time);
  }
  if ("completed" in body) {
    if (typeof body.completed !== "boolean") {
      throw new HttpError(400, "Поле «completed» должно быть boolean");
    }
    result.completed = body.completed;
  }
  return result;
}

export function validateWikiEntry(body, partial = false) {
  assertObject(body);
  const result = {};

  if (!partial || "title" in body) {
    result.title = text(body.title, "Название", 160, { required: true });
  }
  if (!partial || "category" in body) {
    result.category = text(body.category, "Категория", 60) || "Общее";
  }
  if (!partial || "content" in body) {
    result.content = text(body.content, "Текст", 20000);
  }
  return result;
}

export function validatePasswordEntry(body, partial = false) {
  assertObject(body);
  const result = {};

  if (!partial || "title" in body) {
    result.title = text(body.title, "Название", 160, { required: true });
  }
  if (!partial || "login" in body) {
    result.login = text(body.login, "Логин", 320);
  }
  if (!partial || "url" in body) {
    result.url = website(body.url);
  }
  if (!partial || "notes" in body) {
    result.notes = text(body.notes, "Заметка", 5000);
  }
  if (!partial || "password" in body) {
    result.password = text(body.password, "Пароль", 1000, { required: true });
  }
  return result;
}

export function numericId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "Некорректный идентификатор");
  }
  return Number(value);
}

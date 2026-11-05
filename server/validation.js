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
  if ("password" in body) {
    result.password = text(body.password, "Пароль", 1000);
  }
  if ("clearPassword" in body) {
    if (typeof body.clearPassword !== "boolean") {
      throw new HttpError(400, "Поле «clearPassword» должно быть boolean");
    }
    result.clearPassword = body.clearPassword;
  }
  return result;
}

export function numericId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "Некорректный идентификатор");
  }
  return Number(value);
}

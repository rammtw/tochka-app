import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import type { Task, TaskInput } from "../api/tasks-api";

type TaskFormProps = {
  date: string;
  task?: Task;
  saving: boolean;
  onSave: (input: TaskInput) => Promise<void>;
  onClose: () => void;
};

export function TaskForm({ date, task, saving, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [time, setTime] = useState(task?.time ?? "09:00");
  const [description, setDescription] = useState(task?.description ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSave({ title: title.trim(), description: description.trim(), date, time });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить задачу");
    }
  }

  return (
    <Modal title={task ? "Редактировать задачу" : "Новая задача"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-stack">
          <div className="field">
            <label htmlFor="task-title">Название</label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Что нужно сделать?"
              maxLength={160}
              required
              autoFocus
            />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="task-time">Время</label>
              <input
                id="task-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="task-date">Дата</label>
              <input id="task-date" type="date" value={date} disabled />
            </div>
          </div>
          <div className="field">
            <label htmlFor="task-description">Описание <span className="optional">— необязательно</span></label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Добавьте детали, ссылки или заметки"
              maxLength={5000}
            />
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <div className="modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Отмена</Button>
          <Button type="submit" loading={saving}>{task ? "Сохранить" : "Добавить задачу"}</Button>
        </div>
      </form>
    </Modal>
  );
}

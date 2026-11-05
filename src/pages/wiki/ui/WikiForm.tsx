import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { Modal } from "@/shared/ui/Modal";
import type { WikiEntry, WikiEntryInput } from "../api/wiki-api";

type WikiFormProps = {
  entry?: WikiEntry;
  saving: boolean;
  onSave: (input: WikiEntryInput) => Promise<void>;
  onClose: () => void;
};

export function WikiForm({ entry, saving, onSave, onClose }: WikiFormProps) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [category, setCategory] = useState(entry?.category ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [password, setPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        title: title.trim(),
        category: category.trim() || "Общее",
        content: content.trim(),
        password,
        clearPassword,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить запись");
    }
  }

  return (
    <Modal title={entry ? "Редактировать запись" : "Новая запись"} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="form-stack">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="wiki-title">Название</label>
              <input id="wiki-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, рабочая почта" maxLength={160} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="wiki-category">Категория</label>
              <input id="wiki-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Общее" maxLength={60} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="wiki-content">Текст записи <span className="optional">— необязательно</span></label>
            <textarea className="wiki-content-input" id="wiki-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Инструкция, ссылка, заметка или любая полезная информация" maxLength={20000} />
          </div>
          <div className="field">
            <label htmlFor="wiki-password">Пароль <span className="optional">— необязательно</span></label>
            <div className="password-input">
              <Icon name="lock" size={17} />
              <input id="wiki-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={entry?.hasPassword ? "Оставьте пустым, чтобы не менять" : "Добавить секрет"} maxLength={1000} autoComplete="new-password" disabled={clearPassword} />
              <Button variant="ghost" size="icon" aria-label={showPassword ? "Скрыть вводимый пароль" : "Показать вводимый пароль"} icon={<Icon name={showPassword ? "eye-off" : "eye"} size={17} />} onClick={() => setShowPassword((value) => !value)} disabled={clearPassword} />
            </div>
            <span className="field__hint">Пароль шифруется перед сохранением и не попадает в общий список записей.</span>
            {entry?.hasPassword && (
              <label className="clear-password">
                <input type="checkbox" checked={clearPassword} onChange={(event) => setClearPassword(event.target.checked)} />
                Удалить сохранённый пароль
              </label>
            )}
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <div className="modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Отмена</Button>
          <Button type="submit" loading={saving}>{entry ? "Сохранить" : "Создать запись"}</Button>
        </div>
      </form>
    </Modal>
  );
}

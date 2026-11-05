import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { Modal } from "@/shared/ui/Modal";
import type { PasswordEntry, PasswordEntryInput } from "../api/passwords-api";

type PasswordFormProps = {
  entry?: PasswordEntry;
  saving: boolean;
  onSave: (input: PasswordEntryInput) => Promise<void>;
  onClose: () => void;
};

export function PasswordForm({ entry, saving, onSave, onClose }: PasswordFormProps) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [login, setLogin] = useState(entry?.login ?? "");
  const [url, setUrl] = useState(entry?.url ?? "");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        title: title.trim(),
        login: login.trim(),
        url: url.trim(),
        notes: notes.trim(),
        password: password || undefined,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить пароль");
    }
  }

  return (
    <Modal title={entry ? "Редактировать доступ" : "Новый доступ"} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="form-stack">
          <div className="field">
            <label htmlFor="password-title">Название</label>
            <input id="password-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, рабочая почта" maxLength={160} required autoFocus />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="password-login">Логин <span className="optional">— необязательно</span></label>
              <input id="password-login" value={login} onChange={(event) => setLogin(event.target.value)} placeholder="name@example.com" maxLength={320} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="password-url">Ссылка <span className="optional">— необязательно</span></label>
              <input id="password-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="example.com" maxLength={2000} autoComplete="off" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password-value">Пароль</label>
            <div className="password-input">
              <Icon name="lock" size={17} />
              <input id="password-value" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={entry ? "Оставьте пустым, чтобы не менять" : "Введите пароль"} maxLength={1000} autoComplete="new-password" required={!entry} />
              <Button variant="ghost" size="icon" aria-label={showPassword ? "Скрыть вводимый пароль" : "Показать вводимый пароль"} icon={<Icon name={showPassword ? "eye-off" : "eye"} size={17} />} onClick={() => setShowPassword((value) => !value)} />
            </div>
            <span className="field__hint">Пароль шифруется перед сохранением и не попадает в общий список доступов.</span>
          </div>
          <div className="field">
            <label htmlFor="password-notes">Заметка <span className="optional">— необязательно</span></label>
            <textarea id="password-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Дополнительная информация о доступе" maxLength={5000} />
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <div className="modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Отмена</Button>
          <Button type="submit" loading={saving}>{entry ? "Сохранить" : "Добавить доступ"}</Button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { PasswordEntry } from "../api/passwords-api";

type PasswordCardProps = {
  entry: PasswordEntry;
  password?: string;
  onReveal: () => Promise<string>;
  onHide: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function PasswordCard({ entry, password, onReveal, onHide, onEdit, onDelete }: PasswordCardProps) {
  const [revealing, setRevealing] = useState(false);
  const [copiedField, setCopiedField] = useState<"login" | "password" | null>(null);
  const [error, setError] = useState("");

  async function handleReveal() {
    setRevealing(true);
    setError("");
    try {
      await onReveal();
    } catch (revealError) {
      setError(revealError instanceof Error ? revealError.message : "Не удалось показать пароль");
    } finally {
      setRevealing(false);
    }
  }

  async function copyValue(value: string, field: "login" | "password") {
    setError("");
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1600);
    } catch {
      setError("Не удалось скопировать значение");
    }
  }

  async function handleCopyPassword() {
    try {
      const value = password ?? await onReveal();
      await copyValue(value, "password");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Не удалось скопировать пароль");
    }
  }

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(entry.updatedAt));

  return (
    <article className="password-card">
      <header className="password-card__header">
        <span className="password-card__icon"><Icon name="lock" size={20} /></span>
        <h2>{entry.title}</h2>
        <div className="password-card__actions">
          <Button variant="ghost" size="icon" aria-label={`Редактировать доступ «${entry.title}»`} icon={<Icon name="edit" size={16} />} onClick={onEdit} />
          <Button className="delete-action" variant="ghost" size="icon" aria-label={`Удалить доступ «${entry.title}»`} icon={<Icon name="trash" size={16} />} onClick={onDelete} />
        </div>
      </header>

      <div className="password-card__details">
        {entry.login && (
          <div className="password-detail">
            <span>Логин</span>
            <strong>{entry.login}</strong>
            <Button variant="ghost" size="icon" aria-label={`Скопировать логин «${entry.title}»`} icon={<Icon name={copiedField === "login" ? "check" : "copy"} size={16} />} onClick={() => void copyValue(entry.login, "login")} />
          </div>
        )}
        {entry.url && (
          <div className="password-detail">
            <span>Ссылка</span>
            <a href={entry.url} target="_blank" rel="noreferrer">{new URL(entry.url).hostname}</a>
          </div>
        )}
        <div className="password-secret">
          <span className={`password-secret__value ${password ? "password-secret__value--visible" : ""}`}>{password ?? "••••••••••••"}</span>
          <div>
            <Button variant="ghost" size="icon" loading={revealing} aria-label={password ? `Скрыть пароль «${entry.title}»` : `Показать пароль «${entry.title}»`} icon={<Icon name={password ? "eye-off" : "eye"} size={17} />} onClick={() => password ? onHide() : void handleReveal()} />
            <Button variant="ghost" size="icon" aria-label={`Скопировать пароль «${entry.title}»`} icon={<Icon name={copiedField === "password" ? "check" : "copy"} size={17} />} onClick={() => void handleCopyPassword()} />
          </div>
        </div>
      </div>

      {entry.notes && <p className="password-card__notes">{entry.notes}</p>}
      {error && <p className="password-card__error" role="alert">{error}</p>}
      <footer className="password-card__footer">
        <span>{copiedField ? "Скопировано" : `Обновлено ${formattedDate}`}</span>
      </footer>
    </article>
  );
}

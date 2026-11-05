import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { WikiEntry } from "../api/wiki-api";

type WikiCardProps = {
  entry: WikiEntry;
  password?: string;
  onReveal: () => Promise<string>;
  onHide: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function WikiCard({ entry, password, onReveal, onHide, onEdit, onDelete }: WikiCardProps) {
  const [revealing, setRevealing] = useState(false);
  const [copied, setCopied] = useState(false);
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

  async function handleCopy() {
    setError("");
    try {
      const value = password ?? await onReveal();
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Не удалось скопировать пароль");
    }
  }

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(entry.updatedAt));

  return (
    <article className="wiki-card">
      <header className="wiki-card__header">
        <span className="wiki-card__icon"><Icon name={entry.hasPassword ? "lock" : "note"} size={20} /></span>
        <div className="wiki-card__heading">
          <span className="wiki-card__category">{entry.category}</span>
          <h2>{entry.title}</h2>
        </div>
        <div className="wiki-card__actions">
          <Button variant="ghost" size="icon" aria-label={`Редактировать «${entry.title}»`} icon={<Icon name="edit" size={16} />} onClick={onEdit} />
          <Button className="delete-action" variant="ghost" size="icon" aria-label={`Удалить «${entry.title}»`} icon={<Icon name="trash" size={16} />} onClick={onDelete} />
        </div>
      </header>

      {entry.content && <p className="wiki-card__content">{entry.content}</p>}

      {entry.hasPassword && (
        <div className="wiki-secret">
          <div className="wiki-secret__row">
            <span className={`wiki-secret__value ${password ? "wiki-secret__value--visible" : ""}`}>
              {password ?? "••••••••••••"}
            </span>
            <div>
              <Button variant="ghost" size="icon" loading={revealing} aria-label={password ? `Скрыть пароль «${entry.title}»` : `Показать пароль «${entry.title}»`} icon={<Icon name={password ? "eye-off" : "eye"} size={17} />} onClick={() => password ? onHide() : void handleReveal()} />
              <Button variant="ghost" size="icon" aria-label={`Скопировать пароль «${entry.title}»`} icon={<Icon name={copied ? "check" : "copy"} size={17} />} onClick={() => void handleCopy()} />
            </div>
          </div>
          {copied && <span className="wiki-secret__copied">Скопировано</span>}
        </div>
      )}
      {error && <p className="wiki-card__error" role="alert">{error}</p>}
      <footer className="wiki-card__footer">Обновлено {formattedDate}</footer>
    </article>
  );
}

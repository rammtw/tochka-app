import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import type { WikiEntry, WikiEntryInput } from "../api/wiki-api";
import { MarkdownView } from "./MarkdownView";

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
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        title: title.trim(),
        category: category.trim() || "Общее",
        content: content.trim(),
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить запись");
    }
  }

  return (
    <Modal title={entry ? "Редактировать документ" : "Новый документ"} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="form-stack">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="wiki-title">Название</label>
              <input id="wiki-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, регламент проекта" maxLength={160} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="wiki-category">Категория</label>
              <input id="wiki-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Общее" maxLength={60} />
            </div>
          </div>
          <div className="field">
            <div className="markdown-editor__header">
              <label htmlFor="wiki-content">Содержимое <span className="optional">— Markdown</span></label>
              <div className="markdown-editor__tabs" aria-label="Режим редактора">
                <button type="button" className={mode === "edit" ? "markdown-editor__tab markdown-editor__tab--active" : "markdown-editor__tab"} onClick={() => setMode("edit")} aria-pressed={mode === "edit"}>Текст</button>
                <button type="button" className={mode === "preview" ? "markdown-editor__tab markdown-editor__tab--active" : "markdown-editor__tab"} onClick={() => setMode("preview")} aria-pressed={mode === "preview"}>Предпросмотр</button>
              </div>
            </div>
            {mode === "edit" ? (
              <textarea className="wiki-content-input" id="wiki-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder={"# Заголовок\n\nТекст документа, списки, ссылки и код..."} maxLength={20000} />
            ) : (
              <div className="markdown-editor__preview">
                {content ? <MarkdownView content={content} /> : <span className="markdown-editor__placeholder">Начните писать, чтобы увидеть результат.</span>}
              </div>
            )}
            <span className="field__hint">Поддерживаются заголовки, списки, ссылки, код, цитаты, таблицы и списки задач.</span>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <div className="modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Отмена</Button>
          <Button type="submit" loading={saving}>{entry ? "Сохранить" : "Создать документ"}</Button>
        </div>
      </form>
    </Modal>
  );
}

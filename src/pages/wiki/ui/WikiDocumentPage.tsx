import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Icon } from "@/shared/ui/Icon";
import type { WikiEntryInput } from "../api/wiki-api";
import { useWikiEntry } from "../model/use-wiki-entry";
import { MarkdownView } from "./MarkdownView";
import { WikiForm } from "./WikiForm";
import "./wiki-page.css";

export function WikiDocumentPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const { entry, isLoading, error, setError, editEntry, removeEntry, retry } = useWikiEntry(id);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(input: WikiEntryInput) {
    setSaving(true);
    try {
      await editEntry(input);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await removeEntry();
      navigate("/wiki");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить документ");
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  const formattedDate = entry ? new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(entry.updatedAt)) : "";

  return (
    <div className="page wiki-document-page">
      <nav className="document-breadcrumbs" aria-label="Хлебные крошки">
        <Link to="/wiki"><Icon name="chevron-left" size={15} /> База знаний</Link>
        {entry && <><span>/</span><span>{entry.category}</span></>}
      </nav>

      {error && (
        <div className="error-banner" role="alert">
          <Icon name="alert" size={18} /><span>{error}</span>
          <Button variant="ghost" size="small" onClick={retry}>Повторить</Button>
        </div>
      )}

      {isLoading ? (
        <div className="document-loading">
          <div className="skeleton document-title-skeleton" />
          <div className="skeleton document-body-skeleton" />
        </div>
      ) : entry ? (
        <>
          <header className="document-header">
            <div>
              <span className="page-eyebrow">{entry.category}</span>
              <h1>{entry.title}</h1>
              <p>Обновлено {formattedDate}</p>
            </div>
            <div className="document-header__actions">
              <Button variant="secondary" icon={<Icon name="edit" size={17} />} onClick={() => setEditing(true)}>Редактировать</Button>
              <Button className="delete-action" variant="ghost" size="icon" aria-label={`Удалить документ «${entry.title}»`} icon={<Icon name="trash" size={18} />} onClick={() => setConfirmingDelete(true)} />
            </div>
          </header>
          <article className="document-paper">
            {entry.content ? <MarkdownView content={entry.content} /> : (
              <div className="document-empty">
                <Icon name="note" size={28} />
                <p>В документе пока нет текста.</p>
                <Button variant="secondary" onClick={() => setEditing(true)}>Добавить содержимое</Button>
              </div>
            )}
          </article>
        </>
      ) : !error ? (
        <div className="wiki-empty"><div className="empty-state"><h3>Документ не найден</h3><Link className="button button--secondary button--medium" to="/wiki">Вернуться к списку</Link></div></div>
      ) : null}

      {editing && entry && (
        <WikiForm entry={entry} saving={saving} onSave={handleSave} onClose={() => !saving && setEditing(false)} />
      )}
      {confirmingDelete && entry && (
        <ConfirmDialog title="Удалить документ?" description={`Документ «${entry.title}» будет удалён без возможности восстановления.`} loading={deleting} onConfirm={() => void handleDelete()} onClose={() => !deleting && setConfirmingDelete(false)} />
      )}
    </div>
  );
}

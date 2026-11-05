import { useDeferredValue, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Icon } from "@/shared/ui/Icon";
import type { PasswordEntry, PasswordEntryInput } from "../api/passwords-api";
import { usePasswords } from "../model/use-passwords";
import { PasswordCard } from "./PasswordCard";
import { PasswordForm } from "./PasswordForm";
import "./passwords-page.css";

export function PasswordsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("ru"));
  const [formEntry, setFormEntry] = useState<PasswordEntry | "new" | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<PasswordEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    entries,
    passwords,
    isLoading,
    error,
    setError,
    addEntry,
    editEntry,
    reveal,
    hide,
    removeEntry,
    retry,
  } = usePasswords();

  const filteredEntries = entries.filter((entry) =>
    !deferredSearch || `${entry.title} ${entry.login} ${entry.url} ${entry.notes}`.toLocaleLowerCase("ru").includes(deferredSearch),
  );
  const visibleCount = Object.keys(passwords).length;

  async function handleSave(input: PasswordEntryInput) {
    setSaving(true);
    try {
      if (formEntry === "new") await addEntry(input);
      else if (formEntry) await editEntry(formEntry.id, input);
      setFormEntry(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingEntry) return;
    setDeleting(true);
    setError("");
    try {
      await removeEntry(deletingEntry.id);
      setDeletingEntry(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить доступ");
      setDeletingEntry(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page passwords-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">Хранилище паролей</span>
          <h1>Доступы под защитой</h1>
          <p>Логины и пароли отделены от заметок и скрыты по умолчанию.</p>
        </div>
        <Button icon={<Icon name="plus" size={18} />} onClick={() => setFormEntry("new")}>Новый доступ</Button>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <Icon name="alert" size={18} /><span>{error}</span>
          <Button variant="ghost" size="small" onClick={retry}>Повторить</Button>
        </div>
      )}

      <section className="passwords-security" aria-label="Безопасность хранилища">
        <span className="passwords-security__icon"><Icon name="lock" size={22} /></span>
        <div>
          <strong>Шифрование AES-256-GCM</strong>
          <span>Значения паролей запрашиваются только при показе или копировании</span>
        </div>
        <div className="passwords-security__stats">
          <span><strong>{entries.length}</strong> доступов</span>
          <span><strong>{visibleCount}</strong> открыто</span>
        </div>
      </section>

      <div className="passwords-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти доступ..." aria-label="Поиск по доступам" />
        </label>
      </div>

      {isLoading ? (
        <div className="password-grid">{[1, 2, 3].map((item) => <div className="skeleton password-skeleton" key={item} />)}</div>
      ) : filteredEntries.length ? (
        <section className="password-grid" aria-label="Сохранённые доступы">
          {filteredEntries.map((entry) => (
            <PasswordCard
              key={entry.id}
              entry={entry}
              password={passwords[entry.id]}
              onReveal={() => reveal(entry.id)}
              onHide={() => hide(entry.id)}
              onEdit={() => setFormEntry(entry)}
              onDelete={() => setDeletingEntry(entry)}
            />
          ))}
        </section>
      ) : entries.length ? (
        <div className="passwords-empty">
          <div className="empty-state">
            <span className="empty-state__icon"><Icon name="search" size={27} /></span>
            <h3>Доступ не найден</h3>
            <p>Попробуйте изменить поисковый запрос.</p>
            <Button variant="secondary" onClick={() => setSearch("")}>Сбросить поиск</Button>
          </div>
        </div>
      ) : (
        <div className="passwords-empty">
          <div className="empty-state">
            <span className="empty-state__icon"><Icon name="lock" size={28} /></span>
            <h3>Добавьте первый доступ</h3>
            <p>Сохраните название сервиса, логин и пароль. Секрет будет зашифрован и скрыт до явного показа.</p>
            <Button variant="secondary" icon={<Icon name="plus" size={17} />} onClick={() => setFormEntry("new")}>Добавить доступ</Button>
          </div>
        </div>
      )}

      {formEntry && (
        <PasswordForm entry={formEntry === "new" ? undefined : formEntry} saving={saving} onSave={handleSave} onClose={() => !saving && setFormEntry(null)} />
      )}
      {deletingEntry && (
        <ConfirmDialog title="Удалить доступ?" description={`Доступ «${deletingEntry.title}» и его пароль будут удалены без возможности восстановления.`} loading={deleting} onConfirm={() => void handleDelete()} onClose={() => !deleting && setDeletingEntry(null)} />
      )}
    </div>
  );
}

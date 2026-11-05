import { useDeferredValue, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Icon } from "@/shared/ui/Icon";
import type { WikiEntry, WikiEntryInput } from "../api/wiki-api";
import { useWiki } from "../model/use-wiki";
import { WikiCard } from "./WikiCard";
import { WikiForm } from "./WikiForm";
import "./wiki-page.css";

export function WikiPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("ru"));
  const [category, setCategory] = useState("all");
  const [formEntry, setFormEntry] = useState<WikiEntry | "new" | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WikiEntry | null>(null);
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
    revealPassword,
    hidePassword,
    removeEntry,
    retry,
  } = useWiki();

  const categories = [...new Set(entries.map((entry) => entry.category))].sort((a, b) => a.localeCompare(b, "ru"));
  const filteredEntries = entries.filter((entry) =>
    (category === "all" || entry.category === category) &&
    (!deferredSearch || `${entry.title} ${entry.category} ${entry.content}`.toLocaleLowerCase("ru").includes(deferredSearch)),
  );
  const passwordCount = entries.filter((entry) => entry.hasPassword).length;

  async function handleSave(input: WikiEntryInput) {
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
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить запись");
      setDeletingEntry(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page wiki-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">Личная база знаний</span>
          <h1>Всё важное — под рукой</h1>
          <p>Заметки, инструкции и доступы в одном спокойном месте.</p>
        </div>
        <Button icon={<Icon name="plus" size={18} />} onClick={() => setFormEntry("new")}>Новая запись</Button>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <Icon name="alert" size={18} /><span>{error}</span>
          <Button variant="ghost" size="small" onClick={retry}>Повторить</Button>
        </div>
      )}

      <section className="wiki-summary" aria-label="Сводка базы знаний">
        <div><strong>{entries.length}</strong><span>{entries.length === 1 ? "запись" : "записей"}</span></div>
        <div><strong>{categories.length}</strong><span>категорий</span></div>
        <div><strong>{passwordCount}</strong><span>с паролем</span></div>
        <p><Icon name="lock" size={16} /> Пароли зашифрованы и скрыты по умолчанию</p>
      </section>

      <div className="wiki-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти запись..." aria-label="Поиск по записям" />
        </label>
        <div className="category-tabs" aria-label="Категории">
          <button className={category === "all" ? "category-tab category-tab--active" : "category-tab"} onClick={() => setCategory("all")}>Все</button>
          {categories.map((item) => <button key={item} className={category === item ? "category-tab category-tab--active" : "category-tab"} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>

      {isLoading ? (
        <div className="wiki-grid">{[1, 2, 3].map((item) => <div className="skeleton wiki-skeleton" key={item} />)}</div>
      ) : filteredEntries.length ? (
        <section className="wiki-grid" aria-label="Записи базы знаний">
          {filteredEntries.map((entry) => (
            <WikiCard
              key={entry.id}
              entry={entry}
              password={passwords[entry.id]}
              onReveal={() => revealPassword(entry.id)}
              onHide={() => hidePassword(entry.id)}
              onEdit={() => setFormEntry(entry)}
              onDelete={() => setDeletingEntry(entry)}
            />
          ))}
        </section>
      ) : entries.length ? (
        <div className="wiki-empty">
          <div className="empty-state">
            <span className="empty-state__icon"><Icon name="search" size={27} /></span>
            <h3>Ничего не найдено</h3>
            <p>Измените запрос или выберите другую категорию.</p>
            <Button variant="secondary" onClick={() => { setSearch(""); setCategory("all"); }}>Сбросить фильтры</Button>
          </div>
        </div>
      ) : (
        <div className="wiki-empty">
          <div className="empty-state">
            <span className="empty-state__icon"><Icon name="book" size={28} /></span>
            <h3>Начните свою базу знаний</h3>
            <p>Сохраните полезную заметку, инструкцию или доступ. Пароль всегда будет скрыт, пока вы не решите его показать.</p>
            <Button variant="secondary" icon={<Icon name="plus" size={17} />} onClick={() => setFormEntry("new")}>Создать первую запись</Button>
          </div>
        </div>
      )}

      {formEntry && (
        <WikiForm entry={formEntry === "new" ? undefined : formEntry} saving={saving} onSave={handleSave} onClose={() => !saving && setFormEntry(null)} />
      )}
      {deletingEntry && (
        <ConfirmDialog title="Удалить запись?" description={`Запись «${deletingEntry.title}» и её сохранённый пароль будут удалены без возможности восстановления.`} loading={deleting} onConfirm={() => void handleDelete()} onClose={() => !deleting && setDeletingEntry(null)} />
      )}
    </div>
  );
}

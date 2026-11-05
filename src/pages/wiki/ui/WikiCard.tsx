import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { WikiEntry } from "../api/wiki-api";
import { MarkdownView } from "./MarkdownView";

type WikiCardProps = {
  entry: WikiEntry;
  onEdit: () => void;
  onDelete: () => void;
};

export function WikiCard({ entry, onEdit, onDelete }: WikiCardProps) {
  const navigate = useNavigate();
  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(entry.updatedAt));

  function openDocument() {
    navigate(`/wiki/${entry.id}`);
  }

  return (
    <article
      className="wiki-card"
      role="link"
      tabIndex={0}
      aria-label={`Открыть документ «${entry.title}»`}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a, button, input")) return;
        openDocument();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDocument();
        }
      }}
    >
      <header className="wiki-card__header">
        <span className="wiki-card__icon"><Icon name="note" size={20} /></span>
        <div className="wiki-card__heading">
          <span className="wiki-card__category">{entry.category}</span>
          <h2><Link to={`/wiki/${entry.id}`}>{entry.title}</Link></h2>
        </div>
        <div className="wiki-card__actions">
          <Button variant="ghost" size="icon" aria-label={`Редактировать «${entry.title}»`} icon={<Icon name="edit" size={16} />} onClick={onEdit} />
          <Button className="delete-action" variant="ghost" size="icon" aria-label={`Удалить «${entry.title}»`} icon={<Icon name="trash" size={16} />} onClick={onDelete} />
        </div>
      </header>

      {entry.content && <MarkdownView className="wiki-card__content" content={entry.content} />}
      <footer className="wiki-card__footer">
        <span>Обновлено {formattedDate}</span>
        <Link to={`/wiki/${entry.id}`}>Открыть <Icon name="chevron-right" size={13} /></Link>
      </footer>
    </article>
  );
}

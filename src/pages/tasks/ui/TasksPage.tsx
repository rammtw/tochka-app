import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Icon } from "@/shared/ui/Icon";
import type { Task, TaskInput } from "../api/tasks-api";
import { formatDateTitle, getTodayISO, isToday, shiftDate } from "../model/task-date";
import { useTasks } from "../model/use-tasks";
import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";
import "./tasks-page.css";

type TaskFilter = "all" | "active" | "done";

export function TasksPage() {
  const [date, setDate] = useState(getTodayISO);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [formTask, setFormTask] = useState<Task | null | "new">(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { tasks, isLoading, error, addTask, editTask, toggleTask, removeTask, retry } = useTasks(date);

  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const filteredTasks = tasks.filter((task) =>
    filter === "all" || (filter === "done" ? task.completed : !task.completed),
  );

  async function handleSave(input: TaskInput) {
    setSaving(true);
    try {
      if (formTask === "new") await addTask(input);
      else if (formTask) await editTask(formTask.id, input);
      setFormTask(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await removeTask(deletingTask.id);
      setDeletingTask(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page tasks-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">{isToday(date) ? "Мой день · сегодня" : "План на день"}</span>
          <h1>{formatDateTitle(date)}</h1>
          <p>Небольшие шаги складываются в большие результаты.</p>
        </div>
        <Button icon={<Icon name="plus" size={18} />} onClick={() => setFormTask("new")}>
          Новая задача
        </Button>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
          <Button variant="ghost" size="small" onClick={retry}>Повторить</Button>
        </div>
      )}

      <section className="day-overview" aria-label="Обзор дня">
        <div className="date-navigation">
          <Button variant="ghost" size="icon" aria-label="Предыдущий день" icon={<Icon name="chevron-left" />} onClick={() => setDate(shiftDate(date, -1))} />
          <label className="date-picker">
            <Icon name="calendar" size={19} />
            <input type="date" value={date} onChange={(event) => event.target.value && setDate(event.target.value)} aria-label="Выбрать дату" />
          </label>
          <Button variant="ghost" size="icon" aria-label="Следующий день" icon={<Icon name="chevron-right" />} onClick={() => setDate(shiftDate(date, 1))} />
          {!isToday(date) && <Button variant="secondary" size="small" onClick={() => setDate(getTodayISO())}>Сегодня</Button>}
        </div>
        <div className="day-progress">
          <div className="day-progress__labels">
            <span>Дневной прогресс</span>
            <strong>{completedCount} из {tasks.length}</strong>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Выполнено задач">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="day-progress__hint">{progress === 100 && tasks.length ? "Все задачи выполнены. Отличная работа!" : `${progress}% дня завершено`}</span>
        </div>
      </section>

      <section className="tasks-section" aria-labelledby="tasks-heading">
        <div className="section-toolbar">
          <div>
            <h2 id="tasks-heading">Задачи</h2>
            <span className="section-count">{tasks.length}</span>
          </div>
          <div className="filter-tabs" aria-label="Фильтр задач">
            {([
              ["all", "Все", tasks.length],
              ["active", "В работе", tasks.length - completedCount],
              ["done", "Готово", completedCount],
            ] as const).map(([value, label, count]) => (
              <button key={value} className={filter === value ? "filter-tab filter-tab--active" : "filter-tab"} onClick={() => setFilter(value)} aria-pressed={filter === value}>
                {label}<span>{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="task-list">
          {isLoading ? (
            [1, 2, 3].map((item) => <div className="skeleton task-skeleton" key={item} />)
          ) : filteredTasks.length ? (
            filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={(item) => void toggleTask(item)} onEdit={setFormTask} onDelete={setDeletingTask} />
            ))
          ) : tasks.length ? (
            <div className="empty-state">
              <span className="empty-state__icon"><Icon name="check" size={27} /></span>
              <h3>В этом списке пусто</h3>
              <p>Выберите другой фильтр, чтобы увидеть задачи.</p>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon"><Icon name="tasks" size={28} /></span>
              <h3>День открыт для планов</h3>
              <p>Добавьте первую задачу — с названием, временем и важными деталями.</p>
              <Button variant="secondary" icon={<Icon name="plus" size={17} />} onClick={() => setFormTask("new")}>Добавить задачу</Button>
            </div>
          )}
        </div>
      </section>

      {formTask && (
        <TaskForm
          date={formTask === "new" ? date : formTask.date}
          task={formTask === "new" ? undefined : formTask}
          saving={saving}
          onSave={handleSave}
          onClose={() => !saving && setFormTask(null)}
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          title="Удалить задачу?"
          description={`Задача «${deletingTask.title}» будет удалена без возможности восстановления.`}
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onClose={() => !deleting && setDeletingTask(null)}
        />
      )}
    </div>
  );
}

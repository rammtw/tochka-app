import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { Task } from "../api/tasks-api";

type TaskItemProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  return (
    <article className={`task-item ${task.completed ? "task-item--completed" : ""}`}>
      <label className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          aria-label={`Отметить задачу «${task.title}» ${task.completed ? "невыполненной" : "выполненной"}`}
        />
        <span className="task-checkbox__control"><Icon name="check" size={15} /></span>
      </label>
      <div className="task-item__time">
        <Icon name="clock" size={15} />
        <span>{task.time}</span>
      </div>
      <div className="task-item__body">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
      </div>
      <div className="task-item__actions">
        <Button variant="ghost" size="icon" aria-label={`Редактировать «${task.title}»`} icon={<Icon name="edit" size={17} />} onClick={() => onEdit(task)} />
        <Button className="delete-action" variant="ghost" size="icon" aria-label={`Удалить «${task.title}»`} icon={<Icon name="trash" size={17} />} onClick={() => onDelete(task)} />
      </div>
    </article>
  );
}

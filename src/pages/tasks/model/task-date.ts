export function getTodayISO() {
  return toLocalISO(new Date());
}

function toLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

export function formatDateTitle(value: string) {
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T12:00:00`));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function isToday(value: string) {
  return value === getTodayISO();
}

export type IconName =
  | "plus"
  | "calendar"
  | "chevron-left"
  | "chevron-right"
  | "check"
  | "clock"
  | "edit"
  | "trash"
  | "book"
  | "tasks"
  | "search"
  | "eye"
  | "eye-off"
  | "copy"
  | "close"
  | "note"
  | "lock"
  | "alert";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 20, className = "" }: IconProps) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "plus" && <><path d="M12 5v14M5 12h14" /></>}
      {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>}
      {name === "chevron-left" && <path d="m15 18-6-6 6-6" />}
      {name === "chevron-right" && <path d="m9 18 6-6-6-6" />}
      {name === "check" && <path d="m5 12 4 4L19 6" />}
      {name === "clock" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
      {name === "edit" && <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>}
      {name === "trash" && <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></>}
      {name === "book" && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z" /><path d="M4 5.5v14M8 7h8M8 11h6" /></>}
      {name === "tasks" && <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m8 12 3 3 5-6" /></>}
      {name === "search" && <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>}
      {name === "eye" && <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12" /><circle cx="12" cy="12" r="3" /></>}
      {name === "eye-off" && <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2 3.2M6.6 6.6C3.5 8.6 2 12 2 12s3.5 8 10 8a10 10 0 0 0 4.1-.9" /></>}
      {name === "copy" && <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>}
      {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
      {name === "note" && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>}
      {name === "lock" && <><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>}
      {name === "alert" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></>}
    </svg>
  );
}

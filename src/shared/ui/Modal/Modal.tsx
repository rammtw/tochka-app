import { useEffect, useId } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
};

export function Modal({ title, children, onClose, wide = false }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal__header">
          <h2 id={titleId}>{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Закрыть"
            icon={<Icon name="close" />}
            onClick={onClose}
          />
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

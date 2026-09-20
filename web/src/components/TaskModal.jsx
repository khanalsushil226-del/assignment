import { useEffect } from "react";

export default function TaskModal({
  open,
  onClose,
  title,
  label = "ASSIGNMENT DETAILS",
  description,
  due,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="task-modal show" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          {"\u00D7"}
        </button>

        <span className="form-label">{label}</span>
        <h2>{title}</h2>
        <p>{description}</p>

        {due !== undefined && (
          <div className="modal-due">
            <strong>Deadline:</strong>
            <span>{due}</span>
          </div>
        )}

        {children}

        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
}
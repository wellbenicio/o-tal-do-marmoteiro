"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function Modal({
  title,
  children,
  onClose,
}: Readonly<{
  title: string;
  children: ReactNode;
  onClose: () => void;
}>) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const dismissOnBackdrop = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (
        e.clientX < box.left ||
        e.clientX > box.right ||
        e.clientY < box.top ||
        e.clientY > box.bottom
      )
        onClose();
    };
    dialog.addEventListener("click", dismissOnBackdrop);
    return () => dialog.removeEventListener("click", dismissOnBackdrop);
  }, [onClose]);
  return (
    <dialog
      className="portal-modal"
      ref={ref}
      aria-label={title}
      onCancel={onClose}
    >
      <div className="portal-modal-heading">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Fechar janela">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

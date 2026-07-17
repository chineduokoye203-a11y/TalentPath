import React, { useEffect } from "react";
import styles from "./Modal.module.css";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  inline,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  inline?: boolean;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
      <div className={`${styles.overlay} ${inline ? styles.inline : ""}`} onClick={onClose}>
        <div className={`${styles.dialog} ${styles[size]}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

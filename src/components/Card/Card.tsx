import React from "react";
import styles from "./Card.module.css";

export function Card({
  children,
  title,
  className = "",
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

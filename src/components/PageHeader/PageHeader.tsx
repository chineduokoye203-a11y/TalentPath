import React from "react";
import styles from "./PageHeader.module.css";

export function PageHeader({
  title,
  description,
  action,
  topLeft,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  topLeft?: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      {topLeft && (
        <div className={styles.topRow}>
          <div className={styles.topLeft}>{topLeft}</div>
        </div>
      )}
      <div className={styles.bottomRow}>
        <div className={styles.leftContent}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}

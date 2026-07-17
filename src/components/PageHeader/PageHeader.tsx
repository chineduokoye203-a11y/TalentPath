import React from "react";
import styles from "./PageHeader.module.css";
import { Bell } from "lucide-react";
import { UserMenu } from "@/components/UserMenu/UserMenu";

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
      <div className={`${styles.topRow} ${topLeft ? styles.withLeft : ""}`}>
        {topLeft ? <div className={styles.topLeft}>{topLeft}</div> : <div />}
        <div className={styles.topRightControls}>
          <button className={styles.iconButton}>
            <span className={styles.bellWrapper}>
              <Bell size={20} />
              <span className={styles.notificationDot} />
            </span>
          </button>
          <UserMenu />
        </div>
      </div>
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

import React from "react";
import styles from "./Badge.module.css";

export function Badge({
  children,
  variant = "neutral",
  className = "",
  style,
}: {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "primary";
  className?: string;
  style?: React.CSSProperties;
}) {
  return <span className={`${styles.badge} ${styles[variant]} ${className}`} style={style}>{children}</span>;
}

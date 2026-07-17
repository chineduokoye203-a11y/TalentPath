import React from "react";
import styles from "./Skeleton.module.css";

export function Skeleton({
  variant = "line",
  className = "",
}: {
  variant?: "line" | "title" | "avatar" | "card";
  className?: string;
}) {
  return <div className={`${styles.skeleton} ${styles[variant]} ${className}`} />;
}

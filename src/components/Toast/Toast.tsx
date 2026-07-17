import React, { useEffect, useState } from "react";
import styles from "./Toast.module.css";

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 5000,
}: {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose}>
        &times;
      </button>
    </div>
  );
}

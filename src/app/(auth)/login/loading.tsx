import React from "react";
import styles from "./login.module.css";

export default function LoginLoading() {
  return (
    <div className={styles.container}>
      <div
        style={{
          height: "40px",
          width: "70%",
          backgroundColor: "var(--color-surface-variant)",
          animation: "pulse 1.5s infinite",
        }}
      />
      <div
        style={{
          height: "24px",
          width: "90%",
          backgroundColor: "var(--color-surface-variant)",
          animation: "pulse 1.5s infinite",
          marginBottom: "24px",
        }}
      />
      <div
        style={{
          height: "300px",
          width: "100%",
          backgroundColor: "var(--color-surface-variant)",
          animation: "pulse 1.5s infinite",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}

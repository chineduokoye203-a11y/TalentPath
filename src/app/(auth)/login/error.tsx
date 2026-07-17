"use client";

import React from "react";
import { Button } from "@/components/Button/Button";
import styles from "./login.module.css";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.container} style={{ textAlign: "center" }}>
      <h2 className={styles.title} style={{ color: "var(--color-error)" }}>
        Something went wrong!
      </h2>
      <p className={styles.subtitle}>
        {error.message || "An unexpected error occurred during authentication."}
      </p>
      <Button onClick={() => reset()} variant="secondary">
        Try again
      </Button>
    </div>
  );
}

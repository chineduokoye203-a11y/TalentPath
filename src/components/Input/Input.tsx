import React from "react";
import styles from "./Input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
  labelRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, id, suffix, labelRight, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className={styles.container}>
        {label && (
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor={inputId}>{label.endsWith(" *") ? <>{label.slice(0, -2)} <span className={styles.requiredMarker}>*</span></> : label}</label>
            {labelRight && <span className={styles.labelRight}>{labelRight}</span>}
          </div>
        )}
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            className={`${styles.input} ${suffix ? styles.hasSuffix : ""} ${error ? styles.hasError : ""} ${className}`}
            aria-invalid={!!error}
            {...props}
          />
          {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>
        {error && <span className={styles.error}>{error}</span>}
        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

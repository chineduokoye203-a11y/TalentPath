import React from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, ...props }, ref) => {
    return (
      <label className={`${styles.container} ${className}`}>
        <input ref={ref} type="checkbox" className={styles.input} {...props} />
        <span className={styles.label}>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

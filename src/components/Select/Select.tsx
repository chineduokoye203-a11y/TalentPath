import React from "react";
import styles from "../Input/Input.module.css";
import selectStyles from "./Select.module.css";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, options, id, placeholder = "Select an option", ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className={styles.container}>
        {label && <label className={styles.label} htmlFor={selectId}>{label.endsWith(" *") ? <>{label.slice(0, -2)} <span className={styles.requiredMarker}>*</span></> : label}</label>}
        <div className={selectStyles.wrapper}>
          <select
            ref={ref}
            id={selectId}
            className={`${styles.input} ${error ? styles.hasError : ""} ${className}`}
            aria-invalid={!!error}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg className={selectStyles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);
Select.displayName = "Select";

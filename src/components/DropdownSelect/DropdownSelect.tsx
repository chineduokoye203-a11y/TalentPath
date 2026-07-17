"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./DropdownSelect.module.css";

interface DropdownSelectProps {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function DropdownSelect({ label, options, value, onChange, required = true, error }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={styles.container} ref={ref}>
      <label className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""} ${error ? styles.hasError : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? styles.triggerText : styles.placeholder}>
          {selected?.label || "Select an option"}
        </span>
        <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d={isOpen ? "M3 8L6 5L9 8" : "M3 5L6 8L9 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {error && <span className={styles.error}>{error}</span>}
      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.item} ${opt.value === value ? styles.selected : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./learning.module.css";

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const resultsRef = useRef<HTMLElement | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getResults = () => {
    if (!resultsRef.current) {
      resultsRef.current = document.querySelector("[data-search-results]");
    }
    return resultsRef.current;
  };

  const clearResults = () => {
    setValue("");
    const results = getResults();
    if (results) results.style.display = "none";
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(clearResults, 60000);
  };

  useEffect(() => {
    if (value.trim().length > 0) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    const results = getResults();
    if (results) {
      if (newValue.trim().length > 0) {
        results.style.display = "none";
      } else {
        results.style.display = "";
      }
    }

    if (newValue.trim().length > 0) {
      resetInactivityTimer();
    } else if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  };

  return (
    <input
      type="text"
      name="q"
      value={value}
      onChange={handleChange}
      placeholder="Search for courses on Udemy Business..."
      className={styles.searchInput}
    />
  );
}

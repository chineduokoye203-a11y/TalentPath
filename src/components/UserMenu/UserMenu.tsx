"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import styles from "./UserMenu.module.css";

export function UserMenu() {
  const { data: session } = useSession();
  const [showLogout, setShowLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLogout(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = (session?.user as any)?.role || "";
  const name = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "User";
  const initial = name.charAt(0).toUpperCase();
  const roleDisplayNames: Record<string, string> = {
    EMPLOYEE: "Employee",
    MANAGER: "Line Manager",
    HR: "HR Admin",
    LEADERSHIP: "Leadership",
    ADMINISTRATOR: "Administrator",
  };
  const displayRole = roleDisplayNames[role] || role;

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <div className={styles.profile} onClick={() => setShowLogout((prev) => !prev)}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.info}>
          <span className={styles.title}>{name}</span>
          <span className={styles.subtitle}>{displayRole}</span>
        </div>
      </div>

      {showLogout && (
        <div className={styles.dropdown}>
          <button className={styles.logoutItem} onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className={`${styles.container} ${(session?.user as any)?.role === "HR" ? styles.sidebarHr : ""}`}>
      {/* Mobile overlay */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ""} ${(session?.user as any)?.role === "HR" ? styles.sidebarHr : ""}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

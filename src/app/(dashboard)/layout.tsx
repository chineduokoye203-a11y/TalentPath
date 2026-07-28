"use client";

import React, { Suspense, useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { Menu, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/UserMenu/UserMenu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className={`${styles.container} ${(session?.user as any)?.role === "HR" ? styles.sidebarHr : ""}`}>
      {/* Mobile overlay */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ""} ${(session?.user as any)?.role === "HR" ? styles.sidebarHr : ""}`}>
        <Suspense fallback={<div className={styles.sidebarFallback} />}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </Suspense>
      </div>

      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className={styles.headerControls}>
            <button className={styles.bellButton}>
              <span className={styles.bellWrapper}>
                <Bell size={20} />
                <span className={styles.notificationDot} />
              </span>
            </button>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

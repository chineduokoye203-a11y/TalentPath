"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import styles from "./NotificationDropdown.module.css";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) setNotifications(json.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // silent
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={handleToggle}>
        <span className={styles.bellWrapper}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button className={styles.markAllButton} onClick={markAllAsRead}>
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 && (
              <div className={styles.empty}>No notifications yet</div>
            )}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${notification.read ? styles.read : styles.unread}`}
                onClick={() => { if (!notification.read) markAsRead(notification.id); }}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    {!notification.read && <span className={styles.unreadDot} />}
                    {notification.title}
                  </div>
                  <div className={styles.notificationMessage}>{notification.message}</div>
                  <div className={styles.notificationTime}>{formatTime(notification.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

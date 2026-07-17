"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./Sidebar.module.css";
import { Path } from "@phosphor-icons/react";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Target,
  Users,
  Map,
  Settings,
  Boxes,
  UserPlus,
  Route,
} from "lucide-react";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["EMPLOYEE", "MANAGER", "HR", "LEADERSHIP", "ADMINISTRATOR"],
    },
    { href: "/admin/invitations", label: "Invitations", icon: UserPlus, roles: ["HR", "ADMINISTRATOR"] },
    {
      href: "/learning",
      label: "Learning",
      icon: BookOpen,
      roles: ["EMPLOYEE", "MANAGER", "HR", "LEADERSHIP", "ADMINISTRATOR"],
    },
    {
      href: "/skills",
      label: "My Skills",
      icon: Target,
      roles: ["EMPLOYEE", "MANAGER", "HR", "LEADERSHIP", "ADMINISTRATOR"],
    },
    {
      href: "/workforce",
      label: "Workforce",
      icon: Boxes,
      roles: ["HR", "LEADERSHIP", "ADMINISTRATOR"],
    },
    { href: "/team", label: "My Team", icon: Users, roles: ["MANAGER", "HR", "LEADERSHIP"] },
    { href: "/admin/career-paths", label: "Career Paths", icon: Route, roles: ["HR", "ADMINISTRATOR"] },
    {
      href: "/career",
      label: "Career Explorer",
      icon: Map,
      roles: ["EMPLOYEE", "MANAGER", "HR", "LEADERSHIP", "ADMINISTRATOR"],
    },
    { href: "/admin/opportunities", label: "Job Opportunities", icon: Compass, roles: ["HR", "ADMINISTRATOR"] },
    { href: "/opportunities", label: "Job Opportunities", icon: Compass, roles: ["EMPLOYEE", "MANAGER", "LEADERSHIP"] },
    { href: "/admin/users", label: "Admin Settings", icon: Settings, roles: ["ADMINISTRATOR"] },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Path size={20} weight="fill" />
          </div>
          <span className={styles.logoText}>TalentPath</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => {
          if (role && !link.roles.includes(role)) return null;

          const isActive = link.href === "/dashboard"
            ? pathname === "/dashboard" && !searchParams.has("invite")
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navItem} ${styles.hoverHr} ${isActive ? styles.activeHr : ""}`}
              onClick={onClose}
            >
              <link.icon size={20} className={styles.icon} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}

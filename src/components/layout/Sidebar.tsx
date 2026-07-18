"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Sidebar.module.css";

const ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  articles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  categories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 13.41 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <circle cx="7" cy="7" r="1"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
};

const BASE_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: ICONS.dashboard, minRoleLevel: 0 },
  { href: "/articles", label: "Articoli", icon: ICONS.articles, minRoleLevel: 0 },
  // Stessa soglia di requireOperator() lato server: sola lettura sotto OPERATOR
  // non dà accesso a creazione/modifica categorie, quindi non ha senso linkarla.
  { href: "/categories", label: "Categorie", icon: ICONS.categories, minRoleLevel: 5 },
];

const ADMIN_ITEMS = [
  { href: "/admin/users", label: "Utenti", icon: ICONS.users },
];

interface SidebarProps {
  orgName: string;
  roleLevel: number;
  roleCode: string;
}

export default function Sidebar({ orgName, roleLevel, roleCode }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = roleCode === "ADMIN";
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function navLink(item: { href: string; label: string; icon: React.ReactNode }) {
    const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
    return (
      <Link key={item.href} href={item.href} className={`${styles.navItem} ${active ? styles.active : ""}`}>
        <span className={styles.navIcon}>{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>
          </svg>
        </div>
        <span className={styles.brandName}>QuickStore</span>
      </div>

      <nav className={styles.nav}>
        {BASE_ITEMS.filter(item => roleLevel >= item.minRoleLevel).map(navLink)}

        {admin && (
          <>
            <div className={styles.navDivider}>
              <span>Configurazione</span>
            </div>
            {ADMIN_ITEMS.map(navLink)}
          </>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <span className={styles.orgName}>{orgName}</span>
          <span className={styles.userRole}>{admin ? "Admin" : roleLevel >= 5 ? "Operatore" : "Guest"}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} disabled={loggingOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {loggingOut ? "Uscita…" : "Esci"}
        </button>
      </div>
    </aside>
  );
}

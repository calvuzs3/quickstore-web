import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAuth verifica il cookie di sessione firmato HMAC; redirect a /login se non valido
  const { orgName, roleCode, roleLevel } = await requireAuth();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <header style={{
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontWeight: 700 }}>QuickStore</span>
          <Link href="/articles" style={{ fontSize: 13 }}>Articoli</Link>
          {roleLevel >= 5 && (
            <Link href="/categories" style={{ fontSize: 13 }}>Categorie</Link>
          )}
          {roleCode === "ADMIN" && (
            <Link href="/admin/users" style={{ fontSize: 13 }}>Admin</Link>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{orgName}</span>
          <LogoutButton />
        </div>
      </header>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}

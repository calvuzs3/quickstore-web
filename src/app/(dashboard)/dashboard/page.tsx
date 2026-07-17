import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const { orgName, roleCode } = await requireAuth();

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Benvenuto</h1>
      <p style={{ fontSize: 14, marginBottom: 4 }}>
        Organizzazione: <strong>{orgName}</strong>
      </p>
      <p style={{ fontSize: 14, marginBottom: 16, color: "var(--color-text-muted)" }}>
        Ruolo: {roleCode}
      </p>
      <p style={{ fontSize: 13 }}>
        <Link href="/articles">Vai all&apos;elenco articoli →</Link>
      </p>
    </div>
  );
}

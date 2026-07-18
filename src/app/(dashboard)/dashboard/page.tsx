import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getArticles, getArticleCategories, getMemberships } from "@/lib/api";

// Stessa MAX_PAGE_SIZE del server (ArticleServerRepository.kt): il conteggio "sotto
// soglia" guarda al massimo i primi 200 articoli dell'org, non l'intero catalogo se
// più grande — accettabile alla scala attuale di un singolo magazzino.
const STOCK_SAMPLE_SIZE = 200;

function StatCard({
  label, value, href, warn = false,
}: {
  label: string; value: number; href: string; warn?: boolean;
}) {
  // Regola d'inchiostro di QuickStore (globals.css): un solo accento, arancio pieno
  // solo per segnalare uno stato di attenzione (qui: articoli sotto soglia) — non un
  // colore diverso per ogni card come in quickreport-web.
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={
          warn
            ? { background: "var(--color-primary)", color: "var(--color-on-primary-button)", cursor: "pointer" }
            : { cursor: "pointer" }
        }
      >
        <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 13, marginTop: 4, opacity: warn ? 0.9 : 1, color: warn ? undefined : "var(--color-text-muted)" }}>
          {label}
        </div>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const { orgName, roleLevel, roleCode } = await requireAuth();
  const canWrite = roleLevel >= 5;
  const admin = roleCode === "ADMIN";

  const [articlesResult, categoriesResult, membershipsResult] = await Promise.allSettled([
    getArticles({ limit: STOCK_SAMPLE_SIZE }),
    getArticleCategories(),
    admin ? getMemberships() : Promise.resolve(null),
  ]);

  const articlesData = articlesResult.status === "fulfilled" ? articlesResult.value : null;
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const memberships = membershipsResult.status === "fulfilled" ? membershipsResult.value : null;

  const totalArticles = articlesData?.total ?? 0;
  const belowThreshold = articlesData?.items.filter(a => a.totalQuantity <= a.reorderLevel).length ?? 0;

  const hasError = articlesResult.status === "rejected" || categoriesResult.status === "rejected";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Organizzazione: {orgName}</p>
        </div>
      </div>

      {hasError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          Alcuni dati non sono stati caricati correttamente. Riprova più tardi.
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16, marginBottom: 32,
      }}>
        <StatCard label="Articoli" value={totalArticles} href="/articles" />
        {canWrite && <StatCard label="Categorie" value={categories.length} href="/categories" />}
        <StatCard label="Sotto soglia di riordino" value={belowThreshold} href="/articles" warn={belowThreshold > 0} />
        {admin && memberships && (
          <StatCard label="Utenti" value={memberships.length} href="/admin/users" />
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Azioni rapide</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {canWrite && <Link href="/articles/new" className="btn btn-primary btn-sm">+ Nuovo articolo</Link>}
          {canWrite && <Link href="/categories" className="btn btn-secondary btn-sm">+ Nuova categoria</Link>}
          {admin && <Link href="/admin/users" className="btn btn-secondary btn-sm">+ Nuovo utente</Link>}
          {!canWrite && !admin && <Link href="/articles" className="btn btn-secondary btn-sm">Vai all&apos;elenco articoli</Link>}
        </div>
      </div>
    </div>
  );
}

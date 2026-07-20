import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getArticles, getLocations } from "@/lib/api";
import type { Location } from "@/types";
import LocationFilterSelect from "./LocationFilterSelect";

const PAGE_SIZE = 50;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; locationId?: string }>;
}) {
  const session = await requireAuth();
  const canWrite = session.roleLevel >= 5;

  const { search, page: pageParam, locationId } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let data: { items: Awaited<ReturnType<typeof getArticles>>["items"]; total: number } = {
    items: [],
    total: 0,
  };
  let error: string | null = null;

  try {
    data = await getArticles({ search, locationId, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento dati";
  }

  // Il selettore magazzino resta usabile anche se questa fetch fallisce (es. server
  // giù per un attimo) — semplicemente non mostra opzioni, non blocca la pagina.
  let locations: Location[] = [];
  try {
    locations = await getLocations();
  } catch {
    // silenzioso: non è il dato principale della pagina
  }

  const extraParams = { ...(search ? { search } : {}), ...(locationId ? { locationId } : {}) };
  const extraQuery = new URLSearchParams(extraParams).toString();
  // Passato a /articles/new e /articles/{id}/edit così, tornando alla lista dopo il
  // salvataggio, si riatterra sullo stesso filtro invece che su "Tutti i magazzini".
  const newArticleHref = extraQuery ? `/articles/new?${extraQuery}` : "/articles/new";

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Articoli</h1>
          <p className="page-subtitle">{data.total} articoli</p>
        </div>
        {canWrite && (
          <Link href={newArticleHref} className="btn btn-primary">+ Nuovo articolo</Link>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <form method="GET" style={{ flex: 1, minWidth: 200 }}>
          {/* Preserva il filtro magazzino quando si cerca per nome/codice */}
          {locationId && <input type="hidden" name="locationId" value={locationId} />}
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Cerca per nome o codice..."
            className="form-input"
          />
        </form>

        <div style={{ minWidth: 180, flexShrink: 0 }}>
          <LocationFilterSelect locations={locations} selectedLocationId={locationId} />
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Cod. OEM</th>
              <th>Cod. ERP</th>
              <th>Giacenza</th>
              {canWrite && <th></th>}
            </tr>
          </thead>
          <tbody>
            {data.items.map((article) => {
              const belowThreshold = article.totalQuantity <= article.reorderLevel;
              return (
                <tr key={article.id}>
                  <td>{article.name}</td>
                  <td>{article.categoryName}</td>
                  <td>{article.codeOem || "—"}</td>
                  <td>{article.codeErp || "—"}</td>
                  <td>
                    <span className={`badge ${belowThreshold ? "badge-warning" : "badge-neutral"}`}>
                      {article.totalQuantity} {article.unitOfMeasure}
                    </span>
                  </td>
                  {canWrite && (
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={extraQuery ? `/articles/${article.id}/edit?${extraQuery}` : `/articles/${article.id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        Modifica
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
            {data.items.length === 0 && !error && (
              <tr>
                <td colSpan={canWrite ? 6 : 5} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                  Nessun articolo trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {page > 1 && (
            <a
              className="btn btn-secondary"
              href={`/articles?${new URLSearchParams({ ...extraParams, page: String(page - 1) })}`}
            >
              Precedente
            </a>
          )}
          <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-text-muted)" }}>
            Pagina {page} di {totalPages}
          </span>
          {page < totalPages && (
            <a
              className="btn btn-secondary"
              href={`/articles?${new URLSearchParams({ ...extraParams, page: String(page + 1) })}`}
            >
              Successivo
            </a>
          )}
        </div>
      )}
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { getArticles } from "@/lib/api";

const PAGE_SIZE = 50;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await requireAuth();

  const { search, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let data: { items: Awaited<ReturnType<typeof getArticles>>["items"]; total: number } = {
    items: [],
    total: 0,
  };
  let error: string | null = null;

  try {
    data = await getArticles({ search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento dati";
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Articoli</h1>
          <p className="page-subtitle">{data.total} articoli</p>
        </div>
      </div>

      <form method="GET" style={{ marginBottom: 16 }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cerca per nome o codice..."
          className="form-input"
        />
      </form>

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
                </tr>
              );
            })}
            {data.items.length === 0 && !error && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
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
              href={`/articles?${new URLSearchParams({ ...(search ? { search } : {}), page: String(page - 1) })}`}
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
              href={`/articles?${new URLSearchParams({ ...(search ? { search } : {}), page: String(page + 1) })}`}
            >
              Successivo
            </a>
          )}
        </div>
      )}
    </div>
  );
}

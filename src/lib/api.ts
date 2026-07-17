import { getSessionToken } from "@/lib/auth";
import { KTOR_URL } from "@/lib/config";
import type { ArticleListResponse } from "@/types";

export interface GetArticlesParams {
  search?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

// Chiamato solo da Server Component (mai dal browser) — nessuna route /api/articles
// di proxy: a differenza delle mutazioni, una GET di sola lettura non ha bisogno di
// un client-side fetch, il Server Component la fa direttamente qui.
export async function getArticles(params: GetArticlesParams = {}): Promise<ArticleListResponse> {
  const token = await getSessionToken();
  if (!token) throw new Error("Non autenticato");

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  query.set("limit", String(params.limit ?? 50));
  query.set("offset", String(params.offset ?? 0));

  let res: Response;
  try {
    res = await fetch(`${KTOR_URL}/articles?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (err) {
    throw new Error(
      `Impossibile raggiungere il server Ktor (${KTOR_URL}). Verificare che il server sia attivo.`,
      { cause: err }
    );
  }

  if (!res.ok) {
    throw new Error(`Errore caricamento articoli (HTTP ${res.status})`);
  }

  return res.json();
}

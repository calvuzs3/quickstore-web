import { getSessionToken } from "@/lib/auth";
import { KTOR_URL } from "@/lib/config";
import type { ArticleCategory, ArticleListResponse, ArticleSummary, Location, Membership } from "@/types";

export interface GetArticlesParams {
  search?: string;
  categoryId?: string;
  locationId?: string;
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
  if (params.locationId) query.set("locationId", params.locationId);
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

// Sola lettura, stesso pattern di getArticles — serve alla pagina di modifica per
// precaricare i valori attuali (GET /articles non supporta lookup per singolo id).
export async function getArticle(id: string): Promise<ArticleSummary> {
  const token = await getSessionToken();
  if (!token) throw new Error("Non autenticato");

  let res: Response;
  try {
    res = await fetch(`${KTOR_URL}/articles/${id}`, {
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
    throw new Error(`Errore caricamento articolo (HTTP ${res.status})`);
  }

  return res.json();
}

// Sola lettura — popola il <select> categoria nel form di creazione/modifica articolo.
export async function getArticleCategories(): Promise<ArticleCategory[]> {
  const token = await getSessionToken();
  if (!token) throw new Error("Non autenticato");

  let res: Response;
  try {
    res = await fetch(`${KTOR_URL}/article-categories`, {
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
    throw new Error(`Errore caricamento categorie (HTTP ${res.status})`);
  }

  return res.json();
}

// Sola lettura — popola il selettore "Magazzino: tutti / <ubicazione>" davanti alla
// lista articoli (stesso ruolo di GetLocationsUseCase su Android). Nessuna route di
// creazione/modifica: le ubicazioni restano scrivibili solo via /sync/push da Android.
export async function getLocations(): Promise<Location[]> {
  const token = await getSessionToken();
  if (!token) throw new Error("Non autenticato");

  let res: Response;
  try {
    res = await fetch(`${KTOR_URL}/locations`, {
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
    throw new Error(`Errore caricamento magazzini (HTTP ${res.status})`);
  }

  return res.json();
}

// Sola lettura, stesso pattern di getArticles — nessun ruolo minimo lato server
// (GET /memberships richiede solo autenticazione), ma la pagina che la usa è
// comunque dietro requireAdmin() (vedi admin/users/page.tsx).
export async function getMemberships(): Promise<Membership[]> {
  const token = await getSessionToken();
  if (!token) throw new Error("Non autenticato");

  let res: Response;
  try {
    res = await fetch(`${KTOR_URL}/memberships`, {
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
    throw new Error(`Errore caricamento utenti (HTTP ${res.status})`);
  }

  return res.json();
}

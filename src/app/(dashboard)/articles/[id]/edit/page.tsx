import Link from "next/link";
import { requireOperator } from "@/lib/auth";
import { getArticle, getArticleCategories } from "@/lib/api";
import ArticleForm from "../../ArticleForm";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; locationId?: string }>;
}) {
  await requireOperator();
  const { id } = await params;

  // Ricostruisce il filtro (ricerca/magazzino) attivo nella lista da cui si è arrivati
  // qui, per tornarci esattamente dov'era — vedi ArticleForm.articlesHref.
  const { search, locationId } = await searchParams;
  const query = new URLSearchParams({ ...(search ? { search } : {}), ...(locationId ? { locationId } : {}) }).toString();
  const articlesHref = query ? `/articles?${query}` : "/articles";

  let categories: Awaited<ReturnType<typeof getArticleCategories>> = [];
  let article: Awaited<ReturnType<typeof getArticle>> | null = null;
  let error: string | null = null;
  try {
    [categories, article] = await Promise.all([getArticleCategories(), getArticle(id)]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento articolo";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={articlesHref} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Articoli</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica articolo</h1>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {article && <ArticleForm categories={categories} article={article} articlesHref={articlesHref} />}
    </div>
  );
}

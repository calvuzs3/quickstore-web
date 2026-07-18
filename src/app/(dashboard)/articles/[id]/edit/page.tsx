import Link from "next/link";
import { requireOperator } from "@/lib/auth";
import { getArticle, getArticleCategories } from "@/lib/api";
import ArticleForm from "../../ArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;

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
          <Link href="/articles" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Articoli</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Modifica articolo</h1>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {article && <ArticleForm categories={categories} article={article} />}
    </div>
  );
}

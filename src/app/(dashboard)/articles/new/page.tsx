import Link from "next/link";
import { requireOperator } from "@/lib/auth";
import { getArticleCategories } from "@/lib/api";
import ArticleForm from "../ArticleForm";

export default async function NewArticlePage() {
  await requireOperator();

  let categories: Awaited<ReturnType<typeof getArticleCategories>> = [];
  let error: string | null = null;
  try {
    categories = await getArticleCategories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento categorie";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/articles" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Articoli</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Nuovo articolo</h1>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <ArticleForm categories={categories} />
    </div>
  );
}

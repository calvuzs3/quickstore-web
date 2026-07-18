import { requireOperator } from "@/lib/auth";
import { getArticleCategories } from "@/lib/api";
import AddCategoryForm from "./AddCategoryForm";
import CategoryRow from "./CategoryRow";

export default async function CategoriesPage() {
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
          <h1 className="page-title">Categorie</h1>
          <p className="page-subtitle">{categories.length} categorie</p>
        </div>
      </div>

      <AddCategoryForm />

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrizione</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <CategoryRow key={category.id} category={category} />
            ))}
            {categories.length === 0 && !error && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                  Nessuna categoria trovata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleCategory, ArticleSummary } from "@/types";
import { readErrorMessage } from "@/lib/clientErrors";

interface ArticleFormProps {
  categories: ArticleCategory[];
  article?: ArticleSummary; // presente solo in modalità modifica
}

export default function ArticleForm({ categories, article }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = article !== undefined;

  const [name, setName] = useState(article?.name ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? categories[0]?.id ?? "");
  const [unitOfMeasure, setUnitOfMeasure] = useState(article?.unitOfMeasure ?? "");
  const [reorderLevel, setReorderLevel] = useState(String(article?.reorderLevel ?? 0));
  const [codeOem, setCodeOem] = useState(article?.codeOem ?? "");
  const [codeErp, setCodeErp] = useState(article?.codeErp ?? "");
  const [codeBm, setCodeBm] = useState(article?.codeBm ?? "");
  const [notes, setNotes] = useState(article?.notes ?? "");
  const [description, setDescription] = useState(article?.description ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const reorderLevelNumber = Number(reorderLevel);
    if (!name.trim()) {
      setError("Il nome è obbligatorio.");
      return;
    }
    if (!unitOfMeasure.trim()) {
      setError("L'unità di misura è obbligatoria.");
      return;
    }
    if (!categoryId) {
      setError("Seleziona una categoria.");
      return;
    }
    if (Number.isNaN(reorderLevelNumber) || reorderLevelNumber < 0) {
      setError("La soglia di riordino non può essere negativa.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        categoryId,
        unitOfMeasure: unitOfMeasure.trim(),
        reorderLevel: reorderLevelNumber,
        notes: notes.trim(),
        codeOem: codeOem.trim(),
        codeErp: codeErp.trim(),
        codeBm: codeBm.trim(),
      };

      const res = await fetch(isEditing ? `/api/articles/${article.id}` : "/api/articles", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      router.push("/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio articolo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560 }}>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Nome *</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Categoria *</label>
        <select
          className="form-select"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
        >
          {categories.length === 0 && <option value="">Nessuna categoria disponibile</option>}
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Unità di misura *</label>
          <input
            type="text"
            className="form-input"
            value={unitOfMeasure}
            onChange={e => setUnitOfMeasure(e.target.value)}
            placeholder="pz, kg, l..."
            required
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Soglia di riordino</label>
          <input
            type="number"
            className="form-input"
            value={reorderLevel}
            onChange={e => setReorderLevel(e.target.value)}
            min={0}
            step="any"
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Codice OEM</label>
          <input type="text" className="form-input" value={codeOem} onChange={e => setCodeOem(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Codice ERP</label>
          <input type="text" className="form-input" value={codeErp} onChange={e => setCodeErp(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Codice BM</label>
          <input type="text" className="form-input" value={codeBm} onChange={e => setCodeBm(e.target.value)} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Descrizione</label>
        <textarea
          className="form-input"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Note</label>
        <textarea
          className="form-input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "…" : isEditing ? "Salva modifiche" : "Crea articolo"}
      </button>
    </form>
  );
}

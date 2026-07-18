"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleCategory } from "@/types";
import { readErrorMessage } from "@/lib/clientErrors";

export default function CategoryRow({ category }: { category: ArticleCategory }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [notes, setNotes] = useState(category.notes);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Il nome è obbligatorio.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/article-categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), notes: notes.trim() }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Eliminare la categoria "${category.name}"?`)) return;
    setError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/article-categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore rimozione");
      setRemoving(false);
    }
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={4}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap", padding: "8px 0" }}>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome"
              disabled={saving}
              style={{ flex: 1, minWidth: 140 }}
            />
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrizione"
              disabled={saving}
              style={{ flex: 2, minWidth: 180 }}
            />
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Note"
              disabled={saving}
              style={{ flex: 2, minWidth: 180 }}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? "…" : "Salva"}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setEditing(false);
                setName(category.name);
                setDescription(category.description);
                setNotes(category.notes);
                setError(null);
              }}
              disabled={saving}
            >
              Annulla
            </button>
          </div>
          {error && <div style={{ color: "var(--color-danger)", fontSize: 12 }}>{error}</div>}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{category.name}</td>
      <td>{category.description || "—"}</td>
      <td>{category.notes || "—"}</td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            Modifica
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleRemove} disabled={removing}>
            {removing ? "…" : "Elimina"}
          </button>
        </div>
        {error && <div style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{error}</div>}
      </td>
    </tr>
  );
}

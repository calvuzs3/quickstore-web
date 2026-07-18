"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/clientErrors";

export default function AddCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Il nome è obbligatorio.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/article-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      setName("");
      setDescription("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione categoria");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
          <label className="form-label">Descrizione</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
          <label className="form-label">Note</label>
          <input
            type="text"
            className="form-input"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "…" : "Crea categoria"}
        </button>
      </div>
    </form>
  );
}

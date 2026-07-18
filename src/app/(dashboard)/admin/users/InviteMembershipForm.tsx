"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MEMBERSHIP_ROLES } from "@/types";
import { readErrorMessage } from "@/lib/clientErrors";

export default function InviteMembershipForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [roleLevel, setRoleLevel] = useState(MEMBERSHIP_ROLES[1].level); // OPERATOR di default
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), roleLevel }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore invito");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="utente@esempio.com"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Ruolo</label>
          <select
            className="form-select"
            value={roleLevel}
            onChange={e => setRoleLevel(Number(e.target.value))}
          >
            {MEMBERSHIP_ROLES.map(role => (
              <option key={role.level} value={role.level}>{role.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "…" : "Invita"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
        L&apos;email deve corrispondere a un account già esistente — non crea un nuovo utente.
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MEMBERSHIP_ROLES } from "@/types";
import { readErrorMessage } from "@/lib/clientErrors";

export default function AddMembershipForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [roleLevel, setRoleLevel] = useState(MEMBERSHIP_ROLES[1].level); // OPERATOR di default
  const [isNewUser, setIsNewUser] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isNewUser && password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }

    setSaving(true);
    try {
      if (isNewUser) {
        const createRes = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (!createRes.ok) {
          throw new Error(await readErrorMessage(createRes));
        }
      }

      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), roleLevel }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      setEmail("");
      setPassword("");
      setIsNewUser(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore aggiunta utente");
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
          {saving ? "…" : "Aggiungi utente"}
        </button>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 12 }}>
        <input
          type="checkbox"
          checked={isNewUser}
          onChange={e => setIsNewUser(e.target.checked)}
        />
        Nuovo utente (crea account — l&apos;email non ha ancora un account)
      </label>

      {isNewUser && (
        <div className="form-group" style={{ marginTop: 8, maxWidth: 280 }}>
          <label className="form-label">Password iniziale</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Almeno 8 caratteri"
            required={isNewUser}
          />
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
        Senza la spunta, l&apos;email deve corrispondere a un account già esistente.
      </p>
    </form>
  );
}

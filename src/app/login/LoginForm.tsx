"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrganizationSummary } from "@/types";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se il login torna più organizzazioni, restiamo su questa schermata mostrando
  // la scelta invece di reindirizzare — stesso flusso a due passi di AuthApi.kt
  // lato Android (LoginResult.OrganizationSelectionRequired).
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Credenziali non valide");
        return;
      }

      if (data.orgChoice) {
        setPendingToken(data.pendingToken);
        setOrganizations(data.organizations);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectOrg(orgId: string) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/select-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, orgId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Selezione organizzazione non riuscita");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }

  if (pendingToken) {
    return (
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Scegli organizzazione</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {organizations.map((org) => (
            <button
              key={org.id}
              className="btn btn-secondary"
              disabled={loading}
              onClick={() => handleSelectOrg(org.id)}
              style={{ textAlign: "left" }}
            >
              {org.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Accedi</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? "Accesso in corso…" : "Accedi"}
        </button>
      </form>
    </div>
  );
}
